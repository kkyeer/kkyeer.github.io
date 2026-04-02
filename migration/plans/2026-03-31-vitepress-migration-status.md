# VitePress Migration Status

> Status 2026-04-02: This is a historical migration snapshot from the custom Lumen/reco exploration stage. It still records useful content-audit and deploy progress, but the active theme baseline has moved to [2026-04-02-sugar-blog-theme-migration-design.md](../specs/2026-04-02-sugar-blog-theme-migration-design.md).

## 背景

当前博客原本运行在：

- `vuepress@1.9.9`
- `vuepress-theme-reco@1.6.17`

已有定制包括：

- `Valine` 评论
- 基于 `LeanCloud visitor` 的文章阅读量
- reco 主题提供的分类、标签、时间线聚合
- `feed`、`sitemap`
- GitHub Pages + 远端服务器双部署
- 自定义样式、静态资源和 CDN `publicPath`

本次工作目标不是一次性完成全部迁移，而是先在同一仓库中搭建一套可运行、可构建的 VitePress 并行骨架，为后续替换 VuePress 做准备。

## 当前状态

### 已完成

1. 已在 `docs/.vitepress/` 下建立 VitePress 骨架。
2. 已接入本地 Lumen 主题组件库作为样式和组件增强层。
3. 已保留 `Valine` 评论能力。
4. 已保留文章页阅读量展示能力，继续使用 `Valine + LeanCloud visitor`。
5. 已建立首页、分类、标签、时间线的基础页面入口。
6. 已实现对 `docs/views/**/*.md` 的基础文章索引。
7. 已完成一次实际构建验证，`yarn vitepress:build` 通过。
8. 已补上友情链接页，并接回旧站 friend links 数据。
9. 已增强首页与分类、标签、时间线页，开始接近博客可用状态。
10. 已为博客聚合数据补上基础自动化测试。
11. 已在 `yarn vitepress:build` 后自动生成 `feed.xml` 与 `sitemap.xml`。

### 当前新增/修改的关键文件

- [package.json](/home/kk/workspace/project/kkyeer.github.io/package.json)
- [docs/.vitepress/config.mts](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/config.mts)
- [docs/.vitepress/theme/index.ts](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/index.ts)
- [docs/.vitepress/theme/custom.css](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/custom.css)
- [docs/.vitepress/theme/lib/posts.ts](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/lib/posts.ts)
- [docs/.vitepress/theme/components/ValineComments.vue](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/components/ValineComments.vue)
- [docs/.vitepress/theme/components/AccessNumber.vue](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/components/AccessNumber.vue)
- [docs/.vitepress/theme/components/PostMeta.vue](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/components/PostMeta.vue)
- [docs/.vitepress/theme/components/BlogHome.vue](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/components/BlogHome.vue)
- [docs/.vitepress/theme/components/ArchivePage.vue](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/components/ArchivePage.vue)
- [docs/.vitepress/theme/components/SiteFooter.vue](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/components/SiteFooter.vue)
- [docs/.vitepress/theme/components/FriendLinksPage.vue](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/components/FriendLinksPage.vue)
- [docs/.vitepress/theme/lib/blog-data.mjs](/home/kk/workspace/project/kkyeer.github.io/docs/.vitepress/theme/lib/blog-data.mjs)
- [docs/README.md](/home/kk/workspace/project/kkyeer.github.io/docs/README.md)
- [docs/categories/index.md](/home/kk/workspace/project/kkyeer.github.io/docs/categories/index.md)
- [docs/friends/index.md](/home/kk/workspace/project/kkyeer.github.io/docs/friends/index.md)
- [docs/tags/index.md](/home/kk/workspace/project/kkyeer.github.io/docs/tags/index.md)
- [docs/timeline/index.md](/home/kk/workspace/project/kkyeer.github.io/docs/timeline/index.md)
- [migration/reports/vitepress-content-audit.json](../reports/vitepress-content-audit.json)
- [scripts/vitepress/content-audit.mjs](/home/kk/workspace/project/kkyeer.github.io/scripts/vitepress/content-audit.mjs)
- [scripts/vitepress/feed-sitemap.mjs](/home/kk/workspace/project/kkyeer.github.io/scripts/vitepress/feed-sitemap.mjs)
- [tests/blog-data.test.mjs](/home/kk/workspace/project/kkyeer.github.io/tests/blog-data.test.mjs)
- [tests/content-audit.test.mjs](/home/kk/workspace/project/kkyeer.github.io/tests/content-audit.test.mjs)
- [tests/feed-sitemap.test.mjs](/home/kk/workspace/project/kkyeer.github.io/tests/feed-sitemap.test.mjs)

### 本轮新增进展

本轮主要完成了三类工作：

