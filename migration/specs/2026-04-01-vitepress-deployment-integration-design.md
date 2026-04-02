# VitePress Deployment Integration Completion Guide

## Goal

把当前已经完成的“本地构建可用 + 基础部署目录切换”推进到“真实线上部署链路可验收、可回滚、可复查”的状态。

本方案聚焦发布集成与上线验收，不包含页面视觉增强。

## Current State

当前已经完成的部署相关工作：

- 构建主产物已经切到 `docs/.vitepress/dist`
- `feed.xml` / `sitemap.xml` 已在构建时产出到 `docs/.vitepress/dist`
- GitHub Actions workflow 已改为使用 `yarn vitepress:build`
- GitHub Pages 发布目录已改为 `./docs/.vitepress/dist`
- 远端归档与上传逻辑已改为消费 VitePress `dist`
- `@theojs/lumen` 已切到固定版本 `6.4.6`
- 本地 deploy contract 测试已覆盖：
  - `docs/.vitepress/dist` 发布目录
  - `Node 20.x`
  - `yarn install --frozen-lockfile`
  - push-only deploy gating
- 本地已经验证：
  - `yarn install --frozen-lockfile`
  - `yarn test:deploy-cutover`
  - `yarn test:feed-sitemap`
  - `yarn vitepress:build`
  - `yarn vitepress:archive`

这意味着当前状态已经不是“部署方案未切”，而是“部署代码已切，仍缺真实线上集成验收”。

## Scope

### In Scope

- GitHub Actions 真实执行验证
- GitHub Pages 发布结果验收
- 远端服务器发布结果验收
- `feed.xml` / `sitemap.xml` 线上可访问性复核
- 域名、静态资源、CDN 路径一致性检查
- 发布前检查清单
- 回滚方案
- 发布后验收清单

### Out Of Scope

- 重新设计部署拓扑
- 切换评论系统
- 切换统计系统
- 大规模 CDN 架构调整
- 删除 VuePress 老代码

## Integration Targets

### Target 1: GitHub Actions

确认 workflow 在真实 GitHub 环境中可运行，而不是仅在本地逻辑上成立。

应重点验证：

- `yarn install --frozen-lockfile` 是否通过
- Node `20.x` 环境下 `yarn vitepress:build` 是否通过
- `yarn vitepress:archive` 是否生成预期 tar 包
- push 事件下才会执行 GitHub Pages / SSH / upload
- pull request 事件不会尝试读取发布 secrets

### Target 2: GitHub Pages

确认 GitHub Pages 实际发布的就是 `docs/.vitepress/dist` 产物。

应重点验证：

- 首页是否可访问
- `/categories/`、`/tags/`、`/timeline/`、`/friends/` 是否可访问
- `feed.xml`、`sitemap.xml` 是否存在
- 静态资源（JS、CSS、图片、字体）是否成功加载

### Target 3: Remote Server

确认远端服务器最终站点目录 `/home/ngmng/data/dist/` 已被正确替换为 VitePress 产物。

应重点验证：

- 远端 tar 解压目录是否为 `/tmp/dist/`
- 远端最终目录是否包含 `index.html`
- 远端最终目录是否包含 `feed.xml` / `sitemap.xml`
- 网站入口页、文章页、分类页是否在远端真实可用

### Target 4: CDN And Asset Path

虽然这轮不主动重构 CDN 方案，但要确认当前路径策略不会阻塞上线。

应重点验证：

- 页面 HTML 中资源路径是否与线上访问域名兼容
- logo、favicon、远端图片、外链字体是否可加载
- 如果使用 GitHub Pages 域名访问，资源路径是否仍正确
- 如果使用自定义域名访问，资源路径是否仍正确

## Implementation Plan

### Phase 1: Freeze The Release Contract

#### Objective

在推分支前，把当前发布约定写清楚，避免执行时临场判断。

#### Actions

- 固化以下发布约定：
  - Build command: `yarn vitepress:build`
  - Publish dir: `docs/.vitepress/dist`
  - Archive file: `/tmp/blog.tar.xz`
  - Remote unpack dir: `/tmp/dist/`
  - Remote final dir: `/home/ngmng/data/dist/`
- 明确 push 才执行 deploy
- 明确 VuePress 旧脚本只作为回退，不作为当前发布链路

#### Acceptance

- 团队对“现在发什么、往哪发、怎么回滚”没有歧义

### Phase 2: Validate CI In GitHub

#### Objective

确认 workflow 在真实 GitHub Runner 上通过，而不是只在本地推断可行。

#### Actions

- 推送当前分支到远端
- 检查 GitHub Actions 对应 workflow run
- 核对每一步状态：
  - checkout
  - setup-node
  - install
  - build blog
  - GitHub Pages
  - Install SSH key
  - Compress
  - upload
  - remote ssh deploy
