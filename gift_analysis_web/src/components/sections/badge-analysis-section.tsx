import type { BadgeSummary } from '../../types/gift';
import { formatPrice } from '../../lib/format';

interface BadgeAnalysisSectionProps {
  summaries: BadgeSummary[];
}

export function BadgeAnalysisSection({ summaries }: BadgeAnalysisSectionProps) {
  return (
    <section id="badge-lab" className="flex flex-col gap-4">
      <div>
        <h2 className="section-title">角标专题分析</h2>
        <p className="section-copy">把角标当成玩法入口来观察：数量、均价、样本礼物和说明会一起呈现。</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {summaries.map((summary) => (
          <article key={summary.code} className="glass-panel rounded-[28px] p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full px-3 py-1 text-xs text-white" style={{ backgroundColor: `${summary.color}33`, border: `1px solid ${summary.color}66` }}>
                  {summary.label}
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
                  <span key={name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">{name}</span>
                ))}
              </div>
            </div>
          </article>
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
