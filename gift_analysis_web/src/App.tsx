import { useCallback, useEffect, useMemo, useState } from 'react';

import { FilterPanel } from './components/filters/filter-panel';
import { AppShell } from './components/layout/app-shell';
import { BadgeAnalysisSection } from './components/sections/badge-analysis-section';
import { ChartSection } from './components/sections/chart-section';
import { GiftExplorerSection } from './components/sections/gift-explorer-section';

import { GiftSystemAnalysisSection } from './components/sections/gift-system-analysis-section';
import { GiftCommercialAnalysisSection } from './components/sections/gift-commercial-analysis-section';
import { GiftResearchReportSection } from './components/sections/gift-research-report-section';
import { InsightSection } from './components/sections/insight-section';
import { ManualReviewSection } from './components/sections/manual-review-section';
import { OverviewSection } from './components/sections/overview-section';
import { useDashboardInteractions } from './hooks/use-dashboard-interactions';
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
import type { GiftSystemAnalysis } from './types/analysis';
import type {

  BadgeDefinition,
  DashboardView,
  DashboardViewTab,
  FilterState,
  GiftRecord,
  ManualBadgeReviewItem,
  SectionId,
  SectionNavItem,
} from './types/gift';

const SECTION_VIEW_MAP: Record<SectionId, DashboardView> = {
  overview: 'dashboard',
  filters: 'dashboard',
  insights: 'analysis',
  charts: 'dashboard',
  'badge-analysis': 'analysis',
  'gift-explorer': 'dashboard',
  'manual-review': 'dashboard',
  'system-analysis': 'analysis',
  'commercial-analysis': 'analysis',
  'research-report': 'analysis',
};


const DASHBOARD_NAV_ITEMS: SectionNavItem[] = [
  { id: 'overview', label: '概览', view: 'dashboard' },
  { id: 'filters', label: '筛选', view: 'dashboard' },
  { id: 'charts', label: '图表', view: 'dashboard' },
  { id: 'gift-explorer', label: '礼物库', view: 'dashboard' },
  { id: 'manual-review', label: '复核', view: 'dashboard' },
];

const VIEW_TAB_META: Record<DashboardView, DashboardViewTab> = {
  dashboard: { id: 'dashboard', label: '数据看板', description: '筛选、图表、礼物与复核' },
  analysis: { id: 'analysis', label: '分析空间', description: '结论、专题与背景' },
};


