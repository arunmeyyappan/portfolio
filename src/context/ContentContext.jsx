import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { achievements as localAchievements } from '../data/achievements';
import { certifications as localCertifications } from '../data/profile';
import { projects as localProjects } from '../data/projects';
import { skillGroups as localSkills } from '../data/skills';
import axios from 'axios';
import { apiEnabled, fetchContent, parseContent } from '../lib/api';
const CACHE_KEY = 'portfolio-content-v1';
const bundled = {
    projects: localProjects,
    achievements: localAchievements,
    skills: localSkills,
    certifications: localCertifications,
};
function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? parseContent(JSON.parse(raw)) : null;
    }
    catch {
        return null;
    }
}
function writeCache(c) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(c));
    }
    catch {
        /* storage unavailable or full: caching is optional */
    }
}
const Ctx = createContext(null);
/**
 * Renders immediately from (1) the last successful API response, or (2) the bundled data in src/data,
 * then replaces it with live data from the backend. If the backend is unreachable (e.g. a free-tier
 * server still waking up) the visitor simply keeps seeing the last known content.
 */
export function ContentProvider({ children }) {
    const [content, setContent] = useState(() => (apiEnabled ? readCache() : null) ?? bundled);
    const [status, setStatus] = useState(apiEnabled ? 'loading' : 'offline');
    useEffect(() => {
        if (!apiEnabled)
            return;
        // The axios client has its own 70s timeout (free hosting can take ~60s to wake up).
        // We only abort when the component unmounts.
        const ctrl = new AbortController();
        fetchContent(ctrl.signal)
            .then((live) => {
            setContent(live);
            setStatus('live');
            writeCache(live);
        })
            .catch((err) => {
            if (axios.isCancel(err))
                return; // unmounted
            console.warn('Content API unavailable, showing saved content.', err.message);
            setStatus('offline');
        });
        return () => ctrl.abort();
    }, []);
    const value = useMemo(() => ({
        ...content,
        status,
        featuredProjects: content.projects.filter((p) => p.featured),
        secondaryProjects: content.projects.filter((p) => !p.featured),
        getProject: (slug) => content.projects.find((p) => p.slug === slug),
    }), [content, status]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useContent() {
    const v = useContext(Ctx);
    if (!v)
        throw new Error('useContent must be used inside <ContentProvider>');
    return v;
}
