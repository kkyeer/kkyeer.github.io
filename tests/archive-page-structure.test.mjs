import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('archive page still serves categories, tags, and timeline routes under local wrapper', () => {
  const themeIndex = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
  const archivePage = fs.readFileSync('docs/.vitepress/theme/components/ArchivePage.vue', 'utf8')

  assert.match(themeIndex, /ArchivePage/)
  assert.match(archivePage, /type: 'categories' \| 'tags' \| 'timeline'/)
  assert.match(archivePage, /useData/)
  assert.match(archivePage, /pagesData/)
  assert.match(archivePage, /buildArchiveSectionsFromTheme/)
  assert.doesNotMatch(archivePage, /useArticles/)
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
