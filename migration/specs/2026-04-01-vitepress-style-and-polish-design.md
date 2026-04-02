# VitePress Style And Polish Implementation Guide

> Status 2026-04-02: This document remains useful as a record of the custom archive/home styling exploration, but its “continue custom reco-like polish” direction is no longer the active baseline. Theme-level execution has been superseded by [2026-04-02-sugar-blog-theme-migration-design.md](./2026-04-02-sugar-blog-theme-migration-design.md).

## Goal

把当前 VitePress 站点从“结构已经可浏览，但视觉表达偏薄”推进到“首页、归档页、文章列表具备明确博客感和可上线观感”。

本方案聚焦视觉层、信息密度和交互细节，不包含部署、CI、CDN、线上发布动作。

## Current State

当前页面已经具备以下基础能力：

- 首页已经切到时间线入口，根路径 `/` 可以渲染归档内容
- `/categories/`、`/tags/`、`/timeline/` 已可访问
- 文章页已有元信息区、评论区、阅读量
- 主题层已经有一套基础 `custom.css`
- `ArchivePage.vue` 已经承担分类、标签、时间线三种聚合页渲染

当前主要问题不是“没有样式”，而是“样式不够形成视觉重心”：

- 归档页仍然更像默认文档页中嵌入列表
- 时间线页虽然有结构，但没有“时间轴”感
- 首页切到时间线后，主视觉没有建立起来
- 卡片层级、留白、节奏和 hover 反馈偏弱
- 当前聚合卡片只展示标题和日期，摘要信息不足

## Scope

### In Scope

- 首页时间线视觉增强
- 分类页、标签页、时间线页的信息密度增强
- 归档卡片和导航卡片的样式强化
- 文章列表摘要、分类标签、hover 反馈增强
- 顶部摘要区和页面引导区的视觉重构
- 必要的组件拆分或模板微调
- 移动端排版与间距适配

### Out Of Scope

- 新增分类详情页或标签详情页路由
- 评论系统切换
- 阅读量系统调整
- feed/sitemap/deploy 相关改造
- 全站重新设计品牌视觉
- 暗色模式专门重做

## Design Direction

采用“博客化时间线”方向，而不是继续停留在“文档页 + 卡片列表”。

核心取向：

- 首页直接展示时间线，不再依赖 hero 首页承担主入口
- 时间线页与首页共享一套视觉语言
- 年份是一级视觉锚点，文章是时间线上展开的内容卡片
- 样式追求清晰、克制、有层级，不做夸张插画或重动画

视觉关键词：

- 纸面感
- 纵向节奏
- 清晰留白
- 轻微层叠
- 节点式时间感

## Architecture

### Primary Files

- `docs/.vitepress/theme/components/ArchivePage.vue`
- `docs/.vitepress/theme/custom.css`
- `docs/.vitepress/theme/lib/posts.ts`
- `docs/.vitepress/theme/lib/blog-data.mjs`
- `docs/index.md`
- `docs/timeline/index.md`
- `tests/blog-data.test.mjs`
- 新增必要的样式/路由回归测试文件

### Optional Component Split

如果 `ArchivePage.vue` 在这轮增强中继续膨胀，建议拆出：

- `ArchiveHero.vue`
- `ArchiveJumpGrid.vue`
- `TimelineList.vue`
- `ArchivePostCard.vue`

如果只是小幅结构调整，也可以继续保留单组件，但要控制模板复杂度。

## Implementation Plan

### Phase 1: Build A Strong Homepage Timeline Shell

#### Objective

让 `/` 不只是“能看到时间线”，而是“首页就是时间线”。

#### Changes

- 在首页时间线顶部加入轻量引导区
- 引导区展示：
  - 页面标题
  - 文章总数
  - 年份总数
  - 可选的简短站点说明
- 引导区下方直接进入年份导航和时间线主体
- 首页不再出现现在偏骨架感的空白文档头部节奏

#### Files

- `docs/index.md`
- `docs/.vitepress/theme/components/ArchivePage.vue`
- `docs/.vitepress/theme/custom.css`

#### Acceptance

- 首页首屏能直接看出“这是时间线首页”
- 顶部摘要区与时间线列表之间有明确层级
- 不出现接近默认 404 / 默认文档页的观感

### Phase 2: Turn Timeline Into A Real Timeline

#### Objective

让时间线具有明显的纵向时间轴结构。

#### Changes

- 为年份分组加入更强标题样式：
  - 年份 badge / 数字标题
  - 分组计数
  - 分组锚点更明显
- 为文章列表加入“纵线 + 节点”结构
- 每条文章卡片展示：
  - 标题
  - 日期
  - 分类
  - 一行摘要
