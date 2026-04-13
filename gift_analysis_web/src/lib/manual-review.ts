import type { BadgeDefinition, GiftRecord, ManualBadgeReviewItem } from '../types/gift';

export interface GiftBadgeBinding {
  giftId: string;
  folder: string;
  fileName: string;
  badgeType: string | null;
  hasBadge: boolean;
  confidence: number;
  source: string;
  bbox: number[] | null;
  bestScore: number | null;
  reviewRequired: boolean;
  reviewStatus: string;
}

export interface BadgeRecognitionReport extends Record<string, unknown> {
  giftCount?: number;
  reviewQueueCount?: number;
  pendingReviewCount?: number;
  reviewedCount?: number;
  lowConfidence?: ManualBadgeReviewItem[];
}

export type ReviewDecision =
  | { kind: 'confirmed' }
  | { kind: 'corrected'; hasBadge: boolean; badgeType: string | null };

const NO_BADGE_LABEL = '无角标';
const UNKNOWN_BADGE = 'unknown-badge';

function humanizeBadgeCode(code: string): string {
  return code.replace(/[-_]/g, ' ');
}

export function buildBadgeLabelMap(definitions: BadgeDefinition[]): Map<string, string> {
  return new Map(definitions.map((definition) => [definition.code, definition.label]));
}

export function getBadgeLabel(code: string | null | undefined, badgeLabelMap: Map<string, string>): string {
  if (!code) {
    return NO_BADGE_LABEL;
  }
  return badgeLabelMap.get(code) ?? humanizeBadgeCode(code);
}

export function resetManualReviewItem(item: ManualBadgeReviewItem): ManualBadgeReviewItem {
  return {
    ...item,
    reviewStatus: 'pending',
    reviewHasBadge: null,
    reviewBadgeType: null,
    reviewBadgeLabel: NO_BADGE_LABEL,
    finalHasBadge: item.predictedHasBadge,
    finalBadgeType: item.predictedBadgeType,
    finalBadgeLabel: item.predictedBadgeLabel,
  };
}

export function buildManualReviewItemUpdate(
  item: ManualBadgeReviewItem,
  badgeLabelMap: Map<string, string>,
  decision: ReviewDecision,
): ManualBadgeReviewItem {
  if (decision.kind === 'confirmed') {
    return {
      ...item,
      reviewStatus: 'confirmed',
      reviewHasBadge: null,
      reviewBadgeType: null,
      reviewBadgeLabel: NO_BADGE_LABEL,
      finalHasBadge: item.predictedHasBadge,
      finalBadgeType: item.predictedBadgeType,
      finalBadgeLabel: item.predictedBadgeLabel,
    };
  }

  const nextBadgeType = decision.hasBadge ? decision.badgeType ?? UNKNOWN_BADGE : null;
  const nextBadgeLabel = getBadgeLabel(nextBadgeType, badgeLabelMap);

  return {
    ...item,
    reviewStatus: 'corrected',
    reviewHasBadge: decision.hasBadge,
    reviewBadgeType: nextBadgeType,
    reviewBadgeLabel: nextBadgeLabel,
    finalHasBadge: decision.hasBadge,
    finalBadgeType: nextBadgeType,
    finalBadgeLabel: nextBadgeLabel,
  };
}

export function applyManualReviewsToGifts(
  baseGifts: GiftRecord[],
  manualReviews: ManualBadgeReviewItem[],
  badgeDefinitions: BadgeDefinition[],
): GiftRecord[] {
  const reviewMap = new Map(manualReviews.map((item) => [item.giftId, item]));
  const gameplayMap = new Map(badgeDefinitions.map((badge) => [badge.code, badge.gameplay]));

  return baseGifts.map((gift) => {
    const review = reviewMap.get(gift.id);
    if (!review) {
      return {
        ...gift,
        gameplayType: gift.badgeType ? gameplayMap.get(gift.badgeType) ?? gift.gameplayType : gift.gameplayType,
      };
    }

    const finalBadgeType = review.finalBadgeType;
    return {
      ...gift,
      hasBadge: review.finalHasBadge,
      badgeType: finalBadgeType,
      gameplayType: finalBadgeType && finalBadgeType !== UNKNOWN_BADGE ? gameplayMap.get(finalBadgeType) ?? finalBadgeType : null,
      badgeConfidence: review.reviewStatus === 'pending' ? review.predictedConfidence : 1.0,
    };
  });
}

export function sortManualReviewItems(items: ManualBadgeReviewItem[]): ManualBadgeReviewItem[] {
  return [...items].sort((left, right) => {
    const pendingOrder = Number(left.reviewStatus !== 'pending') - Number(right.reviewStatus !== 'pending');
    if (pendingOrder !== 0) {
      return pendingOrder;
    }
    if (left.predictedConfidence !== right.predictedConfidence) {
      return left.predictedConfidence - right.predictedConfidence;
    }
    if (left.folder !== right.folder) {
      return left.folder.localeCompare(right.folder);
    }
    return left.giftId.localeCompare(right.giftId);
  });
}

export function buildPatchedBindings(
  existingBindings: GiftBadgeBinding[],
  manualReviews: ManualBadgeReviewItem[],
): GiftBadgeBinding[] {
  const reviewMap = new Map(manualReviews.map((item) => [item.giftId, item]));

  return existingBindings.map((binding) => {
    const review = reviewMap.get(binding.giftId);
    if (!review) {
      return binding;
    }

    return {
      ...binding,
      badgeType: review.finalBadgeType,
      hasBadge: review.finalHasBadge,
      confidence: review.reviewStatus === 'pending' ? review.predictedConfidence : 1.0,
      source:
        review.reviewStatus === 'confirmed'
          ? 'manual-confirmed'
          : review.reviewStatus === 'corrected'
            ? 'manual-corrected'
            : review.predictedSource,
      bbox: review.bbox,
      bestScore: review.bestScore,
      reviewRequired: true,
      reviewStatus: review.reviewStatus,
    };
  });
}

export function buildPatchedRecognitionReport(
  existingReport: BadgeRecognitionReport,
  manualReviews: ManualBadgeReviewItem[],
  gifts: GiftRecord[],
): BadgeRecognitionReport {
  const pendingReviewCount = manualReviews.filter((item) => item.reviewStatus === 'pending').length;
  const reviewedCount = manualReviews.length - pendingReviewCount;

  return {
    ...existingReport,
    giftCount: gifts.length,
    reviewQueueCount: manualReviews.length,
    pendingReviewCount,
    reviewedCount,
    lowConfidence: manualReviews.filter((item) => item.predictedHasBadge && item.predictedConfidence < 0.6),
  };
}

export function hasSameManualReviewState(
  current: ManualBadgeReviewItem,
  saved: ManualBadgeReviewItem | undefined,
): boolean {
  if (!saved) {
    return false;
  }

  return current.reviewStatus === saved.reviewStatus
    && current.reviewHasBadge === saved.reviewHasBadge
    && current.reviewBadgeType === saved.reviewBadgeType
    && current.finalHasBadge === saved.finalHasBadge
    && current.finalBadgeType === saved.finalBadgeType
    && current.notes === saved.notes;
}
