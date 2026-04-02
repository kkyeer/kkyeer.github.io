import { getThemeConfig } from '@sugarat/theme/node'

export const blogTheme = getThemeConfig({
  author: 'kkyeer',
  themeColor: 'el-blue',
  home: {
    pageSize: 8,
    blogInfoCollapsible: true
  },
  homeTags: {
    title: '🏷 标签',
    limit: 24,
    sort: 'desc',
    showCount: true
  },
  footer: {
    copyright: 'Copyright © 2019-present kkyeer',
    icpRecord: {
      name: '浙ICP备2023021217号',
      link: 'https://beian.miit.gov.cn/'
    }
  }
})
