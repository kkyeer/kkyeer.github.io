import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('vitepress theme entry no longer imports lumen styles', () => {
  const source = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')

  assert.doesNotMatch(source, /@theojs\/lumen\/style/)
  assert.doesNotMatch(source, /from '@theojs\/lumen'/)
})
