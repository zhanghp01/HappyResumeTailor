import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseResume } from '../../api/client';
import { useResumeStore } from '../../store/resumeStore';

export default function UploadZone() {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { setSessionId, setParsedResume, setCurrentStep, setLoading, setError, isLoading, error } =
    useResumeStore();

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const result = await parseResume(file);
      setSessionId(result.session_id);
      setParsedResume(result.parsed);
      setCurrentStep('review');
      navigate('/review');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to parse resume. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-lg border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors ${
          dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <div className="text-5xl">📄</div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">Drop your resume here</p>
          <p className="text-sm text-gray-500 mt-1">or click to browse — PDF or DOCX</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 text-indigo-600">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="font-medium">Parsing your resume with AI…</span>
        </div>
      )}

      {error && (
        <div className="w-full max-w-lg bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
