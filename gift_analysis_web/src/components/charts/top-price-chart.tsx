import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

import { formatPrice } from '../../lib/format';
import type { ChartDatum } from '../../types/gift';

interface TopPriceChartProps {
  data: ChartDatum[];
}

export function TopPriceChart({ data }: TopPriceChartProps) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">高价礼物排行榜</h3>
          <p className="mt-2 text-sm text-slate-300">展示当前筛选范围内的高价样本，方便快速判断价格锚点和玩法分布。</p>
        </div>
        <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">按价格排序展示</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 28 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" horizontal={false} />
            <XAxis type="number" stroke="#94A3B8" tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value)} />
            <YAxis type="category" dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} width={110} />
            <Tooltip cursor={{ fill: 'rgba(52,211,153,0.10)' }} contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Bar dataKey="value" radius={[0, 12, 12, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color ?? '#34D399'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

