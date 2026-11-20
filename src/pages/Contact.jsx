import { useState } from 'react';
import { Github, Globe, Linkedin, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import SplitText from '../components/common/SplitText';
import Reveal from '../components/common/Reveal';
import ExternalLink from '../components/common/ExternalLink';
import { profile } from '../data/profile';
import { apiEnabled, sendMessage, sendToEndpoint } from '../lib/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function Contact() {
    useDocumentTitle('Contact');
    const [values, setValues] = useState({ name: '', email: '', message: '' });
    const [trap, setTrap] = useState(''); // honeypot: hidden from people, bots fill it in
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ kind: 'idle' });
    const usingApi = apiEnabled; // our own backend: stored in the dashboard inbox
    const usingThirdParty = !usingApi && profile.contactEndpoint.trim() !== '';
    const usingBackend = usingApi || usingThirdParty;
    const validate = () => {
        const e = {};
        if (values.name.trim().length < 2)
            e.name = 'Please enter your name.';
        if (!emailRe.test(values.email.trim()))
            e.email = 'Please enter a valid email address.';
        if (values.message.trim().length < 10)
            e.message = 'Please write at least 10 characters.';
        return e;
    };
    const onSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length)
            return;
        if (usingBackend) {
            setStatus({ kind: 'sending' });
            try {
                if (usingApi) {
                    await sendMessage({ ...values, website: trap });
                }
                else {
                    await sendToEndpoint(profile.contactEndpoint, values);
                }
                setStatus({ kind: 'sent' });
                setValues({ name: '', email: '', message: '' });
            }
            catch (err) {
                setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
            }
            return;
        }
        const subject = encodeURIComponent(`Portfolio enquiry from ${values.name.trim()}`);
        const body = encodeURIComponent(`${values.message.trim()}\n\nFrom: ${values.name.trim()} <${values.email.trim()}>`);
        window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
        setStatus({ kind: 'mailto' });
    };
    const field = (id, label, type = 'text', rows) => {
        const err = errors[id];
        const common = {
            id,
            name: id,
            value: values[id],
            onChange: (e) => setValues((v) => ({ ...v, [id]: e.target.value })),
            'aria-invalid': !!err,
            'aria-describedby': err ? `${id}-err` : undefined,
            className: `mt-2 w-full rounded-2xl border bg-white/5 px-4 py-3 text-white placeholder-white/30 ${err ? 'border-red-400' : 'border-white/15 focus:border-cyan'}`,
        };
        return (<div>
        <label htmlFor={id} className="text-sm text-white/80">{label}</label>
        {rows ? <textarea rows={rows} {...common}/> : <input type={type} autoComplete={id} {...common}/>}
        {err && <p id={`${id}-err`} className="mt-1.5 text-sm text-red-300">{err}</p>}
      </div>);
    };
    return (<>
      <header className="container-x pb-12 pt-36 sm:pt-44">
        <p className="eyebrow">Contact</p>
        <h1 className="display mt-5 max-w-5xl text-5xl sm:text-7xl lg:text-8xl">
          <SplitText text="Have an Idea?"/> <br />
          <SplitText text="Let's Build Something Great." className="gradient-text" delay={0.3}/>
        </h1>
      </header>

      <section className="container-x grid gap-10 pb-12 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <ul className="space-y-4">
            <li>
              <a className="glass flex items-center gap-4 rounded-2xl p-5 hover:border-cyan" href={`mailto:${profile.email}`}>
                <Mail className="text-cyan" aria-hidden/> <span><span className="eyebrow block">Email</span>{profile.email}</span>
              </a>
              {profile.emailIsPlaceholder && (<p className="mt-2 px-1 text-xs text-ember">Placeholder email. Set the real address in src/data/profile.js.</p>)}
            </li>
            <li><a className="glass flex items-center gap-4 rounded-2xl p-5 hover:border-cyan" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="text-cyan" aria-hidden/> <span><span className="eyebrow block">LinkedIn</span>linkedin.com/in/arunmeyyappan</span></a></li>
            <li><a className="glass flex items-center gap-4 rounded-2xl p-5 hover:border-cyan" href={profile.links.github} target="_blank" rel="noopener noreferrer"><Github className="text-cyan" aria-hidden/> <span><span className="eyebrow block">GitHub</span>arunmeyyappanplhere</span></a></li>
            <li><a className="glass flex items-center gap-4 rounded-2xl p-5 hover:border-cyan" href={profile.links.evocodes} target="_blank" rel="noopener noreferrer"><Globe className="text-cyan" aria-hidden/> <span><span className="eyebrow block">EVO Codes</span>evocodes.in</span></a></li>
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} noValidate className="glass space-y-5 rounded-[2rem] p-6 sm:p-9" aria-label="Contact form">
            {field('name', 'Your name')}
            {field('email', 'Your email', 'email')}
            {field('message', 'Message', 'text', 5)}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
              <label htmlFor="website">Leave this field empty</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)}/>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {usingBackend
            ? usingApi
                ? 'Your message is saved securely and I will reply by email.'
                : 'Your message is sent to the configured form service.'
            : 'This form opens your email app with the message pre-filled. Nothing is sent until you press send there.'}
            </p>
            <button type="submit" className="btn btn-primary disabled:opacity-60" disabled={status.kind === 'sending'}>
              {status.kind === 'sending' ? 'Sending…' : usingBackend ? 'Send message' : 'Open in email app'}
            </button>
            <div aria-live="polite">
              {status.kind === 'mailto' && (<p className="flex items-start gap-2 text-sm text-cyan"><CheckCircle2 size={18} className="mt-0.5 shrink-0"/> Your email app should have opened. If not, email {profile.email} directly.</p>)}
              {status.kind === 'sent' && (<p className="flex items-start gap-2 text-sm text-emerald-300"><CheckCircle2 size={18} className="mt-0.5 shrink-0"/> Message sent. Thank you!</p>)}
              {status.kind === 'error' && (<p className="flex items-start gap-2 text-sm text-red-300"><AlertCircle size={18} className="mt-0.5 shrink-0"/> {status.text}</p>)}
            </div>
          </form>
        </Reveal>
      </section>
      <p className="container-x pb-8 text-sm" style={{ color: 'var(--muted)' }}>Or see what I am building at <ExternalLink href={profile.links.evocodes}>EVO Codes</ExternalLink>.</p>
    </>);
}
