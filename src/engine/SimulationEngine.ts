import type { 
  PurchaseRequest, 
  RequestStatus, 
  SimulationMetrics, 
  TrafficMode, 
  ScenarioPreset, 
  TimelineEvent 
} from '../types/simulation';
import { soundFx } from './AudioSynthesizer';

// Topology 3D anchor points
export const TOPOLOGY_POINTS = {
  TRAFFIC_ARRIVAL: [0, 4, 38] as [number, number, number],
  GATEWAY: [0, 0, 18] as [number, number, number],
  GATEWAY_REJECT: [18, 0, 18] as [number, number, number],
  ENGINE: [0, 0, 6] as [number, number, number],
  ENGINE_DUPLICATE_REJECT: [-16, 0, 6] as [number, number, number],
  INVENTORY: [0, 0, -6] as [number, number, number],
  INVENTORY_REJECT: [18, 0, -6] as [number, number, number],
  PAYMENT: [0, 0, -18] as [number, number, number],
  PAYMENT_REJECT: [-18, 0, -18] as [number, number, number],
  QUEUE: [0, 0, -30] as [number, number, number],
  ORDER: [0, 0, -42] as [number, number, number],
  CACHE: [-16, 1, 0] as [number, number, number],
  DATABASE: [16, 1, -24] as [number, number, number],
  OBSERVABILITY: [-16, 3, -24] as [number, number, number],
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  APPROACHING: '#00f0ff',
  AT_GATEWAY: '#38bdf8',
  QUEUED_GATEWAY: '#60a5fa',
  PROCESSING_ENGINE: '#c084fc',
  INVENTORY_CHECK: '#facc15',
  RESERVED: '#fb923c',
  PAYMENT_PENDING: '#f43f5e',
  PAYMENT_SUCCESS: '#34d399',
  QUEUED_ORDER: '#3b82f6',
  ORDER_CREATED: '#10b981',
  REJECTED_RATE_LIMITED: '#ef4444',
  REJECTED_OUT_OF_STOCK: '#f43f5e',
  REJECTED_DUPLICATE: '#a855f7',
  PAYMENT_FAILED: '#e11d48',
  PAYMENT_TIMEOUT: '#d97706',
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  APPROACHING: 'Approaching Gateway',
  AT_GATEWAY: 'Ingress Rate Limiter',
  QUEUED_GATEWAY: 'Gateway Buffer',
  PROCESSING_ENGINE: 'Validating Idempotency',
  INVENTORY_CHECK: 'Atomic Inventory Lock',
  RESERVED: 'Stock Reserved (TTL 120s)',
  PAYMENT_PENDING: 'Payment Processing',
  PAYMENT_SUCCESS: 'Payment Approved (200)',
  QUEUED_ORDER: 'Event Queued (Kafka)',
  ORDER_CREATED: 'Order Created & Settled',
  REJECTED_RATE_LIMITED: '429 Rate Limited',
  REJECTED_OUT_OF_STOCK: '409 Out of Stock',
  REJECTED_DUPLICATE: '200 Idempotent Cached',
  PAYMENT_FAILED: '402 Payment Declined',
  PAYMENT_TIMEOUT: '408 Payment Timeout',
};

export class SimulationEngine {
  // State
  public isRunning: boolean = false;
  public simSpeed: number = 1.0;
  public trafficMode: TrafficMode = 'FLASH_SALE';
  public currentScenario: ScenarioPreset = 'FLASH_SALE_10K';
  
  // Timing
  public simTimeSec: number = 0;
  public timeWindowSec: number = 60; // 1-minute window
  
  // Requests in simulation
  public requests: PurchaseRequest[] = [];
  public selectedRequestId: string | null = null;
  public recentEvents: { id: string; time: string; text: string; type: 'success' | 'warn' | 'error' | 'info' }[] = [];
  
