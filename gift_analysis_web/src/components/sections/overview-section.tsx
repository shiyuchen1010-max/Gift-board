import { ArrowRight, Crown, Gem, Radar, Sparkles } from 'lucide-react';

import { formatPercent, formatPrice } from '../../lib/format';
import type { OverviewMetrics, SectionId } from '../../types/gift';

interface OverviewSectionProps {
  metrics: OverviewMetrics;
  activeFilterCount: number;
  onJumpTo: (sectionId: SectionId) => void;
  onFocusGift: (giftId: string) => void;
}

const cards = [
  { key: 'visible', label: '当前礼物数', icon: Radar, accent: 'from-brand to-cyan' },
  { key: 'badgeCount', label: '可见角标礼物', icon: Sparkles, accent: 'from-cyan to-mint' },
  { key: 'averagePrice', label: '平均价格', icon: Gem, accent: 'from-amber-400 to-fuchsia-500' },
  { key: 'topGift', label: '最高价格礼物', icon: Crown, accent: 'from-rose-500 to-orange-400' },
] as const;

export function OverviewSection({ metrics, activeFilterCount, onJumpTo, onFocusGift }: OverviewSectionProps) {
  return (
    <section id="overview" className="flex scroll-mt-44 flex-col gap-5">
      <div className="glass-panel relative overflow-hidden rounded-[36px] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,94,247,0.25),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,199,240,0.18),transparent_30%)]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">数据看板 · 操作闭环</span>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white lg:text-5xl">先定范围，再看图表与样本，需要解释时再切到分析空间。</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
                当前页签聚焦的是筛选、图表、礼物样本和复核动作这条高频路径。你可以先缩小范围，再根据数据定位到礼物卡片并完成处理；如果要看归纳结论、玩法专题或策略判断，再切到分析空间继续阅读。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ActionCard
                title="第一步：定范围"
                detail={activeFilterCount ? `当前已有 ${activeFilterCount} 个筛选条件，继续细化范围会更快。` : '先用筛选条缩小范围，后面的图表和礼物库会一起变化。'}
                actionLabel="打开筛选"
                onClick={() => onJumpTo('filters')}
              />
              <ActionCard
                title="第二步：看结论"
                detail="自动分析结论已经被收进分析空间，点击后会直接切页签过去。"
                actionLabel="查看结论"
                onClick={() => onJumpTo('insights')}
              />
              <ActionCard
                title="第三步：做动作"
                detail="从图表或礼物库进入具体样本，再跳到复核区处理。"
                actionLabel="进入复核"
                onClick={() => onJumpTo('manual-review')}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => handleMetricAction(card.key, metrics, onJumpTo, onFocusGift)}
                className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan/30 hover:bg-slate-950/60"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{resolveValue(card.key, metrics)}</p>
                <p className="mt-3 text-sm text-slate-300">{resolveDetail(card.key, metrics)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function handleMetricAction(
  key: string,
  metrics: OverviewMetrics,
  onJumpTo: (sectionId: SectionId) => void,
  onFocusGift: (giftId: string) => void,
) {
  if (key === 'topGift' && metrics.topGift) {
    onFocusGift(metrics.topGift.id);
    return;
  }
  if (key === 'badgeCount') {
    onJumpTo('badge-analysis');
    return;
  }
  if (key === 'averagePrice') {
    onJumpTo('charts');
    return;
  }
  onJumpTo('gift-explorer');
}

function resolveValue(key: string, metrics: OverviewMetrics): string {
  if (key === 'visible') return String(metrics.visible);
  if (key === 'badgeCount') return `${metrics.badgeCount} · ${formatPercent(metrics.badgeRate)}`;
  if (key === 'averagePrice') return formatPrice(Math.round(metrics.averagePrice));
  return metrics.topGift ? metrics.topGift.name : '暂无';
}

function resolveDetail(key: string, metrics: OverviewMetrics): string {
  if (key === 'visible') return `在总计 ${metrics.total} 个礼物中，当前条件下共有 ${metrics.visible} 个进入分析。`;
  if (key === 'badgeCount') return '高占比角标通常意味着玩法包装更强，点击后会进入分析空间的角标专题。';
  if (key === 'averagePrice') return `中位价格为 ${formatPrice(Math.round(metrics.medianPrice))}，点击后可继续看价格结构。`;
  return metrics.topGift ? `来自 ${metrics.topGift.folder}，标价 ${formatPrice(metrics.topGift.price)}，可直接跳去礼物库。` : '暂无最高价样本。';
}

function ActionCard({ title, detail, actionLabel, onClick }: { title: string; detail: string; actionLabel: string; onClick: () => void }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-2 text-xs text-cyan-50 transition hover:border-cyan/40 hover:bg-cyan/20"
      >
        {actionLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
