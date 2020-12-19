const path = require('path')

module.exports = {
  "title": "一水轩",
  "description": "Born for code",
  "dest": "public",
  "head": [
    [
      "link",
      {
        "rel": "icon",
        "href": "/favicon.ico"
      }
    ],
    [
      "meta",
      {
        "name": "viewport",
        "content": "width=device-width,initial-scale=1,user-scalable=no"
      }
    ]
  ],
  "theme": "reco",
  "themeConfig": {
    "nav": [
      {
        "text": "Home",
        "link": "/",
        "icon": "reco-home"
      },
      {
        "text": "TimeLine",
        "link": "/timeline/",
        "icon": "reco-date"
      },
      {
        "text": "Contact",
        "icon": "reco-message",
        "items": [
          {
            "text": "GitHub",
            "link": "https://github.com/kkyeer",
            "icon": "reco-github"
          },
          {
            "text": "简书",
            "link": "https://www.jianshu.com/u/d42f2ae217ce",
            "icon": "reco-jianshu"
          }
        ]
      }
    ],
    "type": "blog",
    "blogConfig": {
      "category": {
        "location": 2,
        "text": "Category"
      },
      "tag": {
        "location": 3,
        "text": "Tag"
      }
    },
    "friendLink": [
      {
        "title": "午后南杂",
        "desc": "Enjoy when you can, and endure when you must.",
        "email": "1156743527@qq.com",
        "link": "https://www.recoluan.com"
      },
      {
        "title": "vuepress-theme-reco",
        "desc": "A simple and beautiful vuepress Blog & Doc theme.",
        "avatar": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
        "link": "https://vuepress-theme-reco.recoluan.com"
      }
    ],
    "logo": "/logo.png",
    "search": true,
    "searchMaxSuggestions": 10,
    "sidebar": "auto",
    "lastUpdated": "Last Updated",
    "author": "kkyeer",
    "authorAvatar": "/avatar.png",
    "record": "浙ICP备18011775号",
    "recordLink":"http://www.beian.miit.gov.cn",
    "startYear": "2019",
    sitemap: {
      hostname: "https://www.tpfuture.top/"
    },
    feed: {
      canonical_base: 'https://www.tpfuture.top/',
    }
  },
  "markdown": {
    "lineNumbers": true,
    "extractHeaders": [ 'h2', 'h3', 'h4' ]
  },
  plugins: [
    'flowchart'
  ],
  configureWebpack: () => {
    const NODE_ENV = process.env.NODE_ENV
    //判断是否是生产环境
    if(NODE_ENV === 'production'){
      return {
        output: {
          publicPath: 'https://cdn.jsdelivr.net/gh/kkyeer/blog@cdn/'
        },
        resolve: {
          //配置路径别名
          alias: {
            'public': path.resolve(__dirname, './public') 
          }
        }
      }
    }else{
      return {
        resolve: {
          //配置路径别名
          alias: {
            'public': path.resolve(__dirname, './public') 
          }
        }
      }
    }
  }
}