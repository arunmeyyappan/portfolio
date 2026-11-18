/** Static CSS visual used when WebGL is unavailable or fails. */
export default function FallbackVisual({ label = 'Visual' }) {
    return (<div role="img" aria-label={label} className="relative grid h-full w-full place-items-center overflow-hidden">
      <div className="absolute h-64 w-64 rounded-full bg-violet/30 blur-3xl"/>
      <div className="absolute h-40 w-40 translate-x-16 translate-y-10 rounded-full bg-cyan/20 blur-3xl"/>
      <div className="relative grid h-44 w-44 rotate-12 place-items-center rounded-[2.2rem] border border-white/20 bg-gradient-to-br from-white/10 to-white/0 shadow-2xl">
        <svg width="90" height="90" viewBox="0 0 64 64">
          <path d="M14 46 L32 14 L50 46 M22 36 H42" fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>);
}
