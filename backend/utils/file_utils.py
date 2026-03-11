import os
import tempfile
from fastapi import UploadFile, HTTPException

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}


def validate_file(file: UploadFile) -> str:
    """Validate file type and return the file extension."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{ext}'. Please upload a PDF or DOCX file.",
        )
    return ext


async def save_temp_file(file: UploadFile, suffix: str) -> str:
    """Save uploaded file to a temporary location and return the path."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        return tmp.name


def cleanup_temp_file(path: str) -> None:
    """Remove a temporary file, ignoring errors."""
    try:
        os.unlink(path)
    except OSError:
        pass
