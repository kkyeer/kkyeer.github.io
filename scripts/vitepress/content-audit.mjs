import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) {
    return {}
  }

  const endIndex = source.indexOf('\n---\n', 4)
  if (endIndex === -1) {
    return {}
  }

  const rawFrontmatter = source.slice(4, endIndex)
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
    frontmatter[key] = rawValue ? rawValue.trim() : []
  }

  return frontmatter
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

function isInternalLinkTarget(target) {
  if (!target) {
    return false
  }

  return !/^(?:[a-z]+:)?\/\//i.test(target)
    && !target.startsWith('#')
    && !target.startsWith('mailto:')
    && !target.startsWith('tel:')
    && !target.startsWith('data:')
    && !target.startsWith('javascript:')
}

export function extractInternalLinks(source) {
  const sanitizedSource = String(source ?? '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
  const links = []
  const markdownLinkPattern = /\[[^\]]*]\(([^)\s]+(?:\s+"[^"]*")?)\)/g
  const htmlHrefPattern = /href="([^"]+)"/g

  for (const match of sanitizedSource.matchAll(markdownLinkPattern)) {
    const rawTarget = match[1].trim().replace(/\s+"[^"]*"$/, '')
    if (isInternalLinkTarget(rawTarget)) {
      links.push({ target: rawTarget, kind: 'markdown' })
    }
  }

  for (const match of sanitizedSource.matchAll(htmlHrefPattern)) {
    const rawTarget = match[1].trim()
    if (isInternalLinkTarget(rawTarget)) {
      links.push({ target: rawTarget, kind: 'html' })
    }
  }

  return links
}

