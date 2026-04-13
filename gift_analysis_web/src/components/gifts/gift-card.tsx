import { Layers3, Sparkle, Star } from 'lucide-react';
import type { BadgeDefinition, GiftRecord } from '../../types/gift';
import { formatPrice } from '../../lib/format';

interface GiftCardProps {
  gift: GiftRecord;
  badgeDefinition?: BadgeDefinition;
}

export function GiftCard({ gift, badgeDefinition }: GiftCardProps) {
  return (
    <article className="glass-panel group flex flex-col overflow-hidden rounded-[30px] border-white/10 transition duration-300 hover:-translate-y-1 hover:border-cyan/40 hover:shadow-glow">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,199,240,0.22),transparent_30%),radial-gradient(circle_at_center,rgba(109,94,247,0.16),transparent_40%)]" />
        <div className="relative z-10 flex min-h-[272px] items-center justify-center rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <img
            src={`/${gift.relativeImagePath}`}
            alt={gift.name}
            loading="lazy"
            className="max-h-60 max-w-full rounded-[20px] object-contain drop-shadow-[0_18px_36px_rgba(8,15,35,0.55)] transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200 backdrop-blur">

          <Layers3 className="h-3.5 w-3.5" />
          <span>{gift.folder}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{gift.name}</h3>
            <p className="mt-1 text-sm text-slate-400">位置 {gift.screen}-{gift.row}{gift.col} · {gift.currency ?? '未标注货币'}</p>
          </div>
          <div className="rounded-2xl bg-white/6 px-3 py-2 text-right">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">价格</p>
            <p className="text-lg font-bold text-cyan">{formatPrice(gift.price)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">{gift.priceTier}</span>
          {gift.hasBadge ? (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: `${badgeDefinition?.color ?? '#64748B'}33`, border: `1px solid ${badgeDefinition?.color ?? '#64748B'}66` }}
            >
              {badgeDefinition?.label ?? gift.badgeType ?? '待确认角标'}
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">无角标</span>
          )}
          {gift.gameplayType ? (
            <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan-100">玩法 {badgeDefinition?.gameplay ?? gift.gameplayType}</span>
          ) : null}

        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-300">
          <div className="inline-flex items-center gap-2">
            <Sparkle className="h-4 w-4 text-cyan" />
            <span>识别置信度 {(gift.badgeConfidence * 100).toFixed(0)}%</span>
          </div>
          <div className="inline-flex items-center gap-1 text-amber-200">
            <Star className="h-4 w-4" />
            <span>{gift.hasBadge ? '玩法型礼物' : '基础礼物'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
