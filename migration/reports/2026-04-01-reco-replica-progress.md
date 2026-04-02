# Reco 复刻进度（2026-04-01）

> Status 2026-04-02: 本文是 reco 复刻阶段的历史进度记录。当前主题路线已经调整为 `@sugarat/theme` / `sugar-blog` 基线，后续执行请转到 [2026-04-02-sugar-blog-theme-migration-design.md](../specs/2026-04-02-sugar-blog-theme-migration-design.md) 和 [2026-04-02-sugar-blog-theme-migration-implementation.md](../plans/2026-04-02-sugar-blog-theme-migration-implementation.md)。

## 目标

将当前 VitePress 站点的首页与归档视觉/交互尽量贴近 `vuepress-theme-reco`，并移除 lumen 样式依赖。

## 当前进度概览

- 完成：首页已切换为 `BlogHome`，采用 reco 风格双栏布局（主文章流 + 右侧聚合侧栏）。
- 完成：归档页（timeline/categories/tags）完成一轮 reco 风格复刻，保留 hover 反馈、色彩反馈、轻背景氛围。
- 完成：移除 `@theojs/lumen` 的样式与组件注册，首页不再依赖 lumen 组件。
- 完成：时间线页修复三项视觉问题（日期换行、异常下划线、背景方格）。
- 完成：时间线顶部不再重复列出每一年卡片，改为摘要区。
- 完成：内容区域已放宽（`--vp-content-width` 从窄列提升到 1080px）。

## 已落地关键改动

### 1) 首页入口改为 BlogHome

- 文件：`docs/index.md`
- 状态：`<BlogHome />` 已作为根路由内容。

### 2) 首页 reco 风格重写

- 文件：`docs/.vitepress/theme/components/BlogHome.vue`
- 主要内容：
  - 主栏：banner + 最新文章流（标题 hover 下划线）
  - 侧栏：站点概览、分类列表、标签云、入口导航
  - 保留原有数据来源（posts/category/tag 聚合）

### 3) 首页与归档样式

- 文件：`docs/.vitepress/theme/custom.css`
- 主要内容：
  - 新增 `kk-home-blog*` 系列样式（双栏、侧栏、卡片、标签）
  - 归档 reco 化与时间线交互细节
  - 修复 timeline 问题：
    - 日期列固定宽度并单行显示
    - 去除 reco 行样式中的底部分隔线
    - 去除方格背景，仅保留轻渐变氛围

### 4) 去除 lumen 依赖

- 文件：`docs/.vitepress/theme/index.ts`
- 状态：
  - 移除 `@theojs/lumen` 组件导入与 `@theojs/lumen/style`
  - `enhanceApp` 不再注册 lumen 组件

## 自动化验证

本轮已通过：

- `node --test tests/homepage-route.test.mjs`
- `node --test tests/blog-data.test.mjs`
- `node --test tests/archive-page-structure.test.mjs`
- `node --test tests/theme-entry.test.mjs`
- `npm run vitepress:build`

## 当前预览

- 启动命令：`npm run vitepress:dev -- --host 0.0.0.0 --port 4173`
- 可访问地址（本次会话）：`http://localhost:4173/`

## 仍可继续优化（下个 session 可直接接）

1. 首页 banner 与 reco 原版细节仍有差异（字体权重、模块密度、边距节奏）。
2. 归档页与 reco 原版并非逐像素一致（当前为“高相似度复刻”，非完全同构）。
3. 如需“几乎 1:1”，建议下一步按 reco 各页面逐块截图对齐（首页、分类页、标签页、时间线页）。
