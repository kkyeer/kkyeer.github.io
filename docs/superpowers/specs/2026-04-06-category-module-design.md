# 分类模块两级类目改造设计

**日期：** 2026-04-06

**目标：**
- 将“一级分类 -> 二级分类”的关系配置从旧的 VuePress 导航配置迁移到 `docs/.vitepress`
- 分类页顶部体现两级类目结构
- 分类页正文按二级分类分组展示文章
- 分类页顶部样式改为方格风格，计数使用稳定的彩色底块
- 分类页不显示右侧目录

## 背景与现状

当前仓库同时保留 VuePress 与 VitePress 配置，但分类页实际由 VitePress 自定义归档页实现：

- 页面入口：`docs/categories/index.md`
- 组件实现：`docs/.vitepress/theme/components/ArchivePage.vue`
- 归档聚合：`docs/.vitepress/theme/lib/sugar-archive-data.mjs`
- 站点导航：`docs/.vitepress/config.mts`

当前分类功能存在以下问题：

1. 一级分类关系仍然写死在旧的 `docs/.vuepress/config.js` 中
2. VitePress 分类页仅支持单层分类聚合，无法表达“一级分类 -> 二级分类”的关系
3. 分类页顶部导航与正文内容都只按单层 term 展示
4. 分类页沿用了通用文档页的右侧目录，不符合归档页的交互预期

## 需求边界

已确认的需求约束如下：

- 二级分类直接复用每篇文章 frontmatter 的 `categories[0]`
- 分类页顶部采用“一级分类卡片 + 其下直接平铺二级分类”的结构
- 点击顶部二级分类后，跳转到正文中对应的二级分类分组
- 分类页正文按“二级分类”分组，不再按一级分类分组

## 设计目标

本次设计遵循以下原则：

1. `.vitepress` 成为分类关系的唯一配置来源
2. 文章 frontmatter 不引入新的分类字段
3. 标签页与时间线页维持现有行为，不因分类改造回归
4. 导航展示、分类页顶部展示、分类页正文分组复用同一份类目关系数据
5. 未登记的二级分类不静默混入页面，优先通过测试暴露配置缺失

## 总体方案

采用“静态关系表 + 动态文章归档”的方案：

1. 在 `docs/.vitepress/theme/lib` 下新增分类关系表文件，维护一级分类与二级分类关系、展示顺序
2. 分类页继续从 VitePress 主题 `pagesData` 动态扫描文章
3. 每篇文章的二级分类取 frontmatter `categories[0]`
4. 根据关系表反查该二级分类所属的一级分类
5. 分类导航下拉、分类页顶部卡片、正文二级分类分组都由这两层数据共同生成

这样可以满足“关系迁移到 `.vitepress`”的要求，同时避免为每篇文章重复维护分类字段。

## 数据模型设计

### 1. 静态分类关系表

新增文件建议：

- `docs/.vitepress/theme/lib/category-tree.mjs`

职责：

- 定义一级分类顺序
- 定义每个一级分类下的二级分类顺序
- 为导航和分类页提供统一数据源
- 提供二级分类反查一级分类的辅助能力

建议数据结构：

```js
export const categoryTree = [
  {
    name: '服务端',
    slug: 'server',
    children: [
      { name: 'JDK源码', slug: 'jdk-source' },
      { name: 'JVM', slug: 'jvm' },
      { name: 'Java进阶', slug: 'java-advanced' },
      { name: '设计模式', slug: 'design-pattern' }
    ]
  }
]
```

同时导出辅助方法：

- `getCategoryNavItems()`
- `findPrimaryCategoryBySecondary(name)`
- `getCategoryColorToken(name)`

其中：

- `slug` 只作为内部稳定标识使用，不替代页面锚点中文展示
- 颜色辅助函数用于计数色块的稳定映射

### 2. 动态分类归档数据

保留现有 `normalizeThemePages()` 的基础行为，但为分类页单独新增聚合函数，例如：

- `buildCategoryArchiveFromTheme(pages, categoryTree)`

建议输出结构：

