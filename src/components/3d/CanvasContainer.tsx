import React from 'react';
import { Canvas } from '@react-three/fiber';
import { TopologyMeshNodes } from './TopologyMeshNodes';
import { ConduitNetwork } from './ConduitNetwork';
import { RequestPacketsRenderer } from './RequestPacketsRenderer';
import { Node3DLabels } from './Node3DLabels';
import { CameraController } from './CameraController';
import type { CameraViewPreset, PurchaseRequest, SimulationMetrics } from '../../types/simulation';

interface CanvasContainerProps {
  metrics: SimulationMetrics;
  requests: PurchaseRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
  orderServiceOnline: boolean;
  orderServiceDownTimer: number;
  cameraPreset: CameraViewPreset;
  isTrackingRequest: boolean;
  onSelectNode: (nodeId: string) => void;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  metrics,
  requests,
  selectedRequestId,
  onSelectRequest,
  orderServiceOnline,
  orderServiceDownTimer,
  cameraPreset,
  isTrackingRequest,
  onSelectNode,
}) => {
  const selectedReq = requests.find((r) => r.id === selectedRequestId);

  return (
    <div className="relative w-full h-full bg-[#08090f] overflow-hidden">
      <Canvas
        camera={{ position: [0, 42, 60], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#08090f']} />
        <fog attach="fog" args={['#08090f', 50, 150]} />

        {/* Lighting setup for deep tech enterprise aesthetic */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[20, 40, 30]} intensity={1.2} color="#f8fafc" />
        <directionalLight position={[-20, 20, -30]} intensity={0.6} color="#38bdf8" />
        <pointLight position={[0, 10, 18]} intensity={1.5} distance={25} color="#00f0ff" />
        <pointLight position={[0, 8, -6]} intensity={1.8} distance={22} color={metrics.availableStock > 0 ? '#10b981' : '#ef4444'} />
        <pointLight position={[0, 8, -30]} intensity={1.4} distance={22} color="#3b82f6" />
        <pointLight position={[0, 8, -42]} intensity={1.6} distance={22} color="#34d399" />

        {/* Subtle Cyber Floor Grid */}
        <gridHelper 
          args={[140, 70, '#1e293b', '#0f172a']} 
          position={[0, -0.6, 0]} 
        />

        {/* 3D System Topology Nodes */}
        <TopologyMeshNodes
          availableStock={metrics.availableStock}
          totalStock={metrics.totalStock}
          orderServiceOnline={orderServiceOnline}
          orderServiceDownTimer={orderServiceDownTimer}
          queueDepth={metrics.queueDepth}
          selectedNodeId={null}
          onSelectNode={onSelectNode}
        />

        {/* Glowing Bezier Conduit Pipeline */}
        <ConduitNetwork />

        {/* Moving Purchase Request Packets */}
        <RequestPacketsRenderer
          requests={requests}
          selectedRequestId={selectedRequestId}
          onSelectRequest={onSelectRequest}
        />

        {/* Real-time 3D Holographic Labels */}
        <Node3DLabels
          metrics={metrics}
          orderServiceOnline={orderServiceOnline}
          orderServiceDownTimer={orderServiceDownTimer}
        />

        {/* Camera Lerp Controller & Follow mode */}
        <CameraController
          viewPreset={cameraPreset}
          selectedRequest={selectedReq}
          isTrackingRequest={isTrackingRequest}
        />
      </Canvas>
    </div>
  );
};
