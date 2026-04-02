import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('BlogHome uses reco v2 shell, 12-post stream, and removed legacy home blocks', () => {
  const source = fs.readFileSync('docs/.vitepress/theme/components/BlogHome.vue', 'utf8')

  assert.match(source, /buildRecentPosts\(posts,\s*12\)/)
  assert.match(source, /kk-home-hero/)
  assert.match(source, /kk-home-hero__stats/)
  assert.match(source, /kk-home-stream__list/)

  assert.match(source, />站点信息</)
  assert.match(source, />分类</)
  assert.match(source, />标签</)

  assert.doesNotMatch(source, />入口</)
  assert.doesNotMatch(source, /迁移进度/)
  assert.doesNotMatch(source, /站点入口/)
})
