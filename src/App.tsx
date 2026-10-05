import React, { useState, useEffect, useRef } from 'react';
import { simulationEngine } from './engine/SimulationEngine';
import { soundFx } from './engine/AudioSynthesizer';
import { CanvasContainer } from './components/3d/CanvasContainer';
import { Header } from './components/ui/Header';
import { MetricsHUD } from './components/ui/MetricsHUD';
import { ScenarioController } from './components/ui/ScenarioController';
import { RequestInspectorModal } from './components/ui/RequestInspectorModal';
import { NodeDetailsModal } from './components/ui/NodeDetailsModal';
import { CameraControlsBar } from './components/ui/CameraControlsBar';
import { EventLogDrawer } from './components/ui/EventLogDrawer';
import { LockScreen } from './components/ui/LockScreen';
import type { 
  CameraViewPreset, 
  ScenarioPreset, 
  TrafficMode 
} from './types/simulation';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('salestorm_auth') === 'granted' ||
           localStorage.getItem('salestorm_auth') === 'granted';
  });
  const [, setTick] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('OVERVIEW');
  const [isTrackingRequest, setIsTrackingRequest] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Animation frame loop
  const lastTimeRef = useRef<number>(0);
  useEffect(() => {
    if (!isAuthenticated) return;
    lastTimeRef.current = performance.now();
    let animId: number;

    const loop = (currentTime: number) => {
      const deltaMs = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Update simulation engine
      simulationEngine.update(deltaMs);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAuthenticated]);

  // Listen to engine state updates
  useEffect(() => {
    const unsub = simulationEngine.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const handleStart = () => simulationEngine.start();
  const handlePause = () => simulationEngine.pause();
  const handleReset = () => simulationEngine.resetSimulation();
  const handleSetSpeed = (speed: number) => simulationEngine.setSpeed(speed);
  const handleSetTrafficMode = (mode: TrafficMode) => simulationEngine.setTrafficMode(mode);
  
  const handleSelectScenario = (scenario: ScenarioPreset) => {
    simulationEngine.loadScenario(scenario);
    if (scenario === 'LAST_ITEM_RACE') {
      setCameraPreset('INVENTORY_VAULT');
    } else if (scenario === 'ORDER_SERVICE_OUTAGE') {
      setCameraPreset('MESSAGE_QUEUE');
    } else if (scenario === 'PAYMENT_FAILURE_ROLLBACK') {
      setCameraPreset('PAYMENT_SERVICE');
    }
  };

  const handleSelectRequest = (id: string) => {
    simulationEngine.selectRequest(id);
  };

  const handleToggleTracking = () => {
    setIsTrackingRequest((prev) => !prev);
  };

  const handleToggleMute = () => {
    soundFx.isMuted = !soundFx.isMuted;
    setIsMuted(soundFx.isMuted);
  };

  const handleSelectPreset = (preset: CameraViewPreset) => {
    setCameraPreset(preset);
    setIsTrackingRequest(false);
  };

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleLock = () => {
    sessionStorage.removeItem('salestorm_auth');
    localStorage.removeItem('salestorm_auth');
    setIsAuthenticated(false);
  };

  const selectedRequest = simulationEngine.requests.find(
    (r) => r.id === simulationEngine.selectedRequestId
  ) || null;

  if (!isAuthenticated) {
    return <LockScreen onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#08090f] select-none font-sans">

      {/* 1. Header Toolbar */}
      <Header
        isRunning={simulationEngine.isRunning}
        simSpeed={simulationEngine.simSpeed}
        trafficMode={simulationEngine.trafficMode}
        elapsedSec={simulationEngine.simTimeSec}
        timeWindowSec={simulationEngine.timeWindowSec}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onSetSpeed={handleSetSpeed}
        onSetTrafficMode={handleSetTrafficMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onLock={handleLock}
      />

      {/* 2. Real-time Telemetry Metrics HUD */}
      <MetricsHUD metrics={simulationEngine.metrics} />

      {/* 3. 3D WebGL Visualization Canvas */}
      <CanvasContainer
        metrics={simulationEngine.metrics}
        requests={simulationEngine.requests}
        selectedRequestId={simulationEngine.selectedRequestId}
        onSelectRequest={handleSelectRequest}
        orderServiceOnline={simulationEngine.orderServiceOnline}
        orderServiceDownTimer={simulationEngine.orderServiceDownTimer}
        cameraPreset={cameraPreset}
        isTrackingRequest={isTrackingRequest}
        onSelectNode={handleSelectNode}
      />

      {/* 4. Jury Scenario Presets Panel */}
      <ScenarioController
        currentScenario={simulationEngine.currentScenario}
        onSelectScenario={handleSelectScenario}
        orderServiceOnline={simulationEngine.orderServiceOnline}
        orderServiceDownTimer={simulationEngine.orderServiceDownTimer}
      />

      {/* 5. Request Packet Deep Inspection Modal */}
      <RequestInspectorModal
        request={selectedRequest}
        onClose={() => simulationEngine.selectRequest(null)}
        isTracking={isTrackingRequest}
        onToggleTracking={handleToggleTracking}
      />

      {/* 6. Topology Node Detail Modal (When 3D node is clicked) */}
      <NodeDetailsModal
        nodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
      />

      {/* 7. Camera Jump Controls Bar */}
      <CameraControlsBar
        currentPreset={cameraPreset}
        onSelectPreset={handleSelectPreset}
      />

      {/* 8. Live Real-Time Event Log Stream */}
      <EventLogDrawer events={simulationEngine.recentEvents} />
    </div>
  );
};

export default App;
