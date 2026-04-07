# Category Archive Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the `/categories/` archive top area from anchor navigation to in-page single-select filtering with `?category=` URL state, matching the `/tags/` page interaction model.

**Architecture:** Keep all behavior inside `ArchivePage.vue` by adding a category-specific active state that mirrors the existing tag filter flow. Reuse the current category archive data and button styling, update only the top-nav rendering and `visibleSections` filtering, and lock the behavior with focused structure tests.

**Tech Stack:** VitePress, Vue 3 `<script setup>`, Node built-in test runner, project custom CSS

---

### Task 1: Lock The New Category Filter Contract In Tests

**Files:**
- Modify: `docs/.vitepress/theme/components/ArchivePage.vue`
- Test: `tests/archive-page-structure.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
test('archive categories page uses in-page single-select filtering with category query sync', () => {
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

  assert.match(archivePage, /const\s+activeCategory\s*=\s*ref\(''\)/)
  assert.match(archivePage, /function\s+syncActiveCategory\(\)/)
  assert.match(archivePage, /function\s+syncCategoryQuery\(category: string\)/)
  assert.match(archivePage, /function\s+toggleCategoryFilter\(category: string\)/)
  assert.match(archivePage, /searchParams\.get\('category'\)/)
  assert.match(archivePage, /searchParams\.set\('category',\s*category\)/)
  assert.match(archivePage, /searchParams\.delete\('category'\)/)
  assert.match(archivePage, /props\.type === 'categories' && activeCategory\.value/)
  assert.match(archivePage, /@click=\"toggleCategoryFilter\(item.name\)\"/)
  assert.match(archivePage, /:aria-pressed=\"props.type === 'categories' && activeCategory === item.name\"/)
  assert.match(archivePage, /class=\"kk-category-link kk-tag-filter\"/)
  assert.match(customCss, /\.kk-tag-filter\.is-active\s*{[\s\S]*border-color:\s*var\(--vp-c-brand-1\);/)
  assert.match(customCss, /\.kk-tag-filter\.is-active\s*{[\s\S]*background:\s*var\(--vp-c-brand-soft\);/)
  assert.match(customCss, /\.kk-tag-filter\.is-active\s*{[\s\S]*color:\s*var\(--vp-c-brand-1\);/)
  assert.match(archivePage, /未找到分类 “\{\{ activeCategory \}\}” 对应的文章。/)
  assert.doesNotMatch(archivePage, /:href=\"`#\$\{item\.slug\}`\"/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: FAIL because category state/query/filter assertions are not implemented yet.

- [ ] **Step 3: Commit**

```bash
git add tests/archive-page-structure.test.mjs
git commit -m "test: cover category archive filtering"
```

### Task 2: Add Category Filter State And URL Sync

**Files:**
- Modify: `docs/.vitepress/theme/components/ArchivePage.vue`
- Test: `tests/archive-page-structure.test.mjs`

- [ ] **Step 1: Write the failing implementation-facing test if Task 1 was narrowed**

```js
assert.match(archivePage, /const\s+activeCategory\s*=\s*ref\(''\)/)
assert.match(archivePage, /function\s+toggleCategoryFilter\(category: string\)/)
assert.match(archivePage, /props\.type === 'categories' && activeCategory\.value/)
```

- [ ] **Step 2: Run test to verify it fails for category state logic**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: FAIL with missing `activeCategory` or category query logic.

- [ ] **Step 3: Write minimal implementation**

```ts
const activeCategory = ref('')

function syncActiveCategory() {
  if (!inBrowser || props.type !== 'categories') {
    activeCategory.value = ''
    return
  }

  activeCategory.value = new URLSearchParams(window.location.search).get('category')?.trim() ?? ''
}

function syncCategoryQuery(category: string) {
  if (!inBrowser || props.type !== 'categories') {
    return
  }

  const nextUrl = new URL(window.location.href)

  if (category) {
    nextUrl.searchParams.set('category', category)
  } else {
    nextUrl.searchParams.delete('category')
  }

  window.history.pushState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
}

function toggleCategoryFilter(category: string) {
  if (props.type !== 'categories') {
    return
  }

  const nextCategory = activeCategory.value === category ? '' : category
  activeCategory.value = nextCategory
  syncCategoryQuery(nextCategory)
}
```

- [ ] **Step 4: Extend mount, unmount, and route sync hooks**

