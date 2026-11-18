import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useFinePointer } from '../../hooks/useFinePointer';
export default function Cursor() {
    const fine = useFinePointer();
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const sx = useSpring(x, { stiffness: 500, damping: 40 });
    const sy = useSpring(y, { stiffness: 500, damping: 40 });
    const [hover, setHover] = useState(false);
    useEffect(() => {
        if (!fine)
            return;
        document.documentElement.classList.add('has-cursor');
        const move = (e) => {
            x.set(e.clientX);
            y.set(e.clientY);
            const t = e.target;
            setHover(!!t?.closest('a, button, [role="button"], input, textarea'));
        };
        window.addEventListener('pointermove', move, { passive: true });
        return () => {
            document.documentElement.classList.remove('has-cursor');
            window.removeEventListener('pointermove', move);
        };
    }, [fine, x, y]);
    if (!fine)
        return null;
    return (<>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] h-9 w-9 rounded-full border border-cyan/70 mix-blend-screen" style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }} animate={{ scale: hover ? 1.8 : 1, backgroundColor: hover ? 'rgba(34,211,238,0.12)' : 'rgba(34,211,238,0)' }} transition={{ duration: 0.2 }}/>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-white" style={{ x, y, translateX: '-50%', translateY: '-50%' }}/>
    </>);
}
