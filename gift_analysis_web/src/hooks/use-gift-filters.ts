import { useMemo, useState } from 'react';

import { getOrderedPriceTiers } from '../lib/analytics';
import { currencyLabels, folderLabels } from '../lib/format';
import type { ActiveFilterChip, BadgeDefinition, FilterState, GiftRecord } from '../types/gift';

const initialState: FilterState = {
  query: '',
  folder: 'all',
  currency: 'all',
  badgeMode: 'all',
  badgeType: 'all',
  gameplayType: 'all',
  priceTier: 'all',
  sortKey: 'price-desc',
};

const sortLabels: Record<FilterState['sortKey'], string> = {
  'price-desc': '价格从高到低',
  'price-asc': '价格从低到高',
  'name-asc': '名称 A-Z',
  'badge-confidence': '角标识别把握',
};

function normalizeFilters(next: FilterState): FilterState {
  if (next.gameplayType !== 'all') {
    next.badgeType = 'all';
  }
  if (next.badgeType !== 'all') {
    next.gameplayType = 'all';
  }
  return next;
}

export function useGiftFilters(gifts: GiftRecord[], badges: BadgeDefinition[]) {
  const [filters, setFilters] = useState<FilterState>(initialState);

  const options = useMemo(() => {
    const badgeTypes = badges.filter((item) => item.code !== 'unknown-badge');
    const gameplayValues = Array.from(new Set(badgeTypes.map((item) => item.gameplay).filter(Boolean)));
    const priceTiers = getOrderedPriceTiers(gifts.map((gift) => gift.priceTier));
    return {
      badgeTypes,
      gameplayValues,
      priceTiers,
    };
  }, [badges, gifts]);

  const badgeGameplayMap = useMemo(
    () => new Map(options.badgeTypes.map((badge) => [badge.code, badge.gameplay || badge.label])),
    [options.badgeTypes],
  );


  const filteredGifts = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const result = gifts.filter((gift) => {
      if (filters.folder !== 'all' && gift.folder !== filters.folder) return false;
      if (filters.currency !== 'all' && gift.currency !== filters.currency) return false;
      if (filters.badgeMode === 'with' && !gift.hasBadge) return false;
      if (filters.badgeMode === 'without' && gift.hasBadge) return false;
      if (filters.badgeType !== 'all' && gift.badgeType !== filters.badgeType) return false;
      if (filters.gameplayType !== 'all' && gift.gameplayType !== filters.gameplayType) return false;
      if (filters.priceTier !== 'all' && gift.priceTier !== filters.priceTier) return false;
      if (!normalizedQuery) return true;
      return [gift.name, gift.folder, gift.badgeType ?? '', gift.priceLabel].join(' ').toLowerCase().includes(normalizedQuery);
    });

    return [...result].sort((a, b) => {
      if (filters.sortKey === 'price-asc') return (a.price ?? -1) - (b.price ?? -1);
      if (filters.sortKey === 'price-desc') return (b.price ?? -1) - (a.price ?? -1);
      if (filters.sortKey === 'badge-confidence') return b.badgeConfidence - a.badgeConfidence;
      return a.name.localeCompare(b.name);
    });
  }, [filters, gifts]);

  const activeFilters = useMemo<ActiveFilterChip[]>(() => {
    const next: ActiveFilterChip[] = [];

    if (filters.query.trim()) {
      next.push({ key: 'query', label: '关键词', value: filters.query.trim() });
    }
    if (filters.folder !== 'all') {
      next.push({ key: 'folder', label: '礼物分类', value: folderLabels[filters.folder] });
    }
    if (filters.currency !== 'all') {
      next.push({ key: 'currency', label: '货币类型', value: currencyLabels[filters.currency] });
    }
    if (filters.badgeMode !== 'all') {
      next.push({ key: 'badgeMode', label: '角标状态', value: filters.badgeMode === 'with' ? '仅看有角标' : '仅看无角标' });
    }
    if (filters.badgeType !== 'all') {
      next.push({ key: 'badgeType', label: '玩法标签', value: badgeGameplayMap.get(filters.badgeType) ?? filters.badgeType });
    }
    if (filters.gameplayType !== 'all') {
      next.push({ key: 'gameplayType', label: '玩法标签', value: filters.gameplayType });
    }

    if (filters.priceTier !== 'all') {
      next.push({ key: 'priceTier', label: '价格分层', value: filters.priceTier });
    }
    if (filters.sortKey !== initialState.sortKey) {
      next.push({ key: 'sortKey', label: '排序方式', value: sortLabels[filters.sortKey] });
    }

    return next;
  }, [badgeGameplayMap, filters]);


  function updateFilter<Key extends keyof FilterState>(key: Key, value: FilterState[Key]) {
    setFilters((prev) => normalizeFilters({ ...prev, [key]: value }));
  }

  function applyFilterPatch(patch: Partial<FilterState>) {
    setFilters((prev) => normalizeFilters({ ...prev, ...patch }));
  }

  function clearFilter(key: keyof FilterState) {
    setFilters((prev) => normalizeFilters({ ...prev, [key]: initialState[key] }));
  }

  function resetFilters() {
    setFilters(initialState);
  }

  return {
    filters,
    filteredGifts,
    options,
    activeFilters,
    updateFilter,
    applyFilterPatch,
    clearFilter,
    resetFilters,
  };
}
