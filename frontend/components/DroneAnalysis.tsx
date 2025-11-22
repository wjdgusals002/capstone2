import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { DroneResults } from './DroneResults';
import { Progress } from './ui/progress';
import { apiService, PredictionResult, ModelInfo } from '../services/api';

// 예시 드론 이미지 URL (로컬 환경에서 사용)
const exampleDrone = 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=800&fit=crop';

type ProcessingStage = 'idle' | 'uploading' | 'predicting' | 'complete';

interface ProcessingState {
  stage: ProcessingStage;
  progress: number;
  error?: string;
}

export function DroneAnalysis() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    stage: 'idle',
    progress: 0
  });
  const [showResults, setShowResults] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoadingModelInfo, setIsLoadingModelInfo] = useState(false);

  // 컴포넌트 마운트 시 모델 정보 가져오기
  useEffect(() => {
    const fetchModelInfo = async () => {
      setIsLoadingModelInfo(true);
      try {
        const info = await apiService.getModelInfo();
        setModelInfo(info);
      } catch (error) {
        console.error('Failed to fetch model info:', error);
      } finally {
        setIsLoadingModelInfo(false);
      }
    };

    fetchModelInfo();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowResults(false);
        setPredictionResult(null);
        setProcessingState({ stage: 'idle', progress: 0 });
        // 자동으로 분석 시작
        startAnalysis(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (file: File) => {
    setProcessingState({ stage: 'uploading', progress: 10 });
    
    try {
      // 업로드 단계
      setProcessingState({ stage: 'uploading', progress: 30 });
      
      // 예측 단계
      setProcessingState({ stage: 'predicting', progress: 50 });
      
      const result = await apiService.predict(file);
      
      setProcessingState({ stage: 'predicting', progress: 90 });
      
      // 결과 저장
      setPredictionResult(result);
      
      setProcessingState({ stage: 'complete', progress: 100 });
      
      setTimeout(() => {
        setShowResults(true);
      }, 500);
      
    } catch (error) {
      console.error('Prediction error:', error);
      setProcessingState({
        stage: 'idle',
        progress: 0,
        error: error instanceof Error ? error.message : '예측 중 오류가 발생했습니다.'
      });
    }
  };

  const handleUseExample = async () => {
    setProcessingState({ stage: 'uploading', progress: 10 });
    
    try {
      // 예시 이미지를 Blob으로 변환
      const response = await fetch(exampleDrone);
      const blob = await response.blob();
      const file = new File([blob], 'example-drone.jpg', { type: 'image/jpeg' });
      
      setSelectedFile(file);
      setSelectedImage(exampleDrone);
      setShowResults(false);
      setPredictionResult(null);
      
      startAnalysis(file);
    } catch (error) {
      console.error('Failed to load example image:', error);
      setProcessingState({
        stage: 'idle',
        progress: 0,
        error: '예시 이미지를 불러오지 못했습니다.'
      });
    }
  };

  const isProcessing = processingState.stage === 'uploading' || processingState.stage === 'predicting';
  const hasError = !!processingState.error;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">드론 부품 세그멘테이션</h1>
        <p className="text-slate-600">드론 이미지를 업로드하면 AI 모델이 자동으로 부품을 분석합니다</p>
      </div>

      {!showResults ? (
        <div className="space-y-6">
          {/* 에러 메시지 */}
          {hasError && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-900 font-medium mb-1">오류 발생</h3>
                  <p className="text-red-700 text-sm">{processingState.error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setProcessingState({ stage: 'idle', progress: 0 })}
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 이미지 업로드 영역 */}
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center">
              {selectedImage ? (
                <div className="w-full max-w-4xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* 원본 이미지 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                        <h3 className="text-slate-900">원본 이미지</h3>
                      </div>
                      <div className="relative bg-slate-100 rounded-lg overflow-hidden aspect-square">
                        <ImageWithFallback
                          src={selectedImage}
                          alt="선택된 드론 이미지"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* 세그멘테이션 결과 (오버레이) */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <h3 className="text-slate-900">세그멘테이션 결과</h3>
                        {predictionResult && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="relative bg-slate-100 rounded-lg overflow-hidden aspect-square">
                        {predictionResult ? (
                          <img
                            src={predictionResult.overlay_image}
                            alt="Segmentation result"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {isProcessing ? (
                              <div className="text-center">
                                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-3" />
                                <p className="text-slate-600 text-sm">
                                  {processingState.stage === 'uploading' ? '이미지 업로드 중...' : '모델 예측 중...'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400">대기 중...</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 처리 상태 표시 */}
                  {isProcessing && (
                    <Card className="p-6 bg-slate-50 border-slate-200">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-900">처리 진행 중...</span>
                          <span className="text-slate-600">{processingState.progress}%</span>
                        </div>
                        <Progress value={processingState.progress} className="h-2" />
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>
                            {processingState.stage === 'uploading' && '이미지를 서버에 업로드하는 중...'}
                            {processingState.stage === 'predicting' && 'U-Net 모델이 부품을 분석하는 중...'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* 클래스 분포 미리보기 */}
                  {predictionResult && processingState.stage === 'complete' && !showResults && (
                    <Card className="p-6 bg-slate-50 border-slate-200 mb-6">
                      <h3 className="text-slate-900 mb-3">검출된 부품</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(predictionResult.class_distribution).map(([className, data]) => (
                          data.percentage > 0 && (
                            <div key={className} className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="text-slate-700 text-sm">
                                {className} ({data.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                    </Card>
                  )}

                  {processingState.stage === 'complete' && !showResults && (
                    <div className="flex gap-4 justify-center mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null);
                          setSelectedFile(null);
                          setPredictionResult(null);
                          setProcessingState({ stage: 'idle', progress: 0 });
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        다른 이미지 선택
                      </Button>
                      <Button
                        onClick={() => setShowResults(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        상세 결과 보기
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 mb-2">드론 이미지를 업로드하세요</h3>
                  <p className="text-slate-600 mb-6">PNG, JPG 파일을 지원합니다 • 업로드 즉시 자동 분석됩니다</p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      이미지 업로드
                    </Button>
                    <Button variant="outline" onClick={handleUseExample}>
                      예시 이미지 사용
                    </Button>
                  </div>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </Card>

          {/* 모델 정보 */}
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">사용 모델 정보</h3>
            {isLoadingModelInfo ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                <span className="ml-2 text-slate-600">모델 정보 로드 중...</span>
              </div>
            ) : modelInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>알고리즘:</span>
                    <span className="text-slate-900">
                      {modelInfo.model_architecture.name} ({modelInfo.model_architecture.encoder})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>입력 크기:</span>
                    <span className="text-slate-900">
                      {modelInfo.model_architecture.input_size[0]} × {modelInfo.model_architecture.input_size[1]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>출력 클래스:</span>
                    <span className="text-slate-900">{modelInfo.model_architecture.output_classes} classes</span>
                  </div>
                </div>
                <div className="space-y-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>평균 IoU:</span>
                    <span className="text-slate-900">
                      {(modelInfo.performance_metrics.all_classes.mIoU * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pixel Accuracy:</span>
                    <span className="text-slate-900">
                      {(modelInfo.performance_metrics.all_classes.pixel_accuracy * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>파라미터:</span>
                    <span className="text-slate-900">{modelInfo.model_architecture.parameters.total}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>모델 정보를 불러올 수 없습니다</p>
                <p className="text-sm text-slate-500 mt-1">백엔드 서버가 실행 중인지 확인해주세요</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <DroneResults 
          originalImage={selectedImage!}
          predictionResult={predictionResult!}
          onBack={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
