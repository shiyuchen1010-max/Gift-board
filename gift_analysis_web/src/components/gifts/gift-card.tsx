import { ArrowRight, Layers3, Sparkle, Star } from 'lucide-react';

import { formatPrice, resolveAssetPath } from '../../lib/format';
import type { BadgeDefinition, GiftRecord } from '../../types/gift';
import { BadgeLabel } from '../badges/badge-label';


interface GiftCardProps {
  gift: GiftRecord;
  badgeDefinition?: BadgeDefinition;
  isSelected: boolean;
  onSelect: () => void;
  onReview: () => void;
  onGameplayClick: () => void;
}

export function GiftCard({ gift, badgeDefinition, isSelected, onSelect, onReview, onGameplayClick }: GiftCardProps) {
  const badgeCode = gift.badgeType ?? badgeDefinition?.code ?? null;
  const gameplayLabel = gift.hasBadge ? badgeDefinition?.gameplay ?? badgeDefinition?.label ?? gift.gameplayType ?? '待确认角标' : null;


  return (

    <article
      className={`glass-panel group flex flex-col overflow-hidden rounded-[30px] transition duration-300 ${
        isSelected ? 'border-cyan/40 shadow-glow ring-2 ring-cyan/30' : 'border-white/10 hover:-translate-y-1 hover:border-cyan/40 hover:shadow-glow'
      }`}
    >
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,199,240,0.22),transparent_30%),radial-gradient(circle_at_center,rgba(109,94,247,0.16),transparent_40%)]" />
        <div className="relative z-10 flex min-h-[272px] items-center justify-center rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <img
            src={resolveAssetPath(gift.relativeImagePath)}
            alt={gift.name}
            loading="lazy"
            className="max-h-60 max-w-full rounded-[20px] object-contain drop-shadow-[0_18px_36px_rgba(8,15,35,0.55)] transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200 backdrop-blur">
          <Layers3 className="h-3.5 w-3.5" />
          <span>{gift.folder}</span>
        </div>
        {isSelected ? <div className="absolute right-6 top-6 rounded-full border border-cyan/30 bg-cyan/15 px-3 py-1 text-xs text-cyan-50">当前聚焦</div> : null}
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
          {gameplayLabel ? (
            <button
              type="button"
              onClick={onGameplayClick}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan/40 hover:bg-cyan/20"
            >
              <BadgeLabel code={badgeCode} label={gameplayLabel} textClassName="text-xs font-medium text-cyan-100" />
            </button>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">无角标</span>
          )}
        </div>


        <div className="mt-auto rounded-[20px] border border-white/10 bg-slate-950/35 p-4">
          <div className="flex items-center justify-end text-sm text-slate-300">
            <div className="inline-flex items-center gap-1 text-amber-200">
              <Star className="h-4 w-4" />
              <span>{gift.hasBadge ? '玩法型礼物' : '基础礼物'}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSelect}
              aria-pressed={isSelected}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 transition hover:border-cyan/40 hover:bg-cyan/10"
            >
              {isSelected ? '保持聚焦' : '聚焦这张礼物'}
            </button>
            <button
              type="button"
              onClick={onReview}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-2 text-xs text-cyan-50 transition hover:border-cyan/40 hover:bg-cyan/20"
            >
              去复核
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
