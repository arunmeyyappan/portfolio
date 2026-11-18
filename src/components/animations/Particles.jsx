import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
/** Lightweight 2D canvas particle field used as the site-wide atmospheric background. */
export default function Particles() {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let raf = 0;
        let w = 0;
        let h = 0;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const count = window.innerWidth < 640 ? 32 : 70;
        const pts = Array.from({ length: count }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.4 + 0.4,
            vx: (Math.random() - 0.5) * 0.00006,
            vy: -Math.random() * 0.00008 - 0.00002,
            c: ['#8b5cf6', '#22d3ee', '#fb923c'][Math.floor(Math.random() * 3)],
        }));
        const resize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            for (const p of pts) {
                if (!reduce) {
                    p.x += p.vx * 16;
                    p.y += p.vy * 16;
                    if (p.y < -0.02)
                        p.y = 1.02;
                    if (p.x < -0.02)
                        p.x = 1.02;
                    if (p.x > 1.02)
                        p.x = -0.02;
                }
                ctx.beginPath();
                ctx.fillStyle = p.c;
                ctx.globalAlpha = 0.5;
                ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        };
        const onVis = () => {
            cancelAnimationFrame(raf);
            if (!document.hidden && !reduce)
                raf = requestAnimationFrame(draw);
        };
        resize();
        draw();
        if (reduce)
            cancelAnimationFrame(raf);
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', onVis);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [reduce]);
    return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0"/>;
}
