import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

import type { ChartDatum } from '../../types/gift';

interface CurrencyFolderChartProps {
  data: ChartDatum[];
  activeFolderKey: string | null;
  activeCurrency: 'Gold' | 'Diamond' | null;
  onSelectFolderCurrency: (folder: string, currency: 'Gold' | 'Diamond') => void;
}

export function CurrencyFolderChart({ data, activeFolderKey, activeCurrency, onSelectFolderCurrency }: CurrencyFolderChartProps) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">分类与货币结构</h3>
          <p className="mt-2 text-sm text-slate-300">点击金币或钻石段，直接收窄到对应分类与货币组合。</p>
        </div>
        <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">支持分组下钻</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'rgba(34,199,240,0.10)' }} contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Legend />
            <Bar dataKey="diamond" name="钻石礼物" stackId="currency" radius={[8, 8, 0, 0]} onClick={(datum) => onSelectFolderCurrency(datum?.payload?.key || datum?.payload?.name || datum?.key || datum?.name, 'Diamond')}>
              {data.map((entry) => (
                <Cell
                  key={`${entry.name}-diamond`}
                  fill="#22C7F0"
                  opacity={activeFolderKey && (activeFolderKey !== (entry.key || entry.name) || activeCurrency !== 'Diamond') ? 0.35 : 1}
                  stroke={activeFolderKey === (entry.key || entry.name) && activeCurrency === 'Diamond' ? '#BAF7FF' : 'transparent'}
                  strokeWidth={activeFolderKey === (entry.key || entry.name) && activeCurrency === 'Diamond' ? 2 : 0}
                />
              ))}
            </Bar>
            <Bar dataKey="gold" name="金币礼物" stackId="currency" radius={[8, 8, 0, 0]} onClick={(datum) => onSelectFolderCurrency(datum?.payload?.key || datum?.payload?.name || datum?.key || datum?.name, 'Gold')}>
              {data.map((entry) => (
                <Cell
                  key={`${entry.name}-gold`}
                  fill="#F59E0B"
                  opacity={activeFolderKey && (activeFolderKey !== (entry.key || entry.name) || activeCurrency !== 'Gold') ? 0.35 : 1}
                  stroke={activeFolderKey === (entry.key || entry.name) && activeCurrency === 'Gold' ? '#FDE68A' : 'transparent'}
                  strokeWidth={activeFolderKey === (entry.key || entry.name) && activeCurrency === 'Gold' ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
