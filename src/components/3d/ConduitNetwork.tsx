import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TOPOLOGY_POINTS } from '../../engine/SimulationEngine';

interface ConduitProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  dashed?: boolean;
  midYOffset?: number;
}

const SplineConduit: React.FC<ConduitProps> = ({ start, end, color, dashed = false, midYOffset = 0.5 }) => {
  const lineGeometry = useMemo(() => {
    const p0 = new THREE.Vector3(...start);
    const p3 = new THREE.Vector3(...end);
    const p1 = new THREE.Vector3(
      p0.x,
      Math.max(p0.y, p3.y) + midYOffset,
      p0.z + (p3.z - p0.z) * 0.35
    );
    const p2 = new THREE.Vector3(
      p3.x,
      Math.max(p0.y, p3.y) + midYOffset,
      p0.z + (p3.z - p0.z) * 0.65
    );

    const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
    const points = curve.getPoints(36);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end, midYOffset]);

  return (
    <primitive object={new THREE.Line(
      lineGeometry, 
      dashed 
        ? new THREE.LineDashedMaterial({ color, dashSize: 0.8, gapSize: 0.4, transparent: true, opacity: 0.4 })
        : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7, linewidth: 2 })
    )} />
  );
};

export const ConduitNetwork: React.FC = () => {
  return (
    <group>
      {/* Primary Pipeline Conduits */}
      {/* Ingress -> Gateway Lanes */}
      {[-12, -6, 0, 6, 12].map((x, idx) => (
        <SplineConduit 
          key={`lane-${idx}`} 
          start={[x, 3.5, 38]} 
          end={[x * 0.2, 0.5, 18]} 
          color="#00f0ff" 
        />
      ))}

      {/* Gateway -> Flash Engine */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.GATEWAY} 
        end={TOPOLOGY_POINTS.ENGINE} 
        color="#38bdf8" 
      />

      {/* Engine -> Inventory */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.ENGINE} 
        end={TOPOLOGY_POINTS.INVENTORY} 
        color="#c084fc" 
      />

      {/* Inventory -> Payment */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.INVENTORY} 
        end={TOPOLOGY_POINTS.PAYMENT} 
        color="#facc15" 
      />

      {/* Payment -> Message Queue */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.PAYMENT} 
        end={TOPOLOGY_POINTS.QUEUE} 
        color="#34d399" 
      />

      {/* Message Queue -> Order Service */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.QUEUE} 
        end={TOPOLOGY_POINTS.ORDER} 
        color="#3b82f6" 
      />

      {/* Rejection Branches */}
      {/* Rate Limited (Gateway -> Reject) */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.GATEWAY} 
        end={TOPOLOGY_POINTS.GATEWAY_REJECT} 
        color="#ef4444" 
      />

      {/* Duplicate Replay (Engine -> Reject) */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.ENGINE} 
        end={TOPOLOGY_POINTS.ENGINE_DUPLICATE_REJECT} 
        color="#a855f7" 
      />

      {/* Out of Stock (Inventory -> Reject) */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.INVENTORY} 
        end={TOPOLOGY_POINTS.INVENTORY_REJECT} 
        color="#ef4444" 
      />

      {/* Payment Declined (Payment -> Reject) */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.PAYMENT} 
        end={TOPOLOGY_POINTS.PAYMENT_REJECT} 
        color="#e11d48" 
      />

      {/* Stock Rollback Curve (Payment -> Inventory return path) */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.PAYMENT_REJECT} 
        end={TOPOLOGY_POINTS.INVENTORY} 
        color="#f59e0b" 
        dashed={true}
        midYOffset={2.5}
      />

      {/* Supporting Cache Links */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.CACHE} 
        end={TOPOLOGY_POINTS.GATEWAY} 
        color="#8b5cf6" 
        dashed={true} 
      />
      <SplineConduit 
        start={TOPOLOGY_POINTS.CACHE} 
        end={TOPOLOGY_POINTS.ENGINE} 
        color="#8b5cf6" 
        dashed={true} 
      />
      <SplineConduit 
        start={TOPOLOGY_POINTS.CACHE} 
        end={TOPOLOGY_POINTS.INVENTORY} 
        color="#8b5cf6" 
        dashed={true} 
      />

      {/* Supporting Database Sync Links */}
      <SplineConduit 
        start={TOPOLOGY_POINTS.DATABASE} 
        end={TOPOLOGY_POINTS.PAYMENT} 
        color="#0284c7" 
        dashed={true} 
      />
      <SplineConduit 
        start={TOPOLOGY_POINTS.DATABASE} 
        end={TOPOLOGY_POINTS.ORDER} 
        color="#0284c7" 
        dashed={true} 
      />
    </group>
  );
};
