import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartDatum } from '../../types/gift';

interface TopPriceChartProps {
  data: ChartDatum[];
}

export function TopPriceChart({ data }: TopPriceChartProps) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold text-white">高价礼物排行榜</h3>
      <p className="mb-4 text-sm text-slate-300">突出当前筛选结果里价格最高的一批礼物，帮助判断溢价集中区。</p>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 28 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" horizontal={false} />
            <XAxis type="number" stroke="#94A3B8" tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} width={110} />
            <Tooltip cursor={{ fill: 'rgba(52,211,153,0.10)' }} contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Bar dataKey="value" fill="#34D399" radius={[0, 12, 12, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
