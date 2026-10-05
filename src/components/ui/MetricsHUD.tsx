import React from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Server, 
  CreditCard, 
  Inbox, 
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import type { SimulationMetrics } from '../../types/simulation';

interface MetricsHUDProps {
  metrics: SimulationMetrics;
}

export const MetricsHUD: React.FC<MetricsHUDProps> = ({ metrics }) => {
  return (
    <div className="absolute top-16 left-4 z-20 flex flex-col gap-3 pointer-events-none max-w-xs md:max-w-sm">
      
      {/* 1. Global Traffic & Concurrency Card */}
      <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-3.5 shadow-2xl shadow-black/60 text-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Live Ingress Telemetry</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            STREAMING
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-lg p-2">
            <div className="text-[10px] text-slate-400 font-medium">Throughput</div>
            <div className="text-lg font-extrabold font-mono text-cyan-300">
              {metrics.requestsPerSec.toLocaleString()} <span className="text-xs font-normal text-slate-400">req/s</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">Peak: {metrics.peakRps.toLocaleString()} rps</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/60 rounded-lg p-2">
            <div className="text-[10px] text-slate-400 font-medium">In-Flight Packets</div>
            <div className="text-lg font-extrabold font-mono text-white">
              {metrics.inFlight} <span className="text-xs font-normal text-slate-400">active</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono">Generated: {metrics.totalGenerated.toLocaleString()}</div>
          </div>
        </div>

        {/* Latency Percentiles */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
          <span>Latency:</span>
          <span>p50: <b className="text-slate-200">{metrics.avgLatencyMs}ms</b></span>
          <span>p95: <b className="text-slate-200">{metrics.p95LatencyMs}ms</b></span>
          <span>p99: <b className="text-cyan-400">{metrics.p99LatencyMs}ms</b></span>
        </div>
      </div>

      {/* 2. Zero-Oversell Inventory Protection Card */}
      <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-3.5 shadow-2xl shadow-black/60 text-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Stock Vault (Atomic CAS)</span>
          </div>
          <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ZERO OVERSELL
          </div>
        </div>

        {/* Stock Breakdown Progress Bar */}
        <div className="mt-2.5">
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-slate-400">Available Stock:</span>
            <span className={`font-bold ${metrics.availableStock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {metrics.availableStock} / {metrics.totalStock}
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800 flex">
            {/* Available (Green) */}
            <div 
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(metrics.availableStock / metrics.totalStock) * 100}%` }}
            />
            {/* Reserved (Amber) */}
            <div 
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${(metrics.reservedStock / metrics.totalStock) * 100}%` }}
            />
            {/* Sold (Sky Blue) */}
            <div 
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${(metrics.soldStock / metrics.totalStock) * 100}%` }}
            />
          </div>

          {/* Detailed Counts */}
          <div className="grid grid-cols-4 gap-1.5 mt-2.5 text-center text-[10px] font-mono">
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded p-1">
              <div className="text-emerald-400 font-bold">{metrics.availableStock}</div>
              <div className="text-slate-400 text-[9px]">Avail</div>
            </div>
            <div className="bg-amber-950/40 border border-amber-500/20 rounded p-1">
              <div className="text-amber-400 font-bold">{metrics.reservedStock}</div>
              <div className="text-slate-400 text-[9px]">Reserved</div>
            </div>
            <div className="bg-sky-950/40 border border-sky-500/20 rounded p-1">
              <div className="text-sky-400 font-bold">{metrics.soldStock}</div>
              <div className="text-slate-400 text-[9px]">Sold</div>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-500/50 rounded p-1">
              <div className="text-emerald-300 font-extrabold">{metrics.oversoldStock}</div>
              <div className="text-emerald-400 font-semibold text-[9px]">Oversold</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Pipeline Stage Counters */}
      <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-3 shadow-2xl shadow-black/60 text-slate-200">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1.5 mb-2 border-b border-slate-800/80 flex items-center justify-between">
          <span>Pipeline Stage Totals</span>
          <span className="text-cyan-400 font-mono">200 OK Flow</span>
        </div>

        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Server className="w-3 h-3 text-sky-400" /> Gateway Accepted:
            </span>
            <span className="text-sky-300 font-bold">{metrics.gatewayAccepted}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-purple-400" /> Flash Engine Processed:
            </span>
            <span className="text-purple-300 font-bold">{metrics.engineProcessed}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 text-emerald-400" /> Payment Success:
            </span>
            <span className="text-emerald-300 font-bold">{metrics.paymentSuccessTotal}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Inbox className="w-3 h-3 text-blue-400" /> Kafka Queue Depth:
            </span>
            <span className={`font-bold ${metrics.queueDepth > 10 ? 'text-amber-400 animate-pulse' : 'text-blue-300'}`}>
              {metrics.queueDepth} msgs
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3 text-emerald-400" /> Orders Settled:
            </span>
            <span className="text-emerald-300 font-extrabold">{metrics.ordersCreatedTotal}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
