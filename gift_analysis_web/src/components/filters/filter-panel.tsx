import { RotateCcw, Search } from 'lucide-react';
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
  'h-11 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-sm text-white outline-none transition focus:border-cyan/60 focus:ring-2 focus:ring-cyan/20';

export function FilterPanel({ filters, badgeTypes, gameplayValues, priceTiers, onChange, onReset }: FilterPanelProps) {
  return (
    <section className="glass-panel sticky top-[126px] z-40 rounded-[28px] p-4 lg:p-6">
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">筛选与排序控制台</h2>
          <p className="text-sm text-slate-300">按分类、货币、角标玩法和价格层级实时联动图表与礼物卡片。</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-brand/60 hover:bg-brand/15"
        >
          <RotateCcw className="h-4 w-4" />
          重置条件
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-400">搜索礼物</label>
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
            <input className={`${inputClassName} pl-11`} value={filters.query} onChange={(event) => onChange('query', event.target.value)} />
          </div>
        </div>
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
      <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-400">{label}</label>
      <select className={inputClassName} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </div>
  );
}
