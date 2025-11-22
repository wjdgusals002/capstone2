
import numpy as np
import torch
import torch.nn.functional as F

def calculate_iou(pred_mask: np.ndarray, gt_mask: np.ndarray = None, num_classes: int = 6) -> dict:
    """
    IoU (Intersection over Union) 계산
    
    Args:
        pred_mask: 예측 마스크 (H, W)
        gt_mask: Ground Truth 마스크 (H, W) - 없으면 예측 결과만 반환
        num_classes: 클래스 수
    
    Returns:
        dict: 클래스별 IoU 점수
    """
    if gt_mask is None:
        # GT가 없으면 클래스별 픽셀 분포만 반환
        return None
    
    ious = {}
    
    for cls in range(num_classes):
        pred_cls = (pred_mask == cls)
        gt_cls = (gt_mask == cls)
        
        intersection = np.logical_and(pred_cls, gt_cls).sum()
        union = np.logical_or(pred_cls, gt_cls).sum()
        
        if union == 0:
            iou = 0.0
        else:
            iou = intersection / union
        
        ious[cls] = float(iou)
    
    # 평균 IoU (mIoU)
    ious['mean'] = np.mean([v for v in ious.values()])
    
    return ious


def calculate_dice(pred_mask: np.ndarray, gt_mask: np.ndarray = None, num_classes: int = 6) -> dict:
    """
    Dice Coefficient 계산
    
    Args:
        pred_mask: 예측 마스크 (H, W)
        gt_mask: Ground Truth 마스크 (H, W)
        num_classes: 클래스 수
    
    Returns:
        dict: 클래스별 Dice 점수
    """
    if gt_mask is None:
        return None
    
    dices = {}
    
    for cls in range(num_classes):
        pred_cls = (pred_mask == cls)
        gt_cls = (gt_mask == cls)
        
        intersection = np.logical_and(pred_cls, gt_cls).sum()
        
        dice = (2.0 * intersection) / (pred_cls.sum() + gt_cls.sum() + 1e-8)
        dices[cls] = float(dice)
    
    # 평균 Dice
    dices['mean'] = np.mean([v for v in dices.values()])
    
    return dices


def calculate_pixel_accuracy(pred_mask: np.ndarray, gt_mask: np.ndarray = None) -> float:
    """
    Pixel Accuracy 계산
    
    Args:
        pred_mask: 예측 마스크 (H, W)
        gt_mask: Ground Truth 마스크 (H, W)
    
    Returns:
        float: Pixel Accuracy (0-1)
    """
    if gt_mask is None:
        return None
    
    correct = (pred_mask == gt_mask).sum()
    total = pred_mask.size
    
    return float(correct / total)


def calculate_class_accuracy(pred_mask: np.ndarray, gt_mask: np.ndarray = None, num_classes: int = 6) -> dict:
    """
    클래스별 정확도 계산
    
    Args:
        pred_mask: 예측 마스크 (H, W)
        gt_mask: Ground Truth 마스크 (H, W)
        num_classes: 클래스 수
    
    Returns:
        dict: 클래스별 정확도
    """
    if gt_mask is None:
        return None
    
    class_acc = {}
    
    for cls in range(num_classes):
        gt_cls = (gt_mask == cls)
        
        if gt_cls.sum() == 0:
            class_acc[cls] = None
            continue
        
        correct = np.logical_and(pred_mask == cls, gt_cls).sum()
        total = gt_cls.sum()
        
        class_acc[cls] = float(correct / total)
    
    return class_acc


def calculate_precision_recall(pred_mask: np.ndarray, gt_mask: np.ndarray = None, num_classes: int = 6) -> dict:
    """
    클래스별 Precision과 Recall 계산
    
    Args:
        pred_mask: 예측 마스크 (H, W)
        gt_mask: Ground Truth 마스크 (H, W)
        num_classes: 클래스 수
    
    Returns:
        dict: 클래스별 precision과 recall
    """
    if gt_mask is None:
        return None
    
    metrics = {}
    
    for cls in range(num_classes):
        pred_cls = (pred_mask == cls)
        gt_cls = (gt_mask == cls)
        
        tp = np.logical_and(pred_cls, gt_cls).sum()
        fp = np.logical_and(pred_cls, ~gt_cls).sum()
        fn = np.logical_and(~pred_cls, gt_cls).sum()
        
        precision = tp / (tp + fp + 1e-8)
        recall = tp / (tp + fn + 1e-8)
        f1 = 2 * (precision * recall) / (precision + recall + 1e-8)
        
        metrics[cls] = {
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1)
        }
    
    return metrics


def calculate_confusion_matrix(pred_mask: np.ndarray, gt_mask: np.ndarray = None, num_classes: int = 6) -> np.ndarray:
    """
    혼동 행렬(Confusion Matrix) 계산
    
    Args:
        pred_mask: 예측 마스크 (H, W)
        gt_mask: Ground Truth 마스크 (H, W)
        num_classes: 클래스 수
    
    Returns:
        np.ndarray: 혼동 행렬 (num_classes, num_classes)
    """
    if gt_mask is None:
        return None
    
    conf_matrix = np.zeros((num_classes, num_classes), dtype=np.int64)
    
    for true_cls in range(num_classes):
        for pred_cls in range(num_classes):
            conf_matrix[true_cls, pred_cls] = np.logical_and(
                gt_mask == true_cls,
                pred_mask == pred_cls
            ).sum()
    
    return conf_matrix


def calculate_all_metrics(pred_mask: np.ndarray, gt_mask: np.ndarray = None, num_classes: int = 6) -> dict:
    """
    모든 평가 지표를 한 번에 계산
    
    Args:
        pred_mask: 예측 마스크 (H, W)
        gt_mask: Ground Truth 마스크 (H, W)
        num_classes: 클래스 수
    
    Returns:
        dict: 모든 평가 지표
    """
    if gt_mask is None:
        return {
            'has_ground_truth': False,
            'message': 'Ground Truth가 없어 평가 지표를 계산할 수 없습니다.'
        }
    
    return {
        'has_ground_truth': True,
        'iou': calculate_iou(pred_mask, gt_mask, num_classes),
        'dice': calculate_dice(pred_mask, gt_mask, num_classes),
        'pixel_accuracy': calculate_pixel_accuracy(pred_mask, gt_mask),
        'class_accuracy': calculate_class_accuracy(pred_mask, gt_mask, num_classes),
        'precision_recall': calculate_precision_recall(pred_mask, gt_mask, num_classes),
        'confusion_matrix': calculate_confusion_matrix(pred_mask, gt_mask, num_classes).tolist()
    }