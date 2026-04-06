import path from 'node:path'
import { defineConfig } from 'vitepress'
import { blogTheme } from './blog-theme'
import { getCategoryNavItems } from './theme/lib/category-tree.mjs'

function escapeGenericMarkdown() {
  return {
    name: 'kk-escape-java-generics',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!id.endsWith('.md') || !id.includes('/docs/views/')) {
        return null
      }

      let inCodeFence = false
      const lines = code.split('\n').map((line) => {
        if (/^\s*```/.test(line)) {
          inCodeFence = !inCodeFence
          return line
        }

        if (inCodeFence) {
          return line
        }

        let result = ''
        for (let index = 0; index < line.length; index += 1) {
          const current = line[index]
          const next = line[index + 1]

          if (current === '<' && next && /[A-Z?]/.test(next)) {
            let cursor = index
            let depth = 0

            while (cursor < line.length) {
              if (line[cursor] === '<') depth += 1
              if (line[cursor] === '>') {
                depth -= 1
                if (depth === 0) break
              }
              cursor += 1
            }

            if (cursor < line.length && line[cursor] === '>') {
              const chunk = line.slice(index, cursor + 1)
              result += chunk.replace(/</g, '&lt;').replace(/>/g, '&gt;')
              index = cursor
              continue
            }
          }

          result += current
        }

        return result
      })

      return lines.join('\n')
    }
  }
}

export default defineConfig({
  extends: blogTheme,
  title: '一水轩',
  description: 'Born for code',
  lang: 'zh-CN',
  cleanUrls: false,
  ignoreDeadLinks: true,
  lastUpdated: true,
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: 'https://cdn.jsdmirror.com/gh/kkyeer/picbed/favicon_coder.ico'
      }
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.staticfile.org/lxgw-wenkai-webfont/1.6.0/style.css'
      }
    ],
    [
      'meta',
      {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1,user-scalable=no'
      }
    ]
  ],
  vite: {
    plugins: [escapeGenericMarkdown()],
    publicDir: path.resolve(__dirname, '../.vuepress/public'),
    resolve: {
      alias: {
        public: path.resolve(__dirname, '../.vuepress/public')
      }
    },
    optimizeDeps: {
      include: ['valine']
    }
  },
  themeConfig: {
    logo: 'https://cdn.jsdmirror.com/gh/kkyeer/picbed/avatar_coder.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '分类', items: getCategoryNavItems() },
      { text: '标签', link: '/tags/' },
      { text: '时间线', link: '/timeline/' },
      { text: 'GitHub', link: 'https://github.com/kkyeer' }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/kkyeer' }],
    outline: {
      level: [2, 3, 4],
      label: '目录'
    },
    search: {
      provider: 'local'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    }
  }
})
