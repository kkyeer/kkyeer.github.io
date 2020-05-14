---
date: 2019-05-14
categories:
  - Linux
tags:
  - Python
publish: true
---

# CentOS安装配置python3环境

## 1. 获取源码

国内可以从华为镜像源获取：[https://mirrors.huaweicloud.com/python/](https://mirrors.huaweicloud.com/python/),在页面中进入对应的版本文件夹，获取.tar.xz格式的源码包，下以3.7.4为例

```bash
wget https://mirrors.huaweicloud.com/python/3.7.4/Python-3.7.4.tar.xz
tar Python-3.7.4.tar.xz
cd Python-3.7.4
```

## 2. 编译

### 2.1 先看一下有没有安装openssl-devel包

```bash
rpm -aq|grep openssl
```

### 2.2 如果没有,就安装一下,不然pip3没法装东西

```bash
yum install openssl-devel -y
```

### 2.3 配置、编译、执行

```bash
./configure --prefix=/usr/python37 --with-ssl
make&make install
```

### 2.4 报错与解决

1. 报错:
    > ModuleNotFoundError: No module named '_ctypes'

    ```bash
    yum install libffi-devel -y
    ```

## 3. 配置

### 3.1 配置python3和pip3的软链接

```bash
ln -s /usr/python37/bin/python3 /usr/bin/python3
ln -s /usr/python37/bin/pip3 /usr/bin/pip3
```

### 3.2 升级pip3到最新版本

```bash
pip3 install --upgrade pip
```

### 3.3 配置pip3镜像源

配置文件路径为~/.pip/pip.conf，如果没有就创建一下

```bash
mkdir ~/.pip
touch ~/.pip/pip.conf
```

pip.conf的内容更换为

```conf
[global]
timeout = 6000
index-url = http://mirrors.aliyun.com/pypi/simple/
trusted-host = pypi.tuna.tsinghua.edu.cn
```

### 3.4 配置pip3的安装目录到环境变量

打开~/.bashrc，在最后添加如下内容：
>export PATH=/usr/python37/bin:$PATH

然后执行如下命令生效

```bash
source ~/.bashrc
```

## 4. 参考资料

- [CentOS安装Python3.7](https://www.jianshu.com/p/dab57c7634e1)
