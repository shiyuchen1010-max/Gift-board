import type { GiftFolder } from '../types/gift';

export const folderLabels: Record<GiftFolder, string> = {
  classic: 'Classic',
  activity: 'Activity',
  member: 'Member',
  royal: 'Royal',
};

export const currencyLabels = {
  Gold: '金币',
  Diamond: '钻石',
};

export function formatPrice(value: number | null): string {
  if (value === null) {
    return '未定价';
  }
  return new Intl.NumberFormat('zh-CN').format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatBadgeLabel(text: string | null | undefined): string {
  if (!text) {
    return '无角标';
  }
  return text.replace(/[-_]/g, ' ');
}

export function resolveAssetPath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return new URL(normalizedPath, document.baseURI).toString();
}


