import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { CameraViewPreset, PurchaseRequest } from '../../types/simulation';
import { TOPOLOGY_POINTS } from '../../engine/SimulationEngine';

interface CameraControllerProps {
  viewPreset: CameraViewPreset;
  selectedRequest?: PurchaseRequest | null;
  isTrackingRequest: boolean;
}

const PRESET_CONFIGS: Record<CameraViewPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  OVERVIEW: {
    pos: [0, 42, 60],
    target: [0, 0, -5],
  },
  TRAFFIC_ARRIVAL: {
    pos: [0, 18, 55],
    target: [TOPOLOGY_POINTS.TRAFFIC_ARRIVAL[0], 2, TOPOLOGY_POINTS.TRAFFIC_ARRIVAL[2] - 5],
  },
  API_GATEWAY: {
    pos: [0, 10, 32],
    target: [TOPOLOGY_POINTS.GATEWAY[0], 2, TOPOLOGY_POINTS.GATEWAY[2]],
  },
  FLASH_ENGINE: {
    pos: [-10, 8, 14],
    target: [TOPOLOGY_POINTS.ENGINE[0], 1, TOPOLOGY_POINTS.ENGINE[2]],
  },
  INVENTORY_VAULT: {
    pos: [14, 10, 2],
    target: [TOPOLOGY_POINTS.INVENTORY[0], 2, TOPOLOGY_POINTS.INVENTORY[2]],
  },
  PAYMENT_SERVICE: {
    pos: [-12, 9, -10],
    target: [TOPOLOGY_POINTS.PAYMENT[0], 2, TOPOLOGY_POINTS.PAYMENT[2]],
  },
  MESSAGE_QUEUE: {
    pos: [12, 10, -22],
    target: [TOPOLOGY_POINTS.QUEUE[0], 2, TOPOLOGY_POINTS.QUEUE[2]],
  },
  ORDER_SERVICE: {
    pos: [0, 12, -28],
    target: [TOPOLOGY_POINTS.ORDER[0], 2, TOPOLOGY_POINTS.ORDER[2]],
  },
  CACHE_DB: {
    pos: [-22, 14, -10],
    target: [0, 0, -12],
  },
};

export const CameraController: React.FC<CameraControllerProps> = ({
  viewPreset,
  selectedRequest,
  isTrackingRequest,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetCamPos = useRef(new THREE.Vector3(...PRESET_CONFIGS.OVERVIEW.pos));
  const targetLookAt = useRef(new THREE.Vector3(...PRESET_CONFIGS.OVERVIEW.target));

  useEffect(() => {
    if (!isTrackingRequest && PRESET_CONFIGS[viewPreset]) {
      const config = PRESET_CONFIGS[viewPreset];
      targetCamPos.current.set(...config.pos);
      targetLookAt.current.set(...config.target);
    }
  }, [viewPreset, isTrackingRequest]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isTrackingRequest && selectedRequest) {
      // Follow the moving packet in 3D
      const p = selectedRequest.position;
      targetLookAt.current.lerp(new THREE.Vector3(p[0], p[1], p[2]), delta * 4);
      targetCamPos.current.lerp(new THREE.Vector3(p[0] + 6, p[1] + 8, p[2] + 12), delta * 4);
    }

    camera.position.lerp(targetCamPos.current, delta * 3.5);
    controlsRef.current.target.lerp(targetLookAt.current, delta * 3.5);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={6}
      maxDistance={140}
    />
  );
};
