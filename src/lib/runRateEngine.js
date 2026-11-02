/**
 * Run-Rate Delay Projection Engine (ESM)
 * Built for Tiruppur Knitwear Exporters (Company A)
 */

export function calculateWorkingDays(startDate, endDate) {
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
    // 0 = Sunday
    if (current.getDay() !== 0) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
}

export function addWorkingDays(startDate, workingDaysToAdd) {
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

export function computeRunRate(input) {
  const asOf = input.asOfDate ? new Date(input.asOfDate) : new Date();
  asOf.setHours(0, 0, 0, 0);

  const exFactory = new Date(input.exFactoryDate);
  exFactory.setHours(0, 0, 0, 0);

  const orderValue = input.orderValueInr || 2100000;
  const completed = Math.max(0, input.currentStageQuantity);
  const total = Math.max(1, input.totalQuantity);
  const piecesRemaining = Math.max(0, total - completed);
  const completionPercentage = Math.min(100, Math.round((completed / total) * 100));

  const workingDaysRemaining = calculateWorkingDays(asOf, exFactory);
  const calendarDaysRemaining = Math.max(
    0,
    Math.ceil((exFactory.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24))
  );

  let piecesNeededPerDay = 0;
  if (workingDaysRemaining > 0) {
    piecesNeededPerDay = Math.ceil(piecesRemaining / workingDaysRemaining);
  } else if (piecesRemaining > 0) {
    piecesNeededPerDay = piecesRemaining;
  }

  let piecesMadePerDay = 0;
  if (input.recentLogs && input.recentLogs.length > 0) {
    const totalLogged = input.recentLogs.reduce(
      (sum, log) => sum + (log.quantityProduced || 0),
      0
    );
    const validDays = Math.max(1, input.recentLogs.length);
    piecesMadePerDay = Math.round(totalLogged / validDays);
  } else if (completed > 0) {
    piecesMadePerDay = Math.round(completed / Math.max(1, 10));
  } else {
    piecesMadePerDay = input.defaultCapacityPerDay || 0;
  }

  const runRateDeficit = piecesNeededPerDay - piecesMadePerDay;

  let projectedDaysToComplete = 0;
  if (piecesRemaining === 0) {
    projectedDaysToComplete = 0;
  } else if (piecesMadePerDay > 0) {
    projectedDaysToComplete = Math.ceil(piecesRemaining / piecesMadePerDay);
  } else {
    projectedDaysToComplete = 999;
  }

  let projectedDelayDays = 0;
  if (piecesRemaining > 0) {
    if (workingDaysRemaining <= 0) {
      projectedDelayDays = Math.max(1, projectedDaysToComplete);
    } else {
      projectedDelayDays = Math.max(0, projectedDaysToComplete - workingDaysRemaining);
    }
  }

  const projectedDate = addWorkingDays(asOf, projectedDaysToComplete);

  let statusColor = 'GREEN';
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

  let potentialAirFreight = 0;
  let potentialDiscount = 0;

  if (statusColor === 'RED') {
    if (projectedDelayDays >= 5) {
      potentialAirFreight = 350000;
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

  const formulaBreakdown = {
    remainingPcsStep: `${total.toLocaleString()} total pcs - ${completed.toLocaleString()} completed = ${piecesRemaining.toLocaleString()} pcs remaining`,
    workingDaysStep: `${workingDaysRemaining} working days left (ex-factory: ${exFactory.toISOString().split('T')[0]}, excluding Sundays)`,
    requiredRateStep:
      workingDaysRemaining > 0
        ? `Math.ceil(${piecesRemaining.toLocaleString()} / ${workingDaysRemaining}) = ${piecesNeededPerDay.toLocaleString()} pcs/day required`
        : `Deadline reached: all ${piecesRemaining.toLocaleString()} pcs needed immediately`,
    actualRateStep:
      input.recentLogs && input.recentLogs.length > 0
        ? `Average of last ${input.recentLogs.length} days = ${piecesMadePerDay.toLocaleString()} pcs/day actual`
        : `Current average = ${piecesMadePerDay.toLocaleString()} pcs/day`,
    deficitStep: `${piecesNeededPerDay.toLocaleString()} required - ${piecesMadePerDay.toLocaleString()} actual = ${runRateDeficit > 0 ? `-${runRateDeficit.toLocaleString()} deficit (shortfall)` : `+${Math.abs(runRateDeficit).toLocaleString()} surplus`}`,
    projectedCompletionStep:
      piecesMadePerDay > 0
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
