// API Base URL - 환경에 따라 변경
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PredictionResult {
  success: boolean;
  original_image: string;
  colored_mask: string;
  overlay_image: string;
  class_distribution: {
    [key: string]: {
      pixels: number;
      percentage: number;
      color: string;
    };
  };
  part_detection: {
    [key: string]: {
      detected: boolean;
      pixel_count: number;
      coverage_percent: number;
    };
  };
  confidence_scores: {
    [key: string]: number;
  };
  anomaly_detection: {
    has_anomaly: boolean;
    status: string;
    anomalies: Array<{
      type: string;
      severity: string;
      part: string;
      message: string;
    }>;
    anomaly_count: number;
  };
  overall_confidence: {
    score: number;
    detection_rate: number;
    avg_part_confidence: number;
    detected_parts: string[];
    total_parts: number;
  };
  prediction_stats: {
    total_pixels: number;
    image_size: {
      width: number;
      height: number;
    };
    num_classes_detected: number;
    overlay_alpha?: number;
  };
  metrics?: {
    iou_per_class: { [key: string]: number };
    dice_per_class: { [key: string]: number };
    overall_iou: number;
    overall_dice: number;
    pixel_accuracy: number;
  };
}

export interface ModelInfo {
  model_architecture: {
    name: string;
    encoder: string;
    encoder_weights: string;
    input_size: number[];
    output_classes: number;
    parameters: {
      total: string;
      trainable: string;
    };
  };
  training_info: {
    epochs_trained: number;
    best_epoch: number;
    early_stopping: boolean;
    optimizer: string;
    initial_lr: number;
    lr_scheduler: string;
    loss_function: string;
    dataset_size?: number;
  };
  performance_metrics: {
    all_classes: {
      mIoU: number;
      mDice: number;
      pixel_accuracy: number;
      fwIoU: number;
      precision: number;
      recall: number;
      f1_score: number;
    };
    drone_only: {
      mIoU: number;
      mDice: number;
      precision: number;
      recall: number;
      f1_score: number;
      note: string;
    };
    iou_per_class: {
      [key: string]: number;
    };
    dice_per_class: {
      [key: string]: number;
    };
  };
  confusion_matrix: number[][];
  deployment_info: {
    framework: string;
    version: string;
    model_version: string;
    last_updated: string;
    device: string;
  };
  benchmark_comparison: {
    [key: string]: {
      mIoU: number;
      inference_time_ms: number;
      parameters_m: number;
    };
  };
}

export interface TrainingHistory {
  epoch: number[];
  train_loss: number[];
  val_loss: number[];
  train_iou: number[];
  val_iou: number[];
  mIoU: number[];
  mDice: number[];
  PixelAcc: number[];
  FWIoU: number[];
  lr: number[];
  timestamp: number[];
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async predict(imageFile: File, gtMask?: File): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append('file', imageFile);
    if (gtMask) {
      formData.append('gt_mask', gtMask);
    }

    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Prediction failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getModelInfo(): Promise<ModelInfo> {
    const response = await fetch(`${this.baseUrl}/model/info`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch model info: ${response.statusText}`);
    }

    return response.json();
  }

  async getTrainingHistory(): Promise<TrainingHistory> {
    const response = await fetch(`${this.baseUrl}/model/history`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch training history: ${response.statusText}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
