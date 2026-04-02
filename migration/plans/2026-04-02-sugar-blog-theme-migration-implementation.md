# Sugar Blog Theme Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current custom VitePress theme direction with `@sugarat/theme`, keep site-specific comment/read-count compatibility, and preserve independent `/tags/`, `/timeline/`, and `/categories/` pages.

**Architecture:** Introduce `docs/.vitepress/blog-theme.ts` as the only sugar theme config source, let `docs/.vitepress/config.mts` extend it, and keep `docs/.vitepress/theme/index.ts` as a thin local wrapper for comments, read count, and compatibility hooks. Rebuild archive pages around a shared local helper that normalizes sugar theme article metadata instead of continuing the reco-specific home/archive path.

**Tech Stack:** VitePress, Vue 3 SFC (`<script setup lang="ts">`), `@sugarat/theme`, plain CSS, Valine, LeanCloud visitor, Node built-in test runner (`node:test`)

---

## File Structure

- Create: `docs/.vitepress/blog-theme.ts`
- Modify: `docs/.vitepress/config.mts`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/components/PostMeta.vue`
- Modify: `docs/.vitepress/theme/components/ValineComments.vue`
- Create: `docs/.vitepress/theme/lib/sugar-archive-data.mjs`
- Modify: `docs/.vitepress/theme/components/ArchivePage.vue`
- Modify: `docs/index.md`
- Modify: `docs/tags/index.md`
- Modify: `docs/timeline/index.md`
- Modify: `docs/categories/index.md`
- Modify: `package.json`
- Create: `tests/sugar-theme-baseline.test.mjs`
- Create: `tests/sugar-archive-data.test.mjs`
- Modify: `tests/archive-page-structure.test.mjs`
- Modify: `tests/homepage-route.test.mjs`

### Task 1: Switch The Site Baseline To `@sugarat/theme`

**Files:**
- Create: `tests/sugar-theme-baseline.test.mjs`
- Create: `docs/.vitepress/blog-theme.ts`
- Modify: `docs/.vitepress/config.mts`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `package.json`
- Modify: `docs/index.md`
- Test: `tests/sugar-theme-baseline.test.mjs`

- [ ] **Step 1: Write the failing baseline test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('site extends sugar theme and home route uses native home layout', () => {
  const blogTheme = fs.readFileSync('docs/.vitepress/blog-theme.ts', 'utf8')
  const config = fs.readFileSync('docs/.vitepress/config.mts', 'utf8')
  const themeIndex = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
  const homePage = fs.readFileSync('docs/index.md', 'utf8')
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

  assert.match(blogTheme, /getThemeConfig/)
  assert.match(config, /extends:\s*blogTheme/)
  assert.match(themeIndex, /from '@sugarat\\/theme'/)
  assert.match(homePage, /layout:\\s*home/)
  assert.match(homePage, /blog:/)
  assert.equal(typeof pkg.devDependencies['@sugarat/theme'], 'string')

  assert.doesNotMatch(themeIndex, /from 'vitepress\\/theme'/)
  assert.doesNotMatch(themeIndex, /@theojs\\/lumen/)
  assert.doesNotMatch(homePage, /<BlogHome\\s*\\/>/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/sugar-theme-baseline.test.mjs`  
Expected: FAIL because `docs/.vitepress/blog-theme.ts` does not exist, `docs/index.md` still mounts `<BlogHome />`, and `package.json` does not yet pin `@sugarat/theme`.

- [ ] **Step 3: Write the minimal implementation**

```ts
// docs/.vitepress/blog-theme.ts
import { getThemeConfig } from '@sugarat/theme/node'

export const blogTheme = getThemeConfig({
  author: 'kkyeer',
  themeColor: 'el-blue',
  home: {
    pageSize: 8,
    blogInfoCollapsible: true
  },
  homeTags: {
    title: '🏷 标签',
    limit: 24,
    sort: 'desc',
    showCount: true
  },
  footer: {
    copyright: 'Copyright © 2019-present kkyeer',
    icpRecord: {
      name: '浙ICP备2023021217号',
      link: 'http://beian.miit.gov.cn'
    }
  }
})
```

