from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite by default so the app runs without needing to install PostgreSQL/Docker
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cropcare.db")

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def sync_schema():
    """Ensure newly added columns exist in SQLite/PostgreSQL tables."""
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            columns = [
                ("crop_id", "VARCHAR"),
                ("gradcam_url", "VARCHAR"),
                ("predicted_disease", "VARCHAR"),
                ("status", "VARCHAR DEFAULT 'completed'"),
                ("model_version", "VARCHAR"),
                ("explanation", "TEXT"),
                ("prevention", "TEXT"),
                ("safety", "TEXT"),
                ("top_predictions", "TEXT"),
                ("quality_checks", "TEXT"),
            ]
            for col, col_type in columns:
                try:
                    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
                        conn.execute(text(f"ALTER TABLE diagnoses ADD COLUMN {col} {col_type}"))
                    else:
                        conn.execute(text(f"ALTER TABLE diagnoses ADD COLUMN IF NOT EXISTS {col} {col_type}"))
                    conn.commit()
                except Exception:
                    pass

            # Sync User and ExpertReview columns
            try:
                if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'farmer'"))
                else:
                    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'farmer'"))
                conn.commit()
            except Exception:
                pass

            try:
                if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
                    conn.execute(text("ALTER TABLE expert_reviews ADD COLUMN reviewed_at VARCHAR"))
                else:
                    conn.execute(text("ALTER TABLE expert_reviews ADD COLUMN IF NOT EXISTS reviewed_at VARCHAR"))
                conn.commit()
            except Exception:
                pass
    except Exception:
        pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