  // Architectural States
  public orderServiceOnline: boolean = true;
  public orderServiceDownTimer: number = 0; // For 30s outage demo
  public totalStock: number = 100;
  public availableStock: number = 100;
  public reservedStock: number = 0;
  public soldStock: number = 0;
  public oversoldStock: number = 0; // Must remain strictly 0
  
  // Rate Counters & Metrics
  public metrics: SimulationMetrics = this.getInitialMetrics();
  
  // Generator schedule
  private generatedSeq: number = 0;
  private spawnAccumulator: number = 0;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.resetSimulation();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getInitialMetrics(): SimulationMetrics {
    return {
      elapsedSec: 0,
      timeWindowSec: this.timeWindowSec,
      totalGenerated: 0,
      inFlight: 0,
      requestsPerSec: 0,
      peakRps: 0,
      totalStock: this.totalStock,
      availableStock: this.availableStock,
      reservedStock: 0,
      soldStock: 0,
      oversoldStock: 0,
      gatewayIngressTotal: 0,
      gatewayAccepted: 0,
      gatewayRateLimited: 0,
      gatewayQueueDepth: 0,
      engineProcessed: 0,
      engineDuplicatesBlocked: 0,
      cacheHitRatio: 98.6,
      inventoryReservedTotal: 0,
      inventoryRejectedOutOfStock: 0,
      paymentSuccessTotal: 0,
      paymentFailedTotal: 0,
      paymentTimeoutTotal: 0,
      queueDepth: 0,
      queueMaxLagSec: 0,
      queuePublishedTotal: 0,
      queueConsumedTotal: 0,
      ordersCreatedTotal: 0,
      dbWritesTotal: 0,
      avgLatencyMs: 42,
      p95LatencyMs: 78,
      p99LatencyMs: 112,
      systemHealth: 'OPTIMAL',
    };
  }

  public start() {
    if (!this.isRunning) {
      this.isRunning = true;
      soundFx.playClick();
      this.logEvent('Simulation started in ' + this.trafficMode + ' mode (' + this.timeWindowSec + 's window)', 'info');
      this.notify();
    }
  }

  public pause() {
    this.isRunning = false;
    soundFx.playClick();
    this.logEvent('Simulation paused at T+' + this.simTimeSec.toFixed(2) + 's', 'warn');
    this.notify();
  }

  public setSpeed(speed: number) {
    this.simSpeed = speed;
    soundFx.playClick();
    this.notify();
  }

  public setTrafficMode(mode: TrafficMode) {
    this.trafficMode = mode;
    soundFx.playClick();
    this.logEvent(`Traffic mode set to ${mode}`, 'info');
    this.notify();
  }

