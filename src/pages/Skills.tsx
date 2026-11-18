import { lazy, Suspense, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { useContent } from '../context/ContentContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SkillsScene = lazy(() => import('../components/skills/SkillsScene'));

export default function Skills() {
  useDocumentTitle('Skills');
  const { skills: skillGroups } = useContent();
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <PageHeader eyebrow="Technologies & skills" title="The technology" accent="ecosystem." intro="Drag the 3D map to explore, or choose a category. Click a cluster to reveal its technologies." />

      <section className="container-x">
        <div className="relative h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#0d1233] to-ink sm:h-[560px]">
          <Suspense fallback={null}>
            <SkillsScene groups={skillGroups} active={active} onSelect={setActive} />
          </Suspense>
        </div>

        <div role="group" aria-label="Skill categories" className="mt-8 flex flex-wrap gap-2">
          <button onClick={() => setActive(null)} aria-pressed={active === null} className={`rounded-full border px-4 py-2 text-sm transition-colors ${active === null ? 'border-white bg-white text-ink' : 'border-white/20 hover:border-white/50'}`}>
            All
          </button>
          {skillGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActive(active === g.id ? null : g.id)}
              aria-pressed={active === g.id}
              className="rounded-full border px-4 py-2 text-sm transition-colors"
              style={active === g.id ? { background: g.color, borderColor: g.color, color: '#05060d' } : { borderColor: 'rgba(255,255,255,0.2)' }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </section>

      <section className="container-x py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups
            .filter((g) => active === null || g.id === active)
            .map((g, i) => (
              <Reveal key={g.id} delay={i * 0.05}>
                <div className="glass h-full rounded-3xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: g.color }} aria-hidden />
                    <h2 className="display text-2xl">{g.name}</h2>
                  </div>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {g.items.map((s) => (
                      <li key={s} className="rounded-full border border-white/15 px-3 py-1.5 text-sm">{s}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
        </div>
      </section>
    </>
  );
}
