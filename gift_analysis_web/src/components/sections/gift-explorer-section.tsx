import type { BadgeDefinition, GiftRecord } from '../../types/gift';
import { GiftCard } from '../gifts/gift-card';

interface GiftExplorerSectionProps {
  gifts: GiftRecord[];
  badgeMap: Map<string, BadgeDefinition>;
}

export function GiftExplorerSection({ gifts, badgeMap }: GiftExplorerSectionProps) {
  return (
    <section id="gallery" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="section-title">礼物图库浏览</h2>
          <p className="section-copy">当前筛选结果会同步更新下面的礼物卡片，方便你同时观察视觉素材和数据标签。</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">已展示 {gifts.length} 个礼物</div>
      </div>
      {gifts.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {gifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} badgeDefinition={gift.badgeType ? badgeMap.get(gift.badgeType) : undefined} />
          ))}
        </div>
      ) : (

        <div className="glass-panel rounded-[28px] p-8 text-center text-slate-300">当前没有匹配到礼物，请调整筛选条件后再试。</div>
      )}
    </section>
  );
}
