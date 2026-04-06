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
    /const\s+categoryGroups\s*=\s*computed\(\s*\(\)\s*=>\s*categoryArchive\.value\.topGroups\.filter\(\s*\(group\)\s*=>\s*group\.children\.length\s*>\s*0\s*\)\s*\)/
  )
  assert.match(archivePage, /visibleSections[\s\S]*props\.type === 'categories'[\s\S]*categoryArchive\.value\.sections/)
  assert.match(archivePage, /v-else-if="props.type === 'categories'"/)
  assert.match(archivePage, /<nav[\s\S]*class="kk-category-groups"[\s\S]*aria-label=/)
  assert.match(archivePage, /v-for="group in categoryGroups"/)
  assert.match(archivePage, /class="kk-category-groups"/)
  assert.match(archivePage, /class="kk-category-group__grid"/)
  assert.match(archivePage, /class="kk-category-group__count"/)
  assert.match(
    archivePage,
    /class="kk-category-group__count"[\s\S]*:style="\{\s*backgroundColor:\s*`var\(--\$\{item\.colorToken\}\)`\s*\}"/
  )

  assert.match(customCss, /--kk-category-tint-1:/)
  assert.match(customCss, /--kk-category-tint-2:/)
  assert.match(customCss, /--kk-category-tint-3:/)
  assert.match(customCss, /--kk-category-tint-4:/)
  assert.match(customCss, /--kk-category-tint-5:/)
  assert.match(customCss, /--kk-category-tint-6:/)
  assert.match(customCss, /\.kk-category-groups\s*{/)
  assert.match(customCss, /\.kk-category-group__grid\s*{[\s\S]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(/)
  assert.match(customCss, /\.kk-category-group__link\s*{[\s\S]*aspect-ratio:\s*1\s*\/\s*1/)
  assert.match(customCss, /\.kk-category-group__count\s*{[\s\S]*border-radius:\s*999px/)
  assert.match(customCss, /\.kk-category-group__count\s*{[\s\S]*background:/)
  assert.match(customCss, /@media\s*\(max-width:\s*640px\)[\s\S]*\.kk-category-group__grid/)
})

test('archive tag chips use in-page single-select filtering instead of anchor navigation', () => {
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')
  const tagsPage = fs.readFileSync('docs/tags/index.md', 'utf8')

  assert.match(archivePage, /toggleTagFilter/)
  assert.match(archivePage, /v-if="props.type === 'tags'"/)
  assert.match(archivePage, /@click="toggleTagFilter\(section.name\)"/)
  assert.match(archivePage, /:aria-pressed="props.type === 'tags' && activeTag === section.name"/)
  assert.match(archivePage, /v-else/)
  assert.doesNotMatch(archivePage, /pageTitle/)
  assert.doesNotMatch(archivePage, /pageDescription/)
  assert.match(tagsPage, /author:\s*false/)
  assert.match(tagsPage, /date:\s*false/)
  assert.match(tagsPage, /readingTime:\s*false/)
})
