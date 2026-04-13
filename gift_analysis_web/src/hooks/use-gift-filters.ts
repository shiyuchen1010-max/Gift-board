import { useMemo, useState } from 'react';
import type { BadgeDefinition, FilterState, GiftRecord } from '../types/gift';



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

export function useGiftFilters(gifts: GiftRecord[], badges: BadgeDefinition[]) {
  const [filters, setFilters] = useState<FilterState>(initialState);

  const options = useMemo(() => {
    const badgeTypes = badges.filter((item) => item.code !== 'unknown-badge');
    const gameplayValues = Array.from(new Set(badgeTypes.map((item) => item.gameplay).filter(Boolean)));
    const priceTiers = Array.from(new Set(gifts.map((gift) => gift.priceTier)));
    return {
      badgeTypes,
      gameplayValues,
      priceTiers,
    };
  }, [badges, gifts]);



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

  function updateFilter<Key extends keyof FilterState>(key: Key, value: FilterState[Key]) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'gameplayType' && value !== 'all') {
        next.badgeType = 'all';
      }
      if (key === 'badgeType' && value !== 'all') {
        next.gameplayType = 'all';
      }
      return next;
    });
  }


  function resetFilters() {
    setFilters(initialState);
  }

  return {
    filters,
    filteredGifts,
    options,
    updateFilter,
    resetFilters,
  };
}
