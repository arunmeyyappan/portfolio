import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Cpu, Trophy, Sparkles } from 'lucide-react';
import Hero from '../components/hero/Hero';
import MagneticButton from '../components/common/MagneticButton';
import Reveal from '../components/common/Reveal';
import SectionHeading from '../components/common/SectionHeading';
import ProjectVisual from '../components/projects/ProjectVisual';
import { profile } from '../data/profile';
import { useContent } from '../context/ContentContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
const teasers = [
    { to: '/evo-codes', icon: Briefcase, title: 'EVO Codes', text: 'My startup venture: building digital products with meaningful impact.', accent: 'text-violet-glow' },
    { to: '/projects', icon: Sparkles, title: 'Projects', text: 'Full-stack apps, DevOps, IoT innovation and business websites.', accent: 'text-cyan' },
    { to: '/skills', icon: Cpu, title: 'Skills', text: 'An interactive map of the technologies I work with.', accent: 'text-ember' },
    { to: '/achievements', icon: Trophy, title: 'Achievements', text: 'Hackathons, papers, competitions and leadership.', accent: 'text-violet-glow' },
];
export default function Home() {
    useDocumentTitle('');
    const { featuredProjects, projects } = useContent();
    const evo = projects.find((p) => p.slug === 'evo-codes') ?? featuredProjects[0];
    return (<>
      <Hero />

      <section className="container-x py-24">
        <SectionHeading eyebrow="Developer. Founder. Innovator." title="One builder," accent="many dimensions." intro="Product thinking, full-stack engineering, hardware experiments and leadership, all working toward software that solves real problems."/>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teasers.map((t, i) => {
            const Icon = t.icon;
            return (<Reveal key={t.to} delay={i * 0.08}>
                <Link to={t.to} className="glass group relative flex h-full flex-col rounded-3xl p-6 transition-colors hover:border-white/30">
                  <Icon className={t.accent} size={26} aria-hidden/>
                  <h3 className="display mt-10 text-2xl">{t.title}</h3>
                  <p className="mt-2 flex-1 text-sm" style={{ color: 'var(--muted)' }}>{t.text}</p>
                  <ArrowRight size={18} className="mt-6 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-cyan"/>
                </Link>
              </Reveal>);
        })}
        </div>
      </section>

      <section className="container-x py-12">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 p-8 sm:p-14" style={{ background: 'linear-gradient(135deg, #1b1250 0%, #0a0f24 55%, #05060d 100%)' }}>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Flagship venture</p>
              <h2 className="display mt-4 text-4xl sm:text-6xl">EVO CODES</h2>
              <p className="mt-4 text-lg text-white/80">Building Digital Products. Creating Meaningful Impact.</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Founder & CEO</p>
              <div className="mt-8"><MagneticButton to="/evo-codes">Explore EVO Codes <ArrowRight size={16}/></MagneticButton></div>
            </div>
            <div className="aspect-[4/3]">
              {evo && <ProjectVisual project={evo} className="h-full w-full"/>}
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-24">
        <Reveal>
          <blockquote className="display mx-auto max-w-4xl text-center text-3xl sm:text-5xl">
            “<span className="gradient-text">{profile.philosophy}</span>”
          </blockquote>
        </Reveal>
      </section>
    </>);
}
