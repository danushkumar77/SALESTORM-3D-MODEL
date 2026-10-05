import React from 'react';
import { X, Server, Cpu, Box, CreditCard, Inbox, FileCheck, Database, ShieldCheck, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NodeDetailsModalProps {
  nodeId: string | null;
  onClose: () => void;
}

interface NodeInfo {
  title: string;
  subTitle: string;
  badge: string;
  badgeColor: string;
  icon: LucideIcon;
  description: string;
  architectureDetails: string[];
  keyGuarantees: string[];
}

const NODE_DEFINITIONS: Record<string, NodeInfo> = {
  TRAFFIC_ARRIVAL: {
    title: 'Traffic Arrival Zone',
    subTitle: '1-Minute Traffic Arrival Window',
    badge: 'INGRESS GENERATOR',
    badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500/40',
    icon: Activity,
    description: 'Simulates organic burst traffic arriving over a configurable 60-second window with Poisson/burst distributions. Requests move across arrival lanes rather than teleporting.',
    architectureDetails: [
      'Traffic modes range from Normal (100 req/min) to Extreme (50,000 req/min).',
      'Each request has unique client ID, timestamp, and idempotency key.',
      'Prevents client-side thundering herd through randomized backoff intervals.'
    ],
    keyGuarantees: ['Realistic traffic distribution', 'Visible movement vectors', 'Zero instantaneous teleportation']
  },
  API_GATEWAY: {
    title: 'API Gateway & Ingress Layer',
    subTitle: 'TLS Termination & Token Bucket Limiting',
    badge: 'EDGE PROXY',
    badgeColor: 'bg-sky-950 text-sky-400 border-sky-500/40',
    icon: Server,
    description: 'High-performance reverse proxy handling TLS handshake, JWT validation, and token-bucket ingress rate limiting (HTTP 429 for excess bursts).',
    architectureDetails: [
      'Token-bucket rate limiter protects downstream microservices.',
      'Terminates TLS connection at edge with sub-millisecond overhead.',
      'Routes traffic directly to the Flash Sale Engine via HTTP/2 multiplexing.'
    ],
    keyGuarantees: ['DoS / DDoS protection', 'Instantaneous 429 rate limit shedding', 'Low-latency packet routing']
  },
  FLASH_ENGINE: {
    title: 'Flash Sale Engine',
    subTitle: 'Sale Validation & Idempotency Router',
    badge: 'CORE VALIDATOR',
    badgeColor: 'bg-purple-950 text-purple-400 border-purple-500/40',
    icon: Cpu,
    description: 'Validates campaign timing, user eligibility, and idempotency keys to prevent duplicate payments or malicious replay attacks.',
    architectureDetails: [
      'Queries Redis Distributed Cache for registered idempotency tokens.',
      'Repeated submissions return cached 200 responses without double charging.',
      'Ensures only 1 active reservation attempt per customer per SKU.'
    ],
    keyGuarantees: ['Strict idempotency enforcement', 'Sub-millisecond validation', 'Eliminates double billing']
  },
  INVENTORY_VAULT: {
    title: 'Inventory Service & Stock Vault',
    subTitle: 'Atomic CAS & Zero-Oversell Safe',
    badge: 'CRITICAL STATE',
    badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500/40',
    icon: Box,
    description: 'Manages flash-sale stock with atomic Compare-And-Swap (CAS) operations in Redis/Memory before database persistence, strictly preventing overselling.',
    architectureDetails: [
      'Executes atomic Lua script: `if stock > 0 then stock = stock - 1; return 1 else return 0 end`.',
      'Reservations hold stock for 120s TTL awaiting payment settlement.',
      'When stock reaches 0, all subsequent requests immediately branch to 409 Out of Stock.'
    ],
    keyGuarantees: ['Zero overselling mathematically guaranteed', 'Lock-free atomic decrements', 'Automatic TTL release on abandonment']
  },
  PAYMENT_SERVICE: {
    title: 'Payment Gateway Service',
    subTitle: 'Dual-Channel Processor & Rollback',
    badge: 'FINANCIAL SETTLEMENT',
    badgeColor: 'bg-rose-950 text-rose-400 border-rose-500/40',
    icon: CreditCard,
    description: 'Processes credit card transactions with external payment networks. Handles successful authorizations and triggers automatic stock rollback on card declines.',
    architectureDetails: [
      'Captures payments with 95% baseline success rate.',
      'On card decline or timeout, sends an atomic rollback event to Inventory to release the reserved item.',
      'On payment approval (200 OK), publishes a durable message to Kafka.'
    ],
    keyGuarantees: ['2-Phase commit / Saga pattern', 'Automatic inventory rollback on card failure', 'Zero phantom holds']
  },
  MESSAGE_QUEUE: {
    title: 'Message Queue (Apache Kafka)',
    subTitle: 'Durable Event Streaming & Asynchronous Decoupling',
    badge: 'BUFFER LAYER',
    badgeColor: 'bg-blue-950 text-blue-400 border-blue-500/40',
    icon: Inbox,
    description: 'Decouples high-throughput checkout frontends from write-heavy order fulfillment and warehouse database operations.',
    architectureDetails: [
      'Partitioned Kafka topic `order.events.p0` with at-least-once delivery.',
      'Safely buffers spikes when downstream Order Service undergoes maintenance or temporary outages.',
      'Consumers drain backlog smoothly once Order Service recovers without dropping a single order.'
    ],
    keyGuarantees: ['Zero message loss during outages', 'Smooth backpressure absorption', 'Ordered event processing']
  },
  ORDER_SERVICE: {
    title: 'Order Service & Fulfillment Hub',
    subTitle: 'Durable ACID Settlement & Invoice Generation',
    badge: 'SETTLEMENT WORKER',
    badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500/40',
    icon: FileCheck,
    description: 'Consumes confirmed payment events from Kafka, writes immutable order records to PostgreSQL ACID database, and issues customer invoices.',
    architectureDetails: [
      'Idempotent consumer verifies order has not already been created.',
      'Performs ACID transaction write to durable database.',
      'Dispatches asynchronous email/push confirmation to client.'
    ],
    keyGuarantees: ['ACID consistency', 'Idempotent consumption', 'Final order delivery guarantee']
  },
  CACHE: {
    title: 'Distributed Cache (Redis Cluster)',
    subTitle: 'In-Memory Metadata & Idempotency Storage',
    badge: 'FAST TIER',
    badgeColor: 'bg-purple-950 text-purple-400 border-purple-500/40',
    icon: Database,
    description: 'Sub-millisecond in-memory cache holding product stock counters, session tokens, and deduplication keys.',
    architectureDetails: [
      'Master-replica cluster with Redis Sentinel auto-failover.',
      'Serves 98%+ of read traffic to protect primary databases.',
      'Powers atomic stock decrement Lua scripts.'
    ],
    keyGuarantees: ['< 1ms response latency', 'High-availability failover', 'Atomic state coordination']
  },
  DATABASE: {
    title: 'PostgreSQL ACID Database',
    subTitle: 'Durable Transaction Ledger',
    badge: 'DURABLE STORAGE',
    badgeColor: 'bg-sky-950 text-sky-400 border-sky-500/40',
    icon: Database,
    description: 'Durable relational database storing user profiles, payment audit records, and confirmed purchase orders.',
    architectureDetails: [
      'Write-Ahead Logging (WAL) ensures durability.',
      'Decoupled from peak flash-sale write spike via Kafka queue buffering.',
      'Stores immutable financial audit trails.'
    ],
    keyGuarantees: ['ACID compliance', 'Durable disaster recovery', 'Complete financial traceability']
  },
  OBSERVABILITY: {
    title: 'APM Observability & Telemetry Hub',
    subTitle: 'Distributed Tracing & Real-Time Metrics',
    badge: 'MONITORING',
    badgeColor: 'bg-amber-950 text-amber-400 border-amber-500/40',
    icon: ShieldCheck,
    description: 'Aggregates OpenTelemetry spans, metrics, and trace IDs across all microservices for complete end-to-end request visibility.',
    architectureDetails: [
      'Real-time percentile tracking for p50, p95, and p99 latency.',
      'Immediate alert triggers for rate-limit surges or queue lag spikes.',
      'Trace logs correlated with individual request IDs.'
    ],
    keyGuarantees: ['100% trace visibility', 'Sub-second anomaly detection', 'Comprehensive observability']
  },
};

export const NodeDetailsModal: React.FC<NodeDetailsModalProps> = ({
  nodeId,
  onClose,
}) => {
  if (!nodeId || !NODE_DEFINITIONS[nodeId]) return null;
  const info = NODE_DEFINITIONS[nodeId];
  const Icon = info.icon;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-lg bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-5 shadow-2xl shadow-black/90 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{info.title}</h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${info.badgeColor}`}>
                {info.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{info.subTitle}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        {info.description}
      </p>

      {/* Architectural Mechanisms */}
      <div className="mt-3.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
          Architectural Implementation
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {info.architectureDetails.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">&bull;</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Guarantees */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
          System Guarantees
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {info.keyGuarantees.map((g, idx) => (
            <span key={idx} className="text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              ✓ {g}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
