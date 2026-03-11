"""Extract raw text from PDF or DOCX files."""


def extract_text_from_pdf(path: str) -> str:
    """Extract text using pdfplumber (primary) with pypdf as fallback."""
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        text = "\n".join(text_parts)
        if text.strip():
            return text
    except Exception:
        pass

    # Fallback to pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(path)
        parts = []
        for page in reader.pages:
            parts.append(page.extract_text() or "")
        return "\n".join(parts)
    except Exception as e:
        raise ValueError(f"Could not extract text from PDF: {e}")


def extract_text_from_docx(path: str) -> str:
    """Extract text from a DOCX file."""
    try:
        from docx import Document
        doc = Document(path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        raise ValueError(f"Could not extract text from DOCX: {e}")


def extract_text(path: str, extension: str) -> str:
    """Dispatch to the correct extractor based on file extension."""
    if extension == ".pdf":
        return extract_text_from_pdf(path)
    elif extension in {".docx", ".doc"}:
        return extract_text_from_docx(path)
    else:
        raise ValueError(f"Unsupported extension: {extension}")