1. 把“博客骨架”继续推进到“博客可用”
   - 首页已经补上最近更新、分类摘要、标签导航、迁移入口和友链入口
   - 分类、标签、时间线页已经从单纯骨架页变成可浏览的聚合页
   - 友情链接页已经从 reco 配置迁移为显式页面
2. 把 reco 主题隐式提供的 `feed` / `sitemap` 能力改成显式构建产物
   - 新增 `scripts/vitepress/feed-sitemap.mjs`
   - `yarn vitepress:build` 结束后会自动产出 `docs/.vitepress/dist/feed.xml`
   - `yarn vitepress:build` 结束后会自动产出 `docs/.vitepress/dist/sitemap.xml`
   - 对缺失 `date` 的旧文，当前回退到文件 `mtime`，避免 sitemap/feed 中出现 `1970-01-01`
3. 已开始把“旧文兼容性风险”从经验判断改成显式审计
   - 新增 `scripts/vitepress/content-audit.mjs`
   - 新增 `yarn vitepress:audit`
   - 新增 `yarn test:content-audit`
   - 审计结果会输出到 `migration/reports/vitepress-content-audit.json`
4. 已完成第一轮高风险旧文修复
   - 已补齐 `5` 篇缺失 `date/categories` 的文章 frontmatter
   - 已修复 `15` 条可判定的失效内部链接
   - 已修复 `Spread.md` 中会被 Markdown 误判为链接的正文语法
5. 已完成剩余 frontmatter 尾项清理
   - 已补齐最后 `4` 篇缺失 `tags` 的文章
   - 当前 frontmatter 关键字段缺失已经清零
6. 已把“旧文兼容性抽样”收敛成显式审计项
   - 审计脚本现在会统计代码块外裸 HTML 和旧式 `/deep/` 语法
   - 经过规则收敛后，已排除自动链接、泛型尖括号、转义 XML 标签等误报
   - 当前审计结果为 `rawHtmlPosts=0`、`legacyDeepSelectorPosts=0`
7. 已确认当前 `feed.xml` / `sitemap.xml` 的静态页面覆盖范围足够
   - 站内可公开的顶层索引页目前只有 `/`、`/categories/`、`/tags/`、`/timeline/`、`/friends/`
   - 暂时不需要为 `feed/sitemap` 额外补静态页面
8. 已完成兼容性尾项清理
   - 已修复 `CssDeep.md` 中会触发 `/deep/` 兼容性告警的正文写法
   - 当前审计基线为：frontmatter/图表语法/死链/兼容性风险均为 `0`

### 本轮兼容性审计结果

已对 `docs/views/**/*.md` 共 `137` 篇文章做一次实际扫描，当前结果如下：

1. frontmatter 缺失分布
   - 缺失 `date`：`0` 篇
   - 缺失 `categories/category`：`0` 篇
   - 缺失 `tags/tag`：`0` 篇
   - 任一关键 frontmatter 缺失：`0` 篇
2. 图表语法分布
   - `flowchart`：`0` 篇
   - `mermaid`：`0` 篇
   - `PlantUML`：`0` 篇
3. 内部链接分布
   - 旧式 `.md` 内链：`15` 条
   - 当前可判定的疑似死链：`0` 条
4. 兼容性风险分布
   - 代码块外裸 HTML：`0` 篇
   - 旧式 `/deep/` 语法：`0` 篇

这轮盘点有两个直接结论：

1. `flowchart` 不是当前迁移主风险
   - 实际扫描结果为 `0` 篇使用 `flowchart`
   - 文章里的 `PlantUML` 相关内容只是普通代码示例，不构成渲染迁移需求
2. 内容迁移的主要风险集中在少量旧文
   - frontmatter 关键字段缺失已经清零，不再影响分类、标签和时间线聚合
   - 死链与兼容性告警均已清零，当前主要风险已从“内容迁移”转向“部署切换”

### 关于 feed / sitemap 的当前判断

本轮重新检查了当前站点中显式存在的静态入口页：

- `/`
- `/categories/`
- `/tags/`
- `/timeline/`
- `/friends/`

当前 `scripts/vitepress/feed-sitemap.mjs` 中的 `staticRoutes` 已经覆盖以上全部页面。
仓库中目前没有其他需要单独公开收录的顶层 `index.md` 页面，因此现阶段不需要继续扩充 sitemap/feed 的静态路由列表。

### 本轮发现的高优先级问题清单

#### 必须修复

1. 这批问题已经完成第一轮修复
   - `5` 篇缺失 `date/categories` 的文章已补齐 frontmatter
   - `15` 条可判定死链已修复到可解析状态
   - [docs/views/frontend/js/Spread.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/frontend/js/Spread.md) 的误解析语法已改成代码块

#### 可暂时兼容

1. 当前图表语法迁移风险已经清零
   - `flowchart`、`mermaid`、`plantuml` 的审计结果都为 `0`
   - 暂时不需要为 VitePress 引入额外图表渲染链路
