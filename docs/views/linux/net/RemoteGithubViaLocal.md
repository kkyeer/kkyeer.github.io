---
date: 2025-03-07 10:56:16
categories:
  - Linux
tags:
  - Net
publish: true
---

# 远端开发机通过本机网络连接私有git仓库

最近因为工作的原因需要使用到CUDA相关的组件，本地的Mac显然是没有的，因此需要远程开发，但是远程机器在云端，无法连接公司的Git仓库，因此需要代理，方案也比较简单

## 本地

```shell
# 本地开启socks5代理，通过ssh协议绑定到远端开发机
ssh -R 1080 -N -f autodl
```

参数说明：

-R 1080 将远程机的1080端口绑定到本地SOCKS代理
-N 不执行远程命令
-f 后台运行

## 远端开发机

```shell
git config http.proxy socks5://localhost:1080
git pull
```

## 其他方案

tcp转发也可以达到这个目的，需要修改远端的host指向等

```shell
ssh -R 1080:my.git.repo.com:443 -N user@remote-dev-machine
```
