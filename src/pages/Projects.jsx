import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import ProjectVisual from '../components/projects/ProjectVisual';
import ExternalLink from '../components/common/ExternalLink';
import { useContent } from '../context/ContentContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
export default function Projects() {
    useDocumentTitle('Projects');
    const { featuredProjects, secondaryProjects } = useContent();
    const [open, setOpen] = useState(null);
    return (<>
      <PageHeader eyebrow="Selected work" title="Projects &" accent="case studies." intro="Startup, full-stack, DevOps, IoT and business websites. Each project opens into its own page."/>

      <div className="container-x space-y-28 pb-20 sm:space-y-40">
        {featuredProjects.map((p, i) => (<Reveal as="article" key={p.slug}>
            <div className={`grid items-center gap-10 lg:grid-cols-12 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <div className={`lg:col-span-7 ${i === 0 ? 'lg:col-span-8' : ''}`}>
                <Link to={`/projects/${p.slug}`} aria-label={`Open ${p.title} case study`} className="group block aspect-[16/11] overflow-hidden rounded-[2rem] transition-transform duration-500 hover:scale-[1.015]">
                  <ProjectVisual project={p} className="h-full w-full"/>
                </Link>
              </div>
              <div className={`lg:col-span-5 ${i === 0 ? 'lg:col-span-4' : ''}`}>
                <p className="font-mono text-xs uppercase tracking-widest text-cyan">
                  {String(i + 1).padStart(2, '0')} · {p.category}
                </p>
                <h2 className="display mt-4 text-4xl sm:text-5xl">{p.title}</h2>
                {p.status && (<span className="mt-3 inline-block rounded-full border border-ember/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ember">{p.status}</span>)}
                <p className="mt-5 leading-relaxed" style={{ color: 'var(--muted)' }}>{p.summary}</p>
                <p className="mt-4 text-sm"><span style={{ color: 'var(--muted)' }}>My role: </span>{p.role}</p>
                {p.stack.length > 0 && (<ul className="mt-5 flex flex-wrap gap-2">
                    {p.stack.map((s) => (<li key={s} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75">{s}</li>))}
                  </ul>)}
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                  <Link to={`/projects/${p.slug}`} className="btn btn-ghost">View case study <ArrowUpRight size={16}/></Link>
                  {p.links.slice(0, 1).map((l) => (<ExternalLink key={l.url} href={l.url}>{l.label}</ExternalLink>))}
                </div>
              </div>
            </div>
          </Reveal>))}

        <section aria-labelledby="more">
          <Reveal>
            <p className="eyebrow">More work</p>
            <h2 id="more" className="display mt-4 text-4xl sm:text-5xl">Additional projects</h2>
          </Reveal>
          <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {secondaryProjects.map((p) => {
            const isOpen = open === p.slug;
            return (<li key={p.slug}>
                  <button onClick={() => setOpen(isOpen ? null : p.slug)} aria-expanded={isOpen} aria-controls={`panel-${p.slug}`} className="flex w-full items-center justify-between gap-4 py-6 text-left">
                    <span>
                      <span className="display block text-2xl sm:text-3xl">{p.title}</span>
                      <span className="mt-1 block text-sm" style={{ color: 'var(--muted)' }}>{p.category}</span>
                    </span>
                    <ChevronDown className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-cyan' : ''}`} aria-hidden/>
                  </button>
                  {isOpen && (<div id={`panel-${p.slug}`} className="pb-8 pr-10">
                      <p className="max-w-2xl leading-relaxed" style={{ color: 'var(--muted)' }}>{p.description}</p>
                      {p.stack.length > 0 && (<ul className="mt-4 flex flex-wrap gap-2">
                          {p.stack.map((s) => (<li key={s} className="rounded-full border border-white/15 px-3 py-1 text-xs">{s}</li>))}
                        </ul>)}
                      <Link to={`/projects/${p.slug}`} className="mt-5 inline-flex items-center gap-1.5 text-cyan hover:text-white">
                        Open details <ArrowUpRight size={16}/>
                      </Link>
                    </div>)}
                </li>);
        })}
          </ul>
        </section>
      </div>
    </>);
}
