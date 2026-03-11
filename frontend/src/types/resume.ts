export interface Bullet {
  id: string;
  text: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  dates: string;
  location: string;
  bullets: Bullet[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  dates: string;
  gpa?: string | null;
  notes: string[];
}

export interface ParsedResume {
  contact: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
  summary?: string | null;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  skills: {
    languages?: string[];
    frameworks?: string[];
    tools?: string[];
    other?: string[];
    [key: string]: string[] | undefined;
  };
  skills_raw?: string | null;
  additional: string[];
  section_order?: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  role?: string | null;
  technologies?: string | null;
  dates?: string | null;
  bullets: Bullet[];
}

export interface TailoredBullet {
  id: string;
  original: string;
  tailored: string;
  changed: boolean;
}

export interface TailoredExperience {
  id: string;
  company: string;
  title: string;
  bullets: TailoredBullet[];
}

export interface TailoredProject {
  id: string;
  name: string;
  bullets: TailoredBullet[];
}
