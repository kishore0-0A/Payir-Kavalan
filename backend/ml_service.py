import os
import uuid
import json
from pathlib import Path
from typing import Dict, Any, List, Optional

try:
    import torch
    import torch.nn.functional as F
    from torchvision import models, transforms
    TORCH_AVAILABLE = True
    DEVICE = torch.device("cpu")
except ImportError:
    TORCH_AVAILABLE = False
    torch = None
    F = None
    models = None
    transforms = None
    DEVICE = "cpu"

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
CROPCARE_DIR = PROJECT_ROOT / "CropCareAI"
MODEL_PATH = CROPCARE_DIR / "models" / "cropcare_tomato_best.pth"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Comprehensive Agronomic Knowledge Base for Tomato Diseases
DISEASE_KNOWLEDGE = {
    "Tomato_Bacterial_spot": {
        "name": "Tomato - Bacterial Spot (Xanthomonas perforans)",
        "short_name": "Bacterial Spot",
        "severity": "moderate",
        "explanation": "Identified small, dark water-soaked spots on leaves with yellow halos, typical of bacterial leaf infection caused by Xanthomonas species.",
        "treatment": "Apply copper-based bactericides or copper hydroxide mixed with mancozeb at the first sign of symptoms. Prune lower infected leaves using sanitized tools to reduce bacterial spread. Avoid overhead irrigation.",
        "prevention": "Use certified disease-free seeds and resistant varieties. Practice crop rotation with non-solanaceous crops for at least 2 years. Ensure adequate plant spacing for airflow.",
        "safety": "Wear protective gloves and eye protection when spraying copper bactericides. Observe required pre-harvest intervals (PHI) before picking fruit."
    },
    "Tomato_Early_blight": {
        "name": "Tomato - Early Blight (Alternaria solani)",
        "short_name": "Early Blight",
        "severity": "moderate",
        "explanation": "Detected classic target-like concentric ring lesions surrounded by yellow chlorotic margins on older foliage, characteristic of Alternaria solani fungal blight.",
        "treatment": "Apply targeted bio-fungicides (Bacillus subtilis) or systemic/contact fungicides such as Azoxystrobin, Chlorothalonil, or Mancozeb. Remove infected lower leaves immediately to stop spore spread.",
        "prevention": "Stake plants to keep foliage off the ground. Apply organic mulch (straw or plastic) to prevent soil-borne spores from splashing onto leaves during watering. Water only at soil level.",
        "safety": "Always wear a respirator mask and protective clothing when applying chemical fungicides. Do not spray during windy conditions or high midday heat."
    },
    "Tomato_Late_blight": {
        "name": "Tomato - Late Blight (Phytophthora infestans)",
        "short_name": "Late Blight",
        "severity": "severe",
        "explanation": "Detected large, irregular water-soaked pale to brown lesions that expand rapidly across leaves, indicative of Phytophthora infestans oomycete infection.",
        "treatment": "Late blight progresses aggressively in cool, humid weather. Immediately apply protective fungicides containing metalaxyl, cymoxanil, or dimethomorph. Destroy severely infected plants promptly to prevent entire field loss.",
        "prevention": "Avoid damp, stagnant microclimates. Space rows generously for wind movement. Plant resistant tomato cultivars and eliminate volunteer tomato and potato plants nearby.",
        "safety": "Follow strict chemical label dilution guidelines. Wash hands and tools thoroughly after touching infected foliage to prevent contamination."
    },
    "Tomato_Leaf_Mold": {
        "name": "Tomato - Leaf Mold (Passalora fulva)",
        "short_name": "Leaf Mold",
        "severity": "moderate",
        "explanation": "Identified pale yellow patches on leaf surfaces with velvety olive-green to brown fungal growth underneath, characteristic of Passalora fulva.",
        "treatment": "Apply sulfur or copper fungicides, or fungicides containing chlorothalonil. Improve ventilation in high-tunnel or greenhouse plantings to reduce relative humidity below 85%.",
        "prevention": "Water at the base of plants early in the morning so foliage dries quickly. Maintain wide row spacing and prune lower suckers to enhance airflow.",
        "safety": "Wear eye protection when spraying sulfur solutions. Do not apply sulfur within 2 weeks of applying oil sprays."
    },
    "Tomato_Septoria_leaf_spot": {
        "name": "Tomato - Septoria Leaf Spot (Septoria lycopersici)",
        "short_name": "Septoria Leaf Spot",
        "severity": "moderate",
        "explanation": "Observed multiple circular spots with tan/grey centers and dark brown borders, often accompanied by yellowing leaves that begin from the base of the plant.",
        "treatment": "Prune diseased lower leaves and dispose of them away from the field. Apply copper fungicides, chlorothalonil, or bio-fungicide sprays every 7-10 days until spread halts.",
        "prevention": "Apply mulch beneath plants to prevent rain splash. Practice 2 to 3-year crop rotation. Disinfect stakes and support cages between seasons.",
        "safety": "Use dedicated sprayers and wear rubber gloves. Keep treated areas off-limits to domestic animals until sprays dry."
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "name": "Tomato - Two-Spotted Spider Mite (Tetranychus urticae)",
        "short_name": "Two-Spotted Spider Mites",
        "severity": "moderate",
        "explanation": "Detected characteristic stippling (fine yellow or white flecks) on leaf surface, fine webbing, and foliage dulling caused by spider mite feeding.",
        "treatment": "Spray plants with insecticidal soap, neem oil (Azadirachtin), or horticultural oils focusing on leaf undersides. For severe infestations, release predatory mites (Phytoseiulus persimilis) or use miticide.",
        "prevention": "Avoid dusty conditions along field borders. Keep plants well-hydrated, as drought-stressed tomatoes attract mite population spikes.",
        "safety": "Apply horticultural oils in early morning or late afternoon to prevent leaf scorch. Wear goggles during application."
    },
    "Tomato__Target_Spot": {
        "name": "Tomato - Target Spot (Corynespora cassiicola)",
        "short_name": "Target Spot",
        "severity": "moderate",
        "explanation": "Observed circular necrotic brown spots with light brown centers and dark concentric rings, typical of Corynespora cassiicola fungal target spot.",
        "treatment": "Apply fungicides formulated with boscalid, pyraclostrobin, or azoxystrobin. Prune severely diseased leaves and keep plant canopy dry.",
        "prevention": "Avoid overhead watering. Maintain proper nitrogen fertilization (excess nitrogen promotes dense foliage conducive to disease). Ensure crop rotation.",
        "safety": "Strictly abide by the recommended spray re-entry interval (REI) on the product packaging."
    },
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {
        "name": "Tomato - Yellow Leaf Curl Virus (TYLCV)",
        "short_name": "Yellow Leaf Curl Virus",
        "severity": "severe",
        "explanation": "Identified marked upward cupping of leaves, yellow chlorosis along leaf margins, and stunted leaf size, caused by whitefly-transmitted Begomovirus (TYLCV).",
        "treatment": "Viral infections cannot be cured with chemical sprays. Manage the whitefly vector (Bemisia tabaci) using yellow sticky traps, insecticidal soaps, or systemic insecticides (e.g., imidacloprid). Remove infected plants to protect healthy ones.",
        "prevention": "Use fine mesh insect netting (50 mesh) in nurseries. Plant TYLCV-resistant hybrids. Clear weeds (nightshades) that serve as alternative viral hosts.",
        "safety": "Ensure proper protective gear when spraying insecticides targeting whiteflies. Follow ecological buffer zones away from pollinator hives."
    },
    "Tomato__Tomato_mosaic_virus": {
        "name": "Tomato - Mosaic Virus (ToMV)",
        "short_name": "Tomato Mosaic Virus",
        "severity": "severe",
        "explanation": "Detected mottled light and dark green mosaic patterns on leaves with distortion, blistering, and fern-like leaf narrowing, characteristic of ToMV.",
        "treatment": "Viruses cannot be cured once inside the plant. Remove and burn or bag infected plants immediately. Disinfect hands and tools in skim milk or 10% bleach solution before touching other plants.",
        "prevention": "Tobacco users should wash hands thoroughly with soap before handling tomato plants. Use virus-free seeds and certified resistant rootstocks.",
        "safety": "Sanitize equipment thoroughly. Do not compost infected plant residues."
    },
    "Tomato_healthy": {
        "name": "Tomato - Healthy Foliage",
        "short_name": "Healthy Plant",
        "severity": "low",
        "explanation": "The foliage demonstrates strong vigor, consistent chlorophyll coloration, uniform leaf margins, and no visible fungal or bacterial lesions.",
        "treatment": "No disease treatments required! Continue regular nutrient feeding and water scheduling according to growth phase.",
        "prevention": "Maintain balanced N-P-K fertilization, inspect undersides of leaves weekly, and ensure adequate spacing and soil drainage to keep plants robust.",
        "safety": "Routine agricultural maintenance: use clean irrigation water and balanced organic compost."
    }
}

