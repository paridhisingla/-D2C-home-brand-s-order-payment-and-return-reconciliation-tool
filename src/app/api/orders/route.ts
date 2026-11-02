import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerCompanyId = searchParams.get('buyerCompanyId') || undefined;
    const unitId = searchParams.get('unitId') || undefined;
    const shipWeek = searchParams.get('shipWeek') || undefined;
    const statusColor = searchParams.get('statusColor') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await getOrders({
      buyerCompanyId,
      unitId,
      shipWeek,
      statusColor,
      search,
    });

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.poNumber || !body.buyerId || !body.styleName || !body.totalQuantity || !body.exFactoryDate || !body.unitId) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields (PO, Buyer, Style, Qty, Ex-factory date, Unit)' },
        { status: 400 }
      );
    }

    const newOrder = await createOrder(body);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
