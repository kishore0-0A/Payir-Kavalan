from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "farmer"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    village: Optional[str] = None
    primary_crop: Optional[str] = None
    preferred_language: Optional[str] = None
    role: Optional[str] = None
    onboarding_done: Optional[bool] = None

class UserResponse(UserBase):
    id: str
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    village: Optional[str] = None
    primary_crop: Optional[str] = None
    preferred_language: str
    role: Optional[str] = "farmer"
    onboarding_done: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ExpertResponse(BaseModel):
    id: str
    name: str
    role: str
    rating: str
    cases: int
    image_url: str

    class Config:
        from_attributes = True

class ExpertReviewCreate(BaseModel):
    model_config = {"protected_namespaces": ()}
    crop_name: str
    image_url: Optional[str] = None
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_severity: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    question: Optional[str] = None
    status: Optional[str] = "pending"

class ExpertReviewUpdate(BaseModel):
    model_config = {"protected_namespaces": ()}
    status: Optional[str] = None
    expert_comments: Optional[str] = None
    recommendations: Optional[str] = None
    reviewed_at: Optional[str] = None

class ExpertReviewResponse(ExpertReviewCreate):
    model_config = {"protected_namespaces": (), "from_attributes": True}
    id: str
    expert_comments: Optional[str] = None
    recommendations: Optional[str] = None
    reviewed_at: Optional[str] = None
    owner_id: Optional[str] = None
    farmer_name: Optional[str] = None
    farmer_mobile: Optional[str] = None
    farmer_email: Optional[str] = None
    created_date: datetime

class CropBase(BaseModel):
    name: Optional[str] = None
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    area: Optional[str] = None
    field_size: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    planting_date: Optional[str] = None
    health_status: Optional[str] = "healthy"

class CropCreate(CropBase):
    pass

class CropResponse(CropBase):
    id: str
    owner_id: Optional[str] = None
    class Config:
        from_attributes = True


class DiseaseBase(BaseModel):
    name: str
    crop: str
    description: Optional[str] = None
    symptoms: Optional[str] = None
    causes: Optional[str] = None
    management: Optional[str] = None
    prevention: Optional[str] = None
    safety_information: Optional[str] = None
    reference: Optional[str] = None
    last_updated: Optional[str] = None

class DiseaseCreate(DiseaseBase):
    pass

class DiseaseResponse(DiseaseBase):
    id: str
    created_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class PredictionRequest(BaseModel):
    crop: Optional[str] = "Tomato"
    image_url: Optional[str] = None
    image_base64: Optional[str] = None

class DiagnosisCreate(BaseModel):
    model_config = {"protected_namespaces": ()}
    crop_id: Optional[str] = None
    crop_name: str
    image_url: str
    gradcam_url: Optional[str] = None
    disease: Optional[str] = None
    predicted_disease: Optional[str] = None
    confidence: Optional[float] = None
    severity: Optional[str] = None
    status: Optional[str] = "completed"
    model_version: Optional[str] = None
    explanation: Optional[str] = None
    treatment: Optional[str] = None
    prevention: Optional[str] = None
    safety: Optional[str] = None
    top_predictions: Optional[Any] = None
    quality_checks: Optional[Any] = None
    is_demo: Optional[bool] = False

class DiagnosisResponse(BaseModel):
    model_config = {"protected_namespaces": (), "from_attributes": True}
    id: str
    crop_id: Optional[str] = None
    crop_name: str
    image_url: str
    gradcam_url: Optional[str] = None
    disease: Optional[str] = None
    predicted_disease: Optional[str] = None
    confidence: Optional[float] = None
    severity: Optional[str] = None
    status: Optional[str] = "completed"
    model_version: Optional[str] = None
    explanation: Optional[str] = None
    treatment: Optional[str] = None
    prevention: Optional[str] = None
    safety: Optional[str] = None
    top_predictions: Optional[Any] = None
    quality_checks: Optional[Any] = None
    owner_id: Optional[str] = None
    created_date: datetime

