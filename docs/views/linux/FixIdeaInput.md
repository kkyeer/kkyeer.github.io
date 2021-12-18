---
date: 2020-09-19
categories:
  - Linux
tags:
  - IDEA
  - BUG
publish: true
---

# 修复Ubuntu系统下IDEA中文输入法不跟随光标问题

## 下载编译JetBrainsRuntime

>**注意，单纯使用这种方式编译的jdk缺少JCEF，会导致某些插件无法使用（比如leetcode插件）**

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

如果使用上面的jdk启动idea，出现下面报错，说明有插件使用了JCEF，则编译时需要带入jcef

![IDEA_missing_jcef](https://cdn.jsdelivr.net/gh/kkyeer/picbed/IDEA_missing_jcef.png)

> 带JCEF的版本

```shell
export JDK_11=/usr/lib/jvm/java-11-openjdk-amd64
export ANT_HOME=PATH_TO_APACHE_ANT/apache-ant-1.9.16

git clone https://gitee.com/mirrors_JetBrains/JetBrainsRuntime.git
git clone https://github.com/prehonor/myJetBrainsRuntime.git
git clone https://github.com/JetBrains/jcef.git


cd jcef
mkdir jcef_build && cd jcef_build
cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release ..
make -j4
cd ../jb/tools/linux && chmod +x *
./build.sh all

cd ../../../../JetBrainsRuntime/
cp ../myJetBrainsRuntime/idea.patch ./
git apply idea.patch
git apply -p0 < jb/project/tools/patches/add_jcef_module.patch
sudo apt-get install autoconf make build-essential libx11-dev libxext-dev libxrender-dev libxtst-dev libxt-dev libxrandr-dev libcups2-dev libfontconfig1-dev libasound2-dev openjdk-11-jdk
sh ./configure --disable-warnings-as-errors --with-import-modules=../jcef/out/linux64/modular-sdk
make images
```

## 修改IDEA启动参数，使用自己编译的运行时

### 方法1 idea内修改JDK

idea内双击shift按键，输入Choose Boot 后，出现下面提示，根据提示选择刚才编译后的问题件

![IDEA_Choose_Runtime](https://cdn.jsdelivr.net/gh/kkyeer/picbed/IDEA_Choose_Runtime.png)

### 方法2 修改文件参数

修改文件: home/idea-2020.1/bin/idea.sh (找到你自己的idea的安装路径)

在文件开头添加环境变量，指向你自己的编译的jdk所在目录

```sh
export IDEA_JDK=PATH_TO_HOME/JetBrainsRuntime/build/linux-x86_64-normal-server-release/jdk
```

## 参考资料

- [fcitx输入法在Intellij IDEA开发工具中输入法候选框无法跟随光标](https://bbs.archlinuxcn.org/viewtopic.php?id=10529)
- [idea 中文输入法定位不准问题修复(fcitx框架输入法)](https://blog.csdn.net/u011166277/article/details/106287587)
- [JetBrains Runtime关于JCEF的issue](https://github.com/JetBrains/JetBrainsRuntime/issues/86)
- [开发者的Github Action文件](https://github.com/RikudouPatrickstar/JetBrainsRuntime-for-Linux-x64/blob/master/.github/workflows/jbr-linux-x64.yml)
