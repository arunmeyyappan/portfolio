import SplitText from './SplitText';

interface Props {
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: string;
}

export default function PageHeader({ eyebrow, title, accent, intro }: Props) {
  return (
    <header className="container-x pb-12 pt-36 sm:pt-44">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display mt-5 max-w-5xl text-5xl sm:text-7xl lg:text-8xl">
        <SplitText text={title} />{' '}
        {accent && <SplitText text={accent} className="gradient-text" delay={0.25} />}
      </h1>
      {intro && (
        <p className="mt-8 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--muted)' }}>
          {intro}
        </p>
      )}
    </header>
  );
}
