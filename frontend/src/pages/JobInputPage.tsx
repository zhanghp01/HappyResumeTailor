import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import JobDescriptionInput from '../components/job/JobDescriptionInput';

export default function JobInputPage() {
  const navigate = useNavigate();
  const { editedResume, setCurrentStep } = useResumeStore();

  if (!editedResume) {
    return (
      <div className="text-center mt-20 text-gray-500">
        No resume loaded. <a href="/" className="text-indigo-600 underline">Upload one first.</a>
      </div>
    );
  }

  const handleBack = () => {
    setCurrentStep('review');
    navigate('/review');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
          <p className="text-gray-500 mt-1 text-sm">Paste the job description and we'll tailor your bullet points.</p>
        </div>
      </div>
      <JobDescriptionInput />
    </div>
  );
}