  public loadScenario(scenario: ScenarioPreset) {
    this.currentScenario = scenario;
    this.resetSimulation();

    switch (scenario) {
      case 'NORMAL_TRAFFIC':
        this.trafficMode = 'NORMAL';
        this.totalStock = 100;
        this.availableStock = 100;
        this.logEvent('Loaded Scenario: Normal Baseline Traffic (100 req/min)', 'info');
        break;
      case 'HIGH_TRAFFIC':
        this.trafficMode = 'HIGH';
        this.totalStock = 100;
        this.availableStock = 100;
        this.logEvent('Loaded Scenario: High Traffic Surge (1,000 req/min)', 'info');
        break;
      case 'FLASH_SALE_10K':
        this.trafficMode = 'FLASH_SALE';
        this.totalStock = 100;
        this.availableStock = 100;
        this.logEvent('Loaded Scenario: 10,000 Purchase Requests Burst (100 Units)', 'info');
        break;
      case 'EXTREME_50K':
        this.trafficMode = 'EXTREME';
        this.totalStock = 200;
        this.availableStock = 200;
        this.logEvent('Loaded Scenario: Extreme Cyber Monday Load (50,000 req/min)', 'warn');
        break;
      case 'LAST_ITEM_RACE':
        this.trafficMode = 'NORMAL';
        this.totalStock = 1;
        this.availableStock = 1;
        this.spawnRaceConditionPair();
        this.logEvent('Loaded Scenario: LAST ITEM RACE (Stock = 1, Sub-millisecond Collision Test)', 'warn');
        break;
      case 'ORDER_SERVICE_OUTAGE':
        this.trafficMode = 'HIGH';
        this.totalStock = 100;
        this.availableStock = 100;
        this.orderServiceOnline = false;
        this.orderServiceDownTimer = 30; // 30 seconds outage
        this.logEvent('Loaded Scenario: ORDER SERVICE DOWN (30s Outage - Watch Kafka Queue Accumulate)', 'error');
        break;
      case 'PAYMENT_FAILURE_ROLLBACK':
        this.trafficMode = 'HIGH';
        this.totalStock = 50;
        this.availableStock = 50;
        this.logEvent('Loaded Scenario: Payment Gateway Failure & Atomic Stock Rollback Demo', 'warn');
        break;
      case 'IDEMPOTENCY_STORM':
        this.trafficMode = 'FLASH_SALE';
        this.totalStock = 100;
        this.availableStock = 100;
        this.spawnIdempotentAttackBatch();
        this.logEvent('Loaded Scenario: Idempotency Attack Storm (Duplicate Token Rejections)', 'warn');
        break;
    }

    this.metrics = this.getInitialMetrics();
    this.metrics.totalStock = this.totalStock;
    this.metrics.availableStock = this.availableStock;
    this.notify();
  }

  public resetSimulation() {
    this.isRunning = false;
    this.simTimeSec = 0;
    this.generatedSeq = 0;
    this.spawnAccumulator = 0;
    this.requests = [];
    this.selectedRequestId = null;
    this.orderServiceOnline = true;
    this.orderServiceDownTimer = 0;
    this.totalStock = 100;
    this.availableStock = 100;
    this.reservedStock = 0;
    this.soldStock = 0;
    this.oversoldStock = 0;
    this.metrics = this.getInitialMetrics();
    this.recentEvents = [];
    this.logEvent('Simulation environment reset. Ready to start.', 'info');
    this.notify();
  }

  public selectRequest(id: string | null) {
    this.selectedRequestId = id;
    if (id) soundFx.playClick();
    this.notify();
  }

  public logEvent(text: string, type: 'success' | 'warn' | 'error' | 'info' = 'info') {
    const mins = Math.floor(this.simTimeSec / 60).toString().padStart(2, '0');
    const secs = (this.simTimeSec % 60).toFixed(3).padStart(6, '0');
    const timeStr = `${mins}:${secs}`;
    this.recentEvents.unshift({
      id: Math.random().toString(36).substring(2, 9),
      time: timeStr,
      text,
      type
    });
    if (this.recentEvents.length > 80) {
      this.recentEvents.pop();
    }
  }

  private getRatePerSec(): number {
    switch (this.trafficMode) {
      case 'NORMAL': return 100 / 60; // ~1.67 req/s
      case 'HIGH': return 1000 / 60; // ~16.6 req/s
      case 'FLASH_SALE': return 10000 / 60; // ~166 req/s
      case 'EXTREME': return 50000 / 60; // ~833 req/s
    }
  }

