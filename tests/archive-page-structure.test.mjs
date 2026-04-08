import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('archive page still serves categories, tags, and timeline routes under local wrapper', () => {
  const themeIndex = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')
  const archiveData = fs.readFileSync('docs/.vitepress/theme/lib/sugar-archive-data.mjs', 'utf8')
  const config = fs.readFileSync('docs/.vitepress/config.mts', 'utf8')
  const categoriesPage = fs.readFileSync('docs/categories/index.md', 'utf8')

  assert.match(themeIndex, /ArchivePage/)
  assert.match(archivePage, /type: 'categories' \| 'tags' \| 'timeline'/)
  assert.match(archivePage, /useData/)
  assert.match(archivePage, /pagesData/)
  assert.match(archivePage, /buildArchiveSectionsFromTheme/)
  assert.doesNotMatch(archivePage, /useArticles/)

  assert.match(archiveData, /buildCategoryArchiveFromTheme/)
  assert.match(
    archiveData,
    /if\s*\(\s*type\s*===\s*'categories'\s*\)\s*{[\s\S]*?return\s+buildCategoryArchiveFromTheme\(pages\)\.sections/
  )

  assert.match(config, /import\s+\{[^}]*getCategoryNavItems[^}]*\}\s+from '\.\/theme\/lib\/category-tree\.mjs'/)
  assert.match(config, /text: '分类',\s*items: getCategoryNavItems\(\)/)

  assert.match(categoriesPage, /outline:\s*false/) // ensure outline flag is disabled
  assert.match(categoriesPage, /<ArchivePage\s+type="categories"\s*\/>/)
})

