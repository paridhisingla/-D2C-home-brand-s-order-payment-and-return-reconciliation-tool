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
      alert(lang === 'ta' ? 'தயவுசெய்து அளவை உள்ளிடவும்' : 'Please provide production quantity');
      return;
    }

    const payload = {
      orderId: selectedOrderId,
      stage,
      quantityProduced: Number(quantityProduced),
      rejectedQuantity: Number(rejectedQuantity || 0),
      originalTamilNote: tamilNote,
      photoUrl: photoPreview || '/sample-photos/stitching-line-1.jpg',
      supervisorId: 'user-super-1',
      timestamp: new Date().toISOString(),
    };

    // If offline or simulated network blip
    if (!navigator.onLine || !isOnline) {
      saveToOfflineQueue(payload);
      setStatusMessage(lang === 'ta' ? 'ஆஃப்லைனில் சேமிக்கப்பட்டது (நெட்வொர்க் வரும்போது அனுப்பப்படும்)' : 'Saved offline! Will sync automatically.');
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
      // Fallback to offline queue on any fetch failure
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

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      {/* Phone Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">
              {lang === 'ta' ? 'யூனிட் 1 - தள உற்பத்தி பதிவு' : 'Unit 1 - Floor Production'}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span>முத்துசாமி (Supervisor)</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                {isOnline ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> ஆன்லைன்
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> ஆஃப்லைன்
                  </span>
                )}
              </span>
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
          className="text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-200 transition flex items-center gap-1"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ta' ? 'EN' : 'தமிழ்'}</span>
        </button>
      </div>

      {/* Offline Queue Badge & Sync Action */}
      {offlineQueue.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              {lang === 'ta'
                ? `${offlineQueue.length} பதிவுகள் மொபைலில் காத்திருக்கின்றன`
                : `${offlineQueue.length} logs queued offline on phone`}
            </span>
          </div>
          <button
            onClick={handleSyncQueue}
            disabled={isSyncing}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1"
          >
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <span>{lang === 'ta' ? 'இணைக்கவும்' : 'Sync Now'}</span>
            )}
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* The Minimal Floor Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Order Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            {lang === 'ta' ? '1. ஆர்டரைத் தேர்வு செய்யவும் (PO Number)' : '1. Select Purchase Order (PO)'}
          </label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full text-sm font-semibold p-3 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-500"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.poNumber} — {o.styleName.split(',')[0]} ({o.totalQuantity.toLocaleString()} pcs)
              </option>
            ))}
          </select>
          {selectedOrder && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>{selectedOrder.buyerName}</span>
              <span>Target: {selectedOrder.exFactoryDate}</span>
            </div>
          )}
        </div>

        {/* Stage Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            {lang === 'ta' ? '2. உற்பத்தி நிலை (Stage)' : '2. Production Stage'}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
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
                className={`py-2 px-2 rounded-lg text-xs font-semibold text-center border transition ${
                  stage === s.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantities: Produced & Rejected Big Keypad Targets */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <label className="block text-[11px] font-bold text-emerald-900 mb-1">
              {lang === 'ta' ? 'உற்பத்தி அளவு (Pieces)' : 'Pieces Done Today'}
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantityProduced}
              onChange={(e) => setQuantityProduced(e.target.value)}
              className="w-full text-xl font-bold p-2.5 bg-white border border-emerald-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 text-center"
            />
          </div>

          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
            <label className="block text-[11px] font-bold text-rose-900 mb-1">
              {lang === 'ta' ? 'குறைபாடு / ரிஜெக்ட்' : 'Defects / Rejection'}
            </label>
            <input
              type="number"
              min="0"
              value={rejectedQuantity}
              onChange={(e) => setRejectedQuantity(e.target.value)}
              className="w-full text-xl font-bold p-2.5 bg-white border border-rose-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 text-center"
            />
          </div>
        </div>

        {/* Photo Capture / Evidence */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            {lang === 'ta' ? '3. புகைப்பட ஆதாரம் (Photo Evidence)' : '3. Floor Photo Evidence'}
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 text-slate-600 text-xs font-medium transition">
              <Camera className="w-5 h-5 text-brand-600" />
              <span>{photoPreview ? (lang === 'ta' ? 'புகைப்படம் மாற்றவும்' : 'Retake Photo') : (lang === 'ta' ? 'கேமரா / போட்டோ எடுக்க' : 'Capture Floor Photo')}</span>
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
            <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100 flex items-center justify-center">
              <img
                src={photoPreview}
                alt="Captured piece"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                Proof Stamped
              </span>
            </div>
          )}
        </div>

        {/* Voice Note & Issue Text in Tamil */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800">
            {lang === 'ta' ? '4. தாமத காரணம் / குறிப்பு (குரல் அல்லது தமிழ்)' : '4. Floor Issue Note (Tamil or Voice)'}
          </label>

          {/* Voice Note Recorder Simulation */}
          <TamilVoiceRecorder
            lang={lang}
            onTranscript={(transcribedText) => {
              setTamilNote((prev) => (prev ? `${prev} • ${transcribedText}` : transcribedText));
            }}
          />

          {/* Textarea for Tamil floor notes */}
          <textarea
            rows={2}
            placeholder={
              lang === 'ta'
                ? 'பிரச்சனையை தமிழில் எழுதவும் (எ.கா: மெஷின் மோட்டார் பழுதாகிவிட்டது)...'
                : 'Type issue in Tamil or English (e.g. stitching machine motor breakdown)...'
            }
            value={tamilNote}
            onChange={(e) => setTamilNote(e.target.value)}
            className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 leading-relaxed font-sans"
          />
        </div>

        {/* Big Touch-Friendly Send Button */}
        <button
          type="submit"
          disabled={isSyncing}
          className="w-full py-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
        >
          {isSyncing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{lang === 'ta' ? 'தளப் பதிவை அனுப்பவும்' : 'Submit Floor Update'}</span>
            </>
          )}
        </button>
      </form>

      {/* Review Queue Shortcut for Merchandisers */}
      <div className="text-center pt-2">
        <Link
          href="/review"
          className="text-xs text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1"
        >
          <span>Merchandiser: Open AI Review Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
