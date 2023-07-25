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
        "href": "https://cdn.jsdelivr.net/gh/kkyeer/picbed/favicon_coder.ico"
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
        "text":"Category",
        "icon":"reco-category",
        "items":[
          {
            "text":"服务端",
            "items":[
              {"text":"JDK源码","link":"/categories/JDK源码/"},
              {"text":"JVM","link":"/categories/JVM/"},
              {"text":"Java进阶","link":"/categories/Java进阶/"},
              {"text":"设计模式","link":"/categories/设计模式/"}
            ]
          },
          {
            "text":"中间件",
            "items":[
              {"text":"Spring","link":"/categories/Spring/"},
              {"text":"Dubbo","link":"/categories/Dubbo/"},
              {"text":"Redis","link":"/categories/Redis/"}
            ]
          },
          {
            "text":"前端",
            "items":[
              {"text":"JS","link":"/categories/JS/"},
              {"text":"前端DevOps","link":"/categories/前端DevOps/"}
            ]
          },
          {
            "text":"问题解决",
            "items":[
              {"text":"线上问题","link":"/categories/线上问题/"},
              {"text":"开发问题","link":"/categories/开发问题/"},
            ]
          },
          {
            "text":"其他",
            "items":[
              {"text":"懂","link":"/categories/懂/"},
              {"text":"Linux","link":"/categories/Linux/"},
            ]
          }
        ]
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
    "lastUpdated": 'Last Updated',
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
        "title": "Victor Chu的博客",
        "desc": "Victor Chu的博客",
        "link": "http://www.victorchu.info/"
      },
      {
        "title": "vuepress-theme-reco",
        "desc": "A simple and beautiful vuepress Blog & Doc theme.",
        "avatar": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
        "link": "https://vuepress-theme-reco.recoluan.com"
      }
    ],
    "logo": "https://cdn.jsdelivr.net/gh/kkyeer/picbed/avatar_coder.png",
    "search": true,
    "searchMaxSuggestions": 10,
    "sidebar": "auto",
    "lastUpdated": "Last Updated",
    "author": "kkyeer",
    "authorAvatar": "https://cdn.jsdelivr.net/gh/kkyeer/picbed/avatar_coder.png",
    "record": "浙ICP备18011775号",
    "recordLink":"http://beian.miit.gov.cn",
    "startYear": "2019",
    sitemap: {
      hostname: "https://www.tpfuture.top/"
    },
    feed: {
      canonical_base: 'https://www.tpfuture.top/',
    },
    valineConfig: {
      appId: '3dgRozlCeViNeuUcacu3bSqK-gzGzoHsz',// your appId
      appKey: 'FJjynPiDtLCjJ0YJ2myShSEx', // your appKey
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
          publicPath: 'https://cdn.jsdelivr.net/gh/kkyeer/kkyeer.github.io@gh-pages/'
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