/**
 * Run-Rate Delay Projection Engine
 * Built for Tiruppur Knitwear Exporters (Company A)
 * 
 * Math logic:
 * - Calculates remaining pieces and remaining working days (standard 6-day Tiruppur factory week, Mon-Sat).
 * - Computes required run-rate: pieces needed per day to meet Ex-Factory Date.
 * - Computes actual run-rate: pieces made per day based on recent supervisor production logs.
 * - Flags delay warnings 2 weeks early (Amber/Red) to prevent ₹3.5L air freight or 5% discount penalties.
 */

export interface DailyLogInput {
  date: Date | string;
  quantityProduced: number;
}

export interface RunRateInput {
  totalQuantity: number;
  currentStageQuantity: number;
  exFactoryDate: Date | string;
  asOfDate?: Date | string;
  orderValueInr?: number;
  recentLogs?: DailyLogInput[];
  defaultCapacityPerDay?: number;
}

export interface RunRateResult {
  totalQuantity: number;
  completedQuantity: number;
  piecesRemaining: number;
  completionPercentage: number;
  
  asOfDate: string;
  exFactoryDate: string;
  daysRemaining: number; // working days excluding Sundays
  calendarDaysRemaining: number;
  
  piecesNeededPerDay: number;
  piecesMadePerDay: number;
  runRateDeficit: number; // piecesNeededPerDay - piecesMadePerDay (positive = shortfall)
  
  projectedDaysToComplete: number;
  projectedDelayDays: number;
  projectedCompletionDate: string;
  
  statusColor: 'GREEN' | 'AMBER' | 'RED';
  statusReason: string;
  
  financialRisk: {
    potentialAirFreightPenalty: number; // ₹3,50,000 if critical delay
    potentialDiscountPenalty: number;   // 5% of order value (e.g. ₹1,05,000)
    totalAtRisk: number;
    riskSummary: string;
  };
  
  formulaBreakdown: {
    remainingPcsStep: string;
    workingDaysStep: string;
    requiredRateStep: string;
    actualRateStep: string;
    deficitStep: string;
    projectedCompletionStep: string;
  };
}

/**
 * Calculates working days between two dates, excluding Sundays.
 * In Tiruppur textile mills, normal operations run Monday through Saturday.
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (start >= end) {
    return 0;
  }

  let workingDays = 0;
  const current = new Date(start);

  while (current < end) {
    // 0 = Sunday. Sunday is weekly off in Tiruppur units.
    if (current.getDay() !== 0) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
}

/**
 * Adds N working days to a starting date, skipping Sundays.
 */
export function addWorkingDays(startDate: Date, workingDaysToAdd: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < workingDaysToAdd) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) {
      added++;
    }
  }
  return result;
}

