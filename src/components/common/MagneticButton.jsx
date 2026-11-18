import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
export default function MagneticButton({ children, to, href, variant = 'primary', className = '', onClick, type = 'button', disabled }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 18 });
    const sy = useSpring(y, { stiffness: 220, damping: 18 });
    const onMove = (e) => {
        if (reduce || e.pointerType !== 'mouse' || !ref.current)
            return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
    };
    const reset = () => {
        x.set(0);
        y.set(0);
    };
    const cls = `btn ${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} ${className}`;
    let inner;
    if (to)
        inner = <Link to={to} className={cls}>{children}</Link>;
    else if (href)
        inner = (<a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>);
    else
        inner = (<button type={type} onClick={onClick} className={`${cls} disabled:opacity-50`} disabled={disabled}>
        {children}
      </button>);
    return (<motion.div ref={ref} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset} className="inline-block">
      {inner}
    </motion.div>);
}
