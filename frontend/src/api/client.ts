import axios from 'axios';
import type { ParsedResume, TailoredExperience, TailoredProject } from '../types/resume';

const api = axios.create({ baseURL: '/api' });

export interface ParseResumeResponse {
  session_id: string;
  parsed: ParsedResume;
}

export interface TailorResponse {
  session_id: string;
  tailored_experience: TailoredExperience[];
  tailored_projects: TailoredProject[];
}

export async function parseResume(file: File): Promise<ParseResumeResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ParseResumeResponse>('/resume/parse', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function saveResume(sessionId: string, resume: ParsedResume): Promise<void> {
  await api.put(`/resume/${sessionId}`, resume);
}

export async function tailorResume(
  sessionId: string,
  jobDescription: string,
  resume: ParsedResume
): Promise<TailorResponse> {
  const { data } = await api.post<TailorResponse>('/tailor', {
    session_id: sessionId,
    job_description: jobDescription,
    resume,
  });
  return data;
}
