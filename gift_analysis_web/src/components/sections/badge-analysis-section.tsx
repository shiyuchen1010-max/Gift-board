import { ArrowRight } from 'lucide-react';

import { formatPrice } from '../../lib/format';
import type { BadgeSummary, FilterState, SectionId } from '../../types/gift';
import { BadgeLabel } from '../badges/badge-label';


interface BadgeAnalysisSectionProps {
  summaries: BadgeSummary[];
  onFilterDrillDown: (patch: Partial<FilterState>, nextSectionId?: SectionId) => void;
  onJumpTo: (sectionId: SectionId) => void;
}

export function BadgeAnalysisSection({ summaries, onFilterDrillDown, onJumpTo }: BadgeAnalysisSectionProps) {
  return (
    <section id="badge-analysis" className="flex scroll-mt-44 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="section-title">角标专题分析</h2>
          <p className="section-copy">把角标当成玩法入口来观察：数量、均价、样本礼物和说明会一起呈现，点击卡片可继续缩小范围。</p>
        </div>
        <button
          type="button"
          onClick={() => onJumpTo('gift-explorer')}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          查看当前礼物库
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {summaries.map((summary) => (
          <button
            key={summary.code}
            type="button"
            onClick={() => onFilterDrillDown({ badgeType: summary.code }, 'gift-explorer')}
            className="glass-panel rounded-[28px] p-5 text-left transition hover:-translate-y-1 hover:border-cyan/30"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full px-3 py-1 text-xs text-white" style={{ backgroundColor: `${summary.color}33`, border: `1px solid ${summary.color}66` }}>
                  <BadgeLabel code={summary.code} label={summary.label} textClassName="text-xs text-white" />
                </span>

                <h3 className="mt-3 text-xl font-semibold text-white">{summary.gameplay}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{summary.description}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">角标礼物数</p>
                <p className="mt-2 text-2xl font-bold text-cyan">{summary.count}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="平均价格" value={formatPrice(Math.round(summary.averagePrice))} />
              <MetricCard label="最高价格" value={formatPrice(summary.maxPrice)} />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-400">代表礼物</p>
              <div className="flex flex-wrap gap-2">
                {summary.exampleNames.map((name) => (
                  <span key={name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
