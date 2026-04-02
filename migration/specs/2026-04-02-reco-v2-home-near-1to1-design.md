# Reco v2 Home Near-1:1 Design (2026-04-02)

> Status 2026-04-02: This design records the previous reco-home direction only. It is superseded by [2026-04-02-sugar-blog-theme-migration-design.md](./2026-04-02-sugar-blog-theme-migration-design.md) and should not be used as the active implementation baseline.

## Goal

在当前 VitePress 站点中，将首页重构为接近 `vuepress-theme-reco v2` 的博客首页观感（近 1:1），并保持现有数据来源与站点功能稳定。

本次仅改首页，不做归档页与文章页结构调整。

## Confirmed Decisions

- 目标版本：`reco v2` 风格
- 对齐程度：`近 1:1`（非逐像素）
- 首页保留明显 Banner（站点名 + 一句描述）
- 删除首页底部“迁移进度”“站点入口”两个区块
- 右侧栏收敛为三模块：`站点信息 + 分类 + 标签`
- 实现路径：`方案 2`（按 reco v2 模块重搭模板 + CSS）

## Scope

### In Scope

- 重搭首页结构为 `Hero + PostStream + Sidebar`
- 统一 reco v2 风格的文章流卡片节奏
- 重做首页侧栏为三模块固定顺序
- 删除当前首页底部两个附加区块
- 完成桌面/移动端样式适配

### Out Of Scope

- 归档页（timeline/categories/tags）结构调整
- 文章页样式系统重构
- 新增路由、数据字段或后端能力
- 引入 reco 原主题依赖

## Architecture

### Primary Files

- `docs/.vitepress/theme/components/BlogHome.vue`
- `docs/.vitepress/theme/custom.css`

### Component Structure

`BlogHome.vue` 重排为三段主结构：

1. `kk-home-hero`
2. `kk-home-blog__main`（文章流）
3. `kk-home-blog__aside`（侧栏三模块）

并移除当前底部的“迁移进度”“站点入口”区块模板。

## Data Mapping

继续复用已有数据逻辑，不新增数据层：

- `posts`
- `buildRecentPosts`
- `buildCategoryHighlights`
- `buildTagHighlights`

字段展示规则：

- Hero：站点名、描述、文章总量、最近更新时间
- PostStream：标题、日期、分类、摘要
- Sidebar：
  - 站点信息：文章数、分类数、标签数、最近更新
  - 分类：Top 8-10
  - 标签：Top 20-24

## Visual Direction (Near-1:1)

目标是 reco v2 的“轻卡片 + 清晰层级 + 双栏节奏”：

- Hero 具有明确视觉锚点，但不使用厚重插画
- 主栏文章卡片强调可读性与扫读效率
- 侧栏卡片密度高于主栏，作为导航与统计辅助
- hover 反馈统一：边框色提升 + 轻位移 + 链接强调
- 模块间距、标题层级、内边距按 reco v2 习惯收敛

## Responsive Strategy

- Desktop：双栏布局（主栏 + 侧栏）
- Tablet/Mobile：侧栏下沉至主栏后，保持模块顺序不变
- 移动端重点保证：
  - 标题与元信息不拥挤
  - 摘要截断稳定
  - 标签云换行自然

## Testing Strategy

### Automated

- `node --test tests/homepage-route.test.mjs`
- `node --test tests/blog-data.test.mjs`
- `npm run vitepress:build`

### Manual Checklist

- 首页首屏为明显 Banner
- 首页不存在“迁移进度/站点入口”区块
- 侧栏仅保留三模块：站点信息、分类、标签
- 文章流卡片节奏与 reco v2 接近
- 桌面与移动端均无明显布局/换行异常

## Acceptance Criteria

- 首页视觉达到 reco v2 `近 1:1` 目标
- 不新增主题依赖
- 不破坏现有首页数据正确性与构建流程
