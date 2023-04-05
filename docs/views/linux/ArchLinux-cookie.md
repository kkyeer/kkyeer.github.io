---
date: 2023-02-26 18:02:09
categories:
  - Linux
tags:
  - Linux
  - ArchLinux
publish: true
---

# Arch Linux不完全折腾指南

## steam-deck关闭只读，开启root

```bash
# 关闭只读
sudo steamos-readonly disable
# 设置密码
passwd
# 配置flatpak镜像
sudo flatpak remote-modify flathub --url=https://mirror.sjtu.edu.cn/flathub
```

## 官方仓库镜像（pacman）

```bash
sudo vim /etc/pacman.d/mirrorlist
    # 文件最后添加清华源
    Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
sudo pacman-key --init
sudo pacman-key --populate archlinux
sudo pacman -Syy
```

[官方镜像源仓库列表](https://archlinux.org/mirrorlist/)

## AUR镜像（伪镜像）

1. 新增archlinuxcn镜像源

```bash
sudo vim /etc/pacman.conf
    # 文档最后增加
    [archlinuxcn]
    Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
sudo pacman -S archlinuxcn-keyring
```

[archlinuxcn源镜像列表](https://github.com/archlinuxcn/mirrorlist-repo)

## pacman基本命令

### 搜索

```shell
sudo pacman -Ss
```

### 卸载

```shell
pacman -R 软件名: 该命令将只删除包，保留其全部已经安装的依赖关系
pacman -Rv 软件名: 删除软件，并显示详细的信息
pacman -Rs 软件名: 删除软件，同时删除本机上只有该软件依赖的软件。
pacman -Rsc 软件名: 删除软件，并删除所有依赖这个软件的程序，慎用
pacman -Ru 软件名: 删除软件,同时删除不再被任何软件所需要的依赖
```

[参考资料](https://hustlei.github.io/2018/11/msys2-pacman.html)

## fcitx5与rime安装与美化

### 安装

```bash
sudo pacman -S fcitx5-im 
sudo pacman -S fcitx5-chinese-addons  fcitx5-rime
sudo vim /etc/environment
    # 文档最后增加
    GTK_IM_MODULE=fcitx
    QT_IM_MODULE=fcitx
    XMODIFIERS=@im=fcitx
    SDL_IM_MODULE=fcitx
yay -S rime-luna-pinyin
yay -S fcitx5-qt
yay -S fcitx5-gtk
yay -S rime-pinyin-zhwiki
yay -S fcitx5-configtool
```

### 美化

```bash
git clone https://github.com/thep0y/fcitx5-themes.git
cd fcitx5-themes
cp spring ~/.local/share/fcitx5/themes -r
cp summer ~/.local/share/fcitx5/themes -r
cp autumn ~/.local/share/fcitx5/themes -r
cp winter ~/.local/share/fcitx5/themes -r
cp green ~/.local/share/fcitx5/themes -r
cp transparent-green ~/.local/share/fcitx5/themes -r
```

修改 ~/.config/fcitx5/conf/classicui.conf

```properties
# 主题(这里要改成你想要使用的主题名，主题名就在下面)
Theme=summer
```

然后重启fcitx5，方式在tray点击重启即可

## 安装自定义CA证书

```bash
sudo trust anchor --store ~/Downloads/rootCA.cer 
sudo update-ca-trust
```

## 基本组件

```bash
sudo pacman -S net-tools dnsutils inetutils
```
