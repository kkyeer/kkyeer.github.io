---
date: 2019-06-14
categories:
  - Linux
tags:
  - CompileJDK
  - Deepin
publish: true
---
# 深度Deepin编译OpenJDK8

## 1. 安装依赖

1. 安装基本组件

    ```bash
    sudo apt-get update
    sudo apt-get install build-essential
    sudo apt-get install libfreetype6-dev
    sudo apt-get install libasound2-dev
    sudo apt-get install ant=1.9.4-3
    ```

2. 安装Oraclejdk

   网址为 [HAHA](https://www.oracle.com/technetwork/java/javase/downloads/java-archive-downloads-javase6-419409.html)

3. 检查通过

    ```bash
    sudo make sanity
    ```

4. 设置环境变量

    ```bash
    export LANG=C
    export ALT_BOOTDIR=/home/kk/Documents/jdk7u/compileGuide/jdk1.6.0_45/
    export ALLOW_DOWNLOADS=true
    export HOTSPOT_BUILD_JOBS=4
    export ALT_PARALLEL_COMPILE_JOBS=4
    export USE_PRECOMPILED_HEADER=true
    export BUILD_LANGTOOLS=true
    export BUILD_HOTSPOT=true
    export BUILD_JDK=true
    export BUILD_DEPLOY=false
    export BUILD_INSTALL=false
    export ALT_OUTPUTDIR=/home/kk/Documents/jdkbuilt
    unset JAVA_HOME
    unset CLASSPATH
    export JAVA_TOOL_OPTIONS=-Dfile.encoding=ascii
    make DISABLE_HOTSPOT_OS_VERSION_CHECK=OK
    ```

5. 编译

    ```bash
    make DISABLE_HOTSPOT_OS_VERSION_CHECK=OK
    ```

## 2. 问题解决

1. cannot find -lX11
sudo apt-get install libx11-dev
2. fatal error: X11/***.h: No such file or directory
参考 [【解决】fatal error: X11/XXXX.h: No such file or directory](https://blog.csdn.net/bedisdover/article/details/51840639)
sudo apt-get install libxext-dev libxrender-dev libxtst-dev



   