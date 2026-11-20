/**
 * InteractiveAvatar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * npm install:  NONE. This component only needs React 18 (already in your project).
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A stylised, layered 2.5D / 3D avatar drawn from your photo:
 *   • 5 SVG layers (torso, head, eyes, glasses, hair) stacked in real CSS 3D space,
 *     so head turns create genuine parallax (glasses and hair float in front of the face).
 *   • Eyes track the cursor anywhere in the browser window (window "mousemove"),
 *     with pupils clamped inside the eye sockets and smoothed by spring physics.
 *   • Head + card tilt toward the cursor, idle float and breathing, natural random blinks
 *     (sometimes a double blink), eyelids droop slightly when looking down.
 *   • Transparent background, indigo / cyan rim light, bottom fade so it melts into the page.
 *   • Respects prefers-reduced-motion, pauses when off-screen, cleans up all listeners.
 *
 * Usage:
 *   <InteractiveAvatar />                      // fills its parent, max 440px wide
 *   <InteractiveAvatar className="max-w-[480px]" tilt={0.8} />
 *
 * Props:
 *   className  extra classes for the outer wrapper (e.g. Tailwind sizing)
 *   tilt       0–1.5 multiplier for how far the head/card tilt (default 1, 0 = eyes only)
 *   label      accessible description (default provided)
 *
 * Tune the look in PALETTE and MOTION just below.
 */
import { memo, useEffect, useId, useRef } from 'react';

/* ───────────────────────────── tuning ───────────────────────────── */

const PALETTE = {
  skinLight: '#a96e4e',
  skinMid: '#86533a',
  skinDark: '#5a3123',
  skinDeep: '#2c150e',
  hair: '#09090f',
  hairSheen: '#6270e0',
  suit: '#0b0b12',
  suitLight: '#20203a',
  shirt: '#f4f4f8',
  shirtShade: '#b4b8cc',
  tie: '#07070b',
  tieSheen: '#3a3a66',
  frame: '#aeb4c8',
  frameDark: '#4a4e60',
  rimCool: '#22d3ee',
  rimIndigo: '#818cf8',
};

const MOTION = {
  perspective: 1100, // px
  headTurn: 11, // max deg left/right
  headLift: 7, // max deg up/down
  headRoll: 2.2, // max deg sideways lean
  cardTurn: 4, // whole-card tilt, deg
  cardLift: 3,
  floatPx: 6, // idle float distance
  breathPx: 2.2, // breathing rise
};

/* Eye geometry, in the 768 × 1024 drawing space (same pixels as the reference photo). */
const EYES = [
  { key: 'L', cx: 313, cy: 374 },
  { key: 'R', cx: 470, cy: 370 },
];
const EYE_RX = 33;
const EYE_RY = 19;
const IRIS_R = 15;
const MAX_GAZE_X = EYE_RX - IRIS_R - 2.5; // pupils can never leave the eye opening
const MAX_GAZE_Y = 5.5;
const LID_H = EYE_RY * 2.6 + 6;

/* Depth of each layer in px (positive = closer to the viewer). */
const Z = { torso: -40, head: 0, eyes: 10, hair: 22, glasses: 32 };

/* ───────────────────────────── helpers ───────────────────────────── */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const rand = (a, b) => a + Math.random() * (b - a);
const layerTransform = (z) => `translateZ(${z}px) scale(${(MOTION.perspective - z) / MOTION.perspective})`;
const almond = (cx, cy) =>
  `M${cx - EYE_RX} ${cy} Q${cx} ${cy - EYE_RY * 1.9} ${cx + EYE_RX} ${cy} Q${cx} ${cy + EYE_RY * 1.55} ${cx - EYE_RX} ${cy}Z`;

function spring(s, target, k, c, dt) {
  s.v += (k * (target - s.x) - c * s.v) * dt;
  s.x += s.v * dt;
}

/* ───────────────────────────── component ───────────────────────────── */

