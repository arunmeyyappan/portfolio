import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SafeCanvas from '../common/WebGLBoundary';
import FallbackVisual from '../common/FallbackVisual';
import type { SkillGroup } from '../../data/skills';

interface Props {
  groups: SkillGroup[];
  active: string | null;
  onSelect: (id: string | null) => void;
}

function Cluster({ groups, index, total, active, onSelect }: { groups: SkillGroup[]; index: number; total: number; active: string | null; onSelect: (id: string | null) => void }) {
  const g = groups[index];
  const ref = useRef<THREE.Group>(null!);
  const angle = (index / total) * Math.PI * 2;
  const pos = useMemo(() => new THREE.Vector3(Math.cos(angle) * 3.4, Math.sin(index * 1.3) * 0.9, Math.sin(angle) * 3.4), [angle, index]);
  const isActive = active === g.id;
  const dim = active !== null && !isActive;

  useFrame((_, dt) => {
    const target = isActive ? 1.35 : 1;
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, target, 5, dt));
  });

  return (
    <>
      <Line points={[[0, 0, 0], pos.toArray() as [number, number, number]]} color={g.color} transparent opacity={dim ? 0.08 : 0.4} lineWidth={1} />
      <Float speed={1.4 + index * 0.15} floatIntensity={0.8}>
        <group ref={ref} position={pos}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect(isActive ? null : g.id);
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <dodecahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color={g.color} metalness={0.85} roughness={0.2} emissive={g.color} emissiveIntensity={dim ? 0.05 : 0.45} transparent opacity={dim ? 0.35 : 1} />
          </mesh>
          <Html position={[0, -0.95, 0]} center style={{ pointerEvents: 'none' }}>
            <span className="whitespace-nowrap font-display text-sm font-medium" style={{ color: '#e8eaf6', opacity: dim ? 0.35 : 1 }}>{g.name}</span>
          </Html>
          {isActive &&
            g.items.map((it, i) => {
              const a = (i / g.items.length) * Math.PI * 2;
              return (
                <Html key={it} position={[Math.cos(a) * 1.25, 0.9 + Math.sin(a) * 0.5, 0]} center style={{ pointerEvents: 'none' }}>
                  <span className="whitespace-nowrap font-mono text-xs" style={{ color: g.color }}>{it}</span>
                </Html>
              );
            })}
        </group>
      </Float>
    </>
  );
}

function Hub() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    ref.current.rotation.y = s.clock.elapsedTime * 0.4;
    ref.current.rotation.x = s.clock.elapsedTime * 0.25;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.8, 1]} />
      <meshStandardMaterial color="#05060d" metalness={1} roughness={0.15} wireframe />
    </mesh>
  );
}

export default function SkillsScene({ groups, active, onSelect }: Props) {
  return (
    <SafeCanvas label="Interactive 3D technology ecosystem. Use the category buttons for the same information as text." fallback={<FallbackVisual label="Technology ecosystem" />} camera={{ position: [0, 1.5, 9], fov: 45 }} onPointerMissed={() => onSelect(null)}>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 6]} intensity={80} color="#ffffff" />
      <pointLight position={[-6, -2, -4]} intensity={50} color="#8b5cf6" />
      <Hub />
      {groups.map((g, i) => (
        <Cluster key={g.id} groups={groups} index={i} total={groups.length} active={active} onSelect={onSelect} />
      ))}
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} minPolarAngle={Math.PI / 3} maxPolarAngle={(Math.PI * 2) / 3} />
    </SafeCanvas>
  );
}
