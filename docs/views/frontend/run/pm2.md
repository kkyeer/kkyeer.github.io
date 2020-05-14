---
date: 2019-01-14
categories:
  - FrontEnd
tags:
  - pm2
publish: true
---

# pm2 启动脚本

## 初始化

pm2 ecosystem

## 编辑ecosystem.config.js

```js
module.exports = {
  apps : [{
    name: 'official-site',
    script: './bin/www',
    cwd:'/root/mayuan-web-front',
    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: './bin/www',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }],

};
```

## 启动

pm2 start
