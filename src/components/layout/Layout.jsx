import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Navbar from '../navigation/Navbar';
import Footer from './Footer';
import Particles from '../animations/Particles';
import PageTransition from '../animations/PageTransition';
import Cursor from '../common/Cursor';
import ScrollProgress from '../common/ScrollProgress';
import BackToTop from '../common/BackToTop';
import Loader from '../common/Loader';
import ScrollManager from '../common/ScrollManager';
export default function Layout() {
    const location = useLocation();
    return (<>
      <a href="#main" className="sr-only z-[300] rounded-full bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Loader />
      <ScrollProgress />
      <Particles />
      <Cursor />
      <ScrollManager />
      <Navbar />
      <main id="main" className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Suspense fallback={<div className="grid min-h-screen place-items-center font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Loading…</div>}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
    </>);
}
