import type { BadgeDefinition, BadgeSummary, ChartDatum, GiftRecord, OverviewMetrics } from '../types/gift';
import { currencyLabels, folderLabels } from './format';

const priceTierMeta: Record<string, { order: number; detail: string; description: string }> = {
  低价: { order: 0, detail: '0–99', description: '适合轻量试送与高频互动的入门价位。' },
  中价: { order: 1, detail: '100–999', description: '常用于日常表达和中低门槛互动。' },
  高价: { order: 2, detail: '1,000–5,999', description: '已经进入明显付费表达区间。' },
  超高价: { order: 3, detail: '6,000–19,999', description: '更偏向强展示、强情绪驱动的高价值礼物。' },
  收藏级: { order: 4, detail: '20,000+', description: '顶价礼物区间，通常承担稀缺感与强曝光。' },
  未定价: { order: 5, detail: '未识别价格', description: '当前素材未提取到明确标价。' },
};

function numericPrices(gifts: GiftRecord[]): number[] {
  return gifts.map((gift) => gift.price).filter((value): value is number => value !== null);
}

function median(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export function getOrderedPriceTiers(priceTiers: string[]): string[] {
  return [...new Set(priceTiers)].sort((left, right) => {
    const leftOrder = priceTierMeta[left]?.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = priceTierMeta[right]?.order ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.localeCompare(right, 'zh-CN');
  });
}

export function buildOverviewMetrics(filtered: GiftRecord[], all: GiftRecord[]): OverviewMetrics {
  const prices = numericPrices(filtered);
  const badgeCount = filtered.filter((gift) => gift.hasBadge).length;
  const topGift = [...filtered]
    .filter((gift) => gift.price !== null)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))[0] ?? null;
  const folderCounter = filtered.reduce<Record<string, number>>((acc, gift) => {
    acc[gift.folder] = (acc[gift.folder] ?? 0) + 1;
    return acc;
  }, {});
  const topFolderKey = Object.entries(folderCounter).sort((a, b) => b[1] - a[1])[0];
  const currencySplit = ['Gold', 'Diamond'].map((currency) => ({
    label: currencyLabels[currency as 'Gold' | 'Diamond'],
    value: filtered.filter((gift) => gift.currency === currency).length,
  }));

  return {
    total: all.length,
    visible: filtered.length,
    badgeCount,
    badgeRate: filtered.length ? badgeCount / filtered.length : 0,
    averagePrice: prices.length ? prices.reduce((sum, value) => sum + value, 0) / prices.length : 0,
    medianPrice: median(prices),
    topGift,
    topFolder: topFolderKey
      ? { name: folderLabels[topFolderKey[0] as keyof typeof folderLabels], value: topFolderKey[1] }
      : null,
    currencySplit,
  };
}

export function buildPriceTierData(gifts: GiftRecord[]): ChartDatum[] {
  const counts = gifts.reduce<Record<string, number>>((acc, gift) => {
    acc[gift.priceTier] = (acc[gift.priceTier] ?? 0) + 1;
    return acc;
  }, {});

  return getOrderedPriceTiers(Object.keys(counts)).map((name) => ({
    name,
    value: counts[name] ?? 0,
    key: name,
    detail: priceTierMeta[name]?.detail ?? '区间待补充',
    description: priceTierMeta[name]?.description ?? '当前层级暂无额外说明。',
  }));
}

export function buildFolderCurrencyData(gifts: GiftRecord[]): ChartDatum[] {
  return Object.entries(folderLabels).map(([folder, label]) => ({
    name: label,
    key: folder,
    value: gifts.filter((gift) => gift.folder === folder).length,
    gold: gifts.filter((gift) => gift.folder === folder && gift.currency === 'Gold').length,
    diamond: gifts.filter((gift) => gift.folder === folder && gift.currency === 'Diamond').length,
  }));
}

export function buildBadgeTypeData(gifts: GiftRecord[], definitions: BadgeDefinition[]): ChartDatum[] {
  const totalBadgeCount = gifts.filter((gift) => gift.hasBadge).length;

  return definitions
    .map((definition) => {
      const count = gifts.filter((gift) => gift.badgeType === definition.code).length;
      return {
        key: definition.code,
        name: definition.label,
        value: count,
        color: definition.color,
        detail: definition.gameplay,
        description: definition.description,
        percentage: totalBadgeCount ? count / totalBadgeCount : 0,
      };
    })
    .filter((item) => item.value > 0);
}

export function buildTopGiftData(gifts: GiftRecord[], limit = 8): ChartDatum[] {
  return [...gifts]
    .filter((gift) => gift.price !== null)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, limit)
    .map((gift) => ({
      name: gift.name,
      value: gift.price ?? 0,
      color: gift.hasBadge ? '#22C7F0' : '#6D5EF7',
      detail: folderLabels[gift.folder],
      description: gift.badgeType ? gift.gameplayType ?? '玩法礼物' : '基础礼物',
      giftId: gift.id,
    }));
}

export function buildBadgeSummaries(gifts: GiftRecord[], definitions: BadgeDefinition[]): BadgeSummary[] {
  return definitions
    .map((definition) => {
      const matched = gifts.filter((gift) => gift.badgeType === definition.code);
      const prices = numericPrices(matched);
      return {
        code: definition.code,
        label: definition.label,
        color: definition.color,
        gameplay: definition.gameplay,
        description: definition.description,
        count: matched.length,
        averagePrice: prices.length ? prices.reduce((sum, value) => sum + value, 0) / prices.length : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        exampleNames: matched.slice(0, 3).map((gift) => gift.name),
      };
    })
    .filter((summary) => summary.count > 0)
    .sort((a, b) => b.count - a.count);
}
