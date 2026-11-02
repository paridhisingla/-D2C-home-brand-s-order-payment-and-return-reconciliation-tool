# KnitTrack Tiruppur

> Production, TNA Milestones & Run-Rate Delay Projection Engine for Tiruppur Knitwear Exporters (Company A)

[![Build & Tests](https://img.shields.io/badge/tests-24%20passed-emerald)](https://github.com/paridhisingla/Knitwear-exporter-s-production-order-tracking-app-with-buyer-view)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![Express & MongoDB](https://img.shields.io/badge/Express-Backend-blue)](https://expressjs.com/)

---

## 👔 The Business Problem

Company A (Tiruppur knitwear exporter, ₹95–110 Cr/yr, 3 own units + subcontract printing & washing, 900 workers) suffers **₹1.08 Crore annual avoidable loss** from reactive tracking:
- **8% Late Shipments (40 orders/yr)**
- **15 orders forced into air freight @ ₹3.5 Lakh extra = ₹52.5 Lakh**
- **25 orders penalized with 5% buyer discount = ₹26.25 Lakh**
- **12 merchandisers chasing status 2 hrs/day = ₹28.8 Lakh**

**KnitTrack** replaces disconnected spreadsheets and phone calls with real-time floor updates and an algorithmic run-rate calculation that provides delay warnings **2 weeks early, not 2 days before dispatch**.

---

## 🚀 Key Features Shipped

1. **Dedicated Role-Based Authentication & Provisioning (`/login`, `/signup`)**:
   - 1-Click evaluator presets for all 5 roles (Senior Merchandiser, Floor Supervisor [Tamil], UK Buyer B, German Buyer C, Managing Director).
   - JWT authentication with rate limiting and password peek toggle.
   - Overseas Buyer Access PIN direct portal (`BUYER-B-2026` / `BUYER-C-2026`).
   - Self-service employee signup with factory unit assignment and Tamil/English preference.
2. **Order Setup & TNA Template Generator (`/orders/new`)**: Automatically computes backward milestone schedules from ex-factory dates across 9 Tiruppur garment stages.
3. **Supervisor Mobile Floor Update (`/supervisor`)**: Engineered for 2–3 GB RAM budget Android phones; big touch numbers, camera photo proof, voice note recorder, and instant offline queue with sync badge.
4. **Run-Rate Delay Projection Engine (`/orders/[id]`)**: Exposes transparent daily velocity arithmetic (`Pieces Needed / Working Days Left vs Actual Floor Pace`), calculating shortfall and projected delays excluding Sundays.
5. **The "When AI is Wrong" Protocol (`/review`)**: AI translates Tamil floor notes into English reason categories. Unconfirmed notes are quarantined from buyers; merchandisers can verify or override categories in the AI Review Queue.
6. **Buyer Portal (`/buyer`)**: UK and EU buyers (Company B, Company C) view their own milestones, photos, and date compliance history with strict tenant scoping (zero cross-tenant leakage).
7. **Date Revision Audit Compliance**: Permanent audit trail recording every ex-factory date alteration with required formal reasons.
8. **Executive / MD Loss Dashboard (`/executive`)**: High-level tracking of ₹ at risk, capacity health across 3 factories, and late shipment reduction metrics.
9. **Weekly Status Exports (`/api/export`)**: Instant Excel CSV status export per buyer.

---

## 🧪 Automated Test Suite (24 Tests)

Run the automated test suite with Node's native runner:
```bash
npm test
```
All 24 tests pass in ~400ms, covering:
- **Run-Rate Math Engine**: 6-day factory calendar (skipping Sundays), piece deficit calculations, critical RED delay thresholds, and ₹3.5L air freight penalty triggers.
- **Tamil NLP Textile Classifier**: Tamil script tokenization, Tanglish phonetic mapping, confidence scoring, and low-confidence quarantine (< 75%).
- **Multi-Tenant Buyer Isolation**: Verification that Buyer B never sees Buyer C styles or quantities.
- **Immutable Date Change Audit**: Permanent timestamping, formal reason enforcement, and revision tracking.
- **Express Backend & Zod Validation**: Input schemas, JWT signing, role middleware (blocking supervisors from order creation), and idempotent `clientUuid` stage update submission.

---

## 🛠️ Quick Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run test suite (24 tests)
npm test

# 3. Start Next.js frontend & API
npm start
# or development mode:
npm run dev

# 4. Optional: Start dedicated Express + MongoDB backend
npm run server
```
Open [http://localhost:3000](http://localhost:3000).

For full reviewer login details, deployment configurations, and environment variable requirements, see [`deployment.md`](./deployment.md) and [`TECHNICAL_DESIGN_DOCUMENT.md`](./TECHNICAL_DESIGN_DOCUMENT.md).
