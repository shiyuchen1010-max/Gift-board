import { useCallback, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  FolderOpen,
  RotateCcw,
  Save,
  ScanSearch,
  X,
} from 'lucide-react';
import { resolveAssetPath } from '../../lib/format';
import {
  buildBadgeLabelMap,
  buildManualReviewItemUpdate,
  hasSameManualReviewState,
  resetManualReviewItem,
  type ReviewDecision,
} from '../../lib/manual-review';
import {
  pickWorkspaceDirectory,
  saveWorkspaceReviewFiles,
  supportsWorkspaceDirectorySync,
} from '../../lib/workspace-sync';
import type { BadgeDefinition, GiftRecord, ManualBadgeReviewItem } from '../../types/gift';

interface ManualReviewSectionProps {
  items: ManualBadgeReviewItem[];
  savedItems: ManualBadgeReviewItem[];
  badges: BadgeDefinition[];
  gifts: GiftRecord[];
  onItemsChange: (next: ManualBadgeReviewItem[]) => void;
  onItemsSaved: (next: ManualBadgeReviewItem[]) => void;
}

type ViewFilter = 'all' | 'pending' | 'reviewed';

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: '待复核', className: 'border-amber-400/30 bg-amber-400/15 text-amber-100' },
  confirmed: { label: '已确认', className: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100' },
  corrected: { label: '已修正', className: 'border-cyan/30 bg-cyan/15 text-cyan-100' },
};

