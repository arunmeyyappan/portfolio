import { lazy, Suspense } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import SplitText from '../common/SplitText';
import MagneticButton from '../common/MagneticButton';
import { profile } from '../../data/profile';

const HeroScene = lazy(() => import('./HeroScene'));

/**
 * Hero layout: one centred container split into two equal halves.
 *  - left half  : text, starting at the container's left edge
 *  - right half : the 3D object, centred inside its own half (so it sits on the right of the page)
 * Below the `lg` breakpoint the halves stack (text first, 3D below).
 */
export default function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -60]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0.25]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-28 lg:pb-16">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* ───────── Left half: text ───────── */}
          <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 lg:pr-4">
            <p className="eyebrow">Chennai, India · Founder & Developer</p>

            <h1 className="display mt-6 text-[2.6rem] sm:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
              <SplitText text={profile.heroLine1} delay={1.4} />
              <br />
              <SplitText text={profile.heroLine2} className="gradient-text" delay={1.9} />
            </h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="mt-8 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: 'var(--muted)' }}
            >
              {profile.heroIntro}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7, duration: 0.8 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <MagneticButton to="/projects">
                View My Work <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton to="/evo-codes" variant="ghost">
                Explore EVO Codes
              </MagneticButton>
              <MagneticButton to="/contact" variant="ghost">
                Let&apos;s Connect
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* ───────── Right half: 3D object ───────── */}
          <div className="relative h-[340px] sm:h-[440px] lg:h-[600px] xl:h-[680px]">
            <div className="pointer-events-none absolute inset-0 -z-0 grid place-items-center" aria-hidden>
              <div className="h-3/4 w-3/4 rounded-full bg-violet/20 blur-[90px]" />
            </div>
            <div className="absolute inset-0">
              <Suspense fallback={null}>
                <HeroScene />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block" aria-hidden>
        <div className="flex h-11 w-7 justify-center rounded-full border border-white/30 pt-2">
          <span className="h-2 w-1 animate-scroll rounded-full bg-cyan" />
        </div>
      </div>
    </section>
  );
}
