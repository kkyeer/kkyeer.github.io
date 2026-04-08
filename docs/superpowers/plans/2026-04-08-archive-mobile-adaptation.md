# Archive Mobile Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the categories, tags, and timeline archive pages hold together on narrow mobile screens without changing desktop behavior or archive filtering logic.

**Architecture:** Keep the archive data flow and page routing unchanged, and contain the adaptation to the shared archive page component plus the theme stylesheet. Drive the work with regex-based structure tests that lock in the new mobile layout constraints before updating template hooks and responsive CSS.

**Tech Stack:** VitePress, Vue 3 SFCs, theme-level CSS, Node test runner

---

### Task 1: Lock mobile archive behavior with tests

**Files:**
- Modify: `tests/archive-page-structure.test.mjs`
- Test: `tests/archive-page-structure.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
test('archive mobile styles prevent chip and taxonomy overflow on narrow screens', () => {
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

  assert.match(archivePage, /class="kk-category-link__label"/)
  assert.match(customCss, /@media\s*\(max-width:\s*640px\)[\s\S]*\.kk-category-grid[\s\S]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(customCss, /@media\s*\(max-width:\s*420px\)[\s\S]*\.kk-category-grid[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
  assert.match(customCss, /\.kk-category-link__label\s*{[\s\S]*overflow-wrap:\s*anywhere;/)
  assert.match(customCss, /@media\s*\(max-width:\s*640px\)[\s\S]*\.kk-category-link[\s\S]*white-space:\s*normal;/)
  assert.match(customCss, /@media\s*\(max-width:\s*640px\)[\s\S]*\.kk-archive-post__taxonomy li[\s\S]*white-space:\s*normal;/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: FAIL because the template has no `kk-category-link__label` hook yet and the current mobile CSS still forces the old chip layout.

- [ ] **Step 3: Write minimal implementation**

```vue
<span class="kk-category-link__label">{{ section.name }}</span>
```

```css
@media (max-width: 640px) {
  .kk-category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/archive-page-structure.test.mjs docs/.vitepress/theme/components/ArchivePage.vue docs/.vitepress/theme/custom.css
git commit -m "fix: harden archive mobile layouts"
```

### Task 2: Implement the narrow-screen archive layout guards

**Files:**
- Modify: `docs/.vitepress/theme/components/ArchivePage.vue`
- Modify: `docs/.vitepress/theme/custom.css`
- Test: `tests/archive-page-structure.test.mjs`

- [ ] **Step 1: Add template hooks for responsive chip labels**

```vue
<span class="kk-category-link__label">{{ item.name }}</span>
```

- [ ] **Step 2: Update archive chip and card CSS with mobile overflow guards**

```css
.kk-category-link {
  min-width: 0;
}

.kk-category-link__label {
  min-width: 0;
}
```

- [ ] **Step 3: Add narrow-screen overrides for chip wrapping, section headers, and taxonomy chips**

```css
@media (max-width: 640px) {
  .kk-category-link {
    white-space: normal;
  }

  .kk-archive-post__taxonomy li {
    white-space: normal;
  }
}
```

- [ ] **Step 4: Run archive structure test**

Run: `node --test tests/archive-page-structure.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/archive-page-structure.test.mjs docs/.vitepress/theme/components/ArchivePage.vue docs/.vitepress/theme/custom.css
git commit -m "fix: harden archive mobile layouts"
```
