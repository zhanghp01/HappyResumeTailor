import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../../store/resumeStore';

type StepKey = 'upload' | 'review' | 'job' | 'compare';

const STEPS: { key: StepKey; label: string; path: string }[] = [
  { key: 'upload', label: '1. Upload Resume', path: '/' },
  { key: 'review', label: '2. Review & Edit', path: '/review' },
  { key: 'job', label: '3. Job Description', path: '/job' },
  { key: 'compare', label: '4. Compare', path: '/compare' },
];

const STEP_ORDER: StepKey[] = ['upload', 'review', 'job', 'compare'];

export default function Header() {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, parsedResume, tailoredExperience } = useResumeStore();

  const currentIndex = STEP_ORDER.indexOf(currentStep);

  // A step is navigable if it's before the current step and has the required data
  const canNavigateTo = (key: StepKey): boolean => {
    const targetIndex = STEP_ORDER.indexOf(key);
    if (targetIndex >= currentIndex) return false; // can't jump forward
    if (key === 'review' || key === 'job') return parsedResume !== null;
    if (key === 'compare') return tailoredExperience !== null;
    return true; // upload is always reachable
  };

  const handleClick = (step: typeof STEPS[number]) => {
    if (!canNavigateTo(step.key)) return;
    setCurrentStep(step.key);
    navigate(step.path);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
        {/* Left: logo */}
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">HappyResumeTailor</h1>

        {/* Center: step indicators */}
        <nav className="flex items-center justify-center gap-2">
          {STEPS.map((step, i) => {
            const isActive = step.key === currentStep;
            const isPast = STEP_ORDER.indexOf(step.key) < currentIndex;
            const clickable = canNavigateTo(step.key);

            return (
              <div key={step.key} className="flex items-center gap-2">
                {i > 0 && (
                  <span className={`text-base ${isPast || isActive ? 'text-indigo-300' : 'text-gray-200'}`}>
                    ›
                  </span>
                )}
                <button
                  onClick={() => handleClick(step)}
                  disabled={!clickable}
                  title={clickable ? `Go back to ${step.label}` : undefined}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors
                    ${isActive ? 'bg-indigo-600 text-white shadow-sm' : ''}
                    ${isPast && !isActive ? 'text-indigo-500 hover:bg-indigo-50 cursor-pointer underline underline-offset-2' : ''}
                    ${!isPast && !isActive ? 'text-gray-300 cursor-default' : ''}
                  `}
                >
                  {step.label}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Right: intentionally empty for balance */}
        <div />
      </div>
    </header>
  );
}
