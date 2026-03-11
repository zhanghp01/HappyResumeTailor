import { useResumeStore } from '../../store/resumeStore';

export default function SummarySection() {
  const summary = useResumeStore((s) => s.editedResume?.summary ?? '');
  const updateSummary = useResumeStore((s) => s.updateSummary);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Summary</h2>
      <textarea
        className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg p-3 resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={summary || ''}
        onChange={(e) => updateSummary(e.target.value)}
        placeholder="Professional summary…"
      />
    </div>
  );
}
