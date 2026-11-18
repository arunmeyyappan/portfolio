import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, Lightformer, Sparkles, RoundedBox, Torus } from '@react-three/drei';
import * as THREE from 'three';
import SafeCanvas from '../common/WebGLBoundary';
import FallbackVisual from '../common/FallbackVisual';
import { useMouseParallax } from '../../hooks/useMouseParallax';
/** Custom futuristic object: a metallic faceted core inside gyroscopic rings, with orbiting tech tiles. */
function Core() {
    const group = useRef(null);
    const ringA = useRef(null);
    const ringB = useRef(null);
    const ringC = useRef(null);
    const mouse = useMouseParallax();
    useFrame((state, dt) => {
        const t = state.clock.elapsedTime;
        group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, mouse.current.x * 0.6 + t * 0.12, 3, dt);
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -mouse.current.y * 0.4, 3, dt);
        ringA.current.rotation.x = t * 0.5;
        ringB.current.rotation.y = t * 0.4;
        ringB.current.rotation.z = t * 0.2;
        ringC.current.rotation.z = -t * 0.35;
        ringC.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.4) * 0.2;
    });
    return (<group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.05, 1]}/>
        <meshStandardMaterial color="#4a55b8" metalness={0.85} roughness={0.28} flatShading envMapIntensity={1.6}/>
      </mesh>
      <mesh scale={0.62}>
        <octahedronGeometry args={[1, 0]}/>
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.6} toneMapped={false}/>
      </mesh>
      <Torus ref={ringA} args={[1.7, 0.025, 16, 128]}>
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.2} metalness={0.8} roughness={0.2}/>
      </Torus>
      <Torus ref={ringB} args={[2.05, 0.02, 16, 128]}>
        <meshStandardMaterial color="#e8eaf6" metalness={1} roughness={0.15}/>
      </Torus>
      <Torus ref={ringC} args={[2.4, 0.02, 16, 128]}>
        <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0.8} metalness={0.7} roughness={0.25}/>
      </Torus>
      <OrbitTiles />
    </group>);
}
function OrbitTiles() {
    const ref = useRef(null);
    const tiles = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
        angle: (i / 6) * Math.PI * 2,
        r: 2.9 + (i % 2) * 0.35,
        y: Math.sin(i * 1.7) * 0.9,
        color: ['#8b5cf6', '#22d3ee', '#fb923c'][i % 3],
    })), []);
    useFrame((s) => {
        ref.current.rotation.y = s.clock.elapsedTime * 0.18;
    });
    return (<group ref={ref}>
      {tiles.map((t, i) => (<Float key={i} speed={1.5 + i * 0.2} floatIntensity={0.6} rotationIntensity={0.8}>
          <RoundedBox args={[0.42, 0.42, 0.1]} radius={0.06} position={[Math.cos(t.angle) * t.r, t.y, Math.sin(t.angle) * t.r]}>
            <meshStandardMaterial color={t.color} metalness={0.9} roughness={0.22} emissive={t.color} emissiveIntensity={0.25}/>
          </RoundedBox>
        </Float>))}
    </group>);
}
/** Scales its children so the whole object always fits the canvas, whatever shape the column is. */
function FitToView({ children }) {
    const { viewport } = useThree();
    const s = Math.min(1.3, Math.min(viewport.width, viewport.height) / 6.2);
    return <group scale={s}>{children}</group>;
}
export default function HeroScene() {
    return (<SafeCanvas label="Interactive 3D futuristic core object" fallback={<FallbackVisual label="Futuristic digital object"/>} camera={{ position: [0, 0, 7.2], fov: 42 }}>
      <ambientLight intensity={0.35}/>
      <pointLight position={[5, 4, 5]} intensity={60} color="#a78bfa"/>
      <pointLight position={[-5, -3, 3]} intensity={40} color="#22d3ee"/>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, -6]} scale={[14, 4, 1]}/>
        <Lightformer form="rect" intensity={1.6} color="#a78bfa" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]}/>
        <Lightformer form="rect" intensity={1.6} color="#22d3ee" position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]}/>
        <Lightformer form="ring" intensity={1.2} color="#fb923c" position={[0, -4, 3]} scale={5}/>
      </Environment>
      <FitToView>
        <Float speed={1.2} floatIntensity={0.5} rotationIntensity={0.2}>
          <Core />
        </Float>
      </FitToView>
      <Sparkles count={70} scale={[11, 7, 6]} size={2.4} speed={0.35} color="#a78bfa" opacity={0.7}/>
    </SafeCanvas>);
}
