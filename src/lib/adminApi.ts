const TOKEN_KEY = 'portfolio-admin-token';
const API_BASE = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '/api' : '')).replace(/\/$/, '');

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isAuthenticated = () => !!getToken();

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(init.body instanceof FormData) && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new AdminApiError('Could not reach the server.', 0);
  }

  if (res.status === 401) {
    clearToken();
  }

  const text = await res.text();
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const msg = data && typeof data === 'object' && 'error' in data ? data.error : `Request failed (${res.status})`;
    throw new AdminApiError(String(msg), res.status);
  }
  return data as T;
}

export type AdminMe = { ok: boolean; cloudinary: boolean };
export type LoginResponse = { token: string; expiresIn: string };

export interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectDoc {
  _id?: string;
  slug: string;
  title: string;
  category?: string;
  role?: string;
  summary?: string;
  description?: string;
  stack?: string[];
  features?: string[];
  links?: { label: string; url: string }[];
  visual?: string;
  accent?: string;
  featured?: boolean;
  status?: string;
  editable?: boolean;
  image?: string;
  order?: number;
}

export interface AchievementDoc {
  _id?: string;
  title: string;
  badge?: string;
  detail?: string;
  icon?: string;
  accent?: string;
  order?: number;
}

export interface SkillGroupDoc {
  _id?: string;
  name: string;
  color?: string;
  items?: string[];
  order?: number;
}

export interface CertificationDoc {
  _id?: string;
  title: string;
  issuer?: string;
  image?: string;
  link?: string;
  order?: number;
}

function crud<T>(base: string) {
  return {
    list: () => request<T[]>(base),
    create: (body: Partial<T>) => request<T>(base, { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<T>) => request<T>(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ ok: true }>(`${base}/${id}`, { method: 'DELETE' }),
  };
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<AdminMe>('/admin/me'),
  projects: crud<ProjectDoc>('/admin/projects'),
  achievements: crud<AchievementDoc>('/admin/achievements'),
  skills: crud<SkillGroupDoc>('/admin/skills'),
  certifications: crud<CertificationDoc>('/admin/certifications'),
  messages: {
    list: () => request<Message[]>('/admin/messages'),
    markRead: (id: string, read: boolean) =>
      request<Message>(`/admin/messages/${id}`, { method: 'PUT', body: JSON.stringify({ read }) }),
    remove: (id: string) => request<{ ok: true }>(`/admin/messages/${id}`, { method: 'DELETE' }),
  },
  upload: async (file: File): Promise<{ url: string; publicId: string }> => {
    const fd = new FormData();
    fd.append('image', file);
    return request('/admin/upload', { method: 'POST', body: fd });
  },
};