export function ManualReviewSection({
  items,
  savedItems,
  badges,
  gifts,
  onItemsChange,
  onItemsSaved,
}: ManualReviewSectionProps) {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('pending');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const workspaceDirRef = useRef<FileSystemDirectoryHandle | null>(null);

  const badgeLabelMap = useMemo(() => buildBadgeLabelMap(badges), [badges]);
  const savedMap = useMemo(() => new Map(savedItems.map((item) => [item.giftId, item])), [savedItems]);

  const pendingItems = useMemo(() => items.filter((i) => i.reviewStatus === 'pending'), [items]);
  const reviewedItems = useMemo(() => items.filter((i) => i.reviewStatus !== 'pending'), [items]);
  const unsavedCount = useMemo(
    () => items.filter((item) => !hasSameManualReviewState(item, savedMap.get(item.giftId))).length,
    [items, savedMap],
  );

  const displayedItems = useMemo(() => {
    if (viewFilter === 'pending') return pendingItems;
    if (viewFilter === 'reviewed') return reviewedItems;
    return items;
  }, [viewFilter, items, pendingItems, reviewedItems]);

  const updateItem = useCallback(
    (giftId: string, decision: ReviewDecision) => {
      onItemsChange(
        items.map((item) =>
          item.giftId === giftId ? buildManualReviewItemUpdate(item, badgeLabelMap, decision) : item,
        ),
      );
    },
    [items, onItemsChange, badgeLabelMap],
  );

  const undoItem = useCallback(
    (giftId: string) => {
      onItemsChange(items.map((item) => (item.giftId === giftId ? resetManualReviewItem(item) : item)));
    },
    [items, onItemsChange],
  );

  const handleSave = useCallback(async () => {
    setSaveMessage(null);
    setSaving(true);
    try {
      if (!workspaceDirRef.current) {
        workspaceDirRef.current = await pickWorkspaceDirectory() || null;
      }
      const result = await saveWorkspaceReviewFiles({
        rootHandle: workspaceDirRef.current,
        manualReviews: items,
        gifts,
      });
      onItemsSaved([...items]);
      setSaveMessage({ ok: true, text: `已写回 ${result.writtenFiles.length} 个文件，可以直接 git push 了` });
    } catch (error) {
      workspaceDirRef.current = null;
      setSaveMessage({ ok: false, text: error instanceof Error ? error.message : '保存失败' });
    } finally {
      setSaving(false);
    }
  }, [items, gifts, onItemsSaved]);

  return (
    <section id="manual-review" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="section-title">人工复核工作台</h2>
          <p className="section-copy">
            看图片，点"正确"或选择角标后点"提交纠错"。全部复核后点"保存到本地"，文件自动改好，你只需 git push。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
            待复核 {pendingItems.length} / 总 {items.length}
          </div>
          {unsavedCount > 0 && (
            <div className="rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm text-cyan-100">
              {unsavedCount} 条未保存
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <ViewFilterButtons value={viewFilter} onChange={setViewFilter} counts={{ all: items.length, pending: pendingItems.length, reviewed: reviewedItems.length }} />
        <div className="ml-auto flex items-center gap-3">
          {supportsWorkspaceDirectorySync() ? (
            <button
              type="button"
              disabled={saving || unsavedCount === 0}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/25 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <Spinner /> : <Save className="h-4 w-4" />}
              保存到本地
            </button>
          ) : (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
              请用 Chrome / Edge 打开此页面以启用本地保存
            </div>
          )}
        </div>
      </div>

      {/* Save feedback */}
      {saveMessage && (
        <div
          className={`rounded-2xl border px-5 py-3 text-sm ${
            saveMessage.ok
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
              : 'border-rose-400/30 bg-rose-400/10 text-rose-100'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={AlertTriangle} label="待复核" value={String(pendingItems.length)} tone="warning" />
        <SummaryCard icon={CheckCircle2} label="已处理" value={String(reviewedItems.length)} tone="success" />
        <SummaryCard icon={ScanSearch} label="总队列" value={String(items.length)} tone="primary" />
      </div>

      {/* Card grid */}
      {displayedItems.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {displayedItems.map((item) => (
            <ReviewCard
              key={item.giftId}
              item={item}
              badges={badges}
              isSaved={hasSameManualReviewState(item, savedMap.get(item.giftId))}
              onConfirm={() => updateItem(item.giftId, { kind: 'confirmed' })}
              onCorrect={(hasBadge, badgeType) =>
                updateItem(item.giftId, { kind: 'corrected', hasBadge, badgeType })
              }
              onUndo={() => undoItem(item.giftId)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[28px] p-8 text-center text-slate-300">
          {viewFilter === 'pending'
            ? '所有待复核项已处理完毕，记得点"保存到本地"！'
            : '当前筛选下没有匹配的礼物。'}
        </div>
      )}
    </section>
  );
}

/* ───── ReviewCard ───── */

interface ReviewCardProps {
  item: ManualBadgeReviewItem;
  badges: BadgeDefinition[];
  isSaved: boolean;
  onConfirm: () => void;
  onCorrect: (hasBadge: boolean, badgeType: string | null) => void;
  onUndo: () => void;
}

function ReviewCard({ item, badges, isSaved, onConfirm, onCorrect, onUndo }: ReviewCardProps) {
  const [showCorrectPanel, setShowCorrectPanel] = useState(false);
  const meta = STATUS_META[item.reviewStatus] ?? STATUS_META.pending;
  const isPending = item.reviewStatus === 'pending';

  return (
    <article className={`glass-panel flex flex-col overflow-hidden rounded-[28px] transition ${!isSaved ? 'ring-2 ring-cyan/40' : 'border-white/10'}`}>
      {/* Image */}
      <div className="relative bg-slate-950/70 p-4">
        <div className="flex min-h-[220px] items-center justify-center rounded-[22px] border border-white/10 bg-slate-950/70 p-3">
          <img
            src={resolveAssetPath(item.relativeImagePath)}
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

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          <p className="mt-1 break-all text-xs text-slate-400">{item.giftId}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoBlock title="机器预测" value={item.predictedBadgeLabel} detail={`${Math.round(item.predictedConfidence * 100)}% · ${item.predictedSource}`} />
          <InfoBlock title="当前生效" value={item.finalBadgeLabel} detail={isPending ? '尚未人工确认' : '已纳入最终结果'} />
        </div>

        {/* Action buttons */}
        {isPending ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/25"
              >
                <Check className="h-4 w-4" /> 正确
              </button>
              <button
                type="button"
                onClick={() => setShowCorrectPanel(!showCorrectPanel)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/15 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-400/25"
              >
                <X className="h-4 w-4" /> 纠错 <ChevronDown className={`h-3.5 w-3.5 transition ${showCorrectPanel ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {showCorrectPanel && (
              <CorrectionPanel
                badges={badges}
                onSubmit={(hasBadge, badgeType) => {
                  onCorrect(hasBadge, badgeType);
                  setShowCorrectPanel(false);
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className={`rounded-full border px-3 py-1 text-xs ${meta.className}`}>
              {meta.label} {item.reviewStatus === 'corrected' ? `→ ${item.finalBadgeLabel}` : ''}
            </span>
            <button
              type="button"
              onClick={onUndo}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
            >
              <RotateCcw className="h-3 w-3" /> 撤回
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/* ───── CorrectionPanel ───── */

interface CorrectionPanelProps {
  badges: BadgeDefinition[];
  onSubmit: (hasBadge: boolean, badgeType: string | null) => void;
}

function CorrectionPanel({ badges, onSubmit }: CorrectionPanelProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [noBadge, setNoBadge] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <p className="text-xs text-slate-400">选择正确的角标，或标记为无角标：</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setNoBadge(true); setSelectedType(null); }}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${noBadge ? 'border-cyan/60 bg-cyan/20 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
        >
          无角标
        </button>
        {badges.filter((b) => b.code !== 'unknown-badge').map((badge) => (
          <button
            key={badge.code}
            type="button"
            onClick={() => { setSelectedType(badge.code); setNoBadge(false); }}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${selectedType === badge.code ? 'border-cyan/60 bg-cyan/20 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
            style={selectedType === badge.code ? { borderColor: badge.color, backgroundColor: `${badge.color}33` } : undefined}
          >
            {badge.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!noBadge && !selectedType}
        onClick={() => onSubmit(noBadge ? false : true, noBadge ? null : selectedType)}
        className="w-full rounded-2xl border border-cyan/30 bg-cyan/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan/25 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        提交纠错
      </button>
    </div>
  );
}

/* ───── Small sub-components ───── */

function ViewFilterButtons({ value, onChange, counts }: { value: ViewFilter; onChange: (v: ViewFilter) => void; counts: Record<ViewFilter, number> }) {
  const options: { key: ViewFilter; label: string }[] = [
    { key: 'pending', label: '待复核' },
    { key: 'reviewed', label: '已处理' },
    { key: 'all', label: '全部' },
  ];
  return (
    <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-full px-4 py-1.5 text-xs transition ${value === opt.key ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
        >
          {opt.label} ({counts[opt.key]})
        </button>
      ))}
    </div>
  );
}

function InfoBlock({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
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

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}
