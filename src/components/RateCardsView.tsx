// src/components/RateCardsView.tsx
'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Check, 
  ChevronRight, 
  Layers, 
  Percent, 
  RotateCcw, 
  Save, 
  Scale, 
  Sliders, 
  Truck 
} from 'lucide-react';
import { RateCard, SalesChannel, CourierPartner } from '@/types';
import { calculateExpectedPayout } from '@/lib/rateEngine';

interface RateCardsViewProps {
  rateCards: RateCard[];
  onUpdateRateCard: (id: string, updates: Partial<RateCard>) => void;
}

export const RateCardsView: React.FC<RateCardsViewProps> = ({
  rateCards,
  onUpdateRateCard,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(rateCards[0]?.id || '');
  const [editingCard, setEditingCard] = useState<RateCard | null>(rateCards[0] || null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dynamic Simulator State
  const [simValue, setSimValue] = useState<number>(1499);
  const [simWeightKg, setSimWeightKg] = useState<number>(0.85);
  const [simChannel, setSimChannel] = useState<SalesChannel>('Website');
  const [simCourier, setSimCourier] = useState<CourierPartner>('Shiprocket');
  const [simPayment, setSimPayment] = useState<'COD' | 'Prepaid'>('COD');
  const [simZone, setSimZone] = useState<'Local' | 'Regional' | 'Metro' | 'National'>('Local');
  const [simIsReturn, setSimIsReturn] = useState<boolean>(false);

  const channelCards = rateCards.filter(rc => rc.type === 'CHANNEL');
  const courierCards = rateCards.filter(rc => rc.type === 'COURIER');

  const handleSelectCard = (card: RateCard) => {
    setSelectedCardId(card.id);
    setEditingCard({ ...card });
    setSaveSuccess(false);
  };

  const handleSaveChanges = () => {
    if (!editingCard) return;
    onUpdateRateCard(editingCard.id, editingCard);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Run dynamic simulation on the fly
  const simulationResult = calculateExpectedPayout(
    {
      channel: simChannel,
      orderValue: simValue,
      physicalWeightKg: simWeightKg,
      courierPartner: simCourier,
      paymentMode: simPayment,
      zone: simZone,
      deliveryStatus: simIsReturn ? 'Returned to warehouse' : 'Delivered',
    },
    rateCards
  );

  return (
    <div className="space-y-6">
      {/* Screen Title */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Rate Cards & Deterministic Fee Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Rule-Based • No Hallucination
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Configure agreed commission rates, closing fees, courier weight slabs, and statutory tax percentages. The reconciliation engine uses these deterministic rules to compute expected payout per order and flag any gap &gt; ₹10.
          </p>
        </div>
      </div>

      {/* Main Grid: Rate Cards List + Editor + Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cards Selector */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Channel Commission Rate Cards ({channelCards.length})
            </span>
            <div className="space-y-1.5">
              {channelCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCardId === card.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{card.name}</span>
                  <span className={`text-[11px] font-semibold ${selectedCardId === card.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {card.commissionPercent}% Comm
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Courier Freight Rate Cards ({courierCards.length})
            </span>
            <div className="space-y-1.5">
              {courierCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCardId === card.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{card.name}</span>
                  <span className={`text-[11px] font-semibold ${selectedCardId === card.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                    ₹{card.baseRateMetro} Base (Metro)
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Card Config Editor */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {editingCard?.name} Configuration
              </h2>
              <span className="text-[11px] text-slate-400">
                Type: {editingCard?.type} • Last updated: {editingCard ? new Date(editingCard.updatedAt).toLocaleDateString() : '—'}
              </span>
            </div>

            <button
              onClick={handleSaveChanges}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Saved & Recomputed' : 'Save Changes'}</span>
            </button>
          </div>

          {editingCard && (
            <div className="space-y-3 text-xs max-h-[500px] overflow-y-auto pr-1">
              {editingCard.type === 'CHANNEL' ? (
                <>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">
                      Platform Referral Commission (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingCard.commissionPercent}
                      onChange={(e) => setEditingCard({ ...editingCard, commissionPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">
                      Fixed Closing / Order Processing Fee (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={editingCard.fixedClosingFee}
                      onChange={(e) => setEditingCard({ ...editingCard, fixedClosingFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">
                      Payment Gateway Fee (%) (Website Prepaid)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCard.paymentGatewayPercent}
                      onChange={(e) => setEditingCard({ ...editingCard, paymentGatewayPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">
                      GST TCS Rate (%) (Section 52 CGST)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCard.tcsPercent}
                      onChange={(e) => setEditingCard({ ...editingCard, tcsPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">
                      Income Tax TDS Rate (%) (Section 194-O)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCard.tdsPercent}
                      onChange={(e) => setEditingCard({ ...editingCard, tdsPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Local Zone (₹)</label>
                      <input
                        type="number"
                        value={editingCard.baseRateLocal}
                        onChange={(e) => setEditingCard({ ...editingCard, baseRateLocal: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Regional Zone (₹)</label>
                      <input
                        type="number"
                        value={editingCard.baseRateRegional}
                        onChange={(e) => setEditingCard({ ...editingCard, baseRateRegional: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Metro Zone (₹)</label>
                      <input
                        type="number"
                        value={editingCard.baseRateMetro}
                        onChange={(e) => setEditingCard({ ...editingCard, baseRateMetro: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">National Zone (₹)</label>
                      <input
                        type="number"
                        value={editingCard.baseRateNational}
                        onChange={(e) => setEditingCard({ ...editingCard, baseRateNational: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">
                      Additional 500g Weight Slab Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={editingCard.extraSlabRate}
                      onChange={(e) => setEditingCard({ ...editingCard, extraSlabRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-medium block mb-1">
                      COD Remittance Handling Charge (₹)
                    </label>
                    <input
                      type="number"
                      value={editingCard.codFixedFee}
                      onChange={(e) => setEditingCard({ ...editingCard, codFixedFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Fee Calculation Simulator */}
        <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
            <Calculator className="w-5 h-5 text-indigo-700" />
            <div>
              <h2 className="text-sm font-bold text-indigo-950">
                Live Fee Simulator
              </h2>
              <span className="text-[11px] text-indigo-700">
                Test rate cards against any hypothetical order
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Order Value (₹)</label>
                <input
                  type="number"
                  value={simValue}
                  onChange={(e) => setSimValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-indigo-200 rounded font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={simWeightKg}
                  onChange={(e) => setSimWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-white border border-indigo-200 rounded font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Channel</label>
                <select
                  value={simChannel}
                  onChange={(e) => setSimChannel(e.target.value as SalesChannel)}
                  className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-slate-800"
                >
                  <option value="Website">Website</option>
                  <option value="Marketplace 1">Marketplace 1 (Amazon)</option>
                  <option value="Marketplace 2">Marketplace 2 (Flipkart)</option>
                  <option value="Marketplace 3">Marketplace 3 (Myntra)</option>
                  <option value="Quick-Commerce 1">Quick-Commerce 1 (Blinkit)</option>
                  <option value="Quick-Commerce 2">Quick-Commerce 2 (Zepto)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Courier</label>
                <select
                  value={simCourier}
                  onChange={(e) => setSimCourier(e.target.value as CourierPartner)}
                  className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-slate-800"
                >
                  <option value="Shiprocket">Shiprocket</option>
                  <option value="Delhivery">Delhivery</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Payment</label>
                <select
                  value={simPayment}
                  onChange={(e) => setSimPayment(e.target.value as 'COD' | 'Prepaid')}
                  className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-slate-800"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="Prepaid">Prepaid</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Zone</label>
                <select
                  value={simZone}
                  onChange={(e) => setSimZone(e.target.value as any)}
                  className="w-full px-2 py-1 bg-white border border-indigo-200 rounded text-slate-800"
                >
                  <option value="Local">Local (Bengaluru)</option>
                  <option value="Regional">Regional (Karnataka)</option>
                  <option value="Metro">Metro</option>
                  <option value="National">National</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="simReturn"
                checked={simIsReturn}
                onChange={(e) => setSimIsReturn(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <label htmlFor="simReturn" className="text-slate-700 font-medium">
                Simulate Customer Return / RTO
              </label>
            </div>
          </div>

          {/* Breakdown Output Box */}
          <div className="p-3.5 rounded-lg bg-white border border-indigo-200 text-xs space-y-1.5">
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>Commission:</span>
              <span className="font-mono text-rose-600">-₹{simulationResult.commission}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>Closing Fee:</span>
              <span className="font-mono text-rose-600">-₹{simulationResult.closingFee}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>Courier Freight:</span>
              <span className="font-mono text-rose-600">-₹{simulationResult.courierFreight}</span>
            </div>
            {simPayment === 'COD' && (
              <div className="flex justify-between py-0.5 text-slate-600">
                <span>COD Handling:</span>
                <span className="font-mono text-rose-600">-₹{simulationResult.codHandlingFee}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>GST TCS (1%):</span>
              <span className="font-mono text-slate-500">-₹{simulationResult.tcs}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>Income Tax TDS:</span>
              <span className="font-mono text-slate-500">-₹{simulationResult.tds}</span>
            </div>

            <div className="border-t border-indigo-100 pt-2 flex justify-between font-bold text-sm text-indigo-950">
              <span>Expected Net Payout:</span>
              <span className="font-mono text-indigo-700">
                ₹{simulationResult.expectedNetPayout.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
