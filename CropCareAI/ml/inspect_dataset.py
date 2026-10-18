
from pathlib import Path
from collections import Counter
from PIL import Image

# Update this path after extracting PlantVillage.
DATASET_DIR = Path(r"D:\CropCareAI\datasets\PlantVillage")

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def inspect_dataset():
    if not DATASET_DIR.exists():
        print(f"Dataset folder not found:\n{DATASET_DIR}")
        print("Download and extract PlantVillage, then update DATASET_DIR.")
        return

    class_counts = Counter()
    corrupted_images = []
    total_images = 0

    for image_path in DATASET_DIR.rglob("*"):
        if not image_path.is_file():
            continue

        if image_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        # The parent folder is expected to be the class label.
        class_name = image_path.parent.name

        try:
            with Image.open(image_path) as image:
                image.verify()

            class_counts[class_name] += 1
            total_images += 1

        except Exception:
            corrupted_images.append(str(image_path))

    print("\n===== CROPCARE AI: DATASET REPORT =====")
    print(f"Dataset path: {DATASET_DIR}")
    print(f"Total valid images: {total_images}")
    print(f"Number of classes: {len(class_counts)}")

    print("\nImages per class:")
    for class_name, count in sorted(class_counts.items()):
        print(f"{class_name}: {count}")

    print(f"\nCorrupted images: {len(corrupted_images)}")

    if corrupted_images:
        print("\nFirst few corrupted files:")
        for path in corrupted_images[:10]:
            print(path)

    if total_images == 0:
        print("\nNo images found. Check your dataset folder structure.")


if __name__ == "__main__":
    inspect_dataset()
