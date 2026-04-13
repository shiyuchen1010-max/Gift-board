import type { BadgeDefinition, ChartDatum } from '../../types/gift';
import { BadgeGameplayChart } from '../charts/badge-gameplay-chart';
import { CurrencyFolderChart } from '../charts/currency-folder-chart';
import { PriceTierChart } from '../charts/price-tier-chart';
import { TopPriceChart } from '../charts/top-price-chart';

interface ChartSectionProps {
  priceTierData: ChartDatum[];
  folderCurrencyData: ChartDatum[];
  badgeTypeData: ChartDatum[];
  topGiftData: ChartDatum[];
  badgeDefinitions: BadgeDefinition[];
}

export function ChartSection({ priceTierData, folderCurrencyData, badgeTypeData, topGiftData, badgeDefinitions }: ChartSectionProps) {
  return (
    <section id="charts" className="flex flex-col gap-4">
      <div>
        <h2 className="section-title">图表分析区</h2>
        <p className="section-copy">把价格、币种、分类和角标玩法拆开看，再交叉观察它们之间的结构差异。</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <PriceTierChart data={priceTierData} />
        <CurrencyFolderChart data={folderCurrencyData} />
        <BadgeGameplayChart data={badgeTypeData} />
        <TopPriceChart data={topGiftData} />
      </div>
      <div className="glass-panel rounded-[28px] p-5">
        <h3 className="mb-2 text-lg font-semibold text-white">玩法说明接入状态</h3>
        <p className="mb-4 text-sm text-slate-300">当前已接入角标类型定义，后续你只要补充玩法说明，网页就会自动把 badge 类型和玩法文案同步更新到专题区。</p>
        <div className="flex flex-wrap gap-2">
          {badgeDefinitions.map((badge) => (
            <span key={badge.code} className="rounded-full px-3 py-1 text-xs text-white" style={{ backgroundColor: `${badge.color}22`, border: `1px solid ${badge.color}55` }}>
              {badge.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
