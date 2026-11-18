import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Float, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import SafeCanvas from '../common/WebGLBoundary';
import FallbackVisual from '../common/FallbackVisual';
import { useMouseParallax } from '../../hooks/useMouseParallax';

/** Abstract metallic "E" monogram built from beams. Placeholder branding: swap for the real logo mesh when available. */
function Monogram() {
  const g = useRef<THREE.Group>(null!);
  const mouse = useMouseParallax();
  useFrame((s, dt) => {
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, mouse.current.x * 0.7 + Math.sin(s.clock.elapsedTime * 0.5) * 0.25, 3, dt);
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, -mouse.current.y * 0.35, 3, dt);
  });
  const beam = (pos: [number, number, number], size: [number, number, number], color: string, glow = 0) => (
    <RoundedBox args={size} radius={0.07} smoothness={4} position={pos}>
      <meshStandardMaterial color={color} metalness={0.95} roughness={0.18} emissive={color} emissiveIntensity={glow} />
    </RoundedBox>
  );
  return (
    <group ref={g}>
      {beam([-0.9, 0, 0], [0.5, 3.1, 0.5], '#c9cfee')}
      {beam([0.05, 1.3, 0], [1.9, 0.5, 0.5], '#8b5cf6', 0.3)}
      {beam([-0.05, 0, 0], [1.6, 0.5, 0.5], '#22d3ee', 0.5)}
      {beam([0.05, -1.3, 0], [1.9, 0.5, 0.5], '#fb923c', 0.3)}
    </group>
  );
}

export default function EvoBrand3D() {
  const offsetX = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 2.7 : 0;
  return (
    <SafeCanvas label="Animated 3D EVO Codes monogram" fallback={<FallbackVisual label="EVO Codes brand" />} camera={{ position: [0, 0, 6.5], fov: 40 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 5]} intensity={55} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={35} color="#8b5cf6" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, -6]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#a78bfa" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#22d3ee" position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#fb923c" position={[0, -4, 3]} scale={5} />
      </Environment>
      <group position={[offsetX, 0, 0]}>
        <Float speed={1.3} floatIntensity={0.5} rotationIntensity={0.15}>
          <Monogram />
        </Float>
      </group>
      <Sparkles count={40} scale={[7, 5, 4]} size={2} speed={0.3} color="#22d3ee" />
    </SafeCanvas>
  );
}
