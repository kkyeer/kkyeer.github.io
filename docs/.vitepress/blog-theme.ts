import { getThemeConfig } from '@sugarat/theme/node'

export const blogTheme = getThemeConfig({
  author: 'kkyeer',
  themeColor: 'el-blue',
  friend: [
    {
      nickname: 'Victor Chu的博客',
      des: 'Victor Chu的博客',
      avatar: 'https://www.gravatar.com/avatar/7cd1d15d60eb992735a14626025b2901?s=240&d=mp',
      url: 'http://www.victorchu.info/'
    }
  ],
  article: {
    readingTimePosition: 'inline'
  },
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
