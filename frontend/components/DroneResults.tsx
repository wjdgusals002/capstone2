import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Download, CheckCircle, XCircle, AlertTriangle, TrendingUp, Target, Activity, Clock, Shield, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Progress } from './ui/progress';
import { PredictionResult } from '../services/api';

interface DroneResultsProps {
  originalImage: string;
  predictionResult: PredictionResult;
  onBack: () => void;
}

export function DroneResults({ originalImage, predictionResult, onBack }: DroneResultsProps) {

  const handleDownloadPDF = () => {
    // 브라우저의 인쇄 기능 사용
    const printContent = document.getElementById("report-content");
    if (!printContent) {
      alert('보고서를 찾을 수 없습니다.');
      return;
    }

    // 인쇄용 스타일 추가
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        /* 색상과 배경 강제 출력 */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* 페이지 설정 */
        @page {
          size: A4;
          margin: 10mm;
        }

        /* body 설정 */
        body {
          margin: 0 !important;
          padding: 0 !important;
        }

        /* 버튼 숨기기 */
        button {
          display: none !important;
        }

        /* 보고서 콘텐츠 */
        #report-content {
          width: 100% !important;
          max-width: 100% !important;
        }

        /* 섹션별 페이지 나누기 방지 */
        .space-y-6 > * {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* 부품별 감지 카드는 한 줄에 */
        .flex.gap-3 {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* 이미지 크기 조정 */
        img {
          max-width: 100%;
          height: auto;
          page-break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(style);

    // 인쇄 다이얼로그 열기
    window.print();

    // 인쇄 후 스타일 제거
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };
  // 부품 한글 이름 매핑
  const partNames: { [key: string]: string } = {
    arm: '암',
    body: '본체',
    camera: '카메라',
    landing_gear: '랜딩 기어',
    propeller: '프로펠러'
  };

  const totalDetected = Object.values(predictionResult.part_detection).filter(p => p.detected).length;
  const totalComponents = Object.keys(predictionResult.part_detection).length;

  return (
    <div id="report-content" className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </Button>
          <div>
            <h2 className="text-slate-900 font-bold">드론 부품 세그멘테이션 분석 보고서</h2>
            <p className="text-slate-600 text-sm">AI 기반 부품 감지 및 이상 탐지 결과</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-slate-900 text-sm font-medium">분석 일시</div>
            <div className="text-slate-600 text-xs">{new Date().toLocaleString('ko-KR')}</div>
          </div>
          <Button
            onClick={handleDownloadPDF}
            className="bg-blue-600"
          >
            <Download className="h-4 w-4 mr-2" />
            보고서 다운로드
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-slate-900 font-bold">분석 요약</h3>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">전체 감지율</span>
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {predictionResult.overall_confidence.detection_rate}%
            </div>
            <div className="text-slate-500 text-xs">{totalDetected}/{totalComponents} 부품 감지</div>
          </div>

          <div className="flex-1 bg-green-50 rounded-lg p-4 border-l-4 border-green-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">평균 신뢰도</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {predictionResult.overall_confidence.avg_part_confidence.toFixed(1)}%
            </div>
            <div className="text-slate-500 text-xs">전체 평균</div>
          </div>

          <div className="flex-1 bg-orange-50 rounded-lg p-4 border-l-4 border-orange-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">이상 감지</span>
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900 mb-1">
              {predictionResult.anomaly_detection.anomaly_count}건
            </div>
            <div className="text-slate-500 text-xs">주의 필요</div>
          </div>

          <div className="flex-1 bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">처리 시간</span>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900 mb-1">실시간</div>
            <div className="text-slate-500 text-xs">총 소요</div>
          </div>
        </div>
      </Card>

      {/* 세그멘테이션 분석 결과 */}
      <Card className="p-6">
        <h3 className="text-slate-900 font-bold mb-4">1. 세그멘테이션 분석 결과</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <span className="text-slate-900 font-medium">원본 이미지</span>
            </div>
            <div className="bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200">
              <ImageWithFallback
                src={originalImage}
                alt="원본 드론 이미지"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded p-3">
              <div className="flex justify-between mb-1">
                <span>이미지 해상도</span>
                <span className="text-slate-900 font-medium">
                  {predictionResult.prediction_stats.image_size.width} × {predictionResult.prediction_stats.image_size.height}
                </span>
              </div>
              <div className="flex justify-between">
                <span>총 픽셀</span>
                <span className="text-slate-900 font-medium">
                  {(predictionResult.prediction_stats.total_pixels / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-slate-900 font-medium">세그멘테이션 결과</span>
            </div>
            <div className="bg-slate-100 rounded-lg overflow-hidden border-2 border-blue-200">
              <img
                src={predictionResult.overlay_image}
                alt="세그멘테이션 결과"
                className="w-full h-auto"
              />
            </div>
            <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded p-3">
              <div className="flex justify-between mb-1">
                <span>검출 클래스</span>
                <span className="text-slate-900 font-medium">
                  {predictionResult.prediction_stats.num_classes_detected}개
                </span>
              </div>
              <div className="flex justify-between">
                <span>모델</span>
                <span className="text-slate-900 font-medium">U-Net</span>
              </div>
            </div>
          </div>
        </div>
      </Card>


<Card className="p-6">
  <h3 className="text-slate-900 font-bold mb-4">2. 부품별 감지 상세 정보</h3>

  {/* 5개를 한 줄에: 1 x 5 */}
  <div className="flex gap-3 items-stretch">
    {Object.entries(predictionResult.part_detection).map(([part, info], idx) => {
      const score = predictionResult.confidence_scores[part]; // 0~100
      const classColor = predictionResult.class_distribution[part]?.color || '#64748b';
      const pixelCount = predictionResult.class_distribution[part]?.pixels || 0;
      const hasWarning = predictionResult.anomaly_detection.anomalies.some(
        anomaly => anomaly.part === part
      );

      return (
        <div
          key={part}
          className={`border-2 rounded-lg p-4 w-full transition-all flex flex-col items-center justify-between text-center ${
            hasWarning
              ? 'border-orange-50 bg-orange-50'            // 경고 시 주황
              : info.detected
              ? 'border-green-50 bg-green-50'             // ✅ 감지 시 초록 박스
              : 'border-red-50 bg-red-50'                  // 미감지 시 빨강
          }`}
        >
          {/* TOP COLOR BOX */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow mb-3"
            style={{ backgroundColor: classColor }}
          >
          </div>

          {/* COMPONENT NAME */}
          <div className="text-slate-900 font-medium mb-2 text-lg">
            {partNames[part]}
          </div>

          {/* DETECTION BADGES */}
          <div className="w-full mb-3 flex flex-col items-center">
            {info.detected ? (
              <div className="flex items-center justify-center gap-1 bg-green-100 text-black px-2 py-1 rounded-full mb-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>감지</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full mb-2 text-sm">
                <XCircle className="h-4 w-4" />
                <span>미감지</span>
              </div>
            )}

            {hasWarning && (
              <div className="flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>주의</span>
              </div>
            )}
          </div>

          {/* PIXEL COUNT */}
          <div className="text-slate-600 text-sm mb-3">
            검출 픽셀: {(pixelCount / 1000).toFixed(1)}k
          </div>

          {/* CONFIDENCE BAR */}
          <div className="w-full">
            <div className="text-slate-600 text-xs mb-1">신뢰도</div>
            <div
              className={`mb-2 text-sm font-medium ${
                score >= 80 ? 'text-green-900'
                : score >= 60 ? 'text-yellow-900'
                : 'text-red-900'
              }`}
            >
              {score.toFixed(1)}%
            </div>
            <Progress
              value={score}
              className={`h-2 ${
                score >= 80 ? 'bg-green-200'
                : score >= 60 ? 'bg-yellow-200'
                : 'bg-red-200'
              }`}
            />
          </div>
        </div>
      );
    })}
  </div>
</Card>


      {/* 이상 탐지 및 통계 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 이상 탐지 결과 */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="text-slate-900 font-bold">3. 이상 탐지 결과</h3>
          </div>

          {predictionResult.anomaly_detection.anomalies.length > 0 ? (
            <div className="space-y-3">
              {predictionResult.anomaly_detection.anomalies.map((anomaly, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-l-4 p-4 ${
                    anomaly.severity === 'high'
                      ? 'bg-red-50 border-red-600'
                      : anomaly.severity === 'medium'
                      ? 'bg-orange-50 border-orange-600'
                      : 'bg-yellow-50 border-yellow-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {anomaly.severity === 'high' ? (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-medium ${
                            anomaly.severity === 'high'
                              ? 'text-red-900'
                              : anomaly.severity === 'medium'
                              ? 'text-orange-900'
                              : 'text-yellow-900'
                          }`}
                        >
                          {partNames[anomaly.part]}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-white text-xs ${
                            anomaly.severity === 'high'
                              ? 'bg-red-600'
                              : anomaly.severity === 'medium'
                              ? 'bg-orange-600'
                              : 'bg-yellow-600'
                          }`}
                        >
                          {anomaly.severity === 'high' && '심각'}
                          {anomaly.severity === 'medium' && '경고'}
                          {anomaly.severity === 'low' && '주의'}
                        </span>
                      </div>
                      <div className="text-slate-700 text-sm">{anomaly.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-slate-900 font-medium mb-1">이상 없음</div>
              <div className="text-slate-600 text-sm">모든 부품이 정상 상태입니다</div>
            </div>
          )}
        </Card>

        {/* 상세 통계 */}
        <Card className="p-6">
          <h3 className="text-slate-900 font-bold mb-4">4. 상세 분석 통계</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex justify-between text-slate-700 mb-2 text-sm">
                <span>총 검출 픽셀 수</span>
                <span className="text-blue-900 font-bold">
                  {Object.values(predictionResult.class_distribution)
                    .reduce((sum: number, c: any) => sum + (c.pixels || 0), 0)
                    .toLocaleString()}
                  개
                </span>
              </div>
              <Progress
                value={
                  (Object.values(predictionResult.class_distribution).reduce(
                    (sum: number, c: any) => sum + (c.pixels || 0),
                    0
                  ) /
                    predictionResult.prediction_stats.total_pixels) *
                  100
                }
                className="h-2"
              />
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex justify-between text-slate-700 mb-2 text-sm">
                <span>정상 부품</span>
                <span className="text-green-900 font-bold">
                  {
                    Object.entries(predictionResult.part_detection).filter(
                      ([part, info]) =>
                        info.detected &&
                        !predictionResult.anomaly_detection.anomalies.some((a) => a.part === part)
                    ).length
                  }
                  개
                </span>
              </div>
              <Progress
                value={
                  (Object.entries(predictionResult.part_detection).filter(
                    ([part, info]) =>
                      info.detected &&
                      !predictionResult.anomaly_detection.anomalies.some((a) => a.part === part)
                  ).length /
                    totalDetected) *
                  100
                }
                className="h-2"
              />
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex justify-between text-slate-700 mb-2 text-sm">
                <span>주의 필요 부품</span>
                <span className="text-orange-900 font-bold">
                  {predictionResult.anomaly_detection.anomaly_count}개
                </span>
              </div>
              <Progress
                value={(predictionResult.anomaly_detection.anomaly_count / totalComponents) * 100}
                className="h-2"
              />
            </div>

            <div className="border-t-2 border-slate-200 pt-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded p-3">
                  <div className="text-slate-600 text-xs mb-1">최고 신뢰도</div>
                  <div className="text-slate-900 font-bold text-lg">
                    {Math.max(...Object.values(predictionResult.confidence_scores)).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <div className="text-slate-600 text-xs mb-1">최저 신뢰도</div>
                  <div className="text-slate-900 font-bold text-lg">
                    {Math.min(...Object.values(predictionResult.confidence_scores)).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex items-center justify-between text-slate-600 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
          </div>
          <div>모델: U-Net Segmentation</div>
        </div>
      </Card>
    </div>
  );
}
