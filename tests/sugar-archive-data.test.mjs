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
