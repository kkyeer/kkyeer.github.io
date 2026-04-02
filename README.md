# 博客
[![Node.js CI](https://github.com/kkyeer/kkyeer.github.io/actions/workflows/blog.yml/badge.svg?branch=master)](https://github.com/kkyeer/kkyeer.github.io/actions/workflows/blog.yml)

kkyeer 的博客仓库。

## 当前方向

仓库当前仍处于 `VuePress -> VitePress` 迁移阶段，当前激活的迁移路径是：

- `VitePress`
- `@sugarat/theme` 主题基线
- 独立保留 `/categories/`、`/tags/`、`/timeline/` 页面
- `Valine + LeanCloud visitor` 兼容层

相关文档：

- 技术方案：[migration/specs/2026-04-02-sugar-blog-theme-migration-design.md](migration/specs/2026-04-02-sugar-blog-theme-migration-design.md)
- 落地流程：[migration/plans/2026-04-02-sugar-blog-theme-migration-implementation.md](migration/plans/2026-04-02-sugar-blog-theme-migration-implementation.md)

## 编译与启动

当前仓库仍同时保留 VuePress 与 VitePress 两套脚本。

```bash
# 安装依赖
yarn install

# 旧 VuePress 调试/构建（兼容保留）
yarn dev
yarn build

# 当前 VitePress 调试/构建
yarn vitepress:dev
yarn vitepress:build
```

## 文档说明

仓库里仍保留了一批 reco/Lumen 路线的历史方案文档，用于回溯前期迁移判断。

这些文档不会删除，但已经不再作为当前执行基线；使用前请优先查看上面的新设计文档与实施计划。
