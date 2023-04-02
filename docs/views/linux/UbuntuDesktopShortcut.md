---
date: 2022-04-05 10:59:40
categories:
  - Linux
tags:
  - Ubuntu
  - KDE
  - 快捷方式
publish: true
---

# Ubuntu快捷方式(.desktop文件)与开机自启

> 注：以下说明在Kubuntu下确认OK，理论上Ubuntu原生(Gnome)也类似

KUbuntu的快捷方式主要是.desktop文件方式存储，影响**搜索**，**dock栏的快捷方式**，同时还可以设置开机自启

## .desktop文件的路径

KUbuntu的desktop文件主要在下面几个地方，在任何一个地方存在(包括符号链接)，均会被系统扫描

- /usr/share/applications : 全局生效
- ~/.local/share/applications/ :一般情况下，此部分仅对对应用户生效
- ~/.config/autostart/:这个路径更多的是用来开机自启，但也有部分application是只定义在这里的，看各应用实现

## .desktop文件开机自启

如果上述路径里已有对应软件的.desktop文件，则仅需要在当前用户的配置文件夹新增一条**符号链接**即可，下面为将 utools设为开机自启的实例

```shell
ln -s /usr/share/applications/utools.desktop ~/.config/autostart/utools.desktop
```

```ln -s```命令的一般用法为```ln -s 源文件路径 要新增的符号链接路径```

## 手写.desktop文件

如果某软件并未自带.desktop文件，比如AppImage格式的App，则需要手写.desktop文件，基本方式也比较简单

```desktop
[Desktop Entry]
Type=Application  #不用改
Name=MyApp #显示名
Path=/home/xxx/myapp/ #app路径
Exec=/home/xxx/myapp/Downloaded.AppImage #要执行的命令
Icon=/home/xxx/myapp/Downloaded.png #icon图标
Categories=Tools #开始菜单的分类
```

## Discover取消代理设置

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