```ts
onMounted(() => {
  syncActiveTag()
  syncActiveCategory()
  if (inBrowser) {
    window.addEventListener('popstate', syncActiveTag)
    window.addEventListener('popstate', syncActiveCategory)
  }
})

onUnmounted(() => {
  if (inBrowser) {
    window.removeEventListener('popstate', syncActiveTag)
    window.removeEventListener('popstate', syncActiveCategory)
  }
})

watch(
  () => route.path,
  () => {
    syncActiveTag()
    syncActiveCategory()
  }
)
```

- [ ] **Step 5: Update visible section selection**

```ts
const visibleSections = computed(() => {
  if (props.type === 'categories' && activeCategory.value) {
    return categoryArchive.value.sections.filter((section) => section.name === activeCategory.value)
  }
  if (props.type === 'categories') {
    return categoryArchive.value.sections
  }
  if (props.type === 'tags' && activeTag.value) {
    return sections.value.filter((section) => section.name === activeTag.value)
  }
  return sections.value
})
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: PASS for category state/query assertions.

- [ ] **Step 7: Commit**

```bash
git add docs/.vitepress/theme/components/ArchivePage.vue tests/archive-page-structure.test.mjs
git commit -m "feat: sync category archive filter state"
```

### Task 3: Convert Category Top Nav To Button Filtering

**Files:**
- Modify: `docs/.vitepress/theme/components/ArchivePage.vue`
- Modify: `docs/.vitepress/theme/custom.css`
- Test: `tests/archive-page-structure.test.mjs`

- [ ] **Step 1: Write the failing template/style test**

```js
assert.match(archivePage, /v-else-if=\"props.type === 'categories'\"[\s\S]*<button/)
assert.match(archivePage, /class=\"kk-category-link kk-tag-filter\"/)
assert.match(archivePage, /:class=\"\{ 'is-active': activeCategory === item.name \}\"/)
assert.match(archivePage, /@click=\"toggleCategoryFilter\(item.name\)\"/)
assert.match(archivePage, /:aria-pressed=\"props.type === 'categories' && activeCategory === item.name\"/)
assert.doesNotMatch(archivePage, /:href=\"`#\$\{item\.slug\}`\"/)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: FAIL because the category top-nav still renders anchors.

- [ ] **Step 3: Write minimal template changes**

```vue
<nav v-else-if="props.type === 'categories'" class="kk-category-groups" aria-label="分类快速导航">
  <div class="kk-category-grid">
    <button
      v-for="item in categoryLinks"
      :key="item.slug"
      class="kk-category-link kk-tag-filter"
      :class="{ 'is-active': activeCategory === item.name }"
      type="button"
      :aria-pressed="props.type === 'categories' && activeCategory === item.name"
      @click="toggleCategoryFilter(item.name)"
    >
      <span>{{ item.name }}</span>
      <span class="kk-category-link__count" :style="{ backgroundColor: `var(--${item.colorToken})` }">
        {{ item.count }}
      </span>
    </button>
  </div>
</nav>
```

- [ ] **Step 4: Add category empty-state rendering**

```vue
<p v-if="props.type === 'categories' && activeCategory && !visibleSections.length" class="kk-archive-page__empty">
  未找到分类 “{{ activeCategory }}” 对应的文章。
</p>
```

- [ ] **Step 5: Keep only the shared active visual state**

```css
.kk-tag-filter.is-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: PASS with category buttons and empty-state assertions.

- [ ] **Step 7: Commit**

```bash
git add docs/.vitepress/theme/components/ArchivePage.vue docs/.vitepress/theme/custom.css tests/archive-page-structure.test.mjs
git commit -m "feat: filter categories archive in page"
```

### Task 4: Run Regression Verification And Finalize

**Files:**
- Modify: `docs/.vitepress/theme/components/ArchivePage.vue`
- Modify: `docs/.vitepress/theme/custom.css`
- Test: `tests/archive-page-structure.test.mjs`

- [ ] **Step 1: Run focused archive regression checks**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: PASS with 0 failures.

- [ ] **Step 2: Run theme baseline verification**

Run: `node --test tests/sugar-theme-baseline.test.mjs`
Expected: PASS with 0 failures.

- [ ] **Step 3: Review the final diff for scope**

Run: `git diff -- docs/.vitepress/theme/components/ArchivePage.vue docs/.vitepress/theme/custom.css tests/archive-page-structure.test.mjs`
Expected: Only category filter state, template interaction, and test updates appear.

- [ ] **Step 4: Commit the final integrated change**

```bash
git add docs/.vitepress/theme/components/ArchivePage.vue docs/.vitepress/theme/custom.css tests/archive-page-structure.test.mjs
git commit -m "feat: align category archive filtering with tags"
```
