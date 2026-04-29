import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from slowapi import Limiter  # type: ignore
from slowapi.util import get_remote_address  # type: ignore

from models.disease_info import DiseaseInfo
from models.disease_request import DiseaseRequest
from routers.city import get_db
from schemas.disease import DiseaseRequestSchema
from services.disease_engine import predict_disease
from services.logger import log_request

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def build_upload_response(db: Session, safe_filename: str):
    raise HTTPException(status_code=503, detail="Disease model is unavailable right now")


def build_model_response(db: Session, safe_filename: str, image_bytes: bytes):
    result = predict_disease(image_bytes)

    new_request = DiseaseRequest(
        image_url=safe_filename,
        prediction=result["prediction"],
        confidence=result["confidence"] / 100,
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    log_request(
        request_type="upload_image",
        input_data={"filename": safe_filename},
        result=result["prediction"],
    )

    return {
        "filename": safe_filename,
        "prediction": result["prediction"],
        "disease": result["disease"],
        "confidence": result["confidence"],
        "description": result["description"],
        "treatment": result["treatment"],
    }


@router.post("/upload-image")
@limiter.limit("10/minute")
def upload_image(
    request: Request,
    file: UploadFile | None = File(default=None),
    image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    uploaded_file = file or image
    if uploaded_file is None:
        raise HTTPException(status_code=400, detail="Image file is required")

    original_name = uploaded_file.filename or "upload.jpg"
    content_type = (uploaded_file.content_type or "").lower()
    is_supported_extension = original_name.lower().endswith((".jpg", ".png", ".jpeg", ".webp", ".jfif"))
    is_supported_content_type = content_type.startswith("image/")

    if not is_supported_extension and not is_supported_content_type:
        raise HTTPException(status_code=400, detail="Invalid file type")

    extension = Path(original_name).suffix.lower() or ".jpg"
    safe_filename = f"{uuid4().hex}{extension}"
    file_path = os.path.join(UPLOAD_FOLDER, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(uploaded_file.file, buffer)
    uploaded_file.file.close()

    with open(file_path, "rb") as saved_file:
        image_bytes = saved_file.read()

    try:
        return build_model_response(db, safe_filename, image_bytes)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Disease detection failed: {exc}")


@router.post("/disease-request")
def create_disease_request(
    data: DiseaseRequestSchema,
    db: Session = Depends(get_db),
):
    new_request = DiseaseRequest(**data.dict())

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.get("/disease-requests")
def get_all_requests(db: Session = Depends(get_db)):
    return db.query(DiseaseRequest).all()


@router.post("/disease")
def detect_disease_for_frontend(
    request: Request,
    file: UploadFile | None = File(default=None),
    image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    return upload_image(request=request, file=file, image=image, db=db)
