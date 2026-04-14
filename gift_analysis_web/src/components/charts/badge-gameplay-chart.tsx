import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatPercent } from '../../lib/format';
import type { ChartDatum } from '../../types/gift';

interface BadgeGameplayChartProps {
  data: ChartDatum[];
}

interface BadgeGameplayTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDatum;
  }>;
}

export function BadgeGameplayChart({ data }: BadgeGameplayChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="glass-panel rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold text-white">角标玩法占比</h3>
      <p className="mb-4 text-sm text-slate-300">识别不同角标类型的数量差异，快速找到覆盖度最高的玩法标签。</p>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color ?? '#22C7F0'} />
              ))}
            </Pie>
            <Tooltip cursor={false} content={<BadgeGameplayTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {data.map((entry) => (
          <span key={entry.name} className="rounded-full px-3 py-1 text-xs text-white" style={{ backgroundColor: `${entry.color ?? '#22C7F0'}33`, border: `1px solid ${entry.color ?? '#22C7F0'}66` }}>
            {entry.name} · {entry.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function BadgeGameplayTooltip({ active, payload, total }: BadgeGameplayTooltipProps & { total: number }) {
  if (!active || !payload?.length) {
    return null;
  }

  const datum = payload[0]?.payload;
  if (!datum) {
    return null;
  }

  const percentage = datum.percentage ?? (total ? datum.value / total : 0);

  return (
    <div className="max-w-64 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur">
      <p className="text-sm font-semibold text-white">{datum.name}</p>
      {datum.detail ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-200">{datum.detail}</p> : null}
      <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-200">
        <span>礼物数量</span>
        <span className="font-semibold text-white">{datum.value}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4 text-sm text-slate-200">
        <span>角标占比</span>
        <span className="font-semibold text-white">{formatPercent(percentage)}</span>
      </div>
      {datum.description ? <p className="mt-3 text-xs leading-5 text-slate-300">{datum.description}</p> : null}
    </div>
  );
}
