# 드론 부품 세그멘테이션 분석 시스템

드론 이미지를 업로드하여 두 개의 AI 모델(U-Net, DeepLab v3+)의 부품 분석 결과를 실시간으로 비교하는 웹 애플리케이션입니다.

## 주요 기능

### 1. 드론 분석 페이지
- **이미지 업로드**: 드론 이미지를 업로드하면 자동으로 분석 시작
- **실시간 세그멘테이션**: 두 모델의 분석 결과를 실시간으로 시각화
- **처리 단계 표시**: 전처리 → 모델 A 분석 → 모델 B 분석 → 후처리 과정을 단계별로 표시
- **진행률 표시**: 각 단계의 진행률을 프로그레스 바로 표시
- **부품별 분석**: 프로펠러, 모터, 본체, 랜딩 기어, 카메라 등 부품별 세그멘테이션 결과
- **건강 체크리스트**: 두 모델의 분석 결과를 비교하여 드론 상태 체크

### 2. 모델 평가 페이지
- **학습 곡선**: Training & Validation Accuracy 시각화
- **Loss 곡선**: Training & Validation Loss의 감소 추이 시각화
- **부품별 성능**: 각 부품에 대한 세그멘테이션 정확도 비교
- **종합 성능 비교**: Radar Chart로 5가지 메트릭 비교
- **Confusion Matrix**: 두 모델의 분류 정확도 매트릭스

## 기술 스택

- **프레임워크**: React 18 + TypeScript
- **스타일링**: Tailwind CSS v4
- **차트**: Recharts
- **아이콘**: Lucide React
- **UI 컴포넌트**: Shadcn/ui

## 프로젝트 구조

```
/
├── App.tsx                          # 메인 애플리케이션
├── components/
│   ├── Navbar.tsx                   # 네비게이션 바
│   ├── DroneAnalysis.tsx            # 드론 분석 페이지
│   ├── DroneResults.tsx             # 분석 결과 상세 페이지
│   ├── ModelEvaluation.tsx          # 모델 평가 페이지
│   └── ui/                          # Shadcn UI 컴포넌트
│       ├── button.tsx
│       ├── card.tsx
│       ├── progress.tsx
│       ├── table.tsx
│       ├── dropdown-menu.tsx
│       └── ...
├── styles/
│   └── globals.css                  # 전역 스타일 및 Tailwind 설정
└── package.json                     # 의존성 관리

```

## 설치 및 실행

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

### 빌드 결과 미리보기
```bash
npm run preview
```

## 사용 방법

1. **드론 분석**
   - "드론 분석" 탭을 클릭
   - 드론 이미지를 업로드하거나 예시 이미지 사용
   - 자동으로 두 모델의 분석이 시작됨
   - 실시간으로 세그멘테이션 결과 확인
   - "상세 결과 보기"를 클릭하여 자세한 분석 결과 확인

2. **모델 평가**
   - "모델 평가" 탭을 클릭
   - 학습 곡선, Loss 곡선, 성능 메트릭 확인
   - 두 모델의 성능을 다양한 차트로 비교

## 모델 정보

### 모델 A: U-Net
- 정확도: 94.2%
- 학습 에포크: 150
- 데이터셋: 5,000 images
- 최종 Loss: 0.120

### 모델 B: DeepLab v3+
- 정확도: 96.8%
- 학습 에포크: 200
- 데이터셋: 5,000 images
- 최종 Loss: 0.080

## 백엔드 연동

현재는 프론트엔드 시뮬레이션으로 동작합니다. 실제 모델과 연동하려면:

1. `/components/DroneAnalysis.tsx`의 `startAnalysis()` 함수 수정
2. 실제 API 엔드포인트 연결
3. 이미지 업로드 및 세그멘테이션 결과 처리 로직 구현

```typescript
// 예시
const startAnalysis = async () => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  // 결과 처리
};
```

## 라이선스

MIT

## 기여

이슈와 Pull Request는 언제나 환영합니다!
