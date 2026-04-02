# Sugar Blog Theme Migration Design (2026-04-02)

## Goal

将当前站点从“自定义 VitePress 主题 + reco 风格近似复刻”的路线，切换为“`@sugarat/theme` 作为基线主题 + 本地薄封装”的路线，并在此基础上保留独立的 `/tags/`、`/timeline/`、`/categories/` 页面能力。

本次设计重点确认：

- 主题基线
- 页面信息架构
- 数据来源
- 兼容策略
- 风险与文档调整范围

不在本次设计内直接落实现代码。

## Current State

仓库当前已经具备以下基础：

- `docs/.vitepress/` 已存在并可构建
- `docs/views/**/*.md` 已整理出 `date/categories/tags/publish` 等关键 frontmatter
- 本地自定义主题已经提供首页、归档页、评论、阅读量、友情链接等能力
- `feed.xml` / `sitemap.xml` 构建链路已存在
- 部署链路已经有单独的设计与实施文档

同时，现状也暴露出两个问题：

1. 当前主题层仍然带有明显的 reco 复刻路径，后续样式维护成本高。
2. 已审阅的 `sugar-blog` 主题源码说明：标签相关能力已有较好基础，但独立时间线页面仍需本地补充，不能直接零改动落地。

## Confirmed Decisions

- 主题基线改为 `@sugarat/theme`
- 独立完整页面保留：`/tags/`、`/timeline/`
- 时间线按“年”一层分组，不再做年/月两层
- `docs/views/**/*.md` 继续作为内容源，不迁移目录
- 现有 `Valine + LeanCloud visitor` 在第一阶段继续保留
- 不把 `/home/kk/workspace/open_source/sugar-blog` 这个绝对路径直接提交到仓库配置中

## Options Reviewed

### Option A: 继续沿用当前自定义 reco 风格主题

优点：

- 当前页面已经有一批可复用实现
- 不需要切主题基线

缺点：

- 后续每个页面都要自己维护样式与组件
- 已有文档与实现方向继续围绕 reco，偏离用户新决策
- 当前“复刻”方向对长期维护没有帮助

结论：不采用。

### Option B: 使用 `@sugarat/theme` 作为基线，本地做薄封装与独立归档页

优点：

- 可以直接继承成熟的首页、文章页、标签卡片、文章元信息体系
- 本地只保留站点特有能力：评论、阅读量、归档页、旧链接兼容
- 升级路径清晰，后续能跟随上游版本演进

缺点：

- 需要重新整理本地主题入口和首页入口
- 独立 `/timeline/`、`/tags/` 页面仍需本地实现

结论：推荐方案。

### Option C: 直接把 `sugar-blog` 源码整体拷进当前仓库，作为内部 fork

优点：

- 可完全控制主题源码
- 所有组件都能随时改

缺点：

- 初始接入成本高
- 后续升级要自己做差异合并
- 会把“用现成主题降低成本”的目标重新推回“自维护主题”

结论：只作为备选兜底，不作为默认路线。

## Scope

### In Scope

- 把 VitePress 主题基线切到 `@sugarat/theme`
- 首页切换为主题原生 `layout: home`
- 保留并重建独立 `/tags/`、`/timeline/`、`/categories/` 页面
- 保留本地评论、阅读量、站点页脚等站点特有能力
- 审查并修正文档中仍指向 reco/Lumen 的内容

### Out Of Scope

- 评论系统从 Valine 迁移到 Giscus / Artalk
- 继续做 reco 风格近 1:1 复刻
- 重新设计部署拓扑
- 整体复制 `sugar-blog` monorepo 进当前仓库

## Architecture

### Theme Layer

新增一层本地主题薄封装：

- `docs/.vitepress/blog-theme.ts`
- `docs/.vitepress/config.mts`
- `docs/.vitepress/theme/index.ts`

职责划分：

- `blog-theme.ts`：承载 `getThemeConfig(...)` 的主题配置
- `config.mts`：站点级配置，`extends: blogTheme`
- `theme/index.ts`：在 `@sugarat/theme` 外包一层，注入本地组件与兼容逻辑

这里的关键决策是：

- 依赖必须使用 CI 可解析的来源
- 本地克隆的 `sugar-blog` 只作为评审和参考，不作为提交配置里的绝对路径依赖

默认优先级：

1. 使用 npm 可安装的 `@sugarat/theme` 固定版本
2. 如果上游已发布版本缺少关键 hook，再考虑仓库内最小局部覆盖
3. 最后才考虑 fork

### Content And Data Layer

内容源维持不变：

- `docs/views/**/*.md`

frontmatter 约定继续沿用：

- `date`
- `categories` / `category`
- `tags` / `tag`
- `publish`

数据策略改为“两层”：

1. 首页、文章页、主题内置标签卡片等能力，直接消费 `@sugarat/theme` 的文章元数据能力。
2. 独立归档页继续由本地实现，但不再围绕 reco 组件建模，而是通过一个共享的本地 helper 把主题元数据归一化为归档数据。

建议新增：

- `docs/.vitepress/theme/lib/sugar-archive-data.mjs`

它负责：

- 归一化文章结构
- 生成标签分组
- 生成年份时间线分组
- 复用给 `/categories/`、`/tags/`、`/timeline/`

