import { ArrowUpRight } from 'lucide-react';
export default function ExternalLink({ href, children, className = '' }) {
    return (<a href={href} target="_blank" rel="noopener noreferrer" className={`group inline-flex items-center gap-1.5 text-cyan hover:text-white ${className}`}>
      {children}
      <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/>
    </a>);
}