test('archive categories page uses dedicated category archive pipeline and square grid classes', () => {
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

  assert.match(
    archivePage,
    /const\s+categoryArchive\s*=\s*computed\(\s*\(\)\s*=>\s*buildCategoryArchiveFromTheme\(pagesData\.value,\s*categoryTree\)\s*\)/
  )
  assert.match(
    archivePage,
    /const\s+categoryLinks\s*=\s*computed\(\s*\(\)\s*=>[\s\S]*categoryArchive\.value\.topGroups\.flatMap/
  )
  assert.match(archivePage, /visibleSections[\s\S]*props\.type === 'categories'[\s\S]*categoryArchive\.value\.sections/)
  assert.match(archivePage, /v-else-if="props.type === 'categories'"/)
  assert.match(archivePage, /<nav[\s\S]*class="kk-category-groups"[\s\S]*aria-label=/)
  assert.match(archivePage, /v-for="item in categoryLinks"/)
  assert.match(archivePage, /class="kk-category-groups"/)
  assert.doesNotMatch(archivePage, /kk-category-group__title/)
  assert.doesNotMatch(archivePage, /class="kk-category-group"/)
  assert.match(archivePage, /class="kk-category-grid"/)
  assert.match(archivePage, /class="kk-category-link kk-tag-filter"/)
  assert.match(archivePage, /class="kk-category-link__count"/)
  assert.match(
    archivePage,
    /class="kk-category-link__count"[\s\S]*:style="\{\s*backgroundColor:\s*`var\(--\$\{item\.colorToken\}\)`\s*\}"/
  )

  assert.match(customCss, /--kk-category-tint-1:/)
  assert.match(customCss, /--kk-category-tint-2:/)
  assert.match(customCss, /--kk-category-tint-3:/)
  assert.match(customCss, /--kk-category-tint-4:/)
  assert.match(customCss, /--kk-category-tint-5:/)
  assert.match(customCss, /--kk-category-tint-6:/)
  assert.match(
    customCss,
    /\.VPFlyout\s+\.VPMenuLink\s+\.link\s*,[\s\S]*\.VPNavScreenMenuGroupLink\s*{[\s\S]*font-size:\s*12px;[\s\S]*line-height:\s*28px;/
  )
  assert.match(customCss, /\.kk-category-groups\s*{/)
  assert.match(customCss, /\.kk-category-grid\s*{[\s\S]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(/)
  assert.match(customCss, /\.kk-category-link\s*{[\s\S]*min-height:\s*38px/)
  assert.match(customCss, /\.kk-category-link\s*{[\s\S]*display:\s*inline-flex/)
  assert.match(customCss, /\.kk-category-link\s*{[\s\S]*align-items:\s*center/)
  assert.match(customCss, /\.kk-category-link\s*{[\s\S]*justify-content:\s*center/)
  assert.doesNotMatch(customCss, /\.kk-category-link\s*{[\s\S]*aspect-ratio:\s*1\s*\/\s*1/)
  assert.match(customCss, /\.kk-category-link__count\s*{[\s\S]*border-radius:\s*999px/)
  assert.match(customCss, /\.kk-category-link__count\s*{[\s\S]*background:/)
  assert.match(customCss, /@media\s*\(max-width:\s*640px\)[\s\S]*\.kk-category-grid[\s\S]*repeat\(3,\s*minmax/)
})

test('archive categories page uses in-page single-select filtering with category query sync', () => {
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

  assert.match(archivePage, /const\s+activeCategory\s*=\s*ref\(''\)/)
  assert.match(archivePage, /function\s+syncActiveCategory\(/)
  assert.match(archivePage, /function\s+syncCategoryQuery\(category:\s*string\)/)
  assert.match(archivePage, /function\s+toggleCategoryFilter\(category:\s*string\)/)
  assert.match(archivePage, /searchParams\.get\('category'\)/)
  assert.match(archivePage, /searchParams\.set\('category',\s*category\)/)
  assert.match(archivePage, /searchParams\.delete\('category'\)/)
  assert.match(archivePage, /props\.type === 'categories' && activeCategory\.value/)
  assert.match(archivePage, /:class="\{\s*'is-active': activeCategory === item\.name\s*\}"/)
  assert.match(archivePage, /@click="toggleCategoryFilter\(item\.name\)"/)
  assert.match(
    archivePage,
    /:aria-pressed="props\.type === 'categories' && activeCategory === item\.name"/
  )
  assert.match(archivePage, /class="kk-category-link kk-tag-filter"/)
  assert.match(customCss, /\.kk-tag-filter\.is-active[\s\S]*border-color:\s*var\(--vp-c-brand-1\);/)
  assert.match(customCss, /\.kk-tag-filter\.is-active[\s\S]*background:\s*var\(--vp-c-brand-soft\);/)
  assert.match(customCss, /\.kk-tag-filter\.is-active[\s\S]*color:\s*var\(--vp-c-brand-1\);/)
  assert.match(archivePage, /未找到分类 “\{\{ activeCategory \}\}” 对应的文章。/)
  assert.doesNotMatch(archivePage, /:href="`#\$\{item\.slug\}`"/)
})

test('archive tag chips use in-page single-select filtering instead of anchor navigation', () => {
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
  const tagsPage = fs.readFileSync('docs/tags/index.md', 'utf8')

  assert.match(archivePage, /toggleTagFilter/)
  assert.match(archivePage, /v-if="props.type === 'tags' && highlightSections.length"/)
  assert.match(archivePage, /@click="toggleTagFilter\(section.name\)"/)
  assert.match(archivePage, /:aria-pressed="props.type === 'tags' && activeTag === section.name"/)
  assert.match(archivePage, /class="kk-category-groups"/)
  assert.match(archivePage, /class="kk-category-grid"/)
  assert.match(archivePage, /class="kk-category-link kk-tag-filter"/)
  assert.match(archivePage, /class="kk-category-link__count"/)
  assert.match(archivePage, /getCategoryColorToken/)
  assert.match(
    archivePage,
    /class="kk-category-link__count"[\s\S]*:style="\{\s*backgroundColor:\s*`var\(--\$\{section\.colorToken\}\)`\s*\}"/
  )
  assert.match(
    archivePage,
    /v-else-if="props.type === 'timeline' && highlightSections.length"[\s\S]*class="kk-category-link kk-tag-filter"/
  )
  assert.match(customCss, /\.kk-tag-filter\s*{[\s\S]*appearance:\s*none;/)
  assert.match(customCss, /\.kk-tag-filter\s*{[\s\S]*-webkit-appearance:\s*none;/)
  assert.match(customCss, /\.kk-tag-filter\s*{[\s\S]*width:\s*100%;/)
  assert.match(customCss, /\.kk-tag-filter\.is-active\s*{[\s\S]*border-color:\s*var\(--vp-c-brand-1\);/)
  assert.match(customCss, /\.kk-tag-filter\.is-active\s*{[\s\S]*background:\s*var\(--vp-c-brand-soft\);/)
  assert.match(customCss, /\.kk-tag-filter\.is-active\s*{[\s\S]*color:\s*var\(--vp-c-brand-1\);/)
  assert.doesNotMatch(customCss, /\.kk-tag-filter\s*{[\s\S]*font:\s*inherit;/)
  assert.doesNotMatch(customCss, /\.kk-tag-filter\s*{[\s\S]*line-height:\s*inherit;/)
  assert.doesNotMatch(archivePage, /kk-archive-page__filter/)
  assert.match(archivePage, /v-else-if="props.type === 'timeline' && highlightSections.length"/)
  assert.doesNotMatch(archivePage, /pageTitle/)
  assert.doesNotMatch(archivePage, /pageDescription/)
  assert.match(tagsPage, /author:\s*false/)
  assert.match(tagsPage, /date:\s*false/)
  assert.match(tagsPage, /readingTime:\s*false/)
})

test('archive timeline year links and post taxonomy chips share the tag-button visual baseline', () => {
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

  assert.match(
    archivePage,
    /v-else-if="props.type === 'timeline' && highlightSections.length"[\s\S]*class="kk-category-groups"/
  )
  assert.match(
    archivePage,
    /v-else-if="props.type === 'timeline' && highlightSections.length"[\s\S]*class="kk-category-grid"/
  )
  assert.match(
    archivePage,
    /v-else-if="props.type === 'timeline' && highlightSections.length"[\s\S]*class="kk-category-link kk-tag-filter"/
  )
  assert.match(
    archivePage,
    /v-else-if="props.type === 'timeline' && highlightSections.length"[\s\S]*class="kk-category-link__count"/
  )
  assert.match(customCss, /\.kk-archive-post__taxonomy li\s*{[^}]*border:\s*1px solid var\(--vp-c-divider\);/)
  assert.match(customCss, /\.kk-archive-post__taxonomy li\s*{[^}]*border-radius:\s*10px;/)
  assert.match(customCss, /\.kk-archive-post__taxonomy li\s*{[^}]*background:\s*var\(--vp-c-bg\);/)
  assert.match(customCss, /\.kk-archive-post__taxonomy li\s*{[^}]*color:\s*var\(--vp-c-text-1\);/)
  assert.match(customCss, /\.kk-archive-post__taxonomy\s*{[\s\S]*display:\s*grid;/)
  assert.match(customCss, /\.kk-archive-post__taxonomy\s*{[\s\S]*justify-items:\s*flex-start;/)
  assert.match(customCss, /\.kk-archive-post__taxonomy li\s*{[^}]*line-height:\s*1\.2;/)
  assert.match(customCss, /\.kk-archive-post__taxonomy li\s*{[^}]*white-space:\s*nowrap;/)
})
