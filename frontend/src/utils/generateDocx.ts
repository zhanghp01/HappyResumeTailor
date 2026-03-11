import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
} from 'docx';
import type { ParsedResume, TailoredExperience, TailoredProject } from '../types/resume';

// ── Helpers ────────────────────────────────────────────────────────────────

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, space: 4, color: '4F46E5' },
    },
    spacing: { before: 240, after: 80 },
  });
}

function contactLine(parts: (string | null | undefined)[]): Paragraph {
  const filtered = parts.filter(Boolean) as string[];
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: filtered.map((p, i) => [
      new TextRun({ text: p, size: 20 }),
      ...(i < filtered.length - 1 ? [new TextRun({ text: '  |  ', size: 20, color: '9CA3AF' })] : []),
    ]).flat(),
    spacing: { after: 40 },
  });
}

function entryHeader(left: string, sub: string | null, right: string | null): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      new TextRun({ text: left, bold: true, size: 22 }),
      ...(sub ? [new TextRun({ text: `  ${sub}`, size: 20, color: '6B7280' })] : []),
      ...(right ? [new TextRun({ text: `\t${right}`, size: 20, color: '6B7280', italics: true })] : []),
    ],
    spacing: { before: 120, after: 40 },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 40 },
    indent: { left: 360 },
  });
}

function blankLine(): Paragraph {
  return new Paragraph({ text: '', spacing: { after: 60 } });
}

// ── Main generator ─────────────────────────────────────────────────────────

export async function generateDocx(
  resume: ParsedResume,
  tailoredExperience: TailoredExperience[],
  tailoredProjects: TailoredProject[],
  accepted: Record<string, boolean>,
  editedTailored: Record<string, string> = {},
  editedOriginal: Record<string, string> = {}
): Promise<Blob> {
  const effectiveTailored = (id: string, tailored: string) => editedTailored[id] ?? tailored;
  const effectiveOriginal = (id: string, original: string) => editedOriginal[id] ?? original;
  const { contact, summary, experience, projects, education, skills, skills_raw, additional, section_order } = resume;

  // ── Section renderers ──────────────────────────────────────────────────
  const renderContact = (): Paragraph[] => {
    const out: Paragraph[] = [];
    if (contact.name) {
      out.push(new Paragraph({
        text: contact.name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }));
    }
    out.push(contactLine([contact.email, contact.phone, contact.location]));
    const links = [contact.linkedin, contact.github].filter(Boolean);
    if (links.length) out.push(contactLine(links));
    return out;
  };

  const renderSummary = (): Paragraph[] => {
    if (!summary) return [];
    return [
      sectionHeading('Summary'),
      new Paragraph({ children: [new TextRun({ text: summary, size: 20 })], spacing: { after: 80 } }),
    ];
  };

  const renderExperience = (): Paragraph[] => {
    if (!tailoredExperience.length) return [];
    const out: Paragraph[] = [sectionHeading('Experience')];
    for (const exp of tailoredExperience) {
      const orig = experience.find((e) => e.id === exp.id);
      out.push(entryHeader(
        `${exp.title} | ${exp.company}`,
        orig?.location ?? null,
        orig?.dates ?? null,
      ));
      for (const b of exp.bullets) {
        out.push(bullet(b.changed && accepted[b.id] ? effectiveTailored(b.id, b.tailored) : effectiveOriginal(b.id, b.original)));
      }
      out.push(blankLine());
    }
    return out;
  };

  const renderProjects = (): Paragraph[] => {
    if (!tailoredProjects.length) return [];
    const out: Paragraph[] = [sectionHeading('Projects')];
    for (const proj of tailoredProjects) {
      const orig = projects.find((p) => p.id === proj.id);
      out.push(entryHeader(
        proj.name,
        orig?.technologies ?? null,
        orig?.dates ?? null,
      ));
      for (const b of proj.bullets) {
        out.push(bullet(b.changed && accepted[b.id] ? effectiveTailored(b.id, b.tailored) : effectiveOriginal(b.id, b.original)));
      }
      out.push(blankLine());
    }
    return out;
  };

  const renderEducation = (): Paragraph[] => {
    if (!education.length) return [];
    const out: Paragraph[] = [sectionHeading('Education')];
    for (const edu of education) {
      out.push(entryHeader(
        `${edu.degree} | ${edu.institution}`,
        edu.gpa ? `GPA: ${edu.gpa}` : null,
        edu.dates ?? null,
      ));
      for (const note of edu.notes) out.push(bullet(note));
    }
    return out;
  };

  const renderSkills = (): Paragraph[] => {
    const skillText = skills_raw
      ? skills_raw
      : (Object.values(skills).flat().filter(Boolean) as string[]).join(', ');
    if (!skillText) return [];
    return [
      sectionHeading('Skills'),
      new Paragraph({ text: skillText, spacing: { after: 80 } }),
    ];
  };

  const renderAdditional = (): Paragraph[] => {
    if (!additional.length) return [];
    return [
      sectionHeading('Additional'),
      ...additional.map((item) => bullet(item)),
    ];
  };

  // ── Assemble in section_order ──────────────────────────────────────────
  const sectionMap: Record<string, () => Paragraph[]> = {
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

  const children: Paragraph[] = [];
  for (const section of ordered) {
    children.push(...(sectionMap[section]?.() ?? []));
  }

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          run: { size: 32, bold: true, color: '1F2937' },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { size: 22, bold: true, color: '4F46E5' },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 900, right: 900 },
        },
      },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
