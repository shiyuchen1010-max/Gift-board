import { AlertTriangle, CheckCircle2, ClipboardCheck, Edit3, ScanSearch } from 'lucide-react';
import type { ManualBadgeReviewItem } from '../../types/gift';

interface ManualReviewSectionProps {
  items: ManualBadgeReviewItem[];
}

const statusMeta: Record<string, { label: string; className: string }> = {
  pending: {
    label: '待复核',
    className: 'border-amber-400/30 bg-amber-400/15 text-amber-100',
  },
  confirmed: {
    label: '已确认',
    className: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100',
  },
  corrected: {
    label: '已修正',
    className: 'border-cyan/30 bg-cyan/15 text-cyan-100',
  },
};

export function ManualReviewSection({ items }: ManualReviewSectionProps) {
  const pendingItems = items.filter((item) => item.reviewStatus === 'pending');
  const reviewedItems = items.filter((item) => item.reviewStatus !== 'pending');

  return (
    <section id="manual-review" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="section-title">人工复核清单</h2>
          <p className="section-copy">这里集中列出所有识别置信度不是 100% 的礼物，方便你逐张核对并把结果写回人工复核文件。</p>
        </div>
        <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
          待复核 {pendingItems.length} / 总计 {items.length}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="glass-panel rounded-[28px] p-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-2xl bg-amber-400/15 p-3 text-amber-200">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <h3 className="text-lg font-semibold text-white">怎么做人工核对</h3>
              <ol className="space-y-2 leading-6 text-slate-300">
                <li>1. 打开 `gift_analysis_config/manual_badge_reviews.json`，按 `giftId` 找到对应礼物。</li>
                <li>2. 如果预测正确，把 `reviewStatus` 改成 `confirmed`。</li>
                <li>3. 如果预测错误，把 `reviewStatus` 改成 `corrected`，再填写 `reviewHasBadge` 和 `reviewBadgeType`。</li>
                <li>4. 保存后重跑 `build_gift_dataset.py`，网页里的最终角标结果会同步更新。</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <SummaryCard icon={AlertTriangle} label="待复核" value={String(pendingItems.length)} tone="warning" />
          <SummaryCard icon={CheckCircle2} label="已处理" value={String(reviewedItems.length)} tone="success" />
          <SummaryCard icon={ScanSearch} label="总队列" value={String(items.length)} tone="primary" />
        </div>
      </div>

      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((item) => {
            const meta = statusMeta[item.reviewStatus] ?? statusMeta.pending;
            return (
              <article key={item.giftId} className="glass-panel flex flex-col overflow-hidden rounded-[28px] border-white/10">
                <div className="relative bg-slate-950/70 p-4">
                  <div className="flex min-h-[220px] items-center justify-center rounded-[22px] border border-white/10 bg-slate-950/70 p-3">
                    <img
                      src={`/${item.relativeImagePath}`}
                      alt={item.name}
                      loading="lazy"
                      className="max-h-52 max-w-full rounded-[18px] object-contain"
                    />
                  </div>
                  <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-100">
                    {item.folder}
                  </div>
                  <div className={`absolute right-6 top-6 rounded-full border px-3 py-1 text-xs ${meta.className}`}>
                    {meta.label}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 break-all text-xs text-slate-400">{item.giftId}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReviewInfoBlock
                      title="机器预测"
                      value={item.predictedBadgeLabel}
                      detail={`${Math.round(item.predictedConfidence * 100)}% · ${item.predictedSource}`}
                    />
                    <ReviewInfoBlock
                      title="当前生效"
                      value={item.finalBadgeLabel}
                      detail={item.reviewStatus === 'pending' ? '尚未人工确认' : '已纳入最终结果'}
                    />
                  </div>

                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <div className="mb-2 flex items-center gap-2 text-white">
                      <Edit3 className="h-4 w-4 text-cyan" />
                      <span className="font-medium">建议填写</span>
                    </div>
                    <p>`reviewStatus`: {item.predictedHasBadge ? 'confirmed 或 corrected' : 'confirmed（确认为无角标）或 corrected'}</p>
                    <p>`reviewHasBadge`: {item.reviewHasBadge === null ? '待填写' : String(item.reviewHasBadge)}</p>
                    <p>`reviewBadgeType`: {item.reviewBadgeType ?? '待填写 / 可留空'}</p>
                    <p className="mt-2 text-xs text-slate-400">文件名：{item.fileName}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-[28px] p-8 text-center text-slate-300">当前没有待人工复核的礼物，识别结果已经全部达到 100% 或已被人工确认。</div>
      )}
    </section>
  );
}

interface SummaryCardProps {
  icon: typeof AlertTriangle;
  label: string;
  value: string;
  tone: 'warning' | 'success' | 'primary';
}

function SummaryCard({ icon: Icon, label, value, tone }: SummaryCardProps) {
  const tones = {
    warning: 'from-amber-400/30 to-orange-400/20 text-amber-100',
    success: 'from-emerald-400/30 to-teal-400/20 text-emerald-100',
    primary: 'from-cyan/30 to-brand/20 text-cyan-100',
  } as const;

  return (
    <div className="glass-panel rounded-[24px] p-4">
      <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

interface ReviewInfoBlockProps {
  title: string;
  value: string;
  detail: string;
}

function ReviewInfoBlock({ title, value, detail }: ReviewInfoBlockProps) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
  );
}
