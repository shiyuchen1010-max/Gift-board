import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartDatum } from '../../types/gift';

interface PriceTierChartProps {
  data: ChartDatum[];
}

export function PriceTierChart({ data }: PriceTierChartProps) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold text-white">价格分层分布</h3>
      <p className="mb-4 text-sm text-slate-300">观察低价到收藏级区间的礼物数量和结构差异。</p>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'rgba(109,94,247,0.10)' }} contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Bar dataKey="value" fill="#6D5EF7" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