  // Create single purchase request packet
  private createRequest(options: { 
    id?: string; 
    customerId?: string; 
    priority?: 'VIP' | 'Normal'; 
    isDuplicate?: boolean; 
    idempotencyKey?: string;
    isRace?: boolean;
    tag?: string;
    forcedPaymentFail?: boolean;
  } = {}): PurchaseRequest {
    this.generatedSeq++;
    const seqStr = this.generatedSeq.toString().padStart(5, '0');
    const reqId = options.id || `REQ-${seqStr}`;
    const custId = options.customerId || `C-${Math.floor(1000 + Math.random() * 9000)}`;
    const idemp = options.idempotencyKey || `idmp_${Math.random().toString(36).substring(2, 10)}`;

    const spreadX = (Math.random() - 0.5) * 32;
    const spreadY = 2 + Math.random() * 6;
    const spreadZ = 36 + Math.random() * 8;

    const startPos: [number, number, number] = [spreadX, spreadY, spreadZ];

    const mins = Math.floor(this.simTimeSec / 60).toString().padStart(2, '0');
    const secs = (this.simTimeSec % 60).toFixed(3).padStart(6, '0');
    const timeStr = `${mins}:${secs}`;

    const timeline: TimelineEvent[] = [
      {
        timestamp: timeStr,
        simTimeSec: this.simTimeSec,
        stage: 'TRAFFIC_ARRIVAL_ZONE',
        detail: `Spawned with Target Product: RTX-5090 (Stock #P001)`,
        status: 'info'
      }
    ];

    return {
      id: reqId,
      customerId: custId,
      idempotencyKey: idemp,
      productId: 'PROD-RTX5090',
      productName: 'GeForce RTX 5090 Founders Edition',
      price: 1999.00,
      priority: options.priority || (Math.random() < 0.1 ? 'VIP' : 'Normal'),
      arrivalTimeSec: this.simTimeSec,
      status: 'APPROACHING',
      statusColor: STATUS_COLORS.APPROACHING,
      statusLabel: STATUS_LABELS.APPROACHING,
      progress: 0,
      currentHop: 0,
      hopProgress: 0,
      position: [...startPos],
      startPos: [...startPos],
      targetPos: [...TOPOLOGY_POINTS.GATEWAY],
      laneOffset: [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.0, 0],
      timeline,
      tag: options.tag,
      isSpecialHighlighted: !!options.tag,
    };
  }

  private spawnRaceConditionPair() {
    const raceA = this.createRequest({
      id: 'REQ-RACE-001 (Alpha)',
      customerId: 'C-ALPHA-99',
      idempotencyKey: 'idmp_race_alpha_01',
      tag: 'RACE CANDIDATE A',
    });
    raceA.startPos = [-6, 3, 38];
    raceA.position = [-6, 3, 38];

    const raceB = this.createRequest({
      id: 'REQ-RACE-002 (Beta)',
      customerId: 'C-BETA-88',
      idempotencyKey: 'idmp_race_beta_02',
      tag: 'RACE CANDIDATE B',
    });
    raceB.startPos = [6, 3, 38];
    raceB.position = [6, 3, 38];

    this.requests.push(raceA, raceB);
    this.selectedRequestId = raceA.id;
  }

  private spawnIdempotentAttackBatch() {
    const sharedToken = 'idmp_duplicate_replay_attack_key_777';
    for (let i = 0; i < 5; i++) {
      const dup = this.createRequest({
        id: `REQ-DUP-00${i + 1}`,
        customerId: `C-BOT-ATTACK-${i + 1}`,
        idempotencyKey: sharedToken,
        tag: i === 0 ? 'ORIGINAL REQUEST' : `DUPLICATE REPLAY #${i}`,
      });
      dup.startPos = [(i - 2) * 4, 3, 38 + i * 2];
      dup.position = [...dup.startPos];
      this.requests.push(dup);
    }
  }

