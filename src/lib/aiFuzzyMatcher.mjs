// src/lib/aiFuzzyMatcher.mjs
// AI-Assisted Fuzzy Matcher for Missing Order IDs with Review Queue Isolation

function cleanId(str) {
  return (str || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export function suggestMatchForOrphanedTransaction(rawTx, candidateOrders) {
  let bestOrder = null;
  let highestScore = 0;
  let bestReasons = [];

  const rawAwbClean = cleanId(rawTx.rawAwb || '');
  const rawRefClean = cleanId(rawTx.rawPaymentRef || '');

  for (const order of candidateOrders) {
    let score = 0;
    const reasons = [];

    const orderAwbClean = cleanId(order.awbNumber);
    if (rawAwbClean && orderAwbClean) {
      if (rawAwbClean === orderAwbClean) {
        score += 55;
        reasons.push(`Exact AWB Match: ${order.awbNumber}`);
      } else if (rawAwbClean.includes(orderAwbClean) || orderAwbClean.includes(rawAwbClean)) {
        score += 40;
        reasons.push(`Partial AWB Match: ${rawTx.rawAwb} ~ ${order.awbNumber}`);
      }
    }

    const orderNumPart = order.orderId.replace(/[^0-9]/g, '');
    if (orderNumPart && rawRefClean.includes(orderNumPart)) {
      score += 35;
      reasons.push(`Order numeric ID "${orderNumPart}" detected inside payment ref "${rawTx.rawPaymentRef}"`);
    }

    const amountDiff = Math.abs(order.expectedReceived - rawTx.rawAmount);
    const grossDiff = Math.abs(order.orderValue - rawTx.rawAmount);
    if (amountDiff <= 5) {
      score += 25;
      reasons.push(`Transaction amount ₹${rawTx.rawAmount} matches expected net payout ₹${order.expectedReceived} within ₹5`);
    } else if (grossDiff <= 5) {
      score += 20;
      reasons.push(`Transaction amount ₹${rawTx.rawAmount} matches gross order value ₹${order.orderValue}`);
    }

    if (rawTx.partner && (order.channel.includes(rawTx.partner) || order.courierPartner.includes(rawTx.partner))) {
      score += 10;
      reasons.push(`Partner match: ${rawTx.partner}`);
    }

    const orderTime = new Date(order.orderDate).getTime();
    const txTime = new Date(rawTx.transactionDate).getTime();
    const diffDays = Math.abs(txTime - orderTime) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
      score += 10;
      reasons.push(`Payment occurred ${Math.round(diffDays)} days post-order`);
    }

    const normalizedScore = Math.min(99, score);

    if (normalizedScore > highestScore) {
      highestScore = normalizedScore;
      bestOrder = order;
      bestReasons = reasons;
    }
  }

  return {
    suggestedOrderId: bestOrder ? bestOrder.orderId : null,
    confidenceScore: highestScore,
    matchReasons: bestReasons,
  };
}

export function createReviewQueueItem(rawTx, candidateOrders) {
  const matchResult = suggestMatchForOrphanedTransaction(rawTx, candidateOrders);
  const matchedOrder = candidateOrders.find(o => o.orderId === matchResult.suggestedOrderId) || null;

  return {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    partner: rawTx.partner,
    rawPaymentRef: rawTx.rawPaymentRef,
    rawAwb: rawTx.rawAwb || 'N/A',
    rawAmount: rawTx.rawAmount,
    transactionDate: rawTx.transactionDate,
    suggestedOrderId: matchResult.suggestedOrderId || 'UNIDENTIFIED',
    suggestedOrder: matchedOrder,
    confidenceScore: matchResult.confidenceScore,
    matchReasons: matchResult.matchReasons.length > 0 
      ? matchResult.matchReasons 
      : ['No high-confidence match candidate found across active orders'],
    status: 'PENDING',
    reviewedBy: null,
    reviewedAt: null,
    auditNote: 'Pending human finance executive verification',
    createdAt: new Date().toISOString(),
  };
}
