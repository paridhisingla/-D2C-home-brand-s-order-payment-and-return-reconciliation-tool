# KnitTrack Tiruppur

> Production, TNA Milestones & Run-Rate Delay Projection Engine for Tiruppur Knitwear Exporters (Company A)

[![Build & Tests](https://img.shields.io/badge/tests-16%20passed-emerald)](https://github.com/paridhiparidhi/knittrack-tiruppur)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)

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

1. **Order Setup & TNA Template Generator**: Automatically computes backward milestone schedules from ex-factory dates across 9 Tiruppur garment stages.
2. **Supervisor Mobile Floor Update (Tamil UI)**: Engineered for 2–3 GB RAM budget Android phones; big buttons, camera photo proof, voice note recorder, and instant offline queue with sync badge.
3. **Run-Rate Delay Projection Engine**: Exposes transparent daily velocity arithmetic (`Pieces Needed / Working Days Left vs Actual Floor Pace`), calculating shortfall and projected delays excluding Sundays.
4. **The "When AI is Wrong" Protocol**: AI translates Tamil floor notes into English reason categories. Unconfirmed notes are quarantined from buyers; merchandisers can verify or override categories in the AI Review Queue.
5. **Buyer Portal (Strict Tenant Scoping)**: UK and EU buyers (Company B, Company C) view their own milestones, photos, and date compliance history with zero cross-tenant leakage.
6. **Date Revision Audit Compliance**: Permanent audit trail recording every ex-factory date alteration with required formal reasons.
7. **Executive / MD Loss Dashboard**: High-level tracking of ₹ at risk, capacity health across 3 factories, and late shipment reduction metrics.

---

## 🧪 Automated Test Suite (16 Tests)

Run the automated test suite with Node's native runner:
```bash
npm test
```
Tests cover:
- Run-Rate Math Engine & 6-Day Calendar logic (skipping Sundays)
- Critical RED status and ₹3.5L air freight penalty triggers
- Step-by-step arithmetic formula transparency
- Tamil script & Tanglish NLP classification
- AI low-confidence review flags (< 75%)
- Multi-tenant Buyer isolation & access control gates
- Immutable date change compliance audit logging

---

## 🛠️ Quick Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run test suite
npm test

# 3. Start local server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

For full reviewer login details, deployment configurations, and environment variable requirements, see [`deployment.md`](./deployment.md) and [`TECHNICAL_DESIGN_DOCUMENT.md`](./TECHNICAL_DESIGN_DOCUMENT.md).
