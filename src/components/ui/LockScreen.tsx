import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  AlertTriangle,
  Zap,
  Cpu,
  Terminal
} from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'RecursionRebbel') {
      setError(false);
      setIsSuccess(true);
      if (rememberSession) {
        sessionStorage.setItem('salestorm_auth', 'granted');
        localStorage.setItem('salestorm_auth', 'granted');
      }
      setTimeout(() => {
        onUnlock();
      }, 600);
    } else {
      setError(true);
      const inputEl = document.getElementById('passcode-input');
      inputEl?.classList.add('animate-shake');
      setTimeout(() => {
        inputEl?.classList.remove('animate-shake');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070d] overflow-hidden select-none font-sans">
      {/* Dynamic Background Glow & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Background Cyber Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Ambient Hologram Ring */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/10 animate-pulse pointer-events-none" />
      <div className="absolute w-[700px] h-[700px] rounded-full border border-blue-500/5 pointer-events-none" />

      {/* Security Terminal Card */}
      <div className="relative w-full max-w-md mx-4 p-8 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl shadow-cyan-950/40 text-slate-100 z-10 transition-all">
        
        {/* Glow Top Accent Bar */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

        {/* Security Badge Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="relative mb-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isSuccess 
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/30' 
                : error 
                  ? 'bg-red-500/20 border-2 border-red-500 text-red-400 shadow-lg shadow-red-500/30'
                  : 'bg-gradient-to-b from-slate-800 to-slate-900 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/20'
            }`}>
              {isSuccess ? (
                <ShieldCheck className="w-8 h-8 animate-bounce" />
              ) : isSuccess ? (
                <Unlock className="w-8 h-8 text-emerald-400" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-semibold tracking-wider uppercase mb-2">
            <Terminal className="w-3 h-3" /> System Clearance Required
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            SALESTORM 3D
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-500/40 font-mono">
              v2.6
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Distributed System High-Concurrency Simulation Engine
          </p>
        </div>

        {/* Login / Unlock Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Enter Access Passcode
              </span>
              <span className="text-[10px] text-slate-500 font-mono">ENCRYPTED GATEWAY</span>
            </label>
            
            <div className="relative" id="passcode-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter passcode..."
                autoFocus
                className={`w-full px-4 py-3 bg-slate-950/90 border rounded-xl text-white text-sm font-mono tracking-wider focus:outline-none transition-all placeholder:text-slate-600 ${
                  error 
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30' 
                    : isSuccess
                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                      : 'border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Access Denied: Invalid passcode. Please try again.</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Authentication verified! Initializing 3D cluster...</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0"
              />
              <span>Remember session</span>
            </label>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Cpu className="w-3 h-3 text-cyan-500/70" /> WebGL2 Ready
            </div>
          </div>

          <button
            type="submit"
            disabled={isSuccess}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              isSuccess
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-[0.99]'
            }`}
          >
            {isSuccess ? (
              <>
                <ShieldCheck className="w-4 h-4" /> Decrypting Node Topology...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Unlock Simulation Console
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>SEC-PROTOCOL: AES-GCM</span>
          <span>SALESTORM 2026</span>
        </div>
      </div>
    </div>
  );
};
