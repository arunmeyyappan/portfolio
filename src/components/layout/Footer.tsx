import { Link } from 'react-router-dom';
import { Github, Linkedin, Globe } from 'lucide-react';
import { navItems, profile } from '../../data/profile';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white/10">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-2xl">{profile.name}</p>
          <p className="mt-3 max-w-sm text-sm" style={{ color: 'var(--muted)' }}>
            Full-Stack Developer and Founder & CEO of EVO Codes. {profile.location}.
          </p>
          <div className="mt-5 flex gap-3">
            <a className="grid h-10 w-10 place-items-center rounded-full border border-white/15 hover:border-cyan hover:text-cyan" href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github size={18} />
            </a>
            <a className="grid h-10 w-10 place-items-center rounded-full border border-white/15 hover:border-cyan hover:text-cyan" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
            <a className="grid h-10 w-10 place-items-center rounded-full border border-white/15 hover:border-cyan hover:text-cyan" href={profile.links.evocodes} target="_blank" rel="noopener noreferrer" aria-label="EVO Codes website">
              <Globe size={18} />
            </a>
          </div>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {navItems.map((n) => (
              <li key={n.to}>
                <Link className="text-white/70 hover:text-white" to={n.to}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow">Venture</p>
          <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
            Building Digital Products. Creating Meaningful Impact.
          </p>
          <Link to="/evo-codes" className="mt-3 inline-block text-sm text-cyan hover:text-white">
            About EVO Codes →
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs" style={{ color: 'var(--muted)' }}>
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </div>
    </footer>
  );
}
