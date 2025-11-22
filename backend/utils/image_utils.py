
import numpy as np
from PIL import Image
import cv2


def create_overlay(original_image: np.ndarray, colored_mask: np.ndarray, alpha: float = 0.5) -> np.ndarray:
    
    if original_image.shape != colored_mask.shape:
        raise ValueError(f"Image shape {original_image.shape} != Mask shape {colored_mask.shape}")

    mask_bool = np.any(colored_mask != 0, axis=2)

    overlay = original_image.copy()
    overlay[mask_bool] = cv2.addWeighted(
        original_image[mask_bool],
        1 - alpha,
        colored_mask[mask_bool],
        alpha,
        0
    )

    return overlay


def create_side_by_side(
    original_image: np.ndarray,
    colored_mask: np.ndarray,
    overlay_image: np.ndarray = None,
    labels: list = None
) -> np.ndarray:
    if overlay_image is None:
        overlay_image = create_overlay(original_image, colored_mask)

    combined = np.hstack([original_image, colored_mask, overlay_image])

    if labels:
        h, w = original_image.shape[:2]
        combined_with_labels = combined.copy()

        positions = [w // 2, w + w // 2, 2 * w + w // 2]
        for i, (label, x_pos) in enumerate(zip(labels, positions)):
            cv2.putText(
                combined_with_labels,
                label,
                (x_pos - len(label) * 10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.0,
                (255, 255, 255),
                2,
                cv2.LINE_AA
            )

        return combined_with_labels

    return combined


def apply_colormap(mask: np.ndarray, colormap: dict) -> np.ndarray:
    h, w = mask.shape
    colored_mask = np.zeros((h, w, 3), dtype=np.uint8)

    for class_id, color in colormap.items():
        colored_mask[mask == class_id] = color

    return colored_mask


def blend_images(img1: np.ndarray, img2: np.ndarray, alpha: float = 0.5) -> np.ndarray:
    
    return cv2.addWeighted(img1, alpha, img2, 1 - alpha, 0)
