// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { DashboardView } from '@/components/DashboardView';
import { ReconciliationView } from '@/components/ReconciliationView';
import { UploadView } from '@/components/UploadView';
import { AIReviewQueueView } from '@/components/AIReviewQueueView';
import { RateCardsView } from '@/components/RateCardsView';
import { ReturnsTrackerView } from '@/components/ReturnsTrackerView';
import { ClaimsView } from '@/components/ClaimsView';
import { TaxLedgerView } from '@/components/TaxLedgerView';
import { BenchmarkView } from '@/components/BenchmarkView';
import { 
  OrderRecord, 
  RateCard, 
  ColumnMappingConfig, 
  AIReviewItem, 
  ClaimRecord, 
  TaxLedgerRecord, 
  MoneyAtRiskDashboardData, 
  User, 
  UserRole 
} from '@/types';
import { DEMO_USERS } from '@/lib/store';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [maskPII, setMaskPII] = useState<boolean>(true);
  const [initialStatusFilter, setInitialStatusFilter] = useState<string>('ALL');

  // Core Data State
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [reviewQueue, setReviewQueue] = useState<AIReviewItem[]>([]);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [mappings, setMappings] = useState<ColumnMappingConfig[]>([]);
  const [taxLedger, setTaxLedger] = useState<TaxLedgerRecord[]>([]);
  const [dashboardData, setDashboardData] = useState<MoneyAtRiskDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all state from API
  const refreshData = async () => {
    try {
      setLoading(true);
      const [
        ordersRes,
        dashboardRes,
        claimsRes,
        reviewRes,
        rateCardsRes,
        uploadRes,
        taxRes,
        authRes,
      ] = await Promise.all([
        fetch(`/api/reconciliation?maskPII=${maskPII}`).then(r => r.json()),
        fetch('/api/dashboard').then(r => r.json()),
        fetch('/api/claims').then(r => r.json()),
        fetch('/api/ai-review').then(r => r.json()),
        fetch('/api/rate-cards').then(r => r.json()),
        fetch('/api/upload').then(r => r.json()),
        fetch('/api/tax-ledger').then(r => r.json()),
        fetch('/api/auth').then(r => r.json()),
      ]);

      if (ordersRes.orders) setOrders(ordersRes.orders);
      if (dashboardRes.totalGrossTurnover !== undefined) setDashboardData(dashboardRes);
      if (claimsRes.claims) setClaims(claimsRes.claims);
      if (reviewRes.items) setReviewQueue(reviewRes.items);
      if (rateCardsRes.rateCards) setRateCards(rateCardsRes.rateCards);
      if (uploadRes.mappings) setMappings(uploadRes.mappings);
      if (taxRes.records) setTaxLedger(taxRes.records);
      if (authRes.user) setCurrentUser(authRes.user);
    } catch (err) {
      console.error('Error loading ReconTex data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [maskPII]);

  // Role Switcher
  const handleRoleSwitch = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        showToast(`Role switched to ${data.user.name} (${data.user.role})`, 'info');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // DPDP Toggle
  const handleToggleMaskPII = () => {
    const next = !maskPII;
    setMaskPII(next);
    showToast(
      next
        ? 'DPDP Act 2023 Masking Activated: Customer names, phones, addresses masked'
        : 'Audit Mode: Customer personal data unmasked for verified investigation',
      next ? 'success' : 'info'
    );
  };

  // Reset to Pristine Seed Data
  const handleResetSeedData = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || 'Database reset to sample state');
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Raise Claim for an Order Discrepancy
  const handleRaiseClaim = async (orderId: string) => {
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Claim ${data.claim.claimNumber} filed with evidence dossier`, 'success');
        await refreshData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Update Claim Status
  const handleUpdateClaimStatus = async (
    claimId: string,
    status: ClaimRecord['status'],
    settlementUtr?: string
  ) => {
    try {
      const res = await fetch('/api/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status, settlementUtr }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Claim ${data.claim.claimNumber} updated to ${status}`, 'success');
        await refreshData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Inward Return Warehouse Scan
  const handleLogWarehouseScan = async (awbOrOrderId: string, condition?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awbOrOrderId, condition }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        await refreshData();
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  };

  // Approve AI Column Mapping with Rollback Versioning
  const handleSaveApprovedMapping = async (
    mappingConfig: ColumnMappingConfig,
    approved: Record<string, string>,
    note?: string
  ) => {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_MAPPING',
          mappingConfig,
          approvedMappings: approved,
          note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        await refreshData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Rollback Column Mapping to Prior Version
  const handleRollbackMapping = async (mappingId: string, version: number) => {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ROLLBACK_MAPPING',
          mappingId,
          targetVersion: version,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        await refreshData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Ingest Processed File Rows into Order Ledger
  const handleIngestOrders = async (newOrders: any[]) => {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'INGEST_ORDERS',
          orders: newOrders,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        await refreshData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Resolve AI Review Queue Item (Accept, Reject, Manual Link)
  const handleResolveReviewItem = async (
    itemId: string,
    action: 'ACCEPT' | 'REJECT' | 'MANUAL_LINK',
    manualOrderId?: string,
    note?: string
  ) => {
    try {
      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action, manualOrderId, note }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        await refreshData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Update Rate Card
  const handleUpdateRateCard = async (id: string, updates: Partial<RateCard>) => {
    try {
      const res = await fetch('/api/rate-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        await refreshData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Navigate to reconciliation with pre-set status filter from dashboard
  const handleNavigateToRecon = (statusFilter: string = 'ALL') => {
    setInitialStatusFilter(statusFilter);
    setActiveTab('reconciliation');
  };

  const pendingReviewCount = reviewQueue.filter(i => i.status === 'PENDING').length;
  const openClaimsCount = claims.filter(c => c.status !== 'Recovered').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <HeaderNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        maskPII={maskPII}
        onToggleMaskPII={handleToggleMaskPII}
        onResetSeedData={handleResetSeedData}
        pendingReviewCount={pendingReviewCount}
        openClaimsCount={openClaimsCount}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all transform animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : (toast.type === 'info' ? 'bg-indigo-900 text-white border-indigo-700' : 'bg-emerald-900 text-white border-emerald-700')
          }`}>
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !dashboardData ? (
          <div className="py-24 text-center text-slate-400 text-sm">
            Loading ReconTex Financial Engine...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && dashboardData && (
              <DashboardView
                data={dashboardData}
                onNavigateToRecon={handleNavigateToRecon}
                onNavigateToClaims={() => setActiveTab('claims')}
              />
            )}

            {activeTab === 'reconciliation' && (
              <ReconciliationView
                orders={orders}
                onRaiseClaim={handleRaiseClaim}
                maskPII={maskPII}
                onToggleMaskPII={handleToggleMaskPII}
                initialStatusFilter={initialStatusFilter}
              />
            )}

            {activeTab === 'upload' && (
              <UploadView
                mappings={mappings}
                onSaveApprovedMapping={handleSaveApprovedMapping}
                onRollbackMapping={handleRollbackMapping}
                onIngestOrders={handleIngestOrders}
              />
            )}

            {activeTab === 'ai-review' && (
              <AIReviewQueueView
                items={reviewQueue}
                onResolveItem={handleResolveReviewItem}
              />
            )}

            {activeTab === 'rate-cards' && (
              <RateCardsView
                rateCards={rateCards}
                onUpdateRateCard={handleUpdateRateCard}
              />
            )}

            {activeTab === 'returns' && (
              <ReturnsTrackerView
                orders={orders}
                onLogWarehouseScan={handleLogWarehouseScan}
                onRaiseClaim={handleRaiseClaim}
              />
            )}

            {activeTab === 'claims' && (
              <ClaimsView
                claims={claims}
                onUpdateClaimStatus={handleUpdateClaimStatus}
              />
            )}

            {activeTab === 'tax-ledger' && (
              <TaxLedgerView
                records={taxLedger}
              />
            )}

            {activeTab === 'benchmark' && (
              <BenchmarkView />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700">Company A, Bengaluru</span> — Home Textiles Brand (₹43.2 Cr Revenue • 45 Staff • Finance Team of 3)
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>DPDP Act 2023 Compliant</span>
            <span>•</span>
            <span>Section 52 GST TCS & Sec 194-O TDS Isolated</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Close SLA: 3 Days (Down from 12d)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