- hover 时强化：
  - 边框色
  - 轻微位移
  - 阴影或背景变化
- 首页 `/` 与 `/timeline/` 使用同一套结构和主要样式

#### Files

- `docs/.vitepress/theme/components/ArchivePage.vue`
- `docs/.vitepress/theme/custom.css`
- `docs/.vitepress/theme/lib/posts.ts`

#### Acceptance

- 用户一眼能看出纵向时间轴关系
- 年份与文章层级清晰
- 单条文章卡片具备足够信息密度，不需要点进去才能知道大致内容

### Phase 3: Strengthen Categories And Tags Without New Routes

#### Objective

不增加详情路由的前提下，让分类页和标签页也达到“可用博客聚合页”的水平。

#### Changes

- 顶部摘要区继续保留，但强化为可扫读统计卡片
- 锚点导航卡片加入数量、状态和更强视觉反馈
- 每个分类/标签分组下的文章列表统一采用增强卡片样式
- 分类/标签页的文章卡片同样显示：
  - 标题
  - 日期
  - 摘要
- 分类页可额外显示标签摘要；标签页可额外显示分类摘要，但只在布局允许时加入

#### Files

- `docs/.vitepress/theme/components/ArchivePage.vue`
- `docs/.vitepress/theme/custom.css`
- `docs/.vitepress/theme/lib/blog-data.mjs`

#### Acceptance

- 分类页和标签页不再像“同一套组件仅换标题”
- 用户可以快速扫读高频分类、高频标签和对应文章
- 移动端不会因为卡片信息增多而失控换行

### Phase 4: Polish Spacing, Typography, And Motion

#### Objective

把整体观感从“功能样式”推进到“完整页面”。

#### Changes

- 调整区块间距和 section 节奏
- 强化标题和副文本层级
- 优化卡片圆角、背景、分隔线、hover 动效
- 在不引入花哨动画的前提下加入轻微过渡
- 补充移动端断点下的：
  - 标题换行
  - 统计卡片堆叠
  - 时间线节点缩放与间距修正

#### Files

- `docs/.vitepress/theme/custom.css`

#### Acceptance

- 页面在桌面端和移动端都自然
- hover 有反馈但不轻浮
- 内容层级、留白和节奏明显改善

## Data Requirements

当前 `posts.ts` 已经提供：

- `title`
- `url`
- `date`
- `categories`
- `tags`
- `excerpt`

样式增强阶段建议继续使用现有字段，不额外引入复杂数据生成链路。

如需增强，可追加但不应阻塞本轮：

- 更稳定的摘要截断逻辑
- 分类/标签下代表文章抽样
- 首页最近更新专题分组

## Testing Strategy

### Minimum Required Tests

- 首页路由测试继续确认 `/` 对应 `docs/index.md`
- 归档页结构测试：
  - 时间线首页仍使用 `ArchivePage type="timeline"`
  - 分类/标签/时间线入口未破坏
- 数据测试确认 `excerpt`、分组、文章计数仍正常

### Manual Regression Checklist

#### Homepage

- `/` 打开后不是 404
- 首屏能看出时间线首页定位
- 顶部摘要区正常显示
- 年份分组可浏览

#### Timeline

- `/timeline/` 与首页风格一致
- 年份锚点跳转正常
- 单条文章卡片 hover 正常

#### Categories And Tags

- `/categories/` 正常渲染
- `/tags/` 正常渲染
- 锚点跳转正常
- 长标题和长标签不会把布局撑坏

#### Mobile

- 首页首屏不拥挤
- 卡片不溢出
- 时间线节点与文字不打架

## Risks

### Risk 1: `ArchivePage.vue` 继续膨胀

Mitigation:
- 如果模板超过当前复杂度明显上升，及时拆出子组件

### Risk 2: 样式只在首页好看，其他聚合页不协调

Mitigation:
- 先定义共用的 archive 视觉语言，再对首页做薄定制

### Risk 3: 信息密度提升导致移动端观感变差

Mitigation:
- 每次结构增强都同步补移动端断点规则

## Delivery Checklist

完成本方案时，应满足以下条件：

- 首页 `/` 作为时间线首页成立
- 时间线页具有明显时间轴视觉
- 分类页和标签页具备更强的聚合观感
- 文章卡片具备标题、日期、分类、摘要等最小信息密度
- 桌面端与移动端都可接受
- 至少有一条自动化测试覆盖首页路由或归档结构

## Suggested Next Action

实施时建议按下面顺序推进：

1. 先做首页/时间线共享样式骨架
2. 再补单条文章卡片信息密度
3. 再统一分类/标签页
4. 最后做 spacing / hover / mobile polish
