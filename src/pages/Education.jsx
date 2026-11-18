import { GraduationCap, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import SectionHeading from '../components/common/SectionHeading';
import ExternalLink from '../components/common/ExternalLink';
import { education } from '../data/profile';
import { useContent } from '../context/ContentContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
export default function Education() {
    useDocumentTitle('Education');
    const { certifications } = useContent();
    return (<>
      <PageHeader eyebrow="Education & certifications" title="Academic" accent="foundation."/>
      <section className="container-x pb-12">
        <Reveal>
          <div className="glass grid gap-8 rounded-[2rem] p-8 sm:p-12 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet to-cyan text-ink"><GraduationCap size={30} aria-hidden/></span>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-cyan">{education.years}</p>
              <h2 className="display mt-2 text-3xl sm:text-4xl">{education.institution}</h2>
              <p className="mt-2 text-lg text-white/80">{education.degree}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="eyebrow">CGPA</p>
              <p className="display gradient-text mt-1 text-5xl">{education.cgpa}</p>
            </div>
          </div>
        </Reveal>

        <div className="relative mt-14 border-l border-white/15 pl-8">
          {[
            { y: '2024', t: 'Joined B.E. Computer Science and Engineering' },
            { y: 'Now', t: 'Pursuing the degree alongside building projects, competing and running EVO Codes' },
            { y: '2028', t: 'Expected completion of the programme' },
        ].map((s) => (<Reveal key={s.y} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-2 border-cyan bg-ink" aria-hidden/>
              <p className="font-mono text-xs text-cyan">{s.y}</p>
              <p className="mt-1">{s.t}</p>
            </Reveal>))}
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeading eyebrow="Certifications" title="Certificate" accent="gallery." intro="Add your certificates in src/data/profile.js (title, issuer, image and link). They will appear here automatically."/>
        {certifications.length === 0 ? (<Reveal>
            <div className="mt-12 grid place-items-center rounded-[2rem] border border-dashed border-white/20 p-14 text-center">
              <ImageIcon className="text-white/40" size={36} aria-hidden/>
              <p className="mt-4 max-w-md text-sm" style={{ color: 'var(--muted)' }}>
                No certificates added yet. Nothing has been assumed or invented here.
              </p>
            </div>
          </Reveal>) : (<ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c) => (<Reveal as="li" key={c.id}>
                <div className="glass overflow-hidden rounded-3xl">
                  {c.image && <img src={c.image} alt={`${c.title} certificate`} loading="lazy" className="aspect-[4/3] w-full object-cover"/>}
                  <div className="p-5">
                    <h3 className="display text-xl">{c.title}</h3>
                    <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{c.issuer}</p>
                    {c.link && <div className="mt-3 text-sm"><ExternalLink href={c.link}>View credential</ExternalLink></div>}
                  </div>
                </div>
              </Reveal>))}
          </ul>)}
      </section>
    </>);
}
