import type { Achievement } from '../data/achievements';
import type { Project } from '../data/projects';
import type { SkillGroup } from '../data/skills';
import type { Certification } from '../data/profile';

export interface SiteContent {
  projects: Project[];
  achievements: Achievement[];
  skills: SkillGroup[];
  certifications: Certification[];
}

/**
 * Base URL of the portfolio backend, ending in /api.
 *  - Production: set VITE_API_URL at build time (see README).
 *  - Dev: defaults to "/api", which Vite proxies to http://localhost:5000.
 *  - Empty string: backend disabled, the site uses the bundled data in src/data.
 */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '/api' : '')).replace(/\/$/, '');
export const apiEnabled = API_URL !== '';
if (!apiEnabled && !import.meta.env.DEV) {
  console.warn('VITE_API_URL was not set at build time: the site is showing the bundled content in src/data, so admin changes will NOT appear.');
}

const isArr = (v: unknown): v is unknown[] => Array.isArray(v);

/** Light shape check so a malformed response can never crash the pages. */
export function parseContent(data: unknown): SiteContent | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (!isArr(d.projects) || !isArr(d.achievements) || !isArr(d.skills) || !isArr(d.certifications)) return null;
  const projects = (d.projects as Project[]).filter((p) => p && typeof p.slug === 'string' && typeof p.title === 'string').map((p) => ({
    ...p,
    stack: isArr(p.stack) ? p.stack : [],
    features: isArr(p.features) ? p.features : [],
    links: isArr(p.links) ? p.links : [],
  }));
  const skills = (d.skills as SkillGroup[]).filter((g) => g && typeof g.name === 'string').map((g) => ({ ...g, items: isArr(g.items) ? g.items : [] }));
  return {
    projects,
    achievements: (d.achievements as Achievement[]).filter((a) => a && typeof a.title === 'string'),
    skills,
    certifications: (d.certifications as Certification[]).filter((c) => c && typeof c.title === 'string'),
  };
}

export async function fetchContent(signal?: AbortSignal): Promise<SiteContent> {
  const res = await fetch(`${API_URL}/content`, { signal, cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Content request failed (${res.status})`);
  const parsed = parseContent(await res.json());
  if (!parsed) throw new Error('Unexpected response from the content API');
  return parsed;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function sendMessage(payload: { name: string; email: string; message: string; website?: string }): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError('Could not reach the server. Please check your connection and try again.', 0);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  }
}
