[HappyResumeTailor.pdf](https://github.com/user-attachments/files/25914759/HappyResumeTailor.pdf)# HappyResumeTailor

A web application that uses AI to tailor your resume bullet points to match a specific job description. Upload your resume, review the parsed sections, paste a job description, and get a side-by-side comparison of your original and AI-rewritten bullet points — with per-bullet Accept/Edit/Keep controls and DOCX export.

---

## Demo
<img width="844" height="388" alt="Screenshot 2026-03-11 at 08 25 39" src="https://github.com/user-attachments/assets/95873422-c692-44e3-a0b1-d33a01aaf0c5" />
<img width="843" height="387" alt="IMG_0883" src="https://github.com/user-attachments/assets/85ce31e6-abc2-44a5-984d-06137856b3a4" />
<img width="845" height="384" alt="Screenshot 2026-03-11 at 08 25 52" src="https://github.com/user-attachments/assets/e9b4881e-3ed9-4d06-bb17-22aa356c9205" />
<img width="844" height="389" alt="IMG_0884" src="https://github.com/user-attachments/assets/57179fff-e45d-4f52-8114-78c72ff4e2b0" />


## Features

- **PDF & DOCX upload** — drag-and-drop or click to upload your resume in either format
- **AI-powered parsing** — GPT-4o extracts contact info, summary, experience, projects, education, and skills into structured sections; original section order and one-line skills format are preserved
- **Editable review** — every bullet point in every section (experience and projects) is an editable text field so you can correct parsing errors before tailoring
- **Parallel tailoring** — each experience and project entry is tailored by GPT-4o concurrently, minimizing wait time
- **Side-by-side comparison** — original bullets on the left, tailored bullets on the right with word-level green diff highlights
- **Per-bullet controls** — Accept, Keep Original, or edit the text inline for both tailored and original bullets
- **Copy per bullet** — copy any individual bullet to your clipboard with one click
- **Copy full resume** — copy the entire tailored resume as plain text
- **Download as DOCX** — export your final resume as a formatted `.docx` file that mirrors the original section order
- **Step navigation** — clickable step indicators in the header let you jump back to any previous step

---

## How It Works

**1. Upload Resume**
Drop a PDF or DOCX file onto the upload zone. The backend extracts the raw text (`pdfplumber` for PDFs, `python-docx` for Word files) and sends it to `gpt-4o`, which parses it into structured sections while preserving the original section order and skills format.

**2. Review & Edit**
The parsed resume is displayed section by section — contact, summary, experience, projects, education, and skills. Every bullet point is an editable text field. Fix any parsing errors or tweak wording before proceeding.

**3. Job Description**
Paste the full job description. Clicking "Tailor My Resume" sends each experience and project entry to `gpt-4o` in parallel. The model rewrites each bullet to naturally incorporate relevant keywords, technologies, and tone — without inventing new facts or metrics.

**4. Compare & Export**
Original bullets appear on the left; tailored bullets appear on the right with word-level diff highlighting. For each changed bullet you can:
- **Accept** — use the tailored version (editable inline)
- **Keep Original** — use the original text (also editable inline)
- **Copy** — copy that single bullet to clipboard

When satisfied, copy the full resume to clipboard or download it as a `.docx` file.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| AI | OpenAI `gpt-4o` |
| PDF parsing | pdfplumber (primary), pypdf (fallback) |
| DOCX parsing | python-docx |
| DOCX export | `docx` npm package |
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS |
| State management | Zustand |
| HTTP client | Axios |
| Diff highlighting | diff-match-patch |

---

## Project Structure

```
HappyResumeTailor/
├── backend/
│   ├── main.py                  # FastAPI app entry point, CORS config
│   ├── requirements.txt
│   ├── .env                     # Set OPENAI_API_KEY here
│   ├── routers/
│   │   ├── resume.py            # POST /api/resume/parse, PUT /api/resume/{id}
│   │   └── tailor.py            # POST /api/tailor
│   ├── services/
│   │   ├── parser.py            # File text extraction (PDF + DOCX)
│   │   ├── openai_service.py    # All OpenAI prompts and API calls
│   │   └── tailor_service.py    # Parallel tailoring with asyncio.gather
│   ├── models/
│   │   └── schemas.py           # Pydantic data models
│   └── utils/
│       └── file_utils.py        # File validation and temp file handling
│
└── frontend/
    └── src/
        ├── api/client.ts        # Typed Axios API calls
        ├── store/resumeStore.ts # Zustand global state store
        ├── types/resume.ts      # TypeScript interfaces
        ├── utils/generateDocx.ts # Client-side DOCX generation
        ├── pages/               # UploadPage, ReviewPage, JobInputPage, ComparisonPage
        └── components/
            ├── layout/          # Header with clickable step navigation
            ├── upload/          # Drag-and-drop upload zone
            ├── resume/          # Editable sections: Experience, Projects, Education, Skills
            ├── job/             # Job description input
            └── comparison/      # Side-by-side diff view with Accept/Edit/Keep controls
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/resume/parse` | Upload file → returns parsed resume + session ID |
| `PUT` | `/api/resume/{session_id}` | Save user edits back to the session |
| `POST` | `/api/tailor` | Tailor bullet points against a job description |

---

## Getting Started

See [INSTRUCTIONS.md](INSTRUCTIONS.md) for full setup steps.

### Quick Start

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create .env and add: OPENAI_API_KEY=sk-...
uvicorn main:app --reload --port 8000
```

**Frontend** (new terminal tab)
```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`
API docs: `http://localhost:8000/docs`

The Vite dev server proxies all `/api/*` requests to `http://localhost:8000` — no CORS configuration needed.

---

## Key Design Decisions

- **Stateless backend** — the parsed resume is passed in the `/api/tailor` request body, so no database is needed for this single-user local tool
- **Parallel tailoring** — `asyncio.gather` runs one `gpt-4o` call per experience/project entry concurrently, significantly reducing total wait time
- **Section order preservation** — `section_order` is parsed from the resume and respected in both plain-text and DOCX output
- **Skills format preservation** — `skills_raw` stores the original one-line skills string and is used as-is in the generated resume
- **Word-level diff** — `diff-match-patch` highlights changed words inline rather than showing the full rewrite
- **Client-side DOCX** — the `docx` npm package generates the `.docx` file entirely in the browser; no server round-trip needed
- **Per-bullet editing** — both tailored and original texts are editable after Accept/Keep Original is chosen, giving full control over the final output
