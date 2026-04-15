import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { ChartDatum } from '../../types/gift';

interface PriceTierChartProps {
  data: ChartDatum[];
  activeKey: string | null;
  onSelectTier: (tier: string) => void;
}

interface PriceTierTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDatum;
  }>;
}

export function PriceTierChart({ data, activeKey, onSelectTier }: PriceTierChartProps) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">价格分层分布</h3>
          <p className="mt-2 text-sm text-slate-300">先看价格密度，再决定要不要只追某个价格层级的样本；下方同时给出每层对应的价格区间。</p>
        </div>
        <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">点击柱子即可筛选</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} interval={0} />
            <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'rgba(109,94,247,0.10)' }} content={<PriceTierTooltip />} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} onClick={(datum) => onSelectTier(datum?.payload?.key || datum?.payload?.name || datum?.key || datum?.name)}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={activeKey === (entry.key || entry.name) ? '#22C7F0' : '#6D5EF7'}
                  opacity={activeKey && activeKey !== (entry.key || entry.name) ? 0.45 : 1}
                  stroke={activeKey === (entry.key || entry.name) ? '#BAF7FF' : 'transparent'}
                  strokeWidth={activeKey === (entry.key || entry.name) ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">价格区间速览</p>
        <div className="flex flex-wrap gap-2">
          {data.map((entry) => {
            const isActive = activeKey === (entry.key || entry.name);
            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => onSelectTier(entry.key || entry.name)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                  isActive
                    ? 'border-cyan-300 bg-cyan/15 text-white'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan/30 hover:bg-cyan/10 hover:text-white'
                }`}
              >
                <span>{entry.name}</span>
                {entry.detail ? <span className="text-slate-300">{entry.detail}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PriceTierTooltip({ active, payload }: PriceTierTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const datum = payload[0]?.payload;
  if (!datum) {
    return null;
  }

  return (
    <div className="max-w-64 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur">
      <p className="text-sm font-semibold text-white">{datum.name}</p>
      {datum.detail ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-200">价格区间 · {datum.detail}</p> : null}
      <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-200">
        <span>礼物数量</span>
        <span className="font-semibold text-white">{datum.value}</span>
      </div>
      {datum.description ? <p className="mt-3 text-xs leading-5 text-slate-300">{datum.description}</p> : null}
    </div>
  );
}
