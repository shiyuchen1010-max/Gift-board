## 礼物分析网页

这是一个基于静态礼物图片的数据分析看板，数据源来自 `extracted_gifts` 下的四个目录。

### 当前已接入的数据能力

- 四个礼物分类：`classic`、`activity`、`member`、`royal`
- 价格、货币、价格分层、礼物图片
- 基于右上角大区域识别的 badge 结果
- 角标类型定义与礼物绑定结果
- 礼物列表、筛选、图表、角标专题和自动分析结论

### 目录说明

- `public/data/gifts.json`：网页主数据源
- `public/data/badge_definitions.json`：角标定义
- `public/data/badge_recognition_report.json`：识别报告与复核统计
- `public/data/manual_badge_reviews.json`：前端读取的人工复核队列
- `public/gifts/`：网页直接读取的礼物静态图片
- `../gift_analysis_config/manual_badge_reviews.json`：你需要手工编辑的人工复核文件


### 如何重跑数据构建

在项目根目录执行：

```bash
python scripts/build_gift_dataset.py
```

这会完成以下工作：

1. 读取 `extracted_gifts` 下四个目录的礼物图片
2. 解析 `角标映射示例.txt` 中的 badge 样本
3. 用右上角区域模板匹配识别角标
4. 读取并应用 `gift_analysis_config/manual_badge_reviews.json` 里的人工确认结果
5. 生成 `gift_analysis_config` 下的配置文件
6. 更新 `public/data` 和 `public/gifts`


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
2. 打开 `gift_analysis_config/manual_badge_reviews.json`
3. 把已确认项改成 `confirmed`
4. 把识别错误项改成 `corrected`，并补 `reviewHasBadge` / `reviewBadgeType`
5. 重跑 `python scripts/build_gift_dataset.py`
6. 刷新网页，最终结果会同步更新

### 如何补充玩法说明


当前 `gift_analysis_config/badge_definitions.json` 已经生成，每个 badge 类型默认带有占位玩法文案。
你后续可以补这些字段：

- `label`
- `gameplay`
- `description`
- `color`

补完后重新启动前端即可在页面里看到新的玩法说明。

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