### Page Layer

#### Home

首页不再继续依赖本地 `BlogHome.vue` 作为主入口，而是切回主题原生首页：

- `docs/index.md`
- `layout: home`
- `blog:` frontmatter 提供站点名、motto、inspiring、pageSize 等配置

这样可以直接复用 `@sugarat/theme` 的首页布局、标签卡片和文章流，不再继续维护 reco 化首页模板。

#### Tags

`/tags/` 继续保留为独立页面，但实现方式改为：

- 顶部摘要区
- 标签聚合卡片 / 标签列表
- 点击标签后展示当前标签下的文章列表
- 支持 `?tag=xxx` 作为筛选态

页面入口仍为：

- `docs/tags/index.md`

页面组件可继续复用：

- `docs/.vitepress/theme/components/ArchivePage.vue`

但其数据来源和样式逻辑需要改为“sugar 基线 + 本地归档适配层”。

#### Timeline

`/timeline/` 保留为独立完整页面。

页面要求：

- 按年份分组
- 每个年份下按日期倒序排列文章
- 提供年份锚点
- 保留标题、日期、摘要、分类/标签补充信息

上游主题里的 `TimelinePage.vue` 当前只是占位，因此该页面仍由本地实现，不能直接依赖上游现成组件。

#### Categories

虽然这轮重点不是分类页，但现有导航中已存在 `/categories/`，因此分类页不能在切主题时消失。它应与 `tags` / `timeline` 共用一套本地归档适配能力。

### Site-Specific Compatibility Layer

当前仓库有三项站点特有能力需要保留：

- 阅读量
- Valine 评论
- 页脚备案信息

处理方式：

- 阅读量：保留本地 `AccessNumber.vue`
- 评论：保留本地 `ValineComments.vue`
- 页脚：优先迁移到 `blogTheme.footer` 配置，而不是继续维护独立 `SiteFooter.vue`

对于文章元信息：

- `@sugarat/theme` 已内置作者、发布时间、标签展示
- 本地 `PostMeta.vue` 不应再重复承担整套元信息职责
- 该组件应缩减为“阅读量补充层”，避免与主题内置元信息重复

## Local Extension Boundary

切到 `@sugarat/theme` 后，本地应只保留以下扩展面：

- 主题薄封装入口
- 阅读量/评论兼容组件
- 归档页数据 helper
- 独立归档页组件
- 必要的旧链接兼容逻辑

应主动退役或弱化的内容：

- `BlogHome.vue` 作为首页主体
- 继续以 reco 为目标的首页/归档 CSS 叠加
- 需要长期自己维护的“仿主题”模板结构

## Risks And Mitigations

### Risk 1: 直接引用本地 `sugar-blog` 绝对路径会破坏 CI

风险：

- GitHub Actions 与其他机器无法解析 `/home/kk/...`

缓解：

- 提交配置只允许使用 npm 可安装版本或仓库内可解析代码

### Risk 2: 主题内置文章元信息与本地 `PostMeta.vue` 重复

风险：

- 发布时间、标签、分类等在文章页重复展示

缓解：

- 本地 `PostMeta.vue` 只保留阅读量等主题未提供的信息

### Risk 3: 独立归档页继续依赖旧的 reco 风格数据建模

风险：

- 主题虽切换，但归档页仍然是旧方案的残留

缓解：

- 归档页保留本地页面，但数据 helper 必须重建为 theme-first 模式

### Risk 4: 上游主题未提供独立时间线页面

风险：

- 若误判为“主题内置”，实施时会中途返工

缓解：

- 明确时间线页属于本地扩展，不纳入“零改动接入”范围

## Documentation Review Result

本轮文档审查结论如下：

- `README.md`：需要更新，不能再写“基于 vuepress-theme-reco-1.x”
- `docs/README.md`：需要更新，不能再写当前基线是 Lumen
- `migration/specs/2026-04-02-reco-v2-home-near-1to1-design.md`：已被新方向取代，应保留但标记为历史方案
- `migration/plans/2026-04-02-reco-v2-home-near-1to1-implementation.md`：已被新方向取代，应保留但标记为历史方案
- `migration/reports/2026-04-01-reco-replica-progress.md`：属于历史阶段报告，应补充“不要继续沿此方向推进”的提示
- `migration/plans/2026-03-31-vitepress-migration-status.md`：状态快照仍有价值，但顶部需说明其 Lumen/reco 基线已过时
- `migration/specs/2026-04-01-vitepress-style-and-polish-design.md`：其中“继续自定义首页/归档视觉层”的方向已过时，应标记为历史设计
- 部署相关文档仍然有效，不需要因为主题切换而废弃

## Acceptance Criteria

方案完成后的验收标准：

- 主题基线明确为 `@sugarat/theme`，不再继续 reco 复刻路线
- 首页使用主题原生 home 布局
- `/tags/` 为独立完整页面，支持筛选态
- `/timeline/` 为独立完整页面，按年份分组
- `/categories/` 保持可访问
- `Valine + LeanCloud visitor` 在切主题后仍保留
- 文档中所有明显过时的 reco/Lumen 路线都已被修正或标记
