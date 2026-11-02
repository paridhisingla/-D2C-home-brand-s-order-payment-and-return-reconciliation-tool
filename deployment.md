# KnitTrack Tiruppur — Deployment & Run Guide

Production & TNA Tracking System for Tiruppur Knitwear Exporters (Company A)

---

## 1. Local Setup Instructions (Step-by-Step)

### Prerequisites
- **Node.js**: v18.17.0 or v20.x+ (tested on Node v20.16.0)
- **npm**: v9.x or v10.x (or pnpm/yarn)
- **Git**

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
The application is pre-configured with a dual-persistence layer: SQLite via Prisma as well as an in-memory cached data provider pre-seeded with the client brief's exact purchase orders (`B-PO-88213`, `B-PO-88240`, `C-PO-0488`), 5 units, and compliance date audit records.
```bash
# Optional: Push schema to SQLite database if utilizing persistent file DB
npx prisma db push
```

### Step 4: Run Automated Tests
Execute the comprehensive 16-test suite covering the Run-Rate Math Engine, Tamil NLP Classification, "When AI is Wrong" protocol, Multi-Tenant Buyer Isolation, and Compliance Date Audit Logging:
```bash
npm test
```
*Expected result:* 16/16 tests passing (~200ms).

### Step 5: Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 6: Production Build Verification
To run an optimized production build locally:
```bash
npm run build
npm start
```
The server will start on port 3000.

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
