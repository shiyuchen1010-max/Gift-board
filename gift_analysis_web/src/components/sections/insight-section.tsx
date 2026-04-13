import type { InsightResult } from '../../types/gift';

interface InsightSectionProps {
  insights: InsightResult[];
}

const toneStyles = {
  primary: 'from-brand/25 to-cyan/10 border-brand/30',
  success: 'from-emerald-400/20 to-cyan/5 border-emerald-400/30',
  warning: 'from-amber-400/20 to-rose-500/10 border-amber-400/30',
};

export function InsightSection({ insights }: InsightSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="section-title">自动分析结论</h2>
        <p className="section-copy">这些结论基于当前筛选结果即时生成，方便快速定位高价值分类和强玩法角标。</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {insights.map((item) => (
          <article key={item.title} className={`rounded-[28px] border bg-gradient-to-br p-5 ${toneStyles[item.tone]}`}>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-200">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
