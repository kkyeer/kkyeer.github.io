import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { loadPublishedPosts, renderFeedXml, renderSitemapXml } from '../scripts/vitepress/feed-sitemap.mjs'

const site = {
  title: '一水轩',
  description: 'Born for code',
  baseUrl: 'https://www.tpfuture.top/'
}

const posts = [
  {
    title: '最新文章',
    url: '/views/newest.html',
    date: '2024-11-03',
    timestamp: Date.parse('2024-11-03'),
    excerpt: '最新摘要'
  },
  {
    title: '较早文章',
    url: '/views/older.html',
    date: '2023-05-06',
    timestamp: Date.parse('2023-05-06'),
    excerpt: '较早摘要'
  }
]

test('renderFeedXml emits RSS with canonical site metadata and newest post first', () => {
  const xml = renderFeedXml({
    site,
    posts
  })

  assert.match(xml, /<title>一水轩<\/title>/)
  assert.match(xml, /<link>https:\/\/www\.tpfuture\.top\/<\/link>/)
  assert.match(xml, /<item><title>最新文章<\/title>/)
  assert.ok(xml.indexOf('最新文章') < xml.indexOf('较早文章'))
  assert.doesNotMatch(xml, /undefined/)
})

test('renderSitemapXml emits static routes and article routes with canonical URLs', () => {
  const xml = renderSitemapXml({
    site,
    routes: ['/', '/categories/', '/tags/', '/timeline/'],
    posts
  })

  assert.match(xml, /<loc>https:\/\/www\.tpfuture\.top\/<\/loc>/)
  assert.match(xml, /<loc>https:\/\/www\.tpfuture\.top\/categories\/<\/loc>/)
  assert.match(xml, /<loc>https:\/\/www\.tpfuture\.top\/views\/newest\.html<\/loc>/)
  assert.match(xml, /<lastmod>2024-11-03<\/lastmod>/)
})

test('loadPublishedPosts filters drafts and falls back to file mtime when date is missing', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'kk-feed-'))
  const docsDir = path.join(root, 'docs')
  const viewsDir = path.join(docsDir, 'views')
  const datedFile = path.join(viewsDir, 'dated.md')
  const undatedFile = path.join(viewsDir, 'undated.md')
  const draftFile = path.join(viewsDir, 'draft.md')

  await fs.mkdir(viewsDir, { recursive: true })
  await fs.writeFile(
    datedFile,
    `---
title: Dated
date: 2024-01-02
---

# Dated
`,
    'utf8'
  )
  await fs.writeFile(
    undatedFile,
    `---
title: Undated
---

# Undated
`,
    'utf8'
  )
  await fs.writeFile(
    draftFile,
    `---
title: Draft
publish: false
---

# Draft
`,
    'utf8'
  )

  const mtime = new Date('2024-02-03T10:20:30Z')
  await fs.utimes(undatedFile, mtime, mtime)

  const loadedPosts = await loadPublishedPosts({ docsDir })

  assert.equal(loadedPosts.length, 2)
  assert.equal(loadedPosts[0].title, 'Undated')
  assert.equal(loadedPosts[0].date, '2024-02-03')
  assert.ok(loadedPosts.every((post) => post.title !== 'Draft'))
})
