from pydantic import BaseModel
from typing import Optional


class Bullet(BaseModel):
    id: str
    text: str


class ExperienceEntry(BaseModel):
    id: str
    company: str
    title: str
    dates: str
    location: str
    bullets: list[Bullet]


class EducationEntry(BaseModel):
    id: str
    institution: str
    degree: str
    dates: str
    gpa: Optional[str] = None
    notes: list[str] = []


class ProjectEntry(BaseModel):
    id: str           # "proj-0", "proj-1" ...
    name: str
    role: Optional[str] = None
    technologies: Optional[str] = None
    dates: Optional[str] = None
    bullets: list[Bullet]


class ParsedResume(BaseModel):
    contact: dict
    summary: Optional[str] = None
    experience: list[ExperienceEntry] = []
    projects: list[ProjectEntry] = []
    education: list[EducationEntry] = []
    skills: dict = {}
    skills_raw: Optional[str] = None
    additional: list[str] = []
    section_order: list[str] = []


class ParseResumeResponse(BaseModel):
    session_id: str
    parsed: ParsedResume


class SaveResumeResponse(BaseModel):
    session_id: str
    saved: bool


class TailorRequest(BaseModel):
    session_id: str
    job_description: str
    resume: ParsedResume


class TailoredBullet(BaseModel):
    id: str
    original: str
    tailored: str
    changed: bool


class TailoredExperience(BaseModel):
    id: str
    company: str
    title: str
    bullets: list[TailoredBullet]


class TailoredProject(BaseModel):
    id: str
    name: str
    bullets: list[TailoredBullet]


class TailorResponse(BaseModel):
    session_id: str
    tailored_experience: list[TailoredExperience]
    tailored_projects: list[TailoredProject] = []