```ts
// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress'
import { blogTheme } from './blog-theme'

export default defineConfig({
  extends: blogTheme,
  lang: 'zh-CN',
  title: '一水轩',
  description: 'Born for code',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '分类', link: '/categories/' },
      { text: '标签', link: '/tags/' },
      { text: '时间线', link: '/timeline/' },
      { text: '友链', link: '/friends/' },
      { text: 'GitHub', link: 'https://github.com/kkyeer' }
    ]
  }
})
```

```ts
// docs/.vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import SugarTheme from '@sugarat/theme'

const theme: Theme = {
  ...SugarTheme
}

export default theme
```

```md
---
layout: home
blog:
  name: 一水轩
  motto: Born for code
  inspiring:
    - 技术随笔与问题复盘
    - VuePress 向 VitePress 迁移记录
  pageSize: 8
---
```

```json
{
  "devDependencies": {
    "@sugarat/theme": "0.5.17"
  }
}
```

- [ ] **Step 4: Run the baseline test again**

Run: `node --test tests/sugar-theme-baseline.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/blog-theme.ts docs/.vitepress/config.mts docs/.vitepress/theme/index.ts docs/index.md package.json tests/sugar-theme-baseline.test.mjs
git commit -m "feat: switch site baseline to sugar theme"
```

### Task 2: Reconnect Site-Specific Extras Without Rebuilding The Theme

