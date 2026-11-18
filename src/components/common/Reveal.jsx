import { motion, useReducedMotion } from 'motion/react';
export default function Reveal({ children, delay = 0, y = 32, className, as = 'div' }) {
    const reduce = useReducedMotion();
    const Comp = motion[as];
    return (<Comp className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </Comp>);
}
