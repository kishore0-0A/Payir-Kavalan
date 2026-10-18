
from pathlib import Path
import csv
from collections import Counter

from sklearn.model_selection import train_test_split

# Project paths
PROJECT_DIR = Path(r"D:\CropCareAI")
DATASET_DIR = PROJECT_DIR / "datasets" / "PlantVillage"
OUTPUT_DIR = PROJECT_DIR / "datasets" / "splits"
OUTPUT_FILE = OUTPUT_DIR / "tomato_split.csv"

RANDOM_SEED = 42
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def main():
    if not DATASET_DIR.is_dir():
        raise FileNotFoundError(
            f"Dataset directory not found: {DATASET_DIR}"
        )

    # Collect only tomato images.
    samples = []

    for class_dir in sorted(DATASET_DIR.iterdir()):
        if not class_dir.is_dir():
            continue

        if not class_dir.name.lower().startswith("tomato"):
            continue

        for image_path in sorted(class_dir.rglob("*")):
            if (
                image_path.is_file()
                and image_path.suffix.lower() in SUPPORTED_EXTENSIONS
            ):
                samples.append({
                    "filepath": image_path.relative_to(
                        DATASET_DIR
                    ).as_posix(),
                    "label": class_dir.name,
                })

    if not samples:
        raise RuntimeError(
            "No tomato images found. Check the dataset folder names."
        )

    labels = [sample["label"] for sample in samples]

    # 70% training, 30% temporary holdout.
    train_samples, remaining_samples = train_test_split(
        samples,
        test_size=0.30,
        random_state=RANDOM_SEED,
        stratify=labels,
    )

    # Split the remaining 30% into 15% validation and 15% test.
    remaining_labels = [
        sample["label"] for sample in remaining_samples
    ]

    val_samples, test_samples = train_test_split(
        remaining_samples,
        test_size=0.50,
        random_state=RANDOM_SEED,
        stratify=remaining_labels,
    )

    rows = []

    for split_name, split_samples in [
        ("train", train_samples),
        ("validation", val_samples),
        ("test", test_samples),
    ]:
        for sample in split_samples:
            rows.append({
                "filepath": sample["filepath"],
                "label": sample["label"],
                "split": split_name,
            })

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open(
        "w", newline="", encoding="utf-8"
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["filepath", "label", "split"],
        )
        writer.writeheader()
        writer.writerows(rows)

    print("\n===== CROPCARE AI: TOMATO SPLIT REPORT =====")
    print(f"Total tomato images: {len(samples)}")
    print(f"Number of classes: {len(set(labels))}")
    print(f"Training images: {len(train_samples)}")
    print(f"Validation images: {len(val_samples)}")
    print(f"Test images: {len(test_samples)}")

    print("\nImages per class:")
    for label, count in sorted(Counter(labels).items()):
        print(f"{label}: {count}")

    print(f"\nSplit manifest saved to:\n{OUTPUT_FILE}")
    print("Original dataset images were not moved or modified.")


if __name__ == "__main__":
    main()
