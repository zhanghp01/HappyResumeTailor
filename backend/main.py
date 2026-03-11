from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, tailor

app = FastAPI(title="Resume Tailor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(tailor.router, prefix="/api/tailor", tags=["tailor"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
