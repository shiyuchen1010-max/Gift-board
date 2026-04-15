import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, ChevronDown, RotateCcw, Save, ScanSearch, X } from 'lucide-react';


import { resolveAssetPath } from '../../lib/format';
import {
  buildBadgeLabelMap,
  buildManualReviewItemUpdate,
  hasSameManualReviewState,
  resetManualReviewItem,
  type ReviewDecision,
} from '../../lib/manual-review';
import { pickWorkspaceDirectory, saveWorkspaceReviewFiles, supportsWorkspaceDirectorySync } from '../../lib/workspace-sync';
import type { BadgeDefinition, GiftRecord, ManualBadgeReviewItem } from '../../types/gift';
import { BadgeLabel } from '../badges/badge-label';


interface ManualReviewSectionProps {
  items: ManualBadgeReviewItem[];
  savedItems: ManualBadgeReviewItem[];
  badges: BadgeDefinition[];
  gifts: GiftRecord[];
  visibleGiftIds: string[];
  focusedGiftId: string | null;
  onItemsChange: (next: ManualBadgeReviewItem[]) => void;
  onItemsSaved: (next: ManualBadgeReviewItem[]) => void;
  onFocusHandled: () => void;
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
  visibleGiftIds,
  focusedGiftId,
  onItemsChange,
  onItemsSaved,
  onFocusHandled,
}: ManualReviewSectionProps) {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('pending');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const workspaceDirRef = useRef<FileSystemDirectoryHandle | null>(null);

  const badgeLabelMap = useMemo(() => buildBadgeLabelMap(badges), [badges]);
  const savedMap = useMemo(() => new Map(savedItems.map((item) => [item.giftId, item])), [savedItems]);
  const visibleSet = useMemo(() => new Set(visibleGiftIds), [visibleGiftIds]);
  const scopedItems = useMemo(() => items.filter((item) => visibleSet.has(item.giftId)), [items, visibleSet]);
  const pendingItems = useMemo(() => scopedItems.filter((item) => item.reviewStatus === 'pending'), [scopedItems]);
  const reviewedItems = useMemo(() => scopedItems.filter((item) => item.reviewStatus !== 'pending'), [scopedItems]);
  const unsavedCount = useMemo(() => scopedItems.filter((item) => !hasSameManualReviewState(item, savedMap.get(item.giftId))).length, [savedMap, scopedItems]);

  const displayedItems = useMemo(() => {
    if (viewFilter === 'pending') return pendingItems;
    if (viewFilter === 'reviewed') return reviewedItems;
    return scopedItems;
  }, [pendingItems, reviewedItems, scopedItems, viewFilter]);

  useEffect(() => {
    if (!focusedGiftId) {
      return;
    }
    setViewFilter('all');
    requestAnimationFrame(() => {
      document.getElementById(`review-${focusedGiftId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onFocusHandled();
    });
  }, [focusedGiftId, onFocusHandled]);

  const updateItem = useCallback((giftId: string, decision: ReviewDecision) => {
    onItemsChange(items.map((item) => (item.giftId === giftId ? buildManualReviewItemUpdate(item, badgeLabelMap, decision) : item)));
  }, [badgeLabelMap, items, onItemsChange]);

  const undoItem = useCallback((giftId: string) => {
    onItemsChange(items.map((item) => (item.giftId === giftId ? resetManualReviewItem(item) : item)));
  }, [items, onItemsChange]);

  const handleSave = useCallback(async () => {
    setSaveMessage(null);
    setSaving(true);
    try {
      if (!workspaceDirRef.current) {
        workspaceDirRef.current = (await pickWorkspaceDirectory()) || null;
      }
      const result = await saveWorkspaceReviewFiles({ rootHandle: workspaceDirRef.current, manualReviews: items, gifts });
      onItemsSaved([...items]);
      setSaveMessage({ ok: true, text: `已同步 ${result.writtenFiles.length} 个结果文件，当前复核结论已经保持一致。` });
    } catch (error) {
      workspaceDirRef.current = null;
      setSaveMessage({ ok: false, text: error instanceof Error ? error.message : '保存失败' });
    } finally {
      setSaving(false);
    }
  }, [gifts, items, onItemsSaved]);

  return (
    <section id="manual-review" className="flex scroll-mt-44 flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="section-title">角标复核队列</h2>
          <p className="section-copy">这里会优先展示当前筛选范围内的礼物，方便你沿着“看图表 → 看礼物 → 做复核”的路径继续处理。</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill label={`待复核 ${pendingItems.length}`} tone="warning" />
          <StatusPill label={`已处理 ${reviewedItems.length}`} tone="success" />
          {unsavedCount > 0 ? <StatusPill label={`${unsavedCount} 条未同步`} tone="cyan" /> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ViewFilterButtons value={viewFilter} onChange={setViewFilter} counts={{ all: scopedItems.length, pending: pendingItems.length, reviewed: reviewedItems.length }} />
        <div className="ml-auto flex items-center gap-3">
          {supportsWorkspaceDirectorySync() ? (
            <button
              type="button"
              disabled={saving || unsavedCount === 0}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? <Spinner /> : <Save className="h-4 w-4" />}
              同步复核结果
            </button>
          ) : (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">当前环境暂不支持直接写回，可先完成复核，稍后在支持的环境中保存。</div>
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        当前仅展示筛选范围内的 <span className="font-semibold text-white">{scopedItems.length}</span> 条复核项；如果你在礼物库里点了“去复核”，这里会自动定位到对应条目。
      </div>

      {saveMessage ? <div className={`rounded-2xl border px-5 py-3 text-sm ${saveMessage.ok ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/30 bg-rose-400/10 text-rose-100'}`}>{saveMessage.text}</div> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={AlertTriangle} label="待复核" value={String(pendingItems.length)} tone="warning" />
        <SummaryCard icon={CheckCircle2} label="已处理" value={String(reviewedItems.length)} tone="success" />
        <SummaryCard icon={ScanSearch} label="当前队列" value={String(scopedItems.length)} tone="primary" />
      </div>

      {displayedItems.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {displayedItems.map((item) => (
            <ReviewCard
              key={item.giftId}
              item={item}
              badges={badges}
              isSaved={hasSameManualReviewState(item, savedMap.get(item.giftId))}
              onConfirm={() => updateItem(item.giftId, { kind: 'confirmed' })}
              onCorrect={(hasBadge, badgeType) => updateItem(item.giftId, { kind: 'corrected', hasBadge, badgeType })}
              onUndo={() => undoItem(item.giftId)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-[28px] p-8 text-center text-slate-300">当前范围内没有需要展示的复核项，可以先切换筛选条件或返回礼物库重新选择。</div>
      )}
    </section>
  );
}

function ReviewCard({ item, badges, isSaved, onConfirm, onCorrect, onUndo }: { item: ManualBadgeReviewItem; badges: BadgeDefinition[]; isSaved: boolean; onConfirm: () => void; onCorrect: (hasBadge: boolean, badgeType: string | null) => void; onUndo: () => void; }) {
  const [showCorrectPanel, setShowCorrectPanel] = useState(false);
  const meta = STATUS_META[item.reviewStatus] ?? STATUS_META.pending;
  const isPending = item.reviewStatus === 'pending';

  return (
    <article id={`review-${item.giftId}`} className={`glass-panel flex flex-col overflow-hidden rounded-[28px] transition ${!isSaved ? 'ring-2 ring-cyan/40' : 'border-white/10'}`}>
      <div className="relative bg-slate-950/70 p-4">
        <div className="flex min-h-[220px] items-center justify-center rounded-[22px] border border-white/10 bg-slate-950/70 p-3">
          <img src={resolveAssetPath(item.relativeImagePath)} alt={item.name} loading="lazy" className="max-h-52 max-w-full rounded-[18px] object-contain" />
        </div>
        <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-100">{item.folder}</div>
        <div className={`absolute right-6 top-6 rounded-full border px-3 py-1 text-xs ${meta.className}`}>{meta.label}</div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-400">
            <span>当前建议：</span>
            <BadgeLabel code={item.predictedBadgeType} label={item.predictedBadgeLabel} textClassName="text-xs font-medium text-slate-200" />
            <span>· 识别把握 {Math.round(item.predictedConfidence * 100)}%</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoBlock
            title="识别建议"
            value={<BadgeLabel code={item.predictedBadgeType} label={item.predictedBadgeLabel} textClassName="text-sm font-semibold text-white" iconClassName="h-4 w-4" />}
            detail="可直接确认，也可以改成更合适的角标。"
          />
          <InfoBlock
            title="当前生效"
            value={<BadgeLabel code={item.finalBadgeType} label={item.finalBadgeLabel} textClassName="text-sm font-semibold text-white" iconClassName="h-4 w-4" />}
            detail={isPending ? '尚未人工确认' : '已纳入最终结果'}
          />
        </div>

        {isPending ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button type="button" onClick={onConfirm} className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/25"><Check className="h-4 w-4" /> 确认无误</button>
              <button type="button" onClick={() => setShowCorrectPanel(!showCorrectPanel)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-400/15 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-400/25"><X className="h-4 w-4" /> 纠正结果 <ChevronDown className={`h-3.5 w-3.5 transition ${showCorrectPanel ? 'rotate-180' : ''}`} /></button>
            </div>
            {showCorrectPanel ? <CorrectionPanel badges={badges} onSubmit={(hasBadge, badgeType) => { onCorrect(hasBadge, badgeType); setShowCorrectPanel(false); }} /> : null}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className={`rounded-full border px-3 py-1 text-xs ${meta.className}`}>{meta.label} {item.reviewStatus === 'corrected' ? `→ ${item.finalBadgeLabel}` : ''}</span>
            <button type="button" onClick={onUndo} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"><RotateCcw className="h-3 w-3" /> 撤回</button>
          </div>
        )}
      </div>
    </article>
  );
}

function CorrectionPanel({ badges, onSubmit }: { badges: BadgeDefinition[]; onSubmit: (hasBadge: boolean, badgeType: string | null) => void; }) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [noBadge, setNoBadge] = useState(false);
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-slate-400">选择更准确的角标，或者标记为无角标：</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { setNoBadge(true); setSelectedType(null); }} className={`rounded-full border px-3 py-1.5 text-xs transition ${noBadge ? 'border-cyan/60 bg-cyan/20 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>无角标</button>
        {badges.filter((badge) => badge.code !== 'unknown-badge').map((badge) => (
          <button key={badge.code} type="button" onClick={() => { setSelectedType(badge.code); setNoBadge(false); }} className={`rounded-full border px-3 py-1.5 text-xs transition ${selectedType === badge.code ? 'border-cyan/60 bg-cyan/20 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`} style={selectedType === badge.code ? { borderColor: badge.color, backgroundColor: `${badge.color}33` } : undefined}>{badge.label}</button>
        ))}
      </div>
      <button type="button" disabled={!noBadge && !selectedType} onClick={() => onSubmit(!noBadge, noBadge ? null : selectedType)} className="w-full rounded-2xl border border-cyan/30 bg-cyan/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan/25 disabled:cursor-not-allowed disabled:opacity-40">提交修正</button>
    </div>
  );
}

function ViewFilterButtons({ value, onChange, counts }: { value: ViewFilter; onChange: (value: ViewFilter) => void; counts: Record<ViewFilter, number>; }) {
  return <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">{(['pending', 'reviewed', 'all'] as ViewFilter[]).map((option) => <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-full px-4 py-1.5 text-xs transition ${value === option ? 'bg-white/15 font-medium text-white' : 'text-slate-400 hover:text-white'}`}>{option === 'pending' ? '待复核' : option === 'reviewed' ? '已处理' : '全部'} ({counts[option]})</button>)}</div>;
}

function InfoBlock({ title, value, detail }: { title: string; value: ReactNode; detail: string }) {
  return <div className="rounded-[20px] border border-white/10 bg-slate-950/40 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p><div className="mt-2 text-sm font-semibold text-white">{value}</div><p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p></div>;
}


function StatusPill({ label, tone }: { label: string; tone: 'warning' | 'success' | 'cyan' }) {
  const toneMap = { warning: 'border-amber-400/20 bg-amber-400/10 text-amber-100', success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100', cyan: 'border-cyan/20 bg-cyan/10 text-cyan-100' } as const;
  return <div className={`rounded-full border px-4 py-2 text-sm ${toneMap[tone]}`}>{label}</div>;
}

function SummaryCard({ icon: Icon, label, value, tone }: { icon: typeof AlertTriangle; label: string; value: string; tone: 'warning' | 'success' | 'primary'; }) {
  const tones = { warning: 'from-amber-400/30 to-orange-400/20 text-amber-100', success: 'from-emerald-400/30 to-teal-400/20 text-emerald-100', primary: 'from-cyan/30 to-brand/20 text-cyan-100' } as const;
  return <div className="glass-panel rounded-[24px] p-4"><div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${tones[tone]}`}><Icon className="h-5 w-5" /></div><p className="mt-3 text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>;
}

function Spinner() {
  return <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>;
}
