import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

import { formatPrice } from '../../lib/format';
import type { ChartDatum } from '../../types/gift';

interface TopPriceChartProps {
  data: ChartDatum[];
  selectedGiftId: string | null;
  onSelectGift: (giftId: string) => void;
}

export function TopPriceChart({ data, selectedGiftId, onSelectGift }: TopPriceChartProps) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">高价礼物排行榜</h3>
          <p className="mt-2 text-sm text-slate-300">点选具体礼物后，礼物库会直接聚焦到对应卡片。</p>
        </div>
        <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">点击可定位礼物</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 28 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" horizontal={false} />
            <XAxis type="number" stroke="#94A3B8" tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value)} />
            <YAxis type="category" dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} width={110} />
            <Tooltip cursor={{ fill: 'rgba(52,211,153,0.10)' }} contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }} />
            <Bar dataKey="value" radius={[0, 12, 12, 0]} onClick={(datum) => {
              const giftId = datum?.payload?.giftId || datum?.giftId;
              if (giftId) {
                onSelectGift(giftId);
              }
            }}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={selectedGiftId === entry.giftId ? '#34D399' : entry.color ?? '#34D399'}
                  opacity={selectedGiftId && selectedGiftId !== entry.giftId ? 0.45 : 1}
                  stroke={selectedGiftId === entry.giftId ? '#A7F3D0' : 'transparent'}
                  strokeWidth={selectedGiftId === entry.giftId ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
