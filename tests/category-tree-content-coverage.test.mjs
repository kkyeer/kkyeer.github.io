import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

import { buildCategoryArchiveFromTheme } from '../docs/.vitepress/theme/lib/sugar-archive-data.mjs'
import { categoryTree } from '../docs/.vitepress/theme/lib/category-tree.mjs'

function parseScalar(rawValue) {
  const value = String(rawValue ?? '').trim()
  if (!value) {
    return ''
  }

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  if (value === 'null') {
    return null
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    const entries = value
      .slice(1, -1)
      .split(',')
      .map((item) => parseScalar(item))
      .filter((item) => String(item ?? '').trim().length > 0)
    return entries
  }
  return value
}

function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) {
    return {}
  }

  const endIndex = source.indexOf('\n---\n', 4)
  if (endIndex === -1) {
    return {}
  }

  const frontmatter = {}
  const raw = source.slice(4, endIndex)
  let activeKey = ''

  for (const line of raw.split('\n')) {
    if (!line.trim()) {
      continue
    }

    if (/^\s+-\s+/.test(line) && activeKey) {
      const value = parseScalar(line.replace(/^\s+-\s+/, ''))
      const current = frontmatter[activeKey]
      const next = Array.isArray(current) ? current : []
      next.push(value)
      frontmatter[activeKey] = next
      continue
    }

    const matched = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!matched) {
      activeKey = ''
      continue
    }

    const [, key, rawValue] = matched
    activeKey = key
    frontmatter[key] = rawValue ? parseScalar(rawValue) : []
  }

  return frontmatter
}

function stripFrontmatter(source) {
  if (!source.startsWith('---\n')) {
    return source
  }

  const endIndex = source.indexOf('\n---\n', 4)
  if (endIndex === -1) {
    return source
  }

  return source.slice(endIndex + 5)
}

function inferTitle(frontmatter, source) {
  const fmTitle = String(frontmatter.title ?? '').trim()
  if (fmTitle) {
    return fmTitle
  }

  const h1 = stripFrontmatter(source).match(/^#\s+(.+?)\s*$/m)
  return h1 ? h1[1].trim() : ''
}

async function listMarkdownFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      return listMarkdownFiles(entryPath)
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      return [entryPath]
    }
    return []
  }))

  return files.flat().sort()
}

async function loadViewsAsThemePages({ docsDir }) {
  const viewsDir = path.join(docsDir, 'views')
  const files = await listMarkdownFiles(viewsDir)

  const pages = await Promise.all(files.map(async (filePath) => {
    const source = await fs.readFile(filePath, 'utf8')
    const frontmatter = parseFrontmatter(source)
    const relativeFile = path.relative(docsDir, filePath).replace(/\\/g, '/')

    return {
      route: `/${relativeFile.replace(/\.md$/, '')}`,
      meta: {
        title: inferTitle(frontmatter, source),
        date: frontmatter.date,
        hidden: frontmatter.hidden,
        publish: frontmatter.publish,
        categories: frontmatter.categories ?? frontmatter.category
      }
    }
  }))

  return pages
}

test('category tree maps all published first categories from docs/views content', async () => {
  const docsDir = path.join(process.cwd(), 'docs')
  const pages = await loadViewsAsThemePages({ docsDir })
  const archive = buildCategoryArchiveFromTheme(pages, categoryTree)
  const unmapped = [...archive.unmappedSecondaryCategories].sort((a, b) => a.localeCompare(b, 'zh-CN'))

  assert.deepEqual(
    unmapped,
    [],
    `Unmapped first categories in published posts: ${unmapped.join(', ')}`
  )
})
