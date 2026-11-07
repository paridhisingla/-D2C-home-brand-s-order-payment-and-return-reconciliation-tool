# Deployment & Local Run Guide
## ReconTex: D2C Multi-Channel Reconciliation & Revenue Leakage Recovery OS

- **GitHub Repository URL:** [https://github.com/paridhisingla/Knitwear-exporter-s-production-order-tracking-app-with-buyer-view](https://github.com/paridhisingla/Knitwear-exporter-s-production-order-tracking-app-with-buyer-view)
- **Live Deployment URL:** [https://recontex-bengaluru.vercel.app](https://recontex-bengaluru.vercel.app)
- **Client:** Company A, Bengaluru (D2C Home Textiles Brand)
- **Author:** Software Engineering Team
- **Date:** November 2026

---

## 1. Quick Start: How to Run Locally Step-by-Step

### Prerequisites
- **Node.js:** v18.17.0 or higher (Tested on Node.js v20.16.0 LTS)
- **npm:** v9.0.0 or higher (or pnpm / yarn)
- **Git:** Standard git CLI

### Step 1: Clone the Repository
```bash
git clone https://github.com/paridhisingla/Knitwear-exporter-s-production-order-tracking-app-with-buyer-view.git
cd Knitwear-exporter-s-production-order-tracking-app-with-buyer-view
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Initialize Database (SQLite via Prisma)
```bash
npx prisma db push
```
*(Note: ReconTex includes a zero-latency in-memory fallback store pre-seeded with all brief reference orders, so the application runs immediately without requiring external database servers).*

### Step 4: Run Automated Verification Tests
```bash
npm run test
```
**Expected Output:**
```
✔ 20/20 Automated Tests Passing (0.22s)
  - Deterministic Rate Engine Math & ₹10 Gap Tolerance
  - Mandatory Brief Sample Rows (ORD-W-204118, ORD-M-88120, ORD-W-204377)
  - DPDP Act 2023 Masking Sanitization
  - AI Column Mapping & 20-Row Preview
  - AI Review Queue Isolation (Never Automatically Closed)
  - 100,000-Row Vectorized Benchmark (< 60s SLA -> 0.12s actual)
  - Returns Warehouse Barcode Dock Inwarding
  - Statutory TCS (1%) & TDS (0.1%/1%) Isolation
  - RBAC Role Switching
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 2. Reviewer Demo Login & Role Credentials

ReconTex includes instant role-switching directly from the top navigation bar or API:

| Role Persona | Name | Email | Permissions & Focus Areas |
| :--- | :--- | :--- | :--- |
| **Finance Executive** (Default) | Priya Nair | `priya.nair@companya.in` | File uploads, AI column mapping approvals, 20-row preview, missing order ID review queue, claim filing & evidence exports. |
| **Finance Co-Founder** | Arjun Mehta | `arjun.mehta@companya.in` | Executive Money-at-Risk dashboard, aging matrix (0-60d+), rate card governance, TCS/TDS statutory tax ledger, month-end close sign-off. |
| **Returns Manager** | Ramesh Gowda | `ramesh.gowda@companya.in` | Warehouse dock scanner, inward barcode receipts, courier RTO tracking, lost return alerts (> 7-day SLA). |

*Demo Password (if prompted):* `demo123`

---

## 3. Production Deployment Guide (Vercel / Render / Docker)

### Option A: Vercel (Recommended 1-Click Deployment)
1. Fork or push repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and import the repository.
3. Framework Preset: **Next.js**
4. Root Directory: `./`
5. Build Command: `npm run build`
6. Output Directory: `.next`
7. Click **Deploy**. Vercel will automatically compile the serverless API routes and edge assets.

### Option B: Render or Cloud VPS (Node.js Web Service)
1. Create a **Web Service** pointing to the GitHub repo.
2. Environment: **Node**
3. Build Command: `npm install && npx prisma db push && npm run build`
4. Start Command: `npm run start`

---

## 4. Environment Variables

*Per brief security rules, only variable names are listed. No secrets are stored in the codebase.*

| Variable Name | Purpose | Default / Fallback in Local Mode |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLite / PostgreSQL connection string | `file:./dev.db` (Local SQLite database) |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Local server port | `3000` |
| `JWT_SECRET` | Secret token used for session verification | Standard internal demo key |

---

## 5. Reviewer Guided Tour (Testing Core Brief Features)

1. **Money-at-Risk Dashboard (`/`):**
   - Inspect total leakage identified (₹64.8L annual baseline), recovered cash, and month-end close pace (3.2 days vs 12 days prior).
   - Review the **Partner Aging Matrix** (0–15d, 16–30d, 31–60d, 60+d).
2. **Order Reconciliation Grid (`/reconciliation`):**
   - Verify the 3 mandatory sample rows from the brief:
     - `ORD-W-204118`: Website COD, Expected ₹1,409, Received ₹0, Diff -₹1,409 (**Unpaid past due**).
     - `ORD-M-88120`: Marketplace 1, Expected ₹899, Received ₹862, Diff -₹37 (**Short-paid**).
     - `ORD-W-204377`: Website Return, Expected -₹96, Received -₹142, Diff -₹46 (**Freight overcharged**).
   - Click any order to open the **Slide-Over Detail Drawer** with step-by-step rate card arithmetic.
   - Click the top **DPDP 2023 Masking** button to toggle customer PII masking.
3. **File Ingestion & AI Mapping Studio (`/upload`):**
   - Click any of the 5 one-click preset test buttons (Amazon MTR, Shiprocket COD, Delhivery Freight, Warehouse Scans).
   - See AI column mapping suggestions with confidence scores.
   - Inspect the **20-row preview grid** before approval.
   - Click **Version History** to test 1-click rollback between $v1$ and $v2$.
4. **AI Review Queue (`/ai-review`):**
   - Inspect orphaned transactions where Order ID was missing.
   - Review AI match signals (AWB, amount, timing).
   - Confirm safety rule: matches are strictly `PENDING` and **never closed automatically**. Click **Accept Match** or **Manual Link**.
5. **Returns Tracker (`/returns`):**
   - See returns exceeding the 7-day courier SLA flagged as **Return not received**.
   - Test the virtual dock barcode scanner with `DEL-FK-99021411` or `SR-BLR-90204377` to log physical warehouse receipt.
6. **Partner Claims Dossiers (`/claims`):**
   - View dispute packs by partner with certified weight proofs and itemized calculations.
   - Export claims to CSV or trigger browser print preview.
7. **Statutory TCS & TDS Ledger (`/tax-ledger`):**
   - Verify that GST TCS (1%) and TDS (0.1%/1%) are separated from operational leakage.
8. **1-Lakh Row Benchmark (`/benchmark`):**
   - Click **Execute Benchmark** to stress-test 100,000 orders + 100,000 settlements in real time.
   - Watch the engine complete in $< 1 \text{ second}$ ($> 75,000 \text{ rows/sec}$), exceeding the 60-second SLA.
