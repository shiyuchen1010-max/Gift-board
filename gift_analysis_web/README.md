## 礼物分析网页

这是一个基于静态礼物图片的数据分析看板，数据源来自 `extracted_gifts` 下的四个目录，并且已经把 `角标规则说明.txt`、送礼系统分析结论和 Facebook Ludo 无聊天室接入规划一起接入到网页展示链路。

### 当前已接入的数据能力

- 四个礼物分类：`classic`、`activity`、`member`、`royal`
- 价格、货币、价格分层、礼物图片
- 基于右上角大区域识别的 badge 结果
- 角标类型定义与礼物绑定结果
- 从 `角标规则说明.txt` 同步来的玩法说明
- 当前送礼系统调研分析结果
- Facebook Ludo 无聊天室接入规划
- 礼物列表、筛选、图表、角标专题和自动分析结论

### 目录说明

- `public/data/gifts.json`：网页主数据源
- `public/data/badge_definitions.json`：角标定义与玩法说明
- `public/data/gift_system_analysis.json`：当前送礼系统的结构化分析结果
- `public/data/facebook_ludo_nochat_plan.json`：Facebook Ludo 无聊天室接入规划
- `public/data/badge_recognition_report.json`：识别报告与复核统计
- `public/data/manual_badge_reviews.json`：前端读取的人工复核队列
- `public/gifts/`：网页直接读取的礼物静态图片
- `../gift_analysis_config/manual_badge_reviews.json`：你需要手工编辑的人工复核文件
- `../gift_analysis_config/gift_system_analysis.json`：分析结果配置侧源文件
- `../gift_analysis_config/facebook_ludo_nochat_plan.json`：Ludo 规划配置侧源文件

### 如何重跑数据构建

在项目根目录执行：

```bash
python scripts/build_gift_dataset.py
```

这会完成以下工作：

1. 读取 `extracted_gifts` 下四个目录的礼物图片
2. 解析 `角标映射示例.txt` 中的 badge 样本
3. 解析 `角标规则说明.txt` 并补全玩法说明
4. 用右上角区域模板匹配识别角标
5. 读取并应用 `gift_analysis_config/manual_badge_reviews.json` 里的人工确认结果
6. 生成 `gift_analysis_config` 下的配置文件与分析规划 JSON
7. 更新 `public/data` 和 `public/gifts`

### 如何做人工复核

当前脚本已经把所有 `badgeConfidence < 1.0` 的礼物汇总到了 `gift_analysis_config/manual_badge_reviews.json`。

常用字段如下：

- `reviewStatus`
  - `pending`：待人工核对
  - `confirmed`：机器结果正确，人工确认通过
  - `corrected`：机器结果错误，人工已修正
- `reviewHasBadge`
  - 仅在 `corrected` 时需要填写
  - `true` 表示这张礼物图确实有角标
  - `false` 表示这张礼物图其实没有角标
- `reviewBadgeType`
  - 仅在 `corrected` 且 `reviewHasBadge = true` 时填写
  - 值需要使用 badge code，例如 `weekly-gifts`、`profile-display`
- `notes`
  - 可选，用于记录你人工判断时的备注

推荐操作方式：

1. 在网页的“人工复核”区按图核对礼物
2. 打开 `gift_analysis_config/manual_badge_reviews.json`（这是人工复核的唯一源文件）
3. 把已确认项改成 `confirmed`
4. 把识别错误项改成 `corrected`，并补 `reviewHasBadge` / `reviewBadgeType`
5. 在项目根目录重跑 `python scripts/build_gift_dataset.py`
6. 进入 `gift_analysis_web` 执行构建，把最新前端页面输出到 `docs`
7. 提交 `gift_analysis_config`、`gift_analysis_web/src`、`gift_analysis_web/public/data`、`docs` 到仓库
8. 推送到 GitHub 后，Pages 会自动展示最新结果

### 如何同步到 `docs`

每次改完数据或前端后，按下面顺序即可：

```bash
python scripts/build_gift_dataset.py
cd gift_analysis_web
npm run build -- --outDir ../docs
```

构建完成后，`docs/` 下至少会同步这些关键文件：

- `docs/index.html`
- `docs/assets/index-*.js`
- `docs/assets/index-*.css`
- `docs/data/gifts.json`
- `docs/data/badge_definitions.json`
- `docs/data/gift_system_analysis.json`
- `docs/data/facebook_ludo_nochat_plan.json`
- `docs/data/manual_badge_reviews.json`
- `docs/data/badge_recognition_report.json`

### 如何补充玩法说明

玩法说明现在默认来自 `extracted_gifts/角标规则说明.txt`，不再依赖手工补占位文案。

如果你后续要改玩法描述，推荐修改源文件：

- `extracted_gifts/角标规则说明.txt`

改完后重新执行：

```bash
python scripts/build_gift_dataset.py
```

### 如何启动网页

```bash
npm install
npm run dev
```

如果需要本地预览生产包：

```bash
npm run build
npm run preview
```

### 当前识别策略说明

- 不再把文件名里的 `_badge` 当成唯一判断依据
- 重点识别礼物图右上角的大候选区域
- 允许角标有轻微偏移
- 对识别不稳定的礼物，会记录到 `badge_recognition_report.json` 的 `lowConfidence` 列表里，便于后续人工复核