function InteractiveAvatar({ className = '', tilt = 1, label = 'Illustrated portrait whose eyes and head follow your cursor' }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const rootRef = useRef(null);
  const floatRef = useRef(null);
  const cardRef = useRef(null);
  const pivotRef = useRef(null);
  const torsoRef = useRef(null);
  const pupils = useRef({});
  const glints = useRef({});
  const lids = useRef({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    /* reduced motion */
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduce = mq.matches;
    const onMq = (e) => {
      reduce = e.matches;
    };
    mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);

    /* global pointer tracking */
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

    /* simulation state */
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

      /* 1 ── where is the cursor, relative to the avatar's eyes? (unit vector, length ≤ 1) */
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
        /* nobody is steering: small, lazy glances so it never looks frozen */
        if (now > idle.next) {
          const calm = Math.random() < 0.4;
          idle.tx = calm ? 0 : rand(-0.4, 0.4);
          idle.ty = calm ? 0 : rand(-0.22, 0.18);
          idle.next = now + rand(1500, 3800);
        }
        nx = idle.tx;
        ny = idle.ty;
      }

      /* 2 ── spring physics (sub-stepped so it stays stable on slow frames) */
      const sub = Math.max(1, Math.ceil(dt / 0.008));
      const h = dt / sub;
      for (let i = 0; i < sub; i += 1) {
        spring(S.gx, nx, 230, 26, h); // eyes: quick
        spring(S.gy, ny, 230, 26, h);
        spring(S.hx, nx, 55, 12, h); // head: slower, a little lag feels organic
        spring(S.hy, ny, 55, 12, h);
      }

      /* 3 ── breathing + float */
      const breathe = reduce ? 0 : Math.sin(t * 1.7);
      const bob = reduce ? 0 : Math.sin(t * 0.85);
      const sway = reduce ? 0 : Math.sin(t * 0.5);

      if (floatRef.current) {
        floatRef.current.style.transform = `translate3d(0,${(bob * MOTION.floatPx).toFixed(2)}px,0) rotateZ(${(sway * 0.45).toFixed(3)}deg)`;
      }
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${(-S.hy.x * MOTION.cardLift * amp).toFixed(3)}deg) rotateY(${(S.hx.x * MOTION.cardTurn * amp).toFixed(3)}deg)`;
      }
      if (pivotRef.current) {
        pivotRef.current.style.transform = `translate3d(0,${(-breathe * 1.4).toFixed(2)}px,0) rotateX(${(-S.hy.x * MOTION.headLift * amp).toFixed(3)}deg) rotateY(${(S.hx.x * MOTION.headTurn * amp).toFixed(3)}deg) rotateZ(${(S.hx.x * MOTION.headRoll * amp).toFixed(3)}deg)`;
      }
      if (torsoRef.current) {
        const s = (MOTION.perspective - Z.torso) / MOTION.perspective;
        torsoRef.current.style.transform = `translate3d(0,${(-breathe * MOTION.breathPx).toFixed(2)}px,${Z.torso}px) scale(${(s * (1 + 0.006 * breathe)).toFixed(5)})`;
      }

      /* 4 ── pupils: clamp to the eye opening (ellipse), then draw */
      let px = S.gx.x * MAX_GAZE_X;
      let py = S.gy.x * MAX_GAZE_Y;
      const q = Math.hypot(px / MAX_GAZE_X, py / MAX_GAZE_Y);
      if (q > 1) {
        px /= q;
        py /= q;
      }

      /* 5 ── blinking (+ lids droop a little when looking down) */
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
      const droop = clamp(S.gy.x, 0, 1) * 0.24;
      const lidAmount = clamp(closure + droop, 0, 1);
      const lidY = -(1 - lidAmount) * (LID_H + 4);

      for (let i = 0; i < EYES.length; i += 1) {
        const k = EYES[i].key;
        if (pupils.current[k]) pupils.current[k].setAttribute('transform', `translate(${px.toFixed(2)} ${py.toFixed(2)})`);
        if (glints.current[k]) glints.current[k].setAttribute('transform', `translate(${(px * 0.35).toFixed(2)} ${(py * 0.35).toFixed(2)})`);
        if (lids.current[k]) lids.current[k].setAttribute('transform', `translate(0 ${lidY.toFixed(2)})`);
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

  const layer = (z, inner, ref) => (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        transform: layerTransform(z),
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <Svg>{inner}</Svg>
    </div>
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        aspectRatio: '3 / 4',
        margin: '0 auto',
        userSelect: 'none',
        filter: 'drop-shadow(0 0 26px rgba(99,102,241,0.30))',
      }}
    >
      {/* ambient glow: transparent, so it blends into any dark page background */}
      <div aria-hidden="true" style={AURA} />

      <div ref={rootRef} role="img" aria-label={label} style={{ position: 'absolute', inset: 0, perspective: MOTION.perspective }}>
        <div ref={floatRef} style={PRESERVE}>
          <div ref={cardRef} style={PRESERVE}>
            {layer(Z.torso, <TorsoArt u={u} />, torsoRef)}
            <div ref={pivotRef} style={{ ...PRESERVE, transformOrigin: '50% 62%' }}>
              {layer(Z.head, <HeadArt u={u} />)}
              {layer(Z.eyes, <EyesArt u={u} pupils={pupils} glints={glints} lids={lids} />)}
              {layer(Z.hair, <HairArt u={u} />)}
              {layer(Z.glasses, <GlassesArt u={u} />)}
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
    'radial-gradient(46% 40% at 50% 40%, rgba(99,102,241,0.34), rgba(99,102,241,0) 70%)',
    'radial-gradient(30% 28% at 24% 26%, rgba(34,211,238,0.16), rgba(34,211,238,0) 70%)',
    'radial-gradient(34% 30% at 80% 62%, rgba(139,92,246,0.20), rgba(139,92,246,0) 70%)',
    'radial-gradient(50% 12% at 50% 92%, rgba(34,211,238,0.14), rgba(34,211,238,0) 70%)',
  ].join(','),
};

const Svg = ({ children }) => (
  <svg viewBox="0 0 768 1024" width="100%" height="100%" aria-hidden="true" focusable="false" style={{ display: 'block', overflow: 'visible' }}>
    {children}
  </svg>
);

/* ───────────────────────────── artwork ─────────────────────────────
 * All drawn in the 768 × 1024 space of the reference photo.
 * Static layers are composited by the browser, so their blurs/gradients cost nothing per frame.
 */

const FACE =
  'M245 300 C238 380 240 440 258 505 C275 570 318 622 392 632 C466 622 509 570 526 505 C544 440 548 380 541 300 C520 230 460 205 392 205 C325 205 268 230 245 300 Z';

function TorsoArt({ u }) {
  const P = PALETTE;
  return (
    <>
      <defs>
        <linearGradient id={`${u}neck`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3f2118" />
          <stop offset="0.5" stopColor="#7a4a35" />
          <stop offset="1" stopColor="#3a1d15" />
        </linearGradient>
        <linearGradient id={`${u}jacket`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={P.suitLight} />
          <stop offset="0.35" stopColor={P.suit} />
          <stop offset="1" stopColor="#05050a" />
        </linearGradient>
        <linearGradient id={`${u}shirt`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={P.shirtShade} />
          <stop offset="0.3" stopColor={P.shirt} />
          <stop offset="0.7" stopColor={P.shirt} />
          <stop offset="1" stopColor={P.shirtShade} />
        </linearGradient>
        <linearGradient id={`${u}tie`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#040408" />
          <stop offset="0.45" stopColor={P.tieSheen} />
          <stop offset="1" stopColor="#040408" />
        </linearGradient>
        <linearGradient id={`${u}rim`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={P.rimCool} stopOpacity="0.95" />
          <stop offset="0.5" stopColor={P.rimCool} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}rimR`} x1="1" x2="0" y1="0" y2="0">
          <stop offset="0" stopColor={P.rimIndigo} stopOpacity="0.95" />
          <stop offset="0.5" stopColor={P.rimIndigo} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.74" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`${u}fadeM`}>
          <rect width="768" height="1024" fill={`url(#${u}fade)`} />
        </mask>
        <filter id={`${u}b2`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <g mask={`url(#${u}fadeM)`}>
        {/* neck + throat */}
        <path d="M290 540 L292 680 C320 740 360 772 392 774 C424 772 464 740 500 680 L502 540 Z" fill={`url(#${u}neck)`} />
        {/* shirt body between lapels */}
        <path d="M302 758 L348 786 L392 762 L438 786 L490 758 L456 1024 L338 1024 Z" fill={`url(#${u}shirt)`} />
        {/* collar flaps */}
        <path d="M268 628 L330 648 L392 748 L348 788 L302 758 Z" fill={`url(#${u}shirt)`} />
        <path d="M526 628 L458 648 L396 748 L438 788 L490 758 Z" fill={`url(#${u}shirt)`} />
        <path d="M330 648 L392 748 L348 788" fill="none" stroke="#9a9eb8" strokeOpacity="0.55" strokeWidth="2" />
        <path d="M458 648 L396 748 L438 788" fill="none" stroke="#9a9eb8" strokeOpacity="0.55" strokeWidth="2" />
        {/* tie */}
        <path d="M356 800 L428 800 L464 1024 L320 1024 Z" fill={`url(#${u}tie)`} />
        <path d="M392 806 L394 1024" stroke="#5a5a90" strokeOpacity="0.35" strokeWidth="3" />
        <path d="M352 752 C362 742 424 742 432 752 L441 796 C420 813 364 813 343 796 Z" fill={`url(#${u}tie)`} />
        <path d="M362 758 C380 752 404 752 422 758" fill="none" stroke="#6a6aa8" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
        {/* jacket */}
        <path d="M0 758 C80 735 170 705 232 662 C248 650 258 638 266 626 L300 760 L338 1024 L0 1024 Z" fill={`url(#${u}jacket)`} />
        <path d="M768 752 C690 735 610 700 560 662 C544 650 534 638 526 626 L492 760 L456 1024 L768 1024 Z" fill={`url(#${u}jacket)`} />
        <path d="M262 650 L290 760 L322 1024 L338 1024 L300 760 Z" fill={P.suitLight} fillOpacity="0.55" />
        <path d="M530 650 L502 760 L470 1024 L456 1024 L492 760 Z" fill={P.suitLight} fillOpacity="0.55" />
        <path d="M232 662 L262 770 L246 800" fill="none" stroke="#33335a" strokeOpacity="0.8" strokeWidth="2" />
        <path d="M560 662 L532 770 L548 800" fill="none" stroke="#33335a" strokeOpacity="0.8" strokeWidth="2" />
        {/* rim light along the shoulders */}
        <path d="M0 758 C80 735 170 705 232 662 C248 650 258 638 266 626" fill="none" stroke={`url(#${u}rim)`} strokeWidth="4" filter={`url(#${u}b2)`} />
        <path d="M768 752 C690 735 610 700 560 662 C544 650 534 638 526 626" fill="none" stroke={`url(#${u}rimR)`} strokeWidth="4" filter={`url(#${u}b2)`} />
      </g>
    </>
  );
}

