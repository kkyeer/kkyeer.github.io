import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const site = {
  title: '一水轩',
  description: 'Born for code',
  baseUrl: 'https://www.tpfuture.top/'
}

const staticRoutes = ['/', '/categories/', '/tags/', '/timeline/']

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function absoluteUrl(baseUrl, route) {
  return new URL(String(route || '').replace(/^\.\//, ''), baseUrl).toString()
}

function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) {
    return { frontmatter: {}, body: source }
  }

  const endIndex = source.indexOf('\n---\n', 4)
  if (endIndex === -1) {
    return { frontmatter: {}, body: source }
  }

  const rawFrontmatter = source.slice(4, endIndex)
  const body = source.slice(endIndex + 5)
  const frontmatter = {}
  let activeKey = ''

  for (const line of rawFrontmatter.split('\n')) {
    if (!line.trim()) {
      continue
    }

    if (/^\s+-\s+/.test(line) && activeKey) {
      const value = line.replace(/^\s+-\s+/, '').trim()
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

    if (!rawValue) {
      frontmatter[key] = []
      continue
    }

    const value = rawValue.trim()
    frontmatter[key] = value === 'true' ? true : value === 'false' ? false : value
  }

  return { frontmatter, body }
}

function stripMarkdown(value) {
  return String(value ?? '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferTitle(body, fallback) {
  const heading = body.match(/^#\s+(.+)$/m)
  return heading?.[1]?.trim() || fallback
}

function toDateOnly(value) {
  return new Date(value).toISOString().slice(0, 10)
}

function toPostUrl(rootDir, filePath) {
  const relative = path.relative(rootDir, filePath).replace(/\\/g, '/')
  return `/${relative.replace(/\.md$/, '.html')}`
}

async function listMarkdownFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(rootDir, entry.name)
      if (entry.isDirectory()) {
        return listMarkdownFiles(entryPath)
      }
      if (entry.isFile() && entry.name.endsWith('.md')) {
        return [entryPath]
      }
      return []
    })
  )

  return files.flat()
}

export async function loadPublishedPosts({ docsDir }) {
  const viewsDir = path.join(docsDir, 'views')
  const files = await listMarkdownFiles(viewsDir)
  const posts = await Promise.all(
    files.map(async (filePath) => {
      const source = await fs.readFile(filePath, 'utf8')
      const stats = await fs.stat(filePath)
      const { frontmatter, body } = parseFrontmatter(source)
      if (frontmatter.publish === false) {
        return null
      }

      const rawDate = typeof frontmatter.date === 'string' ? frontmatter.date : ''
      const parsedDate = Date.parse(rawDate)
      const timestamp = Number.isNaN(parsedDate) ? stats.mtimeMs : parsedDate
      const date = rawDate && !Number.isNaN(parsedDate) ? rawDate : toDateOnly(stats.mtimeMs)
      const titleFallback = path.basename(filePath, '.md')
      return {
        title: typeof frontmatter.title === 'string' ? frontmatter.title : inferTitle(body, titleFallback),
        url: toPostUrl(docsDir, filePath),
        date,
        timestamp,
        excerpt: stripMarkdown(body).slice(0, 180)
      }
    })
  )

  return posts
    .filter((post) => post !== null)
    .sort((left, right) => right.timestamp - left.timestamp)
}

export function renderFeedXml({ site, posts }) {
  const latestTimestamp = posts[0]?.timestamp ?? Date.now()
  const items = posts
    .map((post) => {
      const link = absoluteUrl(site.baseUrl, post.url)
      return `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(link)}</link><guid>${escapeXml(link)}</guid><pubDate>${new Date(post.timestamp || Date.now()).toUTCString()}</pubDate><description>${escapeXml(post.excerpt)}</description></item>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(site.title)}</title><link>${escapeXml(site.baseUrl)}</link><description>${escapeXml(site.description)}</description><language>zh-CN</language><lastBuildDate>${new Date(latestTimestamp).toUTCString()}</lastBuildDate>${items}</channel></rss>`
}

export function renderSitemapXml({ site, routes, posts }) {
  const postRoutes = posts.map((post) => ({
    route: post.url,
    lastmod: post.date
  }))

  const staticEntries = routes.map((route) => ({
    route,
    lastmod: null
  }))

  const entries = [...staticEntries, ...postRoutes]
    .map(({ route, lastmod }) => `<url><loc>${escapeXml(absoluteUrl(site.baseUrl, route))}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}</url>`)
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`
}

export async function writeSiteArtifacts({
  docsDir,
  distDir,
  siteConfig = site,
  routes = staticRoutes
}) {
  const posts = await loadPublishedPosts({ docsDir })
  await fs.mkdir(distDir, { recursive: true })
  await fs.writeFile(path.join(distDir, 'feed.xml'), renderFeedXml({ site: siteConfig, posts }), 'utf8')
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), renderSitemapXml({ site: siteConfig, routes, posts }), 'utf8')
}

const currentFile = new URL(import.meta.url).pathname
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : ''

if (entryFile === currentFile) {
  const rootDir = process.cwd()
  await writeSiteArtifacts({
    docsDir: path.join(rootDir, 'docs'),
    distDir: path.join(rootDir, 'docs/.vitepress/dist')
  })
}
