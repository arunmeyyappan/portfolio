import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls, RoundedBox, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import SafeCanvas from '../common/WebGLBoundary';
import FallbackVisual from '../common/FallbackVisual';
function Device() {
    const led = useRef(null);
    const wave = useRef(null);
    useFrame((s) => {
        const t = s.clock.elapsedTime;
        led.current.emissiveIntensity = 0.6 + Math.sin(t * 5) * 0.6;
        wave.current.children.forEach((c, i) => {
            const k = (t * 0.6 + i * 0.33) % 1;
            c.scale.setScalar(0.4 + k * 1.8);
            c.material.opacity = (1 - k) * 0.5;
        });
    });
    return (<group rotation={[0.5, 0.5, 0]}>
      {/* enclosure */}
      <RoundedBox args={[2.6, 0.36, 1.7]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color="#10142e" metalness={0.85} roughness={0.28}/>
      </RoundedBox>
      {/* PCB */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.3, 0.04, 1.4]}/>
        <meshStandardMaterial color="#0f4c3a" metalness={0.4} roughness={0.5}/>
      </mesh>
      {/* ESP32 */}
      <mesh position={[-0.55, 0.28, 0]}>
        <boxGeometry args={[0.7, 0.1, 0.45]}/>
        <meshStandardMaterial color="#9aa3c7" metalness={1} roughness={0.2}/>
      </mesh>
      {/* GPS */}
      <mesh position={[0.65, 0.3, -0.35]}>
        <boxGeometry args={[0.5, 0.14, 0.5]}/>
        <meshStandardMaterial color="#22d3ee" metalness={0.6} roughness={0.3}/>
      </mesh>
      {/* IMU */}
      <mesh position={[0.2, 0.26, 0.45]}>
        <boxGeometry args={[0.3, 0.07, 0.3]}/>
        <meshStandardMaterial color="#8b5cf6" metalness={0.6} roughness={0.3}/>
      </mesh>
      {/* LoRa module */}
      <mesh position={[0.75, 0.27, 0.4]}>
        <boxGeometry args={[0.45, 0.08, 0.35]}/>
        <meshStandardMaterial color="#fb923c" metalness={0.6} roughness={0.3}/>
      </mesh>
      {/* antenna */}
      <mesh position={[1.05, 0.7, 0.4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 8]}/>
        <meshStandardMaterial color="#e8eaf6" metalness={1} roughness={0.2}/>
      </mesh>
      {/* buzzer + LED */}
      <mesh position={[-1.0, 0.3, 0.5]}>
        <cylinderGeometry args={[0.14, 0.14, 0.16, 24]}/>
        <meshStandardMaterial color="#05060d" metalness={0.4} roughness={0.5}/>
      </mesh>
      <mesh position={[-1.0, 0.3, -0.5]}>
        <sphereGeometry args={[0.07, 16, 16]}/>
        <meshStandardMaterial ref={led} color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={1} toneMapped={false}/>
      </mesh>
      {/* LoRa signal rings */}
      <group ref={wave} position={[1.05, 1.15, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        {[0, 1, 2].map((i) => (<mesh key={i}>
            <ringGeometry args={[0.45, 0.5, 48]}/>
            <meshBasicMaterial color="#fb923c" transparent opacity={0.4} side={THREE.DoubleSide}/>
          </mesh>))}
      </group>
    </group>);
}
export default function AradDevice3D() {
    return (<SafeCanvas label="3D visualization of the ARAD prototype: ESP32, GPS, motion sensor, LoRa module, buzzer and LED on one board" fallback={<FallbackVisual label="ARAD prototype device"/>} camera={{ position: [0, 2.2, 5.2], fov: 40 }}>
      <ambientLight intensity={0.5}/>
      <pointLight position={[4, 5, 4]} intensity={60}/>
      <pointLight position={[-4, 2, -3]} intensity={35} color="#8b5cf6"/>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, -6]} scale={[14, 4, 1]}/>
        <Lightformer form="rect" intensity={1.6} color="#a78bfa" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]}/>
        <Lightformer form="rect" intensity={1.6} color="#22d3ee" position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]}/>
        <Lightformer form="ring" intensity={1.2} color="#fb923c" position={[0, -4, 3]} scale={5}/>
      </Environment>
      <Float speed={1.2} floatIntensity={0.4} rotationIntensity={0.15}>
        <Device />
      </Float>
      <OrbitControls enableZoom={false} enablePan={false}/>
    </SafeCanvas>);
}
