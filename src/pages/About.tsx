import { motion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import SectionHeading from '../components/common/SectionHeading';
import MagneticButton from '../components/common/MagneticButton';
import { education, journey, profile } from '../data/profile';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function About() {
  useDocumentTitle('About');
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const line = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <>
      <PageHeader eyebrow="About me" title="Developer by craft," accent="founder by drive." intro={profile.ambition} />

      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="glass rounded-3xl p-8">
            <p className="eyebrow">Introduction</p>
            <p className="mt-5 text-lg leading-relaxed text-white/85">
              I&apos;m {profile.shortName}, a student at {education.institution} in {profile.location}, pursuing a {education.degree} ({education.years}).
              I work across the full stack and run EVO Codes, my startup venture, as Founder & CEO.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {profile.titles.map((t) => (
                <li key={t} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/75">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { h: 'Full-stack development', t: 'I enjoy working across the stack, from interfaces in React to REST APIs in Node and Express, with data in MongoDB.' },
            { h: 'Entrepreneurship', t: 'Through EVO Codes I learn what it takes to take software from idea to product.' },
            { h: 'Real-world problems', t: 'From urban air quality to emergency response and logistics, I am drawn to problems with real stakes.' },
            { h: 'Scalable products', t: 'My vision is to build software products that are well engineered and ready to grow.' },
          ].map((c, i) => (
            <Reveal key={c.h} delay={i * 0.08}>
              <div className="glass h-full rounded-3xl p-6">
                <h3 className="display text-xl">{c.h}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{c.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeading eyebrow="Journey" title="The path" accent="so far." />
        <div ref={ref} className="relative mt-14">
          <div className="absolute bottom-0 left-[11px] top-0 w-px bg-white/10 md:left-1/2" aria-hidden />
          <motion.div className="absolute left-[11px] top-0 w-px origin-top bg-gradient-to-b from-violet via-cyan to-ember md:left-1/2" style={{ scaleY: line, height: '100%' }} aria-hidden />
          <ol className="space-y-12">
            {journey.map((j, i) => (
              <Reveal as="li" key={j.title} className={`relative pl-10 md:w-1/2 md:pl-0 ${i % 2 === 0 ? 'md:pr-14 md:text-right' : 'md:ml-auto md:pl-14'}`}>
                <span className={`absolute top-1.5 h-[22px] w-[22px] rounded-full border-2 border-cyan bg-ink left-0 ${i % 2 === 0 ? 'md:left-auto md:-right-[11px]' : 'md:-left-[11px]'}`} aria-hidden />
                <p className="font-mono text-xs uppercase tracking-widest text-cyan">{j.year}</p>
                <h3 className="display mt-2 text-2xl">{j.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{j.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-24">
        <Reveal>
          <div className="rounded-[2.5rem] border border-white/10 p-10 text-center sm:p-20" style={{ background: 'radial-gradient(80% 120% at 50% 0%, #2a1a6b55 0%, transparent 70%)' }}>
            <p className="eyebrow">Philosophy</p>
            <p className="display mx-auto mt-6 max-w-4xl text-3xl sm:text-5xl lg:text-6xl">
              <span className="gradient-text">{profile.philosophy}</span>
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <MagneticButton to="/projects">See the work</MagneticButton>
              <MagneticButton to="/contact" variant="ghost">Get in touch</MagneticButton>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