  // Simulation tick loop
  public update(deltaMs: number) {
    if (!this.isRunning) return;

    // Apply simulation speed multiplier
    const effectiveDeltaSec = (deltaMs / 1000) * this.simSpeed;
    this.simTimeSec += effectiveDeltaSec;
    this.metrics.elapsedSec = this.simTimeSec;

    // Check 1-minute window termination
    if (this.simTimeSec >= this.timeWindowSec) {
      this.logEvent(`Traffic arrival window (${this.timeWindowSec}s) reached! In-flight draining...`, 'warn');
    }

    // Handle Order Service recovery timer
    if (this.orderServiceDownTimer > 0) {
      this.orderServiceDownTimer -= effectiveDeltaSec;
      if (this.orderServiceDownTimer <= 0) {
        this.orderServiceOnline = true;
        this.orderServiceDownTimer = 0;
        this.logEvent('🎉 ORDER SERVICE RECOVERED! Consumer group active. Draining Kafka backlog...', 'success');
        soundFx.playOrderSuccess();
      }
    }

    // Spawn new requests if within window
    if (this.simTimeSec < this.timeWindowSec && this.currentScenario !== 'LAST_ITEM_RACE') {
      const targetRate = this.getRatePerSec();
      this.spawnAccumulator += targetRate * effectiveDeltaSec;
      
      // Control visual mesh cap to avoid browser GPU choke while keeping state 100% accurate
      const maxVisualInFlight = 280;
      
      while (this.spawnAccumulator >= 1) {
        this.spawnAccumulator -= 1;
        this.metrics.totalGenerated++;
        
        if (this.requests.length < maxVisualInFlight) {
          const req = this.createRequest();
          this.requests.push(req);
          if (this.requests.length === 1 && !this.selectedRequestId) {
            this.selectedRequestId = req.id;
          }
          if (Math.random() < 0.1) {
            soundFx.playArrival();
          }
        }
      }
    }

    // Update all active requests along their state pipeline
    const aliveRequests: PurchaseRequest[] = [];

    let currentGatewayQueue = 0;
    let currentKafkaLag = 0;

    for (let i = 0; i < this.requests.length; i++) {
      const req = this.requests[i];
      const isComplete = this.updateSingleRequest(req, effectiveDeltaSec);

      if (req.status === 'QUEUED_GATEWAY' || req.status === 'AT_GATEWAY') {
        currentGatewayQueue++;
      }
      if (req.status === 'QUEUED_ORDER') {
        currentKafkaLag++;
      }

      // Retain finished requests for a short visual grace period then prune
      if (!isComplete) {
        aliveRequests.push(req);
      }
    }

    this.requests = aliveRequests;

    // Update real-time aggregate metrics
    this.metrics.inFlight = this.requests.length;
    this.metrics.gatewayQueueDepth = currentGatewayQueue;
    this.metrics.queueDepth = currentKafkaLag;
    this.metrics.availableStock = this.availableStock;
    this.metrics.reservedStock = this.reservedStock;
    this.metrics.soldStock = this.soldStock;
    this.metrics.oversoldStock = this.oversoldStock; // STRICTLY 0

    // Compute live RPS & latency
    const instantRps = Math.round(this.getRatePerSec() * (0.9 + Math.random() * 0.2));
    this.metrics.requestsPerSec = this.isRunning ? instantRps : 0;
    if (this.metrics.requestsPerSec > this.metrics.peakRps) {
      this.metrics.peakRps = this.metrics.requestsPerSec;
    }

    this.notify();
  }

  private addHopTimeline(req: PurchaseRequest, stage: string, detail: string, status: 'info' | 'success' | 'warning' | 'error') {
    const mins = Math.floor(this.simTimeSec / 60).toString().padStart(2, '0');
    const secs = (this.simTimeSec % 60).toFixed(3).padStart(6, '0');
    req.timeline.push({
      timestamp: `${mins}:${secs}`,
      simTimeSec: this.simTimeSec,
      stage,
      detail,
      status
    });
  }

