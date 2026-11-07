// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { proposeColumnMapping, approveAndSaveMapping, rollbackMappingVersion } from '@/lib/aiMappingEngine';
import { SourceFileType, ColumnMappingConfig } from '@/types';

export async function GET() {
  try {
    const mappings = store.getColumnMappings();
    return NextResponse.json({ mappings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action 1: Propose AI Column Mapping with 20-row preview
    if (action === 'ANALYZE_HEADERS' || !action) {
      const { sourceType, headers, sampleRows, partnerName } = body;

      if (!sourceType || !headers || !Array.isArray(headers)) {
        return NextResponse.json(
          { error: 'sourceType and headers array are required' },
          { status: 400 }
        );
      }

      const proposal = proposeColumnMapping(
        sourceType as SourceFileType,
        headers,
        sampleRows || []
      );

      return NextResponse.json({
        success: true,
        sourceType,
        partnerName: partnerName || 'Custom Partner',
        ...proposal,
      });
    }

    // Action 2: Approve & Save Mapping (creates version history)
    if (action === 'APPROVE_MAPPING') {
      const { mappingConfig, approvedMappings, note } = body;
      const currentUser = store.getCurrentUser();

      const existingConfigs = store.getColumnMappings();
      const existing = existingConfigs.find(m => m.id === mappingConfig.id) || {
        id: mappingConfig.id || `map-${Date.now()}`,
        sourceType: mappingConfig.sourceType || 'ORDER_MASTER',
        partnerName: mappingConfig.partnerName || 'Generic',
        version: 1,
        mappings: {},
        samplePreview: mappingConfig.samplePreview || [],
        isApproved: false,
        versionHistory: [],
        createdAt: new Date().toISOString(),
      };

      const updated = approveAndSaveMapping(
        existing as ColumnMappingConfig,
        approvedMappings || mappingConfig.mappings,
        currentUser.name,
        note
      );

      store.saveColumnMapping(updated);

      return NextResponse.json({
        success: true,
        message: `Column mapping approved and saved as version v${updated.version}`,
        config: updated,
      });
    }

    // Action 3: Rollback Mapping to Prior Version
    if (action === 'ROLLBACK_MAPPING') {
      const { mappingId, targetVersion } = body;
      const currentUser = store.getCurrentUser();

      const existingConfigs = store.getColumnMappings();
      const existing = existingConfigs.find(m => m.id === mappingId);

      if (!existing) {
        return NextResponse.json({ error: `Mapping config ${mappingId} not found` }, { status: 404 });
      }

      const rolledBack = rollbackMappingVersion(existing, parseInt(targetVersion), currentUser.name);
      store.saveColumnMapping(rolledBack);

      return NextResponse.json({
        success: true,
        message: `Successfully rolled back mapping to version v${targetVersion}`,
        config: rolledBack,
      });
    }

    // Action 4: Ingest Processed File Rows into Order Ledger
    if (action === 'INGEST_ORDERS') {
      const { orders } = body;
      if (!Array.isArray(orders) || orders.length === 0) {
        return NextResponse.json({ error: 'orders array is required' }, { status: 400 });
      }

      store.addOrders(orders);
      return NextResponse.json({
        success: true,
        message: `Successfully ingested and reconciled ${orders.length} orders into the ledger`,
        totalOrdersNow: store.getOrders().length,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
