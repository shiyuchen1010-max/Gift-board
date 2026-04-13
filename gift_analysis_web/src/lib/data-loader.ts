import { resolveAssetPath } from './format';
import type { BadgeDefinition, GiftRecord, ManualBadgeReviewItem } from '../types/gift';


async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(resolveAssetPath(path));

  if (!response.ok) {
    console.error(`加载数据失败: ${path}`);
    return [] as T;
  }
  return response.json() as Promise<T>;
}

export async function loadDashboardData(): Promise<{
  gifts: GiftRecord[];
  badges: BadgeDefinition[];
  manualReviews: ManualBadgeReviewItem[];
}> {
  const [rawGifts, badges, manualReviews] = await Promise.all([
    fetchJson<GiftRecord[]>('/data/gifts.json'),
    fetchJson<BadgeDefinition[]>('/data/badge_definitions.json'),
    fetchJson<ManualBadgeReviewItem[]>('/data/manual_badge_reviews.json'),
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
  };
}