```ts
type CategoryArchive = {
  topGroups: Array<{
    primaryName: string
    primarySlug: string
    children: Array<{
      name: string
      slug: string
      count: number
    }>
  }>
  sections: Array<{
    name: string
    slug: string
    primaryName: string
    count: number
    posts: Post[]
  }>
}
```

字段说明：

- `topGroups`：供分类页顶部“一级卡片 + 二级方格”使用
- `sections`：供正文按二级分类输出文章列表使用
- `primaryName`：正文区保留一级分类上下文

### 3. 二级分类识别规则

分类场景下统一采用：

- `secondaryCategory = meta.categories?.[0]`

不再将 `categories` 作为多值分类集合参与分组。

### 4. 未登记分类的处理

对关系表未声明的二级分类，采用“测试暴露，不在页面兜底展示”的策略：

- 页面不生成对应分组
- 测试中验证所有分类文章的 `categories[0]` 都能命中关系表

这样可以避免页面出现临时的“未分类”或乱序分组，保持分类体系稳定。

## 页面与组件设计

### 1. 站点导航

修改文件：

- `docs/.vitepress/config.mts`

当前“分类”导航项为单链接：

```ts
{ text: '分类', link: '/categories/' }
```

改造后由关系表生成下拉菜单，结构与旧 VuePress 分类导航保持一致：

- 顶层为“分类”
- 下拉第一层为一级分类
- 下拉第二层为二级分类链接

链接目标仍指向分类页内的二级分类锚点，例如：

- `/categories/#spring`
- `/categories/#jvm`

这样导航与分类页正文锚点保持一致，不需要为每个分类单独生成独立页面。

### 2. 分类页顶部结构

修改文件：

- `docs/.vitepress/theme/components/ArchivePage.vue`

当 `type === 'categories'` 时，不再复用现有单层 `highlightSections` 渲染逻辑，而是使用专用结构：

- 一级分类卡片列表
- 每张卡片内部展示该一级下的全部二级分类入口
- 每个二级分类入口展示名称与文章数
- 点击后二级分类锚点跳转到正文对应 section

示意结构：

```html
<section class="kk-category-top-group">
  <header>服务端</header>
  <div class="kk-category-grid">
    <a href="#jvm">JVM <span>12</span></a>
    <a href="#java-advanced">Java进阶 <span>7</span></a>
  </div>
</section>
```

### 3. 分类页正文结构

分类页正文改为按二级分类输出 section：

- 一个 section 对应一个二级分类
- section 标题展示二级分类名称
- section 副文案展示所属一级分类与文章数
- section 下方列出该二级分类下的全部文章

示意展示文案建议为：

- `中间件 / Spring`
- `8 篇文章`

这样在长页面滚动时仍能保留一级分类上下文。

### 4. 标签页与时间线页

`ArchivePage.vue` 中对 `tags`、`timeline` 的分支保留现有行为：

- 标签页继续使用页内单选过滤
- 时间线页继续按年份分组

分类改造不修改这两个页面的交互模型。

## 样式设计

修改文件：

- `docs/.vitepress/theme/custom.css`

### 1. 顶部导航改造方向

当前分类页顶部使用胶囊型 `chip`。改造后分类页应具有专用样式：

- 一级分类容器使用卡片式布局
- 二级分类入口使用网格布局
- 二级入口整体近似方格
- 圆角控制在 `10px` 到 `14px` 区间
- 保留细边框与浅底色

建议布局：

- 桌面端：多列卡片排列
- 卡片内部：二级分类使用 `grid-template-columns: repeat(auto-fit, minmax(...))`
- 移动端：卡片单列堆叠，二级分类方格缩小但保持点击面积

### 2. 计数色块

需求中的“数字有一个随机彩色的底”采用“稳定伪随机色”实现：

- 根据二级分类名做哈希
- 映射到固定调色板
- 同一分类每次访问保持同一颜色

不采用真正运行时随机值，原因如下：

1. 页面刷新后颜色跳变会降低一致性
2. SSR/静态构建与客户端 hydration 可能出现不一致
3. 稳定色更利于用户形成分类识别

