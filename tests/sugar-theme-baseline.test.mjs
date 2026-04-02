import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('site extends sugar theme and home route uses native home layout', () => {
  const blogTheme = fs.readFileSync('docs/.vitepress/blog-theme.ts', 'utf8')
  const config = fs.readFileSync('docs/.vitepress/config.mts', 'utf8')
  const themeIndex = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
  const homePage = fs.readFileSync('docs/index.md', 'utf8')
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

  assert.match(blogTheme, /getThemeConfig/)
  assert.match(config, /extends:\s*blogTheme/)
  assert.match(themeIndex, /from '@sugarat\/theme'/)
  assert.match(homePage, /layout:\s*home/)
  assert.match(homePage, /blog:/)
  assert.equal(typeof pkg.devDependencies['@sugarat/theme'], 'string')
  assert.equal(typeof pkg.devDependencies.pagefind, 'string')

  assert.doesNotMatch(themeIndex, /from 'vitepress\/theme'/)
  assert.doesNotMatch(themeIndex, /@theojs\/lumen/)
  assert.doesNotMatch(homePage, /<BlogHome\s*\/>/)
})

test('local wrapper keeps read count and comments without reintroducing custom footer layout', () => {
  const themeIndex = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
  const postMeta = fs.readFileSync('docs/.vitepress/theme/components/PostMeta.vue', 'utf8')
  const comments = fs.readFileSync('docs/.vitepress/theme/components/ValineComments.vue', 'utf8')

  assert.match(themeIndex, /ValineComments/)
  assert.match(themeIndex, /PostMeta/)
  assert.match(themeIndex, /doc-after/)
  assert.match(themeIndex, /doc-before/)
  assert.doesNotMatch(themeIndex, /SiteFooter/)

  assert.match(postMeta, /AccessNumber/)
  assert.doesNotMatch(postMeta, /分类/)
  assert.doesNotMatch(postMeta, /标签/)
  assert.match(comments, /route\.path\.startsWith\('\/views\/'\)/)
})
