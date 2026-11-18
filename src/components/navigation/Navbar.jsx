import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { navItems } from '../../data/profile';
export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { pathname } = useLocation();
    useEffect(() => setOpen(false), [pathname]);
    useEffect(() => {
        const on = () => setScrolled(window.scrollY > 24);
        on();
        window.addEventListener('scroll', on, { passive: true });
        return () => window.removeEventListener('scroll', on);
    }, []);
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        const esc = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', esc);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', esc);
        };
    }, [open]);
    return (<header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'py-5'}`}>
      <nav aria-label="Primary" className="container-x flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold" aria-label="Arun Meyyappan, home">
          <img src="/favicon.svg" alt="" width={30} height={30}/>
          <span className="hidden sm:inline">Arun Meyyappan</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((n) => (<li key={n.to}>
              <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => `rounded-full px-3.5 py-2 text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/65 hover:text-white'}`}>
                {n.label}
              </NavLink>
            </li>))}
        </ul>

        <button className="grid h-11 w-11 place-items-center rounded-full border border-white/15 lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </nav>

      <AnimatePresence>
        {open && (<motion.div id="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-0 bottom-0 top-[68px] bg-ink/95 backdrop-blur-xl lg:hidden">
            <ul className="container-x flex h-full flex-col justify-center gap-1 pb-16">
              {navItems.map((n, i) => (<motion.li key={n.to} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}>
                  <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => `display block py-2.5 text-4xl ${isActive ? 'gradient-text' : 'text-white/80'}`}>
                    {n.label}
                  </NavLink>
                </motion.li>))}
            </ul>
          </motion.div>)}
      </AnimatePresence>
    </header>);
}
