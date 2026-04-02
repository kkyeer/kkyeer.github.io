import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('homepage uses native sugar home layout instead of BlogHome component', () => {
  const source = fs.readFileSync('docs/index.md', 'utf8')

  assert.match(source, /layout:\s*home/)
  assert.match(source, /blog:/)
  assert.doesNotMatch(source, /<BlogHome\s*\/>/)
})
