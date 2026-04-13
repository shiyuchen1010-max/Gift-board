export type GiftFolder = 'classic' | 'activity' | 'member' | 'royal';
export type CurrencyType = 'Gold' | 'Diamond' | null;
export type BadgeMode = 'all' | 'with' | 'without';
export type SortKey = 'price-desc' | 'price-asc' | 'name-asc' | 'badge-confidence';

export interface GiftRecord {
  id: string;
  folder: GiftFolder;
  fileName: string;
  fileStem: string;
  imagePath: string;
  relativeImagePath: string;
  slotRaw: string;
  slot: number;
  screen: number;
  row: number;
  col: number;
  name: string;
  nameStem: string;
  priceLabel: string;
  price: number | null;
  currency: CurrencyType;
  hasFilenameBadgeSuffix: boolean;
  priceTier: string;
  hasBadge: boolean;
  badgeType: string | null;
  gameplayType: string | null;
  badgeConfidence: number;
}

export interface BadgeDefinition {
  code: string;
  label: string;
  gameplay: string;
  description: string;
  color: string;
  sampleCount: number;
}

export type ManualReviewStatus = 'pending' | 'confirmed' | 'corrected';

export interface ManualBadgeReviewItem {
  giftId: string;
  folder: GiftFolder;
  fileName: string;
  relativeImagePath: string;
  name: string;
  predictedHasBadge: boolean;
  predictedBadgeType: string | null;
  predictedBadgeLabel: string;
  predictedConfidence: number;
  predictedSource: string;
  finalHasBadge: boolean;
  finalBadgeType: string | null;
  finalBadgeLabel: string;
  reviewStatus: ManualReviewStatus | string;
  reviewHasBadge: boolean | null;
  reviewBadgeType: string | null;
  reviewBadgeLabel: string;
  notes: string;
  bbox: number[] | null;
  bestScore: number | null;
}

export interface FilterState {


  query: string;
  folder: 'all' | GiftFolder;
  currency: 'all' | Exclude<CurrencyType, null>;
  badgeMode: BadgeMode;
  badgeType: 'all' | string;
  gameplayType: 'all' | string;
  priceTier: 'all' | string;
  sortKey: SortKey;
}

export interface OverviewMetrics {
  total: number;
  visible: number;
  badgeCount: number;
  badgeRate: number;
  averagePrice: number;
  medianPrice: number;
  topGift: GiftRecord | null;
  topFolder: { name: string; value: number } | null;
  currencySplit: { label: string; value: number }[];
}

export interface ChartDatum {
  name: string;
  value: number;
  color?: string;
  gold?: number;
  diamond?: number;
}

export interface BadgeSummary {
  code: string;
  label: string;
  color: string;
  gameplay: string;
  description: string;
  count: number;
  averagePrice: number;
  maxPrice: number;
  exampleNames: string[];
}

export interface InsightResult {
  title: string;
  detail: string;
  tone: 'primary' | 'success' | 'warning';
}
