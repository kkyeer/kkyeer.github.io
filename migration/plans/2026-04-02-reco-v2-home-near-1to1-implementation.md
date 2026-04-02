# Reco v2 Home Near-1:1 Implementation Plan

> Status 2026-04-02: This plan belongs to the previous reco-home implementation path. The active execution baseline is [2026-04-02-sugar-blog-theme-migration-implementation.md](./2026-04-02-sugar-blog-theme-migration-implementation.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the VitePress home page to match reco v2 near-1:1 style while keeping existing data sources and removing non-reco home sections.

**Architecture:** Keep homepage as a single `BlogHome.vue` component, but recompose it into `Hero + PostStream + Sidebar`. Drive all data from existing `posts` and `blog-data.mjs` helpers. Align styling through targeted `kk-home-*` CSS rewrites without introducing new theme dependencies.

**Tech Stack:** VitePress, Vue 3 SFC (`<script setup lang="ts">`), plain CSS, Node built-in test runner (`node:test`)

---

### Task 1: Add Reco v2 Home Structure Guardrail Test (TDD Red)

**Files:**
- Create: `tests/home-reco-v2-structure.test.mjs`
- Test: `tests/home-reco-v2-structure.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('BlogHome uses reco v2 shell, 12-post stream, and removed legacy home blocks', () => {
  const source = fs.readFileSync('docs/.vitepress/theme/components/BlogHome.vue', 'utf8')

  assert.match(source, /buildRecentPosts\(posts,\s*12\)/)
  assert.match(source, /kk-home-hero/)
  assert.match(source, /kk-home-hero__stats/)
  assert.match(source, /kk-home-stream__list/)

  assert.match(source, />站点信息</)
  assert.match(source, />分类</)
  assert.match(source, />标签</)

  assert.doesNotMatch(source, />入口</)
  assert.doesNotMatch(source, /迁移进度/)
  assert.doesNotMatch(source, /站点入口/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/home-reco-v2-structure.test.mjs`  
Expected: FAIL (current `buildRecentPosts(posts, 14)` and missing `kk-home-hero__stats` / `kk-home-stream__list` markers).

- [ ] **Step 3: Commit red test**

```bash
git add tests/home-reco-v2-structure.test.mjs
git commit -m "test: add reco v2 homepage structure guardrails"
```

### Task 2: Rebuild BlogHome.vue To Reco v2 Near-1:1 Template (TDD Green)

**Files:**
- Modify: `docs/.vitepress/theme/components/BlogHome.vue`
- Test: `tests/home-reco-v2-structure.test.mjs`

- [ ] **Step 1: Implement minimal template/script changes to satisfy new structure test**

```vue
<script setup lang="ts">
import { computed } from 'vue'

import { posts } from '../lib/posts'
import { buildCategoryHighlights, buildRecentPosts, buildTagHighlights } from '../lib/blog-data.mjs'

const latestPosts = computed(() => buildRecentPosts(posts, 12))
const categoryHighlights = computed(() => buildCategoryHighlights(posts, 10))
const tagHighlights = computed(() => buildTagHighlights(posts, 24))
const totalCategories = computed(() => buildCategoryHighlights(posts, Number.POSITIVE_INFINITY).length)
const totalTags = computed(() => buildTagHighlights(posts, Number.POSITIVE_INFINITY).length)
const latestDate = computed(() => posts[0]?.date || '未知')
</script>

<template>
  <section class="kk-home-v2">
    <article class="kk-home-hero">
      <p class="kk-home-hero__eyebrow">Blog</p>
      <h1 class="kk-home-hero__title">一水轩</h1>
      <p class="kk-home-hero__desc">Born for code · 技术随笔与问题复盘</p>
      <ul class="kk-home-hero__stats">
        <li><span>文章</span><strong>{{ posts.length }}</strong></li>
        <li><span>分类</span><strong>{{ totalCategories }}</strong></li>
        <li><span>标签</span><strong>{{ totalTags }}</strong></li>
        <li><span>最近更新</span><strong>{{ latestDate }}</strong></li>
      </ul>
    </article>

    <section class="kk-home-blog">
      <main class="kk-home-blog__main">
        <ul class="kk-home-stream__list">
          <li v-for="post in latestPosts" :key="post.url" class="kk-home-stream__item">
            <a class="kk-home-stream__title" :href="post.url">{{ post.title }}</a>
            <div class="kk-home-stream__meta">
              <span>{{ post.date }}</span>
              <span v-if="post.categories.length"> · {{ post.categories.join(' / ') }}</span>
            </div>
            <p v-if="post.excerpt" class="kk-home-stream__excerpt">{{ post.excerpt }}</p>
          </li>
        </ul>
      </main>

      <aside class="kk-home-blog__aside">
        <article class="kk-home-side">
          <h2 class="kk-home-side__title">站点信息</h2>
          <ul class="kk-home-side__summary">
            <li><span>文章</span><strong>{{ posts.length }}</strong></li>
            <li><span>分类</span><strong>{{ totalCategories }}</strong></li>
            <li><span>标签</span><strong>{{ totalTags }}</strong></li>
            <li><span>最近更新</span><strong>{{ latestDate }}</strong></li>
          </ul>
        </article>

        <article class="kk-home-side">
          <div class="kk-home-side__head">
            <h2 class="kk-home-side__title">分类</h2>
            <a href="/categories/">全部</a>
          </div>
          <ul class="kk-home-side__list">
            <li v-for="item in categoryHighlights" :key="item.slug" class="kk-home-side__list-item">
              <a class="kk-home-side__list-link" :href="`/categories/#${item.slug}`">
                <span class="text">{{ item.name }}</span>
                <span class="num">{{ item.count }}</span>
              </a>
            </li>
          </ul>
        </article>

        <article class="kk-home-side">
          <div class="kk-home-side__head">
            <h2 class="kk-home-side__title">标签</h2>
            <a href="/tags/">全部</a>
          </div>
          <div class="kk-home-side__tags">
            <a v-for="item in tagHighlights" :key="item.slug" class="kk-home-side__tag" :href="`/tags/#${item.slug}`">
              {{ item.name }}
            </a>
          </div>
        </article>
      </aside>
    </section>
  </section>
</template>
```

- [ ] **Step 2: Run structure test to verify it passes**

Run: `node --test tests/home-reco-v2-structure.test.mjs`  
Expected: PASS.

- [ ] **Step 3: Run route and blog-data regression tests**

Run: `node --test tests/homepage-route.test.mjs tests/blog-data.test.mjs`  
Expected: PASS.

- [ ] **Step 4: Commit component changes**

```bash
git add docs/.vitepress/theme/components/BlogHome.vue tests/home-reco-v2-structure.test.mjs
git commit -m "feat: rebuild home template to reco v2 near-1to1 layout"
```

### Task 3: Add CSS Guardrail Test Then Align Home Styles (TDD Red → Green)

**Files:**
- Create: `tests/home-reco-v2-css.test.mjs`
- Modify: `docs/.vitepress/theme/custom.css`
- Test: `tests/home-reco-v2-css.test.mjs`

- [ ] **Step 1: Write failing CSS structure test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('home css provides reco v2 hero/stream selectors and removes legacy banner selectors', () => {
  const css = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

  assert.match(css, /\.kk-home-v2\b/)
  assert.match(css, /\.kk-home-hero__stats\b/)
  assert.match(css, /\.kk-home-stream__list\b/)
  assert.match(css, /\.kk-home-stream__title::after\b/)
  assert.match(css, /\.kk-home-blog__aside\b/)

  assert.doesNotMatch(css, /\.kk-home-banner\b/)
  assert.doesNotMatch(css, /\.kk-home-post-list\b/)
  assert.doesNotMatch(css, /\.kk-home-post__title\b/)
})
```

- [ ] **Step 2: Run CSS test to verify it fails**

Run: `node --test tests/home-reco-v2-css.test.mjs`  
Expected: FAIL (legacy selectors still exist, new selectors missing).

- [ ] **Step 3: Implement minimal CSS rewrite for reco v2 near-1:1 home**

```css
.kk-home-v2 {
  display: grid;
  gap: 18px;
  margin-top: 8px;
}

.kk-home-hero {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, rgba(93, 103, 232, 0.14), rgba(93, 103, 232, 0.03));
}

.kk-home-hero__stats {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.kk-home-stream__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.kk-home-stream__item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  padding: 16px 18px;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.kk-home-stream__item:hover {
  border-color: rgba(93, 103, 232, 0.38);
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.12);
}

.kk-home-stream__title {
  position: relative;
  color: var(--vp-c-text-1);
  font-size: 20px;
  font-weight: 600;
  text-decoration: none;
}

.kk-home-stream__title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 100%;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  background: var(--vp-c-brand-1);
  transition: transform 0.2s ease;
}

.kk-home-stream__title:hover::after {
  transform: scaleX(1);
}
```

Also remove legacy homepage blocks/selectors no longer used:

```css
/* remove old selectors */
/* .kk-home-banner, .kk-home-banner__eyebrow, .kk-home-post-list, .kk-home-post, .kk-home-post__* */
```

- [ ] **Step 4: Run CSS test to verify it passes**

Run: `node --test tests/home-reco-v2-css.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit CSS changes**

```bash
git add docs/.vitepress/theme/custom.css tests/home-reco-v2-css.test.mjs
git commit -m "style: align homepage css to reco v2 near-1to1"
```

### Task 4: Full Verification and Final Regression

**Files:**
- Test: `tests/home-reco-v2-structure.test.mjs`
- Test: `tests/home-reco-v2-css.test.mjs`
- Test: `tests/homepage-route.test.mjs`
- Test: `tests/blog-data.test.mjs`

- [ ] **Step 1: Run full targeted test set**

Run:

```bash
node --test \
  tests/home-reco-v2-structure.test.mjs \
  tests/home-reco-v2-css.test.mjs \
  tests/homepage-route.test.mjs \
  tests/blog-data.test.mjs
```

Expected: All PASS.

- [ ] **Step 2: Build site to verify no theme/runtime break**

Run: `npm run vitepress:build`  
Expected: build success with generated static output and no fatal errors.

- [ ] **Step 3: Commit verification-ready state**

```bash
git add docs/.vitepress/theme/components/BlogHome.vue docs/.vitepress/theme/custom.css tests/home-reco-v2-structure.test.mjs tests/home-reco-v2-css.test.mjs
git commit -m "test: verify reco v2 homepage near-1to1 implementation"
```

## Plan Self-Review

- Spec coverage:
  - `Hero + PostStream + Sidebar` covered by Task 2.
  - 删除“迁移进度/站点入口” covered by Task 1 + Task 2.
  - Sidebar 收敛为三模块 covered by Task 1 + Task 2.
  - reco v2 near-1:1 style covered by Task 3.
  - 自动化回归与构建 covered by Task 4.
- Placeholder scan:
  - No `TBD/TODO/implement later` markers.
  - All tasks include concrete file paths, code snippets, commands, and expected outcomes.
- Consistency check:
  - Class names used by tests (`kk-home-hero__stats`, `kk-home-stream__list`) are the same names planned in `BlogHome.vue` and CSS.
