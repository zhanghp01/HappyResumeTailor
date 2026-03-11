import { useResumeStore } from '../../store/resumeStore';

export default function EducationSection() {
  const education = useResumeStore((s) => s.editedResume?.education ?? []);

  if (education.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wide">Education</h2>
      <div className="flex flex-col gap-4">
        {education.map((entry) => (
          <div key={entry.id} className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800">{entry.degree}</p>
              <p className="text-sm text-gray-500">{entry.institution}</p>
              {entry.gpa && <p className="text-xs text-gray-400">GPA: {entry.gpa}</p>}
              {entry.notes.length > 0 && (
                <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
                  {entry.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              )}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{entry.dates}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
