import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PurchaseRequest } from '../../types/simulation';

interface RequestPacketsRendererProps {
  requests: PurchaseRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
}

export const RequestPacketsRenderer: React.FC<RequestPacketsRendererProps> = ({
  requests,
  selectedRequestId,
  onSelectRequest,
}) => {
  const beaconRef = useRef<THREE.Mesh>(null);
  const selectedReq = requests.find((r) => r.id === selectedRequestId);

  useFrame((_, delta) => {
    if (beaconRef.current) {
      beaconRef.current.rotation.z += delta * 3;
      const scale = 1 + Math.sin(performance.now() * 0.006) * 0.25;
      beaconRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {requests.map((req) => {
        const isSelected = req.id === selectedRequestId;
        const isRaceOrHighlight = req.isSpecialHighlighted;
        const baseRadius = isSelected ? 0.45 : isRaceOrHighlight ? 0.38 : 0.22;

        return (
          <group
            key={req.id}
            position={req.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectRequest(req.id);
            }}
          >
            {/* Core Packet Sphere */}
            <mesh>
              <sphereGeometry args={[baseRadius, 16, 16]} />
              <meshStandardMaterial
                color={req.statusColor}
                emissive={req.statusColor}
                emissiveIntensity={isSelected ? 1.5 : 0.9}
                roughness={0.1}
                metalness={0.5}
              />
            </mesh>

            {/* Glowing Aura for Selected / Special Packets */}
            {(isSelected || isRaceOrHighlight) && (
              <mesh>
                <sphereGeometry args={[baseRadius * 1.6, 16, 16]} />
                <meshBasicMaterial
                  color={req.statusColor}
                  transparent
                  opacity={0.35}
                />
              </mesh>
            )}

            {/* Tail Streak */}
            <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[baseRadius * 0.6, 0.02, 0.8, 8]} />
              <meshBasicMaterial
                color={req.statusColor}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        );
      })}

      {/* Selected Request Target Beacon Tracker */}
      {selectedReq && (
        <group position={selectedReq.position}>
          <mesh ref={beaconRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.85, 32]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
        </group>
      )}
    </group>
  );
};
