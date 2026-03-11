import type { ParsedResume } from '../../types/resume';

interface Props {
  contact: ParsedResume['contact'];
}

export default function ContactSection({ contact }: Props) {
  const fields = [
    { label: 'Name', value: contact.name },
    { label: 'Email', value: contact.email },
    { label: 'Phone', value: contact.phone },
    { label: 'Location', value: contact.location },
    { label: 'LinkedIn', value: contact.linkedin },
    { label: 'GitHub', value: contact.github },
  ].filter((f) => f.value);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-700 mb-3 uppercase tracking-wide text-xs">Contact</h2>
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f) => (
          <div key={f.label}>
            <span className="text-xs text-gray-400 font-medium">{f.label}</span>
            <p className="text-sm text-gray-800">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
