---
date: 2022-08-28 11:13:04
categories:
  - Linux
tags:
  - Ubuntu
  - 网络
publish: true
---

# 将EasyConnect放入Docker容器运行

以[https://github.com/Hagb/docker-easyconnect](https://github.com/Hagb/docker-easyconnect)仓库为基础，进行改造，首先将代码```git clone```到本地

## 自定义编译镜像

> 修改镜像源

源代码使用阿里云的debian镜像，速度相对较慢，需要改造成清华镜像源

1. 删除Dockerfile中```sed -i s/deb.debian.org/mirrors.aliyun.com/ /etc/apt/sources.list; fi```部分代码
2. 代码根目录下新建sources.list文件，内容如下，注意此处使用```http```而不是s是为了省略apt update过程中的一些报错

    ```shell
    deb http://mirrors.tuna.tsinghua.edu.cn/debian/ buster main contrib non-free
    deb http://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main contrib non-free
    deb http://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-free
    deb http://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free
    ```

3. Dockerfile中新增一行```COPY sources.list /etc/apt/sources.list```

> 修改deb包

对于EC安装包为特制版本的，不使用源码中提供的wget方法，改为复制到源码根目录后，复制到镜像文件中

```docker
COPY EasyConnect.deb /tmp/EasyConnect.deb
RUN dpkg -i /tmp/EasyConnect.deb
```

> 编译镜像，解决问题

```docker image build -f Dockerfile -t docker-easyconnect .```

问题1 安装自己的deb包出现依赖问题时，在Dockerfile的apt-get install命令后新增对应的依赖即可，对于我的情况，需要新增两个依赖包 lsb-release systemd

## 创建运行与配置

> 运行容器

```docker run -d --name docker-ec --device /dev/net/tun --cap-add NET_ADMIN -ti -e PASSWORD=VNC_PASS -v $HOME/.ecdata:/root -p 5901:5901 -p 1080:1080 -p 8888:8888 docker-easyconnect```

注意上面的环境变量```-e PASSWORD=VNC_PASS```后面是指定VNC连接的密码

> 配置

使用VNC客户端连接容器，我使用的是**Remmina**，端口5901，密码使用上面的密码

此时容器已经准备完成

## 常用环境配置

对于浏览器，使用Omega进行切换，协议socks5，端口1080

对于Java程序，在RUN配置中的VM options增加选项:```-DsocksProxyHost=127.0.0.1 -DsocksProxyPort=1080```
![20220828113953](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20220828113953.png)
