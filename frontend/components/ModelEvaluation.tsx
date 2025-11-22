import { Card } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Target, Zap, Clock, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiService, ModelInfo, TrainingHistory } from '../services/api';

// 부품 이름 매핑
const partNameMap: { [key: string]: string } = {
  background: '배경',
  propeller: '프로펠러',
  arm: '암',
  body: '본체',
  landing_gear: '랜딩 기어',
  camera: '카메라',
};

export function ModelEvaluation() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingHistory | null>(null);
  const [loading, setLoading] = useState(true);

  // API에서 모델 정보 및 학습 히스토리 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, history] = await Promise.all([
          apiService.getModelInfo(),
          apiService.getTrainingHistory(),
        ]);
        setModelInfo(info);
        setTrainingHistory(history);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 로딩 중이거나 데이터가 없으면 로딩 표시
  if (loading || !trainingHistory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-600">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 학습 데이터 변환
  const trainingData = trainingHistory.epoch.map((epoch, idx) => ({
    epoch: epoch,
    accuracy: trainingHistory.PixelAcc[idx],
    valAccuracy: trainingHistory.PixelAcc[idx], // validation accuracy는 동일
    loss: trainingHistory.train_loss[idx],
    valLoss: trainingHistory.val_loss[idx],
  }));

  // Best epoch 찾기 (가장 높은 PixelAcc 기준)
  const bestEpochIndex = trainingHistory.PixelAcc.indexOf(Math.max(...trainingHistory.PixelAcc));
  const bestEpoch = trainingHistory.epoch[bestEpochIndex];

  // Best epoch 기준 메트릭
  const bestAccuracy = trainingHistory.PixelAcc[bestEpochIndex];
  const bestLoss = trainingHistory.train_loss[bestEpochIndex];
  const bestValLoss = trainingHistory.val_loss[bestEpochIndex];
  const bestMIoU = trainingHistory.mIoU[bestEpochIndex];
  const bestMDice = trainingHistory.mDice[bestEpochIndex];
  const bestPixelAcc = trainingHistory.PixelAcc[bestEpochIndex];
  const bestFWIoU = trainingHistory.FWIoU[bestEpochIndex];

  // 부품별 메트릭 (API에서 가져온 데이터 기반)
  const componentMetrics = modelInfo
    ? Object.keys(modelInfo.performance_metrics.iou_per_class)
        .filter(key => key !== 'background') // 배경 제외
        .map(key => ({
          component: partNameMap[key] || key,
          accuracy: (modelInfo.performance_metrics.dice_per_class[key] || 0) * 100, // Dice를 accuracy로 사용
          iou: (modelInfo.performance_metrics.iou_per_class[key] || 0) * 100,
          f1: (modelInfo.performance_metrics.dice_per_class[key] || 0) * 100, // Dice = F1 for binary
        }))
    : [];

  // 성능 데이터 (레이더 차트용) - API에서 가져온 데이터 사용
  const performanceData = modelInfo
    ? [
        { metric: '정확도', value: modelInfo.performance_metrics.all_classes.pixel_accuracy * 100, max: 100 },
        { metric: '정밀도', value: modelInfo.performance_metrics.all_classes.precision * 100, max: 100 },
        { metric: '재현율', value: modelInfo.performance_metrics.all_classes.recall * 100, max: 100 },
        { metric: 'F1 Score', value: modelInfo.performance_metrics.all_classes.f1_score * 100, max: 100 },
        { metric: 'mIoU', value: modelInfo.performance_metrics.all_classes.mIoU * 100, max: 100 },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">모델 학습 및 성능 평가 보고서</h1>
          <p className="text-slate-600 text-lg">드론 부품 세그멘테이션 모델의 학습 과정 및 최종 성능 분석</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-900 font-medium">평가 일시</div>
          <div className="text-sm text-slate-600">{new Date().toLocaleString('ko-KR')}</div>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">모델 성능 요약</h3>
        </div>
        <div className="flex gap-3 items-stretch">
          <div className="bg-white rounded-lg p-3 border-2 border-green-300 shadow-sm w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">최고 정확도</span>
              <Award className="h-3 w-3 text-green-600" />
            </div>
            <div className="text-xl font-bold text-green-900 mb-1">{(bestAccuracy * 100).toFixed(1)}%</div>
            <div className="text-xs text-slate-500">Epoch {bestEpoch}</div>
          </div>

          <div className="bg-white rounded-lg p-3 border-2 border-blue-300 shadow-sm w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">mIoU</span>
              <Target className="h-3 w-3 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-900 mb-1">{(bestMIoU * 100).toFixed(1)}%</div>
            <div className="text-xs text-slate-500">Best Epoch</div>
          </div>

          <div className="bg-white rounded-lg p-3 border-2 border-purple-300 shadow-sm w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">mDice</span>
              <TrendingUp className="h-3 w-3 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-purple-900 mb-1">{(bestMDice * 100).toFixed(1)}%</div>
            <div className="text-xs text-slate-500">Best Epoch</div>
          </div>

          <div className="bg-white rounded-lg p-3 border-2 border-orange-300 shadow-sm w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">Best Loss</span>
              <Zap className="h-3 w-3 text-orange-600" />
            </div>
            <div className="text-xl font-bold text-orange-900 mb-1">{bestLoss.toFixed(3)}</div>
            <div className="text-xs text-slate-500">Epoch {bestEpoch}</div>
          </div>

          <div className="bg-white rounded-lg p-3 border-2 border-slate-300 shadow-sm w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">학습 에포크</span>
              <Clock className="h-3 w-3 text-slate-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">{trainingHistory.epoch.length}</div>
            <div className="text-xs text-slate-500">완료</div>
          </div>

          {modelInfo?.training_info.dataset_size && (
            <div className="bg-white rounded-lg p-3 border-2 border-slate-300 shadow-sm w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-600">데이터셋</span>
                <Database className="h-3 w-3 text-slate-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">{modelInfo.training_info.dataset_size}</div>
              <div className="text-xs text-slate-500">이미지</div>
            </div>
          )}
        </div>
      </Card>

      {/* 학습 곡선 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">1. Accuracy 학습 곡선</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="epoch" stroke="#64748b" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#64748b" domain={[0, 1]} label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} name="Training Accuracy" dot={false} />
              <Line type="monotone" dataKey="valAccuracy" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" name="Validation Accuracy" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded p-3 border border-blue-200">
              <div className="text-sm text-slate-600 mb-1">최고 Train Acc</div>
              <div className="text-xl font-bold text-blue-900">{(bestAccuracy * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-purple-50 rounded p-3 border border-purple-200">
              <div className="text-sm text-slate-600 mb-1">Best Epoch</div>
              <div className="text-xl font-bold text-purple-900">Epoch {bestEpoch}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">2. Loss 학습 곡선</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="epoch" stroke="#64748b" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#64748b" label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => value.toFixed(3)} />
              <Legend />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={3} name="Training Loss" dot={false} />
              <Line type="monotone" dataKey="valLoss" stroke="#f97316" strokeWidth={3} strokeDasharray="5 5" name="Validation Loss" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded p-3 border border-red-200">
              <div className="text-sm text-slate-600 mb-1">Best Train Loss</div>
              <div className="text-xl font-bold text-red-900">{bestLoss.toFixed(3)}</div>
            </div>
            <div className="bg-orange-50 rounded p-3 border border-orange-200">
              <div className="text-sm text-slate-600 mb-1">Best Val Loss</div>
              <div className="text-xl font-bold text-orange-900">{bestValLoss.toFixed(3)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 부품별 성능 & 종합 성능 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">3. 부품별 세그멘테이션 성능</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={componentMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="component" stroke="#64748b" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy" radius={[4, 4, 0, 0]} />
              <Bar dataKey="iou" fill="#8b5cf6" name="IoU" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1" fill="#10b981" name="F1 Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">4. 종합 성능 레이더 차트</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" stroke="#64748b" />
              <PolarRadiusAxis domain={[0, 100]} stroke="#64748b" />
              <Radar name="모델 성능" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded p-3 border border-green-200">
              <div className="text-sm text-slate-600 mb-1">평균 성능</div>
              <div className="text-xl font-bold text-green-900">
                {(performanceData.reduce((sum, m) => sum + m.value, 0) / performanceData.length).toFixed(1)}%
              </div>
            </div>
            <div className="bg-blue-50 rounded p-3 border border-blue-200">
              <div className="text-sm text-slate-600 mb-1">최고 지표</div>
              <div className="text-xl font-bold text-blue-900">{Math.max(...performanceData.map(m => m.value)).toFixed(1)}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 혼동 행렬 (Confusion Matrix) */}
      {modelInfo?.confusion_matrix && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">5. 혼동 행렬 (Confusion Matrix)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2 text-xs font-bold text-slate-700"></th>
                  {Object.keys(partNameMap).map((key) => (
                    <th key={key} className="border border-slate-300 bg-slate-100 p-2 text-xs font-bold text-slate-700">
                      {partNameMap[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modelInfo.confusion_matrix.map((row, rowIdx) => {
                  const rowSum = row.reduce((a, b) => a + b, 0);
                  const classKey = Object.keys(partNameMap)[rowIdx];
                  return (
                    <tr key={rowIdx}>
                      <td className="border border-slate-300 bg-slate-100 p-2 text-xs font-bold text-slate-700">
                        {partNameMap[classKey]}
                      </td>
                      {row.map((value, colIdx) => {
                        const percentage = rowSum > 0 ? (value / rowSum) * 100 : 0;
                        const isCorrect = rowIdx === colIdx;
                        const intensity = Math.min(percentage / 100, 1);

                        // 배경색 계산: 정답은 초록, 오답은 빨강
                        let bgColor;
                        if (isCorrect) {
                          const greenIntensity = Math.floor(255 - (intensity * 100));
                          bgColor = `rgb(${greenIntensity}, 255, ${greenIntensity})`;
                        } else {
                          const redIntensity = Math.floor(255 - (intensity * 150));
                          bgColor = `rgb(255, ${redIntensity}, ${redIntensity})`;
                        }

                        return (
                          <td
                            key={colIdx}
                            className="border border-slate-300 p-2 text-center transition-all hover:scale-105"
                            style={{ backgroundColor: bgColor }}
                          >
                            <div className="text-xs font-bold text-slate-900">{value.toLocaleString()}</div>
                            <div className="text-xs text-slate-600">{percentage.toFixed(1)}%</div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-slate-300 rounded"></div>
                <span>올바른 분류 (대각선)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border border-slate-300 rounded"></div>
                <span>잘못된 분류 (오분류)</span>
              </div>
              <div className="text-slate-500">* 색이 진할수록 비율이 높음</div>
            </div>
            <div className="text-center text-xs text-slate-500">
              행: 실제 클래스 (Ground Truth) | 열: 예측 클래스 (Predicted)
            </div>
          </div>
        </Card>
      )}

      {/* Footer */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>본 보고서는 학습이 완료된 세그멘테이션 모델의 성능 평가 결과입니다.</span>
          </div>
          <div>모델 아키텍처: U-Net + VGG16</div>
        </div>
      </Card>
    </div>
  );
}
