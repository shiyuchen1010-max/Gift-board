import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartDatum } from '../../types/gift';

interface BadgeGameplayChartProps {
  data: ChartDatum[];
}

export function BadgeGameplayChart({ data }: BadgeGameplayChartProps) {
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
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
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
