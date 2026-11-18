import { Award, Bug, FileText, Lightbulb, Medal, ShieldCheck, Trophy, Users } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import type { Achievement } from '../data/achievements';
import { useContent } from '../context/ContentContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const icons = { trophy: Trophy, medal: Medal, award: Award, users: Users, bulb: Lightbulb, bug: Bug, file: FileText, shield: ShieldCheck };
const hex = { violet: '#8b5cf6', cyan: '#22d3ee', ember: '#fb923c' };

function Badge({ a }: { a: Achievement }) {
  const Icon = icons[a.icon];
  const c = hex[a.accent];
  return (
    <div
      className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(from 210deg, ${c}, #e8eaf6, ${c}, #5b6390, ${c})`, boxShadow: `0 0 40px ${c}44` }}
    >
      <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-ink">
        <Icon size={28} style={{ color: c }} aria-hidden />
      </div>
    </div>
  );
}

export default function Achievements() {
  useDocumentTitle('Achievements');
  const { achievements } = useContent();
  return (
    <>
      <PageHeader eyebrow="Achievements & leadership" title="Competitions," accent="recognition, leadership." intro="A timeline of hackathons, papers, competitions and the clubs and teams I have led or taken part in." />
      <div className="container-x pb-12">
        <ol className="relative space-y-8 before:absolute before:bottom-0 before:left-10 before:top-0 before:w-px before:bg-gradient-to-b before:from-violet before:via-cyan before:to-ember before:opacity-50">
          {achievements.map((a, i) => (
            <Reveal as="li" key={a.id} delay={0.03}>
              <div className="relative flex gap-6 sm:gap-10">
                <Badge a={a} />
                <div className="glass flex-1 rounded-3xl p-6 sm:p-8">
                  <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: hex[a.accent] }}>
                    {String(i + 1).padStart(2, '0')} · {a.badge}
                  </p>
                  <h2 className="display mt-3 text-2xl sm:text-3xl">{a.title}</h2>
                  <p className="mt-3 leading-relaxed" style={{ color: 'var(--muted)' }}>{a.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </>
  );
}