**Files:**
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/components/PostMeta.vue`
- Modify: `docs/.vitepress/theme/components/ValineComments.vue`
- Test: `tests/sugar-theme-baseline.test.mjs`

- [ ] **Step 1: Extend the baseline test with local wrapper assertions**

Append this test:

```js
test('local wrapper keeps read count and comments without reintroducing custom footer layout', () => {
  const themeIndex = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
  const postMeta = fs.readFileSync('docs/.vitepress/theme/components/PostMeta.vue', 'utf8')
  const comments = fs.readFileSync('docs/.vitepress/theme/components/ValineComments.vue', 'utf8')

  assert.match(themeIndex, /ValineComments/)
  assert.match(themeIndex, /PostMeta/)
  assert.match(themeIndex, /doc-after/)
  assert.match(themeIndex, /doc-before/)
  assert.doesNotMatch(themeIndex, /SiteFooter/)

  assert.match(postMeta, /AccessNumber/)
  assert.doesNotMatch(postMeta, /分类/)
  assert.doesNotMatch(postMeta, /标签/)
  assert.match(comments, /route\\.path\\.startsWith\\('\\/views\\/'\\)/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/sugar-theme-baseline.test.mjs`  
Expected: FAIL because the theme wrapper does not yet inject `PostMeta` / `ValineComments`, and `PostMeta.vue` still duplicates category/tag metadata.

- [ ] **Step 3: Implement the minimal wrapper and simplify post meta**

```ts
// docs/.vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import { h } from 'vue'
import SugarTheme from '@sugarat/theme'
import './custom.css'

import PostMeta from './components/PostMeta.vue'
import ValineComments from './components/ValineComments.vue'
import ArchivePage from './components/ArchivePage.vue'
import FriendLinksPage from './components/FriendLinksPage.vue'

const theme: Theme = {
  ...SugarTheme,
  Layout() {
    return h(SugarTheme.Layout, null, {
      'doc-before': () => h(PostMeta),
      'doc-after': () => h(ValineComments)
    })
  },
  enhanceApp({ app, ...rest }) {
    SugarTheme.enhanceApp?.({ app, ...rest })
    app.component('ArchivePage', ArchivePage)
    app.component('FriendLinksPage', FriendLinksPage)
  }
}

export default theme
```

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

import AccessNumber from './AccessNumber.vue'

const { page } = useData()
const route = useRoute()
const isPost = computed(() => route.path.startsWith('/views/'))
</script>

<template>
  <div v-if="isPost" class="kk-post-meta">
    <span class="kk-post-meta__item">
      <strong>阅读</strong>
      <AccessNumber :path="route.path" :title="page.title" />
    </span>
  </div>
</template>
```

- [ ] **Step 4: Run the wrapper test again**

Run: `node --test tests/sugar-theme-baseline.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/index.ts docs/.vitepress/theme/components/PostMeta.vue docs/.vitepress/theme/components/ValineComments.vue tests/sugar-theme-baseline.test.mjs
git commit -m "feat: reconnect local comments and read count on sugar theme"
```

### Task 3: Rebuild Independent Archive Pages On Top Of Theme Metadata

**Files:**
- Create: `docs/.vitepress/theme/lib/sugar-archive-data.mjs`
- Create: `tests/sugar-archive-data.test.mjs`
- Modify: `docs/.vitepress/theme/components/ArchivePage.vue`
- Modify: `docs/tags/index.md`
- Modify: `docs/timeline/index.md`
- Modify: `docs/categories/index.md`
- Test: `tests/sugar-archive-data.test.mjs`

- [ ] **Step 1: Write the failing archive data tests**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeThemePages,
  buildArchiveSectionsFromTheme
} from '../docs/.vitepress/theme/lib/sugar-archive-data.mjs'

const pages = [
  {
    route: '/views/a',
    meta: {
      title: 'A',
      date: '2025-03-03',
      description: 'A desc',
      tag: ['Java', 'JVM'],
      categories: ['后端']
    }
  },
  {
    route: '/views/b',
    meta: {
      title: 'B',
      date: '2024-01-02',
      description: 'B desc',
      tag: ['Java'],
      categories: ['后端']
    }
  }
]

test('normalizeThemePages returns archive-safe post records', () => {
  const data = normalizeThemePages(pages)
  assert.equal(data.length, 2)
  assert.equal(data[0].title, 'A')
  assert.deepEqual(data[0].tags, ['Java', 'JVM'])
})

test('buildArchiveSectionsFromTheme groups timeline by year', () => {
  const sections = buildArchiveSectionsFromTheme(pages, 'timeline')
  assert.equal(sections[0].name, '2025')
  assert.equal(sections[1].name, '2024')
})

test('buildArchiveSectionsFromTheme groups tags by term count', () => {
  const sections = buildArchiveSectionsFromTheme(pages, 'tags')
  assert.equal(sections[0].name, 'Java')
  assert.equal(sections[0].count, 2)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/sugar-archive-data.test.mjs`  
Expected: FAIL because `docs/.vitepress/theme/lib/sugar-archive-data.mjs` does not exist yet.

- [ ] **Step 3: Write the minimal archive helper and wire `ArchivePage.vue` to it**

```js
// docs/.vitepress/theme/lib/sugar-archive-data.mjs
function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
}

export function normalizeThemePages(pages) {
  return pages
    .filter((page) => page?.meta?.title && page?.meta?.date && page?.meta?.hidden !== true)
    .map((page) => ({
      title: page.meta.title,
      url: `${page.route}.html`.replace(/\/index\.html$/, '/'),
      date: page.meta.date,
      timestamp: Date.parse(page.meta.date) || 0,
      excerpt: page.meta.description || '',
      categories: Array.isArray(page.meta.categories) ? page.meta.categories : [],
      tags: Array.isArray(page.meta.tag) ? page.meta.tag : []
    }))
    .sort((left, right) => right.timestamp - left.timestamp)
}

export function buildArchiveSectionsFromTheme(pages, type) {
  const posts = normalizeThemePages(pages)
  if (type === 'timeline') {
    const groups = new Map()
    for (const post of posts) {
      const year = String(post.date).slice(0, 4) || '未知'
      groups.set(year, [...(groups.get(year) || []), post])
    }
    return [...groups.entries()].map(([name, items]) => ({ name, slug: slugify(name), count: items.length, posts: items }))
  }

  const key = type === 'categories' ? 'categories' : 'tags'
  const groups = new Map()
  for (const post of posts) {
    for (const item of post[key]) {
      groups.set(item, [...(groups.get(item) || []), post])
    }
  }
  return [...groups.entries()]
    .map(([name, items]) => ({ name, slug: slugify(name), count: items.length, posts: items }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-CN'))
}
```

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useArticles } from '@sugarat/theme'
import { buildArchiveSectionsFromTheme } from '../lib/sugar-archive-data.mjs'

const props = defineProps<{ type: 'categories' | 'tags' | 'timeline' }>()
const pages = useArticles()
const sections = computed(() => buildArchiveSectionsFromTheme(pages.value, props.type))
</script>
```

- [ ] **Step 4: Run archive helper tests**

Run: `node --test tests/sugar-archive-data.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/lib/sugar-archive-data.mjs docs/.vitepress/theme/components/ArchivePage.vue docs/tags/index.md docs/timeline/index.md docs/categories/index.md tests/sugar-archive-data.test.mjs
git commit -m "feat: rebuild archive pages on sugar theme data"
```

### Task 4: Remove Reco-First Home Assumptions And Verify Route Behavior

**Files:**
- Modify: `tests/homepage-route.test.mjs`
- Modify: `tests/archive-page-structure.test.mjs`
- Modify: `docs/README.md`
- Modify: `README.md`
- Verify: `docs/.vitepress/dist`

- [ ] **Step 1: Update the route and archive assertions to the new baseline**

```js
// tests/homepage-route.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('homepage uses native sugar home layout instead of BlogHome component', () => {
  const source = fs.readFileSync('docs/index.md', 'utf8')
  assert.match(source, /layout:\\s*home/)
  assert.match(source, /blog:/)
  assert.doesNotMatch(source, /<BlogHome\\s*\\/>/)
})
```

```js
// tests/archive-page-structure.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('archive page still serves categories, tags, and timeline routes under local wrapper', () => {
  const themeIndex = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')

  assert.match(themeIndex, /ArchivePage/)
  assert.match(archivePage, /type: 'categories' \\| 'tags' \\| 'timeline'/)
  assert.match(archivePage, /useArticles/)
  assert.match(archivePage, /buildArchiveSectionsFromTheme/)
})
```

- [ ] **Step 2: Run the focused regression tests**

Run: `node --test tests/sugar-theme-baseline.test.mjs tests/sugar-archive-data.test.mjs tests/homepage-route.test.mjs tests/archive-page-structure.test.mjs`  
Expected: PASS after the implementation above.

- [ ] **Step 3: Run build verification**

Run: `npm run vitepress:build`  
Expected: PASS and generate `docs/.vitepress/dist` with `index.html`, `feed.xml`, and `sitemap.xml`.

- [ ] **Step 4: Update human-facing docs to match the new baseline**

```md
## Current Direction

The active migration path is now:

- VitePress
- `@sugarat/theme` baseline
- local archive pages for `/categories/`, `/tags/`, `/timeline/`
- Valine + LeanCloud visitor kept as compatibility layer
```

Use this wording style in:

- `README.md`
- `docs/README.md`

- [ ] **Step 5: Commit**

```bash
git add README.md docs/README.md tests/homepage-route.test.mjs tests/archive-page-structure.test.mjs
git commit -m "docs: align migration docs with sugar theme baseline"
```

## Self-Review

- Spec coverage: the plan covers theme baseline, homepage switch, local compatibility, independent archive pages, and documentation alignment.
- Placeholder scan: no `TODO` / `TBD` / “implement later” placeholders remain.
- Type consistency: the archive helper uses one normalized data shape for categories, tags, and timeline, avoiding separate data contracts.

