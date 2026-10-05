import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TOPOLOGY_POINTS } from '../../engine/SimulationEngine';

interface TopologyMeshNodesProps {
  availableStock: number;
  totalStock: number;
  orderServiceOnline: boolean;
  orderServiceDownTimer: number;
  queueDepth: number;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export const TopologyMeshNodes: React.FC<TopologyMeshNodesProps> = ({
  availableStock,
  totalStock,
  orderServiceOnline,
  queueDepth,
  onSelectNode
}) => {
  const engineRef = useRef<THREE.Group>(null);
  const cacheRef = useRef<THREE.Group>(null);
  const queueTokenRef = useRef<THREE.Group>(null);
  const radarRef = useRef<THREE.Mesh>(null);
  const stockRatio = totalStock > 0 ? availableStock / totalStock : 0;

  useFrame((_, delta) => {
    if (engineRef.current) {
      engineRef.current.rotation.y += delta * 0.8;
    }
    if (cacheRef.current) {
      cacheRef.current.rotation.y -= delta * 0.5;
    }
    if (queueTokenRef.current) {
      queueTokenRef.current.rotation.y += delta * 1.2;
    }
    if (radarRef.current) {
      radarRef.current.rotation.z += delta * 2.0;
    }
  });

  return (
    <group>
      {/* 1. TRAFFIC ARRIVAL ZONE PLATFORM */}
      <group position={TOPOLOGY_POINTS.TRAFFIC_ARRIVAL} onClick={() => onSelectNode('TRAFFIC_ARRIVAL')}>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[34, 0.4, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[33.6, 0.05, 9.6]} />
          <meshBasicMaterial color="#00f0ff" wireframe opacity={0.3} transparent />
        </mesh>
        {/* Entry Laser Guide Rails */}
        {[-14, -7, 0, 7, 14].map((x, idx) => (
          <mesh key={idx} position={[x, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 9]} />
            <meshBasicMaterial color="#00f0ff" opacity={0.5} transparent />
          </mesh>
        ))}
      </group>

      {/* 2. API GATEWAY (Hexagonal Cyber Ingress Portal) */}
      <group position={TOPOLOGY_POINTS.GATEWAY} onClick={() => onSelectNode('API_GATEWAY')}>
        {/* Base Hub */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[4.2, 4.6, 0.8, 6]} />
          <meshStandardMaterial color="#0d1b2a" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Gateway Arch Left */}
        <mesh position={[-3.2, 2.2, 0]}>
          <boxGeometry args={[0.8, 5.2, 1.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Gateway Arch Right */}
        <mesh position={[3.2, 2.2, 0]}>
          <boxGeometry args={[0.8, 5.2, 1.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Gateway Arch Top */}
        <mesh position={[0, 4.8, 0]}>
          <boxGeometry args={[7.2, 0.8, 1.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glowing Portal Shield */}
        <mesh position={[0, 2.2, 0]}>
          <planeGeometry args={[5.6, 4.4]} />
          <meshBasicMaterial 
            color="#00f0ff" 
            opacity={0.25} 
            transparent 
            side={THREE.DoubleSide} 
          />
        </mesh>
        {/* Perimeter Neon Ring */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.8, 4.0, 32]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </group>

      {/* 3. FLASH SALE ENGINE (Octagonal Decision Core) */}
      <group position={TOPOLOGY_POINTS.ENGINE} onClick={() => onSelectNode('FLASH_ENGINE')}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[3.4, 3.8, 0.8, 8]} />
          <meshStandardMaterial color="#181829" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Rotating Validator Core */}
        <group ref={engineRef} position={[0, 1.8, 0]}>
          <mesh>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial 
              color="#a855f7" 
              emissive="#7e22ce" 
              emissiveIntensity={0.6} 
              wireframe 
            />
          </mesh>
          <mesh>
            <octahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={0.8} />
          </mesh>
        </group>
        {/* Orbiting Guard Rings */}
        <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.4, 0.06, 16, 64]} />
          <meshBasicMaterial color="#c084fc" opacity={0.6} transparent />
        </mesh>
      </group>