export function computeRunRate(input: RunRateInput): RunRateResult {
  const asOf = input.asOfDate ? new Date(input.asOfDate) : new Date();
  asOf.setHours(0, 0, 0, 0);
  
  const exFactory = new Date(input.exFactoryDate);
  exFactory.setHours(0, 0, 0, 0);
  
  const orderValue = input.orderValueInr || 2100000; // Default ₹21 Lakh
  const completed = Math.max(0, input.currentStageQuantity);
  const total = Math.max(1, input.totalQuantity);
  const piecesRemaining = Math.max(0, total - completed);
  const completionPercentage = Math.min(100, Math.round((completed / total) * 100));

  // Time calculations
  const workingDaysRemaining = calculateWorkingDays(asOf, exFactory);
  const calendarDaysRemaining = Math.max(0, Math.ceil((exFactory.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24)));

  // Pieces needed per day
  let piecesNeededPerDay = 0;
  if (workingDaysRemaining > 0) {
    piecesNeededPerDay = Math.ceil(piecesRemaining / workingDaysRemaining);
  } else if (piecesRemaining > 0) {
    piecesNeededPerDay = piecesRemaining; // Ex-factory already past or today!
  }

  // Pieces made per day (Actual run rate from logs)
  let piecesMadePerDay = 0;
  if (input.recentLogs && input.recentLogs.length > 0) {
    const totalLogged = input.recentLogs.reduce((sum, log) => sum + (log.quantityProduced || 0), 0);
    const validDays = Math.max(1, input.recentLogs.length);
    piecesMadePerDay = Math.round(totalLogged / validDays);
  } else if (completed > 0) {
    // Fallback if no individual logs: assume standard paced output
    piecesMadePerDay = Math.round(completed / Math.max(1, 10));
  } else {
    // If not started yet
    piecesMadePerDay = input.defaultCapacityPerDay || 0;
  }

  const runRateDeficit = piecesNeededPerDay - piecesMadePerDay;

  // Projected days to complete
  let projectedDaysToComplete = 0;
  if (piecesRemaining === 0) {
    projectedDaysToComplete = 0;
  } else if (piecesMadePerDay > 0) {
    projectedDaysToComplete = Math.ceil(piecesRemaining / piecesMadePerDay);
  } else {
    projectedDaysToComplete = 999; // Halting / blocked
  }

  // Projected delay
  let projectedDelayDays = 0;
  if (piecesRemaining > 0) {
    if (workingDaysRemaining <= 0) {
      projectedDelayDays = Math.max(1, projectedDaysToComplete);
    } else {
      projectedDelayDays = Math.max(0, projectedDaysToComplete - workingDaysRemaining);
    }
  }

  const projectedDate = addWorkingDays(asOf, projectedDaysToComplete);

  // Status Color Logic:
  // GREEN: on track (projectedDelayDays == 0 and deficit <= 0)
  // AMBER: mild shortfall (1-3 days delay, or rate deficit < 20% of required)
  // RED: severe shortfall (>= 4 days delay, or 0 production, or deadline passed)
  let statusColor: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
  let statusReason = 'Production is on schedule to meet buyer ex-factory date.';

  if (piecesRemaining === 0) {
    statusColor = 'GREEN';
    statusReason = 'Order production completed 100%. Ready for dispatch.';
  } else if (workingDaysRemaining <= 0) {
    statusColor = 'RED';
    statusReason = `CRITICAL: Ex-factory date (${exFactory.toISOString().split('T')[0]}) has arrived with ${piecesRemaining.toLocaleString()} pcs remaining.`;
  } else if (projectedDelayDays >= 4 || piecesMadePerDay < piecesNeededPerDay * 0.6) {
    statusColor = 'RED';
    statusReason = `HIGH RISK: Projected ${projectedDelayDays} days late. Making ${piecesMadePerDay} pcs/day vs ${piecesNeededPerDay} pcs/day required (shortfall: ${runRateDeficit} pcs/day).`;
  } else if (projectedDelayDays >= 1 || runRateDeficit > 0) {
    statusColor = 'AMBER';
    statusReason = `WARNING: Projected ${projectedDelayDays} days late. Output is ${piecesMadePerDay} pcs/day vs ${piecesNeededPerDay} pcs/day required.`;
  }

  // Financial Risk Modeling based on Tiruppur client brief numbers:
  // Air freight penalty = ₹3,50,000 (15 out of 40 late orders)
  // 5% late discount = 5% of ₹21L = ₹1,05,000 (25 out of 40 late orders)
  let potentialAirFreight = 0;
  let potentialDiscount = 0;

  if (statusColor === 'RED') {
    if (projectedDelayDays >= 5) {
      potentialAirFreight = 350000; // Sea to air freight mandatory
      potentialDiscount = Math.round(orderValue * 0.05);
    } else {
      potentialDiscount = Math.round(orderValue * 0.05);
    }
  } else if (statusColor === 'AMBER') {
    potentialDiscount = Math.round(orderValue * 0.05);
  }

  const totalAtRisk = potentialAirFreight + potentialDiscount;
  let riskSummary = 'No immediate financial penalty risk.';
  if (potentialAirFreight > 0) {
    riskSummary = `₹${(totalAtRisk / 100000).toFixed(2)} Lakh at risk (₹3.5L sea-to-air freight shift + ₹${(potentialDiscount / 100000).toFixed(2)}L 5% buyer discount).`;
  } else if (potentialDiscount > 0) {
    riskSummary = `₹${(potentialDiscount / 100000).toFixed(2)} Lakh at risk (5% buyer late shipment discount penalty).`;
  }

  // Step-by-step formula breakdown for UI transparency
  const formulaBreakdown = {
    remainingPcsStep: `${total.toLocaleString()} total pcs - ${completed.toLocaleString()} completed = ${piecesRemaining.toLocaleString()} pcs remaining`,
    workingDaysStep: `${workingDaysRemaining} working days left (ex-factory: ${exFactory.toISOString().split('T')[0]}, excluding Sundays)`,
    requiredRateStep: workingDaysRemaining > 0 
      ? `Math.ceil(${piecesRemaining.toLocaleString()} / ${workingDaysRemaining}) = ${piecesNeededPerDay.toLocaleString()} pcs/day required`
      : `Deadline reached: all ${piecesRemaining.toLocaleString()} pcs needed immediately`,
    actualRateStep: input.recentLogs && input.recentLogs.length > 0
      ? `Average of last ${input.recentLogs.length} days = ${piecesMadePerDay.toLocaleString()} pcs/day actual`
      : `Current average = ${piecesMadePerDay.toLocaleString()} pcs/day`,
    deficitStep: `${piecesNeededPerDay.toLocaleString()} required - ${piecesMadePerDay.toLocaleString()} actual = ${runRateDeficit > 0 ? `-${runRateDeficit.toLocaleString()} deficit (shortfall)` : `+${Math.abs(runRateDeficit).toLocaleString()} surplus`}`,
    projectedCompletionStep: piecesMadePerDay > 0
      ? `${piecesRemaining.toLocaleString()} pcs / ${piecesMadePerDay.toLocaleString()} pcs/day = ${projectedDaysToComplete} working days needed. Projected date: ${projectedDate.toISOString().split('T')[0]} (${projectedDelayDays > 0 ? `${projectedDelayDays} days delay` : 'on time'})`
      : `Production halted: cannot estimate completion date without daily output`,
  };

  return {
    totalQuantity: total,
    completedQuantity: completed,
    piecesRemaining,
    completionPercentage,
    asOfDate: asOf.toISOString().split('T')[0],
    exFactoryDate: exFactory.toISOString().split('T')[0],
    daysRemaining: workingDaysRemaining,
    calendarDaysRemaining,
    piecesNeededPerDay,
    piecesMadePerDay,
    runRateDeficit,
    projectedDaysToComplete,
    projectedDelayDays,
    projectedCompletionDate: projectedDate.toISOString().split('T')[0],
    statusColor,
    statusReason,
    financialRisk: {
      potentialAirFreightPenalty: potentialAirFreight,
      potentialDiscountPenalty: potentialDiscount,
      totalAtRisk,
      riskSummary,
    },
    formulaBreakdown,
  };
}