2. 旧式 `.md` 内链当前保持可解析状态
   - 当前有 `15` 条 `.md` 内链
   - `brokenInternalLinks=0`，本轮不改风格，只保持可解析

### 本轮文章改动备查（截至当前工作树）

- [docs/views/basic/IO.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/basic/IO.md)
- [docs/views/frontend/js/ArrayFill.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/frontend/js/ArrayFill.md)
- [docs/views/frontend/js/ArrayMap.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/frontend/js/ArrayMap.md)
- [docs/views/frontend/js/CssDeep.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/frontend/js/CssDeep.md)
- [docs/views/frontend/js/Spread.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/frontend/js/Spread.md)
- [docs/views/issue/k8s_oom_killer/pgcacher.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/issue/k8s_oom_killer/pgcacher.md)
- [docs/views/java/dubbo/2020/DubboInit.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/java/dubbo/2020/DubboInit.md)
- [docs/views/java/knowledge/Recursive_type_parameter.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/java/knowledge/Recursive_type_parameter.md)
- [docs/views/java/third-party/ut.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/java/third-party/ut.md)
- [docs/views/linux/NginxProxy.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/linux/NginxProxy.md)
- [docs/views/linux/QBitTorrentDocker.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/linux/QBitTorrentDocker.md)
- [docs/views/project/DistributedJob.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/project/DistributedJob.md)
- [docs/views/redis/RedisDataType.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/redis/RedisDataType.md)
- [docs/views/spring/2019/SpringContext_1_init_get.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/spring/2019/SpringContext_1_init_get.md)
- [docs/views/spring/2019/SpringContext_3_resource.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/spring/2019/SpringContext_3_resource.md)
- [docs/views/spring/2019/SpringContext_4_NodeToBeanDefinition.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/spring/2019/SpringContext_4_NodeToBeanDefinition.md)
- [docs/views/spring/2019/SpringContext_5_BeanDefinitionToBean.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/spring/2019/SpringContext_5_BeanDefinitionToBean.md)
- [docs/views/spring/2019/SpringContext_6_CreateBean.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/spring/2019/SpringContext_6_CreateBean.md)
- [docs/views/spring/2020/SpringBootAppStart.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/spring/2020/SpringBootAppStart.md)
- [docs/views/spring/2020/SpringBootWebContext.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/spring/2020/SpringBootWebContext.md)

### 为兼容 VitePress 已额外处理的问题

为保证旧文可以先构建通过，已做两类兼容处理：

1. 在 VitePress 配置中加入了针对旧 Markdown 的预处理，避免正文中的 Java 泛型尖括号被当作 HTML 解析。
2. 修复了个别旧文章中的裸 HTML 文本问题。

本次明确修改过的旧文：

- [docs/views/java/knowledge/Recursive_type_parameter.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/java/knowledge/Recursive_type_parameter.md)
- [docs/views/frontend/js/CssDeep.md](/home/kk/workspace/project/kkyeer.github.io/docs/views/frontend/js/CssDeep.md)

## 当前方案

### 方案核心

采用“并行迁移”而不是“原地替换”：

1. 保留现有 VuePress 站点结构不动。
2. 在同一仓库并行新增 `docs/.vitepress/`。
3. 先跑通内容渲染、首页、评论、阅读量、归档页入口。
4. 再逐步补齐 reco 主题时代的博客系统能力和部署能力。

### 为什么这样做

因为这个项目真正复杂的部分不在 Markdown 渲染，而在 reco 主题帮你隐式完成的博客能力：

- 分类聚合
- 标签聚合
- 时间线
- feed/sitemap
- 页面级信息展示
- 评论与阅读量联动

这些能力在 VitePress 里都需要显式重建。并行迁移可以避免一次性替换后站点长时间不可用。

### 当前技术取舍

#### 1. 主题层

- 已引入 Lumen
- 但不把 Lumen 当成完整博客主题使用

原因：

- Lumen 擅长样式增强、组件增强、评论/统计接入
- 但不直接提供你当前 reco 那套博客聚合系统

#### 2. 评论与阅读量

- 继续使用 `Valine`
- 继续使用 `LeanCloud visitor`

原因：

- 这是你当前线上数据的来源
- 迁移到 `Waline` 会导致实现路径和数据链路同时变化，不适合放在第一阶段

#### 3. 文章聚合

- 当前通过 `docs/.vitepress/theme/lib/posts.ts` 扫描 `docs/views/**/*.md`
- 从 frontmatter 中提取 `date/categories/tags/publish`
- 先生成前端可用的静态文章索引

原因：

- 你的文章 frontmatter 已经基本满足迁移条件
- 这是替代 reco 自动聚合能力的最小实现路径

## 已知问题

### 1. 当前聚合页还是骨架，不是 reco 等价实现

目前：

