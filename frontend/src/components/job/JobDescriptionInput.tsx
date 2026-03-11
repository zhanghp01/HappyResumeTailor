import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../../store/resumeStore';
import { tailorResume } from '../../api/client';

export default function JobDescriptionInput() {
  const navigate = useNavigate();
  const {
    sessionId,
    editedResume,
    jobDescription,
    setJobDescription,
    setTailoredExperience,
    setTailoredProjects,
    setCurrentStep,
    setLoading,
    setError,
    isLoading,
    error,
  } = useResumeStore();

  const handleTailor = async () => {
    if (!sessionId || !editedResume) return;
    if (!jobDescription.trim()) {
      setError('Please enter a job description before continuing.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await tailorResume(sessionId, jobDescription, editedResume);
      setTailoredExperience(result.tailored_experience);
      setTailoredProjects(result.tailored_projects ?? []);
      setCurrentStep('compare');
      navigate('/compare');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to tailor resume. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste the Job Description
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-xl p-4 text-sm text-gray-800 min-h-[300px] resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Paste the full job description here…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleTailor}
        disabled={isLoading || !jobDescription.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Tailoring your resume…
          </>
        ) : (
          'Tailor My Resume →'
        )}
      </button>
    </div>
  );
}
