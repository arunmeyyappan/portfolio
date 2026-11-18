import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { achievements as localAchievements } from '../data/achievements';
import { certifications as localCertifications } from '../data/profile';
import { projects as localProjects } from '../data/projects';
import { skillGroups as localSkills } from '../data/skills';
import { apiEnabled, fetchContent, parseContent, type SiteContent } from '../lib/api';

export type ContentStatus = 'loading' | 'live' | 'offline';

interface ContentValue extends SiteContent {
  status: ContentStatus;
  featuredProjects: SiteContent['projects'];
  secondaryProjects: SiteContent['projects'];
  getProject: (slug: string) => SiteContent['projects'][number] | undefined;
}

const CACHE_KEY = 'portfolio-content-v1';
const bundled: SiteContent = {
  projects: localProjects,
  achievements: localAchievements,
  skills: localSkills,
  certifications: localCertifications,
};

function readCache(): SiteContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? parseContent(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
function writeCache(c: SiteContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable or full: caching is optional */
  }
}

const Ctx = createContext<ContentValue | null>(null);

/**
 * Renders immediately from (1) the last successful API response, or (2) the bundled data in src/data,
 * then replaces it with live data from the backend. If the backend is unreachable (e.g. a free-tier
 * server still waking up) the visitor simply keeps seeing the last known content.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => (apiEnabled ? readCache() : null) ?? bundled);
  const [status, setStatus] = useState<ContentStatus>(apiEnabled ? 'loading' : 'offline');

  useEffect(() => {
    if (!apiEnabled) return;
    let alive = true;
    let ctrl: AbortController | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let lastOk = 0;
    let attempts = 0;

    const load = () => {
      ctrl?.abort();
      const c = new AbortController();
      ctrl = c;
      const timeout = setTimeout(() => c.abort(), 70_000); // free hosting can take ~60s to wake
      fetchContent(c.signal)
        .then((live) => {
          if (!alive) return;
          attempts = 0;
          lastOk = Date.now();
          setContent(live);
          setStatus('live');
          writeCache(live);
        })
        .catch((err) => {
          if (!alive || (c.signal.aborted && ctrl !== c)) return; // superseded by a newer request
          console.warn('Content API unavailable, showing saved content.', err);
          setStatus('offline');
          if (attempts < 4) retry = setTimeout(load, 4000 * 2 ** attempts++); // keep trying while the server wakes
        })
        .finally(() => clearTimeout(timeout));
    };

    // Re-sync whenever the visitor returns to the tab, so admin edits show up without a hard reload.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastOk > 15_000) load();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    load();

    return () => {
      alive = false;
      clearTimeout(retry);
      ctrl?.abort();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  const value = useMemo<ContentValue>(
    () => ({
      ...content,
      status,
      featuredProjects: content.projects.filter((p) => p.featured),
      secondaryProjects: content.projects.filter((p) => !p.featured),
      getProject: (slug) => content.projects.find((p) => p.slug === slug),
    }),
    [content, status],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent(): ContentValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useContent must be used inside <ContentProvider>');
  return v;
}
