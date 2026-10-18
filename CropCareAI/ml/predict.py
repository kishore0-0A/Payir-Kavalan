
from pathlib import Path
import argparse

import torch
import torch.nn.functional as F
from PIL import Image, UnidentifiedImageError
from torchvision import models, transforms
from validate_image import validate_image

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "models" / "cropcare_tomato_best.pth"

DEVICE = torch.device("cpu")


def load_model():
    """Load the trained CropCare AI tomato classifier."""

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model checkpoint not found: {MODEL_PATH}\n"
            "Train the model first using: python .\\ml\\train.py"
        )

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE,
        weights_only=True,
    )

    class_names = checkpoint["class_names"]
    image_size = checkpoint.get("image_size", 224)

    # Re-create the same model architecture used during training.
    model = models.mobilenet_v3_small(weights=None)

    input_features = model.classifier[3].in_features
    model.classifier[3] = torch.nn.Linear(
        input_features,
        len(class_names),
    )

    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()

    # Use the same normalization as training.
    mean = checkpoint.get(
        "mean", [0.485, 0.456, 0.406]
    )
    std = checkpoint.get(
        "std", [0.229, 0.224, 0.225]
    )

    image_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(image_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])

    return model, class_names, image_transform


def predict_image(image_path, model, class_names, image_transform):
    """Predict the three most likely classes for a leaf image."""

    image_path = Path(image_path)

    if not image_path.exists() or not image_path.is_file():
        raise FileNotFoundError(
            f"Image file not found: {image_path}"
        )

    try:
        with Image.open(image_path) as original:
            image = original.convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError(
            "The selected file is not a readable image."
        ) from exc

    image_tensor = image_transform(image).unsqueeze(0).to(DEVICE)

    with torch.inference_mode():
        logits = model(image_tensor)
        probabilities = F.softmax(logits, dim=1)[0]

    top_count = min(3, len(class_names))
    top_probabilities, top_indices = torch.topk(
        probabilities, top_count
    )

    results = []

    for probability, index in zip(
        top_probabilities.tolist(),
        top_indices.tolist(),
    ):
        results.append({
            "class_name": class_names[index],
            "confidence": probability * 100,
        })

    return results



def main():
    parser = argparse.ArgumentParser(
        description="CropCare AI tomato leaf disease prediction"
    )
    parser.add_argument(
        "image",
        help="Path to the tomato leaf image",
    )
    args = parser.parse_args()

    try:
        # STEP 1: Validate image quality before prediction.
        print("\nChecking image quality...")

        quality = validate_image(args.image)

        print(f"Image dimensions: {quality['width']} x {quality['height']}")
        print(f"Brightness: {quality['brightness']:.2f} / 255")
        print(f"Blur score: {quality['blur_score']:.2f}")

        if not quality["passed"]:
            print("\nIMAGE QUALITY NEEDS REVIEW")

            for issue in quality["issues"]:
                print(f"- {issue}")

            print("\nSuggestions:")
            for suggestion in quality["suggestions"]:
                print(f"- {suggestion}")

            print(
                "\nPrediction stopped. Please upload a clearer "
                "image and try again."
            )
            raise SystemExit(2)

        print("Image quality check passed.")

        # STEP 2: Load the trained classifier.
        model, class_names, image_transform = load_model()

        # STEP 3: Predict the leaf class.
        results = predict_image(
            args.image,
            model,
            class_names,
            image_transform,
        )

        print("\n" + "=" * 55)
        print("       CROPCARE AI - TOMATO LEAF ANALYSIS")
        print("=" * 55)

        print(f"\nImage: {Path(args.image).resolve()}")
        print(f"Recognized classes: {len(class_names)}")
        print("\nTOP PREDICTIONS")
        print("-" * 55)

        for rank, result in enumerate(results, start=1):
            label = result["class_name"]
            confidence = result["confidence"]

            display_name = (
                "Tomato - Healthy"
                if label == "Tomato_healthy"
                else label.replace("_", " ")
            )

            print(
                f"{rank}. {display_name}\n"
                f"   Model confidence: {confidence:.2f}%"
            )

        best = results[0]

        print("\n" + "-" * 55)
        print(f"Predicted class: {best['class_name']}")
        print(f"Top prediction score: {best['confidence']:.2f}%")

        if best["confidence"] < 70:
            print(
                "\nCAUTION: The model is uncertain. "
                "Try another clear image or seek expert review."
            )
        else:
            print(
                "\nNote: This is an AI prediction, not a confirmed "
                "field diagnosis. Verify before treatment."
            )

        print("=" * 55 + "\n")

    except (FileNotFoundError, ValueError) as exc:
        print(f"\nERROR: {exc}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
