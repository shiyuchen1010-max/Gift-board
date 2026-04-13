import { ChevronDown, ChevronUp, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { BadgeDefinition, FilterState } from '../../types/gift';

import { folderLabels } from '../../lib/format';


interface FilterPanelProps {
  filters: FilterState;
  badgeTypes: BadgeDefinition[];
  gameplayValues: string[];
  priceTiers: string[];
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
}

const inputClassName =
  'h-9 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none transition focus:border-cyan/60 focus:ring-2 focus:ring-cyan/20';

export function FilterPanel({ filters, badgeTypes, gameplayValues, priceTiers, onChange, onReset }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if any advanced filter is active to show an indicator
  const hasActiveFilters =
    filters.folder !== 'all' ||
    filters.currency !== 'all' ||
    filters.badgeMode !== 'all' ||
    filters.sortKey !== 'price-desc' ||
    filters.badgeType !== 'all' ||
    filters.gameplayType !== 'all' ||
    filters.priceTier !== 'all';

  return (
    <section className="glass-panel sticky top-[126px] z-40 rounded-2xl p-3 lg:p-4 shadow-lg backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
            <h2 className="hidden text-base font-semibold text-white lg:block whitespace-nowrap">筛选与排序</h2>
          </div>
          
          <div className="relative flex flex-1 max-w-md items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            <input 
              className={`${inputClassName} pl-9`} 
              placeholder="搜索礼物名称..."
              value={filters.query} 
              onChange={(event) => onChange('query', event.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {hasActiveFilters && <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>}
            高级筛选
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          <button
            type="button"
            onClick={onReset}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:border-brand/60 hover:bg-brand/15"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">重置</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7 border-t border-white/10 pt-4">
          <SelectField label="礼物分类" value={filters.folder} onChange={(value) => onChange('folder', value as FilterState['folder'])}>
            <option value="all">全部分类</option>
            {Object.entries(folderLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
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
            <option value="badge-confidence">角标置信度</option>
          </SelectField>
          <SelectField label="角标类型" value={filters.badgeType} onChange={(value) => onChange('badgeType', value)}>
            <option value="all">全部角标</option>
            {badgeTypes.map((badge) => (
              <option key={badge.code} value={badge.code}>{badge.label}</option>
            ))}
          </SelectField>
          <SelectField label="玩法标签" value={filters.gameplayType} onChange={(value) => onChange('gameplayType', value)}>
            <option value="all">全部玩法</option>
            {gameplayValues.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectField>
          <SelectField label="价格分层" value={filters.priceTier} onChange={(value) => onChange('priceTier', value)}>
            <option value="all">全部层级</option>
            {priceTiers.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectField>
        </div>
      )}
    </section>
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
