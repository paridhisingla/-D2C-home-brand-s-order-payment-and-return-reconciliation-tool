import { NextResponse } from 'next/server';
import { getOrders, getOrderById } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerCompanyId = searchParams.get('buyerCompanyId') || undefined;

    const orders = await getOrders({ buyerCompanyId });

    // Generate CSV data for Excel export
    const headers = [
      'PO Number',
      'Buyer',
      'Garment Style',
      'Style Code',
      'Fabric Specs',
      'Total Order Qty',
      'Current Stage',
      'Completed Qty',
      'Stage Completion %',
      'Ex-Factory Date',
      'Ship Week',
      'Assigned Unit',
      'Status Color',
      'Required Rate (pcs/day)',
      'Actual Rate (pcs/day)',
      'Run-Rate Deficit',
      'Projected Delay Days',
      'Date Revisions Count',
    ];

    const rows = orders.map((o) => {
      const pct = Math.round((o.currentStageQuantity / o.totalQuantity) * 100);
      return [
        `"${o.poNumber}"`,
        `"${o.buyerName}"`,
        `"${o.styleName.replace(/"/g, '""')}"`,
        `"${o.styleCode}"`,
        `"${o.fabricDescription.replace(/"/g, '""')}"`,
        o.totalQuantity,
        `"${o.currentStage}"`,
        o.currentStageQuantity,
        `${pct}%`,
        o.exFactoryDate,
        o.shipWeek,
        `"${o.unitName}"`,
        o.statusColor,
        o.piecesNeededPerDay,
        o.piecesMadePerDay,
        o.runRateDeficit,
        o.projectedDelayDays,
        o.dateAudits?.length || 0,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="KnitTrack_Weekly_Status_${buyerCompanyId || 'All_Buyers'}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Export failed' },
      { status: 500 }
    );
  }
}
