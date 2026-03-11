"""Orchestrates parallel tailoring of all experience and project entries."""

import asyncio
from models.schemas import (
    ParsedResume, TailoredExperience, TailoredProject, TailoredBullet
)
from services.openai_service import tailor_resume_bullets, tailor_project_bullets


def _build_tailored_bullets(original_bullets, result: dict) -> list[TailoredBullet]:
    bullet_map = {b.id: b.text for b in original_bullets}
    tailored = []
    for item in result.get("tailored", []):
        bid = item["id"]
        original_text = bullet_map.get(bid, "")
        tailored_text = item.get("tailored_text", original_text)
        changed = item.get("changed", tailored_text != original_text)
        tailored.append(TailoredBullet(
            id=bid, original=original_text, tailored=tailored_text, changed=changed,
        ))
    return tailored


async def tailor_all(
    resume: ParsedResume, job_description: str
) -> tuple[list[TailoredExperience], list[TailoredProject]]:
    """Tailor all experience and project entries in parallel."""

    async def tailor_exp(entry):
        result = await tailor_resume_bullets(entry, job_description)
        return TailoredExperience(
            id=entry.id, company=entry.company, title=entry.title,
            bullets=_build_tailored_bullets(entry.bullets, result),
        )

    async def tailor_proj(entry):
        result = await tailor_project_bullets(entry, job_description)
        return TailoredProject(
            id=entry.id, name=entry.name,
            bullets=_build_tailored_bullets(entry.bullets, result),
        )

    exp_tasks = [tailor_exp(e) for e in resume.experience]
    proj_tasks = [tailor_proj(p) for p in resume.projects]

    results = await asyncio.gather(*exp_tasks, *proj_tasks)
    n_exp = len(exp_tasks)
    return list(results[:n_exp]), list(results[n_exp:])
