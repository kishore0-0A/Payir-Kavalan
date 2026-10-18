
from pathlib import Path
import csv
import json
import random
import time
from collections import Counter

import numpy as np
from PIL import Image, ImageFile

import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from torchvision.models import MobileNet_V3_Small_Weights


# ---------------- CONFIGURATION ----------------

PROJECT_DIR = Path(r"D:\CropCareAI")
DATASET_DIR = PROJECT_DIR / "datasets" / "PlantVillage"
SPLIT_FILE = PROJECT_DIR / "datasets" / "splits" / "tomato_split.csv"
MODEL_DIR = PROJECT_DIR / "models"
OUTPUT_DIR = PROJECT_DIR / "outputs"

MODEL_PATH = MODEL_DIR / "cropcare_tomato_best.pth"
HISTORY_PATH = OUTPUT_DIR / "training_history.json"

IMAGE_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 5
LEARNING_RATE = 0.0001
RANDOM_SEED = 42
NUM_WORKERS = 0  # Reliable default on Windows

ImageFile.LOAD_TRUNCATED_IMAGES = False


# ---------------- REPRODUCIBILITY ----------------

def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


# ---------------- DATASET ----------------

class TomatoDataset(Dataset):
    def __init__(self, rows, class_to_idx, transform=None):
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

        if self.transform:
            image = self.transform(image)

        label = self.class_to_idx[row["label"]]
        return image, label


def load_manifest():
    if not SPLIT_FILE.exists():
        raise FileNotFoundError(
            f"Split file not found: {SPLIT_FILE}"
        )

    with SPLIT_FILE.open(
        "r", newline="", encoding="utf-8"
    ) as file:
        rows = list(csv.DictReader(file))

    if not rows:
        raise ValueError("The split manifest is empty.")

    class_names = sorted({row["label"] for row in rows})
    class_to_idx = {
        name: index for index, name in enumerate(class_names)
    }

    splits = {
        name: [row for row in rows if row["split"] == name]
        for name in ("train", "validation", "test")
    }

    for split_name, split_rows in splits.items():
        if not split_rows:
            raise ValueError(
                f"No images found for split: {split_name}"
            )

    # Verify that every class appears in every split.
    for split_name, split_rows in splits.items():
        present = {row["label"] for row in split_rows}
        missing = set(class_names) - present

        if missing:
            raise ValueError(
                f"Classes missing from {split_name}: {sorted(missing)}"
            )

    # Verify there is no filepath overlap between splits.
    split_paths = {
        name: {row["filepath"] for row in split_rows}
        for name, split_rows in splits.items()
    }

    if (
        split_paths["train"] & split_paths["validation"]
        or split_paths["train"] & split_paths["test"]
        or split_paths["validation"] & split_paths["test"]
    ):
        raise ValueError("Image paths overlap between data splits.")

    # Verify all image paths exist before training.
    for row in rows:
        path = DATASET_DIR / row["filepath"]
        if not path.is_file():
            raise FileNotFoundError(f"Image not found: {path}")

    return splits, class_names, class_to_idx


# ---------------- TRANSFORMS ----------------

def create_transforms():
    normalize = transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    )

    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(
            IMAGE_SIZE, scale=(0.8, 1.0)
        ),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(
            brightness=0.15,
            contrast=0.15,
            saturation=0.10,
        ),
        transforms.ToTensor(),
        normalize,
    ])

    evaluation_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(IMAGE_SIZE),
        transforms.ToTensor(),
        normalize,
    ])

    return train_transform, evaluation_transform


# ---------------- MODEL ----------------

def build_model(number_of_classes):
    weights = MobileNet_V3_Small_Weights.DEFAULT

    model = models.mobilenet_v3_small(weights=weights)

    # Replace the final classification layer.
    input_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(
        input_features, number_of_classes
    )

    return model


# ---------------- VALIDATION ----------------

def evaluate(model, loader, criterion, device):
    model.eval()

    total_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)

            logits = model(images)
            loss = criterion(logits, labels)

            batch_size = labels.size(0)
            total_loss += loss.item() * batch_size

            predictions = logits.argmax(dim=1)
            correct += (predictions == labels).sum().item()
            total += batch_size

    return total_loss / total, correct / total


