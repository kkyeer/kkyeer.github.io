import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('homepage friend link lives in the home sidebar instead of the navbar', () => {
  const config = fs.readFileSync('docs/.vitepress/config.mts', 'utf8')
  const blogTheme = fs.readFileSync('docs/.vitepress/blog-theme.ts', 'utf8')
  const customCss = fs.readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

  assert.doesNotMatch(config, /text:\s*'友链'/)
  assert.match(blogTheme, /friend:\s*\[/)
  assert.match(blogTheme, /nickname:\s*'Victor Chu的博客'/)
  assert.match(customCss, /\.blog-info\s*>\s*\.tags\s*\{[^}]*order:\s*3;/)
  assert.match(customCss, /\.blog-info\s*>\s*\.friend-wrapper\s*\{[^}]*order:\s*4;/)
})

test('homepage friend config only keeps Victor Chu blog', () => {
  const blogTheme = fs.readFileSync('docs/.vitepress/blog-theme.ts', 'utf8')

  assert.match(blogTheme, /nickname:\s*'Victor Chu的博客'/)
  assert.match(blogTheme, /url:\s*'http:\/\/www\.victorchu\.info\/'/)
  assert.match(blogTheme, /avatar:\s*'https:\/\/www\.gravatar\.com\/avatar\/7cd1d15d60eb992735a14626025b2901\?s=240&d=mp'/)
  assert.doesNotMatch(blogTheme, /午后南杂/)
  assert.doesNotMatch(blogTheme, /vuepress-theme-reco/)
})
