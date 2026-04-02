function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
}

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

  const key = type === 'categories' ? 'categories' : 'tags'
  const groups = new Map()

  for (const post of posts) {
    for (const item of post[key]) {
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
