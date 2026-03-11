import { useResumeStore } from '../../store/resumeStore';

export default function ProjectsSection() {
  const projects = useResumeStore((s) => s.editedResume?.projects ?? []);
  const updateProjectBullet = useResumeStore((s) => s.updateProjectBullet);

  if (projects.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wide">Projects</h2>
      <div className="flex flex-col gap-6">
        {projects.map((proj) => (
          <div key={proj.id}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="font-semibold text-gray-800">{proj.name}</p>
                {proj.role && <p className="text-sm text-gray-500">{proj.role}</p>}
                {proj.technologies && (
                  <p className="text-xs text-indigo-500 mt-0.5">{proj.technologies}</p>
                )}
              </div>
              {proj.dates && (
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{proj.dates}</span>
              )}
            </div>
            <ul className="mt-2 flex flex-col gap-2">
              {proj.bullets.map((bullet) => (
                <li key={bullet.id} className="flex gap-2 items-start">
                  <span className="text-gray-400 mt-2 text-xs">•</span>
                  <textarea
                    className="flex-1 text-sm text-gray-800 border border-gray-200 rounded-lg p-2 resize-y min-h-[40px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={bullet.text}
                    onChange={(e) => updateProjectBullet(proj.id, bullet.id, e.target.value)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
