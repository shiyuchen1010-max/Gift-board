import { BarChart3, ClipboardCheck, GalleryVerticalEnd, Sparkles, Target } from 'lucide-react';

import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  total: number;
  badgeCount: number;
}

const navItems = [
  { href: '#overview', label: '概览', icon: Sparkles },
  { href: '#manual-review', label: '人工复核', icon: ClipboardCheck },
  { href: '#charts', label: '图表', icon: BarChart3 },
  { href: '#gallery', label: '礼物库', icon: GalleryVerticalEnd },
  { href: '#badge-lab', label: '角标专题', icon: Target },
];


export function AppShell({ children, total, badgeCount }: AppShellProps) {
  return (
    <div className="min-h-screen bg-hero-gradient text-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/65 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cyan shadow-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium uppercase tracking-[0.28em] text-cyan/90">Gift Analytics</span>
              <h1 className="text-xl font-bold text-white lg:text-2xl">礼物图库与角标玩法分析看板</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 lg:flex">
            <span>总礼物 {total}</span>
            <span className="text-slate-500">/</span>
            <span>可见角标 {badgeCount}</span>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-4 lg:px-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan/60 hover:bg-cyan/10 hover:text-white"
              >
                <Icon className="h-4 w-4 transition group-hover:scale-110" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-16 pt-36 lg:px-8">{children}</main>
    </div>
  );
}
