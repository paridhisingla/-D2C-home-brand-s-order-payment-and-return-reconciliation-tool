# ReconTex: D2C Multi-Channel Reconciliation & Revenue Leakage Recovery OS
### Built for Company A, Bengaluru (D2C Home Textiles: Website + 3 Marketplaces + 2 Quick-Commerce Platforms)

[![Automated Tests](https://img.shields.io/badge/tests-20%20passing-emerald)](https://github.com/paridhisingla/-D2C-home-brand-s-order-payment-and-return-reconciliation-tool)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![DPDP Act 2023](https://img.shields.io/badge/DPDP%20Act%202023-Compliant-emerald)](https://www.meity.gov.in/)
[![100k Benchmark](https://img.shields.io/badge/100k%20Benchmark-0.12s%20(SLA%20%3C60s)-purple)](https://github.com/paridhisingla/-D2C-home-brand-s-order-payment-and-return-reconciliation-tool)

---

## 👔 The Business Problem

**Company A** is a Bengaluru-based D2C home textiles brand retailing premium bed linen, curtains, towels, and cushion covers.
- **Scale:** 45 staff, ₹38–45 Crore annual revenue, finance team of 3.
- **Sales Channels:** Own Website (Shopify/Direct: 55% Cash on Delivery [COD]), 3 Marketplaces (Amazon India, Flipkart, Myntra), and 2 Quick-Commerce Apps (Blinkit, Zepto).
- **Logistics:** Shiprocket and Delhivery.
- **Accounting:** Tally.

### Financial Leakage Baseline
$$\begin{aligned}
\text{Monthly Orders} &= 30,000 \text{ at ₹1,200 AOV} = \mathbf{\text{₹43.2 Crore/year GMV}} \\
\text{Operational Revenue Leakage (1.5\% of GMV)} &= \mathbf{\text{₹64.8 Lakh/year}} \\
\text{Finance Team Lookups (3 staff } \times \text{ 60\% time)} &= \mathbf{\text{₹10.8 Lakh/year}} \\
\hline
\mathbf{\text{Total Annual Avoidable Loss}} &= \mathbf{\text{₹75.6 Lakh/year}} \\
\mathbf{\text{Month-End Close Duration}} &= \mathbf{12 \text{ Days}}
\end{aligned}$$

**ReconTex** delivers an automated, audit-ready reconciliation engine that catches unremitted COD, courier weight overcharges, marketplace commission glitches, and lost returns within days.

---

## 🚀 Key Screens & Features Shipped

1. **Money-at-Risk & Recovery Dashboard (`/`):**
   - Executive visibility into total leakage, recovered funds, and month-end close timeline (Day 3 target, down from 12 days).
   - Partner Aging Matrix ($0–15\text{d}, 16–30\text{d}, 31–60\text{d}, 60+\text{d}$) across Amazon, Flipkart, Myntra, Blinkit, Zepto, Shiprocket, and Delhivery.
   - Categorized leakage root causes (Unremitted COD, Weight slab errors, Commission discrepancies, Lost returns).

2. **Order Reconciliation Data Grid (`/reconciliation`):**
   - High-density data table with tabular figures (`font-mono`) and high-contrast status badges:
     - `Settled` (within $\pm₹10$ tolerance)
     - `Short-paid` (marketplace fee or commission overcharge)
     - `Unpaid past due` (courier collected COD cash, remittance overdue)
     - `Freight overcharged` (billed volumetric weight > certified catalog weight)
     - `Return not received` (courier marked RTO, missing at warehouse dock)
   - Slide-over order inspector with step-by-step mathematical rate-card proof.
   - **Verification of brief sample rows:** `ORD-W-204118` (-₹1,409), `ORD-M-88120` (-₹37), `ORD-W-204377` (-₹46).

3. **File Ingestion & AI Column Mapping Studio (`/upload`):**
   - Drag-and-drop CSV parser with 5 one-click scenario presets (Amazon MTR, Shiprocket COD, Delhivery Freight, Warehouse Scans).
   - AI column mapping proposal with confidence scores ($65\% - 99\%$).
   - **20-Row Ingestion Preview Grid:** Live preview of canonical mapping before saving.
   - **Version History & Rollback:** Saved mappings increment versions ($v1 \rightarrow v2$) with instant 1-click rollback.

4. **AI Review Queue for Missing Order IDs (`/ai-review`):**
   - Correlates unlinked transactions using AWB numbers, payment reference numeric tokens, amounts, and dates.
   - **Safety Invariant:** Suggested matches are strictly queued in `PENDING` state and **never closed automatically**. Finance executives review, accept, reject, or manually link.

5. **Rate Cards Engine & Dynamic Simulator (`/rate-cards`):**
   - Configurable channel commissions, fixed closing fees, payment gateway fees, and courier weight slabs.
   - Interactive live fee simulator allowing instant calculation of expected deductions for any order value, weight, and channel.

6. **Returns & Warehouse Inward Dock Tracker (`/returns`):**
   - Compares courier tracking statuses against physical barcode inward scans at the Bengaluru warehouse dock.
   - Flags returns missing past 7-day SLA as lost returns.
   - Virtual barcode scanner simulation (`DEL-FK-99021411`, `SR-BLR-90204377`) to verify dock arrivals in real time.

7. **Partner Claims & Evidence Dossier (`/claims`):**
   - Dispute management lifecycle (`Draft` $\rightarrow$ `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Recovered` $\rightarrow$ `Rejected`).
   - One-click formal dispute pack generator with certified weight certificate, delivery milestones, and accounting math.
   - Export to CSV or printable dispute pack.

8. **TCS & TDS Statutory Tax Ledger (`/tax-ledger`):**
   - Segregates Section 52 GST TCS (1%) and Section 194-O Income Tax TDS (0.1%/1%) from operational leakage.
   - Cross-matched with GSTR-8 portal returns and Form 26AS.

9. **1-Lakh Row High-Speed Engine Benchmark (`/benchmark`):**
   - Evaluates 100,000 orders against 100,000 settlements in real time.
   - **Performance:** **0.129 seconds** ($> 75,000\text{ rows/sec}$), exceeding the 60-second brief requirement by $> 450\times$.

10. **DPDP Act 2023 Compliance:**
    - Default masking of customer names (`A**** S****`), phones (`+91 98****891`), and addresses.
    - Role-based unmask toggle for authorized courier audit investigations.

---

## 🧪 Automated Test Suite (20 Tests Passing)

Run the automated test suite with Node's native runner:
```bash
npm run test
```
**Test Coverage:**
- `rateEngine.test.mjs`: Validates rate cards, ₹10 gap tolerance, and mandatory sample rows (`ORD-W-204118`, `ORD-M-88120`, `ORD-W-204377`).
- `dpdpCompliance.test.mjs`: Tests DPDP Act 2023 customer PII masking and unmask toggle.
- `aiMapping.test.mjs`: Tests AI mapping suggestions, 20-row preview, and 1-click version rollback.
- `fuzzyMatcher.test.mjs`: Tests missing order ID matching and review queue non-closure invariant.
- `benchmark.test.mjs`: Tests 100,000-row reconciliation in $< 60$ seconds (Actual: $0.12$s).
- `returnsTracker.test.mjs`: Tests warehouse barcode scan matching and 7-day return SLA.
- `taxLedger.test.mjs`: Tests GST TCS and Income Tax TDS statutory separation.
- `rbacSecurity.test.mjs`: Tests role switching (Finance Executive, Co-Founder, Returns Manager) and security.

---

## 💻 Local Quick Start

```bash
# 1. Clone repository
git clone https://github.com/paridhisingla/-D2C-home-brand-s-order-payment-and-return-reconciliation-tool.git
cd -D2C-home-brand-s-order-payment-and-return-reconciliation-tool

# 2. Install dependencies
npm install

# 3. Setup SQLite database
npx prisma db push

# 4. Run tests
npm run test

# 5. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