function stripCodeContent(source) {
  return String(source ?? '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
}

export function detectDiagramKinds(source) {
  const kinds = []
  if (/```(?:flow|flowchart)\b|::: ?flowchart\b|flowchart:/.test(source)) {
    kinds.push('flowchart')
  }
  if (/```mermaid\b/.test(source)) {
    kinds.push('mermaid')
  }
  if (/```plantuml\b|::: ?plantuml\b/.test(source)) {
    kinds.push('plantuml')
  }
  return kinds
}

export function detectCompatibilityIssues(source) {
  const sanitizedSource = stripCodeContent(source)
    .replace(/<[a-z]+:\/\/[^>]+>/gi, '')
  const issues = []

  if (/(?<!\\)<\/?(?:[a-z][a-z0-9]+(?:-[a-z0-9-]+)*)(?=[\s/>])[^>]*>/.test(sanitizedSource)) {
    issues.push('raw-html')
  }
  if (/\/deep\//.test(sanitizedSource)) {
    issues.push('legacy-deep-selector')
  }

  return issues.sort()
}

function toReportRelative(filePath, docsDir) {
  return path.relative(path.dirname(docsDir), filePath).replace(/\\/g, '/')
}

function normalizeTarget(target) {
  return target.replace(/\\/g, '/').split('#')[0].split('?')[0]
}

function buildCandidatePaths(targetPath, fromFile, docsDir) {
  const fromDir = path.dirname(fromFile)
  const candidates = new Set()
  const isRootPath = targetPath.startsWith('/')
  const basePath = isRootPath
    ? path.join(docsDir, targetPath.replace(/^\//, ''))
    : path.resolve(fromDir, targetPath)

  const extensions = ['', '.md', '.html']
  for (const extension of extensions) {
    candidates.add(basePath + extension)
  }

  if (basePath.endsWith('.md')) {
    candidates.add(basePath)
  } else if (basePath.endsWith('.html')) {
    candidates.add(basePath.replace(/\.html$/, '.md'))
  }

  candidates.add(path.join(basePath, 'README.md'))
  candidates.add(path.join(basePath, 'index.md'))

  return [...candidates]
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function resolveInternalLink(target, fromFile, docsDir) {
  const targetPath = normalizeTarget(target)
  if (!targetPath) {
    return { exists: true, resolvedPath: null }
  }

  const candidates = buildCandidatePaths(targetPath, fromFile, docsDir)
  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return { exists: true, resolvedPath: candidate }
    }
  }

  return { exists: false, resolvedPath: null }
}

export async function auditContent({ docsDir }) {
  const viewsDir = path.join(docsDir, 'views')
  const files = await listMarkdownFiles(viewsDir)

  const report = {
    summary: {
      totalPosts: files.length,
      missingDate: 0,
      missingCategories: 0,
      missingTags: 0,
      postsWithAnyFrontmatterGap: 0,
      diagramUsage: {
        flowchart: 0,
        mermaid: 0,
        plantuml: 0
      },
      compatibilityIssues: {
        rawHtmlPosts: 0,
        legacyDeepSelectorPosts: 0
      },
      oldMarkdownLinks: 0,
      brokenInternalLinks: 0
    },
    missingFrontmatter: {
      date: [],
      categories: [],
      tags: []
    },
    diagramPosts: [],
    compatibilityPosts: [],
    oldMarkdownLinks: [],
    brokenInternalLinks: []
  }

  for (const file of files) {
    const source = await fs.readFile(file, 'utf8')
    const frontmatter = parseFrontmatter(source)
    const hasDate = typeof frontmatter.date === 'string' && frontmatter.date.trim().length > 0
    const hasCategories = Array.isArray(frontmatter.categories) || Array.isArray(frontmatter.category) || typeof frontmatter.categories === 'string' || typeof frontmatter.category === 'string'
    const hasTags = Array.isArray(frontmatter.tags) || Array.isArray(frontmatter.tag) || typeof frontmatter.tags === 'string' || typeof frontmatter.tag === 'string'
    const repoFile = toReportRelative(file, docsDir)

    let hasGap = false
    if (!hasDate) {
      hasGap = true
      report.summary.missingDate += 1
      report.missingFrontmatter.date.push(repoFile)
    }
    if (!hasCategories) {
      hasGap = true
      report.summary.missingCategories += 1
      report.missingFrontmatter.categories.push(repoFile)
    }
    if (!hasTags) {
      hasGap = true
      report.summary.missingTags += 1
      report.missingFrontmatter.tags.push(repoFile)
    }
    if (hasGap) {
      report.summary.postsWithAnyFrontmatterGap += 1
    }

    const kinds = detectDiagramKinds(source)
    if (kinds.length > 0) {
      report.diagramPosts.push({ file: repoFile, kinds })
      for (const kind of kinds) {
        report.summary.diagramUsage[kind] += 1
      }
    }

    const compatibilityIssues = detectCompatibilityIssues(source)
    if (compatibilityIssues.length > 0) {
      report.compatibilityPosts.push({ file: repoFile, issues: compatibilityIssues })
      if (compatibilityIssues.includes('raw-html')) {
        report.summary.compatibilityIssues.rawHtmlPosts += 1
      }
      if (compatibilityIssues.includes('legacy-deep-selector')) {
        report.summary.compatibilityIssues.legacyDeepSelectorPosts += 1
      }
    }

    const internalLinks = extractInternalLinks(source)
    for (const link of internalLinks) {
      if (/\.md(?:$|[?#])/.test(link.target)) {
        report.summary.oldMarkdownLinks += 1
        report.oldMarkdownLinks.push({ file: repoFile, target: link.target, kind: link.kind })
      }

      const resolved = await resolveInternalLink(link.target, file, docsDir)
      if (!resolved.exists) {
        report.summary.brokenInternalLinks += 1
        report.brokenInternalLinks.push({ file: repoFile, target: link.target, kind: link.kind })
      }
    }
  }

  report.oldMarkdownLinks.sort((left, right) => {
    if (left.file === right.file) {
      return left.target.localeCompare(right.target)
    }
    return left.file.localeCompare(right.file)
  })
  report.brokenInternalLinks.sort((left, right) => {
    if (left.file === right.file) {
      return left.target.localeCompare(right.target)
    }
    return left.file.localeCompare(right.file)
  })
  report.compatibilityPosts.sort((left, right) => left.file.localeCompare(right.file))

  return report
}

function renderSummary(report) {
  const lines = [
    'VitePress content audit summary',
    `- Total posts: ${report.summary.totalPosts}`,
    `- Missing date: ${report.summary.missingDate}`,
    `- Missing categories: ${report.summary.missingCategories}`,
    `- Missing tags: ${report.summary.missingTags}`,
    `- Posts with any frontmatter gap: ${report.summary.postsWithAnyFrontmatterGap}`,
    `- Diagram usage: flowchart=${report.summary.diagramUsage.flowchart}, mermaid=${report.summary.diagramUsage.mermaid}, plantuml=${report.summary.diagramUsage.plantuml}`,
    `- Compatibility issues: rawHtmlPosts=${report.summary.compatibilityIssues.rawHtmlPosts}, legacyDeepSelectorPosts=${report.summary.compatibilityIssues.legacyDeepSelectorPosts}`,
    `- Old markdown links: ${report.summary.oldMarkdownLinks}`,
    `- Broken internal links: ${report.summary.brokenInternalLinks}`
  ]

  return lines.join('\n')
}

const currentFile = new URL(import.meta.url).pathname
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : ''

if (entryFile === currentFile) {
  const rootDir = process.cwd()
  const docsDir = path.join(rootDir, 'docs')
  const report = await auditContent({ docsDir })
  const outputPath = path.join(rootDir, 'migration/reports/vitepress-content-audit.json')
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8')
  process.stdout.write(`${renderSummary(report)}\n`)
  process.stdout.write(`- JSON report: ${path.relative(rootDir, outputPath)}\n`)
}
