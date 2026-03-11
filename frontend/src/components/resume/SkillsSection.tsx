import { useResumeStore } from '../../store/resumeStore';

export default function SkillsSection() {
  const skills = useResumeStore((s) => s.editedResume?.skills ?? {});

  const categories = Object.entries(skills).filter(([, items]) => items && items.length > 0);

  if (categories.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Skills</h2>
      <div className="flex flex-col gap-3">
        {categories.map(([category, items]) => (
          <div key={category}>
            <p className="text-xs text-gray-400 font-medium capitalize mb-1">{category}</p>
            <div className="flex flex-wrap gap-2">
              {(items ?? []).map((skill) => (
                <span
                  key={skill}
                  className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
