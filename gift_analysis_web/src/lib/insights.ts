import type { BadgeSummary, GiftRecord, InsightResult, OverviewMetrics } from '../types/gift';
import { formatPercent, formatPrice } from './format';

export function buildInsights(
  visibleGifts: GiftRecord[],
  overview: OverviewMetrics,
  badgeSummaries: BadgeSummary[],
): InsightResult[] {
  const insights: InsightResult[] = [];

  if (overview.topGift) {
    insights.push({
      title: '最高价值礼物',
      detail: `${overview.topGift.name} 当前是筛选结果里的价格高点，标价 ${formatPrice(overview.topGift.price)}，来自 ${overview.topGift.folder} 分类。`,
      tone: 'primary',
    });
  }

  if (overview.topFolder) {
    insights.push({
      title: '展示量最集中的分类',
      detail: `${overview.topFolder.name} 在当前视图里出现 ${overview.topFolder.value} 次，是礼物覆盖最密集的分类。`,
      tone: 'success',
    });
  }

  insights.push({
    title: '角标覆盖率',
    detail: `当前筛选结果中有 ${overview.badgeCount} 个礼物带可见角标，占比 ${formatPercent(overview.badgeRate)}，说明角标玩法对礼物体系影响已经很明显。`,
    tone: 'warning',
  });

  const premiumBadge = [...badgeSummaries].sort((a, b) => b.averagePrice - a.averagePrice)[0];
  if (premiumBadge) {
    insights.push({
      title: '最容易形成溢价的角标',
      detail: `${premiumBadge.label} 的平均价格达到 ${formatPrice(Math.round(premiumBadge.averagePrice))}，属于当前数据里更有溢价感的玩法标签。`,

      tone: 'primary',
    });
  }

  const noBadgeCount = visibleGifts.filter((gift) => !gift.hasBadge).length;
  insights.push({
    title: '无角标礼物基线',
    detail: `当前还有 ${noBadgeCount} 个礼物没有识别到可见角标，这部分很适合作为和玩法型礼物做价格对照的基线样本。`,
    tone: 'success',
  });

  return insights.slice(0, 5);
}
