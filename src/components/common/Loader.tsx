import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export default function Loader() {
  const [visible, setVisible] = useState(() => !sessionStorageGet());
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      sessionStorageSet();
      setVisible(false);
    }, 1500);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-label="Loading portfolio"
          className="fixed inset-0 z-[200] grid place-items-center bg-ink"
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <div className="text-center">
            <svg width="84" height="84" viewBox="0 0 64 64" className="mx-auto">
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <motion.path
                d="M14 46 L32 14 L50 46 M22 36 H42"
                fill="none"
                stroke="url(#lg)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </svg>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.35em] text-muted" style={{ color: 'var(--muted)' }}>
              Arun Meyyappan
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function sessionStorageGet() {
  try {
    return sessionStorage.getItem('loaded') === '1';
  } catch {
    return false;
  }
}
function sessionStorageSet() {
  try {
    sessionStorage.setItem('loaded', '1');
  } catch {
    /* storage unavailable */
  }
}
