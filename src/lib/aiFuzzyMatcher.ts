// src/lib/aiFuzzyMatcher.ts
// AI-Assisted Fuzzy Matcher for Missing Order IDs with Review Queue Isolation

import { OrderRecord, AIReviewItem } from '../types';

export interface RawUnmatchedTransaction {
  id: string;
  partner: string;
  rawPaymentRef: string;
  rawAwb?: string;
  rawAmount: number;
  transactionDate: string;
  notes?: string;
}

/**
 * Normalizes an identifier string by stripping non-alphanumeric characters
 */
function cleanId(str: string): string {
  return (str || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

/**
 * Analyzes an orphaned/missing order ID transaction against existing orders
 * and calculates match signals with a confidence score.
 */
export function suggestMatchForOrphanedTransaction(
  rawTx: RawUnmatchedTransaction,
  candidateOrders: OrderRecord[]
): {
  suggestedOrderId: string | null;
  confidenceScore: number;
  matchReasons: string[];
} {
  let bestOrder: OrderRecord | null = null;
  let highestScore = 0;
  let bestReasons: string[] = [];

  const rawAwbClean = cleanId(rawTx.rawAwb || '');
  const rawRefClean = cleanId(rawTx.rawPaymentRef || '');

  for (const order of candidateOrders) {
    let score = 0;
    const reasons: string[] = [];

    // Signal 1: AWB Number Correlation (Strongest signal)
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

    // Signal 2: Order ID embedded inside raw payment reference
    const orderNumPart = order.orderId.replace(/[^0-9]/g, '');
    if (orderNumPart && rawRefClean.includes(orderNumPart)) {
      score += 35;
      reasons.push(`Order numeric ID "${orderNumPart}" detected inside payment ref "${rawTx.rawPaymentRef}"`);
    }

    // Signal 3: Amount match within tolerance (expected or gross)
    const amountDiff = Math.abs(order.expectedReceived - rawTx.rawAmount);
    const grossDiff = Math.abs(order.orderValue - rawTx.rawAmount);
    if (amountDiff <= 5) {
      score += 25;
      reasons.push(`Transaction amount ₹${rawTx.rawAmount} matches expected net payout ₹${order.expectedReceived} within ₹5`);
    } else if (grossDiff <= 5) {
      score += 20;
      reasons.push(`Transaction amount ₹${rawTx.rawAmount} matches gross order value ₹${order.orderValue}`);
    } else if (amountDiff <= 50) {
      score += 10;
      reasons.push(`Amount ₹${rawTx.rawAmount} is within ₹50 of expected ₹${order.expectedReceived}`);
    }

    // Signal 4: Partner / Courier alignment
    if (rawTx.partner && (order.channel.includes(rawTx.partner) || order.courierPartner.includes(rawTx.partner))) {
      score += 10;
      reasons.push(`Partner match: ${rawTx.partner}`);
    }

    // Signal 5: Transaction Date Proximity (e.g. within 2 to 14 days of order date)
    const orderTime = new Date(order.orderDate).getTime();
    const txTime = new Date(rawTx.transactionDate).getTime();
    const diffDays = Math.abs(txTime - orderTime) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
      score += 10;
      reasons.push(`Payment occurred ${Math.round(diffDays)} days post-order (well within normal settlement window)`);
    } else if (diffDays <= 21) {
      score += 5;
      reasons.push(`Payment occurred ${Math.round(diffDays)} days post-order`);
    }

    // Cap at 99% (as AI should never claim 100% certainty without explicit Order ID)
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

/**
 * Creates an AI Review Queue entry.
 * Explicitly sets status to PENDING and marks that it CANNOT be automatically closed.
 */
export function createReviewQueueItem(
  rawTx: RawUnmatchedTransaction,
  candidateOrders: OrderRecord[]
): AIReviewItem {
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
    status: 'PENDING', // NEVER CLOSED AUTOMATICALLY
    reviewedBy: null,
    reviewedAt: null,
    auditNote: 'Pending human finance executive verification',
    createdAt: new Date().toISOString(),
  };
}
