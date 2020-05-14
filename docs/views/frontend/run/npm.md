---
date: 2018-05-14
categories:
  - FrontEnd
tags:
  - npm
publish: true
---

# npm 阿里镜像

## 设置阿里云镜像

1. 方法一 通过config命令

    ```bash

    npm config set registry https://registry.npm.taobao.org
    npm config get registry
    ```

2. 方法2 通过安装cnpm直接使用阿里镜像(目前使用的方法)

    ``` bash
    npm install -g cnpm --registry=https://registry.npm.taobao.org
    ```

cnpm install [name]--通过使用cnpm安装你需要安装的库

## npm清理缓存

```bash
npm cache clean -f
```