function HeadArt({ u }) {
  const P = PALETTE;
  return (
    <>
      <defs>
        <radialGradient id={`${u}skin`} cx="0.4" cy="0.36" r="0.8">
          <stop offset="0" stopColor={P.skinLight} />
          <stop offset="0.55" stopColor={P.skinMid} />
          <stop offset="1" stopColor={P.skinDark} />
        </radialGradient>
        <linearGradient id={`${u}ear`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#5e3526" />
          <stop offset="1" stopColor="#7d4a35" />
        </linearGradient>
        <linearGradient id={`${u}rimH`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={P.rimCool} stopOpacity="0.9" />
          <stop offset="0.2" stopColor={P.rimCool} stopOpacity="0" />
          <stop offset="0.8" stopColor={P.rimIndigo} stopOpacity="0" />
          <stop offset="1" stopColor={P.rimIndigo} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${u}hairShade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}sideShade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#1a0b06" stopOpacity="0.5" />
          <stop offset="0.22" stopColor="#1a0b06" stopOpacity="0" />
          <stop offset="0.78" stopColor="#1a0b06" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0b06" stopOpacity="0.5" />
        </linearGradient>
        <pattern id={`${u}stub`} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.5" r="0.75" fill="#0b0503" fillOpacity="0.75" />
          <circle cx="4.6" cy="3.1" r="0.65" fill="#0b0503" fillOpacity="0.65" />
          <circle cx="2.8" cy="5.6" r="0.75" fill="#0b0503" fillOpacity="0.7" />
          <circle cx="6.1" cy="6.1" r="0.55" fill="#0b0503" fillOpacity="0.55" />
        </pattern>
        <filter id={`${u}b3`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={`${u}b6`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${u}b10`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <clipPath id={`${u}face`}>
          <path d={FACE} />
        </clipPath>
        <mask id={`${u}beardM`}>
          <path d={BEARD} fill="#fff" filter={`url(#${u}b6)`} />
        </mask>
      </defs>

      {/* shadow cast by the chin onto the neck */}
      <ellipse cx="392" cy="650" rx="150" ry="30" fill="#140805" fillOpacity="0.6" filter={`url(#${u}b10)`} />

      {/* ears */}
      <path d="M238 372 C205 362 190 392 197 430 C202 462 222 485 244 470 Z" fill={`url(#${u}ear)`} />
      <path d="M222 392 C210 396 208 420 216 440" fill="none" stroke="#2c150e" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
      <path d="M545 366 C580 356 596 386 588 425 C582 457 562 478 541 464 Z" fill={`url(#${u}ear)`} />
      <path d="M562 386 C575 390 578 414 570 434" fill="none" stroke="#2c150e" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />

      {/* face */}
      <path d={FACE} fill={`url(#${u}skin)`} />

      <g clipPath={`url(#${u}face)`}>
        <rect x="230" y="195" width="330" height="110" fill={`url(#${u}hairShade)`} />
        <rect x="230" y="200" width="330" height="440" fill={`url(#${u}sideShade)`} />

        {/* soft light + shadow modelling */}
        <ellipse cx="392" cy="262" rx="105" ry="38" fill="#e0a07a" fillOpacity="0.16" filter={`url(#${u}b10)`} />
        <ellipse cx="318" cy="448" rx="46" ry="30" fill="#e0a07a" fillOpacity="0.14" filter={`url(#${u}b10)`} />
        <ellipse cx="468" cy="446" rx="46" ry="30" fill="#e0a07a" fillOpacity="0.10" filter={`url(#${u}b10)`} />
        <ellipse cx="313" cy="378" rx="58" ry="36" fill={P.skinDeep} fillOpacity="0.38" filter={`url(#${u}b6)`} />
        <ellipse cx="470" cy="374" rx="58" ry="36" fill={P.skinDeep} fillOpacity="0.38" filter={`url(#${u}b6)`} />

        {/* beard + stubble */}
        <path d={BEARD} fill="#1a0c07" fillOpacity="0.26" filter={`url(#${u}b6)`} />
        <rect x="230" y="400" width="330" height="240" fill={`url(#${u}stub)`} mask={`url(#${u}beardM)`} />
        <path d="M262 520 C282 580 330 624 392 632 C454 624 502 580 522 520" fill="none" stroke="#1b0d08" strokeOpacity="0.25" strokeWidth="7" filter={`url(#${u}b3)`} />

        {/* nose */}
        <ellipse cx="392" cy="440" rx="14" ry="62" fill="#e0a07a" fillOpacity="0.16" filter={`url(#${u}b6)`} />
        <ellipse cx="350" cy="452" rx="12" ry="48" transform="rotate(8 350 452)" fill={P.skinDeep} fillOpacity="0.26" filter={`url(#${u}b6)`} />
        <ellipse cx="434" cy="452" rx="12" ry="48" transform="rotate(-8 434 452)" fill={P.skinDeep} fillOpacity="0.26" filter={`url(#${u}b6)`} />
        <ellipse cx="392" cy="518" rx="44" ry="9" fill="#1a0b06" fillOpacity="0.4" filter={`url(#${u}b6)`} />
        <ellipse cx="392" cy="488" rx="13" ry="8" fill="#e8ad88" fillOpacity="0.26" filter={`url(#${u}b3)`} />
        <path d="M346 488 C340 500 348 513 366 511" fill="none" stroke="#2b150d" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M438 488 C444 500 436 513 418 511" fill="none" stroke="#2b150d" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="373" cy="504" rx="9" ry="5.5" transform="rotate(-10 373 504)" fill="#170a06" fillOpacity="0.85" />
        <ellipse cx="412" cy="504" rx="9" ry="5.5" transform="rotate(10 412 504)" fill="#170a06" fillOpacity="0.85" />

        {/* eyebrows */}
        <path d="M250 334 C272 306 328 296 364 316 L360 334 C330 322 290 326 258 350 Z" fill="#0d0705" />
        <path d="M542 332 C520 304 462 294 428 314 L432 332 C462 320 504 324 534 348 Z" fill="#0d0705" />

        {/* mouth */}
        <path d="M338 520 C358 507 380 505 392 511 C404 505 426 507 446 520 C426 525 404 527 392 527 C380 527 358 525 338 520 Z" fill="#6a372d" />
        <path d="M346 524 C370 548 414 548 438 524 C422 529 404 531 392 531 C380 531 362 529 346 524 Z" fill="#84493b" />
        <path d="M366 536 C382 543 402 543 418 536" fill="none" stroke="#c98a72" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
        <path d="M336 520 Q392 534 448 520" fill="none" stroke="#25120c" strokeOpacity="0.85" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M334 516 C330 520 330 526 334 530 M450 516 C454 520 454 526 450 530" fill="none" stroke="#2a150e" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* rim light */}
      <path d={FACE} fill="none" stroke={`url(#${u}rimH)`} strokeWidth="8" clipPath={`url(#${u}face)`} style={{ mixBlendMode: 'screen' }} opacity="0.55" />
    </>
  );
}

const BEARD =
  'M246 410 C250 470 262 520 290 570 C322 612 360 630 392 632 C424 630 462 612 494 570 C522 520 534 470 538 410 C530 440 520 458 505 470 C480 480 470 500 460 512 C440 502 416 498 392 502 C368 498 344 502 324 512 C314 500 304 480 279 470 C264 458 254 440 246 410 Z';

function EyesArt({ u, pupils, glints, lids }) {
  const P = PALETTE;
  return (
    <>
      <defs>
        <radialGradient id={`${u}iris`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8f5c34" />
          <stop offset="0.55" stopColor="#4d2d18" />
          <stop offset="0.9" stopColor="#1f1109" />
          <stop offset="1" stopColor="#0c0604" />
        </radialGradient>
        <linearGradient id={`${u}sclera`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#bfaea4" />
          <stop offset="0.4" stopColor="#eee6e0" />
          <stop offset="1" stopColor="#d9cdc6" />
        </linearGradient>
        <linearGradient id={`${u}lid`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5b3224" />
          <stop offset="1" stopColor="#7a4a35" />
        </linearGradient>
        <linearGradient id={`${u}lidShadow`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1a0b06" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1a0b06" stopOpacity="0" />
        </linearGradient>
        {EYES.map((e) => (
          <clipPath id={`${u}clip${e.key}`} key={e.key}>
            <path d={almond(e.cx, e.cy)} />
          </clipPath>
        ))}
      </defs>
      {EYES.map((e) => (
        <g key={e.key}>
          <path d={almond(e.cx, e.cy)} fill={`url(#${u}sclera)`} />
          <g clipPath={`url(#${u}clip${e.key})`}>
            <g ref={(n) => (pupils.current[e.key] = n)}>
              <circle cx={e.cx} cy={e.cy} r={IRIS_R} fill={`url(#${u}iris)`} />
              <circle cx={e.cx} cy={e.cy} r={6.6} fill="#050302" />
            </g>
            <g ref={(n) => (glints.current[e.key] = n)}>
              <circle cx={e.cx - 6} cy={e.cy - 6} r={3.4} fill="#fff" fillOpacity="0.9" />
              <circle cx={e.cx + 7} cy={e.cy + 5} r={1.6} fill="#fff" fillOpacity="0.55" />
            </g>
            <rect x={e.cx - EYE_RX} y={e.cy - EYE_RY} width={EYE_RX * 2} height={EYE_RY * 1.1} fill={`url(#${u}lidShadow)`} />
            {/* eyelid: slides down over the eye to blink */}
            <g ref={(n) => (lids.current[e.key] = n)} transform={`translate(0 ${-(LID_H + 4)})`}>
              <rect x={e.cx - EYE_RX - 4} y={e.cy - EYE_RY * 1.2} width={EYE_RX * 2 + 8} height={LID_H} fill={`url(#${u}lid)`} />
              <path d={`M${e.cx - EYE_RX - 4} ${e.cy - EYE_RY * 1.2 + LID_H} Q${e.cx} ${e.cy - EYE_RY * 1.2 + LID_H + 8} ${e.cx + EYE_RX + 4} ${e.cy - EYE_RY * 1.2 + LID_H}`} fill="none" stroke="#120804" strokeWidth="3" />
            </g>
          </g>
          <path d={`M${e.cx - EYE_RX} ${e.cy} Q${e.cx} ${e.cy - EYE_RY * 1.9} ${e.cx + EYE_RX} ${e.cy}`} fill="none" stroke="#110704" strokeWidth="3.4" strokeLinecap="round" />
          <path d={`M${e.cx - EYE_RX + 3} ${e.cy + 1} Q${e.cx} ${e.cy + EYE_RY * 1.5} ${e.cx + EYE_RX - 3} ${e.cy + 1}`} fill="none" stroke="#3a1d14" strokeOpacity="0.55" strokeWidth="1.6" />
        </g>
      ))}
      <desc>{P.skinMid}</desc>
    </>
  );
}

function GlassesArt({ u }) {
  const P = PALETTE;
  const L = { cx: 311, cy: 377, r: 63 };
  const R = { cx: 475, cy: 372, r: 62 };
  return (
    <>
      <defs>
        <linearGradient id={`${u}frame`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={P.frame} />
          <stop offset="0.5" stopColor={P.frameDark} />
          <stop offset="1" stopColor={P.frame} />
        </linearGradient>
        <linearGradient id={`${u}glare`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}glareR`} x1="1" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7cf3d4" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#7cf3d4" stopOpacity="0" />
        </linearGradient>
        <filter id={`${u}gb`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      {/* soft shadow the frame throws on the face */}
      <g fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="5" filter={`url(#${u}gb)`} transform="translate(2 6)">
        <circle cx={L.cx} cy={L.cy} r={L.r} />
        <circle cx={R.cx} cy={R.cy} r={R.r} />
      </g>
      {/* lens tint + glare */}
      <circle cx={L.cx} cy={L.cy} r={L.r - 2} fill="#818cf8" fillOpacity="0.05" />
      <circle cx={R.cx} cy={R.cy} r={R.r - 2} fill="#818cf8" fillOpacity="0.05" />
      <path d={`M${L.cx - 44} ${L.cy - 30} A52 52 0 0 1 ${L.cx + 10} ${L.cy - 52}`} fill="none" stroke={`url(#${u}glare)`} strokeWidth="9" strokeLinecap="round" />
      <path d={`M${R.cx + 4} ${R.cy - 54} A56 56 0 0 1 ${R.cx + 50} ${R.cy - 22}`} fill="none" stroke={`url(#${u}glareR)`} strokeWidth="11" strokeLinecap="round" />
      {/* frame */}
      <g fill="none" stroke={`url(#${u}frame)`} strokeWidth="4.2">
        <circle cx={L.cx} cy={L.cy} r={L.r} />
        <circle cx={R.cx} cy={R.cy} r={R.r} />
        <path d={`M${L.cx + L.r - 2} ${L.cy - 12} Q${(L.cx + R.cx) / 2 + 2} ${L.cy - 30} ${R.cx - R.r + 2} ${R.cy - 12}`} strokeWidth="3.6" />
        <path d={`M${L.cx - L.r + 1} ${L.cy - 6} L214 372`} strokeWidth="3.2" />
        <path d={`M${R.cx + R.r - 1} ${R.cy - 6} L572 366`} strokeWidth="3.2" />
      </g>
      <g fill="none" stroke={P.rimCool} strokeOpacity="0.5" strokeWidth="1.4">
        <path d={`M${L.cx - L.r + 6} ${L.cy - 22} A${L.r - 5} ${L.r - 5} 0 0 1 ${L.cx - 10} ${L.cy - L.r + 4}`} />
      </g>
      <g fill="none" stroke={P.rimIndigo} strokeOpacity="0.55" strokeWidth="1.4">
        <path d={`M${R.cx + 14} ${R.cy - R.r + 4} A${R.r - 5} ${R.r - 5} 0 0 1 ${R.cx + R.r - 6} ${R.cy - 14}`} />
      </g>
      {/* nose pads */}
      <ellipse cx="371" cy="411" rx="6" ry="9" fill="#c8ccdc" fillOpacity="0.5" transform="rotate(18 371 411)" />
      <ellipse cx="414" cy="408" rx="6" ry="9" fill="#c8ccdc" fillOpacity="0.5" transform="rotate(-18 414 408)" />
    </>
  );
}

function HairArt({ u }) {
  const P = PALETTE;
  const HAIR =
    'M238 318 C224 286 208 250 204 214 C198 160 226 112 282 80 C330 56 408 46 470 62 C530 76 576 118 586 176 C592 214 580 250 566 276 C560 292 552 304 548 322 C544 290 530 252 498 228 C470 208 436 204 410 214 C388 204 352 204 322 220 C290 238 264 262 250 300 Z';
  return (
    <>
      <defs>
        <linearGradient id={`${u}hair`} x1="0" x2="0.3" y1="0" y2="1">
          <stop offset="0" stopColor="#1a1c3c" />
          <stop offset="0.5" stopColor={P.hair} />
          <stop offset="1" stopColor="#05050a" />
        </linearGradient>
        <linearGradient id={`${u}fadeV`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={P.hair} stopOpacity="0.95" />
          <stop offset="1" stopColor={P.hair} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}hrim`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={P.rimCool} stopOpacity="0.95" />
          <stop offset="0.25" stopColor={P.rimCool} stopOpacity="0" />
          <stop offset="0.75" stopColor={P.rimIndigo} stopOpacity="0" />
          <stop offset="1" stopColor={P.rimIndigo} stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id={`${u}sheen`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.hairSheen} stopOpacity="0.75" />
          <stop offset="1" stopColor={P.hairSheen} stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}hb`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <clipPath id={`${u}hairClip`}>
          <path d={HAIR} />
        </clipPath>
      </defs>
      {/* short tapered sides (temple fade) */}
      <path d="M222 255 C214 300 222 352 242 396 L254 396 C247 352 244 312 252 262 Z" fill={`url(#${u}fadeV)`} />
      <path d="M566 255 C574 300 566 352 546 396 L534 396 C541 352 544 312 538 262 Z" fill={`url(#${u}fadeV)`} />
      {/* main mass */}
      <path d={HAIR} fill={`url(#${u}hair)`} />
      <g clipPath={`url(#${u}hairClip)`}>
        {/* waves of the swept quiff */}
        <g fill="none" strokeLinecap="round">
          <path d="M262 250 C280 170 360 96 470 92" stroke="#000" strokeOpacity="0.6" strokeWidth="5" />
          <path d="M300 232 C320 160 400 112 520 122" stroke="#000" strokeOpacity="0.55" strokeWidth="5" />
          <path d="M350 214 C372 160 440 122 548 162" stroke="#000" strokeOpacity="0.55" strokeWidth="5" />
          <path d="M232 222 C236 160 290 100 360 80" stroke="#000" strokeOpacity="0.5" strokeWidth="5" />
          <path d="M268 246 C286 176 364 104 470 100" stroke={P.hairSheen} strokeOpacity="0.32" strokeWidth="2.4" />
          <path d="M306 228 C326 166 404 120 520 130" stroke={P.hairSheen} strokeOpacity="0.30" strokeWidth="2.4" />
          <path d="M356 210 C378 166 442 130 546 168" stroke={P.hairSheen} strokeOpacity="0.26" strokeWidth="2.2" />
          <path d="M238 226 C242 166 294 108 360 88" stroke={P.hairSheen} strokeOpacity="0.28" strokeWidth="2.2" />
          <path d="M430 72 C490 74 548 108 570 176" stroke={P.hairSheen} strokeOpacity="0.30" strokeWidth="2.2" />
        </g>
        <ellipse cx="420" cy="104" rx="120" ry="20" transform="rotate(-8 420 104)" fill={`url(#${u}sheen)`} style={{ mixBlendMode: 'screen' }} />
        <ellipse cx="270" cy="150" rx="46" ry="18" transform="rotate(-38 270 150)" fill={`url(#${u}sheen)`} fillOpacity="0.7" style={{ mixBlendMode: 'screen' }} />
        {/* rim light on the outer edge */}
        <path d={HAIR} fill="none" stroke={`url(#${u}hrim)`} strokeWidth="9" filter={`url(#${u}hb)`} style={{ mixBlendMode: 'screen' }} opacity="0.65" />
      </g>
    </>
  );
}

export default memo(InteractiveAvatar);
