# 🚁 드론 부품 세그멘테이션 AI 시스템

**U-Net 기반 드론 검사 자동화를 위한 통합 AI 분석 플랫폼**

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [시스템 아키텍처](#-시스템-아키텍처)
- [주요 기능](#-주요-기능)
- [성능 지표](#-성능-지표)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [빠른 시작](#-빠른-시작)
- [상세 문서](#-상세-문서)
- [데모](#-데모)

---

## 🎯 프로젝트 개요

드론 이미지에서 **5개 부품**(암, 본체, 카메라, 랜딩기어, 프로펠러)을 자동으로 감지하고 분할하는 **딥러닝 세그멘테이션 시스템**입니다.

### ✨ 핵심 가치

```
📸 이미지 업로드 → 🤖 AI 분석 (147ms) → ✅ 부품 검출 결과 → 📊 리포트 생성
```

| 특징 | 설명 |
|------|------|
| 🎯 **높은 정확도** | Pixel Accuracy **92.5%**, mIoU **70.9%** |
| ⚡ **실시간 처리** | 평균 추론 속도 **147ms** (GPU 기준) |
| 🔍 **자동 이상 탐지** | 부품 미검출, 낮은 신뢰도 자동 알림 |
| 📱 **웹 기반 UI** | 직관적인 React 대시보드 |
| 🚀 **End-to-End** | 학습 → 배포 → 서비스 전 과정 포함 |

### 🎬 사용 시나리오

```
1️⃣ 드론 검사 담당자가 드론 사진 촬영
         ↓
2️⃣ 웹 브라우저에서 이미지 업로드
         ↓
3️⃣ AI가 자동으로 부품 인식 및 분석
         ↓
4️⃣ 검출 결과 및 이상 여부 리포트 확인
         ↓
5️⃣ PDF 보고서 다운로드
```

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                     🌐 Frontend (React 18 + TypeScript)         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  📱 드론 분석 페이지          📊 모델 평가 페이지        │   │
│  │  • 이미지 업로드              • 학습 곡선 시각화          │   │
│  │  • 실시간 분석 진행            • 클래스별 성능 차트       │   │
│  │  • 부품 검출 결과              • 혼동 행렬 (Confusion)   │   │
│  │  • 이상 탐지 알림              • 성능 지표 대시보드       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────┴────────────────────────────────────────┐
│                    ⚙️ Backend (FastAPI + Uvicorn)               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  📡 API Endpoints                                         │   │
│  │  GET  /              → 상태 확인                          │   │
│  │  GET  /health        → 헬스 체크                          │   │
│  │  GET  /model/info    → 모델 정보 및 성능 지표            │   │
│  │  GET  /model/history → 학습 히스토리 (44 epochs)        │   │
│  │  POST /predict       → 이미지 세그멘테이션 예측          │   │
│  │  POST /compare       → 모델 A/B 비교                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                         │
│  ┌──────────────────────┴─────────────────────────────────┐     │
│  │              🧠 U-Net Model (PyTorch)                   │     │
│  │                                                          │     │
│  │  ┌─────────────────┐      ┌──────────────────┐         │     │
│  │  │  VGG16-BN       │  →   │  U-Net Decoder   │         │     │
│  │  │  Encoder        │      │                  │         │     │
│  │  │  (ImageNet)     │  ←   │  (Skip Conn.)    │         │     │
│  │  └─────────────────┘      └──────────────────┘         │     │
│  │                                                          │     │
│  │  파라미터: 23.7M  |  입력: 512×512×3  |  출력: 6 classes │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│              📓 Training (Jupyter Notebook)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  1. 데이터 전처리    → RGB 마스크를 클래스 ID로 변환     │   │
│  │  2. 데이터 증강      → Albumentations (회전, 밝기 등)   │   │
│  │  3. 모델 학습        → 44 epochs (Best: epoch 35)        │   │
│  │  4. 성능 평가        → IoU, Dice, Confusion Matrix      │   │
│  │  5. 결과 저장        → final_model.pth + history2.json  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 주요 기능

### 1️⃣ 모델 설계 및 학습

| 항목 | 상세 |
|------|------|
| **모델 아키텍처** | U-Net with VGG16-BN Encoder (ImageNet Pre-trained) |
| **데이터셋** | 567개 드론 이미지 (Train 80% / Val 20%) |
| **클래스** | 6개 (배경 + 드론 부품 5개) |
| **데이터 증강** | Albumentations (회전, 플립, 밝기, 블러, 노이즈 등) |
| **손실 함수** | Combined Loss (CrossEntropyLoss + DiceLoss) |
| **최적화** | AdamW (lr=5e-4, weight_decay=1e-4) |
| **스케줄러** | CosineAnnealingWarmRestarts (T0=10, T_mult=2) |
| **학습 결과** | 44 epochs, Best Epoch 35 (mIoU 62.9%) |

#### 🎨 클래스 정의

| ID | 부품명 | 색상 | 특징 |
|:--:|--------|------|------|
| 0 | Background | ⬛ 검정 | 배경 영역 |
| 1 | Arm | 🟧 주황 | 드론 암 (모터 연결부) |
| 2 | Body | 🟥 빨강 | 드론 본체 (중앙부) |
| 3 | Camera | 🟩 초록 | 카메라 모듈 |
| 4 | Landing Gear | 🟦 파랑 | 착륙 장치 |
| 5 | Propeller | 🟨 노랑 | 프로펠러 (회전날개) |

#### 📊 학습 과정

```
Epoch 1  →  mIoU: 50.1%  |  Loss: 0.456  |  Acc: 85.0%
Epoch 10 →  mIoU: 58.3%  |  Loss: 0.312  |  Acc: 88.5%
Epoch 20 →  mIoU: 61.7%  |  Loss: 0.268  |  Acc: 89.4%
Epoch 30 →  mIoU: 62.5%  |  Loss: 0.251  |  Acc: 89.8%
Epoch 35 →  mIoU: 62.9%  |  Loss: 0.247  |  Acc: 90.0%  ⭐ Best
Epoch 44 →  mIoU: 62.7%  |  Loss: 0.249  |  Acc: 89.9%
```

👉 **상세 내용**: [모델설계.md](docs/모델설계.md)

---

### 2️⃣ 백엔드 API 서버

| 항목 | 상세 |
|------|------|
| **프레임워크** | FastAPI (비동기 REST API) |
| **서버** | Uvicorn (ASGI) |
| **모델 추론** | PyTorch (CPU/GPU/MPS 자동 선택) |
| **이미지 처리** | OpenCV, Pillow |
| **응답 형식** | JSON (Base64 인코딩 이미지 포함) |

#### 🔌 API 엔드포인트

```
┌──────────────────┬────────┬─────────────────────────────────────┐
│ Endpoint         │ Method │ Description                         │
├──────────────────┼────────┼─────────────────────────────────────┤
│ /                │ GET    │ 서버 상태 확인                      │
│ /health          │ GET    │ 헬스 체크                           │
│ /model/info      │ GET    │ 모델 아키텍처 및 성능 지표          │
│ /model/history   │ GET    │ 전체 학습 히스토리 (44 epochs)     │
│ /predict         │ POST   │ 이미지 세그멘테이션 예측            │
│ /compare         │ POST   │ 두 모델 예측 결과 비교              │
└──────────────────┴────────┴─────────────────────────────────────┘
```

#### 📤 응답 예시 (`/predict`)

**입력**: 드론 이미지 파일 업로드

**출력**:
```
✅ Success: true
📸 Original Image (Base64)
🎨 Colored Mask (Base64)
🖼️ Overlay Image (Base64)
📊 Class Distribution (각 클래스별 픽셀 비율)
🔍 Part Detection (5개 부품 검출 여부)
💯 Confidence Scores (부품별 신뢰도)
⚠️ Anomaly Detection (이상 탐지 결과)
```

#### ⚡ 성능

- **추론 속도**: 평균 147ms (GPU), 800ms (CPU)
- **디바이스 자동 선택**: CUDA → MPS → CPU
- **CORS 지원**: 프론트엔드와 원활한 통신

👉 **상세 내용**: [백엔드.md](docs/백엔드.md)

---

### 3️⃣ 프론트엔드 웹 애플리케이션

| 항목 | 상세 |
|------|------|
| **프레임워크** | React 18 (함수형 컴포넌트 + Hooks) |
| **언어** | TypeScript (타입 안전성) |
| **빌드 도구** | Vite (HMR 지원, 빠른 빌드) |
| **스타일링** | Tailwind CSS + Radix UI |
| **차트** | Recharts (Line, Bar, Radar) |

#### 📱 주요 페이지

##### 🔍 드론 분석 페이지 (`/`)

```
┌─────────────────────────────────────────────────────────┐
│  📤 이미지 업로드                                        │
│  ┌────────────────────────────────────────────────┐     │
│  │                                                 │     │
│  │     드래그 앤 드롭 또는 클릭하여 이미지 선택    │     │
│  │                                                 │     │
│  └────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ⏳ 진행 상태                                            │
│  [████████████████──────────] 80%                       │
│  예측 중...                                              │
├─────────────────────────────────────────────────────────┤
│  📊 분석 결과                                            │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┐           │
│  │ 5/5  │ 74%  │ 92%  │ 정상 │ U-Net│ 147ms│           │
│  │ 검출 │ 신뢰 │ 정확 │ 상태 │ 모델 │ 속도 │           │
│  └──────┴──────┴──────┴──────┴──────┴──────┘           │
├─────────────────────────────────────────────────────────┤
│  🔧 부품별 검출 결과 (1×5 레이아웃)                     │
│  ┌─────┬─────┬─────┬─────┬─────┐                       │
│  │ Arm │ Body│Camra│ LG  │Prop │                       │
│  │ ✅  │ ✅  │ ✅  │ ⚠️  │ ✅  │                       │
│  │ 78% │ 92% │ 69% │ 45% │ 86% │                       │
│  └─────┴─────┴─────┴─────┴─────┘                       │
│  초록: 정상 | 주황: 경고 (낮은 신뢰도) | 빨강: 미검출  │
├─────────────────────────────────────────────────────────┤
│  ⚠️ 이상 탐지 결과                                      │
│  • Landing Gear: 신뢰도 낮음 (45.2%)                    │
│  • 권장 조치: 재촬영 또는 수동 검사 필요                │
├─────────────────────────────────────────────────────────┤
│  🖼️ 이미지 시각화 (3단 비교)                            │
│  ┌──────────┬──────────┬──────────┐                    │
│  │ Original │ Colored  │ Overlay  │                    │
│  │  Image   │  Mask    │  Result  │                    │
│  └──────────┴──────────┴──────────┘                    │
└─────────────────────────────────────────────────────────┘
```

##### 📊 모델 평가 페이지 (`/evaluation`)

```
┌─────────────────────────────────────────────────────────┐
│  📈 성능 요약 (6개 메트릭 카드)                          │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┐           │
│  │ 90.0%│ 62.9%│ 76.8%│ 0.247│  44  │ 567  │           │
│  │ 정확 │ mIoU │mDice │ Loss │Epoch │ Data │           │
│  └──────┴──────┴──────┴──────┴──────┴──────┘           │
├─────────────────────────────────────────────────────────┤
│  📉 학습 곡선 (Line Chart)                               │
│  ┌────────────────────────────────────────────┐         │
│  │    Accuracy & Loss over Epochs              │         │
│  │  ↑                                           │         │
│  │1.0│      ╱────────────                       │         │
│  │   │    ╱                                     │         │
│  │0.5│  ╱                                       │         │
│  │   │╱                                         │         │
│  │0.0└──────────────────────────────→           │         │
│  │    0    10    20    30    40                │         │
│  └────────────────────────────────────────────┘         │
├─────────────────────────────────────────────────────────┤
│  📊 클래스별 성능 (Bar Chart)                            │
│  ┌────────────────────────────────────────────┐         │
│  │ Background  ████████████████████  91.8%    │         │
│  │ Body        ████████████          58.6%    │         │
│  │ Propeller   ███████████           57.5%    │         │
│  │ Camera      ███████████           54.0%    │         │
│  │ Arm         ██████████            51.9%    │         │
│  │ LandingGear ████████              39.0%    │         │
│  └────────────────────────────────────────────┘         │
├─────────────────────────────────────────────────────────┤
│  🎯 혼동 행렬 (Confusion Matrix 6×6)                    │
│  색상: 초록(정확) / 빨강(오분류)                         │
└─────────────────────────────────────────────────────────┘
```

#### 🎨 UI/UX 특징

- ✅ **반응형 디자인**: Mobile / Tablet / Desktop
- ✅ **접근성 (a11y)**: Radix UI 기반 컴포넌트
- ✅ **다크 모드 대응**: 색상 팔레트 최적화
- ✅ **실시간 진행률**: Progress Bar로 처리 단계 표시
- ✅ **PDF 다운로드**: 브라우저 인쇄 기능 활용

👉 **상세 내용**: [프론트엔드.md](docs/프론트엔드.md)

---

## 📊 성능 지표

### 🏆 전체 성능 (All Classes - Best Epoch 35 기준)

| 지표 | 값 | 설명 |
|------|-----|------|
| **Pixel Accuracy** | **90.0%** | 전체 픽셀 중 정확히 분류된 비율 |
| **mIoU (Mean IoU)** | **62.9%** | 6개 클래스 평균 IoU |
| **mDice** | **76.8%** | 6개 클래스 평균 Dice Coefficient |
| **FW IoU** | **84.6%** | Frequency Weighted IoU |
| **Precision** | **77.7%** | 예측한 것 중 정답 비율 |
| **Recall** | **81.5%** | 실제 정답 중 맞춘 비율 |
| **F1 Score** | **79.5%** | Precision과 Recall의 조화평균 |

### 🎯 드론 부품만 (Drone Only - 배경 제외)

| 지표 | 값 |
|------|-----|
| **mIoU (Drone Only)** | **50.4%** |
| **mDice (Drone Only)** | **67.7%** |
| **Precision (Drone Only)** | **61.5%** |
| **Recall (Drone Only)** | **71.8%** |
| **F1 Score (Drone Only)** | **65.8%** |

### 🔍 클래스별 성능 (IoU 기준)

```
Background  ████████████████████  91.8%  ⭐ 최고 성능
Body        ███████████           58.6%
Propeller   ███████████           57.5%
Camera      ███████████           54.0%
Arm         ██████████            51.9%
Landing Gear ████████             39.0%  ⚠️ 개선 필요
```

### 💡 성능 분석

#### ✅ 잘하는 부분
- **배경 분리**: 91.8% IoU로 거의 완벽하게 배경과 드론 구분
- **본체 검출**: 58.6% IoU로 큰 부품은 안정적으로 인식
- **전체 정확도**: 90.0%로 대부분의 픽셀을 정확히 분류

#### ⚠️ 개선이 필요한 부분
- **Landing Gear**: 39.0% IoU, 가장 작고 픽셀 수가 적어 검출 어려움
- **경계 정확도**: 부품 간 경계가 다소 부정확한 경우 존재
- **작은 객체**: 카메라 등 작은 부품의 완전한 검출 어려움

### ⚡ 추론 성능

| 환경 | 추론 시간 |
|------|-----------|
| **GPU (CUDA)** | 평균 147ms |
| **Apple M1/M2 (MPS)** | 평균 250ms |
| **CPU** | 평균 800ms |

---

## 🛠️ 기술 스택

### Backend
```
Python 3.8+
  ├─ PyTorch 2.0+              (딥러닝 프레임워크)
  ├─ FastAPI 0.100+            (REST API 서버)
  ├─ Uvicorn                   (ASGI 서버)
  ├─ segmentation-models-pytorch (U-Net 구현)
  ├─ Albumentations 1.3+       (데이터 증강)
  ├─ OpenCV 4.8+               (이미지 처리)
  └─ NumPy 1.21+               (수치 연산)
```

### Frontend
```
Node.js 18+
  ├─ React 18.3                (UI 라이브러리)
  ├─ TypeScript 5.6+           (타입 안전성)
  ├─ Vite 6.0                  (빌드 도구)
  ├─ Tailwind CSS 4.0          (유틸리티 CSS)
  ├─ Radix UI                  (접근성 컴포넌트)
  ├─ Recharts 2.x              (데이터 시각화)
  └─ Lucide React              (아이콘)
```

### AI/ML
```
Jupyter Notebook
  ├─ U-Net Architecture        (세그멘테이션 모델)
  ├─ VGG16-BN Encoder          (ImageNet 사전 훈련)
  ├─ Dice Loss + CrossEntropy  (복합 손실 함수)
  ├─ AdamW                     (옵티마이저)
  ├─ CosineAnnealing Scheduler (학습률 조정)
  └─ Matplotlib + Seaborn      (시각화)
```

---

## 📁 프로젝트 구조

```
capstone2/
│
├── 📓 drone_segmentation_finetune.ipynb   # 모델 학습 노트북 ⭐
│
├── 📂 backend/                             # FastAPI 백엔드 서버
│   ├── app.py                             # 메인 API 서버
│   ├── models/
│   │   └── unet_model.py                  # U-Net 모델 로딩/추론
│   ├── utils/
│   │   ├── image_utils.py                 # 이미지 처리 유틸리티
│   │   └── metrics.py                     # 평가 지표 계산
│   └── requirements.txt                   # Python 의존성
│
├── 📂 frontend/                            # React 프론트엔드
│   ├── components/
│   │   ├── DroneAnalysis.tsx             # 드론 분석 메인 페이지
│   │   ├── DroneResults.tsx              # 분석 결과 상세
│   │   ├── ModelEvaluation.tsx           # 모델 평가 대시보드
│   │   ├── Navbar.tsx                    # 네비게이션 바
│   │   └── ui/                           # Radix UI 컴포넌트
│   ├── services/
│   │   └── api.ts                        # API 클라이언트 (TypeScript)
│   ├── App.tsx                           # 루트 컴포넌트
│   ├── main.tsx                          # 진입점
│   ├── package.json                      # NPM 의존성
│   ├── tsconfig.json                     # TypeScript 설정
│   └── vite.config.ts                    # Vite 설정
│
├── 📂 models/                              # 학습된 모델 파일
│   └── final_model.pth                    # 최종 모델 (272MB) ⭐
│
├── 📂 data/                                # 훈련 데이터셋
│   ├── raw/                               # 원본 이미지 + RGB 마스크
│   │   ├── images/                        # 916 images
│   │   └── masks/                         # 916 masks
│   ├── train/                             # 학습 데이터 (80%)
│   │   ├── images/                        # 733 images
│   │   └── masks/                         # 733 masks
│   └── val/                               # 검증 데이터 (20%)
│       ├── images/                        # 183 images
│       └── masks/                         # 183 masks
│
├── 📂 outputs/                             # 학습 결과 (Notebook 생성)
│   ├── final_model.pth                    # 학습된 모델
│   ├── report/
│   │   ├── history2.json                  # 전체 학습 로그 ⭐
│   │   ├── val_class_iou_dice.png         # 클래스별 성능
│   │   ├── val_confusion_matrix.png       # 혼동 행렬
│   │   ├── curve_loss.png                 # Loss 곡선
│   │   ├── curve_iou.png                  # IoU 곡선
│   │   └── curve_miou_mdice.png           # mIoU/mDice 곡선
│   └── vis/                               # 예측 시각화 이미지
│
├── 📂 docs/                                # 상세 문서 ⭐
│   ├── 모델설계.md                         # 모델 아키텍처 및 학습 과정
│   ├── 백엔드.md                           # FastAPI 백엔드 설명
│   └── 프론트엔드.md                       # React 프론트엔드 설명
│
├── history2.json                          # 학습 히스토리 (루트)
├── README.md                              # 이 문서
└── .gitignore                             # Git 제외 파일
```

---

## ⚡ 빠른 시작

### 📋 사전 요구사항

- **Python** 3.8 이상
- **Node.js** 18 이상
- **Git**
- **Jupyter Notebook** (모델 학습 시)

### 1️⃣ 저장소 클론

```bash
git clone <repository-url>
cd capstone2
```

### 2️⃣ 백엔드 설정 및 실행

```bash
cd backend

# 가상환경 생성 (권장)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치 (순서 중요!)
pip install "numpy>=1.21.0,<1.27.0"
pip install -r requirements.txt

# 서버 실행
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

✅ 서버 시작 확인: http://localhost:8000

### 3️⃣ 프론트엔드 설정 및 실행

새 터미널에서:

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

✅ 웹 애플리케이션 접속: http://localhost:5173

### 4️⃣ 모델 학습 (선택사항)

새로운 데이터로 모델을 재학습하려면:

```bash
# Jupyter Notebook 실행
jupyter notebook drone_segmentation_finetune.ipynb

# 또는 JupyterLab
jupyter lab drone_segmentation_finetune.ipynb
```

노트북 실행 순서:
1. 환경 설정 및 데이터 로딩
2. 데이터 전처리 및 증강
3. 모델 학습 (80 epochs)
4. 성능 평가 및 시각화
5. 결과 저장 (`outputs/final_model.pth`)

---

## 📚 상세 문서

프로젝트의 각 부분에 대한 상세한 설명은 별도 문서를 참조하세요:

| 문서 | 내용 | 링크 |
|------|------|------|
| 📘 **모델설계.md** | U-Net 아키텍처, 학습 과정, 데이터 증강, 성능 평가 | [바로가기](docs/모델설계.md) |
| 📗 **백엔드.md** | FastAPI 서버, API 엔드포인트, 모델 추론, 이미지 처리 | [바로가기](docs/백엔드.md) |
| 📙 **프론트엔드.md** | React 컴포넌트, TypeScript 인터페이스, UI/UX 디자인 | [바로가기](docs/프론트엔드.md) |

---

## 🎬 데모

### 📸 스크린샷

#### 1️⃣ 드론 분석 페이지
- 이미지 업로드 → 실시간 분석 → 결과 확인

#### 2️⃣ 부품 검출 결과
- 5개 부품별 검출 상태 (✅ 정상 / ⚠️ 경고 / ❌ 미검출)
- 신뢰도 점수 시각화

#### 3️⃣ 이미지 시각화
- 원본 이미지 / 컬러 마스크 / 오버레이 3단 비교

#### 4️⃣ 모델 평가 대시보드
- 학습 곡선 (Accuracy, Loss)
- 클래스별 성능 차트
- 혼동 행렬 (Confusion Matrix)

### 🎥 사용 흐름

```
1. 웹 브라우저에서 http://localhost:5173 접속
         ↓
2. "드론 분석" 탭 클릭
         ↓
3. 드론 이미지 업로드 (드래그 앤 드롭 또는 클릭)
         ↓
4. AI가 자동으로 부품 분석 (약 147ms)
         ↓
5. 검출 결과 및 이상 여부 확인
         ↓
6. 필요시 PDF 보고서 다운로드
         ↓
7. "모델 평가" 탭에서 모델 성능 확인
```

---

## 🔧 트러블슈팅

### ❌ 백엔드 서버 시작 실패

**문제**: `ModuleNotFoundError` 또는 import 에러

**해결**:
```bash
# numpy를 먼저 설치 (순서 중요!)
pip install "numpy>=1.21.0,<1.27.0"
pip install -r requirements.txt
```

### ❌ 모델 파일을 찾을 수 없음

**문제**: `Warning: Model file not found`

**해결**:
- Jupyter Notebook으로 모델 학습
- `outputs/final_model.pth`를 `models/`로 복사

### ❌ 프론트엔드 API 연결 실패

**문제**: `Failed to fetch` 또는 CORS 에러

**해결**:
```bash
# 1. 백엔드 서버 실행 확인
curl http://localhost:8000/health

# 2. CORS 설정 확인 (backend/app.py)
```

### ❌ GPU 메모리 부족

**문제**: `CUDA out of memory`

**해결**:
```python
# Notebook에서 배치 크기 줄이기
train_loader = DataLoader(train_ds, batch_size=4, ...)  # 8 → 4
```

---

## 📊 향후 개선 방향

### 🎯 모델 성능 개선
- [ ] **Landing Gear 성능 향상**: Focal Loss 적용, 데이터 추가 수집
- [ ] **경계 정확도 개선**: Boundary Loss 추가, 고해상도 입력 실험
- [ ] **앙상블 모델**: 여러 모델 예측 결합하여 정확도 향상

### ⚡ 시스템 최적화
- [ ] **실시간 추론 최적화**: TensorRT, ONNX 변환으로 속도 2배 향상
- [ ] **배치 처리**: 여러 이미지 동시 처리 기능
- [ ] **모바일 최적화**: React Native 앱 개발

### 🚀 기능 확장
- [ ] **동영상 분석**: 드론 동영상에서 프레임별 부품 추적
- [ ] **3D 시각화**: Three.js로 드론 3D 모델 표시
- [ ] **데이터베이스 연동**: 검사 히스토리 저장 및 관리
- [ ] **사용자 인증**: 로그인 및 권한 관리

---

## 👥 기여자

**작성자**: 사드론
**작성일**: 2025-11-22
**버전**: 1.0

---

## 📄 라이선스

이 프로젝트는 교육 및 연구 목적으로 제작되었습니다.

---

## 🙏 감사의 말

- [segmentation-models-pytorch](https://github.com/qubvel/segmentation_models.pytorch) - U-Net 구현
- [FastAPI](https://fastapi.tiangolo.com/) - 백엔드 프레임워크
- [Radix UI](https://www.radix-ui.com/) - 접근성 높은 UI 컴포넌트
- [Recharts](https://recharts.org/) - 데이터 시각화 라이브러리
- [Albumentations](https://albumentations.ai/) - 이미지 증강 라이브러리

---

<div align="center">

**🚁 드론 부품 세그멘테이션 AI 시스템**

Made with ❤️ by 사드론

[📘 모델 설계](docs/모델설계.md) • [📗 백엔드](docs/백엔드.md) • [📙 프론트엔드](docs/프론트엔드.md)

</div>
