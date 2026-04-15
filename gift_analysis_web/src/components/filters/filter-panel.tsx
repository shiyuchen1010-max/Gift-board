import { ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { folderLabels } from '../../lib/format';
import type { ActiveFilterChip, BadgeDefinition, FilterState, SectionId } from '../../types/gift';

interface FilterPanelProps {
  filters: FilterState;
  badgeTypes: BadgeDefinition[];
  gameplayValues: string[];
  priceTiers: string[];
  activeFilters: ActiveFilterChip[];
  filteredCount: number;
  totalCount: number;
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onClearFilter: (key: keyof FilterState) => void;
  onReset: () => void;
  onJumpTo: (sectionId: SectionId) => void;
}

const inputClassName =
  'h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none transition focus:border-cyan/60 focus:ring-2 focus:ring-cyan/20';

export function FilterPanel({
  filters,
  badgeTypes,
  gameplayValues,
  priceTiers,
  activeFilters,
  filteredCount,
  totalCount,
  onChange,
  onClearFilter,
  onReset,
  onJumpTo,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAdvancedFilters = activeFilters.some((filter) => filter.key !== 'query');
  const selectedGameplayValue = useMemo(() => {
    if (filters.gameplayType !== 'all') {
      return filters.gameplayType;
    }
    if (filters.badgeType !== 'all') {
      return badgeTypes.find((badge) => badge.code === filters.badgeType)?.gameplay ?? 'all';
    }
    return 'all';
  }, [badgeTypes, filters.badgeType, filters.gameplayType]);

  const handleGameplayChange = (value: string) => {
    if (value === 'all') {
      if (filters.badgeType !== 'all') {
        onChange('badgeType', 'all');
      }
      if (filters.gameplayType !== 'all') {
        onChange('gameplayType', 'all');
      }
      return;
    }

    onChange('gameplayType', value);
  };

  const summaryText = useMemo(() => {

    if (!activeFilters.length) {
      return '当前展示全量礼物。你可以先搜索名称，再按需展开筛选、看图表或进入礼物库继续下钻。';
    }
    return `当前保留 ${filteredCount} / ${totalCount} 个礼物，已应用 ${activeFilters.length} 个条件。`;
  }, [activeFilters.length, filteredCount, totalCount]);

  return (
    <section id="filters" className="glass-panel sticky top-[136px] z-40 flex scroll-mt-44 flex-col gap-3 rounded-[24px] p-3 shadow-lg backdrop-blur-xl lg:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-semibold text-white">筛选与浏览路径</h2>
            <p className="text-xs text-slate-400">默认只保留最常用入口，更多操作可按需展开。</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <CompactStat label="当前结果" value={String(filteredCount)} accent="cyan" />
          <CompactStat label="已选条件" value={String(activeFilters.length)} accent={activeFilters.length ? 'violet' : 'slate'} />
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls="filter-panel-details"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {hasAdvancedFilters ? <span className="flex h-2 w-2 rounded-full bg-cyan-400" /> : null}
            {isExpanded ? '收起筛选' : '展开筛选'}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="搜索礼物"
            className={`${inputClassName} pl-9`}
            placeholder="搜索礼物名称、价格标签或分类..."
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
          />
        </div>
      </div>

      {isExpanded ? (
        <div id="filter-panel-details" className="grid gap-3 border-t border-white/10 pt-4">
          <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
              <div className="flex items-center gap-2 text-cyan-100">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.2em]">筛选摘要</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">{summaryText}</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">操作入口</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <QuickJumpButton label="先看结论" onClick={() => onJumpTo('insights')} />
                <QuickJumpButton label="看图表分布" onClick={() => onJumpTo('charts')} />
                <QuickJumpButton label="浏览礼物库" onClick={() => onJumpTo('gift-explorer')} />
                <QuickJumpButton label="进入复核" onClick={() => onJumpTo('manual-review')} />
              </div>
              <button
                type="button"
                onClick={onReset}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-brand/60 hover:bg-brand/15"
              >
                <RotateCcw className="h-4 w-4" />
                重置全部
              </button>
            </div>
          </div>

          {activeFilters.length ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={`${filter.key}-${filter.value}`}
                  type="button"
                  onClick={() => onClearFilter(filter.key)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1.5 text-xs text-cyan-50 transition hover:border-cyan/40 hover:bg-cyan/20"
                >
                  <span className="text-cyan-200">{filter.label}</span>
                  <span>{filter.value}</span>
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">

            <SelectField label="礼物分类" value={filters.folder} onChange={(value) => onChange('folder', value as FilterState['folder'])}>
              <option value="all">全部分类</option>
              {Object.entries(folderLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <SelectField label="货币类型" value={filters.currency} onChange={(value) => onChange('currency', value as FilterState['currency'])}>
              <option value="all">全部货币</option>
              <option value="Diamond">钻石</option>
              <option value="Gold">金币</option>
            </SelectField>
            <SelectField label="角标状态" value={filters.badgeMode} onChange={(value) => onChange('badgeMode', value as FilterState['badgeMode'])}>
              <option value="all">全部礼物</option>
              <option value="with">仅看有角标</option>
              <option value="without">仅看无角标</option>
            </SelectField>
            <SelectField label="排序方式" value={filters.sortKey} onChange={(value) => onChange('sortKey', value as FilterState['sortKey'])}>
              <option value="price-desc">价格从高到低</option>
              <option value="price-asc">价格从低到高</option>
              <option value="name-asc">名称 A-Z</option>
              <option value="badge-confidence">角标识别把握</option>
            </SelectField>
            <SelectField label="玩法标签" value={selectedGameplayValue} onChange={handleGameplayChange}>
              <option value="all">全部玩法</option>
              {gameplayValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </SelectField>

            <SelectField label="价格分层" value={filters.priceTier} onChange={(value) => onChange('priceTier', value)}>
              <option value="all">全部层级</option>
              {priceTiers.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CompactStat({ label, value, accent }: { label: string; value: string; accent: 'cyan' | 'violet' | 'slate' }) {
  const accentClassName =
    accent === 'cyan'
      ? 'border-cyan/20 bg-cyan/10 text-cyan-50'
      : accent === 'violet'
        ? 'border-violet-400/20 bg-violet-500/10 text-violet-50'
        : 'border-white/10 bg-white/5 text-slate-100';

  return (
    <div className={`min-w-[92px] rounded-2xl border px-3 py-2 ${accentClassName}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-300/80">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function QuickJumpButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
    >
      {label}
    </button>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-slate-400">{label}</label>
      <select className={`${inputClassName} text-xs`} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </div>
  );
}
