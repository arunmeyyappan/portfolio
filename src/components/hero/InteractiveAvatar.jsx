/**
 * InteractiveAvatar.jsx  (photo-realistic version)
 * ─────────────────────────────────────────────────────────────────────────────
 * npm install:  NONE. Needs only React 18.
 * Files:        put  InteractiveAvatar.jsx  and  arun-cutout.webp  in the same folder.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Uses your real photo (background removed) instead of drawn artwork:
 *   • The head and the shoulders are two copies of the photo in real CSS 3D space; the head
 *     turns and tilts toward the cursor around the neck, so it parallaxes against the suit.
 *   • The eyes are live: the iris/pupil are re-drawn inside the real eye openings and follow the
 *     cursor anywhere in the window (window "mousemove"), clamped so they never leave the eye,
 *     smoothed with spring physics. Natural blinks, idle float, breathing.
 *   • Transparent background, indigo / cyan rim light, bottom fade into the page.
 *   • Respects prefers-reduced-motion, pauses when off-screen, cleans up all listeners.
 *
 * Usage:
 *   <InteractiveAvatar className="w-full max-w-[460px]" />
 * Props: className, tilt (0–1.5, default 1; 0 = eyes only), src (override the image), label.
 */
import { memo, useEffect, useId, useRef } from 'react';
import PHOTO from './arun-cutout.webp';

/* ───────────────────────────── tuning ───────────────────────────── */

const MOTION = {
  perspective: 1200,
  headTurn: 8, // max deg left/right
  headLift: 5, // max deg up/down
  headRoll: 1.6,
  cardTurn: 3,
  cardLift: 2,
  floatPx: 6,
  breathPx: 2,
};

/* Eye geometry in the photo's 768 × 1024 pixel space.
 * cx/cy = centre of the eye opening, rx/ry = half width / height of the opening,
 * ix/iy = where the iris sits in the photo at rest. */
const EYES = [
  { key: 'L', cx: 314, cy: 365, rx: 30, ryU: 13, ryL: 12, ix: 312, iy: 364, sclera: '#9d8b85', lid: '#5a4039' },
  { key: 'R', cx: 468, cy: 364, rx: 32, ryU: 13, ryL: 12, ix: 463, iy: 362, sclera: '#a89089', lid: '#6b4d45' },
];
const IRIS_R = 12.5;
const PUPIL_R = 5.4;
const MAX_GAZE_X = 11;
const MAX_GAZE_Y = 3.6;

/* Rim light colours around the silhouette */
const RIM_CYAN = 'rgba(34,211,238,0.22)';
const RIM_INDIGO = 'rgba(129,140,248,0.3)';

const Z = { body: -26, head: 0, eyes: 5 };

/* ───────────────────────────── helpers ───────────────────────────── */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const rand = (a, b) => a + Math.random() * (b - a);
const layerTransform = (z) => `translateZ(${z}px) scale(${(MOTION.perspective - z) / MOTION.perspective})`;
const almond = (e) =>
  `M${e.cx - e.rx} ${e.cy + 1} Q${e.cx} ${e.cy - e.ryU * 2} ${e.cx + e.rx} ${e.cy + 1} Q${e.cx} ${e.cy + e.ryL * 1.7} ${e.cx - e.rx} ${e.cy + 1}Z`;

function spring(s, target, k, c, dt) {
  s.v += (k * (target - s.x) - c * s.v) * dt;
  s.x += s.v * dt;
}

/* ───────────────────────────── component ───────────────────────────── */