      {/* 4. INVENTORY SERVICE & STOCK VAULT (Atomic Zero-Oversell Safe) */}
      <group position={TOPOLOGY_POINTS.INVENTORY} onClick={() => onSelectNode('INVENTORY_VAULT')}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[7.2, 0.8, 6.2]} />
          <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Dynamic Stock Indicator Tower */}
        <mesh position={[0, Math.max(0.2, stockRatio * 2.5), 0]}>
          <cylinderGeometry args={[1.8, 2.0, Math.max(0.4, stockRatio * 5.0), 32]} />
          <meshStandardMaterial 
            color={stockRatio > 0.3 ? '#10b981' : stockRatio > 0 ? '#f59e0b' : '#ef4444'} 
            emissive={stockRatio > 0.3 ? '#059669' : stockRatio > 0 ? '#d97706' : '#b91c1c'}
            emissiveIntensity={0.7}
            roughness={0.2}
            metalness={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Glass Containment Pillar */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 5.0, 32]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transmission={0.9} 
            opacity={0.3} 
            transparent 
            roughness={0.1} 
            metalness={0.1}
          />
        </mesh>
        {/* Out of Stock Safety Wall Barrier */}
        {stockRatio === 0 && (
          <mesh position={[0, 2.5, 3.2]}>
            <planeGeometry args={[6.8, 4.8]} />
            <meshBasicMaterial color="#ef4444" opacity={0.35} transparent side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* 5. PAYMENT SERVICE (Dual Processor Gateway) */}
      <group position={TOPOLOGY_POINTS.PAYMENT} onClick={() => onSelectNode('PAYMENT_SERVICE')}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[6.4, 0.8, 5.2]} />
          <meshStandardMaterial color="#1e1b2e" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Payment Node A */}
        <mesh position={[-1.8, 1.6, 0]}>
          <boxGeometry args={[1.6, 3.2, 1.8]} />
          <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.4} metalness={0.6} />
        </mesh>
        {/* Payment Node B */}
        <mesh position={[1.8, 1.6, 0]}>
          <boxGeometry args={[1.6, 3.2, 1.8]} />
          <meshStandardMaterial color="#f43f5e" emissive="#be123c" emissiveIntensity={0.4} metalness={0.6} />
        </mesh>
        {/* Central Synchronizer Bridge */}
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[2.0, 0.4, 1.0]} />
          <meshBasicMaterial color="#fb7185" />
        </mesh>
      </group>

      {/* 6. MESSAGE QUEUE (Kafka Topic Buffer) */}
      <group position={TOPOLOGY_POINTS.QUEUE} onClick={() => onSelectNode('MESSAGE_QUEUE')}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[8.4, 0.8, 5.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Kafka Partition Tubes */}
        {[-2.4, 0, 2.4].map((x, idx) => (
          <mesh key={idx} position={[x, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 4.4, 24]} />
            <meshStandardMaterial 
              color="#1e3a8a" 
              emissive="#1d4ed8" 
              emissiveIntensity={0.4} 
              wireframe 
            />
          </mesh>
        ))}
        {/* Visualized Kafka Message Buffer Tokens */}
        <group ref={queueTokenRef} position={[0, 1.5, 0]}>
          {Array.from({ length: Math.min(queueDepth, 16) }).map((_, idx) => (
            <mesh key={idx} position={[(idx % 4 - 1.5) * 1.4, (Math.floor(idx / 4) * 0.7) - 0.5, (idx % 2 - 0.5) * 1.5]}>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshBasicMaterial color="#60a5fa" />
            </mesh>
          ))}
        </group>
      </group>

      {/* 7. ORDER SERVICE & SETTLEMENT HUB */}
      <group position={TOPOLOGY_POINTS.ORDER} onClick={() => onSelectNode('ORDER_SERVICE')}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[4.4, 4.8, 0.8, 32]} />
          <meshStandardMaterial 
            color={orderServiceOnline ? '#064e3b' : '#7f1d1d'} 
            metalness={0.8} 
            roughness={0.3} 
          />
        </mesh>
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[2.6, 2.6, 3.6, 8]} />
          <meshStandardMaterial 
            color={orderServiceOnline ? '#10b981' : '#ef4444'} 
            emissive={orderServiceOnline ? '#047857' : '#991b1b'} 
            emissiveIntensity={0.5} 
            metalness={0.7} 
          />
        </mesh>
        {/* Hologram beacon ring */}
        <mesh position={[0, 3.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.0, 32]} />
          <meshBasicMaterial color={orderServiceOnline ? '#34d399' : '#f87171'} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 8. SUPPORTING NODE: REDIS DISTRIBUTED CACHE */}
      <group ref={cacheRef} position={TOPOLOGY_POINTS.CACHE} onClick={() => onSelectNode('CACHE')}>
        <mesh position={[0, 1.2, 0]}>
          <dodecahedronGeometry args={[1.6, 0]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            emissive="#6d28d9" 
            emissiveIntensity={0.7} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[2.0, 2.2, 0.6, 16]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 9. SUPPORTING NODE: POSTGRESQL DURABLE DB */}
      <group position={TOPOLOGY_POINTS.DATABASE} onClick={() => onSelectNode('DATABASE')}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[2.0, 2.0, 0.8, 24]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[2.0, 2.0, 0.8, 24]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <cylinderGeometry args={[2.0, 2.0, 0.8, 24]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[2.4, 2.6, 0.6, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 10. SUPPORTING NODE: APM OBSERVABILITY & TELEMETRY */}
      <group position={TOPOLOGY_POINTS.OBSERVABILITY} onClick={() => onSelectNode('OBSERVABILITY')}>
        <mesh position={[0, 2.0, 0]}>
          <coneGeometry args={[1.2, 4.0, 4]} />
          <meshStandardMaterial color="#eab308" emissive="#a16207" emissiveIntensity={0.5} metalness={0.8} />
        </mesh>
        <mesh ref={radarRef} position={[0, 4.2, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 16]} />
          <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* TERMINAL REJECT RECEIVERS */}
      {/* Rate Limited Reject Bin */}
      <mesh position={TOPOLOGY_POINTS.GATEWAY_REJECT}>
        <cylinderGeometry args={[1.8, 2.0, 0.4, 16]} />
        <meshStandardMaterial color="#450a0a" emissive="#7f1d1d" emissiveIntensity={0.4} />
      </mesh>
      {/* Out Of Stock Reject Bin */}
      <mesh position={TOPOLOGY_POINTS.INVENTORY_REJECT}>
        <cylinderGeometry args={[1.8, 2.0, 0.4, 16]} />
        <meshStandardMaterial color="#450a0a" emissive="#7f1d1d" emissiveIntensity={0.4} />
      </mesh>
      {/* Payment Failed Reject Bin */}
      <mesh position={TOPOLOGY_POINTS.PAYMENT_REJECT}>
        <cylinderGeometry args={[1.8, 2.0, 0.4, 16]} />
        <meshStandardMaterial color="#450a0a" emissive="#7f1d1d" emissiveIntensity={0.4} />
      </mesh>
      {/* Duplicate Replay Reject Bin */}
      <mesh position={TOPOLOGY_POINTS.ENGINE_DUPLICATE_REJECT}>
        <cylinderGeometry args={[1.8, 2.0, 0.4, 16]} />
        <meshStandardMaterial color="#3b0764" emissive="#581c87" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};
