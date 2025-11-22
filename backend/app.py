from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import io
import base64
from pathlib import Path

# 모델 로드
from models.unet_model import load_model, predict, get_device

app = FastAPI(
    title="Drone Segmentation API",
    description="U-Net 기반 드론 부품 세그멘테이션 API",
    version="1.0.0"
)

# CORS 설정 (Streamlit과 통신용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발용, 나중에 제한할 수 있음
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서버 시작 시 모델 로드
@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모델 로드"""
    model_path = Path(__file__).parent.parent / "models" / "final_model.pth"
    
    if not model_path.exists():
        print(f"⚠️  Warning: Model file not found at {model_path}")
        print("   Please place 'best_model_v2.pth' in the 'models/' folder")
    else:
        try:
            load_model(str(model_path))
            print("🚀 Model loaded successfully!")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            
    

@app.get("/")
def read_root():
    """API 상태 확인"""
    return {
        "status": "running",
        "message": "Drone Segmentation API is ready! 🚁",
        "version": "1.0.0"
    }

@app.get("/model/info")
def get_model_info():
    """모델 정보 및 성능 지표 반환 (history2.json에서 동적으로 로드)"""
    import json
    from pathlib import Path

    # history2.json 읽기
    history_path = Path(__file__).parent.parent / "history2.json"

    if not history_path.exists():
        raise HTTPException(status_code=404, detail="history2.json file not found")

    with open(history_path, 'r') as f:
        history = json.load(f)

    # Best epoch 찾기 (mIoU 기준)
    best_epoch_idx = history["mIoU"].index(max(history["mIoU"]))
    best_epoch = history["epoch"][best_epoch_idx]

    # Best epoch 데이터 가져오기
    best_metrics = {
        "mIoU": history["mIoU"][best_epoch_idx],
        "mDice": history["mDice"][best_epoch_idx],
        "pixel_accuracy": history["PixelAcc"][best_epoch_idx],
        "fwIoU": history["FWIoU"][best_epoch_idx]
    }

    # 총 학습 에포크 수
    epochs_trained = len(history["epoch"])

    # 데이터셋 크기 계산
    data_path = Path(__file__).parent.parent / "data" / "raw" / "images"
    dataset_size = None
    if data_path.exists():
        dataset_size = len([f for f in data_path.iterdir() if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png']])

    # Confusion Matrix로부터 Precision, Recall, F1 Score 계산
    confusion_matrix = [
        [7835581, 109926, 93018, 21341, 138912, 184642],
        [29732, 397202, 53706, 686, 23535, 51199],
        [32760, 55595, 457663, 13916, 23528, 11981],
        [12734, 1396, 12780, 93852, 11837, 17],
        [26980, 13147, 13344, 5089, 174093, 4845],
        [49155, 28713, 12264, 238, 11579, 478774]
    ]

    num_classes = len(confusion_matrix)
    precision_per_class = []
    recall_per_class = []
    f1_per_class = []

    for i in range(num_classes):
        # TP: 대각선 원소
        tp = confusion_matrix[i][i]

        # FP: i번째 열의 합 - TP (다른 클래스를 i로 잘못 예측)
        fp = sum(confusion_matrix[j][i] for j in range(num_classes)) - tp

        # FN: i번째 행의 합 - TP (i를 다른 클래스로 잘못 예측)
        fn = sum(confusion_matrix[i][j] for j in range(num_classes)) - tp

        # Precision = TP / (TP + FP)
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        precision_per_class.append(precision)

        # Recall = TP / (TP + FN)
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        recall_per_class.append(recall)

        # F1 Score = 2 * (Precision * Recall) / (Precision + Recall)
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        f1_per_class.append(f1)

    # Macro-average (모든 클래스 평균)
    macro_precision = sum(precision_per_class) / num_classes
    macro_recall = sum(recall_per_class) / num_classes
    macro_f1 = sum(f1_per_class) / num_classes

    # Drone parts only (배경 제외) - 클래스 1~5
    drone_precision = sum(precision_per_class[1:]) / (num_classes - 1)
    drone_recall = sum(recall_per_class[1:]) / (num_classes - 1)
    drone_f1 = sum(f1_per_class[1:]) / (num_classes - 1)

    return {
        "model_architecture": {
            "name": "U-Net",
            "encoder": "VGG16-BN",
            "encoder_weights": "ImageNet",
            "input_size": [512, 512, 3],
            "output_classes": 6,
            "parameters": {
                "total": "23.7M",
                "trainable": "23.7M"
            }
        },
        "training_info": {
            "epochs_trained": epochs_trained,
            "best_epoch": best_epoch,
            "early_stopping": False,
            "optimizer": "Adam",
            "initial_lr": 0.0005,
            "lr_scheduler": "CosineAnnealingWarmRestarts",
            "loss_function": "Dice Loss + Cross Entropy",
            "dataset_size": dataset_size
        },
        "performance_metrics": {
            "all_classes": {
                "mIoU": best_metrics["mIoU"],
                "mDice": best_metrics["mDice"],
                "pixel_accuracy": best_metrics["pixel_accuracy"],
                "fwIoU": best_metrics["fwIoU"],
                "precision": macro_precision,
                "recall": macro_recall,
                "f1_score": macro_f1
            },
            "drone_only": {
                "mIoU": 0.5039,
                "mDice": 0.6769,
                "precision": drone_precision,
                "recall": drone_recall,
                "f1_score": drone_f1,
                "note": "Excluding background class"
            },
            "iou_per_class": {
                "background": 0.9181,
                "arm": 0.5193,
                "body": 0.5863,
                "camera": 0.5397,
                "landing_gear": 0.3896,
                "propeller": 0.5745
            },
            "dice_per_class": {
                "background": 0.9573,
                "arm": 0.6836,
                "body": 0.7392,
                "camera": 0.7011,
                "landing_gear": 0.5607,
                "propeller": 0.7297
            }
        },
        "confusion_matrix": [
            [7835581, 109926, 93018, 21341, 138912, 184642],
            [29732, 397202, 53706, 686, 23535, 51199],
            [32760, 55595, 457663, 13916, 23528, 11981],
            [12734, 1396, 12780, 93852, 11837, 17],
            [26980, 13147, 13344, 5089, 174093, 4845],
            [49155, 28713, 12264, 238, 11579, 478774]
        ],
        "deployment_info": {
            "framework": "PyTorch",
            "version": "2.0+",
            "model_version": "v1.0.0",
            "last_updated": "2025-01-08",
            "device": str(get_device())
        },
        "benchmark_comparison": {
            "our_model": {
                "mIoU": best_metrics["mIoU"],
                "inference_time_ms": 147,
                "parameters_m": 23.7
            },
            "deeplabv3plus": {
                "mIoU": 0.5650,
                "inference_time_ms": 203,
                "parameters_m": 41.2
            },
            "pspnet": {
                "mIoU": 0.5520,
                "inference_time_ms": 189,
                "parameters_m": 46.7
            },
            "fcn": {
                "mIoU": 0.5100,
                "inference_time_ms": 156,
                "parameters_m": 32.1
            }
        }
    }

@app.get("/model/history")
def get_training_history():
    """학습 히스토리 반환"""
    import json
    from pathlib import Path

    # 프로젝트 루트의 history2.json 파일 읽기
    history_path = Path(__file__).parent.parent / "history2.json"

    if history_path.exists():
        with open(history_path, 'r') as f:
            history = json.load(f)
        return history
    else:
        return {
            "error": "Training history not found",
            "message": "history2.json file is missing"
        }

@app.get("/health")
def health_check():
    """헬스체크 엔드포인트"""
    return {
        "status": "healthy",
        "service": "backend"
    }

@app.post("/predict")
async def predict_segmentation(
    file: UploadFile = File(...),
    gt_mask: UploadFile = File(None),
    model_type: str = "unet",  # "unet" or "yolov8_sam"
    alpha: float = 0.5  # 오버레이 투명도 (0.0 = 투명, 1.0 = 불투명)
):
    """
    이미지 세그멘테이션 예측

    Args:
        file: 업로드된 이미지 파일
        gt_mask: Ground Truth 마스크 (선택)
        model_type: 사용할 모델 타입 ("unet" or "yolov8_sam")
        alpha: 오버레이 투명도 (0.0 ~ 1.0)
    """
    try:
        # 이미지 읽기
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)

        # 모델 선택에 따라 예측
        if model_type == "yolov8_sam":
            result = predict_yolov8_sam(image_np, alpha=alpha)
        else:
            result = predict(image_np, alpha=alpha)  # 기존 U-Net

        # 컬러 마스크를 base64로 인코딩
        colored_mask_img = Image.fromarray(result["colored_mask"])
        buffered = io.BytesIO()
        colored_mask_img.save(buffered, format="PNG")
        colored_mask_b64 = base64.b64encode(buffered.getvalue()).decode()

        # 오버레이 이미지를 base64로 인코딩
        overlay_img = Image.fromarray(result["overlay"])
        overlay_buffered = io.BytesIO()
        overlay_img.save(overlay_buffered, format="PNG")
        overlay_b64 = base64.b64encode(overlay_buffered.getvalue()).decode()

        # 원본 이미지도 base64로 인코딩
        original_buffered = io.BytesIO()
        image.save(original_buffered, format="PNG")
        original_b64 = base64.b64encode(original_buffered.getvalue()).decode()

        response_data = {
            "success": True,
            "model_type": model_type,
            "original_image": f"data:image/png;base64,{original_b64}",
            "colored_mask": f"data:image/png;base64,{colored_mask_b64}",
            "overlay_image": f"data:image/png;base64,{overlay_b64}",
            "class_distribution": result["class_distribution"],
            "part_detection": result["part_detection"],
            "confidence_scores": result["confidence_scores"],
            "anomaly_detection": result["anomaly_detection"],
            "overall_confidence": result["overall_confidence"],
            "prediction_stats": {
                "total_pixels": int(result["mask"].size),
                "image_size": {
                    "width": int(result["mask"].shape[1]),
                    "height": int(result["mask"].shape[0])
                },
                "num_classes_detected": len([k for k, v in result["class_distribution"].items() if v["pixels"] > 0]),
                "overlay_alpha": alpha
            }
        }

        return JSONResponse(response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# A/B 비교용 엔드포인트 추가
@app.post("/compare")
async def compare_models(
    file: UploadFile = File(...),
    gt_mask: UploadFile = File(None)
):
    """
    두 모델의 예측 결과를 동시에 반환
    """
    try:
        # 이미지 읽기
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)
        
        # 두 모델로 예측
        result_unet = predict(image_np)
        result_yolov8 = predict_yolov8_sam(image_np)
        
        # 원본 이미지 인코딩
        original_buffered = io.BytesIO()
        image.save(original_buffered, format="PNG")
        original_b64 = base64.b64encode(original_buffered.getvalue()).decode()
        
        # U-Net 결과 인코딩
        unet_mask_img = Image.fromarray(result_unet["colored_mask"])
        unet_buffered = io.BytesIO()
        unet_mask_img.save(unet_buffered, format="PNG")
        unet_b64 = base64.b64encode(unet_buffered.getvalue()).decode()
        
        # YOLOv8+SAM 결과 인코딩
        yolo_mask_img = Image.fromarray(result_yolov8["colored_mask"])
        yolo_buffered = io.BytesIO()
        yolo_mask_img.save(yolo_buffered, format="PNG")
        yolo_b64 = base64.b64encode(yolo_buffered.getvalue()).decode()
        
        response_data = {
            "success": True,
            "original_image": f"data:image/png;base64,{original_b64}",
            "model_a": {
                "name": "U-Net",
                "colored_mask": f"data:image/png;base64,{unet_b64}",
                "class_distribution": result_unet["class_distribution"]
            },
            "model_b": {
                "name": "YOLOv8 + SAM",
                "colored_mask": f"data:image/png;base64,{yolo_b64}",
                "class_distribution": result_yolov8["class_distribution"]
            }
        }
        
        return JSONResponse(response_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

# 서버 실행: uvicorn app:app --reload --host 0.0.0.0 --port 8000