function InteractiveAvatar({ className = '', tilt = 1, src = PHOTO, label = 'Portrait whose eyes and head follow your cursor' }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const rootRef = useRef(null);
  const floatRef = useRef(null);
  const cardRef = useRef(null);
  const pivotRef = useRef(null);
  const bodyRef = useRef(null);
  const irises = useRef({});
  const lids = useRef({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduce = mq.matches;
    const onMq = (e) => {
      reduce = e.matches;
    };
    mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);

    const ptr = { x: null, y: null };
    const onMove = (e) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
    };
    const onTouch = (e) => {
      const t = e.touches && e.touches[0];
      if (t) {
        ptr.x = t.clientX;
        ptr.y = t.clientY;
      }
    };
    const onLeave = () => {
      ptr.x = null;
      ptr.y = null;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    const S = { gx: { x: 0, v: 0 }, gy: { x: 0, v: 0 }, hx: { x: 0, v: 0 }, hy: { x: 0, v: 0 } };
    const idle = { tx: 0, ty: 0, next: 0 };
    let nextBlink = performance.now() + rand(1400, 3200);
    let blinkStart = -1;
    let doubleBlink = false;
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const amp = reduce ? 0 : tilt;

      /* cursor relative to the face, as a vector of length ≤ 1 */
      const r = root.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.37;
      let nx = 0;
      let ny = 0;
      if (ptr.x !== null) {
        const R = Math.max(240, Math.min(window.innerWidth, window.innerHeight) * 0.5);
        let dx = (ptr.x - cx) / R;
        let dy = (ptr.y - cy) / R;
        const len = Math.hypot(dx, dy);
        if (len > 1) {
          dx /= len;
          dy /= len;
        }
        nx = dx;
        ny = dy;
      } else if (!reduce) {
        if (now > idle.next) {
          const calm = Math.random() < 0.45;
          idle.tx = calm ? 0 : rand(-0.4, 0.4);
          idle.ty = calm ? 0 : rand(-0.22, 0.18);
          idle.next = now + rand(1500, 3800);
        }
        nx = idle.tx;
        ny = idle.ty;
      }

      const sub = Math.max(1, Math.ceil(dt / 0.008));
      const h = dt / sub;
      for (let i = 0; i < sub; i += 1) {
        spring(S.gx, nx, 230, 26, h);
        spring(S.gy, ny, 230, 26, h);
        spring(S.hx, nx, 55, 12, h);
        spring(S.hy, ny, 55, 12, h);
      }

      const breathe = reduce ? 0 : Math.sin(t * 1.7);
      const bob = reduce ? 0 : Math.sin(t * 0.85);
      const sway = reduce ? 0 : Math.sin(t * 0.5);

      if (floatRef.current) {
        floatRef.current.style.transform = `translate3d(0,${(bob * MOTION.floatPx).toFixed(2)}px,0) rotateZ(${(sway * 0.4).toFixed(3)}deg)`;
      }
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${(-S.hy.x * MOTION.cardLift * amp).toFixed(3)}deg) rotateY(${(S.hx.x * MOTION.cardTurn * amp).toFixed(3)}deg)`;
      }
      if (pivotRef.current) {
        pivotRef.current.style.transform = `translate3d(0,${(-breathe * 1.2).toFixed(2)}px,0) rotateX(${(-S.hy.x * MOTION.headLift * amp).toFixed(3)}deg) rotateY(${(S.hx.x * MOTION.headTurn * amp).toFixed(3)}deg) rotateZ(${(S.hx.x * MOTION.headRoll * amp).toFixed(3)}deg)`;
      }
      if (bodyRef.current) {
        const s = (MOTION.perspective - Z.body) / MOTION.perspective;
        bodyRef.current.style.transform = `translate3d(0,${(-breathe * MOTION.breathPx).toFixed(2)}px,${Z.body}px) scale(${(s * (1 + 0.005 * breathe)).toFixed(5)})`;
      }

      /* blink + lids droop a little when looking down */
      let closure = 0;
      if (!reduce) {
        if (blinkStart < 0 && now >= nextBlink) {
          blinkStart = now;
          doubleBlink = Math.random() < 0.18;
          nextBlink = now + rand(2600, 6200);
        }
        if (blinkStart >= 0) {
          const p = (now - blinkStart) / 190;
          if (p >= 1) {
            blinkStart = -1;
            if (doubleBlink) {
              doubleBlink = false;
              nextBlink = now + 110;
            }
          } else {
            closure = p < 0.4 ? smooth(p / 0.4) : smooth(1 - (p - 0.4) / 0.6);
          }
        }
      }
      const lidAmount = clamp(closure + clamp(S.gy.x, 0, 1) * 0.18, 0, 1);

      /* iris position, clamped to the eye opening (ellipse) */
      let gxp = S.gx.x * MAX_GAZE_X;
      let gyp = S.gy.x * MAX_GAZE_Y;
      const q = Math.hypot(gxp / MAX_GAZE_X, gyp / MAX_GAZE_Y);
      if (q > 1) {
        gxp /= q;
        gyp /= q;
      }

      for (let i = 0; i < EYES.length; i += 1) {
        const e = EYES[i];
        const iris = irises.current[e.key];
        if (iris) iris.setAttribute('transform', `translate(${(gxp + e.ix - e.cx).toFixed(2)} ${(gyp + e.iy - e.cy).toFixed(2)})`);
        const lid = lids.current[e.key];
        if (lid) lid.setAttribute('transform', `translate(0 ${(-(1 - lidAmount) * (e.ryU * 2.6 + 4)).toFixed(2)})`);
      }
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        },
        { threshold: 0 },
      );
      io.observe(root);
    }
    start();

    return () => {
      stop();
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      mq.removeEventListener ? mq.removeEventListener('change', onMq) : mq.removeListener(onMq);
    };
  }, [tilt]);

  const photoLayer = (z, mask, ref, children) => (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        transform: layerTransform(z),
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        pointerEvents: 'none',
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      {src ? <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} /> : null}
      {children}
    </div>
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 460,
        aspectRatio: '3 / 4',
        margin: '0 auto',
        userSelect: 'none',
        /* rim light that follows the silhouette: cool cyan on the left, indigo on the right */
        filter: `drop-shadow(-5px 0 9px ${RIM_CYAN}) drop-shadow(5px 0 9px ${RIM_INDIGO}) drop-shadow(0 0 24px rgba(99,102,241,0.2))`,
      }}
    >
      <div aria-hidden="true" style={AURA} />

      <div
        ref={rootRef}
        role="img"
        aria-label={label}
        style={{
          position: 'absolute',
          inset: 0,
          perspective: MOTION.perspective,
          WebkitMaskImage: 'linear-gradient(to bottom,#000 76%,transparent 99%)',
          maskImage: 'linear-gradient(to bottom,#000 76%,transparent 99%)',
        }}
      >
        <div ref={floatRef} style={PRESERVE}>
          <div ref={cardRef} style={PRESERVE}>
            {/* shoulders, suit and tie */}
            {photoLayer(Z.body, 'linear-gradient(to bottom,transparent 55%,#000 61.5%)', bodyRef)}
            {/* head: turns around the neck */}
            <div ref={pivotRef} style={{ ...PRESERVE, transformOrigin: '50% 63%' }}>
              {photoLayer(Z.head, 'linear-gradient(to bottom,#000 62%,transparent 68%)', null)}
              <div style={{ position: 'absolute', inset: 0, transform: layerTransform(Z.eyes), pointerEvents: 'none' }}>
                <svg viewBox="0 0 768 1024" width="100%" height="100%" aria-hidden="true" focusable="false" style={{ display: 'block' }}>
                  <Eyes u={u} irises={irises} lids={lids} />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PRESERVE = { position: 'absolute', inset: 0, transformStyle: 'preserve-3d' };

const AURA = {
  position: 'absolute',
  inset: '-14% -18%',
  pointerEvents: 'none',
  background: [
    'radial-gradient(46% 40% at 50% 40%, rgba(99,102,241,0.30), rgba(99,102,241,0) 70%)',
    'radial-gradient(30% 28% at 24% 26%, rgba(34,211,238,0.14), rgba(34,211,238,0) 70%)',
    'radial-gradient(34% 30% at 80% 62%, rgba(139,92,246,0.18), rgba(139,92,246,0) 70%)',
    'radial-gradient(50% 12% at 50% 92%, rgba(34,211,238,0.12), rgba(34,211,238,0) 70%)',
  ].join(','),
};

/* The live part: re-draws each eye's iris/pupil inside the real eye opening. */
function Eyes({ u, irises, lids }) {
  return (
    <>
      <defs>
        <radialGradient id={`${u}iris`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#6e4527" />
          <stop offset="0.6" stopColor="#3b2112" />
          <stop offset="0.92" stopColor="#170c06" />
          <stop offset="1" stopColor="#0a0503" />
        </radialGradient>
        <linearGradient id={`${u}shade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#120805" stopOpacity="0.8" />
          <stop offset="0.55" stopColor="#120805" stopOpacity="0.1" />
          <stop offset="1" stopColor="#120805" stopOpacity="0" />
        </linearGradient>
        <filter id={`${u}soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        {EYES.map((e) => (
          <clipPath id={`${u}c${e.key}`} key={e.key}>
            <path d={almond(e)} />
          </clipPath>
        ))}
        {EYES.map((e) => (
          <linearGradient id={`${u}s${e.key}`} key={e.key} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={e.sclera} stopOpacity="0.75" />
            <stop offset="0.5" stopColor={e.sclera} />
            <stop offset="1" stopColor={e.sclera} stopOpacity="0.85" />
          </linearGradient>
        ))}
      </defs>
      {EYES.map((e) => (
        <g key={e.key} clipPath={`url(#${u}c${e.key})`}>
          {/* white of the eye (covers the photo's own iris so it can move) */}
          <rect x={e.cx - e.rx - 2} y={e.cy - e.ryU * 2} width={e.rx * 2 + 4} height={(e.ryU + e.ryL) * 2 + 4} fill={`url(#${u}s${e.key})`} />
          <g ref={(n) => (irises.current[e.key] = n)} filter={`url(#${u}soft)`}>
            <circle cx={e.cx} cy={e.cy} r={IRIS_R} fill={`url(#${u}iris)`} />
            <circle cx={e.cx} cy={e.cy} r={PUPIL_R} fill="#040202" />
            <circle cx={e.cx + 4} cy={e.cy - 4.5} r="2.1" fill="#fff" fillOpacity="0.85" />
          </g>
          {/* shadow the upper lid casts on the eyeball */}
          <rect x={e.cx - e.rx - 2} y={e.cy - e.ryU * 2} width={e.rx * 2 + 4} height={e.ryU * 1.5} fill={`url(#${u}shade)`} />
          {/* eyelid: slides down over the eye to blink */}
          <g ref={(n) => (lids.current[e.key] = n)} transform={`translate(0 ${-(e.ryU * 2.6 + 4)})`}>
            <rect x={e.cx - e.rx - 3} y={e.cy - e.ryU * 2.3} width={e.rx * 2 + 6} height={e.ryU * 2.6 + 4} fill={e.lid} />
            <path d={`M${e.cx - e.rx - 3} ${e.cy + e.ryU * 0.3 + 4} Q${e.cx} ${e.cy + e.ryU * 0.3 + 10} ${e.cx + e.rx + 3} ${e.cy + e.ryU * 0.3 + 4}`} fill="none" stroke="#1a0d09" strokeOpacity="0.75" strokeWidth="1.6" />
          </g>
        </g>
      ))}
    </>
  );
}

export default memo(InteractiveAvatar);
