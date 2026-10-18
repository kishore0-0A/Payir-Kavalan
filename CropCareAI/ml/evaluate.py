
from pathlib import Path
import csv
import json

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from PIL import Image
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms


PROJECT_DIR = Path(r"D:\CropCareAI")
DATASET_DIR = PROJECT_DIR / "datasets" / "PlantVillage"
SPLIT_FILE = PROJECT_DIR / "datasets" / "splits" / "tomato_split.csv"
MODEL_PATH = PROJECT_DIR / "models" / "cropcare_tomato_best.pth"
OUTPUT_DIR = PROJECT_DIR / "outputs"

BATCH_SIZE = 32
NUM_WORKERS = 0


class TomatoTestDataset(Dataset):
    def __init__(self, rows, class_to_idx, transform):
        self.rows = rows
        self.class_to_idx = class_to_idx
        self.transform = transform

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, index):
        row = self.rows[index]
        image_path = DATASET_DIR / row["filepath"]

        with Image.open(image_path) as image:
            image = image.convert("RGB")

        image = self.transform(image)
        label = self.class_to_idx[row["label"]]

        return image, label


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    if not SPLIT_FILE.is_file():
        raise FileNotFoundError(f"Split file not found: {SPLIT_FILE}")

    # Only load checkpoints you created and trust.
    checkpoint = torch.load(
        MODEL_PATH,
        map_location="cpu",
        weights_only=True,
    )

    class_names = checkpoint["class_names"]
    class_to_idx = {
        name: index for index, name in enumerate(class_names)
    }

    with SPLIT_FILE.open(
        "r", newline="", encoding="utf-8"
    ) as file:
        all_rows = list(csv.DictReader(file))

    test_rows = [
        row for row in all_rows if row["split"] == "test"
    ]

    if not test_rows:
        raise ValueError("No test images found in the split manifest.")

    test_paths = [row["filepath"] for row in test_rows]

    if len(test_paths) != len(set(test_paths)):
        raise ValueError("Duplicate file paths found in the test split.")

    for row in test_rows:
        if row["label"] not in class_to_idx:
            raise ValueError(f"Unknown class: {row['label']}")

        if not (DATASET_DIR / row["filepath"]).is_file():
            raise FileNotFoundError(row["filepath"])

    image_size = checkpoint["image_size"]

    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(image_size),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=checkpoint["normalization_mean"],
            std=checkpoint["normalization_std"],
        ),
    ])

    dataset = TomatoTestDataset(
        test_rows, class_to_idx, transform
    )

    loader = DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
    )

    model = models.mobilenet_v3_small(weights=None)
    input_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(
        input_features, len(class_names)
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    true_labels = []
    predicted_labels = []
    total_loss = 0.0
    criterion = nn.CrossEntropyLoss()

    with torch.inference_mode():
        for images, labels in loader:
            logits = model(images)
            loss = criterion(logits, labels)

            total_loss += loss.item() * labels.size(0)

            predictions = logits.argmax(dim=1)

            true_labels.extend(labels.tolist())
            predicted_labels.extend(predictions.tolist())

    test_loss = total_loss / len(dataset)
    test_accuracy = accuracy_score(
        true_labels, predicted_labels
    )

    report = classification_report(
        true_labels,
        predicted_labels,
        labels=list(range(len(class_names))),
        target_names=class_names,
        output_dict=True,
        zero_division=0,
    )

    print("\n===== CROPCARE AI: FINAL TEST RESULTS =====")
    print(f"Test images: {len(dataset)}")
    print(f"Test loss: {test_loss:.4f}")
    print(f"Test accuracy: {test_accuracy:.4%}")

    print("\nPer-class classification report:")
    print(
        classification_report(
            true_labels,
            predicted_labels,
            labels=list(range(len(class_names))),
            target_names=class_names,
            zero_division=0,
        )
    )

    results = {
        "architecture": checkpoint["architecture"],
        "test_images": len(dataset),
        "test_loss": test_loss,
        "test_accuracy": test_accuracy,
        "classification_report": report,
    }

    report_path = OUTPUT_DIR / "test_metrics.json"
    with report_path.open("w", encoding="utf-8") as file:
        json.dump(results, file, indent=2)

    matrix = confusion_matrix(
        true_labels,
        predicted_labels,
        labels=list(range(len(class_names))),
    )

    figure, axis = plt.subplots(figsize=(13, 11))

    display = ConfusionMatrixDisplay(
        confusion_matrix=matrix,
        display_labels=class_names,
    )

    display.plot(
        ax=axis,
        xticks_rotation=90,
        values_format="d",
        colorbar=False,
    )

    axis.set_title("CropCare AI — Tomato Test Confusion Matrix")
    figure.tight_layout()

    matrix_path = OUTPUT_DIR / "confusion_matrix.png"
    figure.savefig(matrix_path, dpi=180, bbox_inches="tight")
    plt.close(figure)

    print(f"\nMetrics saved to: {report_path}")
    print(f"Confusion matrix saved to: {matrix_path}")


if __name__ == "__main__":
    main()
