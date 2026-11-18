import axios from 'axios';

/**
 * Base URL of the portfolio backend, ending in /api.
 *  - Production: set VITE_API_URL at build time (see README).
 *  - Dev: defaults to "/api", which Vite proxies to http://localhost:5000.
 *  - Empty string: backend disabled, the site uses the bundled data in src/data.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '/api' : '')).replace(/\/$/, '');
export const apiEnabled = API_URL !== '';

/** Error with a visitor-friendly message and the HTTP status (0 = no response). */
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Turns any axios failure into an ApiError. Cancellations are passed through untouched. */
function toApiError(err) {
  if (axios.isCancel(err)) return err;
  if (err.response) {
    const { status, data } = err.response;
    const message = typeof data?.error === 'string' ? data.error : `Request failed (${status})`;
    return new ApiError(message, status);
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return new ApiError('The server took too long to respond. Please try again in a moment.', 0);
  }
  return new ApiError('Could not reach the server. Please check your connection and try again.', 0);
}

function createClient(config) {
  const client = axios.create({ headers: { Accept: 'application/json' }, ...config });
  client.interceptors.response.use((response) => response, (error) => Promise.reject(toApiError(error)));
  return client;
}

/** Client for the portfolio backend. 70s timeout because free hosting can take ~60s to wake up. */
export const http = createClient({ baseURL: API_URL, timeout: 70_000 });

/** Client for an optional third-party form service (profile.contactEndpoint). */
const external = createClient({ timeout: 20_000 });

const isArr = (v) => Array.isArray(v);

/** Light shape check so a malformed response can never crash the pages. */
export function parseContent(data) {
  if (!data || typeof data !== 'object') return null;
  if (!isArr(data.projects) || !isArr(data.achievements) || !isArr(data.skills) || !isArr(data.certifications)) return null;
  const projects = data.projects
    .filter((p) => p && typeof p.slug === 'string' && typeof p.title === 'string')
    .map((p) => ({
      ...p,
      stack: isArr(p.stack) ? p.stack : [],
      features: isArr(p.features) ? p.features : [],
      links: isArr(p.links) ? p.links : [],
    }));
  const skills = data.skills
    .filter((g) => g && typeof g.name === 'string')
    .map((g) => ({ ...g, items: isArr(g.items) ? g.items : [] }));
  return {
    projects,
    achievements: data.achievements.filter((a) => a && typeof a.title === 'string'),
    skills,
    certifications: data.certifications.filter((c) => c && typeof c.title === 'string'),
  };
}

/** GET /content: projects, achievements, skills, certifications. */
export async function fetchContent(signal) {
  const { data } = await http.get('/content', { signal });
  const parsed = parseContent(data);
  if (!parsed) throw new ApiError('Unexpected response from the content API');
  return parsed;
}

/** POST /messages: saves a contact-form message to the dashboard inbox. */
export async function sendMessage(payload) {
  await http.post('/messages', payload);
}

/** POST to an optional third-party form service. */
export async function sendToEndpoint(url, payload) {
  await external.post(url, payload);
}
