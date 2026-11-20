import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import SplitText from '../common/SplitText';
import MagneticButton from '../common/MagneticButton';
import InteractiveAvatar from './InteractiveAvatar'; // put InteractiveAvatar.jsx next to this file
import { profile } from '../../data/profile';

/**
 * Hero: responsive 2-column grid. Text + CTAs on the left, the cursor-tracking avatar on the right.
 * Below `lg` the columns stack (text first, avatar below).
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
          {/* Left: text */}
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
              <MagneticButton to="/evo-codes" variant="ghost">Explore EVO Codes</MagneticButton>
              <MagneticButton to="/contact" variant="ghost">Let&apos;s Connect</MagneticButton>
            </motion.div>
          </motion.div>

          {/* Right: interactive avatar */}
          <div className="relative flex justify-center lg:justify-end">
            <InteractiveAvatar className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[460px]" />
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
