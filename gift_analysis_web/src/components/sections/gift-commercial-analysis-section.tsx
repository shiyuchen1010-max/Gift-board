import { DollarSign, Zap } from 'lucide-react';
import type { GiftSystemAnalysis } from '../../types/analysis';
import { formatPrice } from '../../lib/format';

interface GiftCommercialAnalysisSectionProps {
  analysis: GiftSystemAnalysis;
}

export function GiftCommercialAnalysisSection({ analysis }: GiftCommercialAnalysisSectionProps) {
  return (
    <section id="commercial-analysis" className="flex scroll-mt-44 flex-col gap-5">
      <div>
        <h2 className="section-title">礼物系统核心商业设计分析</h2>
        <p className="section-copy">基于核心商业化模型，拆解礼物系统如何通过价格、稀缺性与社交互动驱动商业价值。</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="glass-panel rounded-[30px] p-6">
          <h3 className="text-lg font-semibold text-white">商业化驱动核心</h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cyan">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">价格策略</p>
                <p className="text-lg font-bold text-white">高价锁定社交可见度</p>
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-amber-400">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">玩法包装</p>
                <p className="text-lg font-bold text-white">角标驱动强转化</p>
              </div>
            </div>
          </div>
        </article>

        <article className="glass-panel rounded-[30px] p-6">
          <h3 className="text-lg font-semibold text-white">关键商业指标</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">平均价格</p>
              <p className="mt-2 text-2xl font-bold text-white">{formatPrice(Math.round(analysis.summary.averagePrice))}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">最高价</p>
              <p className="mt-2 text-2xl font-bold text-white">{formatPrice(analysis.summary.maxPrice)}</p>
            </div>
          </div>
        </article>
      </div>

      <article className="glass-panel rounded-[30px] p-6">
        <h3 className="text-lg font-semibold text-white">策略结论</h3>
        <p className="mt-2 text-sm text-slate-300">当前系统通过差异化的礼物定位，有效地构建了从基础消费到高价值社交展示的商业梯度。</p>
      </article>
    </section>
  );
}
