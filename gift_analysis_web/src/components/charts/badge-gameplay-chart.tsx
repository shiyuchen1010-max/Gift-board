import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { formatPercent } from '../../lib/format';
import type { ChartDatum } from '../../types/gift';
import { BadgeLabel } from '../badges/badge-label';


interface BadgeGameplayChartProps {
  data: ChartDatum[];
  activeKey: string | null;
  onSelectBadge: (badgeType: string) => void;
}

interface BadgeGameplayTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDatum;
  }>;
}

export function BadgeGameplayChart({ data, activeKey, onSelectBadge }: BadgeGameplayChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">角标玩法占比</h3>
          <p className="mt-2 text-sm text-slate-300">悬停查看说明，点击某个角标可直接聚焦到对应礼物与专题。</p>
        </div>
        <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">点击扇区即可筛选</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4} onClick={(datum) => {
              const badgeKey = datum?.key || datum?.payload?.key;
              if (badgeKey) {
                onSelectBadge(badgeKey);
              }
            }}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color ?? '#22C7F0'}
                  opacity={activeKey && activeKey !== entry.key ? 0.4 : 1}
                  stroke={activeKey === entry.key ? '#FFFFFF' : 'transparent'}
                  strokeWidth={activeKey === entry.key ? 2.5 : 0}
                />
              ))}
            </Pie>
            <Tooltip cursor={false} content={<BadgeGameplayTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {data.map((entry) => (
          <button
            key={entry.name}
            type="button"
            onClick={() => entry.key && onSelectBadge(entry.key)}
            className="rounded-full px-3 py-1 text-xs text-white transition hover:-translate-y-0.5"
            style={{
              backgroundColor: `${entry.color ?? '#22C7F0'}33`,
              border: `1px solid ${activeKey === entry.key ? '#FFFFFF' : `${entry.color ?? '#22C7F0'}66`}`,
            }}
          >
            {entry.name} · {entry.value}
          </button>
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
      <div className="flex items-center">
        <BadgeLabel code={datum.key} label={datum.name} textClassName="text-sm font-semibold text-white" iconClassName="h-4 w-4" />
      </div>
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
