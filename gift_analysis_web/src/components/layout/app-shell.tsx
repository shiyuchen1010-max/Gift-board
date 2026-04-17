import {
  BarChart3,
  ClipboardCheck,
  FileText,
  GalleryVerticalEnd,
  Gamepad2,
  Lightbulb,
  LayoutDashboard,
  SlidersHorizontal,
  Sparkles,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { DashboardView, DashboardViewTab, SectionId, SectionNavItem } from '../../types/gift';

interface AppShellProps {
  children: ReactNode;
  total: number;
  badgeCount: number;
  activeView: DashboardView;
  activeSectionId: SectionId;
  viewTabs: DashboardViewTab[];
  navItems: SectionNavItem[];
  onViewChange: (view: DashboardView) => void;
  onNavigate: (sectionId: SectionId) => void;
}

const iconMap: Record<SectionId, LucideIcon> = {
  overview: Sparkles,
  filters: SlidersHorizontal,
  insights: Lightbulb,
  charts: BarChart3,
  'badge-analysis': Target,
  'gift-explorer': GalleryVerticalEnd,
  'manual-review': ClipboardCheck,
  'system-analysis': FileText,
  'ludo-plan': Gamepad2,
};

const viewIconMap: Record<DashboardView, LucideIcon> = {
  dashboard: LayoutDashboard,
  analysis: Lightbulb,
};

export function AppShell({ children, total, badgeCount, activeView, activeSectionId, viewTabs, navItems, onViewChange, onNavigate }: AppShellProps) {
  const activeViewLabel = viewTabs.find((item) => item.id === activeView)?.label ?? '数据看板';
  const activeSectionLabel = navItems.find((item) => item.id === activeSectionId)?.label ?? navItems[0]?.label ?? '概览';

  return (
    <div className="min-h-screen bg-hero-gradient text-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cyan shadow-glow">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium uppercase tracking-[0.28em] text-cyan/90">Gift Analysis Workspace</span>
                <h1 className="text-xl font-bold text-white lg:text-2xl">礼物系统分析工作台</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <StatusPill label="总礼物" value={String(total)} />
              <StatusPill label="可见角标" value={String(badgeCount)} accent="cyan" />
              <StatusPill label="当前界面" value={activeViewLabel} accent="violet" />
              <StatusPill label="当前分区" value={activeSectionLabel} accent="violet" />
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-white/10 bg-white/5 p-1.5">
              {viewTabs.map((tab) => {
                const Icon = viewIconMap[tab.id];
                const isActive = tab.id === activeView;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onViewChange(tab.id)}
                    aria-pressed={isActive}
                    className={`inline-flex min-w-[180px] cursor-pointer items-center gap-3 rounded-[18px] px-4 py-3 text-left transition ${
                      isActive
                        ? 'bg-gradient-to-r from-brand/30 to-cyan/20 text-white shadow-[0_10px_30px_rgba(34,211,238,0.12)]'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-white/12 text-cyan-100' : 'bg-slate-900/70 text-slate-300'}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tab.label}</p>
                      <p className={`mt-0.5 text-xs ${isActive ? 'text-cyan-50/80' : 'text-slate-400'}`}>{tab.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <nav className="flex items-center gap-2 overflow-x-auto pb-1 xl:max-w-[55%] xl:justify-end">
              {navItems.map((item) => {
                const Icon = iconMap[item.id];
                const isActive = item.id === activeSectionId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? 'border-cyan/50 bg-cyan/15 text-white shadow-[0_0_0_1px_rgba(34,199,240,0.15)]'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:-translate-y-0.5 hover:border-cyan/60 hover:bg-cyan/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition ${isActive ? 'scale-110 text-cyan-200' : 'group-hover:scale-110'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-16 pt-44 lg:px-8">{children}</main>
    </div>
  );
}

function StatusPill({ label, value, accent = 'slate' }: { label: string; value: string; accent?: 'slate' | 'cyan' | 'violet' | 'emerald' }) {
  const toneMap = {
    slate: 'border-white/10 bg-white/5 text-slate-200',
    cyan: 'border-cyan/20 bg-cyan/10 text-cyan-100',
    violet: 'border-brand/20 bg-brand/10 text-violet-100',
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
  } as const;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${toneMap[accent]}`}>
      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
