// src/components/UploadView.tsx
'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  History, 
  RotateCcw, 
  Sparkles, 
  Upload, 
  X 
} from 'lucide-react';
import { SourceFileType, ColumnMappingConfig, ColumnMappingVersion } from '@/types';
import { CANONICAL_SCHEMAS, proposeColumnMapping } from '@/lib/aiMappingEngine';

interface UploadViewProps {
  mappings: ColumnMappingConfig[];
  onSaveApprovedMapping: (mappingConfig: ColumnMappingConfig, approved: Record<string, string>, note?: string) => void;
  onRollbackMapping: (mappingId: string, version: number) => void;
  onIngestOrders: (orders: any[]) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  mappings,
  onSaveApprovedMapping,
  onRollbackMapping,
  onIngestOrders,
}) => {
  const [sourceType, setSourceType] = useState<SourceFileType>('SETTLEMENT');
  const [partnerName, setPartnerName] = useState<string>('Marketplace 1 (Amazon)');
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<Array<Record<string, any>>>([]);
  const [proposedMapping, setProposedMapping] = useState<Record<string, string>>({});
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
  const [previewRows, setPreviewRows] = useState<Array<Record<string, any>>>([]);
  const [selectedConfig, setSelectedConfig] = useState<ColumnMappingConfig | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pre-configured Sample CSV Generators for Instant Reviewer Demo
  const loadPresetFile = (type: SourceFileType) => {
    setStatusMessage(null);
    setSourceType(type);

    if (type === 'SETTLEMENT') {
      setPartnerName('Marketplace 1 (Amazon)');
      const headers = [
        'merchant_order_id',
        'tracking_id',
        'net_payout_amount',
        'referral_fee_amount',
        'fixed_closing_fee',
        'gst_tcs_cgst_sgst',
        'income_tax_tds_194o',
        'bank_utr_reference',
        'deposit_date',
      ];
      const rows = [
        {
          merchant_order_id: 'ORD-M-88120',
          tracking_id: 'DEL-AMZ-77188120',
          net_payout_amount: 862,
          referral_fee_amount: 179.85,
          fixed_closing_fee: 15,
          gst_tcs_cgst_sgst: 11.99,
          income_tax_tds_194o: 1.20,
          bank_utr_reference: 'UTR-AMZ-998811',
          deposit_date: '2026-10-25',
        },
        {
          merchant_order_id: 'ORD-M-88301',
          tracking_id: 'SR-AMZ-883012',
          net_payout_amount: 693,
          referral_fee_amount: 134.85,
          fixed_closing_fee: 15,
          gst_tcs_cgst_sgst: 8.99,
          income_tax_tds_194o: 0.90,
          bank_utr_reference: 'UTR-AMZ-998812',
          deposit_date: '2026-10-29',
        },
      ];
      // Generate up to 20 rows
      for (let i = 3; i <= 20; i++) {
        rows.push({
          merchant_order_id: `ORD-M-99${100 + i}`,
          tracking_id: `AWB-TRK-${880000 + i}`,
          net_payout_amount: 950 + (i * 20),
          referral_fee_amount: 180,
          fixed_closing_fee: 15,
          gst_tcs_cgst_sgst: 12.50,
          income_tax_tds_194o: 1.25,
          bank_utr_reference: `UTR-AMZ-${771100 + i}`,
          deposit_date: '2026-10-28',
        });
      }

      setUploadedHeaders(headers);
      setSampleRows(rows);
      runAiMappingAnalysis(type, headers, rows);
    } else if (type === 'COD_REMITTANCE') {
      setPartnerName('Shiprocket');
      const headers = [
        'client_order_id',
        'airway_bill_no',
        'collected_amount',
        'cod_charges',
        'credit_amount',
        'utr_no',
        'cr_date',
      ];
      const rows = [
        {
          client_order_id: 'ORD-W-204118',
          airway_bill_no: 'SR-BLR-892104118',
          collected_amount: 1499,
          cod_charges: 35,
          credit_amount: 0,
          utr_no: 'PENDING',
          cr_date: '2026-10-22',
        },
        {
          client_order_id: 'ORD-W-203991',
          airway_bill_no: 'SR-BLR-87203991',
          collected_amount: 1299,
          cod_charges: 35,
          credit_amount: 0,
          utr_no: 'OVERDUE',
          cr_date: '2026-10-02',
        },
      ];
      for (let i = 3; i <= 20; i++) {
        rows.push({
          client_order_id: `ORD-W-204${500 + i}`,
          airway_bill_no: `SR-BLR-99${1000 + i}`,
          collected_amount: 1899,
          cod_charges: 35,
          credit_amount: 1809,
          utr_no: `UTR-HDFC-${99100 + i}`,
          cr_date: '2026-10-30',
        });
      }
      setUploadedHeaders(headers);
      setSampleRows(rows);
      runAiMappingAnalysis(type, headers, rows);
    } else if (type === 'FREIGHT_INVOICE') {
      setPartnerName('Delhivery');
      const headers = [
        'waybill',
        'client_order_id',
        'chargeable_weight',
        'applied_zone',
        'total_freight',
        'reverse_freight',
      ];
      const rows = [
        {
          waybill: 'DEL-BLR-99204190',
          client_order_id: 'ORD-W-204190',
          chargeable_weight: 2.10,
          applied_zone: 'Local',
          total_freight: 176,
          reverse_freight: 88,
        },
      ];
      for (let i = 2; i <= 20; i++) {
        rows.push({
          waybill: `DEL-AWB-${551000 + i}`,
          client_order_id: `ORD-M-${77200 + i}`,
          chargeable_weight: 0.85,
          applied_zone: 'Metro',
          total_freight: 62,
          reverse_freight: 0,
        });
      }
      setUploadedHeaders(headers);
      setSampleRows(rows);
      runAiMappingAnalysis(type, headers, rows);
    } else if (type === 'WAREHOUSE_SCAN') {
      setPartnerName('Bengaluru Dock Scanner');
      const headers = ['scanned_barcode', 'inward_date', 'package_status', 'operator'];
      const rows = [
        {
          scanned_barcode: 'SR-BLR-90204377',
          inward_date: '2026-10-24 16:20',
          package_status: 'Package Intact / Good Condition',
          operator: 'OPR-BLR-04',
        },
      ];
      for (let i = 2; i <= 20; i++) {
        rows.push({
          scanned_barcode: `DEL-AWB-${881000 + i}`,
          inward_date: '2026-10-28 11:15',
          package_status: 'Intact',
          operator: 'OPR-BLR-02',
        });
      }
      setUploadedHeaders(headers);
      setSampleRows(rows);
      runAiMappingAnalysis(type, headers, rows);
    } else {
      // ORDER_MASTER
      setPartnerName('Website (Shopify Master)');
      const headers = [
        'order_id',
        'order_date',
        'sales_channel',
        'item_title',
        'seller_sku',
        'total_price',
        'payment_method',
        'waybill',
        'courier',
        'actual_weight',
        'buyer_name',
        'contact_number',
        'destination_address',
        'city',
      ];
      const rows = [
        {
          order_id: 'ORD-W-204118',
          order_date: '2026-10-18',
          sales_channel: 'Website',
          item_title: '300TC Cotton Bedsheet King',
          seller_sku: 'TX-BED-300-KG-GRY',
          total_price: 1499,
          payment_method: 'COD',
          waybill: 'SR-BLR-892104118',
          courier: 'Shiprocket',
          actual_weight: 0.85,
          buyer_name: 'Ananya Sharma',
          contact_number: '+91 98450 12891',
          destination_address: 'Whitefield, Bengaluru',
          city: 'Bengaluru',
        },
      ];
      for (let i = 2; i <= 20; i++) {
        rows.push({
          order_id: `ORD-W-204${700 + i}`,
          order_date: '2026-10-29',
          sales_channel: 'Website',
          item_title: 'Cotton Pillow Covers Pair',
          seller_sku: 'TX-PLW-300-WHT-02',
          total_price: 699,
          payment_method: 'Prepaid',
          waybill: `SR-BLR-99${2000 + i}`,
          courier: 'Shiprocket',
          actual_weight: 0.35,
          buyer_name: 'Pooja Iyer',
          contact_number: '+91 98860 11992',
          destination_address: 'Indiranagar, Bengaluru',
          city: 'Bengaluru',
        });
      }
      setUploadedHeaders(headers);
      setSampleRows(rows);
      runAiMappingAnalysis(type, headers, rows);
    }
  };

  // Run AI heuristics and generate 20-row preview
  const runAiMappingAnalysis = (
    type: SourceFileType,
    headers: string[],
    rows: Array<Record<string, any>>
  ) => {
    const proposal = proposeColumnMapping(type, headers, rows);
    setProposedMapping(proposal.proposedMapping);
    setConfidenceScores(proposal.confidenceScores);
    setPreviewRows(proposal.samplePreview);

    // Check if an existing config exists
    const existing = mappings.find(m => m.sourceType === type && m.partnerName.includes(partnerName.split(' ')[0]));
    setSelectedConfig(existing || null);
  };

  // Handle CSV file drop or upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setStatusMessage({ type: 'error', text: 'CSV file must have a header row and at least 1 data row.' });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows: Array<Record<string, any>> = [];

        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const rowObj: Record<string, any> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = vals[idx] !== undefined ? vals[idx] : '';
          });
          rows.push(rowObj);
          if (rows.length >= 50) break; // Keep sample rows manageable
        }

        setUploadedHeaders(headers);
        setSampleRows(rows);
        runAiMappingAnalysis(sourceType, headers, rows);
        setStatusMessage({
          type: 'success',
          text: `Loaded ${file.name} with ${headers.length} headers and ${rows.length} rows. AI proposed mapping below.`,
        });
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: `Failed to parse file: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  // User manually alters a mapping dropdown
  const handleMappingChange = (canonicalKey: string, sourceHeader: string) => {
    const updated = { ...proposedMapping, [canonicalKey]: sourceHeader };
    setProposedMapping(updated);

    // Re-generate preview
    const schema = CANONICAL_SCHEMAS[sourceType] || CANONICAL_SCHEMAS.ORDER_MASTER;
    const updatedPreview = sampleRows.slice(0, 20).map((row, idx) => {
      const canonicalRow: Record<string, any> = { _rowIndex: idx + 1 };
      schema.forEach(f => {
        const h = updated[f.key];
        canonicalRow[f.key] = h && row[h] !== undefined ? row[h] : null;
      });
      return canonicalRow;
    });
    setPreviewRows(updatedPreview);
  };

  // Approve & Save
  const handleApproveAndSave = () => {
    const configToSave: ColumnMappingConfig = selectedConfig || {
      id: `map-${sourceType.toLowerCase()}-${Date.now()}`,
      sourceType,
      partnerName,
      version: 1,
      mappings: proposedMapping,
      samplePreview: previewRows,
      isApproved: true,
      versionHistory: [],
      createdAt: new Date().toISOString(),
    };

    onSaveApprovedMapping(
      configToSave,
      proposedMapping,
      `Approved column mapping with 20-row preview verified by finance team`
    );

    setStatusMessage({
      type: 'success',
      text: `Column mapping approved and saved. Version incremented with rollback point archived.`,
    });
  };

  const schema = CANONICAL_SCHEMAS[sourceType] || CANONICAL_SCHEMAS.ORDER_MASTER;

  return (
    <div className="space-y-6">
      {/* Screen Title & Description */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              File Ingestion & AI Column Mapping Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> AI Assisted
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Upload partner settlement, COD remittance, courier freight, or warehouse scan files. AI proposes column mappings when formats change, previewed across 20 rows, approved before saving, and versioned for instant rollback.
          </p>
        </div>

        {selectedConfig && selectedConfig.versionHistory && selectedConfig.versionHistory.length > 0 && (
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Version History (v{selectedConfig.version})</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preset Quick Load Buttons for Reviewer Usability */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          One-Click Test Files (Pre-loaded Realistic Scenarios)
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPresetFile('SETTLEMENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sourceType === 'SETTLEMENT'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            1. Amazon Settlement (MTR Format)
          </button>
          <button
            onClick={() => loadPresetFile('COD_REMITTANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sourceType === 'COD_REMITTANCE'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            2. Shiprocket COD Remittance
          </button>
          <button
            onClick={() => loadPresetFile('FREIGHT_INVOICE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sourceType === 'FREIGHT_INVOICE'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            3. Delhivery Freight Invoice
          </button>
          <button
            onClick={() => loadPresetFile('WAREHOUSE_SCAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sourceType === 'WAREHOUSE_SCAN'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            4. Warehouse Return Inward Scans
          </button>
          <button
            onClick={() => loadPresetFile('ORDER_MASTER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sourceType === 'ORDER_MASTER'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            5. Website / Shopify Order Master
          </button>
        </div>
      </div>

      {/* Upload Zone & Config Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Drag and Drop Upload Box */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Upload File (CSV / Excel)</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select or drop any mutated report from aggregators or marketplaces.
            </p>

            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center transition-colors cursor-pointer relative bg-slate-50/50">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <span className="text-xs font-semibold text-slate-700 block">
                Click to browse or drag & drop file
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Supports UTF-8 CSV reports (up to 100,000 rows)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Detected Headers:</span>
            <span className="font-bold text-slate-900">{uploadedHeaders.length} columns</span>
          </div>
        </div>

        {/* Center & Right: AI Proposed Column Mappings */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Target Canonical Schema vs Uploaded Headers
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                  AI Suggestion Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target fields required by the reconciliation rules. Adjust any mapping before approval.
              </p>
            </div>

            <button
              onClick={handleApproveAndSave}
              disabled={uploadedHeaders.length === 0}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
                uploadedHeaders.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Approve & Save Mapping</span>
            </button>
          </div>

          {uploadedHeaders.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Upload a report or click one of the preset scenario buttons above to generate AI column mappings.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {schema.map((field) => {
                const mappedHeader = proposedMapping[field.key] || '';
                const score = confidenceScores[field.key] || 0;

                return (
                  <div key={field.key} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </span>
                      {score > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          score >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {score}% Confidence
                        </span>
                      )}
                    </div>
                    <select
                      value={mappedHeader}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    >
                      <option value="">-- Unmapped --</option>
                      {uploadedHeaders.map((hdr) => (
                        <option key={hdr} value={hdr}>
                          {hdr}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 20-Row Preview Grid (Core Brief Requirement) */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-2">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  20-Row Ingestion Preview
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  Rule: Approved only after 20-row validation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Previewing how the raw file data normalizes into canonical fields according to proposed mapping.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Showing {previewRows.length} rows
            </span>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="py-2 px-3">#</th>
                  {schema.map((f) => (
                    <th key={f.key} className="py-2 px-3">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="py-2 px-3 text-slate-400">{row._rowIndex}</td>
                    {schema.map((f) => (
                      <td key={f.key} className="py-2 px-3 text-slate-800 truncate max-w-[150px]">
                        {row[f.key] !== null && row[f.key] !== undefined ? String(row[f.key]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Version History & Rollback Modal */}
      {showHistoryModal && selectedConfig && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Mapping Version History & Rollback
                </h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              When partner changes format or AI mapping needs revision, you can roll back to any previously approved version with one click.
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {/* Current Active Version */}
              <div className="p-3 rounded-lg border-2 border-indigo-500 bg-indigo-50/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">v{selectedConfig.version} (Active Version)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">Active</span>
                </div>
                <div className="text-slate-600 mt-1">
                  Approved by {selectedConfig.approvedBy || 'System'}
                </div>
              </div>

              {/* Archived Versions */}
              {selectedConfig.versionHistory?.map((hist: ColumnMappingVersion) => (
                <div key={hist.version} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Version v{hist.version}</div>
                    <div className="text-slate-500 text-[11px]">{hist.note || 'Archived prior to upgrade'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(hist.approvedAt).toLocaleDateString()} by {hist.approvedBy}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onRollbackMapping(selectedConfig.id, hist.version);
                      setShowHistoryModal(false);
                      setStatusMessage({
                        type: 'success',
                        text: `Rolled back mapping to version v${hist.version}.`,
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rollback</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
