import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('migration process docs live under project-root migration directory instead of docs', () => {
  const auditScript = fs.readFileSync('scripts/vitepress/content-audit.mjs', 'utf8')
  const readme = fs.readFileSync('README.md', 'utf8')
  const docsReadme = fs.readFileSync('docs/README.md', 'utf8')

  assert.equal(fs.existsSync('migration/specs/2026-04-02-sugar-blog-theme-migration-design.md'), true)
  assert.equal(fs.existsSync('migration/plans/2026-04-02-sugar-blog-theme-migration-implementation.md'), true)
  assert.equal(fs.existsSync('migration/reports/2026-04-01-reco-replica-progress.md'), true)

  assert.equal(fs.existsSync('docs/superpowers/specs/2026-04-02-sugar-blog-theme-migration-design.md'), false)
  assert.equal(fs.existsSync('docs/superpowers/plans/2026-04-02-sugar-blog-theme-migration-implementation.md'), false)

  assert.match(auditScript, /migration\/reports\/vitepress-content-audit\.json/)
  assert.match(readme, /migration\/specs\/2026-04-02-sugar-blog-theme-migration-design\.md/)
  assert.match(readme, /migration\/plans\/2026-04-02-sugar-blog-theme-migration-implementation\.md/)
  assert.match(docsReadme, /migration\/specs\/2026-04-02-sugar-blog-theme-migration-design/)
  assert.match(docsReadme, /migration\/plans\/2026-04-02-sugar-blog-theme-migration-implementation/)
})
