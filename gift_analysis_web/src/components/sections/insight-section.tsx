import { ArrowRight, Lightbulb } from 'lucide-react';

import type { FilterState, InsightResult, SectionId } from '../../types/gift';

interface InsightSectionProps {
  insights: InsightResult[];
  onJumpTo: (sectionId: SectionId) => void;
  onFilterDrillDown: (patch: Partial<FilterState>, nextSectionId?: SectionId) => void;
}

const toneStyles = {
  primary: 'from-brand/25 to-cyan/10 border-brand/30',
  success: 'from-emerald-400/20 to-cyan/5 border-emerald-400/30',
  warning: 'from-amber-400/20 to-rose-500/10 border-amber-400/30',
};

export function InsightSection({ insights, onJumpTo, onFilterDrillDown }: InsightSectionProps) {
  return (
    <section id="insights" className="flex scroll-mt-44 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="section-title">自动分析结论</h2>
          <p className="section-copy">先看这一屏，再决定接下来该看哪张图、哪批礼物，或者直接进入复核。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickAction label="继续看图表" onClick={() => onJumpTo('charts')} />
          <QuickAction label="打开礼物库" onClick={() => onJumpTo('gift-explorer')} />
          <QuickAction label="进入复核" onClick={() => onJumpTo('manual-review')} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {insights.map((item) => (
          <article key={item.title} className={`rounded-[28px] border bg-gradient-to-br p-5 ${toneStyles[item.tone]}`}>
            <div className="flex items-center gap-2 text-cyan-100">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em]">下一步建议</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-200">{item.detail}</p>
            <div className="mt-4">
              <CardAction title={item.title} onJumpTo={onJumpTo} onFilterDrillDown={onFilterDrillDown} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CardAction({ title, onJumpTo, onFilterDrillDown }: { title: string; onJumpTo: (sectionId: SectionId) => void; onFilterDrillDown: (patch: Partial<FilterState>, nextSectionId?: SectionId) => void }) {
  if (title.includes('无角标')) {
    return <ActionButton label="只看无角标礼物" onClick={() => onFilterDrillDown({ badgeMode: 'without' }, 'gift-explorer')} />;
  }
  if (title.includes('最高价值')) {
    return <ActionButton label="查看高价礼物" onClick={() => onJumpTo('gift-explorer')} />;
  }
  if (title.includes('角标覆盖率') || title.includes('溢价')) {
    return <ActionButton label="继续看玩法图表" onClick={() => onJumpTo('charts')} />;
  }
  return <ActionButton label="查看对应礼物" onClick={() => onJumpTo('gift-explorer')} />;
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
    >
      {label}
    </button>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-2 text-xs text-cyan-50 transition hover:border-cyan/40 hover:bg-cyan/20"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}
