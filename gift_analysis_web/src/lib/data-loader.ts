import { formatUsd, resolveAssetPath } from './format';
import { buildRechargeEstimator } from './recharge';
import type { GiftSystemAnalysis } from '../types/analysis';
import type { BadgeDefinition, GiftRecord, ManualBadgeReviewItem } from '../types/gift';


async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  const response = await fetch(resolveAssetPath(path));

  if (!response.ok) {
    console.error(`加载数据失败: ${path}`);
    return fallback;
  }

  return response.json() as Promise<T>;
}

export async function loadDashboardData(): Promise<{
  gifts: GiftRecord[];
  badges: BadgeDefinition[];
  manualReviews: ManualBadgeReviewItem[];
  giftSystemAnalysis: GiftSystemAnalysis | null;
}> {
  const [rawGifts, badges, manualReviews, giftSystemAnalysis] = await Promise.all([
    fetchJson<GiftRecord[]>('/data/gifts.json', []),
    fetchJson<BadgeDefinition[]>('/data/badge_definitions.json', []),
    fetchJson<ManualBadgeReviewItem[]>('/data/manual_badge_reviews.json', []),
    fetchJson<GiftSystemAnalysis | null>('/data/gift_system_analysis.json', null),
  ]);


  const badgeMap = new Map(badges.map((badge) => [badge.code, badge]));
  const maxDiamondPrice = rawGifts.reduce((currentMax, gift) => {
    if (gift.currency !== 'Diamond' || gift.price === null) {
      return currentMax;
    }
    return Math.max(currentMax, gift.price);
  }, 0);
  const estimateRecharge = buildRechargeEstimator(maxDiamondPrice);

  const gifts = rawGifts.map((gift) => {
    const rechargeEstimate = gift.currency === 'Diamond' && gift.price !== null ? estimateRecharge(gift.price) : null;

    return {
      ...gift,
      estimatedUsd: rechargeEstimate?.estimatedUsd ?? null,
      estimatedUsdLabel: rechargeEstimate ? formatUsd(rechargeEstimate.estimatedUsd) : null,
      rechargePlanLabel: rechargeEstimate?.rechargePlanLabel ?? null,
      rechargeCoveredDiamonds: rechargeEstimate?.coveredDiamonds ?? null,
      gameplayType: gift.badgeType ? badgeMap.get(gift.badgeType)?.gameplay ?? gift.gameplayType : gift.gameplayType,
    };
  });

  return {
    gifts,
    badges,
    manualReviews,
    giftSystemAnalysis,
  };
}

