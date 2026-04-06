import {
  categoryTree,
  findPrimaryCategoryBySecondary,
  getCategoryAnchor,
  getCategoryColorToken,
  slugify
} from './category-tree.mjs'

function asArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? '').trim()).filter(Boolean)
  }
  if (value == null) {
    return []
  }
  const normalized = String(value).trim()
  return normalized ? [normalized] : []
}

function toUrl(route) {
  const normalized = String(route ?? '').replace(/\/$/, '')
  if (!normalized) {
    return '/'
  }
  if (normalized.endsWith('.html')) {
    return normalized
  }
  return `${normalized}.html`.replace(/\/index\.html$/, '/')
}

function comparePosts(left, right) {
  return right.timestamp - left.timestamp
}

export function normalizeThemePages(pages) {
  return pages
    .filter((page) => {
      const route = String(page?.route ?? '')
      return route.startsWith('/views/')
        && page?.meta?.title
        && page?.meta?.date
        && page?.meta?.hidden !== true
        && page?.meta?.publish !== false
    })
    .map((page) => {
      const date = String(page.meta.date)

      return {
        title: page.meta.title,
        url: toUrl(page.route),
        date,
        timestamp: Date.parse(date) || 0,
        excerpt: page.meta.description || '',
        categories: asArray(page.meta.categories ?? page.meta.category),
        tags: asArray(page.meta.tags ?? page.meta.tag)
      }
    })
    .sort(comparePosts)
}

export function buildArchiveSectionsFromTheme(pages, type) {
  const posts = normalizeThemePages(pages)

  if (type === 'timeline') {
    const groups = new Map()
    for (const post of posts) {
      const year = String(post.date).slice(0, 4) || '未知'
      groups.set(year, [...(groups.get(year) || []), post])
    }
    return [...groups.entries()].map(([name, items]) => ({
      name,
      slug: slugify(name),
      count: items.length,
      posts: items
    }))
  }

  if (type === 'categories') {
    return buildCategoryArchiveFromTheme(pages).sections
  }

  if (type !== 'tags') {
    throw new Error(`Unsupported archive type: ${type}`)
  }

  const groups = new Map()

  for (const post of posts) {
    const uniqueTags = Array.from(new Set(post.tags))
    for (const item of uniqueTags) {
      groups.set(item, [...(groups.get(item) || []), post])
    }
  }

  return [...groups.entries()]
    .map(([name, items]) => ({
      name,
      slug: slugify(name),
      count: items.length,
      posts: items
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-CN'))
}

export function buildCategoryArchiveFromTheme(pages, tree = categoryTree) {
  const posts = normalizeThemePages(pages)
  const groupedPosts = new Map()
  const unmapped = new Set()

  for (const post of posts) {
    const secondaryName = post.categories[0]
    if (!secondaryName) {
      continue
    }

    const primary = findPrimaryCategoryBySecondary(secondaryName, tree)
    if (!primary) {
      unmapped.add(secondaryName)
      continue
    }

    const current = groupedPosts.get(secondaryName) || []
    groupedPosts.set(secondaryName, [...current, post])
  }

  const topGroups = tree.map((group) => ({
    primaryName: group.name,
    primarySlug: group.slug,
    children: group.children
      .filter((name) => groupedPosts.has(name))
      .map((name) => ({
        name,
        slug: getCategoryAnchor(name),
        count: groupedPosts.get(name).length,
        colorToken: getCategoryColorToken(name)
      }))
  }))

  const sections = tree.flatMap((group) =>
    group.children
      .filter((name) => groupedPosts.has(name))
      .map((name) => ({
        name,
        slug: getCategoryAnchor(name),
        primaryName: group.name,
        count: groupedPosts.get(name).length,
        posts: groupedPosts.get(name)
      }))
  )

  return {
    topGroups,
    sections,
    unmappedSecondaryCategories: [...unmapped]
  }
}
