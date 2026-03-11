import React, { useState, useMemo, useRef } from 'react';
import { useResumeStore } from '../../store/resumeStore';
import BulletDiff from './BulletDiff';
import { generateDocx, downloadBlob } from '../../utils/generateDocx';

function OriginalBullet({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <li className="flex items-start gap-2 border-l-4 border-gray-200 pl-3 py-1">
      <span className="text-sm text-gray-600 flex-1">{text}</span>
      <button
        onClick={handleCopy}
        title="Copy bullet"
        className={`shrink-0 text-sm px-3 py-1 rounded-lg font-medium transition-colors ${
          copied ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
      >
        {copied ? '✓' : '⎘'}
      </button>
    </li>
  );
}

export default function ComparisonView() {
  const tailoredExperience = useResumeStore((s) => s.tailoredExperience ?? []);
  const tailoredProjects = useResumeStore((s) => s.tailoredProjects ?? []);
  const editedResume = useResumeStore((s) => s.editedResume);

  // User edits to bullet text (id → custom string)
  const [editedTailored, setEditedTailored] = useState<Record<string, string>>({});
  const [editedOriginal, setEditedOriginal] = useState<Record<string, string>>({});

  const handleEditTailored = (id: string, text: string) =>
    setEditedTailored((prev) => ({ ...prev, [id]: text }));

  const handleEditOriginal = (id: string, text: string) =>
    setEditedOriginal((prev) => ({ ...prev, [id]: text }));

  // Single accepted map covers both experience and project bullet IDs
  const [accepted, setAccepted] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const exp of tailoredExperience) {
      for (const b of exp.bullets) { if (b.changed) initial[b.id] = true; }
    }
    for (const proj of tailoredProjects) {
      for (const b of proj.bullets) { if (b.changed) initial[b.id] = true; }
    }
    return initial;
  });

  const [showGenerated, setShowGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleAcceptChange = (id: string, val: boolean) =>
    setAccepted((prev) => ({ ...prev, [id]: val }));

  const effectiveTailored = (id: string, tailored: string) => editedTailored[id] ?? tailored;
  const effectiveOriginal = (id: string, original: string) => editedOriginal[id] ?? original;

  const generatedResume = useMemo(() => {
    if (!editedResume) return '';
    const { contact, summary, experience, projects, education, skills, skills_raw, additional, section_order } = editedResume;

    const renderContact = (): string[] => {
      const out: string[] = [];
      if (contact.name) out.push(contact.name);
      const parts = [contact.email, contact.phone, contact.location, contact.linkedin, contact.github].filter(Boolean);
      if (parts.length) out.push(parts.join(' | '));
      return out;
    };

    const renderSummary = (): string[] =>
      summary ? ['SUMMARY', summary] : [];

    const renderExperience = (): string[] => {
      if (!tailoredExperience.length) return [];
      const out: string[] = ['EXPERIENCE'];
      for (const exp of tailoredExperience) {
        const orig = experience.find((e) => e.id === exp.id);
        const datePart = orig?.dates ? `  ${orig.dates}` : '';
        const locPart = orig?.location ? `, ${orig.location}` : '';
        out.push(`${exp.title} | ${exp.company}${locPart}${datePart}`);
        for (const b of exp.bullets) {
          const text = b.changed && accepted[b.id] ? effectiveTailored(b.id, b.tailored) : effectiveOriginal(b.id, b.original);
          out.push(`  • ${text}`);
        }
        out.push('');
      }
      return out;
    };

    const renderProjects = (): string[] => {
      if (!tailoredProjects.length) return [];
      const out: string[] = ['PROJECTS'];
      for (const proj of tailoredProjects) {
        const orig = projects.find((p) => p.id === proj.id);
        const datePart = orig?.dates ? `  ${orig.dates}` : '';
        const techPart = orig?.technologies ? ` | ${orig.technologies}` : '';
        out.push(`${proj.name}${techPart}${datePart}`);
        for (const b of proj.bullets) {
          const text = b.changed && accepted[b.id] ? effectiveTailored(b.id, b.tailored) : effectiveOriginal(b.id, b.original);
          out.push(`  • ${text}`);
        }
        out.push('');
      }
      return out;
    };

    const renderEducation = (): string[] => {
      if (!education.length) return [];
      const out: string[] = ['EDUCATION'];
      for (const edu of education) {
        out.push(`${edu.degree} | ${edu.institution}${edu.dates ? `  ${edu.dates}` : ''}`);
        if (edu.gpa) out.push(`  GPA: ${edu.gpa}`);
        for (const note of edu.notes) out.push(`  • ${note}`);
      }
      return out;
    };

    const renderSkills = (): string[] => {
      if (skills_raw) return ['SKILLS', skills_raw];
      const all = Object.values(skills).flat().filter(Boolean) as string[];
      return all.length ? ['SKILLS', all.join(', ')] : [];
    };

    const renderAdditional = (): string[] =>
      additional.length ? ['ADDITIONAL', ...additional.map((i) => `  • ${i}`)] : [];

    const sectionMap: Record<string, () => string[]> = {
      contact: renderContact,
      summary: renderSummary,
      experience: renderExperience,
      projects: renderProjects,
      education: renderEducation,
      skills: renderSkills,
      additional: renderAdditional,
    };

    const order = section_order?.length
      ? section_order
      : ['contact', 'summary', 'experience', 'projects', 'education', 'skills', 'additional'];
    const ordered = ['contact', ...order.filter((s) => s !== 'contact')];

    const blocks: string[] = [];
    for (const section of ordered) {
      const lines = sectionMap[section]?.() ?? [];
      if (lines.length) blocks.push(lines.join('\n'));
    }
    return blocks.join('\n\n');
  }, [editedResume, tailoredExperience, tailoredProjects, accepted, editedTailored, editedOriginal]);

  const handleGenerate = () => {
    setShowGenerated(true);
    setCopied(false);
    setTimeout(() => resumeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!editedResume) return;
    setDownloading(true);
    try {
      const blob = await generateDocx(editedResume, tailoredExperience, tailoredProjects, accepted, editedTailored, editedOriginal);
      const name = (editedResume.contact.name ?? 'resume').replace(/\s+/g, '_');
      downloadBlob(blob, `${name}_tailored.docx`);
    } finally {
      setDownloading(false);
    }
  };

  if (!tailoredExperience.length && !tailoredProjects.length) {
    return <p className="text-gray-500 text-center mt-10">No tailored content to display.</p>;
  }

  // Reusable two-column card renderer
  const renderCard = (
    key: string,
    header: React.ReactNode,
    originalBullets: { id: string; text: string }[],
    tailoredBullets: { id: string; original: string; tailored: string; changed: boolean }[]
  ) => (
    <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">{header}</div>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-4">
          <ul className="flex flex-col gap-2">
            {originalBullets.map((b) => (
              <OriginalBullet key={b.id} text={b.text} />
            ))}
          </ul>
        </div>
        <div className="p-4">
          <ul className="flex flex-col gap-2">
            {tailoredBullets.map((b) => (
              <BulletDiff
                key={b.id}
                bullet={b}
                accepted={accepted[b.id] ?? false}
                onAcceptChange={handleAcceptChange}
                tailoredText={effectiveTailored(b.id, b.tailored)}
                originalText={effectiveOriginal(b.id, b.original)}
                onEditTailored={handleEditTailored}
                onEditOriginal={handleEditOriginal}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Column headers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 text-center">
          Your Resume
        </div>
        <div className="bg-indigo-50 rounded-lg px-4 py-2 text-sm font-semibold text-indigo-700 text-center">
          Tailored Version — click Accept or Keep Original on each bullet
        </div>
      </div>

      {/* Experience */}
      {tailoredExperience.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Experience</p>
          {tailoredExperience.map((entry) => {
            const orig = editedResume?.experience.find((e) => e.id === entry.id);
            return renderCard(
              entry.id,
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{entry.title}</p>
                  <p className="text-sm text-gray-500">{entry.company}</p>
                </div>
                <span className="text-xs text-gray-400 ml-4">{orig?.dates}</span>
              </div>,
              orig?.bullets ?? [],
              entry.bullets
            );
          })}
        </>
      )}

      {/* Projects */}
      {tailoredProjects.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Projects</p>
          {tailoredProjects.map((proj) => {
            const orig = editedResume?.projects.find((p) => p.id === proj.id);
            return renderCard(
              proj.id,
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{proj.name}</p>
                  {orig?.technologies && (
                    <p className="text-xs text-indigo-500 mt-0.5">{orig.technologies}</p>
                  )}
                </div>
                {orig?.dates && <span className="text-xs text-gray-400 ml-4">{orig.dates}</span>}
              </div>,
              orig?.bullets ?? [],
              proj.bullets
            );
          })}
        </>
      )}

      {/* Generate button */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleGenerate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-3 rounded-xl transition-colors text-base"
        >
          Generate New Resume →
        </button>
      </div>

      {/* Generated resume panel */}
      {showGenerated && (
        <div ref={resumeRef} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-2">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-800">Your Tailored Resume</h3>
              <p className="text-xs text-gray-400 mt-0.5">All sections combined with your accepted changes</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="text-sm font-medium px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white transition-colors flex items-center gap-1.5"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>↓ Download .docx</>
                )}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={generatedResume}
            className="w-full font-mono text-sm text-gray-800 p-5 resize-none focus:outline-none"
            style={{ minHeight: '600px' }}
          />
        </div>
      )}
    </div>
  );
}
