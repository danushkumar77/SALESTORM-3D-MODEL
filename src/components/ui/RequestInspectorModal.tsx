import React from 'react';
import { 
  X, 
  Clock, 
  AlertCircle, 
  Target
} from 'lucide-react';
import type { PurchaseRequest } from '../../types/simulation';

interface RequestInspectorModalProps {
  request: PurchaseRequest | null;
  onClose: () => void;
  isTracking: boolean;
  onToggleTracking: () => void;
}

export const RequestInspectorModal: React.FC<RequestInspectorModalProps> = ({
  request,
  onClose,
  isTracking,
  onToggleTracking,
}) => {
  if (!request) return null;

  return (
    <div className="absolute top-16 right-4 z-30 w-80 md:w-96 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl shadow-cyan-950/80 text-slate-100 animate-in fade-in slide-in-from-right-4 duration-200">
      
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: request.statusColor }} />
            <h3 className="text-sm font-bold font-mono text-white tracking-wide">{request.id}</h3>
            {request.priority === 'VIP' && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-bold">
                VIP
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Customer ID: <span className="text-cyan-400 font-semibold">{request.customerId}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Follow Camera Toggle */}
          <button
            onClick={onToggleTracking}
            title="Follow Request in 3D"
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border transition-all cursor-pointer ${
              isTracking
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md shadow-cyan-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-cyan-500/30'
            }`}
          >
            <Target className="w-3 h-3" />
            {isTracking ? 'Tracking' : 'Follow 3D'}
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current State Banner */}
      <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Lifecycle Status</div>
        <div className="flex items-center justify-between mt-1">
          <span 
            className="text-xs font-bold font-mono px-2 py-0.5 rounded border"
            style={{ 
              color: request.statusColor,
              borderColor: `${request.statusColor}40`,
              backgroundColor: `${request.statusColor}15`
            }}
          >
            {request.statusLabel}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Hop: {request.currentHop} / 6
          </span>
        </div>
        {request.failureReason && (
          <div className="mt-2 text-[11px] text-rose-300 bg-rose-950/60 border border-rose-500/30 rounded p-1.5 font-mono flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
            <span>{request.failureReason}</span>
          </div>
        )}
      </div>

      {/* Payload Attributes */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2">
          <div className="text-[9px] text-slate-500 uppercase">Product SKU</div>
          <div className="text-white font-semibold truncate" title={request.productName}>
            {request.productId}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold">${request.price.toFixed(2)}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2">
          <div className="text-[9px] text-slate-500 uppercase">Idempotency Key</div>
          <div className="text-slate-300 font-mono truncate text-[10px]" title={request.idempotencyKey}>
            {request.idempotencyKey}
          </div>
          <div className="text-[9px] text-purple-400 mt-0.5">Deduplication: Active</div>
        </div>
      </div>

      {/* Transaction Identifiers */}
      <div className="mt-2 space-y-1 text-[11px] font-mono">
        <div className="flex justify-between bg-slate-900/40 px-2 py-1 rounded">
          <span className="text-slate-400">Reservation Lock:</span>
          <span className={request.reservationId ? 'text-amber-400 font-bold' : 'text-slate-600'}>
            {request.reservationId || 'Pending'}
          </span>
        </div>
        <div className="flex justify-between bg-slate-900/40 px-2 py-1 rounded">
          <span className="text-slate-400">Payment Ref:</span>
          <span className={request.paymentId ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
            {request.paymentId || 'Uncaptured'}
          </span>
        </div>
        <div className="flex justify-between bg-slate-900/40 px-2 py-1 rounded">
          <span className="text-slate-400">Settled Order ID:</span>
          <span className={request.orderId ? 'text-cyan-400 font-extrabold' : 'text-slate-600'}>
            {request.orderId || 'Awaiting settlement'}
          </span>
        </div>
      </div>

      {/* Microsecond Audit Timeline */}
      <div className="mt-3 pt-2.5 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Microsecond Audit Trail
          </span>
          <span className="text-[9px] text-slate-500 font-mono">{request.timeline.length} hops logged</span>
        </div>

        <div className="space-y-2 max-h-44 overflow-y-auto pr-1 text-xs font-mono">
          {request.timeline.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 border-l-2 border-cyan-500/40 pl-2 py-0.5">
              <div className="text-[10px] text-cyan-400 font-bold shrink-0">{item.timestamp}</div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-slate-200">{item.stage}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
