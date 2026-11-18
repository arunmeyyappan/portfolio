import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
export default function BackToTop() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const on = () => setShow(window.scrollY > 600);
        on();
        window.addEventListener('scroll', on, { passive: true });
        return () => window.removeEventListener('scroll', on);
    }, []);
    return (<AnimatePresence>
      {show && (<motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="glass fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full text-white hover:text-cyan">
          <ArrowUp size={20}/>
        </motion.button>)}
    </AnimatePresence>);
}
