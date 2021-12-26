---
date: 2019-05-14
categories:
  - 懂
tags:
  - Linux
publish: true
---

# Linux小技巧

## redis配置

- 查看Redis配置文件路径：redis-cli -p 6379 info | grep 'config_file'
[相关网址](http://pingredis.blogspot.com/2016/12/how-to-get-rdb-location-and-config-file.html)
- 需要永久配置密码的话就去redis.conf的配置文件中找到requirepass这个参数，如下配置：

修改redis.conf配置文件　　

```file
requirepass foobared
```

或者在redis-cli里

```sh
config set requirepass foobared
```

## 文件按时间排序

从旧到新：

```shell
ls -trl
```

从新到旧：

```shell
ls -tl
```

-t表示按修改时间排序，最新的在最上
-r表示反向排序

## dns修改

```sh
vim /etc/resolv.conf
```

## 安装多版本的Python

1. 下载pyenv脚本

  ```bash
  curl -L https://raw.githubusercontent.com/pyenv/pyenv-installer/master/bin/pyenv-installer|bash
  ```

2. 将下面内容加入 ~/.bashrc

  ```sh
  export PATH="/home/python/.pyenv/bin:$PATH"
  eval "$(pyenv init -)"
  eval "$(pyenv virtualenv-init -)"
  ```

3. 使上述更改生效

  ```sh
  source ~/.bashrc
  ```

4. 列出所有可用版本

  ```sh
  pyenv install -l
  ```

5. 安装编译环境

  ```sh
  sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev \
  xz-utils tk-dev libffi-dev liblzma-dev python-openssl
  ```

6. 安装某版本

  ```sh
  pyenv install 3.5.0 -v
  ```

7. 上面直接安装较慢，可以考虑手动下载对应的安装包后，放入
{user-home}/.pyenv/cache目录下,重新执行上面的命令进行安装
8. 查看安装版本

  ```sh
  pyenv versions
  ```

9. to be continue

## 查看文件夹大小

```sh
du -h {dir_path}
```

## SSH添加本地key到远程服务器

```sh
ssh-copy-id root@服务器域名或IP
```

## 杀掉指定关键词的进程

```sh
ps -ef|grep XXXXXXX|grep -v grep|cut -c 9-15|xargs kill -9
```

## 格式化和分区操作

```shell
查看分区表
sudo fdisk -l

显示：
Device      Start        End    Sectors   Size Type
/dev/sdb1      40     409639     409600   200M Microsoft basic data
/dev/sdb2  411648 1953523711 1953112064 931.3G Microsoft basic data

格式化某分区为ext4
sudo mkfs.ext4 /dev/sdb
查看是否分区成功
sudo blkid

显示:
/dev/sdb: UUID="d35cf32e-eb50-4321-b2a7-2013e87d6d5e" TYPE="ext4"

修改挂载点
 sudo vim /etc/fstab

注：格式为 设备名称 挂载点 分区类型 挂载选项 dump选项 fsck选项
dump选项–这一项为0，就表示从不备份。如果上次用dump备份，将显示备份至今的天数。
fsck选项 –启动时fsck检查的顺序。为0就表示不检查，（/）分区永远都是1，其它的分区只能从2开始，当数字相同就同时检查（但不能有两1）
```

## ubuntu中的samba配置

vim /etc/samba/smb.conf
重启samba服务
service smbd restart

## 开机启动

[简易说明](https://blog.csdn.net/w401229755/article/details/54200141)
[详细说明](http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)

> ubuntu可以考虑搜索自动启动，GUI方式

## 应用软件

### 切换音频设备

```shell
snap install indicator-sound-switcher
```

## ssh

### ssh传输文件

```shell
scp /path/filename username@servername:/path   
```

## Ubuntu修复DNS开机重置

执行```sudo vim /etc/network/interfaces```
    添加一行DNS配置，比如```dns-nameservers 8.8.8.8```

## du dh

### du与df查看已使用空间不一致的原因及解决办法

问题发现：
linux df -h 显示使用空间已满，用du -sh查看哪个文件夹占用空间比较大时显示只使用了26G 差距很大，例如：

[root@ls-dj-test-4 /]# df -h

Filesystem Size Used Avail Use% Mounted on

/dev/sda1 308G 308G 20K 100% /

[root@ls-dj-test-4 /]# du -sh /

26G /

从这里面可以看出通过du看到使用了26G，但是通过df 看，/data目录已使用308G

原因：
已经被删掉的文件还有程序在占用，所以文件没被真正释放
办法：
1、lsof |grep deleted > deleted_file查看有哪些未被释放的文件
2、排序看最大的未被释放的文件大小，命令：sort -nr -k 7 deleted_file>sort_deleted_file
3、more sort_deleted_file 查看前面那些文件，将占用空间大的程序kill掉
kill 进程号

## PCI设备

### 列出所有PCI设备

```sh
lspci
```

类似的还有列出所有USB

```sh
lsusb
```

## 查看io占用高进程

```sh
iotop -oP
```

## Docker

### 安装transmission

```shell
docker run -d \
  --name=transmission \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Beijing \
  -e TRANSMISSION_WEB_HOME=/flood-for-transmission/  \
  -e USER=kk  \
  -e PASS=transgui \
  -p 9091:9091 \
  -p 51413:51413 \
  -p 51413:51413/udp \
  -v /etc/transmission:/config \
  -v /data/download:/downloads \
  -v /data/windown:/data/windown \
  -v /var/watch:/watch \
  --restart unless-stopped \
  ghcr.io/linuxserver/transmission
```

### v2ray-docker

```shell
docker run -d -p10800:1080 -v /etc/v2ray/:/etc/v2ray --name=v2ray v2fly/v2fly-core
```