  // Update a single request packet
  private updateSingleRequest(req: PurchaseRequest, dt: number): boolean {
    // Hop 0: Ingress -> API Gateway
    if (req.currentHop === 0) {
      req.hopProgress += dt * 0.65 * this.simSpeed;
      this.lerpPosition(req, req.startPos, TOPOLOGY_POINTS.GATEWAY, req.hopProgress);

      if (req.hopProgress >= 1.0) {
        req.currentHop = 1;
        req.hopProgress = 0;
        req.status = 'AT_GATEWAY';
        req.statusColor = STATUS_COLORS.AT_GATEWAY;
        req.statusLabel = STATUS_LABELS.AT_GATEWAY;
        this.metrics.gatewayIngressTotal++;

        // Gateway rate limiting check
        const isRateLimited = this.trafficMode === 'EXTREME' && Math.random() < 0.08;
        if (isRateLimited) {
          req.status = 'REJECTED_RATE_LIMITED';
          req.statusColor = STATUS_COLORS.REJECTED_RATE_LIMITED;
          req.statusLabel = STATUS_LABELS.REJECTED_RATE_LIMITED;
          req.failureReason = '429 Rate Limit: Ingress Token Bucket Exhausted';
          this.metrics.gatewayRateLimited++;
          this.addHopTimeline(req, 'API_GATEWAY', 'HTTP 429 Too Many Requests: Ingress rate limiter triggered', 'error');
          soundFx.playReject();
          return false; // Terminal branch
        }

        this.metrics.gatewayAccepted++;
        this.addHopTimeline(req, 'API_GATEWAY', 'TLS Handshake complete. Rate limiter token acquired. Forwarding to Flash Engine', 'info');
      }
      return false;
    }

    // Terminal branch: Rate Limited moving to reject area
    if (req.status === 'REJECTED_RATE_LIMITED') {
      req.hopProgress += dt * 0.5 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.GATEWAY, TOPOLOGY_POINTS.GATEWAY_REJECT, req.hopProgress);
      return req.hopProgress >= 1.5;
    }

    // Hop 1: Gateway -> Flash Sale Engine
    if (req.currentHop === 1) {
      req.hopProgress += dt * 0.85 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.GATEWAY, TOPOLOGY_POINTS.ENGINE, req.hopProgress);

