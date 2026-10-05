# FlashFlow 3D — Concurrent Purchase Traffic Simulator
**SALESTORM / SYSCRAFTERS 2026 Flash-Sale System Design Simulation**

`FlashFlow 3D` is a high-performance interactive 3D traffic-arrival and system topology simulation that visually demonstrates how thousands of purchase requests arrive over a configurable 1-minute window, travel through ingress conduits to the API Gateway, and progress through each stage of the flash-sale pipeline.

---

## 🌟 Key Features

1. **Physical Traffic Arrival Movement (No Teleportation):**
   - Requests spawn across the Traffic Arrival Zone with unique timestamps within the 60-second window.
   - Packets physically traverse glowing ingress conduits toward the API Gateway.

2. **Accurate Discrete-Event Lifecycle:**
   - `APPROACHING` ➔ `AT_GATEWAY` ➔ `PROCESSING_ENGINE` ➔ `INVENTORY_CHECK` ➔ `RESERVED` ➔ `PAYMENT_PENDING` ➔ `PAYMENT_SUCCESS` ➔ `QUEUED_ORDER (Kafka)` ➔ `ORDER_CREATED`
   - Rejection branches: `429 Rate Limited`, `409 Out of Stock`, `402 Payment Declined`, `Cached Idempotency Replay`.

3. **Strict Zero-Oversell Protection:**
   - Atomic in-memory CAS prevents overselling even with 50,000 req/min bursts.
   - Live 3D Stock Vault gauge (100 ➔ 0) and physical Out-of-Stock barrier.

4. **Clickable Request Packets & 3D Tracker:**
   - Click any packet in the 3D scene to open the microsecond audit trail and lifecycle timeline.
   - Toggle **"Follow 3D"** to smoothly lock the camera onto an individual request's journey through the architecture.

5. **Jury Demonstration Scenarios:**
   - **10,000 Users Flash Sale Burst**
   - **Last Item Race (Stock = 1 Collision Test)**
   - **Order Service Down (30s Outage with Kafka Accumulation & Recovery)**
   - **Payment Failure & Atomic Stock Rollback**
   - **Idempotency Attack Storm**

---

## 🚀 Running the App

```bash
npm install
npm run dev
```

Open [http://localhost:5174/](http://localhost:5174/) in your browser.
