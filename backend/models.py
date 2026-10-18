from sqlalchemy import Boolean, Column, ForeignKey, Integer, Float, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    mobile = Column(String, nullable=True)
    village = Column(String, nullable=True)
    primary_crop = Column(String, nullable=True)
    preferred_language = Column(String, default="en")
    role = Column(String, default="farmer")
    onboarding_done = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    crops = relationship("Crop", back_populates="owner")
    diagnoses = relationship("Diagnosis", back_populates="owner")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=True)
    crop_name = Column(String, index=True, nullable=True)
    variety = Column(String, nullable=True)
    area = Column(String, nullable=True)
    field_size = Column(String, nullable=True)
    location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    planting_date = Column(String, nullable=True)
    health_status = Column(String, default="healthy")
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="crops")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(String, primary_key=True, index=True)
    crop_id = Column(String, nullable=True)
    crop_name = Column(String, index=True)
    image_url = Column(String)
    gradcam_url = Column(String, nullable=True)
    disease = Column(String, nullable=True)
    predicted_disease = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    severity = Column(String, nullable=True)
    status = Column(String, default="completed")
    model_version = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    prevention = Column(Text, nullable=True)
    safety = Column(Text, nullable=True)
    top_predictions = Column(Text, nullable=True)
    quality_checks = Column(Text, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="diagnoses")


class ExpertProfile(Base):
    __tablename__ = "experts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)
    rating = Column(String)
    cases = Column(Integer)
    image_url = Column(String)

class ExpertReview(Base):
    __tablename__ = "expert_reviews"

    id = Column(String, primary_key=True, index=True)
    crop_name = Column(String)
    image_url = Column(String, nullable=True)
    ai_prediction = Column(String, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    ai_severity = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    question = Column(Text, nullable=True)
    status = Column(String, default="pending")
    expert_comments = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    reviewed_at = Column(String, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    crop = Column(String, index=True)
    description = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    causes = Column(Text, nullable=True)
    management = Column(Text, nullable=True)
    prevention = Column(Text, nullable=True)
    safety_information = Column(Text, nullable=True)
    reference = Column(String, nullable=True)
    last_updated = Column(String, nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, index=True)
    crop_id = Column(String, nullable=True)
    crop_name = Column(String, nullable=True)
    title = Column(String, nullable=True)
    reminder_date = Column(String, nullable=True)
    status = Column(String, default="pending")
    notes = Column(Text, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, default="advisory")
    title = Column(String)
    message = Column(Text)
    read = Column(Boolean, default=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")

