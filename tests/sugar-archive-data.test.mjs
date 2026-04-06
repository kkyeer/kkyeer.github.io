import test from 'node:test'
import assert from 'node:assert/strict'

import {
  normalizeThemePages,
  buildArchiveSectionsFromTheme,
  buildCategoryArchiveFromTheme
} from '../docs/.vitepress/theme/lib/sugar-archive-data.mjs'
import {
  categoryTree,
  findPrimaryCategoryBySecondary,
  getCategoryNavItems,
  getCategoryColorToken
} from '../docs/.vitepress/theme/lib/category-tree.mjs'

const pages = [
  {
    route: '/views/a',
    meta: {
      title: 'A',
      date: '2025-03-03',
      description: 'A desc',
      tag: ['Java', 'JVM'],
      categories: ['JVM', '忽略的旧分类值']
    }
  },
  {
    route: '/views/b',
    meta: {
      title: 'B',
      date: '2024-01-02',
      description: 'B desc',
      tag: ['Java'],
      categories: ['Spring']
    }
  },
  {
    route: '/views/c',
    meta: {
      title: 'C',
      date: '2023-02-01',
      description: 'C desc',
      tag: ['Ops'],
      categories: ['未登记分类']
    }
  }
]

test('normalizeThemePages returns archive-safe post records', () => {
  const data = normalizeThemePages(pages)
  assert.equal(data.length, 3)
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

test('buildArchiveSectionsFromTheme supports categories mode via category archive', () => {
  const sections = buildArchiveSectionsFromTheme(pages, 'categories')
  const { sections: categorySections } = buildCategoryArchiveFromTheme(pages, categoryTree)

  assert.equal(sections.length, categorySections.length)
  assert.deepEqual(sections.map((section) => section.name), categorySections.map((section) => section.name))
})

test('buildArchiveSectionsFromTheme rejects unknown type values', () => {
  assert.throws(
    () => buildArchiveSectionsFromTheme(pages, 'unsupported'),
    /Unsupported archive type: unsupported/
  )
})

test('buildArchiveSectionsFromTheme dedups duplicate tags per post', () => {
  const duplicatePage = [
    {
      route: '/views/dup',
      meta: {
        title: 'Dup',
        date: '2026-02-02',
        description: 'Dup desc',
        tag: ['Java', 'Java'],
        categories: ['JVM']
      }
    }
  ]

  const sections = buildArchiveSectionsFromTheme(duplicatePage, 'tags')
  assert.equal(sections.length, 1)
  assert.equal(sections[0].name, 'Java')
  assert.equal(sections[0].count, 1)
  assert.equal(sections[0].posts.length, 1)
})

test('category tree exposes stable lookup helpers', () => {
  assert.ok(categoryTree.length > 0)
  assert.equal(findPrimaryCategoryBySecondary('JVM')?.name, '服务端')
  assert.match(getCategoryNavItems()[0].items[0].link, /^\/categories\/#/)
  assert.match(getCategoryColorToken('JVM'), /^kk-category-tint-/)
})

test('buildCategoryArchiveFromTheme groups posts by categories[0] and keeps configured order', () => {
  const archive = buildCategoryArchiveFromTheme(pages, categoryTree)

  assert.deepEqual(
    archive.topGroups.map((group) => group.primaryName),
    ['服务端', '中间件', '前端', '问题解决', '其他']
  )
  assert.equal(archive.sections[0].name, 'JVM')
  assert.equal(archive.sections[0].primaryName, '服务端')
  assert.equal(archive.sections[1].name, 'Spring')
  assert.equal(archive.sections[1].primaryName, '中间件')
  assert.equal(archive.sections.some((section) => section.name === '未登记分类'), false)
})

test('buildCategoryArchiveFromTheme honors the passed category tree', () => {
  const customTree = [
    {
      name: '自定义',
      slug: 'custom',
      children: ['自定义分类']
    }
  ]
  const customPages = [
    {
      route: '/views/custom',
      meta: {
        title: 'Custom',
        date: '2026-01-01',
        description: 'Custom desc',
        tag: ['Ops'],
        categories: ['自定义分类']
      }
    }
  ]

  const archive = buildCategoryArchiveFromTheme(customPages, customTree)

  assert.equal(archive.sections.length, 1)
  assert.equal(archive.sections[0].primaryName, '自定义')
  assert.equal(archive.sections[0].name, '自定义分类')
  assert.equal(archive.topGroups[0].primaryName, '自定义')
  assert.equal(archive.topGroups[0].children[0].name, '自定义分类')
})

test('buildCategoryArchiveFromTheme uses default category tree when not provided', () => {
  const archive = buildCategoryArchiveFromTheme(pages)
  assert.equal(archive.topGroups[0].primaryName, '服务端')
  assert.equal(archive.sections[0].primaryName, '服务端')
  assert.ok(archive.unmappedSecondaryCategories.includes('未登记分类'))
  assert.ok(archive.unmappedSecondaryCategories.length >= 1)
})
