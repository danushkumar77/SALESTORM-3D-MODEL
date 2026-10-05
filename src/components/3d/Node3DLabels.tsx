import React from 'react';
import { Html } from '@react-three/drei';
import { TOPOLOGY_POINTS } from '../../engine/SimulationEngine';
import type { SimulationMetrics } from '../../types/simulation';

interface Node3DLabelsProps {
  metrics: SimulationMetrics;
  orderServiceOnline: boolean;
  orderServiceDownTimer: number;
}

export const Node3DLabels: React.FC<Node3DLabelsProps> = ({
  metrics,
  orderServiceOnline,
  orderServiceDownTimer,
}) => {
  const stockRatio = metrics.totalStock > 0 ? (metrics.availableStock / metrics.totalStock) * 100 : 0;

  return (
    <group>
      {/* 1. Traffic Arrival Zone Label */}
      <Html position={[TOPOLOGY_POINTS.TRAFFIC_ARRIVAL[0], TOPOLOGY_POINTS.TRAFFIC_ARRIVAL[1] + 1.2, TOPOLOGY_POINTS.TRAFFIC_ARRIVAL[2]]} center distanceFactor={45}>
        <div className="pointer-events-none select-none bg-slate-900/85 backdrop-blur border border-cyan-500/40 rounded-lg px-3 py-1.5 text-center shadow-lg shadow-cyan-950/50">
          <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">Traffic Arrival Zone</div>
          <div className="text-xs text-slate-200 font-mono font-semibold">
            {metrics.requestsPerSec.toLocaleString()} req/s &bull; In-Flight: {metrics.inFlight}
          </div>
        </div>
      </Html>

      {/* 2. API Gateway Live Badge */}
      <Html position={[TOPOLOGY_POINTS.GATEWAY[0], TOPOLOGY_POINTS.GATEWAY[1] + 6.0, TOPOLOGY_POINTS.GATEWAY[2]]} center distanceFactor={40}>
        <div className="pointer-events-none select-none bg-slate-900/90 backdrop-blur border border-sky-400/50 rounded-lg px-3.5 py-2 text-center shadow-xl shadow-sky-950/60 min-w-[170px]">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">API Gateway</span>
          </div>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {metrics.requestsPerSec.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">req/s</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Accepted: <span className="text-emerald-400 font-semibold">{metrics.gatewayAccepted}</span> | 429s: <span className="text-rose-400">{metrics.gatewayRateLimited}</span>
          </div>
        </div>
      </Html>

      {/* 3. Flash Sale Engine */}
      <Html position={[TOPOLOGY_POINTS.ENGINE[0], TOPOLOGY_POINTS.ENGINE[1] + 3.6, TOPOLOGY_POINTS.ENGINE[2]]} center distanceFactor={40}>
        <div className="pointer-events-none select-none bg-slate-900/85 backdrop-blur border border-purple-400/40 rounded-lg px-3 py-1.5 text-center shadow-lg shadow-purple-950/50 min-w-[150px]">
          <div className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Flash Sale Engine</div>
          <div className="text-xs text-slate-200 font-mono">
            Idempotency: <span className="text-emerald-400">Locked</span>
          </div>
          {metrics.engineDuplicatesBlocked > 0 && (
            <div className="text-[10px] text-purple-300 font-mono">
              Replays Blocked: <span className="font-bold text-purple-200">{metrics.engineDuplicatesBlocked}</span>
            </div>
          )}
        </div>
      </Html>

      {/* 4. Inventory Service & Live Stock Gauge */}
      <Html position={[TOPOLOGY_POINTS.INVENTORY[0], TOPOLOGY_POINTS.INVENTORY[1] + 5.8, TOPOLOGY_POINTS.INVENTORY[2]]} center distanceFactor={38}>
        <div className={`pointer-events-none select-none backdrop-blur rounded-lg px-4 py-2.5 text-center shadow-2xl min-w-[190px] border ${
          metrics.availableStock > 0 
            ? 'bg-slate-900/90 border-emerald-500/50 shadow-emerald-950/60' 
            : 'bg-red-950/90 border-rose-500 shadow-rose-950/80 animate-pulse'
        }`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            Inventory Service (Atomic CAS)
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">STOCK:</span>
            <span className={`font-bold ${metrics.availableStock > 0 ? 'text-white' : 'text-rose-400'}`}>
              {metrics.availableStock} / {metrics.totalStock}
            </span>
          </div>
          {/* Visual Stock Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-300 ${
                stockRatio > 30 ? 'bg-emerald-500' : stockRatio > 0 ? 'bg-amber-500' : 'bg-rose-600'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, stockRatio))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
            <span>Rsv: <b className="text-amber-400">{metrics.reservedStock}</b></span>
            <span>Sold: <b className="text-emerald-400">{metrics.soldStock}</b></span>
            <span>Oversold: <b className="text-emerald-400 font-bold">{metrics.oversoldStock}</b></span>
          </div>
          {metrics.availableStock === 0 && (
            <div className="mt-1 text-[10px] font-bold text-rose-300 bg-rose-900/60 rounded px-1.5 py-0.5 uppercase tracking-wider">
              OUT OF STOCK &bull; ZERO OVERSELL
            </div>
          )}
        </div>
      </Html>

      {/* 5. Payment Service */}
      <Html position={[TOPOLOGY_POINTS.PAYMENT[0], TOPOLOGY_POINTS.PAYMENT[1] + 4.2, TOPOLOGY_POINTS.PAYMENT[2]]} center distanceFactor={40}>
        <div className="pointer-events-none select-none bg-slate-900/85 backdrop-blur border border-rose-500/40 rounded-lg px-3 py-1.5 text-center shadow-lg shadow-rose-950/50 min-w-[160px]">
          <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">Payment Gateway</div>
          <div className="text-xs text-slate-200 font-mono font-medium">
            200 OK: <span className="text-emerald-400">{metrics.paymentSuccessTotal}</span> | Fail: <span className="text-rose-400">{metrics.paymentFailedTotal}</span>
          </div>
        </div>
      </Html>

      {/* 6. Message Queue (Kafka) */}
      <Html position={[TOPOLOGY_POINTS.QUEUE[0], TOPOLOGY_POINTS.QUEUE[1] + 3.8, TOPOLOGY_POINTS.QUEUE[2]]} center distanceFactor={40}>
        <div className="pointer-events-none select-none bg-slate-900/85 backdrop-blur border border-blue-500/40 rounded-lg px-3.5 py-1.5 text-center shadow-lg shadow-blue-950/50 min-w-[160px]">
          <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Kafka Topic: order.events</div>
          <div className="text-xs text-slate-200 font-mono font-medium">
            Lag / Depth: <span className={`font-bold ${metrics.queueDepth > 10 ? 'text-amber-400' : 'text-blue-300'}`}>{metrics.queueDepth} msgs</span>
          </div>
        </div>
      </Html>

      {/* 7. Order Service */}
      <Html position={[TOPOLOGY_POINTS.ORDER[0], TOPOLOGY_POINTS.ORDER[1] + 5.0, TOPOLOGY_POINTS.ORDER[2]]} center distanceFactor={40}>
        <div className={`pointer-events-none select-none backdrop-blur rounded-lg px-3.5 py-2 text-center shadow-xl min-w-[170px] border ${
          orderServiceOnline 
            ? 'bg-slate-900/90 border-emerald-500/50 shadow-emerald-950/50' 
            : 'bg-red-950/90 border-rose-500 shadow-rose-950/80 animate-pulse'
        }`}>
          <div className="flex items-center justify-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${orderServiceOnline ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
            <span className={`text-[11px] font-bold uppercase tracking-wider ${orderServiceOnline ? 'text-emerald-300' : 'text-rose-300'}`}>
              Order Service
            </span>
          </div>
          {orderServiceOnline ? (
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {metrics.ordersCreatedTotal} <span className="text-[10px] text-slate-400 font-normal">Orders Settled</span>
            </div>
          ) : (
            <div className="mt-0.5">
              <div className="text-xs font-bold text-rose-300 font-mono">OUTAGE (RECOVERING)</div>
              <div className="text-[10px] text-rose-400 font-mono">T-{Math.ceil(orderServiceDownTimer)}s until recovery</div>
            </div>
          )}
        </div>
      </Html>

      {/* 8. Redis Cache Label */}
      <Html position={[TOPOLOGY_POINTS.CACHE[0], TOPOLOGY_POINTS.CACHE[1] + 2.8, TOPOLOGY_POINTS.CACHE[2]]} center distanceFactor={45}>
        <div className="pointer-events-none select-none bg-slate-900/80 backdrop-blur border border-purple-500/30 rounded px-2 py-1 text-center">
          <div className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">Redis Cluster</div>
          <div className="text-[10px] text-slate-300 font-mono">98.6% Cache Hit</div>
        </div>
      </Html>

      {/* 9. PostgreSQL DB Label */}
      <Html position={[TOPOLOGY_POINTS.DATABASE[0], TOPOLOGY_POINTS.DATABASE[1] + 3.8, TOPOLOGY_POINTS.DATABASE[2]]} center distanceFactor={45}>
        <div className="pointer-events-none select-none bg-slate-900/80 backdrop-blur border border-sky-500/30 rounded px-2 py-1 text-center">
          <div className="text-[9px] uppercase tracking-wider text-sky-400 font-bold">PostgreSQL ACID DB</div>
          <div className="text-[10px] text-slate-300 font-mono">{metrics.dbWritesTotal} Sync Writes</div>
        </div>
      </Html>
    </group>
  );
};
