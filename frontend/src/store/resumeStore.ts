import { create } from 'zustand';
import type { ParsedResume, TailoredExperience, TailoredProject } from '../types/resume';

type Step = 'upload' | 'review' | 'job' | 'compare';

interface ResumeStore {
  sessionId: string | null;
  parsedResume: ParsedResume | null;
  editedResume: ParsedResume | null;
  jobDescription: string;
  tailoredExperience: TailoredExperience[] | null;
  tailoredProjects: TailoredProject[] | null;
  currentStep: Step;
  isLoading: boolean;
  error: string | null;

  setSessionId: (id: string) => void;
  setParsedResume: (r: ParsedResume) => void;
  updateBullet: (expId: string, bulletId: string, text: string) => void;
  updateProjectBullet: (projId: string, bulletId: string, text: string) => void;
  updateSummary: (summary: string) => void;
  setJobDescription: (jd: string) => void;
  setTailoredExperience: (t: TailoredExperience[]) => void;
  setTailoredProjects: (p: TailoredProject[]) => void;
  setCurrentStep: (step: Step) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  sessionId: null,
  parsedResume: null,
  editedResume: null,
  jobDescription: '',
  tailoredExperience: null,
  tailoredProjects: null,
  currentStep: 'upload',
  isLoading: false,
  error: null,

  setSessionId: (id) => set({ sessionId: id }),

  setParsedResume: (r) => {
    const clone = JSON.parse(JSON.stringify(r)) as ParsedResume;
    set({ parsedResume: r, editedResume: clone });
  },

  updateBullet: (expId, bulletId, text) =>
    set((state) => {
      if (!state.editedResume) return {};
      const resume = JSON.parse(JSON.stringify(state.editedResume)) as ParsedResume;
      const exp = resume.experience.find((e) => e.id === expId);
      if (exp) {
        const bullet = exp.bullets.find((b) => b.id === bulletId);
        if (bullet) bullet.text = text;
      }
      return { editedResume: resume };
    }),

  updateProjectBullet: (projId, bulletId, text) =>
    set((state) => {
      if (!state.editedResume) return {};
      const resume = JSON.parse(JSON.stringify(state.editedResume)) as ParsedResume;
      const proj = resume.projects.find((p) => p.id === projId);
      if (proj) {
        const bullet = proj.bullets.find((b) => b.id === bulletId);
        if (bullet) bullet.text = text;
      }
      return { editedResume: resume };
    }),

  updateSummary: (summary) =>
    set((state) => {
      if (!state.editedResume) return {};
      return { editedResume: { ...state.editedResume, summary } };
    }),

  setJobDescription: (jd) => set({ jobDescription: jd }),
  setTailoredExperience: (t) => set({ tailoredExperience: t }),
  setTailoredProjects: (p) => set({ tailoredProjects: p }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      sessionId: null,
      parsedResume: null,
      editedResume: null,
      jobDescription: '',
      tailoredExperience: null,
      tailoredProjects: null,
      currentStep: 'upload',
      isLoading: false,
      error: null,
    }),
}));