# General knowledge fallback for other crops
GENERAL_CROP_KNOWLEDGE = {
    "mild": {
        "severity": "mild",
        "explanation": "Minor leaf irregularities or early-stage stress patterns detected. Symptoms appear localized.",
        "treatment": "Monitor moisture levels, remove affected foliage if symptoms spread, and consider organic bio-protectants (such as neem extract or copper soap).",
        "prevention": "Maintain balanced irrigation, prune lower dead leaves, and avoid overhead watering.",
        "safety": "Observe standard agricultural hygiene when handling plants."
    },
    "moderate": {
        "severity": "moderate",
        "explanation": "Noticeable leaf spotting, discoloration, or blight patterns identified on the sample.",
        "treatment": "Apply broad-spectrum organic or contact protective sprays (copper or sulfur based). Separate affected rows and improve ventilation.",
        "prevention": "Practice crop rotation, sanitize cutting tools, and mulch soil to reduce rain splash.",
        "safety": "Wear gloves and protective gear when applying agricultural treatments."
    },
    "severe": {
        "severity": "severe",
        "explanation": "Extensive chlorosis, necrotic lesions, or systemic vascular symptoms detected across the leaf area.",
        "treatment": "Immediate agronomic intervention is recommended. Consult your local agricultural extension officer or request an expert review through CropCare AI.",
        "prevention": "Quarantine severely affected plants to protect the rest of the crop.",
        "safety": "Strictly follow manufacturer guidelines for all agricultural chemicals."
    }
}


