# HappyResumeTailor — Setup & Run Instructions

HappyResumeTailor tailors your resume to a job description using GPT-4o. Upload your PDF or DOCX resume, review the parsed sections, paste a job description, and get a side-by-side comparison of original vs. tailored bullet points — with per-bullet Accept/Edit/Keep controls and DOCX export.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.10+ | |
| Node.js | 20+ | Use [nvm](https://github.com/nvm-sh/nvm) if needed |
| npm | 8+ | Comes with Node.js |
| OpenAI API key | — | [Get one here](https://platform.openai.com/api-keys) |

---

## 1. Clone / Open the Project

```bash
cd "HappyResumeTailor"
```

---

## 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Add your OpenAI API key
echo "OPENAI_API_KEY=sk-..." > .env
```

**Start the backend server:**

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

## 3. Frontend Setup

Open a **new terminal tab/window**:

```bash
cd "HappyResumeTailor/frontend"

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

> The frontend proxies all `/api/*` requests to `http://localhost:8000`, so no CORS configuration is needed.

---

## 4. Using the App

1. **Upload Resume** — drag and drop or click to upload a `.pdf` or `.docx` resume
2. **Review & Edit** — verify parsed sections; click any bullet to edit it inline
3. **Job Description** — paste the full job posting and click "Tailor My Resume"
4. **Compare** — review original vs. tailored bullets side by side:
   - **✓ Accept** — use the tailored version
   - **✗ Keep Original** — keep your original wording
   - **✎** — edit either version manually before deciding
5. Click **Generate New Resume** to preview the final text, then:
   - **Copy to Clipboard** — paste anywhere
   - **↓ Download .docx** — download a formatted Word document

---

## Troubleshooting

**Port 8000 already in use:**
```bash
lsof -ti :8000 | xargs kill -9
```

**`ModuleNotFoundError: No module named 'openai'`:**
Make sure the virtual environment is activated before running uvicorn:
```bash
source backend/venv/bin/activate
```

**Node.js version too old (Vite requires 20+):**
```bash
# Install nvm if not already installed, then:
nvm install 20
nvm use 20
```

**Blank page in browser:**
Check the browser console for errors. The most common cause is a missing `import type` — this is already fixed in the codebase.
