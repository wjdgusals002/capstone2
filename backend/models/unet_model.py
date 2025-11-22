"""
U-Net 모델 로드 및 추론
"""
import torch
import numpy as np
import segmentation_models_pytorch as smp
from PIL import Image
import albumentations as A
from albumentations.pytorch import ToTensorV2
from utils.image_utils import create_overlay

# 클래스 정의
CLASS_NAMES = [
    "background",
    "arm",
    "body",
    "camera",
    "landing_gear",
    "propeller"
]

CLASS_COLORS = {
    1: (255, 128, 0),       # arm - 주황
    2: (255, 0, 0),         # body - 빨강
    3: (0, 255, 0),         # camera - 초록
    4: (0, 0, 255),         # landing_gear - 파랑
    5: (255, 255, 0),       # propeller - 노랑
}

# 전역 변수
MODEL = None
DEVICE = None
IMG_SIZE = 512

def get_device():
    """디바이스 자동 선택"""
    if torch.cuda.is_available():
        return torch.device("cuda")
    elif torch.backends.mps.is_available():
        return torch.device("mps")
    else:
        return torch.device("cpu")

def load_model(model_path: str):
    """
    U-Net 모델 로드
    
    Args:
        model_path: 모델 체크포인트 경로
    """
    global MODEL, DEVICE
    
    DEVICE = get_device()
    print(f"🔧 Using device: {DEVICE}")
    
    # 모델 구조 생성 (학습 시와 동일)
    MODEL = smp.Unet(
        encoder_name="vgg16_bn",
        encoder_weights="imagenet",  # 학습 시 사용한 사전학습 가중치
        in_channels=3,
        classes=6
    )
    
    # 체크포인트 로드 (PyTorch 2.6+ 호환)
    checkpoint = torch.load(model_path, map_location=DEVICE, weights_only=False)
    
    # 체크포인트가 딕셔너리 형태인 경우 (전체 학습 상태 저장)
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
        print(f"📦 Loaded checkpoint from epoch {checkpoint.get('epoch', 'unknown')}")
        if 'val_iou' in checkpoint:
            print(f"📊 Validation IoU: {checkpoint['val_iou']:.4f}")
    else:
        # 체크포인트가 모델 가중치만 있는 경우
        state_dict = checkpoint
    
    # 키 이름에 "model." 접두사가 있으면 제거
    new_state_dict = {}
    for key, value in state_dict.items():
        if key.startswith("model."):
            new_key = key[6:]  # "model." 제거 (6글자)
            new_state_dict[new_key] = value
        else:
            new_state_dict[key] = value
    
    MODEL.load_state_dict(new_state_dict, strict=True)
    MODEL.to(DEVICE)
    MODEL.eval()  # 평가 모드로 설정
    
    print(f"✅ Model loaded from {model_path}")
    return MODEL


def get_preprocessing():
    """전처리 변환 함수 (ImageNet 정규화)"""
    return A.Compose([
        A.Resize(IMG_SIZE, IMG_SIZE),
        A.Normalize(
            mean=(0.485, 0.456, 0.406),
            std=(0.229, 0.224, 0.225)
        ),
        ToTensorV2()
    ])

def preprocess_image(image: np.ndarray) -> torch.Tensor:
    """
    이미지 전처리
    
    Args:
        image: RGB numpy array (H, W, 3)
    
    Returns:
        전처리된 텐서 (1, 3, 512, 512)
    """
    transform = get_preprocessing()
    transformed = transform(image=image)
    image_tensor = transformed["image"]
    
    # 배치 차원 추가
    image_tensor = image_tensor.unsqueeze(0)
    return image_tensor

