import { Crown, Gem, Radar, Sparkles } from 'lucide-react';
import type { OverviewMetrics } from '../../types/gift';
import { formatPercent, formatPrice } from '../../lib/format';

interface OverviewSectionProps {
  metrics: OverviewMetrics;
}

const cards = [
  { key: 'visible', label: '当前筛选礼物数', icon: Radar, accent: 'from-brand to-cyan' },
  { key: 'badgeCount', label: '可见角标礼物', icon: Sparkles, accent: 'from-cyan to-mint' },
  { key: 'averagePrice', label: '平均价格', icon: Gem, accent: 'from-amber-400 to-fuchsia-500' },
  { key: 'topGift', label: '最高价格礼物', icon: Crown, accent: 'from-rose-500 to-orange-400' },
] as const;

export function OverviewSection({ metrics }: OverviewSectionProps) {
  return (
    <section id="overview" className="flex flex-col gap-5">
      <div className="glass-panel relative overflow-hidden rounded-[36px] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,94,247,0.25),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,199,240,0.18),transparent_30%)]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">Premium Dashboard · Data Gallery</span>
            <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white lg:text-5xl">用一个页面把礼物图片、角标玩法、价格结构和高价值样本全部看清。</h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
              当前看板把四个礼物分类的静态素材、价格、货币、角标识别和玩法映射统一拉到同一层视图中，你可以边看礼物图库，边观察价格分层、角标覆盖率和高价值玩法的分布变化。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <div key={card.key} className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-xl">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{resolveValue(card.key, metrics)}</p>
                <p className="mt-3 text-sm text-slate-300">{resolveDetail(card.key, metrics)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function resolveValue(key: string, metrics: OverviewMetrics): string {
  if (key === 'visible') return String(metrics.visible);
  if (key === 'badgeCount') return `${metrics.badgeCount} · ${formatPercent(metrics.badgeRate)}`;
  if (key === 'averagePrice') return formatPrice(Math.round(metrics.averagePrice));
  return metrics.topGift ? metrics.topGift.name : '暂无';
}

function resolveDetail(key: string, metrics: OverviewMetrics): string {
  if (key === 'visible') return `在总计 ${metrics.total} 个礼物中，当前条件下共有 ${metrics.visible} 个进入分析。`;
  if (key === 'badgeCount') return '角标礼物通常承载玩法、展示或互动效果，是专题分析最值得关注的群体。';
  if (key === 'averagePrice') return `中位价格为 ${formatPrice(Math.round(metrics.medianPrice))}，可以结合图表继续看层级结构。`;
  return metrics.topGift ? `来自 ${metrics.topGift.folder}，标价 ${formatPrice(metrics.topGift.price)}。` : '暂无最高价样本。';
}
