# 分类归档页筛选交互设计

## 背景

当前 `/categories/` 页顶部分类区仍然使用锚点跳转，点击后会跳到对应分组位置。`/tags/` 页顶部已经改为页内单选筛选，点击标签后只展示该标签分组，并通过查询参数保留状态。

这两页现在在用户心智上不一致：

- 标签页是“筛选”
- 分类页是“跳转”

本次改动目标是让分类页与标签页使用同一类交互范式，同时保持时间线页不变。

## 目标

- 将 `/categories/` 页顶部分类区从锚点跳转改为页内单选筛选
- 交互规则与 `/tags/` 页保持一致
- 使用 `?category=<name>` 持久化当前筛选状态
- 支持刷新、前进、后退后恢复筛选状态
- 顶部样式与标签页当前按钮样式一致

## 非目标

- 不调整时间线页顶部导航行为
- 不重做分类 section 内容结构
- 不修改文章列表卡片、正文元信息、归档数据结构
- 不新增独立分类详情页或路由

## 当前实现

`ArchivePage.vue` 目前存在三类行为：

- `tags`：使用 `activeTag`、`toggleTagFilter()`、`?tag=` 查询参数做单选筛选
- `timeline`：顶部导航仍然是锚点跳转
- `categories`：顶部导航使用 `categoryLinks` 渲染 `<a href="#...">`

分类页内容区数据来自 `buildCategoryArchiveFromTheme()`，顶部按钮数据来自 `categoryArchive.topGroups.flatMap(...)`。这意味着分类页已经具备做页内筛选所需的数据，不需要引入新的数据源。

## 方案

### 状态模型

在 `ArchivePage.vue` 中为分类页增加与标签页对称的状态：

- `activeCategory`
- `syncActiveCategory()`
- `syncCategoryQuery()`
- `toggleCategoryFilter()`

行为规则：

- 首次进入 `/categories/?category=JVM` 时，读取查询参数并设置当前筛选分类
- 点击一个分类按钮时：
  - 若该分类未选中，则激活它并更新 URL
  - 若该分类已选中，则取消筛选并移除 URL 参数
- 浏览器前进、后退时，重新从 URL 恢复筛选状态

### URL 规则

- 分类页使用 `category` 查询参数
- 标签页继续使用 `tag` 查询参数
- 时间线页不使用筛选参数

示例：

- `/categories/`
- `/categories/?category=JVM`

### 顶部交互

分类页顶部从锚点链接改为按钮：

- 由 `<a>` 改为 `<button type="button">`
- 复用标签页现有按钮类：
  - `kk-category-link`
  - `kk-tag-filter`
- 继续展示：
  - 分类名
  - 文章数
  - 徽标随机色

交互变更后，顶部区不再承担锚点跳转职责，只承担筛选职责。

### 内容区筛选

`visibleSections` 对 `categories` 的计算规则修改为：

- 无 `activeCategory` 时显示全部分类 section
- 有 `activeCategory` 时仅显示对应分类 section

分类 section 头部右侧的 `#` 锚点保留。它属于内容区局部定位能力，不影响顶部筛选交互。

### 选中态视觉

分类页顶部按钮选中态与标签页一致：

- 边框使用 `var(--vp-c-brand-1)`
- 背景使用 `var(--vp-c-brand-soft)`
- 文字使用 `var(--vp-c-brand-1)`
- 文章数徽标继续保留随机色，不切换为品牌色

不再额外展示“当前分类”提示条，状态只通过按钮本身体现。

### 空状态

当 URL 中的 `category` 无法匹配任何 section 时，展示空状态提示：

- `未找到分类 “xxx” 对应的文章。`

该行为与标签页保持一致。

## 影响范围

### 修改文件

- `docs/.vitepress/theme/components/ArchivePage.vue`
- `docs/.vitepress/theme/custom.css`
- `tests/archive-page-structure.test.mjs`

### 不修改文件

- `docs/.vitepress/theme/lib/sugar-archive-data.mjs`
- `docs/.vitepress/theme/lib/category-tree.mjs`
- `docs/categories/index.md`
- `docs/tags/index.md`

## 测试策略

更新 `tests/archive-page-structure.test.mjs`，覆盖以下断言：

- 分类页顶部不再使用锚点跳转
- 分类页顶部使用按钮筛选
- 分类页存在 `activeCategory` 与对应切换逻辑
- 分类页使用 `?category=` 查询参数
- 分类页按钮使用和标签页一致的 class 与选中态样式
- 分类页空状态文案存在

回归验证：

- `node --test tests/archive-page-structure.test.mjs`
- `node --test tests/sugar-theme-baseline.test.mjs`

## 风险与约束

- `ArchivePage.vue` 中分类和标签的状态逻辑会更加接近，改动时要避免把两套参数名混用
- 若 `route.path` 监听只覆盖路径变化，不覆盖查询变化，则仍需依赖 `popstate` 与点击事件同步状态
- 分类页切到筛选后，顶部区将失去“点击即滚动到指定 section”的能力；这是本次有意为之的产品变更

## 验收标准

- `/categories/` 顶部交互与 `/tags/` 顶部一致
- 点击分类后当前页只显示该分类 section
- 再次点击同一分类可取消筛选
- URL 中的 `category` 参数与当前状态同步
- 刷新页面、使用前进后退后状态正确恢复
- 顶部按钮样式与标签页一致