- `/categories/`
- `/tags/`
- `/timeline/`

已经可访问，但还是基础版本，主要用于建立迁移主干。还没有做到 reco 主题时代那种完整的归档信息结构和细节表现。

补充说明：

- 现在首页已经补上最近更新、分类摘要、标签导航和迁移入口
- 分类、标签、时间线页已经有摘要卡片、锚点跳转和文章列表
- 但仍未做到 reco 那种独立分类详情路由和更细的筛选交互

### 2. Lumen 目前是本地文件依赖

当前 `package.json` 中使用：

- `@theojs/lumen": "file:../../open_source/lumen/src"`

这意味着：

- 本机当前目录结构下可以安装
- 但 CI 或其他机器如果没有这个本地路径，会安装失败

### 3. 历史文章内容兼容性仍有潜在问题

虽然已经让整站构建通过，但旧文中仍可能存在：

- 裸 HTML
- 旧式内部链接
- 不规范 frontmatter
- VitePress 更严格的 Markdown/HTML 解析差异

当前做法是先容忍并兼容，而不是立即全面清洗。

补充说明：

- 现在这些问题已经有了第一版显式统计，不再只是推测
- 当前 `date/categories` 缺失和可判定死链都已经清零
- 统计结果见 `migration/reports/vitepress-content-audit.json`

### 4. 部署链路仍未切换

当前只是并行建立了 VitePress 骨架，尚未切换以下链路：

- GitHub Pages workflow
- 远端服务器上传发布
- CDN 静态资源路径策略

### 5. `feed` / `sitemap` 还只是“生成完成”，不是“部署完成”

当前已经能在本地和构建产物中生成：

- `docs/.vitepress/dist/feed.xml`
- `docs/.vitepress/dist/sitemap.xml`

但这些文件是否会被线上实际发布，还取决于后续部署链路是否正式切换到 VitePress 产物目录。

## 已验证结果

已执行并通过：

```bash
yarn install
yarn test:blog-data
yarn test:content-audit
yarn test:feed-sitemap
yarn vitepress:audit
yarn vitepress:build
```

产物目录：

- `docs/.vitepress/dist`
- `docs/.vitepress/dist/feed.xml`
- `docs/.vitepress/dist/sitemap.xml`

说明当前骨架已经达到“可构建”的状态。
同时已经具备基础的订阅与站点地图产物生成能力。
并且已经具备一套可重复执行的旧文兼容性审计脚本。

## 下一步计划

### 第一优先级

把“骨架可用”推进到“博客可用”：

1. 继续细化分类页、标签页、时间线页的信息密度和交互
2. 统一文章页的元信息显示样式
3. 评估是否要补分类/标签详情路由
4. 让首页继续向旧站信息架构靠拢

### 第二优先级

补齐迁移期必须能力：

1. 评估是否要把旧式 `.md` 内链统一收敛成更明确的 VitePress 链接风格
2. 继续增强审计脚本（例如把 `.md` 内链风格检查作为单独规则）
3. 复核 `feed.xml` / `sitemap.xml` 在真实部署链路中的可访问性
4. 补充部署切换前后的验收清单

补充说明：

- 旧文兼容性本轮已完成收口，当前不再是主阻塞
- 下一阶段重心应切到部署切换和发布验收

### 建议下一步直接执行

下一轮建议优先做“旧文兼容性修复”，而不是立即改部署，原因是：

1. 当前 VitePress 站点已经能构建并产出 feed/sitemap，主干能力基本齐了
2. 现在最大的风险已经从“内容迁移”转成“部署链路切换和发布一致性”
3. 内容侧关键指标已经清零，继续停留在内容精修收益有限

建议下一轮具体按这个顺序做：

1. 先进入部署链路切换（build 输出目录、GitHub Actions、远端发布脚本）
2. 再跑一次完整构建与产物验收（含 feed/sitemap 可访问性）
3. 然后决定是否要统一 `.md` 内链风格
4. 最后再考虑是否保留或下线 VuePress 老链路

### 第三优先级

切换部署链路：

1. 新增或修改 VitePress 构建脚本
2. 改 GitHub Actions 发布目录
3. 改远端服务器打包/上传逻辑
4. 验证 CDN 与静态资源路径是否保持正确

## 建议执行顺序

建议按下面顺序继续：

1. 先把归档页和首页做完整
2. 再处理 `flowchart`、死链和旧 Markdown 兼容性
3. 再切部署
4. 最后再考虑是否保留 VuePress，或者彻底删除 `.vuepress`

## 结论

当前迁移已经完成了最关键的一步：

- VitePress 并行站点已经搭起来
- Lumen 已接入
- `Valine` 评论已保留
- 阅读量已保留
- 整站已能成功构建

接下来不再是“能不能迁”的问题，而是“按什么节奏把 reco 时代的博客能力补齐并切换部署”的问题。
