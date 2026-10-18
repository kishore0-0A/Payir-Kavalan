
from pathlib import Path
import argparse

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, ImageFilter, UnidentifiedImageError
from torchvision import models, transforms


# --------------------------------------------------
# CropCare AI - Grad-CAM visualization
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "models" / "cropcare_tomato_best.pth"
OUTPUT_DIR = PROJECT_ROOT / "outputs"
DEVICE = torch.device("cpu")


def load_model():
    """Load the trained tomato disease classification model."""

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model checkpoint not found: {MODEL_PATH}"
        )

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE,
        weights_only=True,
    )

    class_names = checkpoint["class_names"]
    image_size = checkpoint.get("image_size", 224)

    model = models.mobilenet_v3_small(weights=None)

    input_features = model.classifier[3].in_features
    model.classifier[3] = torch.nn.Linear(
        input_features, len(class_names)
    )

    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()

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

    return model, class_names, image_transform, image_size


def generate_gradcam(model, image_tensor, target_class=None):
    """Generate a Grad-CAM heatmap for the selected class."""

    activations = {}
    gradients = {}

    # Last feature block of MobileNetV3-Small.
    target_layer = model.features[-1]

    def forward_hook(module, inputs, output):
        activations["value"] = output

        # Capture gradients flowing back through this activation.
        output.register_hook(
            lambda grad: gradients.update({"value": grad})
        )

    hook_handle = target_layer.register_forward_hook(forward_hook)

    try:
        model.zero_grad(set_to_none=True)

        # Gradients are required for Grad-CAM.
        with torch.enable_grad():
            logits = model(image_tensor)

            probabilities = torch.softmax(logits, dim=1)

            if target_class is None:
                target_class = int(
                    torch.argmax(probabilities, dim=1).item()
                )

            score = logits[0, target_class]
            score.backward()

        feature_maps = activations["value"].detach()
        feature_gradients = gradients["value"].detach()

        # Weight each feature map by its average gradient.
        weights = feature_gradients.mean(
            dim=(2, 3), keepdim=True
        )

        cam = (weights * feature_maps).sum(dim=1)
        cam = F.relu(cam)

        # Normalize the heatmap to the range 0 to 1.
        cam = cam[0]
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)

        return (
            cam.cpu().numpy(),
            probabilities[0].detach().cpu().numpy(),
            target_class,
        )

    finally:
        hook_handle.remove()


def save_visualization(image_path, model, class_names,
                       image_transform, image_size, output_path):
    """Create and save the Grad-CAM overlay."""

    image_path = Path(image_path)

    if not image_path.is_file():
        raise FileNotFoundError(
            f"Image file not found: {image_path}"
        )

    try:
        with Image.open(image_path) as source:
            original_image = source.convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError(
            "The selected file is not a readable image."
        ) from exc

    # The model uses a center-cropped 224x224 image.
    model_image = transforms.Resize(256)(original_image)
    model_image = transforms.CenterCrop(image_size)(model_image)

    image_tensor = image_transform(
        original_image
    ).unsqueeze(0).to(DEVICE)

    heatmap, probabilities, predicted_class = generate_gradcam(
        model, image_tensor
    )

    predicted_name = class_names[predicted_class]
    confidence = float(probabilities[predicted_class]) * 100

    # Resize the heatmap to the exact image fed to the model.
    heatmap_image = Image.fromarray(
        np.uint8(heatmap * 255)
    ).resize((image_size, image_size), Image.Resampling.BILINEAR)

    # Apply a color map to make important regions visible.
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    colored_heatmap = plt.get_cmap("jet")(
        np.asarray(heatmap_image) / 255.0
    )[:, :, :3]

    colored_heatmap = Image.fromarray(
        np.uint8(colored_heatmap * 255)
    )

    # Blend heatmap with the model's cropped input image.
    overlay = Image.blend(
        model_image.convert("RGB"),
        colored_heatmap.convert("RGB"),
        alpha=0.42,
    )

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    overlay.save(output_path, quality=95)

    print("\n" + "=" * 55)
    print("       CROPCARE AI - GRAD-CAM ANALYSIS")
    print("=" * 55)
    print(f"Image: {image_path.resolve()}")
    print(f"Predicted class: {predicted_name}")
    print(f"Prediction confidence: {confidence:.2f}%")
    print(f"Grad-CAM target: {predicted_name}")
    print(f"Visualization saved to: {output_path.resolve()}")
    print("=" * 55)
    print(
        "\nRed/yellow regions generally indicate stronger "
        "influence on this prediction; blue regions indicate "
        "less influence. The heatmap is an explanation aid, "
        "not proof of a correct diagnosis.\n"
    )


def main():
    parser = argparse.ArgumentParser(
        description="Generate a Grad-CAM heatmap for a tomato leaf."
    )
    parser.add_argument(
        "image",
        help="Path to a tomato leaf image",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Optional output image path",
    )
    args = parser.parse_args()

    output_path = args.output
    if output_path is None:
        image_name = Path(args.image).stem
        output_path = OUTPUT_DIR / f"gradcam_{image_name}.jpg"

    try:
        model, class_names, image_transform, image_size = load_model()

        save_visualization(
            args.image,
            model,
            class_names,
            image_transform,
            image_size,
            output_path,
        )

    except (FileNotFoundError, ValueError) as exc:
        print(f"\nERROR: {exc}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
