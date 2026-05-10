import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from ..models import User
from ..schemas import UploadOut
from ..security import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}

STATIC_DIR = Path(os.getenv("STATIC_DIR", Path(__file__).resolve().parent.parent / "static"))
IMAGES_DIR = STATIC_DIR / "images"
PUBLIC_URL_PREFIX = "/static/images"


@router.post("", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> UploadOut:
    ext = Path(file.filename or "").suffix.lower()
    if file.content_type not in ALLOWED_CONTENT_TYPES or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type",
        )

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    target_path = IMAGES_DIR / stored_name

    contents = await file.read()
    target_path.write_bytes(contents)

    return UploadOut(url=f"{PUBLIC_URL_PREFIX}/{stored_name}")
