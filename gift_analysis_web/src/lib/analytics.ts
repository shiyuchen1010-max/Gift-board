import type { BadgeDefinition, BadgeSummary, ChartDatum, GiftRecord, OverviewMetrics } from '../types/gift';
import { currencyLabels, folderLabels } from './format';

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
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function buildFolderCurrencyData(gifts: GiftRecord[]): ChartDatum[] {
  return Object.entries(folderLabels).map(([folder, label]) => ({
    name: label,
    value: gifts.filter((gift) => gift.folder === folder).length,
    gold: gifts.filter((gift) => gift.folder === folder && gift.currency === 'Gold').length,
    diamond: gifts.filter((gift) => gift.folder === folder && gift.currency === 'Diamond').length,
  }));
}

export function buildBadgeTypeData(gifts: GiftRecord[], definitions: BadgeDefinition[]): ChartDatum[] {
  return definitions
    .map((definition) => ({
      name: definition.label,
      value: gifts.filter((gift) => gift.badgeType === definition.code).length,
      color: definition.color,
    }))
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
