const accentHex = { violet: '#8b5cf6', cyan: '#22d3ee', ember: '#fb923c' };
/** Custom, abstract mockups. They illustrate structure only and contain no invented data or metrics. */
export default function ProjectVisual({ project, className = '' }) {
    const c = accentHex[project.accent];
    return (<div role="img" aria-label={project.image ? `${project.title} cover image` : `Illustrative mockup for ${project.title}`} className={`relative overflow-hidden rounded-[2rem] border border-white/10 ${className}`} style={{ background: `radial-gradient(120% 120% at 20% 0%, ${c}33 0%, #0a0f24 55%, #05060d 100%)` }}>
      {project.image ? (<img src={project.image} alt={`${project.title} screenshot`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover"/>) : (<>
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
          <div className="relative grid h-full w-full place-items-center p-6 sm:p-10">
            <Mockup project={project} color={c}/>
          </div>
        </>)}
    </div>);
}
function Window({ title, children, color }) {
    return (<div className="w-full max-w-md rounded-2xl border border-white/15 bg-ink/80 shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20"/>
        <span className="h-2.5 w-2.5 rounded-full bg-white/20"/>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }}/>
        <span className="ml-3 truncate font-mono text-[10px] text-white/50">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>);
}
function Bars({ color, rows = 3 }) {
    const w = ['82%', '64%', '48%', '70%'];
    return (<div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (<div key={i} className="h-2.5 rounded-full bg-white/10">
          <div className="h-full rounded-full" style={{ width: w[i % 4], background: i === 0 ? color : 'rgba(255,255,255,0.25)' }}/>
        </div>))}
    </div>);
}
function Mockup({ project, color }) {
    switch (project.visual) {
        case 'evocodes':
            return (<Window title="evocodes.in" color={color}>
          <p className="font-display text-2xl font-semibold">EVO CODES</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Building Digital Products. Creating Meaningful Impact.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (<div key={i} className="h-16 rounded-xl border border-white/10 bg-white/5"/>))}
          </div>
          <div className="mt-4"><Bars color={color}/></div>
        </Window>);
        case 'taskflow':
            return (<Window title="TaskFlow: docker compose" color={color}>
          <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
            {['frontend', 'backend', 'mongodb'].map((n) => (<div key={n} className="rounded-xl border border-white/15 bg-white/5 p-3 text-center">
                <div className="mx-auto mb-2 h-6 w-6 rounded-md" style={{ background: color, opacity: 0.8 }}/>
                {n}
              </div>))}
          </div>
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((i) => (<div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2">
                <span className="h-3.5 w-3.5 rounded border border-white/30"/>
                <span className="h-2 flex-1 rounded-full bg-white/15"/>
              </div>))}
          </div>
        </Window>);
        case 'buddybook':
            return (<Window title="Buddy Book" color={color}>
          <div className="mb-3 h-8 rounded-lg border border-white/15 bg-white/5"/>
          {[0, 1, 2].map((i) => (<div key={i} className="mb-2 flex items-center gap-3 rounded-xl border border-white/10 p-3">
              <span className="h-8 w-8 rounded-full" style={{ background: color, opacity: 0.35 + i * 0.2 }}/>
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-2/3 rounded-full bg-white/25"/>
                <div className="h-2 w-1/3 rounded-full bg-white/10"/>
              </div>
            </div>))}
        </Window>);
        case 'arad':
            return (<svg viewBox="0 0 400 260" className="w-full max-w-md" aria-hidden>
          <g fill="none" stroke={color} strokeWidth="1.5">
            <rect x="130" y="90" width="140" height="90" rx="14" fill="#0a0f24"/>
            <circle cx="200" cy="135" r="26" strokeDasharray="4 5"/>
            <path d="M285 80 q30 -34 60 0 M297 92 q18 -20 36 0"/>
            <path d="M200 38 v34 M186 50 l14 -14 l14 14" opacity="0.6"/>
          </g>
          <circle cx="200" cy="135" r="6" fill={color}/>
          <text x="200" y="215" textAnchor="middle" fill="#9aa3c7" fontFamily="JetBrains Mono, monospace" fontSize="11">ESP32 · GPS · IMU · LoRa</text>
        </svg>);
        case 'mentor':
            return (<Window title="Website redesign: black theme" color={color}>
          <div className="h-24 rounded-xl border border-white/10" style={{ background: `linear-gradient(135deg, #000 40%, ${color}55)` }}/>
          <div className="mt-4"><Bars color={color} rows={3}/></div>
        </Window>);
        case 'foods':
            return (<Window title="srisubankafoods.com" color={color}>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (<div key={i} className="h-16 rounded-xl border border-white/10" style={{ background: i === 0 ? `${color}40` : 'rgba(255,255,255,0.05)' }}/>))}
          </div>
          <div className="mt-4"><Bars color={color} rows={2}/></div>
        </Window>);
        case 'grantu':
            return (<Window title="GrantU Education" color={color}>
          <div className="grid h-28 place-items-center rounded-xl border border-dashed border-white/20 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
            add screenshots in data/projects.js
          </div>
        </Window>);
        default:
            return (<Window title={project.title} color={color}>
          <Bars color={color} rows={4}/>
        </Window>);
    }
}
