import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, Cpu, Database, Monitor, Radio, Radar, Satellite } from 'lucide-react';

const nodes = [
  { id: 'sensors', label: 'GPS + MPU6050', icon: Satellite, text: 'NEO-6M GPS provides position; the MPU6050 accelerometer and gyroscope provide movement data.' },
  { id: 'esp', label: 'ESP32', icon: Cpu, text: 'Receives GPS and movement readings, applies the inactivity logic, and drives the buzzer and LED warning.' },
  { id: 'lora', label: 'LoRa Communication', icon: Radio, text: 'SX1278 LoRa modules transfer alerts from the device to the receiving station.' },
  { id: 'base', label: 'Rescue Base Station', icon: Radar, text: 'The receiving station that gets the alerts and passes them on to the dashboard.' },
  { id: 'dash', label: 'MERN Dashboard', icon: Monitor, text: 'A MERN-based rescue dashboard where alerts with GPS coordinates and sensor information can be viewed.' },
  { id: 'db', label: 'MongoDB', icon: Database, text: 'Stores the alert data for the dashboard.' },
];

export default function AradArchitecture() {
  const [active, setActive] = useState('esp');
  const reduce = useReducedMotion();
  const current = nodes.find((n) => n.id === active)!;
  return (
    <div>
      <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
        {nodes.map((n, i) => {
          const Icon = n.icon;
          const on = n.id === active;
          return (
            <li key={n.id} className="flex flex-1 items-center lg:flex-col lg:items-stretch">
              <button
                onClick={() => setActive(n.id)}
                aria-pressed={on}
                className={`glass relative flex w-full flex-1 items-center gap-3 rounded-2xl p-4 text-left transition-colors lg:flex-col lg:justify-center lg:text-center ${on ? 'border-ember/80 bg-ember/10' : 'hover:border-white/30'}`}
              >
                <Icon size={22} className={on ? 'text-ember' : 'text-cyan'} aria-hidden />
                <span className="font-display text-sm font-medium">{n.label}</span>
                {on && !reduce && (
                  <motion.span layoutId="arad-pulse" className="absolute inset-0 rounded-2xl ring-1 ring-ember/70" />
                )}
              </button>
              {i < nodes.length - 1 && (
                <ArrowRight aria-hidden className="mx-1 hidden shrink-0 text-white/30 lg:block" size={18} />
              )}
            </li>
          );
        })}
      </ol>
      <div className="glass mt-5 min-h-[88px] rounded-2xl p-5" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="eyebrow">{current.label}</p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {current.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
