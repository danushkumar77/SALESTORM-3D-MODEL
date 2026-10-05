export type RequestStatus =
  | 'APPROACHING'
  | 'AT_GATEWAY'
  | 'QUEUED_GATEWAY'
  | 'PROCESSING_ENGINE'
  | 'INVENTORY_CHECK'
  | 'RESERVED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUCCESS'
  | 'QUEUED_ORDER'
  | 'ORDER_CREATED'
  | 'REJECTED_RATE_LIMITED'
  | 'REJECTED_OUT_OF_STOCK'
  | 'REJECTED_DUPLICATE'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_TIMEOUT';

export interface TimelineEvent {
  timestamp: string;
  simTimeSec: number;
  stage: string;
  detail: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface PurchaseRequest {
  id: string;
  customerId: string;
  idempotencyKey: string;
  productId: string;
  productName: string;
  price: number;
  priority: 'VIP' | 'Normal';
  
  // Timestamps (simulated seconds)
  arrivalTimeSec: number;
  completedTimeSec?: number;
  
  // Status
  status: RequestStatus;
  statusColor: string;
  statusLabel: string;
  
  // Path progression: 0 (traffic arrival) to 1 (order created or terminal failure)
  progress: number;
  currentHop: number; // 0 to 6
  hopProgress: number; // 0 to 1 within current segment
  
  // 3D position vector
  position: [number, number, number];
  startPos: [number, number, number];
  targetPos: [number, number, number];
  laneOffset: [number, number, number];
  
  // Audit details
  reservationId?: string;
  paymentId?: string;
  orderId?: string;
  failureReason?: string;
  timeline: TimelineEvent[];
  
  // Concurrency tag (e.g. for Race conditions)
  tag?: string;
  isSpecialHighlighted?: boolean;
}

export interface NodeMetrics {
  name: string;
  id: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'OVERLOADED';
  throughput: number; // ops/sec
  activeCount: number;
  queueDepth?: number;
  latencyMs: number;
  errorRate: number;
}

export interface SimulationMetrics {
  // Global & Traffic
  elapsedSec: number;
  timeWindowSec: number;
  totalGenerated: number;
  inFlight: number;
  requestsPerSec: number;
  peakRps: number;
  
  // Inventory (Zero-Oversell guarantee)
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  oversoldStock: number; // MUST ALWAYS BE 0
  
  // API Gateway
  gatewayIngressTotal: number;
  gatewayAccepted: number;
  gatewayRateLimited: number;
  gatewayQueueDepth: number;
  
  // Flash Sale Engine & Cache
  engineProcessed: number;
  engineDuplicatesBlocked: number;
  cacheHitRatio: number;
  
  // Inventory Service
  inventoryReservedTotal: number;
  inventoryRejectedOutOfStock: number;
  
  // Payment Service
  paymentSuccessTotal: number;
  paymentFailedTotal: number;
  paymentTimeoutTotal: number;
  
  // Message Queue (Kafka)
  queueDepth: number;
  queueMaxLagSec: number;
  queuePublishedTotal: number;
  queueConsumedTotal: number;
  
  // Order Service & Database
  ordersCreatedTotal: number;
  dbWritesTotal: number;
  
  // Performance
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  systemHealth: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
}

export type TrafficMode = 'NORMAL' | 'HIGH' | 'FLASH_SALE' | 'EXTREME';

export type ScenarioPreset =
  | 'NORMAL_TRAFFIC'
  | 'HIGH_TRAFFIC'
  | 'FLASH_SALE_10K'
  | 'EXTREME_50K'
  | 'LAST_ITEM_RACE'
  | 'ORDER_SERVICE_OUTAGE'
  | 'PAYMENT_FAILURE_ROLLBACK'
  | 'IDEMPOTENCY_STORM';

export type CameraViewPreset =
  | 'OVERVIEW'
  | 'TRAFFIC_ARRIVAL'
  | 'API_GATEWAY'
  | 'FLASH_ENGINE'
  | 'INVENTORY_VAULT'
  | 'PAYMENT_SERVICE'
  | 'MESSAGE_QUEUE'
  | 'ORDER_SERVICE'
  | 'CACHE_DB';

export interface TopologyNodeDef {
  id: string;
  name: string;
  subTitle: string;
  type: 'gateway' | 'engine' | 'inventory' | 'payment' | 'queue' | 'order' | 'cache' | 'db' | 'observability';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  emissiveColor: string;
  description: string;
}
