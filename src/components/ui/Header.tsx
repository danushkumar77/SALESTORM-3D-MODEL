import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Activity, 
  Zap, 
  Maximize2 
} from 'lucide-react';
import type { TrafficMode } from '../../types/simulation';

interface HeaderProps {
  isRunning: boolean;
  simSpeed: number;
  trafficMode: TrafficMode;
  elapsedSec: number;
  timeWindowSec: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetSpeed: (speed: number) => void;
  onSetTrafficMode: (mode: TrafficMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  simSpeed,
  trafficMode,
  elapsedSec,
  timeWindowSec,
  onStart,
  onPause,
  onReset,
  onSetSpeed,
  onSetTrafficMode,
  isMuted,
  onToggleMute,
}) => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const progressPercent = Math.min(100, (elapsedSec / timeWindowSec) * 100);
  const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
  const secs = (elapsedSec % 60).toFixed(1).padStart(4, '0');

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex flex-col bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 shadow-2xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                FlashFlow 3D
                <span className="text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded px-1.5 py-0.2">
                  v2.6 ARCHITECTURE SIM
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Concurrent Purchase Traffic Simulator &bull; SALESTORM 2026
            </p>
          </div>
        </div>

        {/* Traffic Arrival Window Progress */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              1-Minute Traffic Window
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              {mins}:{secs} <span className="text-slate-500">/ 01:00.0</span>
            </div>
          </div>
          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Traffic Rate Modes */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 p-1 rounded-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" /> Mode:
          </span>
          {(['NORMAL', 'HIGH', 'FLASH_SALE', 'EXTREME'] as TrafficMode[]).map((mode) => {
            const labels: Record<TrafficMode, string> = {
              NORMAL: 'Normal (100/m)',
              HIGH: 'High (1K/m)',
              FLASH_SALE: 'Flash Sale (10K/m)',
              EXTREME: 'Extreme (50K/m)',
            };
            const active = trafficMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onSetTrafficMode(mode)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-all ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>

        {/* Playback Controls & Speed Multipliers */}
        <div className="flex items-center gap-2">
          {/* Speed Buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[0.5, 1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all ${
                  simSpeed === s
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Start / Pause */}
          {isRunning ? (
            <button
              onClick={onPause}
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start
            </button>
          )}

          {/* Reset */}
          <button
            onClick={onReset}
            title="Reset Simulation"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullScreen}
            title="Toggle Fullscreen"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
