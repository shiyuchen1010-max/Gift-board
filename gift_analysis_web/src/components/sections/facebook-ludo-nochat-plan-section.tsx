import { Coins, Gamepad2, Rocket, ShieldAlert, Trophy } from 'lucide-react';

import type { FacebookLudoNoChatPlan } from '../../types/analysis';
import { formatPercent, formatPrice } from '../../lib/format';
import { BadgeLabel } from '../badges/badge-label';


interface FacebookLudoNoChatPlanSectionProps {
  plan: FacebookLudoNoChatPlan;
}

const moduleIcons = [Gamepad2, Trophy, Coins] as const;
const riskTone = {
  高: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
  中: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
  低: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
};

export function FacebookLudoNoChatPlanSection({ plan }: FacebookLudoNoChatPlanSectionProps) {
  return (
    <section id="ludo-plan" className="flex scroll-mt-44 flex-col gap-5">

      <div>
        <h2 className="section-title">Facebook Ludo 无聊天室接入规划</h2>
        <p className="section-copy">规划重点不是把聊天室礼物原样搬过来，而是把送礼动作重做成适配棋局节奏、结算荣誉和大厅曝光的新社交货币。</p>
      </div>

      <div className="glass-panel relative overflow-hidden rounded-[36px] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,199,240,0.16),transparent_30%)]" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-100">迁移参考 · 全量视角</span>
            <h3 className="mt-4 text-3xl font-bold leading-tight text-white lg:text-4xl">推荐方案：先做“结算页 + 高光节点 + 大厅播报”三位一体的轻量送礼系统，再逐步接入榜单、盲盒和成长链。</h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">{plan.positioning}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ContextCard label="礼物资产基数" value={`${plan.analysisContext.giftCount}`} detail="说明现有玩法素材足够支撑迁移设计。" />
              <ContextCard label="角标玩法覆盖" value={formatPercent(plan.analysisContext.badgeCoverage)} detail="已有玩法包装能力，可以直接复用到 Ludo 新场景。" />
              <ContextCard label="高价锚点" value={formatPrice(plan.analysisContext.highestPrice)} detail={`当前最强信号是 ${plan.analysisContext.dominantGameplay}。`} />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">接入原则</p>
            <div className="mt-4 space-y-3">
              {plan.designPrinciples.map((principle) => (
                <div key={principle} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-200">{principle}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <article className="glass-panel rounded-[30px] p-5">
        <h3 className="text-lg font-semibold text-white">关键触发场景</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">聊天室缺位后，送礼入口必须贴着情绪峰值走，才能既不打扰对局，又能吃到即时转化。</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {plan.triggerScenes.map((scene) => (
            <article key={scene.name} className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{scene.goal}</p>
              <h4 className="mt-3 text-lg font-semibold text-white">{scene.name}</h4>
              <p className="mt-2 text-sm text-slate-400">{scene.placement}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300">{scene.detail}</p>
            </article>
          ))}
        </div>
      </article>

      <article className="glass-panel rounded-[30px] p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">玩法迁移矩阵</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">推荐优先迁移 `P0 / P1` 玩法，先做高适配、高反馈、高传播的组合。</p>
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">按推荐优先级分层</p>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {plan.gameplayMappings.map((mapping) => (
            <article key={mapping.badgeCode} className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">{mapping.badgeLabel}</span>
                  <h4 className="mt-3 text-lg font-semibold text-white">{mapping.priority} · 适配度 {mapping.fit}</h4>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">当前玩法</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">{mapping.currentMechanic}</p>
                </div>
              </div>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-gradient-to-r from-brand/10 to-cyan/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">Ludo 落地方式</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">{mapping.ludoAdaptation}</p>
              </div>
            </article>
          ))}
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="glass-panel rounded-[30px] p-5">
          <h3 className="text-lg font-semibold text-white">功能模块建议</h3>
          <div className="mt-5 grid gap-4">
            {plan.featureModules.map((module, index) => {
              const Icon = moduleIcons[index] ?? Gamepad2;
              return (
                <article key={module.name} className="rounded-[26px] border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cyan">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{module.name}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{module.summary}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {module.items.map((item) => (
                      <span key={`${module.name}-${item}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">{item}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <article className="glass-panel rounded-[30px] p-5">
          <h3 className="text-lg font-semibold text-white">付费闭环</h3>
          <div className="mt-5 space-y-4">
            {plan.economyLoop.map((item) => (
              <div key={item.stage} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm font-semibold text-white">{item.stage}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[24px] border border-cyan/20 bg-cyan/10 p-4 text-sm leading-6 text-cyan-50">
            推荐优先用低价礼物打开首单，再用结算页的胜者荣耀卡和大厅曝光承接中高价消费，最后用榜单与成长链把用户拉回长期目标。
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="glass-panel rounded-[30px] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">风险控制</h3>
              <p className="text-sm text-slate-400">优先看会影响留存与合规的硬约束。</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {plan.riskControls.map((risk) => (
              <article key={risk.title} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{risk.title}</p>
                  <span className={`rounded-full border px-3 py-1 text-xs ${riskTone[risk.level as keyof typeof riskTone] ?? 'border-white/10 bg-white/5 text-slate-200'}`}>{risk.level}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{risk.detail}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="glass-panel rounded-[30px] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">分阶段上线路线</h3>
              <p className="text-sm text-slate-400">按“先验证转化，再扩消费深度”的节奏推进。</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            {plan.rolloutPhases.map((phase) => (
              <article key={phase.phase} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-base font-semibold text-white">{phase.phase}</p>
                  <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan-100">{phase.goal}</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <TagGroup title="能力范围" items={phase.capabilities} />
                  <TagGroup title="核心指标" items={phase.metrics} />
                </div>
              </article>
            ))}
          </div>
        </article>
      </div>

      <article className="glass-panel rounded-[30px] p-5">
        <h3 className="text-lg font-semibold text-white">暂存问题</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">这些是当前仍依赖产品、研发或发行侧确认的信息，我已经先保留到规划里，不阻塞主方案执行。</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {plan.openQuestions.map((question) => (
            <div key={question} className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.04] p-4 text-sm leading-6 text-slate-200">{question}</div>
          ))}
        </div>
      </article>
    </section>
  );
}

function ContextCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
    </div>
  );
}

function TagGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={`${title}-${item}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100">{item}</span>
        ))}
      </div>
    </div>
  );
}
