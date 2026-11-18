import { motion, useReducedMotion } from 'motion/react';

interface Props {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

/** Word-by-word masked reveal. Words stay intact so text wraps naturally. */
export default function SplitText({ text, className, delay = 0, stagger = 0.06, as = 'span' }: Props) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  const words = text.split(' ');
  return (
    <Comp className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.12em]">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}
