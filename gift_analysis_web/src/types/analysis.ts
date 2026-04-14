export interface NamedValue {
  name: string;
  value: number;
}

export interface FolderBadgeCoverage {
  folder: string;
  label: string;
  count: number;
  badgeCount: number;
  badgeRate: number;
}

export interface GameplayBreakdownItem {
  code: string;
  label: string;
  description: string;
  count: number;
  coverage: number;
  averagePrice: number;
  maxPrice: number;
  dominantFolder: string;
  sampleNames: string[];
}

export interface TopPricedGiftItem {
  name: string;
  price: number;
  folder: string;
  badgeType: string | null;
  badgeLabel: string;
}

export interface KeyFindingItem {
  title: string;
  detail: string;
}

export interface GiftSystemAnalysis {
  summary: {
    giftCount: number;
    badgeGiftCount: number;
    badgeCoverage: number;
    pricedGiftCount: number;
    averagePrice: number;
    medianPrice: number;
    maxPrice: number;
  };
  priceTierDistribution: NamedValue[];
  folderDistribution: NamedValue[];
  currencyDistribution: NamedValue[];
  folderBadgeCoverage: FolderBadgeCoverage[];
  gameplayBreakdown: GameplayBreakdownItem[];
  topPricedGifts: TopPricedGiftItem[];
  keyFindings: KeyFindingItem[];
  systemTraits: string[];
}

export interface TriggerScene {
  name: string;
  placement: string;
  goal: string;
  detail: string;
}

export interface GameplayMapping {
  badgeCode: string;
  badgeLabel: string;
  currentMechanic: string;
  ludoAdaptation: string;
  priority: string;
  fit: string;
}

export interface FeatureModule {
  name: string;
  summary: string;
  items: string[];
}

export interface EconomyLoopItem {
  stage: string;
  detail: string;
}

export interface RiskControlItem {
  title: string;
  level: string;
  detail: string;
}

export interface RolloutPhaseItem {
  phase: string;
  goal: string;
  capabilities: string[];
  metrics: string[];
}

export interface FacebookLudoNoChatPlan {
  scenario: string;
  positioning: string;
  analysisContext: {
    giftCount: number;
    badgeCoverage: number;
    highestPrice: number;
    dominantGameplay: string;
  };
  designPrinciples: string[];
  triggerScenes: TriggerScene[];
  gameplayMappings: GameplayMapping[];
  featureModules: FeatureModule[];
  economyLoop: EconomyLoopItem[];
  riskControls: RiskControlItem[];
  rolloutPhases: RolloutPhaseItem[];
  openQuestions: string[];
}
