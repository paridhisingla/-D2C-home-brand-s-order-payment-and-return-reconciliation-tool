// src/app/api/returns/route.ts
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const orders = store.getOrders();
    // Filter returns or RTO orders
    const returnOrders = orders.filter(o =>
      o.deliveryStatus === 'Returned to warehouse' ||
      o.deliveryStatus === 'RTO initiated' ||
      o.deliveryStatus === 'Lost in transit' ||
      o.reconciliationStatus === 'Return not received'
    );

    const lostCount = returnOrders.filter(o => o.reconciliationStatus === 'Return not received').length;
    const verifiedCount = returnOrders.filter(o => o.warehouseScanDate !== null).length;

    return NextResponse.json({
      totalReturns: returnOrders.length,
      lostReturnsCount: lostCount,
      verifiedWarehouseReceiptCount: verifiedCount,
      orders: returnOrders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { awbOrOrderId, condition } = body;

    if (!awbOrOrderId) {
      return NextResponse.json({ error: 'awbOrOrderId is required to record warehouse receipt scan' }, { status: 400 });
    }

    const result = store.logWarehouseScan(awbOrOrderId, condition);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
