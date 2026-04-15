import { Crown, Gem, LayoutGrid, Sparkles } from 'lucide-react';

import type { GiftSystemAnalysis } from '../../types/analysis';
import type { BadgeDefinition } from '../../types/gift';
import { formatPercent, formatPrice } from '../../lib/format';
import { BadgeLabel } from '../badges/badge-label';


interface GiftSystemAnalysisSectionProps {
  analysis: GiftSystemAnalysis;
  badges: BadgeDefinition[];
}

export function GiftSystemAnalysisSection({ analysis, badges }: GiftSystemAnalysisSectionProps) {
  const badgeColorMap = new Map(badges.map((badge) => [badge.code, badge.color]));
  const summaryCards = [
    {
      label: '礼物总量',
      value: String(analysis.summary.giftCount),
      detail: `已定价 ${analysis.summary.pricedGiftCount} 个，说明当前素材库已具备较完整的商业化标记。`,
      icon: LayoutGrid,
      accent: 'from-brand to-cyan',
    },
    {
      label: '角标覆盖率',
      value: `${analysis.summary.badgeGiftCount} · ${formatPercent(analysis.summary.badgeCoverage)}`,
      detail: '角标已经不是补充说明，而是玩法和溢价的主要包装层。',
      icon: Sparkles,
      accent: 'from-cyan to-emerald-400',
    },
    {
      label: '价格中位数',
      value: formatPrice(Math.round(analysis.summary.medianPrice)),
      detail: `平均价格 ${formatPrice(Math.round(analysis.summary.averagePrice))}，高价和超高价礼物占比明显。`,
      icon: Gem,
      accent: 'from-fuchsia-500 to-amber-400',
    },
    {
      label: '最高价格',
      value: formatPrice(analysis.summary.maxPrice),
      detail: '顶价礼物集中在大曝光和广播型玩法，符合强社交秀场逻辑。',
      icon: Crown,
      accent: 'from-rose-500 to-orange-400',
    },
  ];

  const folderBriefs = [
    {
      key: 'classic',
      label: 'Classic',
      title: '常驻礼物',
      description: '用户最熟悉的礼物池，价格覆盖低中高档，主要用于日常打赏。',
      insight: '高频使用，负责培养用户的付费习惯。',
    },
    {
      key: 'activity',
      label: 'Activity',
      title: '活动礼物',
      description: '包含限时礼物与部分常驻主题礼物，常和节日、宗教文化、地方饮食或生日场景相关。',
      insight: '适合借节庆节点放大送礼氛围与短期转化。',
    },
    {
      key: 'member',
      label: 'Member',
      title: '成员礼物',
      description: '类似直播间粉丝团礼物，仅本直播间成员可送，并且不同成员等级对应不同礼物权限。',
      insight: '本质是用等级身份和专属权限驱动持续留存。',
    },
    {
      key: 'royal',
      label: 'Royal',
      title: 'VIP 礼物',
      description: '只有开通 VIP 才能赠送，属于更强身份感的专属礼物。',
      insight: '强调会员身份外显，提升高价值用户的专属感。',
    },
  ];


  return (
    <section id="system-analysis" className="flex scroll-mt-44 flex-col gap-5">

      <div>
        <h2 className="section-title">送礼系统调研分析</h2>
        <p className="section-copy">把礼物数量、价格层级、角标玩法和高价值样本放到同一个视角里看，能更清楚地判断这个系统到底靠什么驱动付费与传播。</p>
      </div>

      <div className="glass-panel relative overflow-hidden rounded-[36px] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,199,240,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(109,94,247,0.2),transparent_28%)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">背景分析 · 全量视角</span>
            <h3 className="mt-4 text-3xl font-bold leading-tight text-white lg:text-4xl">当前送礼系统的商业价值核心，不在“送礼”本身，而在礼物背后的可见度、榜单周期与身份外显。</h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
              从现有数据看，礼物池由大规模常驻礼物托底，再由角标玩法把高价值礼物包装成广播位、名片展示、榜单积分或局内反馈工具。也就是说，真正被售卖的是“被更多人看见”和“在更重要节点被记住”。
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <article key={card.label} className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-xl">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{card.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="glass-panel rounded-[30px] p-5">
          <h3 className="text-lg font-semibold text-white">结构拆解</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">先看礼物池怎么分布，再看每类礼物承担什么角色，以及角标在哪些分类里承担更强的玩法密度。</p>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">礼物分类速览</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">把 Classic、Activity、Member、Royal 四类礼物的运营角色放在同一层里看，更容易理解不同礼物池分别服务谁、服务什么场景。</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {folderBriefs.map((item) => (
                <div key={item.key} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                  <p className="mt-3 rounded-2xl border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100">{item.insight}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <MetricList title="分类分布" items={analysis.folderDistribution} />
            <MetricList title="价格分层" items={analysis.priceTierDistribution} />
            <MetricList title="货币结构" items={analysis.currencyDistribution} compact />
            <CoverageList items={analysis.folderBadgeCoverage} />
          </div>
        </article>


        <article className="glass-panel rounded-[30px] p-5">
          <h3 className="text-lg font-semibold text-white">结论提炼</h3>
          <div className="mt-4 grid gap-3">
            {analysis.keyFindings.map((finding) => (
              <div key={finding.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-base font-semibold text-white">{finding.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{finding.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">系统特征</p>
            <div className="mt-3 space-y-3">
              {analysis.systemTraits.map((trait) => (
                <p key={trait} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-200">{trait}</p>
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="glass-panel rounded-[30px] p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">玩法分布与价格信号</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">每一类角标都对应一条运营杠杆：有的放大身份，有的驱动榜单，有的负责抽奖和刺激。</p>
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">当前按礼物数量排序</p>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {analysis.gameplayBreakdown.map((item) => (
            <article key={item.code} className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-xs text-white"
                    style={{ backgroundColor: `${badgeColorMap.get(item.code) ?? '#94A3B8'}22`, border: `1px solid ${badgeColorMap.get(item.code) ?? '#94A3B8'}66` }}
                  >
                    <BadgeLabel code={item.code} label={item.label} textClassName="text-xs text-white" />
                  </span>

                  <p className="mt-3 text-sm leading-6 text-slate-300 whitespace-pre-line">{item.description}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">玩法覆盖</p>
                  <p className="mt-2 text-2xl font-bold text-white">{item.count}</p>
                  <p className="text-xs text-cyan-200">{formatPercent(item.coverage)}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <InfoTile label="均价" value={formatPrice(Math.round(item.averagePrice))} />
                <InfoTile label="最高价" value={formatPrice(item.maxPrice)} />
                <InfoTile label="主阵地" value={item.dominantFolder} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.sampleNames.map((name) => (
                  <span key={`${item.code}-${name}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">{name}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="glass-panel rounded-[30px] p-5">
        <h3 className="text-lg font-semibold text-white">高价值礼物样本</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">高价礼物几乎全部绑定到广播、全服曝光和名片展示相关玩法，这说明“社交可见度”是价格上限的关键杠杆。</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {analysis.topPricedGifts.map((gift, index) => (
            <div key={`${gift.name}-${gift.price}-${index}`} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-slate-950/45 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-white">{gift.name}</p>
                <p className="mt-1 text-xs text-slate-400">{gift.folder} · {gift.badgeLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-cyan">{formatPrice(gift.price)}</p>
                <p className="text-xs text-slate-400">Top {index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function MetricList({ title, items, compact = false }: { title: string; items: { name: string; value: number }[]; compact?: boolean }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${title}-${item.name}`}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-200">{item.name}</span>
              <span className="font-medium text-white">{item.value}</span>
            </div>
            {!compact && (
              <div className="h-2 rounded-full bg-white/5">
                <div className="h-2 rounded-full bg-gradient-to-r from-brand to-cyan" style={{ width: `${(item.value / maxValue) * 100}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CoverageList({ items }: { items: GiftSystemAnalysis['folderBadgeCoverage'] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">分类内角标密度</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.folder} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-100">{item.label}</span>
              <span className="text-sm font-semibold text-cyan-200">{formatPercent(item.badgeRate)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{item.badgeCount} / {item.count} 个礼物带角标</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
