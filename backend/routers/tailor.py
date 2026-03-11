from fastapi import APIRouter, HTTPException
from models.schemas import TailorRequest, TailorResponse
from services.tailor_service import tailor_all

router = APIRouter()


@router.post("", response_model=TailorResponse)
async def tailor_resume(request: TailorRequest):
    if not request.resume.experience and not request.resume.projects:
        raise HTTPException(status_code=422, detail="Resume has no experience or project entries to tailor.")
    if not request.job_description.strip():
        raise HTTPException(status_code=422, detail="Job description cannot be empty.")

    try:
        tailored_exp, tailored_proj = await tailor_all(request.resume, request.job_description)
        return TailorResponse(
            session_id=request.session_id,
            tailored_experience=tailored_exp,
            tailored_projects=tailored_proj,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
