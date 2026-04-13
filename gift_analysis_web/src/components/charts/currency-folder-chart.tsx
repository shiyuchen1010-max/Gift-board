import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartDatum } from '../../types/gift';

interface CurrencyFolderChartProps {
  data: ChartDatum[];
}

export function CurrencyFolderChart({ data }: CurrencyFolderChartProps) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <h3 className="mb-2 text-lg font-semibold text-white">分类与货币结构</h3>
      <p className="mb-4 text-sm text-slate-300">对比四个礼物分类中的金币与钻石结构，以及分类容量差异。</p>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'rgba(34,199,240,0.10)' }} contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Legend />
            <Bar dataKey="diamond" stackId="currency" fill="#22C7F0" radius={[8, 8, 0, 0]} />
            <Bar dataKey="gold" stackId="currency" fill="#F59E0B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