def predict(image: np.ndarray, alpha: float = 0.5) -> dict:
    """
    세그멘테이션 예측

    Args:
        image: RGB numpy array (H, W, 3)
        alpha: 오버레이 투명도 (0.0 = 투명, 1.0 = 불투명)

    Returns:
        dict: {
            "mask": 예측 마스크 (H, W),
            "colored_mask": 컬러 마스크 (H, W, 3),
            "overlay": 원본 이미지 위에 마스크 오버레이 (H, W, 3),
            "class_distribution": 클래스별 비율,
            "part_detection": 부품별 감지 정보,
            "confidence_scores": 부품별 신뢰도,
            "anomaly_detection": 이상 탐지 결과,
            "overall_confidence": 전체 드론 검출 신뢰도
        }
    """
    global MODEL, DEVICE

    if MODEL is None:
        raise ValueError("Model not loaded. Call load_model() first.")

    # 원본 크기 저장
    original_h, original_w = image.shape[:2]

    # 전처리
    image_tensor = preprocess_image(image).to(DEVICE)

    # 추론
    with torch.no_grad():
        output = MODEL(image_tensor)  # (1, 6, 512, 512)
        probabilities = torch.softmax(output, dim=1).squeeze(0)  # (6, 512, 512)
        pred_mask = torch.argmax(output, dim=1).squeeze(0)  # (512, 512)
        pred_mask = pred_mask.cpu().numpy()
        probabilities = probabilities.cpu().numpy()

    # 원본 크기로 복원
    pred_mask_resized = Image.fromarray(pred_mask.astype(np.uint8))
    pred_mask_resized = pred_mask_resized.resize((original_w, original_h), Image.NEAREST)
    pred_mask_resized = np.array(pred_mask_resized)

    # 컬러 마스크 생성
    colored_mask = np.zeros((original_h, original_w, 3), dtype=np.uint8)
    for class_id, color in CLASS_COLORS.items():
        colored_mask[pred_mask_resized == class_id] = color

    # 오버레이 이미지 생성
    overlay_image = create_overlay(image, colored_mask, alpha=alpha)

    # 클래스 분포 및 신뢰도 계산
    unique, counts = np.unique(pred_mask_resized, return_counts=True)
    total_pixels = pred_mask_resized.size
    class_distribution = {}
    part_detection = {}
    confidence_scores = {}

    # 예상 부품 목록 (background 제외)
    expected_parts = ["arm", "body", "camera", "landing_gear", "propeller"]

    for class_id in range(1, len(CLASS_NAMES)):  # background(0) 제외
        class_name = CLASS_NAMES[class_id]
        class_mask = (pred_mask_resized == class_id)
        pixel_count = class_mask.sum()

        # RGB to HEX 변환
        rgb_color = CLASS_COLORS[class_id]
        hex_color = f"#{rgb_color[0]:02x}{rgb_color[1]:02x}{rgb_color[2]:02x}"

        if pixel_count > 0:
            # 해당 클래스의 평균 확률 계산 (원본 크기 기준)
            # probabilities를 원본 크기로 리사이즈
            prob_map = probabilities[class_id]
            prob_resized = np.array(Image.fromarray(prob_map).resize((original_w, original_h), Image.BILINEAR))
            avg_confidence = prob_resized[class_mask].mean()

            percentage = (pixel_count / total_pixels) * 100
            class_distribution[class_name] = {
                "pixels": int(pixel_count),
                "percentage": round(percentage, 2),
                "color": hex_color
            }

            part_detection[class_name] = {
                "detected": True,
                "pixel_count": int(pixel_count),
                "coverage_percent": round(percentage, 2)
            }

            confidence_scores[class_name] = round(float(avg_confidence) * 100, 2)
        else:
            # 미감지된 부품도 class_distribution에 추가 (색상 정보 포함)
            class_distribution[class_name] = {
                "pixels": 0,
                "percentage": 0.0,
                "color": hex_color
            }
            part_detection[class_name] = {
                "detected": False,
                "pixel_count": 0,
                "coverage_percent": 0.0
            }
            confidence_scores[class_name] = 0.0

    # 이상 탐지 분석
    anomalies = []

    # 1. 부품 누락 감지
    critical_parts = ["body", "propeller"]  # 필수 부품
    for part in expected_parts:
        if not part_detection.get(part, {}).get("detected", False):
            # 필수 부품은 high, 그 외는 medium
            severity = "high" if part in critical_parts else "medium"
            anomalies.append({
                "type": "missing_part",
                "severity": severity,
                "part": part,
                "message": f"부품 '{part}'이(가) 감지되지 않았습니다."
            })

    # 2. 신뢰도 낮은 부품 감지
    for part, confidence in confidence_scores.items():
        if part_detection[part]["detected"] and confidence < 50.0:
            anomalies.append({
                "type": "low_confidence",
                "severity": "low",
                "part": part,
                "message": f"'{part}' 부품의 검출 신뢰도가 낮습니다 ({confidence:.1f}%)."
            })

    # 전체 드론 검출 신뢰도 계산
    detected_parts = [p for p in expected_parts if part_detection[p]["detected"]]
    detection_rate = len(detected_parts) / len(expected_parts) * 100

    # 검출된 부품들의 평균 신뢰도
    detected_confidences = [confidence_scores[p] for p in detected_parts]
    avg_confidence = np.mean(detected_confidences) if detected_confidences else 0.0

    # 전체 신뢰도: 검출률과 평균 신뢰도의 가중 평균
    overall_confidence = (detection_rate * 0.4 + avg_confidence * 0.6)

    # 이상 여부 판단
    has_anomaly = len(anomalies) > 0
    status = "정상" if not has_anomaly else "이상 감지"

    if len([a for a in anomalies if a["severity"] == "high"]) > 0:
        status = "심각한 이상"
    elif len([a for a in anomalies if a["severity"] == "medium"]) > 0:
        status = "경미한 이상"

    return {
        "mask": pred_mask_resized,
        "colored_mask": colored_mask,
        "overlay": overlay_image,
        "class_distribution": class_distribution,
        "part_detection": part_detection,
        "confidence_scores": confidence_scores,
        "anomaly_detection": {
            "has_anomaly": has_anomaly,
            "status": status,
            "anomalies": anomalies,
            "anomaly_count": len(anomalies)
        },
        "overall_confidence": {
            "score": round(overall_confidence, 2),
            "detection_rate": round(detection_rate, 2),
            "avg_part_confidence": round(avg_confidence, 2),
            "detected_parts": detected_parts,
            "total_parts": len(expected_parts)
        }
    }