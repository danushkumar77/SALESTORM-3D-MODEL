import React from 'react';
import { 
  Zap, 
  Flame, 
  ShieldAlert, 
  Clock, 
  CopyCheck, 
  Sparkles
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ScenarioPreset } from '../../types/simulation';

interface ScenarioControllerProps {
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenario: ScenarioPreset) => void;
  orderServiceOnline: boolean;
  orderServiceDownTimer: number;
}

interface ScenarioItem {
  id: ScenarioPreset;
  title: string;
  badge: string;
  badgeColor: string;
  desc: string;
  icon: LucideIcon;
}

const SCENARIOS: ScenarioItem[] = [
  {
    id: 'FLASH_SALE_10K',
    title: '10,000 Users Flash Sale',
    badge: 'CORE SCENARIO',
    badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500/40',
    desc: '10,000 requests converge on the API Gateway competing for only 100 inventory units.',
    icon: Flame,
  },
  {
    id: 'LAST_ITEM_RACE',
    title: 'Last Item Race Condition',
    badge: 'CONCURRENCY TEST',
    badgeColor: 'bg-amber-950 text-amber-400 border-amber-500/40',
    desc: 'Stock = 1. REQ-A & REQ-B collide at sub-ms. Only 1 succeeds, other gets 409. Oversold = 0.',
    icon: Zap,
  },
  {
    id: 'ORDER_SERVICE_OUTAGE',
    title: 'Order Service Down (30s Outage)',
    badge: 'RESILIENCY DEMO',
    badgeColor: 'bg-rose-950 text-rose-400 border-rose-500/40',
    desc: 'Order consumer goes down. Kafka visibly buffers messages, then drains on recovery with 0 data loss.',
    icon: ShieldAlert,
  },
  {
    id: 'PAYMENT_FAILURE_ROLLBACK',
    title: 'Payment Failure & Stock Rollback',
    badge: 'ATOMIC ROLLBACK',
    badgeColor: 'bg-purple-950 text-purple-400 border-purple-500/40',
    desc: 'Card declines. Reserved stock reservation expires and restores +1 back to available pool.',
    icon: Clock,
  },
  {
    id: 'IDEMPOTENCY_STORM',
    title: 'Idempotency Replay Attack',
    badge: 'TOKEN DEDUPLICATION',
    badgeColor: 'bg-blue-950 text-blue-400 border-blue-500/40',
    desc: 'Client retry storm with duplicate keys intercepted at Flash Sale Engine with cached 200 response.',
    icon: CopyCheck,
  },
];

export const ScenarioController: React.FC<ScenarioControllerProps> = ({
  currentScenario,
  onSelectScenario,
  orderServiceOnline,
  orderServiceDownTimer,
}) => {
  return (
    <div className="absolute bottom-4 left-4 z-20 pointer-events-none max-w-sm hidden md:block">
      <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl p-3 shadow-2xl shadow-black/80 text-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Jury Demonstration Scenarios
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">1-Click Presets</span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {SCENARIOS.map((item) => {
            const Icon = item.icon;
            const isSelected = currentScenario === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScenario(item.id)}
                className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/60 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-md mt-0.5 ${isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white truncate">{item.title}</span>
                    <span className={`text-[9px] font-semibold px-1 py-0.2 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Outage Alert Bar if active */}
        {!orderServiceOnline && (
          <div className="mt-2 bg-rose-950/80 border border-rose-500/60 rounded-lg p-2 flex items-center justify-between text-xs text-rose-300 font-mono animate-pulse">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Order Service Down (Kafka Accumulating)
            </span>
            <span className="font-bold text-white">{Math.ceil(orderServiceDownTimer)}s</span>
          </div>
        )}
      </div>
    </div>
  );
};
