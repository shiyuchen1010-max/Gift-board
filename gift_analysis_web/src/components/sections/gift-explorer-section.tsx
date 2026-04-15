import { ArrowRight, Boxes, ChevronDown, Focus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { BadgeDefinition, FilterState, GiftRecord } from '../../types/gift';
import { GiftCard } from '../gifts/gift-card';

interface GiftExplorerSectionProps {
  gifts: GiftRecord[];
  badgeMap: Map<string, BadgeDefinition>;
  selectedGiftId: string | null;
  onSelectGift: (giftId: string) => void;
  onOpenReview: (giftId: string) => void;
  onFilterDrillDown: (patch: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

const PAGE_SIZE = 12;

export function GiftExplorerSection({
  gifts,
  badgeMap,
  selectedGiftId,
  onSelectGift,
  onOpenReview,
  onFilterDrillDown,
  onResetFilters,
}: GiftExplorerSectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [gifts]);

  useEffect(() => {
    if (!selectedGiftId) {
      return;
    }
    const selectedIndex = gifts.findIndex((gift) => gift.id === selectedGiftId);
    if (selectedIndex >= 0 && selectedIndex + 1 > visibleCount) {
      setVisibleCount(Math.ceil((selectedIndex + 1) / PAGE_SIZE) * PAGE_SIZE);
    }
  }, [gifts, selectedGiftId, visibleCount]);

  const visibleGifts = useMemo(() => gifts.slice(0, visibleCount), [gifts, visibleCount]);
  const selectedGift = useMemo(() => gifts.find((gift) => gift.id === selectedGiftId) ?? null, [gifts, selectedGiftId]);

  return (
    <section id="gift-explorer" className="flex scroll-mt-44 flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="section-title">礼物库浏览</h2>
          <p className="section-copy">当前筛选结果会同步更新下面的礼物卡片，你可以继续按玩法或单个礼物做更细的聚焦。</p>

        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InfoPill icon={Boxes} label={`已展示 ${visibleGifts.length} / ${gifts.length}`} />
          {selectedGift ? <InfoPill icon={Focus} label={`当前聚焦 ${selectedGift.name}`} tone="cyan" /> : null}
        </div>
      </div>

      {selectedGift ? (
        <div className="rounded-[24px] border border-cyan/20 bg-cyan/10 px-4 py-3 text-sm text-cyan-50">
          当前正在查看 <span className="font-semibold text-white">{selectedGift.name}</span>。你可以继续打开复核，或点击卡片上的玩法标签查看同一类礼物。
        </div>
      ) : null}

      {gifts.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
            {visibleGifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                badgeDefinition={gift.badgeType ? badgeMap.get(gift.badgeType) : undefined}
                isSelected={selectedGiftId === gift.id}
                onSelect={() => onSelectGift(gift.id)}
                onReview={() => onOpenReview(gift.id)}
                onGameplayClick={() => gift.gameplayType && onFilterDrillDown({ gameplayType: gift.gameplayType })}
              />

            ))}
          </div>

          {visibleCount < gifts.length ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan/40 hover:bg-cyan/10"
              >
                继续加载更多礼物
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="glass-panel rounded-[28px] p-8 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">当前没有匹配到礼物</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">建议先清空部分筛选条件，再从图表或角标专题重新缩小范围。</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm text-cyan-50 transition hover:border-cyan/40 hover:bg-cyan/20"
            >
              恢复全量结果
            </button>
            <button
              type="button"
              onClick={() => onFilterDrillDown({ badgeMode: 'with' })}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan/40 hover:bg-cyan/10"
            >
              只看有角标礼物
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoPill({ icon: Icon, label, tone = 'default' }: { icon: typeof Boxes; label: string; tone?: 'default' | 'cyan' }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${tone === 'cyan' ? 'border-cyan/20 bg-cyan/10 text-cyan-50' : 'border-white/10 bg-white/5 text-slate-200'}`}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}
