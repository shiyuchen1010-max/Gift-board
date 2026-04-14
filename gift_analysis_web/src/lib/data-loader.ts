import { resolveAssetPath } from './format';
import type { FacebookLudoNoChatPlan, GiftSystemAnalysis } from '../types/analysis';
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
  facebookLudoPlan: FacebookLudoNoChatPlan | null;
}> {
  const [rawGifts, badges, manualReviews, giftSystemAnalysis, facebookLudoPlan] = await Promise.all([
    fetchJson<GiftRecord[]>('/data/gifts.json', []),
    fetchJson<BadgeDefinition[]>('/data/badge_definitions.json', []),
    fetchJson<ManualBadgeReviewItem[]>('/data/manual_badge_reviews.json', []),
    fetchJson<GiftSystemAnalysis | null>('/data/gift_system_analysis.json', null),
    fetchJson<FacebookLudoNoChatPlan | null>('/data/facebook_ludo_nochat_plan.json', null),
  ]);

  const badgeMap = new Map(badges.map((badge) => [badge.code, badge]));
  const gifts = rawGifts.map((gift) => ({
    ...gift,
    gameplayType: gift.badgeType ? badgeMap.get(gift.badgeType)?.gameplay ?? gift.gameplayType : gift.gameplayType,
  }));

  return {
    gifts,
    badges,
    manualReviews,
    giftSystemAnalysis,
    facebookLudoPlan,
  };
}
