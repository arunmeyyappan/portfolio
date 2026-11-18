import { lazy, Suspense } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Reveal from '../components/common/Reveal';
import ProjectVisual from '../components/projects/ProjectVisual';
import ExternalLink from '../components/common/ExternalLink';
import MagneticButton from '../components/common/MagneticButton';
import SplitText from '../components/common/SplitText';
import { useContent } from '../context/ContentContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
const AradDevice3D = lazy(() => import('../components/projects/AradDevice3D'));
const AradArchitecture = lazy(() => import('../components/projects/AradArchitecture'));
const SensorPanel = lazy(() => import('../components/projects/SensorPanel'));
export default function ProjectDetails() {
    const { slug = '' } = useParams();
    const { getProject, projects, status } = useContent();
    const project = getProject(slug);
    useDocumentTitle(project?.title ?? '');
    if (!project) {
        // A project added from the dashboard may not be in the first (cached/bundled) render yet.
        if (status === 'loading')
            return <div className="grid min-h-[60vh] place-items-center font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Loading project…</div>;
        return <Navigate to="/projects" replace/>;
    }
    const idx = projects.findIndex((p) => p.slug === project.slug);
    const next = projects[(idx + 1) % projects.length];
    const isArad = project.visual === 'arad';
    return (<>
      <header className="container-x pb-10 pt-32 sm:pt-40">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-cyan">
          <ArrowLeft size={16}/> All projects
        </Link>
        <p className="eyebrow mt-8">{project.category}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl lg:text-8xl"><SplitText text={project.title}/></h1>
        {project.status && (<p className="mt-5 inline-block rounded-full border border-ember/60 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ember">{project.status}</p>)}
      </header>

      <div className="container-x">
        <Reveal>
          <div className="aspect-[16/9] w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
            {isArad ? (<div className="h-full w-full rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#12163a] to-ink">
                <Suspense fallback={null}><AradDevice3D /></Suspense>
              </div>) : (<ProjectVisual project={project} className="h-full w-full"/>)}
          </div>
        </Reveal>
      </div>

      <section className="container-x grid gap-12 py-20 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <p className="eyebrow">Overview</p>
          <p className="mt-5 text-xl leading-relaxed text-white/85">{project.description}</p>
          {project.editable && (<p className="mt-6 rounded-2xl border border-dashed border-white/20 p-4 text-sm" style={{ color: 'var(--muted)' }}>
              This entry is a placeholder. Edit <code className="font-mono text-cyan">src/data/projects.js</code> to add the real description, features and technologies.
            </p>)}
          {project.features.length > 0 && (<>
              <h2 className="display mt-14 text-3xl">{isArad ? 'Proposed detection logic' : 'Features'}</h2>
              <ul className="mt-6 space-y-3">
                {project.features.map((f, i) => (<li key={f} className="flex gap-4 border-b border-white/10 pb-3">
                    <span className="font-mono text-xs text-cyan">{String(i + 1).padStart(2, '0')}</span>
                    <span>{f}</span>
                  </li>))}
              </ul>
            </>)}
        </Reveal>

        <Reveal delay={0.1}>
          <aside className="glass sticky top-28 rounded-3xl p-7">
            <dl className="space-y-6 text-sm">
              <div>
                <dt className="eyebrow">My contribution</dt>
                <dd className="mt-2 text-base">{project.role}</dd>
              </div>
              {project.stack.length > 0 && (<div>
                  <dt className="eyebrow">Technology</dt>
                  <dd className="mt-3 flex flex-wrap gap-2">
                    {project.stack.map((s) => (<span key={s} className="rounded-full border border-white/15 px-3 py-1 text-xs">{s}</span>))}
                  </dd>
                </div>)}
              {project.links.length > 0 && (<div>
                  <dt className="eyebrow">Links</dt>
                  <dd className="mt-3 flex flex-col gap-2">
                    {project.links.map((l) => (<ExternalLink key={l.url} href={l.url}>{l.label}</ExternalLink>))}
                  </dd>
                </div>)}
            </dl>
          </aside>
        </Reveal>
      </section>

      {isArad && (<>
          <section className="container-x py-12">
            <Reveal>
              <p className="eyebrow">System architecture</p>
              <h2 className="display mt-4 text-3xl sm:text-5xl">From sensor to dashboard</h2>
              <p className="mt-4 max-w-2xl" style={{ color: 'var(--muted)' }}>Select a stage to see its role in the prototype.</p>
            </Reveal>
            <div className="mt-10"><Suspense fallback={null}><AradArchitecture /></Suspense></div>
          </section>

          <section className="container-x py-20">
            <div className="grid gap-10 lg:grid-cols-2">
              <Reveal>
                <p className="eyebrow">Hardware</p>
                <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
                  {['ESP32', 'MPU6050 accelerometer and gyroscope', 'NEO-6M GPS', 'SX1278 LoRa modules', 'Buzzer and LED', 'Battery-powered hardware'].map((h) => (<li key={h} className="py-3 text-sm">{h}</li>))}
                </ul>
                <p className="mt-8 rounded-2xl border border-ember/40 bg-ember/5 p-4 text-sm" style={{ color: 'var(--muted)' }}>
                  <strong className="text-ember">Prototype notice:</strong> ARAD is an innovation/prototype project. It has not been commercially deployed, has no proven rescue outcomes and is not patented.
                </p>
              </Reveal>
              <Reveal delay={0.1}><Suspense fallback={null}><SensorPanel /></Suspense></Reveal>
            </div>
          </section>
        </>)}

      <section className="container-x py-20">
        <Link to={`/projects/${next.slug}`} className="group glass flex items-center justify-between rounded-3xl p-8 transition-colors hover:border-white/30">
          <span>
            <span className="eyebrow">Next project</span>
            <span className="display mt-3 block text-3xl sm:text-5xl">{next.title}</span>
          </span>
          <ArrowUpRight size={36} className="text-white/40 transition-all group-hover:text-cyan"/>
        </Link>
        <div className="mt-10 text-center"><MagneticButton to="/contact" variant="ghost">Discuss a project</MagneticButton></div>
      </section>
    </>);
}
