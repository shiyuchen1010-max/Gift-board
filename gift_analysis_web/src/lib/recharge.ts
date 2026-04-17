export interface RechargePack {
  id: string;
  priceUsd: number;
  priceCents: number;
  diamonds: number;
  label: string;
  shortLabel: string;
}

export interface RechargeEstimate {
  estimatedUsd: number;
  coveredDiamonds: number;
  rechargePlanLabel: string;
}

function formatDiamondAmount(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatPackPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export const YALLA_LUDO_RECHARGE_PACKS: RechargePack[] = [
  { id: 'pack-099', priceUsd: 0.99, priceCents: 99, diamonds: 400, label: '$0.99 · 400 钻石', shortLabel: '$0.99' },
  { id: 'pack-399', priceUsd: 3.99, priceCents: 399, diamonds: 1800, label: '$3.99 · 1,800 钻石', shortLabel: '$3.99' },
  { id: 'pack-999', priceUsd: 9.99, priceCents: 999, diamonds: 5000, label: '$9.99 · 5,000 钻石', shortLabel: '$9.99' },
  { id: 'pack-2999', priceUsd: 29.99, priceCents: 2999, diamonds: 16000, label: '$29.99 · 16,000 钻石', shortLabel: '$29.99' },
  { id: 'pack-9999', priceUsd: 99.99, priceCents: 9999, diamonds: 53700, label: '$99.99 · 53,700 钻石', shortLabel: '$99.99' },
  { id: 'pack-29999', priceUsd: 299.99, priceCents: 29999, diamonds: 161700, label: '$299.99 · 161,700 钻石', shortLabel: '$299.99' },
].map((pack) => ({
  ...pack,
  label: `${formatPackPrice(pack.priceUsd)} · ${formatDiamondAmount(pack.diamonds)} 钻石`,
}));

export function buildRechargeEstimator(maxTargetDiamonds: number) {
  const normalizedMaxTarget = Math.max(0, Math.ceil(maxTargetDiamonds));
  const maxPackDiamonds = Math.max(...YALLA_LUDO_RECHARGE_PACKS.map((pack) => pack.diamonds));
  const limit = normalizedMaxTarget + maxPackDiamonds;
  const dp = Array<number>(limit + 1).fill(Number.POSITIVE_INFINITY);
  const prev = Array<number>(limit + 1).fill(-1);
  const chosenPackIndex = Array<number>(limit + 1).fill(-1);

  dp[0] = 0;

  for (let current = 0; current <= limit; current += 1) {
    if (!Number.isFinite(dp[current])) {
      continue;
    }

    YALLA_LUDO_RECHARGE_PACKS.forEach((pack, index) => {
      const next = current + pack.diamonds;
      if (next > limit) {
        return;
      }

      const nextCost = dp[current] + pack.priceCents;
      const shouldReplace =
        nextCost < dp[next] ||
        (nextCost === dp[next] && prev[next] >= 0 && current < prev[next]);

      if (shouldReplace) {
        dp[next] = nextCost;
        prev[next] = current;
        chosenPackIndex[next] = index;
      }
    });
  }

  return (targetDiamonds: number): RechargeEstimate | null => {
    if (targetDiamonds <= 0) {
      return {
        estimatedUsd: 0,
        coveredDiamonds: 0,
        rechargePlanLabel: '无需充值',
      };
    }

    const normalizedTarget = Math.ceil(targetDiamonds);
    let bestIndex = -1;

    for (let cursor = normalizedTarget; cursor <= limit; cursor += 1) {
      if (!Number.isFinite(dp[cursor])) {
        continue;
      }

      if (
        bestIndex === -1 ||
        dp[cursor] < dp[bestIndex] ||
        (dp[cursor] === dp[bestIndex] && cursor < bestIndex)
      ) {
        bestIndex = cursor;
      }
    }

    if (bestIndex === -1) {
      return null;
    }

    const counts = new Map<string, { count: number; pack: RechargePack }>();
    let cursor = bestIndex;

    while (cursor > 0) {
      const packIndex = chosenPackIndex[cursor];
      if (packIndex < 0) {
        break;
      }
      const pack = YALLA_LUDO_RECHARGE_PACKS[packIndex];
      const current = counts.get(pack.id) ?? { count: 0, pack };
      counts.set(pack.id, { count: current.count + 1, pack });
      cursor = prev[cursor];
    }

    const rechargePlanLabel = Array.from(counts.values())
      .sort((left, right) => right.pack.priceUsd - left.pack.priceUsd)
      .map(({ count, pack }) => `${count} × ${pack.shortLabel}`)
      .join(' + ');

    return {
      estimatedUsd: dp[bestIndex] / 100,
      coveredDiamonds: bestIndex,
      rechargePlanLabel: rechargePlanLabel ? `${rechargePlanLabel}（约 ${formatDiamondAmount(bestIndex)} 钻）` : '暂无参考组合',
    };
  };
}
