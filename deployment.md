# KnitTrack Tiruppur — Deployment & Run Guide

Production & TNA Tracking System for Tiruppur Knitwear Exporters (Company A)

---

## 1. Local Setup Instructions (Step-by-Step)

### Prerequisites
- **Node.js**: v18.17.0 or v20.x+ (tested on Node v20.16.0)
- **npm**: v9.x or v10.x (or pnpm/yarn)
- **Git**
- **MongoDB**: MongoDB Atlas URI or local MongoDB (`mongodb://127.0.0.1:27017/knittrack`)

### Step 1: Clone the Repository
```bash
git clone https://github.com/paridhiparidhi/knittrack-tiruppur.git
cd knittrack-tiruppur
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run Database Setup & Seeding
The project provides dual database support:
- **Express + MongoDB / MongoDB Atlas**:
  ```bash
  # Seeds MongoDB with 2 buyers, 1 merchandiser, 2 supervisors, 3 sample orders & multi-day floor logs
  npm run server:seed
  ```
- **Next.js In-Memory & SQLite Layer**:
  Pre-seeded out-of-the-box with `B-PO-88213`, `B-PO-88240`, `C-PO-0488`.

### Step 4: Run Automated Tests
Execute the full test suite (24 tests) covering Run-Rate Math, Tamil NLP Classifier, Buyer Tenant Isolation, Date Change Audits, and Express Zod / Auth / Idempotency validation:
```bash
npm test
```
*Expected result:* 24/24 tests passing (~400ms).

### Step 5: Start Servers

#### Option A: Start Full Next.js Application (Port 3000)
```bash
npm run dev
# Or optimized production mode:
npm start
```
Open [http://localhost:3000](http://localhost:3000).

#### Option B: Start Dedicated Express + MongoDB Backend (Port 5000)
```bash
npm run server
```
Server starts on [http://localhost:5000](http://localhost:5000) with Helmet, Express Rate Limit, Zod input validation, JWT auth, and Mongoose models.

---

## 2. Cloud Deployment & Environment Variables

### Production Hosting Platform
The application is optimized for deployment on **Vercel**, **AWS Amplify**, or **Railway/Render**:
- **Framework Preset**: Next.js (App Router)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Required Environment Variables
*(Per submission rules, variable names only—no secret values committed)*

| Variable Name | Description | Environment |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas cluster connection string | Production / Staging |
| `JWT_SECRET` | Secret key used for Express JWT and buyer token generation | Production |
| `DATABASE_URL` | SQLite file path or PostgreSQL connection string | Production / Staging |
| `NEXTAUTH_SECRET` | Secret key used for session encryption and signing | Production |
| `NEXTAUTH_URL` | Canonical URL of the deployed application | Production |
| `NEXT_PUBLIC_APP_URL` | Base application URL for link sharing & buyer portals | Production |
| `GEMINI_API_KEY` | Optional API key for live Gemini 1.5 Flash Tamil transcription | Production / Staging |

---

## 3. Reviewer Demo Credentials & Role Navigation

The application provides two seamless ways to test all user roles:
1. **Dedicated Sign-In Page**: [`http://localhost:3000/login`](http://localhost:3000/login) with one-click reviewer persona cards.
2. **Instant Role Switcher**: Directly in the top navigation bar dropdown from any page.

| Role Persona | Test User Identity | Default Password | Accessible Views & Features |
|---|---|---|---|
| **Merchandiser** *(Default)* | Karthik Subramanian (`karthik@tiruppurknitwear.com`) | `demo123` | Complete Order Board, Run-Rate Math Drilldown, PO Setup Wizard, Ex-Factory Date Revision Modal, AI Review Queue, Excel CSV Export |
| **Unit Supervisor (Floor)** | Muthusamy (`muthusamy@tiruppurknitwear.com`) | `demo123` | Mobile-optimized floor interface (2-3 GB RAM design), Tamil UI toggle, daily quantity/defect entry, camera/photo upload, Tamil voice note recorder, offline queue sync |
| **Buyer: Company B (UK)** | Sarah Jenkins (`sarah.j@companyb-fashion.co.uk`) | `demo123` | Strictly isolated view of Company B orders only (`B-PO-88213`, `B-PO-88240`), TNA milestones, verified floor photos, date change compliance history, CSV export |
| **Buyer: Company C (Germany)** | Klaus Weber (`klaus.w@companyc-retail.de`) | `demo123` | Strictly isolated view of Company C orders only (`C-PO-0488`), zero cross-buyer leakage |
| **Managing Director (MD)** | V. Sundaram (`md@tiruppurknitwear.com`) | `demo123` | Executive Dashboard: ₹1.08 Crore annual loss tracking, live ₹ exposure at risk, unit capacity utilization |

### Quick Actions for Reviewers:
1. **Reset to Clean Sample Data**: Click the **Rotate/Reset** icon in the top right navbar at any time to instantly restore the pristine client sample state.
2. **Offline Simulation**: In DevTools Network tab, toggle **Offline** while submitting a floor log in the Supervisor Mobile view to test the offline queue badge and local sync.
3. **Simulate Tamil Voice Note**: On `/supervisor`, click any of the "One-Tap Tamil Voice Presets" to populate real Tiruppur factory floor notes (e.g. machine motor breakdown, damp printing ink).
4. **AI Review Override**: Navigate to `/review` to see the original Tamil note beside the English translation, change the category dropdown, and click **Confirm & Publish to Buyer**.