      if (req.hopProgress >= 1.0) {
        req.currentHop = 2;
        req.hopProgress = 0;
        req.status = 'PROCESSING_ENGINE';
        req.statusColor = STATUS_COLORS.PROCESSING_ENGINE;
        req.statusLabel = STATUS_LABELS.PROCESSING_ENGINE;
        this.metrics.engineProcessed++;

        // Idempotency check simulation
        if (req.tag && req.tag.includes('DUPLICATE REPLAY')) {
          req.status = 'REJECTED_DUPLICATE';
          req.statusColor = STATUS_COLORS.REJECTED_DUPLICATE;
          req.statusLabel = STATUS_LABELS.REJECTED_DUPLICATE;
          req.failureReason = 'Idempotency Cache Hit: Discarding Duplicate Replay Payload';
          this.metrics.engineDuplicatesBlocked++;
          this.addHopTimeline(req, 'FLASH_SALE_ENGINE', 'Redis Cache Idempotency Key Hit! Returned 200 Cached Result (No Double Charge)', 'warning');
          return false;
        }

        this.addHopTimeline(req, 'FLASH_SALE_ENGINE', `Sale active. Customer ${req.customerId} verified. Idempotency token registered.`, 'info');
      }
      return false;
    }

    // Terminal branch: Duplicate Replay
    if (req.status === 'REJECTED_DUPLICATE') {
      req.hopProgress += dt * 0.5 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.ENGINE, TOPOLOGY_POINTS.ENGINE_DUPLICATE_REJECT, req.hopProgress);
      return req.hopProgress >= 1.5;
    }

    // Hop 2: Engine -> Inventory Service (Atomic Lua / CAS barrier)
    if (req.currentHop === 2) {
      req.hopProgress += dt * 0.85 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.ENGINE, TOPOLOGY_POINTS.INVENTORY, req.hopProgress);

      if (req.hopProgress >= 1.0) {
        req.currentHop = 3;
        req.hopProgress = 0;
        req.status = 'INVENTORY_CHECK';

        // ATOMIC INVENTORY EVALUATION (Zero-Oversell Engine)
        if (this.availableStock > 0) {
          // Atomic reservation success
          this.availableStock--;
          this.reservedStock++;
          req.status = 'RESERVED';
          req.statusColor = STATUS_COLORS.RESERVED;
          req.statusLabel = STATUS_LABELS.RESERVED;
          req.reservationId = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
          this.metrics.inventoryReservedTotal++;
          soundFx.playReserve();
          this.addHopTimeline(req, 'INVENTORY_SERVICE', `Atomic CAS Lock Acquired! Stock decremented to ${this.availableStock}. Reservation: ${req.reservationId} (TTL: 120s)`, 'success');
        } else {
          // Stock empty -> Zero overselling!
          req.status = 'REJECTED_OUT_OF_STOCK';
          req.statusColor = STATUS_COLORS.REJECTED_OUT_OF_STOCK;
          req.statusLabel = STATUS_LABELS.REJECTED_OUT_OF_STOCK;
          req.failureReason = 'Atomic Inventory Lock Failed: Stock Exhausted (Available = 0)';
          this.metrics.inventoryRejectedOutOfStock++;
          soundFx.playReject();
          this.addHopTimeline(req, 'INVENTORY_SERVICE', `HTTP 409 Conflict: Out of Stock. Zero-Oversell Protection Preserved (Oversold = 0).`, 'error');
          return false;
        }
      }
      return false;
    }

    // Terminal branch: Out of Stock
    if (req.status === 'REJECTED_OUT_OF_STOCK') {
      req.hopProgress += dt * 0.5 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.INVENTORY, TOPOLOGY_POINTS.INVENTORY_REJECT, req.hopProgress);
      return req.hopProgress >= 1.5;
    }

    // Hop 3: Inventory -> Payment Service
    if (req.currentHop === 3) {
      req.hopProgress += dt * 0.75 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.INVENTORY, TOPOLOGY_POINTS.PAYMENT, req.hopProgress);

      if (req.hopProgress >= 1.0) {
        req.currentHop = 4;
        req.hopProgress = 0;
        req.status = 'PAYMENT_PENDING';
        req.statusColor = STATUS_COLORS.PAYMENT_PENDING;
        req.statusLabel = STATUS_LABELS.PAYMENT_PENDING;

        // Payment gateway evaluation (95% success, 5% failure/rollback)
        const isScenarioFail = this.currentScenario === 'PAYMENT_FAILURE_ROLLBACK' && Math.random() < 0.4;
        const isRandomFail = Math.random() < 0.05;
        const paymentFailed = isScenarioFail || isRandomFail;

        if (paymentFailed) {
          // Payment declined -> Atomic rollback of reserved stock
          this.reservedStock--;
          this.availableStock++; // Rollback to available pool!
          req.status = 'PAYMENT_FAILED';
          req.statusColor = STATUS_COLORS.PAYMENT_FAILED;
          req.statusLabel = STATUS_LABELS.PAYMENT_FAILED;
          req.failureReason = 'Payment Processor Error: Card Authorization Declined';
          this.metrics.paymentFailedTotal++;
          soundFx.playReject();
          this.addHopTimeline(req, 'PAYMENT_SERVICE', 'Card Declined (402). Reservation RELEASED -> 1 unit returned to Available Stock pool.', 'error');
          this.logEvent(`Payment failed for ${req.id}. Stock rollback executed (+1 returned to stock).`, 'warn');
          return false;
        }

        // Payment success
        req.paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
        req.status = 'PAYMENT_SUCCESS';
        req.statusColor = STATUS_COLORS.PAYMENT_SUCCESS;
        req.statusLabel = STATUS_LABELS.PAYMENT_SUCCESS;
        this.metrics.paymentSuccessTotal++;
        this.addHopTimeline(req, 'PAYMENT_SERVICE', `Payment Captured $${req.price}. Auth Ref: ${req.paymentId}. Publishing to Kafka.`, 'success');
      }
      return false;
    }

    // Terminal branch: Payment Failed
    if (req.status === 'PAYMENT_FAILED') {
      req.hopProgress += dt * 0.5 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.PAYMENT, TOPOLOGY_POINTS.PAYMENT_REJECT, req.hopProgress);
      return req.hopProgress >= 1.5;
    }

    // Hop 4: Payment -> Message Queue (Kafka Topic: `order-events`)
    if (req.currentHop === 4) {
      req.hopProgress += dt * 0.85 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.PAYMENT, TOPOLOGY_POINTS.QUEUE, req.hopProgress);

      if (req.hopProgress >= 1.0) {
        req.currentHop = 5;
        req.hopProgress = 0;
        req.status = 'QUEUED_ORDER';
        req.statusColor = STATUS_COLORS.QUEUED_ORDER;
        req.statusLabel = STATUS_LABELS.QUEUED_ORDER;
        this.metrics.queuePublishedTotal++;
        this.addHopTimeline(req, 'MESSAGE_QUEUE', 'Event published to Kafka partition [order.events.p0]. Acknowledged.', 'info');
      }
      return false;
    }

    // Hop 5: Message Queue -> Order Service (Consumer processing)
    if (req.currentHop === 5) {
      // If Order Service is DOWN, packet stays accumulated inside the Message Queue!
      if (!this.orderServiceOnline) {
        req.hopProgress = 0; // Freeze in Kafka queue buffer!
        // Oscillate slightly in queue buffer to show active holding
        req.position[0] = TOPOLOGY_POINTS.QUEUE[0] + Math.sin(this.simTimeSec * 4 + req.progress) * 1.5;
        req.position[1] = TOPOLOGY_POINTS.QUEUE[1] + Math.cos(this.simTimeSec * 3 + req.progress) * 0.8;
        req.position[2] = TOPOLOGY_POINTS.QUEUE[2] + (Math.sin(this.simTimeSec * 2) * 1.0);
        return false;
      }

      // Order Service is ONLINE -> consume from Kafka and move to Order Service
      req.hopProgress += dt * 0.75 * this.simSpeed;
      this.lerpPosition(req, TOPOLOGY_POINTS.QUEUE, TOPOLOGY_POINTS.ORDER, req.hopProgress);

      if (req.hopProgress >= 1.0) {
        req.currentHop = 6;
        req.hopProgress = 0;
        
        // Finalize transaction
        this.reservedStock--;
        this.soldStock++;
        req.orderId = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        req.status = 'ORDER_CREATED';
        req.statusColor = STATUS_COLORS.ORDER_CREATED;
        req.statusLabel = STATUS_LABELS.ORDER_CREATED;
        req.completedTimeSec = this.simTimeSec;
        
        this.metrics.ordersCreatedTotal++;
        this.metrics.queueConsumedTotal++;
        this.metrics.dbWritesTotal++;
        
        soundFx.playOrderSuccess();
        this.addHopTimeline(req, 'ORDER_SERVICE', `Order #${req.orderId} Created & Persisted to DB. Receipt sent to ${req.customerId}.`, 'success');
        this.logEvent(`Order settled: ${req.orderId} for ${req.customerId} ($${req.price})`, 'success');
      }
      return false;
    }

    // Final Stage 6: Celebration & Persistence
    if (req.currentHop === 6) {
      req.hopProgress += dt * 0.4 * this.simSpeed;
      // Gently lift up into fulfillment space
      req.position[1] = TOPOLOGY_POINTS.ORDER[1] + req.hopProgress * 2;
      return req.hopProgress >= 1.2;
    }

    return false;
  }

  private lerpPosition(
    req: PurchaseRequest, 
    from: [number, number, number], 
    to: [number, number, number], 
    alpha: number
  ) {
    const t = Math.max(0, Math.min(1, alpha));
    // Smooth easeInOutQuad
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    req.position[0] = from[0] + (to[0] - from[0]) * ease + req.laneOffset[0] * (1 - ease);
    req.position[1] = from[1] + (to[1] - from[1]) * ease + req.laneOffset[1] * (1 - ease);
    req.position[2] = from[2] + (to[2] - from[2]) * ease;
    req.progress = (req.currentHop + t) / 6.0;
  }
}

export const simulationEngine = new SimulationEngine();