export default function App() {
  const [sourceGifts, setSourceGifts] = useState<GiftRecord[]>([]);
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [manualReviews, setManualReviews] = useState<ManualBadgeReviewItem[]>([]);
  const [savedManualReviews, setSavedManualReviews] = useState<ManualBadgeReviewItem[]>([]);
  const [giftSystemAnalysis, setGiftSystemAnalysis] = useState<GiftSystemAnalysis | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');

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
        setLoading(false);

      })
      .catch(() => {
        console.error('加载礼物看板数据失败');
        setHasError(true);
        setLoading(false);
      });
  }, []);

  const gifts = useMemo(() => applyManualReviewsToGifts(sourceGifts, manualReviews, badges), [sourceGifts, manualReviews, badges]);
  const { filters, filteredGifts, options, activeFilters, updateFilter, applyFilterPatch, clearFilter, resetFilters } = useGiftFilters(gifts, badges);
  const overview = useMemo(() => buildOverviewMetrics(filteredGifts, gifts), [filteredGifts, gifts]);
  const priceTierData = useMemo(() => buildPriceTierData(filteredGifts), [filteredGifts]);
  const folderCurrencyData = useMemo(() => buildFolderCurrencyData(filteredGifts), [filteredGifts]);
  const badgeTypeData = useMemo(() => buildBadgeTypeData(filteredGifts, badges), [filteredGifts, badges]);
  const topGiftData = useMemo(() => buildTopGiftData(filteredGifts), [filteredGifts]);
  const badgeSummaries = useMemo(() => buildBadgeSummaries(filteredGifts, badges), [filteredGifts, badges]);
  const insights = useMemo(() => buildInsights(filteredGifts, overview, badgeSummaries), [filteredGifts, overview, badgeSummaries]);
  const badgeMap = useMemo(() => new Map(badges.map((badge) => [badge.code, badge])), [badges]);
  const filteredGiftIds = useMemo(() => filteredGifts.map((gift) => gift.id), [filteredGifts]);
  const badgeCount = useMemo(() => gifts.filter((gift) => gift.hasBadge).length, [gifts]);

  const analysisNavItems = useMemo<SectionNavItem[]>(() => {
    const items: SectionNavItem[] = [
      { id: 'insights', label: '结论', view: 'analysis' },
      { id: 'badge-analysis', label: '角标专题', view: 'analysis' },
    ];

    if (giftSystemAnalysis) {
      items.push({ id: 'system-analysis', label: '背景分析', view: 'analysis' });
      items.push({ id: 'commercial-analysis', label: '商业分析', view: 'analysis' });
      items.push({ id: 'research-report', label: '深度调研', view: 'analysis' });
    }

    return items;
  }, [giftSystemAnalysis]);


  const viewTabs = useMemo(() => {
    const tabs = [VIEW_TAB_META.dashboard];
    if (analysisNavItems.length) {
      tabs.push(VIEW_TAB_META.analysis);
    }
    return tabs;
  }, [analysisNavItems.length]);

  const currentNavItems = useMemo(() => (activeView === 'analysis' ? analysisNavItems : DASHBOARD_NAV_ITEMS), [activeView, analysisNavItems]);
  const visibleSectionIds = useMemo(() => currentNavItems.map((item) => item.id), [currentNavItems]);

  useEffect(() => {
    if (activeView === 'analysis' && !analysisNavItems.length) {
      setActiveView('dashboard');
    }
  }, [activeView, analysisNavItems.length]);

  const { activeSectionId, focusedReviewGiftId, jumpToSection, openReviewForGift, clearReviewFocus } = useDashboardInteractions({
    visibleSectionIds,
    activeView,
    sectionViewMap: SECTION_VIEW_MAP,
    onViewChange: setActiveView,
  });

  const handleFilterDrillDown = useCallback(
    (patch: Partial<FilterState>, nextSectionId: SectionId = 'gift-explorer') => {
      applyFilterPatch(patch);
      jumpToSection(nextSectionId);
    },
    [applyFilterPatch, jumpToSection],
  );

  const handleResetAndJump = useCallback(() => {
    resetFilters();
    jumpToSection('filters');
  }, [jumpToSection, resetFilters]);

  const handleViewChange = useCallback(
    (view: DashboardView) => {
      const targetItems = view === 'analysis' ? analysisNavItems : DASHBOARD_NAV_ITEMS;
      const targetSection = targetItems[0]?.id;
      if (targetSection) {
        jumpToSection(targetSection);
      }
    },
    [analysisNavItems, jumpToSection],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (hasError) {
    return <ErrorState />;
  }

  return (
    <AppShell
      total={gifts.length}
      badgeCount={badgeCount}
      activeView={activeView}
      activeSectionId={activeSectionId}
      viewTabs={viewTabs}
      navItems={currentNavItems}
      onViewChange={handleViewChange}
      onNavigate={jumpToSection}
    >
      {activeView === 'dashboard' ? (
        <>
          <OverviewSection metrics={overview} activeFilterCount={activeFilters.length} onJumpTo={jumpToSection} />
          <FilterPanel
            filters={filters}
            badgeTypes={options.badgeTypes}
            gameplayValues={options.gameplayValues}
            priceTiers={options.priceTiers}
            activeFilters={activeFilters}
            filteredCount={filteredGifts.length}
            totalCount={gifts.length}
            onChange={updateFilter}
            onClearFilter={clearFilter}
            onReset={resetFilters}
            onJumpTo={jumpToSection}
          />
          <ChartSection
            filters={filters}
            priceTierData={priceTierData}
            folderCurrencyData={folderCurrencyData}
            badgeTypeData={badgeTypeData}
            topGiftData={topGiftData}
            badgeDefinitions={badges}
            onFilterDrillDown={handleFilterDrillDown}
            onJumpTo={jumpToSection}
          />
          <GiftExplorerSection
            gifts={filteredGifts}
            badgeMap={badgeMap}
            onOpenReview={openReviewForGift}
            onFilterDrillDown={handleFilterDrillDown}
            onResetFilters={handleResetAndJump}
          />
          <ManualReviewSection
            items={manualReviews}
            savedItems={savedManualReviews}
            badges={badges}
            gifts={gifts}
            visibleGiftIds={filteredGiftIds}
            focusedGiftId={focusedReviewGiftId}
            onItemsChange={setManualReviews}
            onItemsSaved={setSavedManualReviews}
            onFocusHandled={clearReviewFocus}
          />
        </>
      ) : (
        <>
          <InsightSection insights={insights} onJumpTo={jumpToSection} onFilterDrillDown={handleFilterDrillDown} />
          <BadgeAnalysisSection summaries={badgeSummaries} onFilterDrillDown={handleFilterDrillDown} onJumpTo={jumpToSection} />
          {giftSystemAnalysis ? (
            <>
              <GiftSystemAnalysisSection analysis={giftSystemAnalysis} />
              <GiftCommercialAnalysisSection analysis={giftSystemAnalysis} />
              <GiftResearchReportSection />
            </>
          ) : null}
        </>


      )}
    </AppShell>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-6 text-center text-white">
      <div className="glass-panel rounded-[32px] p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">正在准备分析工作台</p>
        <h1 className="mt-3 text-3xl font-bold">礼物图谱、角标玩法和复核数据正在同步</h1>
        <p className="mt-3 text-sm text-slate-300">稍等片刻，页面会自动切换到完整的分析视图。</p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-6 text-center text-white">
      <div className="glass-panel rounded-[32px] p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-rose-200">暂时无法打开工作台</p>
        <h1 className="mt-3 text-3xl font-bold">页面数据读取失败</h1>
        <p className="mt-3 text-sm text-slate-300">请稍后刷新页面，或确认当前发布版本的数据文件已经同步完成。</p>
      </div>
    </div>
  );
}
