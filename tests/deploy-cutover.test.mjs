import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const workflow = fs.readFileSync('.github/workflows/blog.yml', 'utf8')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

function getPackageScript(name) {
  assert.equal(typeof pkg.scripts[name], 'string', `missing script ${name}`)
  return pkg.scripts[name]
}

test('workflow builds with vitepress and publishes vitepress dist', () => {
  assert.match(workflow, /run: yarn vitepress:build/)
  assert.match(workflow, /publish_dir: \.\/docs\/\.vitepress\/dist/)
  assert.doesNotMatch(workflow, /publish_dir: \.\/public/)
})

test('workflow uses a vitepress-compatible node version and frozen lockfile installs', () => {
  assert.match(workflow, /node-version: '20\.x'/)
  assert.match(workflow, /run: yarn install --frozen-lockfile/)
  assert.doesNotMatch(workflow, /node-version: '16\.16\.0'/)
  assert.doesNotMatch(workflow, /run: yarn install\s*$/m)
})

test('archive step targets vitepress dist instead of vuepress public', () => {
  assert.match(workflow, /run: yarn vitepress:archive/)
  assert.doesNotMatch(workflow, /tar Jcf \/tmp\/blog\.tar\.xz \.\/public/)
})

test('remote deploy extracts tmp dist into the final publish directory', () => {
  assert.match(workflow, /mv \/tmp\/dist\/ \/home\/ngmng\/data\/dist\//)
  assert.doesNotMatch(workflow, /\/tmp\/public\//)
})

test('deploy-related workflow steps are gated to push events', () => {
  const pushOnlySteps = [
    'GitHub Pages',
    'Install SSH key',
    'Compress',
    'upload',
    'ls -a via ssh'
  ]

  for (const step of pushOnlySteps) {
    const pattern = new RegExp(
      `- name: ${step.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}[\\s\\S]*?if: \\$\\{\\{ github\\.event_name == 'push' \\}\\}`,
      'm'
    )

    assert.match(workflow, pattern)
  }
})

test('package exposes a vitepress archive script', () => {
  assert.equal(getPackageScript('vitepress:archive'), 'node scripts/vitepress/archive-dist.mjs')
})

test('vitepress archive script packs docs/.vitepress/dist into /tmp/blog.tar.xz', () => {
  const archiveScript = fs.readFileSync('scripts/vitepress/archive-dist.mjs', 'utf8')
  assert.match(archiveScript, /docs\/\.vitepress\/dist/)
  assert.match(archiveScript, /\/tmp\/blog\.tar\.xz/)
  assert.match(archiveScript, /spawnSync\('tar'/)
})
