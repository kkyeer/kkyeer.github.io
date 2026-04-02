---
layout: home

hero:
  name: 一水轩
  text: Born for code
  tagline: 迁移仍在继续，当前基线已切换为 VitePress + sugar-blog 主题路线。
  actions:
    - theme: brand
      text: 查看时间线
      link: /timeline/
    - theme: alt
      text: 查看标签
      link: /tags/

features:
  - title: 主题基线已调整
    details: 不再继续 reco 近似复刻，当前以 @sugarat/theme 作为主题基线推进。
  - title: 兼容层继续保留
    details: 评论和阅读量暂时继续使用 Valine + LeanCloud visitor，避免迁移期同时切两条链路。
  - title: 独立归档页保留
    details: 标签、时间线、分类会继续保留为独立页面，而不是只做首页局部筛选。
---

## 当前迁移说明

当前执行基线见以下文档：

- `migration/specs/2026-04-02-sugar-blog-theme-migration-design.md`
- `migration/plans/2026-04-02-sugar-blog-theme-migration-implementation.md`

当前迁移路径是：

- `VitePress`
- `@sugarat/theme` 主题基线
- 本地归档页：`/categories/`、`/tags/`、`/timeline/`
- `Valine + LeanCloud visitor` 兼容层

旧的 reco/Lumen 路线文档仍保留为历史记录，但已经不再作为当前实现依据。
