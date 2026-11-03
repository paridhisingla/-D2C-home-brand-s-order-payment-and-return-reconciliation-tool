'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Camera,
  Mic,
  Send,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  Globe,
  Plus,
  Trash2,
} from 'lucide-react';
import { TamilVoiceRecorder } from '@/components/TamilVoiceRecorder';
import { DICTIONARY, t } from '@/lib/translations';

export default function SupervisorMobilePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [stage, setStage] = useState('Stitching');
  const [quantityProduced, setQuantityProduced] = useState<number | string>(450);
  const [rejectedQuantity, setRejectedQuantity] = useState<number | string>(10);
  const [tamilNote, setTamilNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Language & Offline State
  const [lang, setLang] = useState<'ta' | 'en'>('ta');
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Initial load
  useEffect(() => {
    // Load offline queue from localStorage
    const savedQueue = localStorage.getItem('knittrack_offline_queue');
    if (savedQueue) {
      try {
        setOfflineQueue(JSON.parse(savedQueue));
      } catch (e) {}
    }

    // Check saved language
    const savedLang = localStorage.getItem('knittrack_lang') as any;
    if (savedLang) setLang(savedLang);

    // Online / Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch orders for dropdown
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.orders.length > 0) {
          setOrders(d.orders);
          setSelectedOrderId(d.orders[0].id);
        }
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveToOfflineQueue = (logPayload: any) => {
    const updated = [logPayload, ...offlineQueue];
    setOfflineQueue(updated);
    localStorage.setItem('knittrack_offline_queue', JSON.stringify(updated));
  };

  const handleSyncQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    setStatusMessage(lang === 'ta' ? 'பதிவேற்றப்படுகிறது...' : 'Syncing queued logs...');

    try {
      for (const item of offlineQueue) {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
      setOfflineQueue([]);
      localStorage.removeItem('knittrack_offline_queue');
      setStatusMessage(lang === 'ta' ? 'அனைத்து பதிவுகளும் அனுப்பப்பட்டன!' : 'All queued logs synced successfully!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setStatusMessage(lang === 'ta' ? 'ஒத்திசைவு தோல்வி. மீண்டும் முயற்சிக்கவும்.' : 'Sync failed. Retry later.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !quantityProduced) {
      alert(lang === 'ta' ? 'ஆர்டர் மற்றும் அளவை உள்ளிடவும்' : 'Please select order and enter quantity');
      return;
    }

    const payload = {
      orderId: selectedOrderId,
      stage,
      quantityProduced: Number(quantityProduced),
      rejectedQuantity: Number(rejectedQuantity) || 0,
      supervisorName: 'Muthusamy (Supervisor)',
      originalTamilNote: tamilNote.trim(),
      photoUrl: photoPreview || undefined,
      clientUuid: `mobile-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };

    // If simulated offline, push to queue
    if (!isOnline) {
      saveToOfflineQueue(payload);
      setStatusMessage(
        lang === 'ta'
          ? 'ஆஃப்லைன்: பதிவு போனில் சேமிக்கப்பட்டது (இணையம் வந்ததும் ஒத்திசைக்கப்படும்)'
          : 'Offline Mode: Stored locally on device. Will sync when connection restores.'
      );
      resetForm();
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage(lang === 'ta' ? 'வெற்றிகரமாக அனுப்பப்பட்டது!' : 'Logged successfully to production system!');
        resetForm();
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      saveToOfflineQueue(payload);
      setStatusMessage(lang === 'ta' ? 'இணைப்பு பிழை: ஆஃப்லைனில் சேமிக்கப்பட்டது' : 'Network error: Queued in offline storage.');
      resetForm();
    } finally {
      setIsSyncing(false);
    }
  };

  const resetForm = () => {
    setTamilNote('');
    setPhotoPreview(null);
  };

  const adjustQty = (amount: number) => {
    const cur = Number(quantityProduced) || 0;
    setQuantityProduced(Math.max(0, cur + amount));
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      {/* Phone Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white">
              {lang === 'ta' ? 'யூனிட் 1 - தள உற்பத்தி பதிவு' : 'Unit 1 - Floor Production'}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="font-medium">முத்துசாமி (Supervisor)</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsOnline(!isOnline)}
                title="Click to toggle simulated offline/online mode"
                className="inline-flex items-center gap-1 font-bold underline cursor-pointer"
              >
                {isOnline ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> Online
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Offline (Simulated)
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tamil / English Toggle */}
        <button
          onClick={() => {
            const next = lang === 'ta' ? 'en' : 'ta';
            setLang(next);
            localStorage.setItem('knittrack_lang', next);
          }}
          className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 transition flex items-center gap-1 shadow-xs"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
        </button>
      </div>

      {/* Offline Queue Alert & 1-Click Sync */}
      {offlineQueue.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs text-amber-950 dark:text-amber-200 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>
              {lang === 'ta'
                ? `${offlineQueue.length} பதிவுகள் மொபைலில் காத்திருக்கின்றன`
                : `${offlineQueue.length} logs queued offline on phone`}
            </span>
          </div>
          <button
            onClick={handleSyncQueue}
            disabled={isSyncing}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>{lang === 'ta' ? 'ஒத்திசை' : 'Sync Now'}</span>
            )}
          </button>
        </div>
      )}

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/60 text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* The Minimal Floor Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
        {/* Order Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            {lang === 'ta' ? '1. ஆர்டரைத் தேர்வு செய்யவும் (PO Number)' : '1. Select Purchase Order (PO)'}
          </label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full text-xs font-bold p-3 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.poNumber} — {o.styleName.split(',')[0]} ({o.totalQuantity.toLocaleString()} pcs)
              </option>
            ))}
          </select>
          {selectedOrder && (
            <div className="mt-2 p-2.5 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200/80 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100">{selectedOrder.buyerName}</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">Ship: {selectedOrder.exFactoryDate}</span>
            </div>
          )}
        </div>

        {/* Stage Selector Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            {lang === 'ta' ? '2. உற்பத்தி நிலை (Stage)' : '2. Production Stage'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Knitting', label: lang === 'ta' ? 'பின்னல்' : 'Knitting' },
              { id: 'Printing', label: lang === 'ta' ? 'பிரிண்டிங்' : 'Printing' },
              { id: 'Stitching', label: lang === 'ta' ? 'தையல்' : 'Stitching' },
              { id: 'Finishing', label: lang === 'ta' ? 'ஃபினிஷிங்' : 'Finishing' },
              { id: 'Packing', label: lang === 'ta' ? 'பேக்கிங்' : 'Packing' },
              { id: 'Inspection', label: lang === 'ta' ? 'ஆய்வு' : 'Inspection' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStage(s.id)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center border transition ${
                  stage === s.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantities: Produced & Rejected with Quick Increment Chips */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
              <label className="block text-[11px] font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                {lang === 'ta' ? 'உற்பத்தி அளவு (Pieces)' : 'Pieces Done Today'}
              </label>
              <input
                type="number"
                required
                min="1"
                value={quantityProduced}
                onChange={(e) => setQuantityProduced(e.target.value)}
                className="w-full text-xl font-black p-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 text-center shadow-2xs"
              />
            </div>

            <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60">
              <label className="block text-[11px] font-bold text-rose-950 dark:text-rose-200 mb-1">
                {lang === 'ta' ? 'குறைபாடு / ரிஜெக்ட்' : 'Defects / Rejection'}
              </label>
              <input
                type="number"
                min="0"
                value={rejectedQuantity}
                onChange={(e) => setRejectedQuantity(e.target.value)}
                className="w-full text-xl font-black p-2 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 text-center shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Increment Touch Targets for Factory Touchscreens */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Quick Add:</span>
            <div className="flex gap-1.5">
              {[50, 100, 250, 500].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => adjustQty(num)}
                  className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 hover:text-emerald-900 dark:hover:text-emerald-300 text-xs font-bold border border-stone-200 dark:border-slate-700 transition"
                >
                  +{num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floor Photo Proof */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            {lang === 'ta' ? '3. புகைப்பட ஆதாரம் (Photo Evidence)' : '3. Floor Photo Evidence'}
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 bg-stone-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition">
              <Camera className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>
                {photoPreview
                  ? lang === 'ta'
                    ? 'புகைப்படம் மாற்றவும்'
                    : 'Retake Photo'
                  : lang === 'ta'
                  ? 'கேமரா / போட்டோ எடுக்க'
                  : 'Capture Floor Photo'}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
            </label>
          </div>

          {photoPreview && (
            <div className="mt-2 relative rounded-xl overflow-hidden border border-stone-200 dark:border-slate-700 h-28 bg-stone-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
              <img
                src={photoPreview}
                alt="Captured piece"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                Photo Proof Verified
              </span>
            </div>
          )}
        </div>

        {/* Voice Note & Issue Text in Tamil */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            {lang === 'ta' ? '4. தாமத காரணம் / குறிப்பு (குரல் அல்லது தமிழ்)' : '4. Floor Issue Note (Tamil or Voice)'}
          </label>

          <TamilVoiceRecorder
            lang={lang}
            onTranscript={(transcribedText) => {
              setTamilNote((prev) => (prev ? `${prev} • ${transcribedText}` : transcribedText));
            }}
          />

          <textarea
            rows={2}
            placeholder={
              lang === 'ta'
                ? 'பிரச்சனையை தமிழில் எழுதவும் (எ.கா: மெஷின் மோட்டார் பழுதாகிவிட்டது)...'
                : 'Type issue in Tamil or English (e.g. stitching machine motor breakdown)...'
            }
            value={tamilNote}
            onChange={(e) => setTamilNote(e.target.value)}
            className="w-full text-xs p-3 border border-stone-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 leading-relaxed font-sans shadow-2xs"
          />
        </div>

        {/* Big Touch-Friendly Send Button */}
        <button
          type="submit"
          disabled={isSyncing}
          className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
        >
          {isSyncing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{lang === 'ta' ? 'தளப் பதிவை அனுப்பவும்' : 'Submit Floor Update'}</span>
            </>
          )}
        </button>
      </form>

      {/* Review Queue Shortcut for Merchandisers */}
      <div className="text-center pt-1">
        <Link
          href="/review"
          className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-bold inline-flex items-center gap-1 underline"
        >
          <span>Merchandiser: Open AI Review Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