# ---------------- TRAINING ----------------

def main():
    set_seed(RANDOM_SEED)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    device = torch.device("cpu")
    print(f"Training device: {device}")

    splits, class_names, class_to_idx = load_manifest()

    print(f"Number of classes: {len(class_names)}")
    print(f"Training images: {len(splits['train'])}")
    print(f"Validation images: {len(splits['validation'])}")
    print(f"Test images reserved: {len(splits['test'])}")

    train_transform, evaluation_transform = create_transforms()

    train_dataset = TomatoDataset(
        splits["train"], class_to_idx, train_transform
    )
    validation_dataset = TomatoDataset(
        splits["validation"], class_to_idx, evaluation_transform
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
    )

    validation_loader = DataLoader(
        validation_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
    )

    model = build_model(len(class_names)).to(device)

    # Moderate class weighting helps address class imbalance.
    train_counts = Counter(
        row["label"] for row in splits["train"]
    )

    class_weights = torch.tensor(
        [
            (len(splits["train"]) / train_counts[name]) ** 0.5
            for name in class_names
        ],
        dtype=torch.float32,
    )

    class_weights = class_weights / class_weights.mean()

    criterion = nn.CrossEntropyLoss(
        weight=class_weights.to(device)
    )

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE,
        weight_decay=0.0001,
    )

    best_val_accuracy = -1.0
    history = []

    print("\nStarting training...\n")

    for epoch in range(EPOCHS):
        start_time = time.time()
        model.train()

        running_loss = 0.0
        correct = 0
        total = 0

        for batch_index, (images, labels) in enumerate(
            train_loader, start=1
        ):
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad(set_to_none=True)

            logits = model(images)
            loss = criterion(logits, labels)

            loss.backward()
            optimizer.step()

            batch_size = labels.size(0)
            running_loss += loss.item() * batch_size

            predictions = logits.argmax(dim=1)
            correct += (predictions == labels).sum().item()
            total += batch_size

            if batch_index % 50 == 0:
                print(
                    f"Epoch {epoch + 1}/{EPOCHS} | "
                    f"Batch {batch_index}/{len(train_loader)}"
                )

        train_loss = running_loss / total
        train_accuracy = correct / total

        val_loss, val_accuracy = evaluate(
            model,
            validation_loader,
            criterion,
            device,
        )

        epoch_seconds = time.time() - start_time

        result = {
            "epoch": epoch + 1,
            "train_loss": train_loss,
            "train_accuracy": train_accuracy,
            "validation_loss": val_loss,
            "validation_accuracy": val_accuracy,
            "seconds": epoch_seconds,
        }

        history.append(result)

        print(
            f"\nEpoch {epoch + 1}/{EPOCHS}\n"
            f"Train loss: {train_loss:.4f}\n"
            f"Train accuracy: {train_accuracy:.4f}\n"
            f"Validation loss: {val_loss:.4f}\n"
            f"Validation accuracy: {val_accuracy:.4f}\n"
            f"Time: {epoch_seconds / 60:.2f} minutes\n"
        )

        if val_accuracy > best_val_accuracy:
            best_val_accuracy = val_accuracy

            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "class_names": class_names,
                    "image_size": IMAGE_SIZE,
                    "architecture": "mobilenet_v3_small",
                    "normalization_mean": [0.485, 0.456, 0.406],
                    "normalization_std": [0.229, 0.224, 0.225],
                    "best_validation_accuracy": best_val_accuracy,
                    "epoch": epoch + 1,
                },
                MODEL_PATH,
            )

            print(f"Best model saved to: {MODEL_PATH}\n")

        with HISTORY_PATH.open(
            "w", encoding="utf-8"
        ) as file:
            json.dump(history, file, indent=2)

    print("Training complete.")
    print(f"Best validation accuracy: {best_val_accuracy:.4f}")
    print(f"Model checkpoint: {MODEL_PATH}")
    print(f"Training history: {HISTORY_PATH}")
    print("The test set has NOT been used for model selection.")


if __name__ == "__main__":
    main()