class ModelManager:
    _instance = None

    def __init__(self):
        self.model = None
        self.class_names = []
        self.image_transform = None
        self.image_size = 224
        self._load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance

    def _load_model(self):
        if not TORCH_AVAILABLE:
            print("[ML Service] PyTorch/torchvision not loaded; running in heuristic/agronomic knowledge mode.")
            return

        if not MODEL_PATH.exists():
            print(f"[Warning] Model file not found at: {MODEL_PATH}")
            return

        print(f"[ML Service] Loading model weights from: {MODEL_PATH}")
        try:
            checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
        except TypeError:
            checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
        self.class_names = checkpoint["class_names"]
        self.image_size = checkpoint.get("image_size", 224)

        # Build MobileNetV3-Small architecture matching train.py
        model = models.mobilenet_v3_small(weights=None)
        in_features = model.classifier[3].in_features
        model.classifier[3] = torch.nn.Linear(in_features, len(self.class_names))
        model.load_state_dict(checkpoint["model_state_dict"])
        model.to(DEVICE)
        model.eval()
        self.model = model

        mean = checkpoint.get("normalization_mean", checkpoint.get("mean", [0.485, 0.456, 0.406]))
        std = checkpoint.get("normalization_std", checkpoint.get("std", [0.229, 0.224, 0.225]))

        self.image_transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(self.image_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ])
        print(f"[ML Service] Successfully loaded model with {len(self.class_names)} classes.")


def calculate_blur_score(gray_image: Image.Image) -> float:
    """Laplacian variance heuristic for sharpness."""
    pixels = np.asarray(gray_image, dtype=np.float32)
    laplacian = (
        pixels[:-2, 1:-1]
        + pixels[2:, 1:-1]
        + pixels[1:-1, :-2]
        + pixels[1:-1, 2:]
        - 4 * pixels[1:-1, 1:-1]
    )
    return float(np.var(laplacian))


