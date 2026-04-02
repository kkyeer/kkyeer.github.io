import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import {
  auditContent,
  extractInternalLinks,
  detectDiagramKinds,
  detectCompatibilityIssues
} from '../scripts/vitepress/content-audit.mjs'

test('detectDiagramKinds identifies flowchart, mermaid and plantuml usage', () => {
  assert.deepEqual(
    detectDiagramKinds('```flow\nst=>start: Begin\n```\n```mermaid\ngraph TD;\n```\n```plantuml\n@startuml\nA -> B\n@enduml\n```'),
    ['flowchart', 'mermaid', 'plantuml']
  )
})

test('detectDiagramKinds ignores plantuml source when it is only shown inside a non-plantuml code fence', () => {
  assert.deepEqual(
    detectDiagramKinds('```sql\n@startuml\nA -> B\n@enduml\n```'),
    []
  )
})

test('extractInternalLinks keeps only internal markdown and href links', () => {
  const links = extractInternalLinks(`
[relative](./target.md)
[anchor](#part)
[external](https://example.com/post)
<a href="../other.md#intro">Other</a>
<img src="https://cdn.example.com/demo.png" />
\`[inline](./ignored.md)\`
\`\`\`md
[code](./also-ignored.md)
\`\`\`
`)

  assert.deepEqual(
    links.map((item) => item.target),
    ['./target.md', '../other.md#intro']
  )
})

test('detectCompatibilityIssues finds raw html and legacy deep selector syntax outside code fences', () => {
  assert.deepEqual(
    detectCompatibilityIssues(`
<div class="demo">
  <span>demo</span>
</div>

Use /deep/ here.

\`\`\`html
<section>ignore in code</section>
\`\`\`
`),
    ['legacy-deep-selector', 'raw-html']
  )
})

test('detectCompatibilityIssues ignores autolinks and generic type syntax', () => {
  assert.deepEqual(
    detectCompatibilityIssues(`
See <https://example.com>.

HashMap uses Node<K,V>[] and Map.Entry<K,V>.
`),
    []
  )
})

test('auditContent reports missing frontmatter, diagram usage, old markdown links and broken links', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'content-audit-'))
  const docsDir = path.join(tempDir, 'docs')
  const viewsDir = path.join(docsDir, 'views')

  await fs.mkdir(path.join(viewsDir, 'guide'), { recursive: true })
  await fs.mkdir(path.join(viewsDir, 'other'), { recursive: true })

  await fs.writeFile(
    path.join(viewsDir, 'guide', 'good.md'),
    `---
title: Good
date: 2024-01-01
categories:
  - Guide
tags:
  - Test
---

[Sibling](./sibling.md)
[Broken](./missing.md)
[Root route](/views/other/existing.html)

\`\`\`flow
st=>start: Start
\`\`\`
`,
    'utf8'
  )

  await fs.writeFile(
    path.join(viewsDir, 'guide', 'sibling.md'),
    `---
title: Sibling
date: 2024-01-02
categories:
  - Guide
tags:
  - Test
---
`,
    'utf8'
  )

  await fs.writeFile(
    path.join(viewsDir, 'other', 'existing.md'),
    `---
title: Existing
date: 2024-01-03
categories:
  - Other
---

\`\`\`plantuml
@startuml
A -> B
@enduml
\`\`\`
`,
    'utf8'
  )

  const report = await auditContent({ docsDir })

  assert.equal(report.summary.totalPosts, 3)
  assert.equal(report.summary.missingDate, 0)
  assert.equal(report.summary.missingCategories, 0)
  assert.equal(report.summary.missingTags, 1)
  assert.equal(report.summary.postsWithAnyFrontmatterGap, 1)
  assert.deepEqual(report.summary.diagramUsage, {
    flowchart: 1,
    mermaid: 0,
    plantuml: 1
  })
  assert.equal(report.summary.oldMarkdownLinks, 2)
  assert.equal(report.summary.brokenInternalLinks, 1)
  assert.deepEqual(report.summary.compatibilityIssues, {
    rawHtmlPosts: 0,
    legacyDeepSelectorPosts: 0
  })
  assert.deepEqual(report.missingFrontmatter.tags, ['docs/views/other/existing.md'])
  assert.deepEqual(
    report.diagramPosts.map((item) => ({ file: item.file, kinds: item.kinds })),
    [
      { file: 'docs/views/guide/good.md', kinds: ['flowchart'] },
      { file: 'docs/views/other/existing.md', kinds: ['plantuml'] }
    ]
  )
  assert.deepEqual(
    report.oldMarkdownLinks.map((item) => item.target),
    ['./missing.md', './sibling.md']
  )
  assert.equal(report.brokenInternalLinks[0].target, './missing.md')
})

test('repository audit has no missing date/categories and no broken internal links', async () => {
  const report = await auditContent({ docsDir: path.join(process.cwd(), 'docs') })

  assert.equal(report.summary.missingDate, 0)
  assert.equal(report.summary.missingCategories, 0)
  assert.equal(report.summary.missingTags, 0)
  assert.equal(report.summary.brokenInternalLinks, 0)
  assert.equal(report.summary.compatibilityIssues.legacyDeepSelectorPosts, 0)
})
