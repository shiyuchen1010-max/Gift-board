import { useEffect, useMemo, useState } from 'react';

import { FilterPanel } from './components/filters/filter-panel';
import { AppShell } from './components/layout/app-shell';
import { BadgeAnalysisSection } from './components/sections/badge-analysis-section';
import { ChartSection } from './components/sections/chart-section';
import { FacebookLudoNoChatPlanSection } from './components/sections/facebook-ludo-nochat-plan-section';
import { GiftExplorerSection } from './components/sections/gift-explorer-section';
import { GiftSystemAnalysisSection } from './components/sections/gift-system-analysis-section';
import { InsightSection } from './components/sections/insight-section';
import { ManualReviewSection } from './components/sections/manual-review-section';
import { OverviewSection } from './components/sections/overview-section';
import { useGiftFilters } from './hooks/use-gift-filters';
import {
  buildBadgeSummaries,
  buildBadgeTypeData,
  buildFolderCurrencyData,
  buildOverviewMetrics,
  buildPriceTierData,
  buildTopGiftData,
} from './lib/analytics';
import { loadDashboardData } from './lib/data-loader';
import { buildInsights } from './lib/insights';
import { applyManualReviewsToGifts } from './lib/manual-review';
import type { FacebookLudoNoChatPlan, GiftSystemAnalysis } from './types/analysis';
import type { BadgeDefinition, GiftRecord, ManualBadgeReviewItem } from './types/gift';

export default function App() {
  const [sourceGifts, setSourceGifts] = useState<GiftRecord[]>([]);
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [manualReviews, setManualReviews] = useState<ManualBadgeReviewItem[]>([]);
  const [savedManualReviews, setSavedManualReviews] = useState<ManualBadgeReviewItem[]>([]);
  const [giftSystemAnalysis, setGiftSystemAnalysis] = useState<GiftSystemAnalysis | null>(null);
  const [facebookLudoPlan, setFacebookLudoPlan] = useState<FacebookLudoNoChatPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadDashboardData()
      .then((data) => {
        setSourceGifts(data.gifts);
        setBadges(data.badges);
        setManualReviews(data.manualReviews);
        setSavedManualReviews(data.manualReviews);
        setGiftSystemAnalysis(data.giftSystemAnalysis);
        setFacebookLudoPlan(data.facebookLudoPlan);
        setLoading(false);
      })
      .catch(() => {
        console.error('加载礼物看板数据失败');
        setHasError(true);
        setLoading(false);
      });
  }, []);

  const gifts = useMemo(() => applyManualReviewsToGifts(sourceGifts, manualReviews, badges), [sourceGifts, manualReviews, badges]);
  const { filters, filteredGifts, options, updateFilter, resetFilters } = useGiftFilters(gifts, badges);
  const overview = useMemo(() => buildOverviewMetrics(filteredGifts, gifts), [filteredGifts, gifts]);
  const priceTierData = useMemo(() => buildPriceTierData(filteredGifts), [filteredGifts]);
  const folderCurrencyData = useMemo(() => buildFolderCurrencyData(filteredGifts), [filteredGifts]);
  const badgeTypeData = useMemo(() => buildBadgeTypeData(filteredGifts, badges), [filteredGifts, badges]);
  const topGiftData = useMemo(() => buildTopGiftData(filteredGifts), [filteredGifts]);
  const badgeSummaries = useMemo(() => buildBadgeSummaries(filteredGifts, badges), [filteredGifts, badges]);
  const insights = useMemo(() => buildInsights(filteredGifts, overview, badgeSummaries), [filteredGifts, overview, badgeSummaries]);
  const badgeMap = useMemo(() => new Map(badges.map((badge) => [badge.code, badge])), [badges]);

  if (loading) {
    return <LoadingState />;
  }

  if (hasError) {
    return <ErrorState />;
  }

  return (
    <AppShell total={gifts.length} badgeCount={gifts.filter((gift) => gift.hasBadge).length}>
      <OverviewSection metrics={overview} />
      {giftSystemAnalysis ? <GiftSystemAnalysisSection analysis={giftSystemAnalysis} badges={badges} /> : null}
      <FilterPanel
        filters={filters}
        badgeTypes={options.badgeTypes}
        gameplayValues={options.gameplayValues}
        priceTiers={options.priceTiers}
        onChange={updateFilter}
        onReset={resetFilters}
      />
      <ChartSection
        priceTierData={priceTierData}
        folderCurrencyData={folderCurrencyData}
        badgeTypeData={badgeTypeData}
        topGiftData={topGiftData}
        badgeDefinitions={badges}
      />
      <GiftExplorerSection gifts={filteredGifts} badgeMap={badgeMap} />
      <BadgeAnalysisSection summaries={badgeSummaries} />
      {facebookLudoPlan ? <FacebookLudoNoChatPlanSection plan={facebookLudoPlan} /> : null}
      <ManualReviewSection
        items={manualReviews}
        savedItems={savedManualReviews}
        badges={badges}
        gifts={gifts}
        onItemsChange={setManualReviews}
        onItemsSaved={setSavedManualReviews}
      />
      <InsightSection insights={insights} />
    </AppShell>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-6 text-center text-white">
      <div className="glass-panel rounded-[32px] p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Loading Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold">正在装载礼物分析、玩法规则与 Ludo 规划数据</h1>
        <p className="mt-3 text-sm text-slate-300">礼物图库、角标规则、系统分析结论和接入规划会在数据读取完成后一起显示。</p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-6 text-center text-white">
      <div className="glass-panel rounded-[32px] p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-rose-200">Data Error</p>
        <h1 className="mt-3 text-3xl font-bold">数据加载失败</h1>
        <p className="mt-3 text-sm text-slate-300">请确认 `public/data` 下的 `gifts.json`、`badge_definitions.json`、`gift_system_analysis.json` 和 `facebook_ludo_nochat_plan.json` 已生成，再重新刷新页面。</p>
      </div>
    </div>
  );
}
