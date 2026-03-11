import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import ParsedResume, ParseResumeResponse, SaveResumeResponse
from services.parser import extract_text
from services.openai_service import parse_resume_text
from utils.file_utils import validate_file, save_temp_file, cleanup_temp_file

router = APIRouter()

# In-memory session store (MVP — single user, no persistence needed)
_sessions: dict[str, ParsedResume] = {}


@router.post("/parse", response_model=ParseResumeResponse)
async def parse_resume(file: UploadFile = File(...)):
    ext = validate_file(file)
    tmp_path = await save_temp_file(file, suffix=ext)
    try:
        raw_text = extract_text(tmp_path, ext)
        if not raw_text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from the uploaded file.")

        parsed = await parse_resume_text(raw_text)
        session_id = str(uuid.uuid4())
        _sessions[session_id] = parsed
        return ParseResumeResponse(session_id=session_id, parsed=parsed)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cleanup_temp_file(tmp_path)


@router.put("/{session_id}", response_model=SaveResumeResponse)
async def save_resume(session_id: str, resume: ParsedResume):
    _sessions[session_id] = resume
    return SaveResumeResponse(session_id=session_id, saved=True)


def get_session(session_id: str) -> ParsedResume:
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return _sessions[session_id]
