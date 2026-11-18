import Reveal from './Reveal';

interface Props {
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ eyebrow, title, accent, intro, align = 'left' }: Props) {
  return (
    <header className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
          {title} {accent && <span className="gradient-text">{accent}</span>}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.16}>
          <p className="mt-6 text-base leading-relaxed sm:text-lg" style={{ color: 'var(--muted)' }}>
            {intro}
          </p>
        </Reveal>
      )}
    </header>
  );
}
