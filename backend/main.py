from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta
from pathlib import Path
from typing import Optional, List
import uuid
import json
import base64
import os

import models
import schemas
import auth
from database import engine, get_db, sync_schema
import ml_service

# Create all tables in the database
models.Base.metadata.create_all(bind=engine)
sync_schema()

app = FastAPI(title="Payir Kaavalan - Crop Disease Prediction API")

# Setup CORS to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for uploaded leaf images and Grad-CAM visualizations
app.mount("/api/uploads", StaticFiles(directory=str(ml_service.UPLOADS_DIR)), name="uploads")

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    token = credentials.credentials
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except auth.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security), db: Session = Depends(get_db)) -> Optional[models.User]:
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email:
            return db.query(models.User).filter(models.User.email == email).first()
    except Exception:
        pass
    return None


# ==========================================
# AUTHENTICATION
# ==========================================

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=hashed_password,
        role=user.role or "farmer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/mock-google", response_model=schemas.Token)
def mock_google_login(db: Session = Depends(get_db)):
    email = "demo.farmer@gmail.com"
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        user = models.User(
            id=str(uuid.uuid4()),
            email=email,
            full_name="Demo Farmer",
            hashed_password=auth.get_password_hash("mock_google_password_secure")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/api/auth/me", response_model=schemas.UserResponse)
def update_user_me(user_update: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


# ==========================================
# FILE UPLOAD & ML PREDICTION PIPELINE
# ==========================================

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload leaf image and store in server uploads folder."""
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    unique_filename = f"leaf_{uuid.uuid4().hex[:12]}{ext}"
    destination_path = ml_service.UPLOADS_DIR / unique_filename

    contents = await file.read()
    with open(destination_path, "wb") as f:
        f.write(contents)

    file_url = f"/api/uploads/{unique_filename}"
    return {
        "file_url": file_url,
        "filename": unique_filename,
        "size": len(contents),
    }


def resolve_image_path(image_url: Optional[str], image_base64: Optional[str]) -> Path:
    """Helper to locate or extract a local file for ML inference."""
    if image_base64:
        raw_b64 = image_base64
        if "base64," in raw_b64:
            raw_b64 = raw_b64.split("base64,")[1]
        decoded = base64.b64decode(raw_b64)
        temp_filename = f"b64_{uuid.uuid4().hex[:12]}.jpg"
        temp_path = ml_service.UPLOADS_DIR / temp_filename
        with open(temp_path, "wb") as f:
            f.write(decoded)
        return temp_path

    if not image_url:
        raise HTTPException(status_code=400, detail="Either image_url or image_base64 must be provided")

    # If it's a relative URL or points to uploads
    if "/api/uploads/" in image_url:
        filename = image_url.split("/api/uploads/")[1].split("?")[0]
        local_path = ml_service.UPLOADS_DIR / filename
        if local_path.is_file():
            return local_path

    # Check directly in uploads
    direct_path = ml_service.UPLOADS_DIR / Path(image_url).name
    if direct_path.is_file():
        return direct_path

    # Check sample images in CropCareAI root
    sample_path = ml_service.CROPCARE_DIR / Path(image_url).name
    if sample_path.is_file():
        return sample_path

    # If external HTTP URL, download it
    if image_url.startswith("http://") or image_url.startswith("https://"):
        try:
            import urllib.request
            ext = Path(image_url).suffix or ".jpg"
            temp_filename = f"dl_{uuid.uuid4().hex[:12]}{ext}"
            temp_path = ml_service.UPLOADS_DIR / temp_filename
            urllib.request.urlretrieve(image_url, temp_path)
            return temp_path
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to download image from URL: {str(e)}")

    raise HTTPException(status_code=404, detail="Image file could not be located for analysis")


@app.post("/api/functions/aiPredict")
@app.post("/api/predict")
async def ai_predict(request: schemas.PredictionRequest):
    """Run CropCareAI PyTorch ML inference on the uploaded leaf."""
    image_path = resolve_image_path(request.image_url, request.image_base64)
    result = ml_service.run_prediction(image_path=image_path, crop_name=request.crop)
    return result


@app.post("/api/validate-image")
async def validate_image_endpoint(request: schemas.PredictionRequest):
    """Validate leaf sharpness, brightness, and resolution before scanning."""
    image_path = resolve_image_path(request.image_url, request.image_base64)
    quality = ml_service.validate_image_file(image_path)
    return quality


# ==========================================
# DIAGNOSES (CROP ASSESSMENTS)
# ==========================================

@app.post("/api/diagnoses", response_model=schemas.DiagnosisResponse)
def create_diagnosis(
    diag: schemas.DiagnosisCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user)
):
    """Save an AI diagnosis assessment in the database."""
    diag_id = str(uuid.uuid4())
    owner_id = current_user.id if current_user else None

    # Serialize complex structures to JSON strings for SQLite
    top_preds_str = json.dumps(diag.top_predictions) if diag.top_predictions else None
    quality_str = json.dumps(diag.quality_checks) if diag.quality_checks else None

    disease_name = diag.predicted_disease or diag.disease or "Healthy"

    new_diag = models.Diagnosis(
        id=diag_id,
        crop_id=diag.crop_id,
        crop_name=diag.crop_name,
        image_url=diag.image_url,
        gradcam_url=diag.gradcam_url,
        disease=disease_name,
        predicted_disease=disease_name,
        confidence=diag.confidence or 0.0,
        severity=diag.severity or "mild",
        status=diag.status or "completed",
        model_version=diag.model_version or "CropCareAI MobileNetV3-Small v1.0",
        explanation=diag.explanation,
        treatment=diag.treatment,
        prevention=diag.prevention,
        safety=diag.safety,
        top_predictions=top_preds_str,
        quality_checks=quality_str,
        owner_id=owner_id,
    )
    db.add(new_diag)
    db.commit()
    db.refresh(new_diag)

    # Re-hydrate json fields for response
    resp = schemas.DiagnosisResponse.model_validate(new_diag)
    if new_diag.top_predictions:
        try:
            resp.top_predictions = json.loads(new_diag.top_predictions)
        except Exception:
            pass
    if new_diag.quality_checks:
        try:
            resp.quality_checks = json.loads(new_diag.quality_checks)
        except Exception:
            pass
    return resp


@app.get("/api/diagnoses")
def get_diagnoses(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user)
):
    """List diagnoses. If logged in, shows user's diagnoses, else recent assessments."""
    query = db.query(models.Diagnosis)
    if current_user:
        query = query.filter(models.Diagnosis.owner_id == current_user.id)
    
    diagnoses = query.order_by(models.Diagnosis.created_date.desc()).all()
    
    results = []
    for d in diagnoses:
        resp = schemas.DiagnosisResponse.model_validate(d)
        if d.top_predictions:
            try:
                resp.top_predictions = json.loads(d.top_predictions)
            except Exception:
                pass
        if d.quality_checks:
            try:
                resp.quality_checks = json.loads(d.quality_checks)
            except Exception:
                pass
        results.append(resp)
    return results


@app.get("/api/diagnoses/{diag_id}", response_model=schemas.DiagnosisResponse)
def get_diagnosis(diag_id: str, db: Session = Depends(get_db)):
    """Fetch diagnosis details by ID."""
    diag = db.query(models.Diagnosis).filter(models.Diagnosis.id == diag_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis record not found")
    
    resp = schemas.DiagnosisResponse.model_validate(diag)
    if diag.top_predictions:
        try:
            resp.top_predictions = json.loads(diag.top_predictions)
        except Exception:
            pass
    if diag.quality_checks:
        try:
            resp.quality_checks = json.loads(diag.quality_checks)
        except Exception:
            pass
    return resp


@app.delete("/api/diagnoses/{diag_id}")
def delete_diagnosis(diag_id: str, db: Session = Depends(get_db)):
    """Delete a diagnosis record."""
    diag = db.query(models.Diagnosis).filter(models.Diagnosis.id == diag_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    db.delete(diag)
    db.commit()
    return {"success": True, "message": "Diagnosis deleted"}


# ==========================================
# CROPS CRUD
# ==========================================

@app.get("/api/crops", response_model=list[schemas.CropResponse])
def get_crops(db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_optional_user)):
    query = db.query(models.Crop)
    if current_user:
        query = query.filter(models.Crop.owner_id == current_user.id)
    return query.order_by(models.Crop.created_date.desc()).all()


@app.post("/api/crops", response_model=schemas.CropResponse)
def create_crop(crop_in: schemas.CropCreate, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_optional_user)):
    c_name = crop_in.crop_name or crop_in.name or "Unnamed Crop"
    new_crop = models.Crop(
        id=str(uuid.uuid4()),
        name=c_name,
        crop_name=c_name,
        variety=crop_in.variety,
        area=crop_in.field_size or crop_in.area,
        field_size=crop_in.field_size or crop_in.area,
        location=crop_in.location,
        notes=crop_in.notes,
        planting_date=crop_in.planting_date,
        health_status=crop_in.health_status or "healthy",
        owner_id=current_user.id if current_user else None,
    )
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)
    return new_crop



@app.get("/api/crops/{crop_id}", response_model=schemas.CropResponse)
def get_crop(crop_id: str, db: Session = Depends(get_db)):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@app.put("/api/crops/{crop_id}", response_model=schemas.CropResponse)
def update_crop(crop_id: str, crop_update: schemas.CropCreate, db: Session = Depends(get_db)):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    for key, value in crop_update.model_dump(exclude_unset=True).items():
        setattr(crop, key, value)
    db.commit()
    db.refresh(crop)
    return crop


@app.delete("/api/crops/{crop_id}")
def delete_crop(crop_id: str, db: Session = Depends(get_db)):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()
    return {"success": True, "message": "Crop deleted"}


# ==========================================
# DISEASE KNOWLEDGE BASE
# ==========================================

DEFAULT_DISEASES = [
    {
        "name": "Bacterial Spot (Xanthomonas perforans)",
        "crop": "Tomato",
        "description": "A destructive bacterial disease causing dark, water-soaked necrotic lesions on leaves and scabby blemishes on fruits.",
        "symptoms": "Small brown circular spots with greasy texture and yellow halos on leaves. In severe cases, extensive defoliation occurs.",
        "causes": "Warm, wet weather (24-30°C) with persistent leaf wetness; spread by wind-driven rain, overhead irrigation, and infected seed.",
        "management": "Apply copper-based bactericides combined with mancozeb. Prune lower infected leaves using sanitized shears. Rotate crops for at least 2 years with non-solanaceous plants.",
        "prevention": "Use certified disease-free seeds. Avoid overhead sprinkler irrigation. Ensure wide plant spacing for airflow.",
        "safety_information": "Wear gloves and mask during copper spraying. Respect pre-harvest interval (PHI) periods.",
        "reference": "FAO / ICAR Plant Pathology Bulletin"
    },
    {
        "name": "Early Blight (Alternaria solani)",
        "crop": "Tomato",
        "description": "Common fungal disease characterized by concentric target-like rings on older leaves.",
        "symptoms": "Dark brown circular spots with distinctive concentric target rings surrounded by yellow chlorotic tissue, primarily starting on lower foliage.",
        "causes": "High humidity, moderate temperatures (24-29°C), and extended dew periods; fungus survives in soil and crop debris.",
        "management": "Apply systemic fungicides like Azoxystrobin, Difenoconazole, or contact protectants like Chlorothalonil and Mancozeb.",
        "prevention": "Stake tomato plants, mulch around base to prevent soil splash, and practice 3-year crop rotation.",
        "safety_information": "Do not spray in windy conditions or midday heat. Wear respiratory protection.",
        "reference": "TNAU Agritech Portal"
    },
    {
        "name": "Late Blight (Phytophthora infestans)",
        "crop": "Tomato",
        "description": "Rapidly progressing oomycete blight capable of destroying entire crops within days during cool, damp weather.",
        "symptoms": "Large, irregular water-soaked pale green to dark brown lesions on leaves and stems with white velvety fungal growth on leaf undersides in humid conditions.",
        "causes": "Cool, damp weather with temperatures between 15-22°C and relative humidity above 90%.",
        "management": "Apply curative fungicides like Metalaxyl, Cymoxanil, or Dimethomorph immediately upon first symptom detection. Destroy severely affected plants.",
        "prevention": "Ensure well-drained soils, avoid planting near potatoes, and select resistant cultivars.",
        "safety_information": "Strictly follow labeled dilution rates. Clean all machinery and boots after visiting infected fields.",
        "reference": "Global Plant Clinic / CABI"
    },
    {
        "name": "Leaf Mold (Passalora fulva)",
        "crop": "Tomato",
        "description": "Fungal foliage infection prevalent in humid microclimates and polyhouses/greenhouses.",
        "symptoms": "Pale greenish-yellow spots on upper leaf surfaces matching velvety olive-green to brown spore patches underneath.",
        "causes": "Relative humidity above 85% and warm temperatures (21-24°C) with poor ventilation.",
        "management": "Apply sulfur or copper fungicides. Increase ventilation and decrease plant canopy density.",
        "prevention": "Drip irrigate at soil level. Avoid wetting leaves during late evening. Use resistant tomato hybrids.",
        "safety_information": "Avoid sulfur sprays within 14 days of oil-based sprays to prevent leaf burn.",
        "reference": "UC Davis IPM"
    },
    {
        "name": "Septoria Leaf Spot (Septoria lycopersici)",
        "crop": "Tomato",
        "description": "Severe defoliating fungal disease with numerous small circular spots.",
        "symptoms": "Numerous circular spots (1-3mm) with light gray or tan centers and dark brown margins, often dotted with tiny black fruiting bodies.",
        "causes": "Warm, wet conditions and rain splashing soil-borne spores onto lower leaves.",
        "management": "Apply copper fungicides or Chlorothalonil every 7-10 days. Remove and dispose of lower infected foliage.",
        "prevention": "Mulch beds thoroughly, maintain 3-year crop rotations, and avoid working in wet fields.",
        "safety_information": "Wash equipment with mild bleach or detergent solution between crop blocks.",
        "reference": "Cornell Vegetable MD Online"
    },
    {
        "name": "Yellow Leaf Curl Virus (TYLCV)",
        "crop": "Tomato",
        "description": "Severe viral stunting disease vectored by the silverleaf whitefly (Bemisia tabaci).",
        "symptoms": "Marked upward curling and cupping of leaflets, marginal chlorosis, stunted plant growth, and massive flower drop.",
        "causes": "Begomovirus transmitted persistently by whitefly vectors.",
        "management": "No chemical cure for the virus. Control whitefly populations using yellow sticky traps, neem oil, or systemic insecticides like Imidacloprid.",
        "prevention": "Install 50-mesh insect netting in nurseries. Eradicate alternate weed hosts (nightshades). Grow TYLCV-resistant varieties.",
        "safety_information": "Target sprays during early morning when whiteflies are sluggish.",
        "reference": "World Vegetable Center (AVRDC)"
    },
    {
        "name": "Blast (Magnaporthe oryzae)",
        "crop": "Rice",
        "description": "One of the most devastating fungal diseases affecting all aboveground parts of the rice plant.",
        "symptoms": "Spindle-shaped or elliptical lesions with grayish centers and dark brown borders on leaves; neck rot causing white panicles.",
        "causes": "High humidity (>90%), leaf wetness, high nitrogen fertilizer doses, and cloudy rainy weather.",
        "management": "Apply Tricyclazole (0.6g/L), Isoprothiolane, or Kasugamycin at initial leaf blast appearance.",
        "prevention": "Avoid excessive urea/nitrogen fertilizer. Apply split doses. Seed treatment with Carbendazim.",
        "safety_information": "Wear protective boots and gloves in paddy fields when spraying.",
        "reference": "IRRI Rice Knowledge Bank"
    },
    {
        "name": "Brown Spot (Bipolaris oryzae)",
        "crop": "Rice",
        "description": "Fungal leaf spot common in nutrient-depleted or water-stressed paddy soils.",
        "symptoms": "Oval or circular brown lesions with yellow halo, giving leaves a speckled appearance; dark spots on grain husks.",
        "causes": "Poor soil fertility (especially potassium and silicon deficiency), drought stress, and acidic soils.",
        "management": "Foliar spray with Mancozeb (2g/L) or Propiconazole (1ml/L). Correct soil potassium and zinc deficiency.",
        "prevention": "Treat seed with hot water (52-54°C for 15 min) or fungicides before sowing. Maintain balanced fertilization.",
        "safety_information": "Ensure spray droplets do not drift into nearby freshwater fish ponds.",
        "reference": "ICAR - National Rice Research Institute"
    },
    {
        "name": "Late Blight (Phytophthora infestans)",
        "crop": "Potato",
        "description": "Historic disease causing rapid tuber rot and total vine collapse in potato crops.",
        "symptoms": "Blackish-brown water-soaked spots on leaf tips and margins; white mildew on leaf undersides in morning dew; firm brown rot inside tubers.",
        "causes": "Cool temperatures (10-20°C) with continuous high humidity or fog.",
        "management": "Spray Mancozeb (2.5g/L) preventively, or Cymoxanil + Mancozeb / Metalaxyl curatively.",
        "prevention": "Plant certified seed tubers, earth up soil well to protect tubers, and dehaulm 10 days before harvest.",
        "safety_information": "Destroy all culled potatoes; never leave cull piles near fields.",
        "reference": "CPRI Shimla"
    },
    {
        "name": "Early Blight (Alternaria solani)",
        "crop": "Potato",
        "description": "Foliar blight attacking maturing potato plants leading to premature foliage loss.",
        "symptoms": "Brown target spots with concentric rings delimited by leaf veins; dark sunken lesions on tuber surface.",
        "causes": "Alternating wet and dry periods; nitrogen deficiency predisposing plants to early infection.",
        "management": "Apply Azoxystrobin, Chlorothalonil, or Mancozeb sprays at 10-14 day intervals.",
        "prevention": "Maintain adequate crop vigor with timely irrigation and balanced nitrogen-potash fertilization.",
        "safety_information": "Observe recommended re-entry intervals before entering sprayed fields.",
        "reference": "ICAR - CPRI"
    },
    {
        "name": "Common Rust (Puccinia sorghi)",
        "crop": "Maize",
        "description": "Fungal disease producing golden-brown to cinnamon pustules on corn leaves.",
        "symptoms": "Elongated circular brownish-red pustules (uredinia) on both leaf surfaces that rupture to release powdery spores.",
        "causes": "Cool, humid weather (16-25°C) and persistent dew.",
        "management": "Apply Mancozeb (2g/L) or Azoxystrobin sprays if rust appears before silking.",
        "prevention": "Plant rust-resistant hybrids. Avoid late planting in high-risk zones.",
        "safety_information": "Wear goggles when handling powdery fungicides.",
        "reference": "CIMMYT Maize Pathology"
    },
    {
        "name": "Leaf Curl (Chilli Leaf Curl Virus)",
        "crop": "Chilli",
        "description": "Devastating viral infection causing severe leaf puckering, puckered veins, and flower abortion.",
        "symptoms": "Leaves curl upward into a boat shape, become thickened and brittle; internodes shorten producing a bushy stunted plant.",
        "causes": "Transmitted by whiteflies (Bemisia tabaci) and thrips (Scirtothrips dorsalis).",
        "management": "Control vector pests using Diafenthiuron, Fipronil, or Neem oil (10,000 ppm). Remove viral source plants.",
        "prevention": "Grow barrier crops (maize/sorghum) around chilli fields. Use silver reflective mulches.",
        "safety_information": "Rotate insecticide modes of action to prevent vector resistance.",
        "reference": "IIHR Bangalore"
    }
]

@app.get("/api/diseases", response_model=list[schemas.DiseaseResponse])
def get_diseases(db: Session = Depends(get_db)):
    diseases = db.query(models.Disease).all()
    if not diseases:
        for item in DEFAULT_DISEASES:
            d = models.Disease(
                id=str(uuid.uuid4()),
                last_updated=item.get("last_updated") or "2026-03-15",
                **item
            )
            db.add(d)
        db.commit()
        diseases = db.query(models.Disease).all()
    return diseases

@app.post("/api/diseases", response_model=schemas.DiseaseResponse)
def create_disease(disease: schemas.DiseaseCreate, db: Session = Depends(get_db)):
    new_d = models.Disease(
        id=str(uuid.uuid4()),
        last_updated=disease.last_updated or "2026-03-15",
        **disease.model_dump()
    )
    db.add(new_d)
    db.commit()
    db.refresh(new_d)
    return new_d

@app.put("/api/diseases/{disease_id}", response_model=schemas.DiseaseResponse)
def update_disease(disease_id: str, data: schemas.DiseaseCreate, db: Session = Depends(get_db)):
    d = db.query(models.Disease).filter(models.Disease.id == disease_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Disease not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(d, key, value)
    db.commit()
    db.refresh(d)
    return d

@app.delete("/api/diseases/{disease_id}")
def delete_disease(disease_id: str, db: Session = Depends(get_db)):
    d = db.query(models.Disease).filter(models.Disease.id == disease_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Disease not found")
    db.delete(d)
    db.commit()
    return {"success": True, "message": "Disease record deleted"}


# ==========================================
# EXPERTS & REVIEWS
# ==========================================

@app.get("/api/experts", response_model=list[schemas.ExpertResponse])
def get_experts(db: Session = Depends(get_db)):
    experts = db.query(models.ExpertProfile).all()
    if not experts:
        experts = [
            models.ExpertProfile(id=str(uuid.uuid4()), name="Dr. Muthu", role="Chief Agronomist", rating="4.9", cases=412, image_url="https://i.pravatar.cc/150?u=muthu"),
            models.ExpertProfile(id=str(uuid.uuid4()), name="Karthik Raj", role="Plant Pathologist", rating="4.8", cases=289, image_url="https://i.pravatar.cc/150?u=karthik"),
            models.ExpertProfile(id=str(uuid.uuid4()), name="Dr. Priya", role="Crop Scientist", rating="5.0", cases=531, image_url="https://i.pravatar.cc/150?u=priya"),
        ]
        for e in experts:
            db.add(e)
        db.commit()
        for e in experts:
            db.refresh(e)
    return experts

@app.put("/api/diagnoses/{diag_id}")
def update_diagnosis(diag_id: str, data: dict, db: Session = Depends(get_db)):
    diag = db.query(models.Diagnosis).filter(models.Diagnosis.id == diag_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    for key, value in data.items():
        if hasattr(diag, key):
            setattr(diag, key, value)
    db.commit()
    db.refresh(diag)
    return diag

@app.post("/api/experts/reviews", response_model=schemas.ExpertReviewResponse)
def create_expert_review(review: schemas.ExpertReviewCreate, current_user: Optional[models.User] = Depends(get_optional_user), db: Session = Depends(get_db)):
    new_review = models.ExpertReview(
        id=str(uuid.uuid4()),
        owner_id=current_user.id if current_user else None,
        **review.model_dump()
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@app.get("/api/experts/reviews", response_model=list[schemas.ExpertReviewResponse])
def get_expert_reviews(current_user: Optional[models.User] = Depends(get_optional_user), db: Session = Depends(get_db)):
    query = db.query(models.ExpertReview)
    # If user is a farmer, only show their own submitted reviews. If expert or admin, show all farmer cases!
    if current_user and current_user.role not in ["expert", "admin"]:
        query = query.filter(models.ExpertReview.owner_id == current_user.id)
    reviews = query.order_by(models.ExpertReview.created_date.desc()).all()
    for r in reviews:
        if r.owner:
            r.farmer_name = r.owner.full_name
            r.farmer_mobile = r.owner.mobile
            r.farmer_email = r.owner.email
    return reviews

@app.get("/api/experts/reviews/{review_id}", response_model=schemas.ExpertReviewResponse)
def get_single_expert_review(review_id: str, db: Session = Depends(get_db)):
    review = db.query(models.ExpertReview).filter(models.ExpertReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review case not found")
    if review.owner:
        review.farmer_name = review.owner.full_name
        review.farmer_mobile = review.owner.mobile
        review.farmer_email = review.owner.email
    return review

@app.put("/api/experts/reviews/{review_id}", response_model=schemas.ExpertReviewResponse)
def update_expert_review(review_id: str, data: schemas.ExpertReviewUpdate, current_user: Optional[models.User] = Depends(get_optional_user), db: Session = Depends(get_db)):
    review = db.query(models.ExpertReview).filter(models.ExpertReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review case not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(review, key, value)
    
    db.commit()
    db.refresh(review)
    return review