建议使用 6 到 8 个浅彩色背景变量，例如：

- `--kk-chip-tint-1`
- `--kk-chip-tint-2`
- `--kk-chip-tint-3`

### 3. 正文区样式

正文文章列表保留当前归档页的卡片风格，但分类 section 标题需要更清晰地区分层级：

- 二级分类名作为主标题
- 一级分类说明作为弱化副标题
- section 之间保留分隔边框与滚动锚点间距

## 右侧目录关闭策略

修改文件：

- `docs/.vitepress/config.mts`
- 或 `docs/.vitepress/theme/index.ts` 中的布局覆盖逻辑

目标：

- 仅对 `/categories/` 页面关闭右侧 outline
- 普通文章页仍保留目录

推荐优先级：

1. 优先使用页面级 frontmatter 或页面级配置关闭 `outline`
2. 如主题链路不能透传，再在自定义 Layout 中根据 `route.path === '/categories/'` 定向关闭

不建议全局关闭 `outline`，否则会影响正常文档页阅读体验。

## 文件改造范围

预计涉及以下文件：

- 新增：`docs/.vitepress/theme/lib/category-tree.mjs`
- 修改：`docs/.vitepress/config.mts`
- 修改：`docs/.vitepress/theme/lib/sugar-archive-data.mjs`
- 修改：`docs/.vitepress/theme/components/ArchivePage.vue`
- 修改：`docs/.vitepress/theme/custom.css`
- 可选修改：`docs/categories/index.md`
- 修改测试：`tests/sugar-archive-data.test.mjs`
- 修改测试：`tests/archive-page-structure.test.mjs`

## 测试与验证设计

### 1. 数据层测试

在 `tests/sugar-archive-data.test.mjs` 中补充以下校验：

- 分类页只使用 `categories[0]` 作为二级分类归组依据
- 二级分类能够正确反查一级分类
- 分类页顶部分组顺序遵循关系表定义
- 正文 section 顺序遵循关系表定义，而非仅按数量排序
- 关系表未登记的二级分类不会进入有效分组

### 2. 页面结构测试

在 `tests/archive-page-structure.test.mjs` 中补充以下校验：

- 分类页存在分类专用分支，不再复用通用单层分类渲染
- 分类页顶部结构包含一级分类容器与二级分类导航
- 二级分类入口使用锚点跳转正文
- 标签页单选过滤逻辑未回归
- 分类页存在关闭右侧目录的实现入口

### 3. 手工验证

本地验证时重点检查：

1. `vitepress:dev` 下导航“分类”是否正确显示两级下拉
2. `/categories/` 页面顶部是否显示一级卡片与二级方格
3. 点击顶部二级分类是否跳转到对应正文 section
4. 分类页右侧目录是否关闭
5. 标签页、时间线页是否保持当前交互
6. 移动端下二级方格是否仍具备足够点击面积

## 风险与注意事项

### 1. 历史文章分类不一致

若现有文章的 `categories[0]` 与关系表不一致，页面会出现文章缺失。需要通过测试提前暴露。

### 2. 锚点稳定性

中文分类名的 slug 生成必须稳定，避免导航锚点与正文 section `id` 不一致。应统一复用一套 slug 生成方法。

### 3. 配置与内容双边更新

今后新增二级分类时，需要同时：

1. 在文章 frontmatter 中写入新的 `categories[0]`
2. 在 `category-tree.mjs` 中补充该二级分类与所属一级分类

这是本方案有意识保留的约束，用来保证分类体系显式可控。

## 结论

本方案以 `docs/.vitepress` 下的静态分类关系表为中心，将旧 VuePress 中的一级分类配置迁移到 VitePress，并保持文章继续复用 frontmatter `categories[0]` 作为二级分类来源。

改造完成后：

- 导航下拉具备两级分类结构
- 分类页顶部展示一级分类卡片与二级分类方格导航
- 分类页正文按二级分类分组
- 分类页关闭右侧目录
- 标签页与时间线页保持现有能力不回归

该方案改动边界清晰，能够在不重构现有归档体系的前提下完成分类模块升级。
