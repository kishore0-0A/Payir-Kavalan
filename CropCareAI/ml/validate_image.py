
from pathlib import Path
import argparse

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError


def calculate_blur_score(gray_image):
    """
    Estimate sharpness using the variance of the Laplacian.

    Lower scores often indicate blur. The score depends on image
    resolution, resizing and image content, so it is only a heuristic.
    """

    pixels = np.asarray(gray_image, dtype=np.float32)

    # Discrete Laplacian: neighboring pixels compared with center.
    laplacian = (
        pixels[:-2, 1:-1]
        + pixels[2:, 1:-1]
        + pixels[1:-1, :-2]
        + pixels[1:-1, 2:]
        - 4 * pixels[1:-1, 1:-1]
    )

    return float(np.var(laplacian))


def validate_image(image_path):
    """Check image readability, dimensions, brightness and sharpness."""

    image_path = Path(image_path)

    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    try:
        with Image.open(image_path) as source:
            source.verify()

        with Image.open(image_path) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")

    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError(
            "The selected file is not a valid, readable image."
        ) from exc

    width, height = image.size
    gray_image = ImageOps.grayscale(image)
    gray_pixels = np.asarray(gray_image, dtype=np.float32)

    brightness = float(np.mean(gray_pixels))
    blur_score = calculate_blur_score(gray_pixels)

    issues = []
    suggestions = []

    # These are initial heuristics, not medically or scientifically
    # validated cutoffs. Test and tune them using representative images.
    if width < 128 or height < 128:
        issues.append("Image resolution is too low.")
        suggestions.append(
            "Upload a larger, clearer image of the leaf."
        )

    if brightness < 40:
        issues.append("Image may be too dark.")
        suggestions.append(
            "Take the photo in brighter, even lighting."
        )
    elif brightness > 220:
        issues.append("Image may be overexposed.")
        suggestions.append(
            "Avoid harsh direct light and reduce glare."
        )

    if blur_score < 60:
        issues.append("Image may be blurry.")
        suggestions.append(
            "Hold the camera steady and focus on the leaf."
        )

    passed = len(issues) == 0

    return {
        "path": image_path.resolve(),
        "width": width,
        "height": height,
        "brightness": brightness,
        "blur_score": blur_score,
        "passed": passed,
        "issues": issues,
        "suggestions": suggestions,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Check image quality before CropCare AI prediction."
    )
    parser.add_argument(
        "image",
        help="Path to the image to validate",
    )
    args = parser.parse_args()

    try:
        result = validate_image(args.image)
    except (FileNotFoundError, ValueError) as exc:
        print(f"\nERROR: {exc}")
        raise SystemExit(1)

    print("\n" + "=" * 55)
    print("       CROPCARE AI - IMAGE QUALITY CHECK")
    print("=" * 55)
    print(f"Image: {result['path']}")
    print(
        f"Dimensions: {result['width']} x {result['height']} pixels"
    )
    print(f"Average brightness: {result['brightness']:.2f} / 255")
    print(f"Blur score: {result['blur_score']:.2f}")

    if result["passed"]:
        print("\nQuality check: PASSED")
        print("No obvious quality issue was detected.")
    else:
        print("\nQuality check: REVIEW RECOMMENDED")
        for issue in result["issues"]:
            print(f"- {issue}")

        print("\nSuggestions:")
        for suggestion in result["suggestions"]:
            print(f"- {suggestion}")

    print("\nNote: Image quality checks cannot confirm that")
    print("the image contains a tomato leaf.")
    print("=" * 55 + "\n")


if __name__ == "__main__":
    main()
