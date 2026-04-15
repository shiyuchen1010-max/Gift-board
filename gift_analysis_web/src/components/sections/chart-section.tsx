import { RotateCcw } from 'lucide-react';

import type { BadgeDefinition, ChartDatum, FilterState, SectionId } from '../../types/gift';
import { BadgeGameplayChart } from '../charts/badge-gameplay-chart';
import { CurrencyFolderChart } from '../charts/currency-folder-chart';
import { PriceTierChart } from '../charts/price-tier-chart';
import { TopPriceChart } from '../charts/top-price-chart';
import { BadgeLabel } from '../badges/badge-label';


interface ChartSectionProps {
  filters: FilterState;
  priceTierData: ChartDatum[];
  folderCurrencyData: ChartDatum[];
  badgeTypeData: ChartDatum[];
  topGiftData: ChartDatum[];
  badgeDefinitions: BadgeDefinition[];
  selectedGiftId: string | null;
  onFilterDrillDown: (patch: Partial<FilterState>, nextSectionId?: SectionId) => void;
  onSelectGift: (giftId: string) => void;
  onJumpTo: (sectionId: SectionId) => void;
}

export function ChartSection({
  filters,
  priceTierData,
  folderCurrencyData,
  badgeTypeData,
  topGiftData,
  badgeDefinitions,
  selectedGiftId,
  onFilterDrillDown,
  onSelectGift,
  onJumpTo,
}: ChartSectionProps) {
  const hasChartFocus = filters.priceTier !== 'all' || filters.folder !== 'all' || filters.currency !== 'all' || filters.badgeType !== 'all';

  return (
    <section id="charts" className="flex scroll-mt-44 flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="section-title">联动图表区</h2>
          <p className="section-copy">图表不只是展示结果：你可以直接点击层级、币种、分类和玩法，把礼物库缩小到想看的那一批。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onJumpTo('gift-explorer')}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
          >
            看当前礼物结果
          </button>
          {hasChartFocus ? (
            <button
              type="button"
              onClick={() => onFilterDrillDown({ priceTier: 'all', folder: 'all', currency: 'all', badgeType: 'all', gameplayType: 'all' }, 'charts')}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 transition hover:bg-rose-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              清除图表聚焦
            </button>
          ) : null}
        </div>
      </div>

      {hasChartFocus ? <FocusBanner filters={filters} /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <PriceTierChart data={priceTierData} activeKey={filters.priceTier !== 'all' ? filters.priceTier : null} onSelectTier={(tier) => onFilterDrillDown({ priceTier: tier }, 'gift-explorer')} />
        <CurrencyFolderChart
          data={folderCurrencyData}
          activeFolderKey={filters.folder !== 'all' ? filters.folder : null}
          activeCurrency={filters.currency !== 'all' ? filters.currency : null}
          onSelectFolderCurrency={(folder, currency) => onFilterDrillDown({ folder: folder as FilterState['folder'], currency }, 'gift-explorer')}
        />
        <BadgeGameplayChart data={badgeTypeData} activeKey={filters.badgeType !== 'all' ? filters.badgeType : null} onSelectBadge={(badgeType) => onFilterDrillDown({ badgeType }, 'badge-analysis')} />
        <TopPriceChart data={topGiftData} selectedGiftId={selectedGiftId} onSelectGift={onSelectGift} />
      </div>

      <div className="glass-panel rounded-[28px] p-5">
        <h3 className="mb-2 text-lg font-semibold text-white">玩法说明索引</h3>
        <p className="mb-4 text-sm text-slate-300">角标说明已经和图表、专题、礼物库保持一致。你可以先看说明，再点击对应玩法直接聚焦到样本。</p>
        <div className="flex flex-wrap gap-2">
          {badgeDefinitions.map((badge) => (
            <button
              key={badge.code}
              type="button"
              onClick={() => onFilterDrillDown({ badgeType: badge.code }, 'badge-analysis')}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs text-white transition hover:-translate-y-0.5"
              style={{ backgroundColor: `${badge.color}22`, border: `1px solid ${badge.color}55` }}
            >
              <BadgeLabel code={badge.code} label={badge.label} textClassName="text-xs text-white" />
            </button>

          ))}
        </div>
      </div>
    </section>
  );
}

function FocusBanner({ filters }: { filters: FilterState }) {
  const labels = [
    filters.priceTier !== 'all' ? `价格层级：${filters.priceTier}` : null,
    filters.folder !== 'all' ? `礼物分类：${filters.folder}` : null,
    filters.currency !== 'all' ? `货币：${filters.currency}` : null,
    filters.badgeType !== 'all' ? `角标：${filters.badgeType}` : null,
  ].filter(Boolean);

  return (
    <div className="rounded-[24px] border border-cyan/20 bg-cyan/10 px-4 py-3 text-sm text-cyan-50">
      图表当前已经聚焦到：{labels.join(' / ')}。继续滚动可以直接看对应礼物、专题和复核结果。
    </div>
  );
}
