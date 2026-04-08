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
  const blogTheme = fs.readFileSync('docs/.vitepress/blog-theme.ts', 'utf8')
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
  const themeIndex = fs.readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
  const postMeta = fs.readFileSync('docs/.vitepress/theme/components/PostMeta.vue', 'utf8')
  const comments = fs.readFileSync('docs/.vitepress/theme/components/ValineComments.vue', 'utf8')

  assert.match(blogTheme, /readingTimePosition:\s*'inline'/)
  assert.match(themeIndex, /ValineComments/)
  assert.match(themeIndex, /PostMeta/)
  assert.match(themeIndex, /doc-after/)
  assert.match(themeIndex, /doc-before/)
  assert.doesNotMatch(themeIndex, /SiteFooter/)

  assert.match(postMeta, /AccessNumber/)
  assert.match(postMeta, /#hack-article-des/)
  assert.match(postMeta, /route\.path\.startsWith\('\/views\/'\)/)
  assert.match(postMeta, /\.kk-post-meta__item \.icon svg/)
  assert.match(customCss, /#hack-article-des\s*>\s*\.kk-post-meta__item/)
  assert.match(customCss, /#hack-article-des\s*>\s*\.kk-post-meta__item\s*\{[^}]*margin-right:\s*16px;/)
  assert.match(customCss, /#hack-article-des\s*>\s*\.tags/)
  assert.match(comments, /route\.path\.startsWith\('\/views\/'\)/)
})

test('navbar category flyout group titles are larger and stronger than child links', () => {
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

  assert.match(customCss, /\.VPFlyout\s+\.VPMenuGroup\s+\.title\s*\{/)
  assert.match(customCss, /\.VPFlyout\s+\.VPMenuGroup\s+\.title\s*\{[\s\S]*font-size:\s*16px;/)
  assert.match(customCss, /\.VPFlyout\s+\.VPMenuGroup\s+\.title\s*\{[\s\S]*font-weight:\s*700;/)
  assert.match(customCss, /\.VPFlyout\s+\.VPMenuGroup\s+\.title\s*\{[\s\S]*color:\s*var\(--vp-c-text-1\);/)
})