- 如果失败，先定位失败边界，不要同时改多个环节

#### Acceptance

- 至少一次 push 触发的完整 workflow 成功
- 至少一次 pull request workflow 验证不触发 deploy steps

### Phase 3: Validate Published Outputs

#### Objective

确认发布动作完成后，真实站点与构建产物一致。

#### Actions

- 检查 GitHub Pages 站点
- 检查远端生产域名站点
- 对比以下页面：
  - `/`
  - `/timeline/`
  - `/categories/`
  - 任意文章页
  - `/feed.xml`
  - `/sitemap.xml`
- 核对资源请求是否 200
- 核对页面中是否有明显 404 资源

#### Acceptance

- GitHub Pages 页面可访问
- 远端站点页面可访问
- feed/sitemap 可访问
- 首页和至少一篇文章加载正常

### Phase 4: Validate CDN And Public Resource Strategy

#### Objective

确认 VitePress 产物在现有域名/CDN 结构下不会出现静态资源错位。

#### Actions

- 检查浏览器网络面板中的：
  - JS 资源
  - CSS 资源
  - 字体资源
  - 页面图片
- 核对以下外部资源：
  - favicon
  - logo/avatar
  - 外链 webfont
- 如果发现路径错误，再决定是否单独调整 VitePress `base` 或资源策略

#### Acceptance

- 页面核心资源均可正常加载
- 不因部署切换引入新的全站资源 404

### Phase 5: Prepare Rollback And Close Migration Risk

#### Objective

把这轮切换从“能跑”推进到“可控”。

#### Actions

- 保留 VuePress `dev/build` 脚本
- 记录最近一个稳定发布点
- 明确回滚方式：
  - 回滚 workflow 改动
  - 回滚 package / build 改动
  - 恢复旧 `public` 发布链路（如果确有必要）
- 记录本轮未处理风险：
  - action 未 pin SHA
  - `package-lock.json` 与 `yarn.lock` 并存
  - 线上实际 asset path 仍需最终确认

#### Acceptance

- 发布失败时有明确回滚路径
- 未关闭风险已被文档化，而不是口头记忆

## Verification Checklist

### Pre-Release Checklist

发布前应全部通过：

- `yarn install --frozen-lockfile`
- `yarn test:deploy-cutover`
- `yarn test:feed-sitemap`
- `yarn vitepress:build`
- `yarn vitepress:archive`
- `/tmp/blog.tar.xz` 内容以 `dist/` 开头
- `docs/.vitepress/dist/feed.xml` 存在
- `docs/.vitepress/dist/sitemap.xml` 存在

### GitHub Actions Checklist

- push workflow 成功
- pull request workflow 不执行 deploy
- GitHub Pages step 成功
- SSH / upload / remote deploy 成功

### Production Acceptance Checklist

- 首页可访问
- 时间线页可访问
- 分类页可访问
- 至少一篇文章页可访问
- 评论脚本未报阻塞性错误
- 阅读量脚本未报阻塞性错误
- `feed.xml` 可访问
- `sitemap.xml` 可访问
- 没有明显静态资源 404

## Risks

### Risk 1: GitHub Runner And Local Differ

即使本地通过，GitHub Actions 仍可能因为环境差异失败。

Mitigation:
- 把第一次 push 当成正式集成测试
- 每次只修一个边界问题

### Risk 2: Remote Deploy Succeeds But Site Still Broken

上传和解压成功不代表页面真实可用。

Mitigation:
- 发布后必须做页面访问验收，不以“workflow 绿了”作为结束

### Risk 3: Asset Path Or CDN Strategy Still Has Hidden Assumptions

Mitigation:
- 优先通过浏览器网络请求确认真实资源路径
- 把 `base` / CDN 调整拆成单独问题，不和本轮混改

### Risk 4: Lockfile Strategy Still Mixed

仓库当前同时存在 `yarn.lock` 与 `package-lock.json`。

Mitigation:
- 后续单独清理包管理策略，建议统一到 Yarn

## Delivery Checklist

本方案完成时，应满足：

- GitHub Actions 至少一次真实 push 发布通过
- GitHub Pages 与远端服务器都使用 VitePress 产物
- `feed.xml` / `sitemap.xml` 线上可访问
- 首页与文章页线上可访问
- 资源路径未出现新的系统性错误
- 回滚路径已经写清楚

## Suggested Next Action

实施顺序建议如下：

1. 先推分支，拿到第一次真实 workflow 结果
2. 修 GitHub / Runner / secret / install 类问题
3. 验收 GitHub Pages 与远端页面
4. 最后再决定是否单独开一轮处理 CDN / `base` / action pin SHA / lockfile 清理
