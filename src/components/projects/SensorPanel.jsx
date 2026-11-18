import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
/**
 * Interactive demonstration of the PROPOSED detection logic.
 * It is a simulation controlled by the visitor, NOT live data from a real device.
 */
const WARNING_AT = 180; // ~3 minutes inactivity (seconds)
const DEMO_SPEED = 20; // simulated seconds per real second
export default function SensorPanel() {
    const [running, setRunning] = useState(false);
    const [moving, setMoving] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const reduce = useReducedMotion();
    useEffect(() => {
        if (!running)
            return;
        const id = setInterval(() => {
            setElapsed((e) => (moving ? 0 : Math.min(e + DEMO_SPEED / 4, WARNING_AT + 40)));
        }, 250);
        return () => clearInterval(id);
    }, [running, moving]);
    const warning = elapsed >= WARNING_AT;
    const pct = Math.min(100, (elapsed / WARNING_AT) * 100);
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    return (<div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Detection logic simulator</p>
        <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Simulation, not live data
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 font-mono text-sm">
        <div>
          <dt style={{ color: 'var(--muted)' }}>Reference radius</dt>
          <dd className="mt-1 text-lg">≈ 3 m</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--muted)' }}>Inactivity window</dt>
          <dd className="mt-1 text-lg">≈ 3 min</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--muted)' }}>Movement</dt>
          <dd className="mt-1 text-lg">{running ? (moving ? 'Detected' : 'None') : 'n/a'}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--muted)' }}>Inactive for</dt>
          <dd className="mt-1 text-lg">{fmt(elapsed)}</dd>
        </div>
      </dl>

      <div className="mt-6" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progress toward the inactivity threshold">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full ${warning ? 'bg-red-500' : 'bg-gradient-to-r from-cyan to-ember'}`} style={{ width: `${pct}%`, transition: reduce ? 'none' : 'width 0.25s linear' }}/>
        </div>
      </div>

      <div className={`mt-5 rounded-2xl border p-4 text-sm ${warning ? 'border-red-500/60 bg-red-500/10' : 'border-white/10'}`} aria-live="polite">
        {!running && 'Press Start to simulate a device that has established its GPS reference position.'}
        {running && !warning && (moving ? 'Movement within the radius resets the inactivity timer.' : 'No movement. The timer is running.')}
        {running && warning && 'Threshold reached: buzzer and LED warning would activate. After the warning period an inactivity alert with GPS coordinates and sensor data would be sent over LoRa.'}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="btn btn-primary" onClick={() => {
            setRunning((r) => !r);
            if (running) {
                setElapsed(0);
                setMoving(false);
            }
        }}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button className="btn btn-ghost disabled:opacity-40" disabled={!running} onClick={() => setMoving((m) => !m)} aria-pressed={moving}>
          {moving ? 'Stop moving' : 'Simulate movement'}
        </button>
      </div>
    </div>);
}
