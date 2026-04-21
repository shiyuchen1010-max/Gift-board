import { BookOpen, AlertCircle, TrendingUp, Presentation, CheckCircle2, Crown, Flame, Target, Users, Zap } from 'lucide-react';

export function GiftResearchReportSection() {
  return (
    <section id="research-report" className="flex scroll-mt-44 flex-col gap-5">
      <div>
        <h2 className="section-title">Yalla Ludo 礼物系统商业化深度拆解</h2>
        <p className="section-copy">基于大R生态与社交可见度的变现引擎，解构其如何从“售卖像素”向“售卖社交地位”进化。</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 1. 核心结论 */}
        <article className="glass-panel rounded-[30px] p-6 lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-cyan/10" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-cyan">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">1. 商业化核心洞察（Executive Summary）</h3>
            </div>
            <p className="text-base leading-7 text-slate-200 pl-1">
              Yalla Ludo 的礼物系统表面是一个丰富的道具商城，本质上则是一个高度成熟的<strong>“社交地位交易市场”与“代币回收黑洞”</strong>。系统不售卖单纯的“像素与动效”，而是精准售卖四大核心价值：<strong>社交可见度（全服见证）</strong>、<strong>周期性社交权力（话语权与引流）</strong>、<strong>群体身份认同（阶级隔离）</strong>以及<strong>情感与概率杠杆（盲盒成瘾）</strong>。
            </p>
          </div>
        </article>

        {/* 2. 大R心理与社交飞轮 */}
        <article className="glass-panel rounded-[30px] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">2. 大R心理与社交循环飞轮</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">韦伯伦商品效应（Veblen Goods）：</strong>
                <span className="text-slate-300">199,999 钻的顶级礼物核心卖点就是“极其昂贵”。其赋予的不可替代的社交地位溢价，是对大R“全服只有我刷得起”的特权宣示。</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">社交可见度驱动（Social Visibility）：</strong>
                <span className="text-slate-300">通过全服广播（霸屏）与主页展示（固化面子），强制全服注意力集中，提供极致虚荣心满足。</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">正向社交循环：</strong>
                <span className="text-slate-300">“大R重金触发特效 → 收礼人提供高强情绪反馈 → 围观者被震撼产生仰视并跟风打赏”，形成繁荣生态。</span>
              </div>
            </li>
          </ul>
        </article>

        {/* 3. 多周期榜单逼氪 */}
        <article className="glass-panel rounded-[30px] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">3. 多维竞价与榜单逼氪机制</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">三线并行短期战壕：</strong>
                <span className="text-slate-300">Room Gifts（激发公会内卷）、Gifts Sent（大R竞价拍卖争夺 Top Man）、Gifts Received（刺激高魅力用户催氪）。</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">长线荣誉池（Hall of Fame）：</strong>
                <span className="text-slate-300">通过半年/全年结算和历史荣耀，将冲榜转化为跨越周期的“长线资产”，对抗大R付费疲劳。</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Tie-breaker 榨取：</strong>
                <span className="text-slate-300">同分榜单优先比较 Royal Level 甚至 ID 大小。严苛的规则逼迫大R必须维持高昂的日常 VIP 订阅，实现多维钱包剥削。</span>
              </div>
            </li>
          </ul>
        </article>

        {/* 4. 商业杠杆总结 */}
        <article className="glass-panel rounded-[30px] p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">4. 经济沉淀池与系统杠杆总结</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              <h4 className="text-cyan-300 font-bold mb-2 flex items-center gap-2"><Flame className="w-4 h-4"/> 通缩黑洞效应</h4>
              <p className="text-sm leading-6 text-slate-300">充值一旦转化为礼物立刻被系统 100% 回收，产出的仅为无法交易的视觉特效与荣誉，保证经济绝不通胀。</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              <h4 className="text-emerald-300 font-bold mb-2 flex items-center gap-2"><Target className="w-4 h-4"/> 沉没成本绑架</h4>
              <p className="text-sm leading-6 text-slate-300">“累计礼物”和“升级礼物”玩法要求达标解锁，死死捏住玩家沉没成本，拉长单品生命周期（LTV），逼迫临门一脚的冲动充值。</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              <h4 className="text-amber-300 font-bold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> 盲盒概率杠杆</h4>
              <p className="text-sm leading-6 text-slate-300">盲盒（Gacha）引入斯金纳箱刺激，提供以小博大希望，降低下沉用户门槛，同时成为极致的房间氛围“核弹”。</p>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 p-5 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300">
                <Presentation className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">核心结论</p>
                <p className="text-base font-semibold leading-7 text-white">
                  这套礼物系统真正售卖的并不是特效本身，而是被包装成礼物的
                  <strong className="text-amber-300">社交地位、竞争压力与情绪成瘾</strong>：它用
                  <strong className="text-amber-300">榜单</strong>制造竞争焦虑，用
                  <strong className="text-amber-300">盲盒</strong>制造概率焦虑，用
                  <strong className="text-amber-300">结算</strong>制造时效焦虑，最终把消费冲动沉淀为长期身份资产。
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

