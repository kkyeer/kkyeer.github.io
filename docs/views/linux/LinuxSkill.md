---
date: 2019-05-14
categories:
  - 知识&技巧
tags:
  - Linux
publish: true
---

# 1. Linux小技巧

## 1.1. redis配置

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

## 1.2. 文件按时间排序

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

## 1.3. dns修改

```sh
vim /etc/resolv.conf
```

## 1.4. 安装多版本的Python

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

7. 上面直接安装较慢，可以考虑手动下载对应的安装包后，放入```{user-home}/.pyenv/cache```目录下,重新执行上面的命令进行安装
8. 查看安装版本

  ```sh
  pyenv versions
  ```

9. to be continue

## 1.5. 查看文件夹大小

```sh
## 简单查看
du -h {dir_path}

## 查看子文件夹（1层）大小
du -h -c -d 1

## 从大到小排序，使用管道运算并与sort命令结合
du -h -c -d 1 | sort -rh
```

## 1.6. SSH添加本地key到远程服务器

```sh
ssh-copy-id root@服务器域名或IP
```

## 1.7. 杀掉指定关键词的进程

```sh
ps aux|grep XXXXXX|awk '{print $2}'|xargs kill -9
```

## 1.8. 格式化和分区操作

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

## 1.9. ubuntu中的samba配置

vim /etc/samba/smb.conf
重启samba服务
service smbd restart

## 1.10. 开机启动

[简易说明](https://blog.csdn.net/w401229755/article/details/54200141)
[详细说明](http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)

> ubuntu可以考虑搜索自动启动，GUI方式

## 1.11. 应用软件

### 1.11.1. 切换音频设备

```shell
snap install indicator-sound-switcher
```

## 1.12. ssh

### 1.12.1. ssh传输文件

```shell
scp /path/filename username@servername:/path   
```

## 1.13. Ubuntu修复DNS开机重置

执行```sudo vim /etc/network/interfaces```
    添加一行DNS配置，比如```dns-nameservers 8.8.8.8```

## 1.14. du dh

### 1.14.1. du与df查看已使用空间不一致的原因及解决办法

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

## 1.15. PCI设备

### 1.15.1. 列出所有PCI设备

```sh
lspci
```

类似的还有列出所有USB

```sh
lsusb
```

## 1.16. 查看io占用高进程

```sh
iotop -oP
```

## 1.17. Docker

### 1.17.1. 安装transmission

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

### 1.17.2. v2ray-docker

```shell
docker run -d -p10800:1080 -v /etc/v2ray/:/etc/v2ray --name=v2ray v2fly/v2fly-core
```

### 1.17.3. clash-docker

```shell
sudo useradd -c "user for clash" -M -N -s /usr/sbin/nologin -u 1024 clash
wget https://download.db-ip.com/free/dbip-country-lite-2022-03.mmdb.gz
# manual create config.yaml
docker run --user 1024:100 --name clash -d \
--network host \
--restart=unless-stopped \
-e CLASH_CTL_ADDR="0.0.0.0:8082" \
-e CLASH_SECRET="YOUR-PASSWORD-HERE" \
-v $(pwd)/config.yaml:/etc/clash/config.yaml:ro,z \
-v $(pwd)/dbip-country-lite-2022-03.mmdb:/etc/clash/Country.mmdb:ro,z \
80x86/clash:v1.5.0
```

## 1.18. ubuntu新增kylin镜像源安装原生微信

```txt
deb http://archive.ubuntukylin.com/ubuntukylin focal-partner main
```

## 1.19. ivaldi浏览器进入Chromium原生设置

地址栏输入```chrome://settings```并回车后，虽然地址变成```vivaldi://settings```，但是界面是chromium原生界面

![Screenshot_20220417_102800](https://cdn.jsdmirror.com/gh/kkyeer/picbed/Screenshot_20220417_102800.png)

## 1.20. Linux下禁用swap

一、不重启电脑，禁用启用swap，立刻生效

> 禁用swap

```shell
sudo swapoff -a
```

> 开启swap

```shell
sudo swapon -a
```

> 查看交换分区的状态

```shell
sudo free -m
```

二、重新启动电脑，永久禁用Swap

> 用vi修改/etc/fstab文件，在swap分区这行前加 # 禁用掉，保存退出

```shell
vi /etc/fstab
reboot
```

## 1.21. 点对点带宽测速

工具:iperf，各平台安装略

> 服务端

```shell
iperf -s -p 12345
```

ipv6场景下需要增加```-V```参数

```shell
iperf -s -p 12345 -V
```

> 客户端

```shell
iperf -c 域名 -p 刚才的端口 -t 60
```

ipv6场景下需要增加```-V```参数

```shell
iperf -c 域名 -p 刚才的端口 -t 60 -V
```

## 1.22. Discover取消代理设置

这个是有解决方案的，就是很费劲。Discover 和 pkcon 是依赖 packagekit 的，这玩意是用 sql 存储配置的（在 /var/lib/PackageKit/transactions.db），你设置系统代理在哪儿设置都行，packagekit 会把代理写到 sql 里，你改代理也行，但是删代理删不了

于是解决方案就是用 sqlitebrowser 自己去数据库的 proxy 表里删…删完重启 packagekit service…

[https://forum.kde.org/viewtopic.php?f=309&t=161739](https://forum.kde.org/viewtopic.php?f=309&t=161739)

想自动删可以给你写一个 systemd timer，每隔一段时间去看看有没有 proxy 要是没有就去清空 proxy 表

[https://github.com/PackageKit/PackageKit/issues/392](https://github.com/PackageKit/PackageKit/issues/392)

```shell
sudo apt install sqlite3
sudo sqlite3 /var/lib/PackageKit/transactions.db
DELETE FROM proxy;
.exit
sudo systemctl restart packagekit
```

## 1.23. 定位并释放占用显存的进程

使用下列命令定位占用显存的进程

```shell
sudo fuser -v /dev/nvidia*
```

如果提示没有此命令，使用下列命令安装

```shell
apt-get install  psmisc
```

定位到进程后，可以使用```ps -ef```命令具体查看进程的细节，并自行决定kill哪些进程
