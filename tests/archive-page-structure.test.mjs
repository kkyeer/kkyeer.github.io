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
