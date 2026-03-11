import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import ContactSection from '../components/resume/ContactSection';
import SummarySection from '../components/resume/SummarySection';
import ExperienceSection from '../components/resume/ExperienceSection';
import ProjectsSection from '../components/resume/ProjectsSection';
import EducationSection from '../components/resume/EducationSection';
import SkillsSection from '../components/resume/SkillsSection';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { editedResume, setCurrentStep } = useResumeStore();

  if (!editedResume) {
    return (
      <div className="text-center mt-20 text-gray-500">
        No resume loaded. <a href="/" className="text-indigo-600 underline">Upload one first.</a>
      </div>
    );
  }

  const handleContinue = () => {
    setCurrentStep('job');
    navigate('/job');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Review Your Resume</h2>
        <p className="text-gray-500 mt-1 text-sm">Edit any section before tailoring. Bullet points are fully editable.</p>
      </div>

      <div className="flex flex-col gap-4">
        <ContactSection contact={editedResume.contact} />
        {editedResume.summary !== null && <SummarySection />}
        <ExperienceSection />
        <ProjectsSection />
        <EducationSection />
        <SkillsSection />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Looks Good — Add Job Description →
        </button>
      </div>
    </div>
  );
}
