import { lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Layers, Lightbulb, Code2 } from 'lucide-react';
import SplitText from '../components/common/SplitText';
import Reveal from '../components/common/Reveal';
import SectionHeading from '../components/common/SectionHeading';
import MagneticButton from '../components/common/MagneticButton';
import { evocodes } from '../data/evocodes';
import { useContent } from '../context/ContentContext';
import ProjectVisual from '../components/projects/ProjectVisual';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
const EvoBrand3D = lazy(() => import('../components/hero/EvoBrand3D'));
const icons = [Layers, Lightbulb, Code2];
export default function EvoCodes() {
    useDocumentTitle('EVO Codes');
    const reduce = useReducedMotion();
    const { projects } = useContent();
    const project = projects.find((p) => p.slug === 'evo-codes');
    return (<>
      <section className="relative flex min-h-[92svh] items-center overflow-hidden pt-28">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <EvoBrand3D />
          </Suspense>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-transparent"/>
        <div className="container-x pointer-events-none relative pb-16">
          <p className="eyebrow">Startup · SaaS · {evocodes.role}</p>
          <h1 className="display mt-6 text-6xl sm:text-8xl lg:text-9xl">
            <SplitText text={evocodes.name} delay={0.2}/>
          </h1>
          <p className="mt-6 max-w-xl text-xl text-white/85 sm:text-2xl">{evocodes.tagline}</p>
          <div className="pointer-events-auto mt-10 flex flex-wrap gap-4">
            <MagneticButton href={evocodes.website}>
              Explore EVO Codes <ArrowUpRight size={16}/>
            </MagneticButton>
            <MagneticButton to="/contact" variant="ghost">Talk to the founder</MagneticButton>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-24 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <p className="eyebrow">Founder & CEO</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">Led by <span className="gradient-text">Arun Meyyappan</span></h2>
          <p className="mt-6 text-lg leading-relaxed text-white/80">{evocodes.founderIntro}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass rounded-3xl p-8">
            <p className="eyebrow">Vision</p>
            <p className="display mt-5 text-2xl sm:text-3xl">{evocodes.vision}</p>
          </div>
        </Reveal>
      </section>

      <section className="container-x py-12">
        <SectionHeading eyebrow="How we build" title="A product-first" accent="engineering mindset."/>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {evocodes.pillars.map((p, i) => {
            const Icon = icons[i];
            return (<Reveal key={p.title} delay={i * 0.1}>
                <div className="glass relative h-full overflow-hidden rounded-3xl p-7">
                  <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet/20 blur-2xl" aria-hidden/>
                  <Icon className="text-cyan" size={26} aria-hidden/>
                  <h3 className="display mt-8 text-2xl">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{p.text}</p>
                </div>
              </Reveal>);
        })}
        </div>
      </section>

      <section className="container-x grid items-center gap-12 py-24 lg:grid-cols-2">
        <div className="relative">
          {project && (<motion.div animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="aspect-[4/3]">
              <ProjectVisual project={project} className="h-full w-full"/>
            </motion.div>)}
          <motion.div aria-hidden animate={reduce ? undefined : { y: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="glass absolute -bottom-6 -right-2 hidden w-44 rounded-2xl p-4 sm:block">
            <div className="h-2 w-16 rounded-full bg-cyan"/>
            <div className="mt-3 space-y-2">
              <div className="h-2 rounded-full bg-white/20"/>
              <div className="h-2 w-2/3 rounded-full bg-white/10"/>
            </div>
          </motion.div>
        </div>
        <div>
          <p className="eyebrow">Technology & engineering ecosystem</p>
          <dl className="mt-6 divide-y divide-white/10 border-y border-white/10">
            {evocodes.ecosystem.map((e) => (<div key={e.label} className="grid grid-cols-[110px_1fr] gap-4 py-4 text-sm">
                <dt className="font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{e.label}</dt>
                <dd>{e.value}</dd>
              </div>))}
            <div className="grid grid-cols-[110px_1fr] gap-4 py-4 text-sm">
              <dt className="font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>API</dt>
              <dd className="break-all font-mono text-xs text-white/70">{evocodes.backendApi}</dd>
            </div>
          </dl>
          {evocodes.milestones.length > 0 && (<ul className="mt-8 space-y-3">
              {evocodes.milestones.map((m) => (<li key={m.title} className="glass rounded-2xl p-4">
                  <p className="font-medium">{m.title}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{m.detail}</p>
                </li>))}
            </ul>)}
        </div>
      </section>

      <section className="container-x py-12">
        <Reveal>
          <div className="rounded-[2.5rem] border border-white/10 p-10 text-center sm:p-16" style={{ background: 'linear-gradient(135deg, #1b1250 0%, #0a0f24 60%, #05060d 100%)' }}>
            <h2 className="display text-4xl sm:text-6xl">See EVO Codes live.</h2>
            <p className="mx-auto mt-4 max-w-xl" style={{ color: 'var(--muted)' }}>Visit the official website to see what we are building.</p>
            <div className="mt-8"><MagneticButton href={evocodes.website}>evocodes.vercel.app <ArrowUpRight size={16}/></MagneticButton></div>
          </div>
        </Reveal>
      </section>
    </>);
}
