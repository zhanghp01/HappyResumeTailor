import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import ComparisonView from '../components/comparison/ComparisonView';

export default function ComparisonPage() {
  const navigate = useNavigate();
  const { tailoredExperience, setCurrentStep, reset } = useResumeStore();

  if (!tailoredExperience) {
    return (
      <div className="text-center mt-20 text-gray-500">
        No tailored resume. <a href="/" className="text-indigo-600 underline">Start over.</a>
      </div>
    );
  }

  const handleBack = () => {
    setCurrentStep('job');
    navigate('/job');
  };

  const handleStartOver = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Tailored Resume</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Green highlights show AI changes. Accept or reject each bullet, then copy the result.
            </p>
          </div>
        </div>
        <button
          onClick={handleStartOver}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Start Over
        </button>
      </div>

      <ComparisonView />
    </div>
  );
}
