"""All OpenAI API interactions."""

import json
import os
from openai import AsyncOpenAI
from models.schemas import ParsedResume, ExperienceEntry, ProjectEntry

client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

PARSE_SYSTEM_PROMPT = """You are an expert resume parser. Your job is to extract structured information from raw resume text and return it as valid JSON. Preserve all original wording exactly — do not paraphrase or summarize. If a field is missing or cannot be determined, use null or an empty array/object."""

PARSE_USER_TEMPLATE = """Parse the following resume text into this exact JSON structure:

{{
  "contact": {{
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null",
    "github": "string or null"
  }},
  "summary": "full summary paragraph or null",
  "experience": [
    {{
      "id": "exp-0",
      "company": "string",
      "title": "string",
      "dates": "string",
      "location": "string",
      "bullets": [
        {{ "id": "b-0-0", "text": "bullet text" }}
      ]
    }}
  ],
  "education": [
    {{
      "id": "edu-0",
      "institution": "string",
      "degree": "string",
      "dates": "string",
      "gpa": "string or null",
      "notes": []
    }}
  ],
  "skills": {{
    "languages": [],
    "frameworks": [],
    "tools": [],
    "other": []
  }},
  "projects": [
    {{
      "id": "proj-0",
      "name": "string",
      "role": "string or null",
      "technologies": "string or null",
      "dates": "string or null",
      "bullets": [
        {{ "id": "p-0-0", "text": "bullet text" }}
      ]
    }}
  ],
  "skills_raw": "the skills section exactly as it appears in the resume, as a single string (e.g. 'Python, JavaScript, React'). Preserve original formatting.",
  "additional": [],
  "section_order": ["list of section names in the order they appear in the resume, using these exact keys: contact, summary, experience, projects, education, skills, additional"]
}}

Rules:
- IDs for experience: "exp-0", "exp-1", etc. (zero-indexed)
- IDs for experience bullets: "b-{{exp_index}}-{{bullet_index}}" e.g. "b-0-0", "b-0-1", "b-1-0"
- IDs for projects: "proj-0", "proj-1", etc. (zero-indexed)
- IDs for project bullets: "p-{{proj_index}}-{{bullet_index}}" e.g. "p-0-0", "p-0-1", "p-1-0"
- IDs for education: "edu-0", "edu-1", etc.
- Preserve exact wording for all bullet points
- If there are no projects, use an empty array for "projects"
- section_order must only contain keys that are actually present in the resume
- Return ONLY valid JSON with no markdown fences or explanation

Resume text:
---
{raw_text}
---"""

TAILOR_SYSTEM_PROMPT = """You are a professional resume writer and career coach specializing in tailoring resumes to specific job descriptions. You will rewrite resume bullet points to better match the keywords, technologies, and tone of a target job description.

Rules:
1. Preserve factual content and quantitative metrics — never invent or change numbers.
2. Integrate relevant keywords from the job description naturally.
3. Use strong action verbs that mirror the job description's language where authentic.
4. Keep bullets concise (1-2 lines max). Do not add new bullets — only rewrite existing ones.
5. If a bullet is already a strong match for the job description, return it unchanged with "changed": false.
6. Return ONLY valid JSON, no markdown fences or explanation."""

TAILOR_USER_TEMPLATE = """Job Description:
---
{job_description}
---

Rewrite each bullet point below to better align with the job description.
Return a JSON object with this exact shape:

{{
  "tailored": [
    {{
      "id": "<original bullet id>",
      "tailored_text": "<rewritten bullet>",
      "changed": true
    }}
  ]
}}

Bullets to tailor (from {company} — {title}):
{bullets_text}"""


async def parse_resume_text(raw_text: str) -> ParsedResume:
    """Call OpenAI to parse raw resume text into a structured ParsedResume."""
    user_prompt = PARSE_USER_TEMPLATE.format(raw_text=raw_text)

    response = await client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": PARSE_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )

    raw_json = response.choices[0].message.content
    data = json.loads(raw_json)

    try:
        return ParsedResume(**data)
    except Exception as validation_error:
        # Retry once with the validation error appended
        retry_prompt = (
            user_prompt
            + f"\n\nNote: Your previous response failed validation with this error:\n{validation_error}\nPlease fix and return valid JSON matching the schema."
        )
        retry_response = await client.chat.completions.create(
            model="gpt-4o",
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": PARSE_SYSTEM_PROMPT},
                {"role": "user", "content": retry_prompt},
            ],
        )
        raw_json2 = retry_response.choices[0].message.content
        data2 = json.loads(raw_json2)
        return ParsedResume(**data2)


async def tailor_project_bullets(
    entry: ProjectEntry, job_description: str
) -> dict:
    """Tailor bullet points for a single project entry."""
    bullets_text = "\n".join(f'{b.id}: "{b.text}"' for b in entry.bullets)
    tech = f" (Technologies: {entry.technologies})" if entry.technologies else ""
    user_prompt = TAILOR_USER_TEMPLATE.format(
        job_description=job_description,
        company="Project",
        title=f"{entry.name}{tech}",
        bullets_text=bullets_text,
    )
    response = await client.chat.completions.create(
        model="gpt-4o",
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": TAILOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return json.loads(response.choices[0].message.content)


async def tailor_resume_bullets(
    entry: ExperienceEntry, job_description: str
) -> dict:
    """Tailor bullet points for a single experience entry. Returns dict with 'tailored' list."""
    bullets_text = "\n".join(
        f'{b.id}: "{b.text}"' for b in entry.bullets
    )
    user_prompt = TAILOR_USER_TEMPLATE.format(
        job_description=job_description,
        company=entry.company,
        title=entry.title,
        bullets_text=bullets_text,
    )

    response = await client.chat.completions.create(
        model="gpt-4o",
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": TAILOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )

    raw_json = response.choices[0].message.content
    return json.loads(raw_json)
