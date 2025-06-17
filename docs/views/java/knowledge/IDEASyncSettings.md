---
date: 2021-05-18 15:26:01
categories:
  - 知识&技巧
tags:
  - IDEA
publish: true
---

# 解决Mac OS系统IDEA同步配置SSH登陆Git仓库报错问题

## 背景

IDEA提供了配置同步的功能，支持将配置保存到Git仓库，然后各台电脑/系统上的客户端自动同步仓库中的配置，入口如下：

![20210518165623](https://cdn.jsdmirror.com/gh/kkyeer/picbed/20210518165623.png)

使用说明见[官方文档](https://www.jetbrains.com/help/idea/sharing-your-ide-settings.html)

## 问题

在新版Mac OS系统下（我的是11.2），新生成ssh key并在远程Git仓库配置ssh授权，确认本地用户可以正常ssh登陆到服务器，Git Clone也正常，但是在上述IDEA配置中填入SSH登陆的仓库的时候，会提示需要登录服务器

![20210518170040](https://cdn.jsdmirror.com/gh/kkyeer/picbed/20210518170040.png)

idea日志如下

![20210518171123](https://cdn.jsdmirror.com/gh/kkyeer/picbed/20210518171123.png)

## 原因

Mac OS的ssh组件进行了升级，默认生成高版本的key，特征是私钥的开头为```-----BEGIN OPENSSH PRIVATE KEY-----```
![20210518171958](https://cdn.jsdmirror.com/gh/kkyeer/picbed/20210518171958.png)

IDEA的Settings Repository插件使用的JSch组件不支持此key，导致报错

## 解决

1. 新生成旧版本的密钥对，可以考虑不覆盖原有的密钥对，如果不覆盖，需要执行第2步，否则不需要:命令行执行```ssh-keygen -t rsa -m PEM```，并在对应的Git仓库配置授权
2. 如果密钥对不是默认的```id_rsa```，则在```.ssh```文件夹下新建config文件，配置内容如下：

  ```config
  Host github.com<你的Git仓库域名>
    HostName github.com<你的Git仓库域名>
    IdentityFile ~/.ssh/id_rsa_old<这里填你刚生成的密钥对前缀>
    User git<这里填SSH的用户名>
  ```

## 参考

[IDEA官方Bug](https://youtrack.jetbrains.com/issue/IDEA-215839)
