import { resolveAssetPath } from './format';

const badgeIconLabelByCode: Record<string, string> = {
  'color-customized': '颜色定制',
  'weekly-gifts': '周礼物',
  'monthly-gifts': '月礼物',
  'mystery-gifts-box': '盲盒礼物',
  'on-mic-effect': '上麦特效',
  'cumulative-gift': '累计礼物',
  'profile-display': '主页展示',
  'upgrade-gift': '升级礼物',
  'sound-effect': '音效礼物',
  'show-all-rooms': '全房间展示',
};

const badgeIconLabelSet = new Set(Object.values(badgeIconLabelByCode));

function normalizeBadgeLabel(label: string | null | undefined): string | null {
  const normalized = label?.trim();
  return normalized ? normalized : null;
}

export function getBadgeIconLabel(options: { code?: string | null; label?: string | null }): string | null {
  if (options.code && badgeIconLabelByCode[options.code]) {
    return badgeIconLabelByCode[options.code];
  }

  const normalizedLabel = normalizeBadgeLabel(options.label);
  if (normalizedLabel && badgeIconLabelSet.has(normalizedLabel)) {
    return normalizedLabel;
  }

  return null;
}

export function resolveBadgeIconPath(options: { code?: string | null; label?: string | null }): string | null {
  const badgeIconLabel = getBadgeIconLabel(options);
  return badgeIconLabel ? resolveAssetPath(`badges/${badgeIconLabel}.png`) : null;
}
