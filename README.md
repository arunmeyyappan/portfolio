# Arun Meyyappan: 3D Portfolio (JavaScript + axios)

React 18 · Vite · **JavaScript (JSX)** · Tailwind · React Router 7 · React Three Fiber / Drei · Motion · **axios**.

This is the plain-JavaScript version of the API-connected portfolio. Content (projects, achievements, skills, certifications) is loaded from the **portfolio backend** with axios, and contact-form messages are posted to it. You edit content in the backend's admin dashboard.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
```

In development the site calls `/api`, which Vite forwards to `http://localhost:5000`. Start the backend first (`npm run dev` in the backend folder). If the backend isn't running, the site still works using the bundled content in `src/data`.

```bash
npm run build          # production build into dist/
npm run preview
```

Requires Node 20+ (React Router 7).

## Connecting to your deployed backend

Set one environment variable **at build time**:

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-portfolio-api>.onrender.com/api` (must end in `/api`, no trailing slash) |

On Vercel: Project → Settings → Environment Variables → add `VITE_API_URL` → **redeploy** (Vite bakes it in at build time). Locally, copy `.env.example` to `.env`.

Then add your Vercel URL to the backend's `CLIENT_ORIGIN`, otherwise browsers will block the requests (CORS).

> Use your **portfolio** backend URL here, not the EVO Codes backend.

## How the axios layer works (`src/lib/api.js`)

* One shared axios instance (`http`) with `baseURL` from `VITE_API_URL`, JSON headers and a **70-second timeout** (free hosting can take about a minute to wake).
* A response interceptor converts every failure into an `ApiError` with a visitor-friendly message: the server's own message when there is one (for example the rate-limit notice), "took too long" on a timeout, and "could not reach the server" when offline.
* `fetchContent(signal)` → `GET /content`; the response is shape-checked before use.
* `sendMessage(payload)` → `POST /messages`.
* `sendToEndpoint(url, payload)` → optional third-party form service (`profile.contactEndpoint`), through its own axios instance.

## How content loading works (`src/context/ContentContext.jsx`)

1. The page renders **immediately** from the last successful API response (cached in the browser) or, on a first visit, from the bundled data in `src/data`.
2. It then requests `/content` and swaps in the live data.
3. If the server is asleep or unreachable, the visitor keeps seeing the last known content. Nothing breaks.
4. Opening a deep link to a project that exists only on the backend shows "Loading project…" until the API answers.

If `VITE_API_URL` is empty or unset in production, the backend is disabled and the site uses `src/data` only.

## Contact form

* With the backend configured: the message is saved to your dashboard inbox. The page says "Message sent" only when the server confirms. A hidden field filters bots, and the server limits submissions per visitor, which shows a clear message.
* Without a backend: uses `profile.contactEndpoint` (a third-party form URL) if set, otherwise opens the visitor's email app (`mailto:`).

## Files you may still edit here

| File | Purpose |
| --- | --- |
| `src/data/profile.js` | Name, links, **email**, journey, education, optional `contactEndpoint` |
| `src/data/evocodes.js` | EVO Codes page text |
| `src/data/projects.js`, `achievements.js`, `skills.js` | **Fallback** content shown when the backend is unreachable on a first visit |

Projects, achievements, skills and certifications are normally edited in the dashboard.

## Honesty notes

ARAD is labelled an innovation prototype and its sensor panel is an explicit simulation. No finalist, patent-granted or business-metric claims appear anywhere. Keep it that way when you edit content.

## Deploying

Static SPA. `vercel.json` rewrites all routes to `index.html`. On other hosts, add an equivalent fallback.

## Structure

```
src/
  components/   layout, navigation, hero (Hero.jsx + 3D scene), animations, projects, skills (3D), common
  context/      ContentContext.jsx   (API + cache + fallback)
  lib/          api.js               (axios client)
  pages/        Home, About, EvoCodes, Projects, ProjectDetails, Skills, Achievements, Education, Contact, NotFound
  data/         bundled fallback content
  hooks/        useWebGL, useFinePointer, useMouseParallax, useDocumentTitle
```
