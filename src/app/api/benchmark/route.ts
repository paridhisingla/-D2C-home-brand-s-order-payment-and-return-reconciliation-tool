// src/app/api/benchmark/route.ts
import { NextResponse } from 'next/server';
import { runHighSpeedOneLakhBenchmark } from '@/lib/benchmarkEngine';

export async function POST(request: Request) {
  try {
    let rowCount = 100000;
    try {
      const body = await request.json();
      if (body?.count && typeof body.count === 'number') {
        rowCount = Math.min(250000, Math.max(1000, body.count));
      }
    } catch {
      // default 100,000
    }

    const result = runHighSpeedOneLakhBenchmark(rowCount);

    return NextResponse.json({
      success: true,
      message: `Successfully processed and reconciled ${result.totalRowsProcessed.toLocaleString()} rows in ${result.elapsedSeconds} seconds (${result.rowsPerSecond.toLocaleString()} rows/sec)`,
      ...result,
      targetSlaSeconds: 60.0,
      speedupFactor: Math.round((60.0 / Math.max(0.001, result.elapsedSeconds)) * 10) / 10,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