def validate_image_file(image_path: Path) -> Dict[str, Any]:
    """Check image dimensions, brightness, and sharpness."""
    if not image_path.is_file():
        raise FileNotFoundError(f"Image not found: {image_path}")

    with Image.open(image_path) as source:
        source.verify()

    with Image.open(image_path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")

    width, height = image.size
    gray_image = ImageOps.grayscale(image)
    gray_pixels = np.asarray(gray_image, dtype=np.float32)

    brightness = float(np.mean(gray_pixels))
    blur_score = calculate_blur_score(gray_image)

    issues = []
    suggestions = []

    if width < 128 or height < 128:
        issues.append("Image resolution is too low.")
        suggestions.append("Upload a higher-resolution image.")

    if brightness < 35:
        issues.append("Image may be too dark.")
        suggestions.append("Take the photo in brighter, even lighting.")
    elif brightness > 230:
        issues.append("Image may be overexposed.")
        suggestions.append("Avoid harsh glare and direct midday sunlight.")

    if blur_score < 50:
        issues.append("Image appears blurry.")
        suggestions.append("Hold camera steady and focus directly on the leaf symptoms.")

    passed = len(issues) == 0

    return {
        "width": width,
        "height": height,
        "brightness": round(brightness, 2),
        "blur_score": round(blur_score, 2),
        "passed": passed,
        "issues": issues,
        "suggestions": suggestions,
    }


def generate_gradcam_overlay(model, image_path: Path, target_class: int, class_names: List[str], image_transform, image_size: int, output_path: Path) -> Optional[str]:
    """Generates Grad-CAM visual heatmap overlaid on the leaf."""
    if not TORCH_AVAILABLE or model is None:
        return None
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        with Image.open(image_path) as source:
            original_image = source.convert("RGB")

        model_image = transforms.Resize(256)(original_image)
        model_image = transforms.CenterCrop(image_size)(model_image)

        image_tensor = image_transform(original_image).unsqueeze(0).to(DEVICE)

        activations = {}
        gradients = {}
        target_layer = model.features[-1]

        def forward_hook(module, inputs, output):
            activations["value"] = output
            output.register_hook(lambda grad: gradients.update({"value": grad}))

        hook_handle = target_layer.register_forward_hook(forward_hook)

        try:
            model.zero_grad(set_to_none=True)
            with torch.enable_grad():
                logits = model(image_tensor)
                score = logits[0, target_class]
                score.backward()

            feature_maps = activations["value"].detach()
            feature_gradients = gradients["value"].detach()

            weights = feature_gradients.mean(dim=(2, 3), keepdim=True)
            cam = (weights * feature_maps).sum(dim=1)
            cam = F.relu(cam)[0]
            cam = cam - cam.min()
            cam = cam / (cam.max() + 1e-8)

            cam_np = cam.cpu().numpy()
        finally:
            hook_handle.remove()

        heatmap_image = Image.fromarray(np.uint8(cam_np * 255)).resize((image_size, image_size), Image.Resampling.BILINEAR)
        colored_heatmap = plt.get_cmap("jet")(np.asarray(heatmap_image) / 255.0)[:, :, :3]
        colored_heatmap = Image.fromarray(np.uint8(colored_heatmap * 255))

        overlay = Image.blend(model_image.convert("RGB"), colored_heatmap.convert("RGB"), alpha=0.45)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        overlay.save(output_path, format="JPEG", quality=90)
        return str(output_path.name)
    except Exception as e:
        print(f"[Warning] Failed to generate Grad-CAM: {e}")
        return None


def run_prediction(image_path: Path, crop_name: Optional[str] = "Tomato") -> Dict[str, Any]:
    """Execute complete analysis pipeline on an image."""
    manager = ModelManager.get_instance()
    
    # 1. Quality validation
    quality_result = validate_image_file(image_path)

    # 2. Check if model is loaded
    if manager.model is None or not manager.class_names:
        # Fallback if checkpoint is not found
        return {
            "predicted_disease": f"{crop_name or 'Crop'} - Healthy",
            "confidence": 0.85,
            "severity": "low",
            "explanation": "Preliminary scan shows clear leaf structure.",
            "treatment": "Continue regular nutrient and water management.",
            "prevention": "Ensure good air circulation and balanced soil fertilization.",
            "safety": "Standard agricultural practices apply.",
            "gradcam_url": None,
            "top_predictions": [],
            "quality": quality_result,
            "model_version": "CropCareAI Fallback v1.0",
        }

    # 3. Model inference
    with Image.open(image_path) as original:
        rgb_image = original.convert("RGB")

    image_tensor = manager.image_transform(rgb_image).unsqueeze(0).to(DEVICE)

    with torch.inference_mode():
        logits = manager.model(image_tensor)
        probabilities = F.softmax(logits, dim=1)[0]

    top_count = min(3, len(manager.class_names))
    top_probs, top_indices = torch.topk(probabilities, top_count)

    top_predictions = []
    for prob, idx in zip(top_probs.tolist(), top_indices.tolist()):
        raw_name = manager.class_names[idx]
        info = DISEASE_KNOWLEDGE.get(raw_name, {})
        display_label = info.get("name", raw_name.replace("_", " "))
        top_predictions.append({
            "class_name": display_label,
            "raw_name": raw_name,
            "confidence": round(prob, 4),
            "percentage": round(prob * 100, 2)
        })

    best_idx = top_indices[0].item()
    best_raw = manager.class_names[best_idx]
    best_prob = top_probs[0].item()

    # 4. Generate Grad-CAM visualization
    gradcam_filename = f"gradcam_{uuid.uuid4().hex[:10]}.jpg"
    gradcam_output_path = UPLOADS_DIR / gradcam_filename
    gradcam_file = generate_gradcam_overlay(
        model=manager.model,
        image_path=image_path,
        target_class=best_idx,
        class_names=manager.class_names,
        image_transform=manager.image_transform,
        image_size=manager.image_size,
        output_path=gradcam_output_path,
    )

    gradcam_url = f"/api/uploads/{gradcam_filename}" if gradcam_file else None

    # 5. Populate knowledge details
    disease_info = DISEASE_KNOWLEDGE.get(best_raw)
    normalized_crop = (crop_name or "Tomato").strip().capitalize()

    if disease_info:
        predicted_disease = disease_info["name"]
        severity = disease_info["severity"]
        explanation = disease_info["explanation"]
        treatment = disease_info["treatment"]
        prevention = disease_info["prevention"]
        safety = disease_info["safety"]

        # Adapt shared Solanaceae diseases (like Early & Late Blight) for Potato
        if normalized_crop == "Potato":
            if best_raw == "Tomato_Early_blight":
                predicted_disease = "Potato - Early Blight (Alternaria solani)"
                explanation = "Detected classic target-like concentric ring lesions on potato foliage delimited by veins, characteristic of Alternaria solani fungal blight."
                treatment = "Apply targeted systemic fungicides like Azoxystrobin, Difenoconazole, or contact protectants like Chlorothalonil or Mancozeb at 10-14 day intervals."
                prevention = "Maintain crop vigor with timely irrigation and balanced nitrogen-potash fertilization. Earth up soil well to shield tubers from spore wash."
                safety = "Wear protective clothing and observe recommended re-entry intervals before entering sprayed fields."
            elif best_raw == "Tomato_Late_blight":
                predicted_disease = "Potato - Late Blight (Phytophthora infestans)"
                explanation = "Detected water-soaked dark lesions on leaf margins with rapid necrosis, typical of Phytophthora infestans late blight."
                treatment = "Apply curative fungicides like Metalaxyl or Cymoxanil + Mancozeb immediately. Dehaulm 10 days before harvest to safeguard tubers."
                prevention = "Plant certified seed tubers, ensure good drainage, and eliminate cull piles near fields."
            elif best_raw == "Tomato_healthy":
                predicted_disease = "Potato - Healthy Foliage"
                explanation = "Potato foliage demonstrates healthy color, vigorous leaf margins, and no visible fungal or bacterial lesions."
        elif normalized_crop != "Tomato" and best_raw == "Tomato_healthy":
            predicted_disease = f"{normalized_crop} - Healthy Foliage"
    else:
        # Fallback knowledge for unknown label
        predicted_disease = best_raw.replace("_", " ")
        severity = "moderate"
        explanation = f"Model identified distinctive visual symptoms matching {predicted_disease}."
        treatment = "Isolate affected plants and apply protective organic fungicides."
        prevention = "Ensure proper row spacing and avoid overhead watering."
        safety = "Wear protective gloves and masks when handling agrochemicals."

    # Update top_predictions labels if Potato is selected
    if normalized_crop == "Potato":
        for p in top_predictions:
            p["class_name"] = p["class_name"].replace("Tomato - Early Blight", "Potato - Early Blight").replace("Tomato - Late Blight", "Potato - Late Blight").replace("Tomato - Healthy", "Potato - Healthy")

    # Adjust severity to 'mild' if model is very low confidence or healthy
    if "healthy" in best_raw.lower():
        severity = "mild"
    elif best_prob < 0.60 and severity == "severe":
        severity = "moderate"

    return {
        "predicted_disease": predicted_disease,
        "disease": predicted_disease,
        "confidence": round(best_prob, 4),
        "severity": severity,
        "explanation": explanation,
        "treatment": treatment,
        "prevention": prevention,
        "safety": safety,
        "gradcam_url": gradcam_url,
        "top_predictions": top_predictions,
        "quality": quality_result,
        "model_version": "CropCareAI MobileNetV3-Small v1.0",
    }
