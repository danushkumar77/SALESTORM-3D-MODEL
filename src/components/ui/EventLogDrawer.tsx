import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface EventLogItem {
  id: string;
  time: string;
  text: string;
  type: 'success' | 'warn' | 'error' | 'info';
}

interface EventLogDrawerProps {
  events: EventLogItem[];
}

export const EventLogDrawer: React.FC<EventLogDrawerProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(true);

  const getIcon = (type: EventLogItem['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warn': return <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />;
      case 'error': return <XCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />;
      default: return <Info className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 pointer-events-none w-80 md:w-96 hidden lg:block">
      <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-2xl shadow-black/80 overflow-hidden text-slate-200">
        {/* Header / Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/80 hover:bg-slate-800/80 transition-all border-b border-slate-800/80"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold font-mono text-white">Live Event Stream</span>
            <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.2 rounded font-mono">
              {events.length} logs
            </span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Content */}
        {isOpen && (
          <div className="p-2.5 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px] select-text">
            {events.length === 0 ? (
              <div className="text-slate-500 text-center py-4">Awaiting simulation events...</div>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="flex items-start gap-2 bg-slate-900/40 p-1.5 rounded border border-slate-800/40">
                  <span className="text-[10px] text-slate-500 shrink-0">{evt.time}</span>
                  {getIcon(evt.type)}
                  <span className="text-slate-300 leading-snug break-words">{evt.text}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
