---
date: 2020-09-19
categories:
  - Linux
tags:
  - IDEA
  - BUG
publish: true
---

# 修复Ubuntu系统下IDEA输入法不跟随光标问题

## 下载编译JetBrainsRuntime

```shell
git clone https://gitee.com/mirrors_JetBrains/JetBrainsRuntime.git
git clone https://github.com/prehonor/myJetBrainsRuntime.git
cp myJetBrainsRuntime/idea.patch JetBrainsRuntime/
cd JetBrainsRuntime
# git checkout cfc3e87f2ac27a0b8c78c729c113aa52535feff6
git apply idea.patch
sudo apt-get install autoconf make build-essential libx11-dev libxext-dev libxrender-dev libxtst-dev libxt-dev libxrandr-dev libcups2-dev libfontconfig1-dev libasound2-dev openjdk-11-jdk
sh ./configure --disable-warnings-as-errors
make images
```

## 修改IDEA启动参数，使用自己编译的运行时

修改文件: home/idea-2020.1/bin/idea.sh (找到你自己的idea的安装路径)

在文件开头添加环境变量，指向你自己的编译的jdk所在目录

```sh
export IDEA_JDK=/home/kk/workspace/JetBrainsRuntime/build/linux-x86_64-normal-server-release/jdk
```

## 参考资料

- [fcitx输入法在Intellij IDEA开发工具中输入法候选框无法跟随光标](https://bbs.archlinuxcn.org/viewtopic.php?id=10529)
- [idea 中文输入法定位不准问题修复(fcitx框架输入法)](https://blog.csdn.net/u011166277/article/details/106287587)
