---
date: 2022-04-05 10:59:40
categories:
  - Linux
tags:
  - Ubuntu
  - KDE
  - 自启
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