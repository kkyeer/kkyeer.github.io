---
date: 2019-04-20
categories:
  - Linux
tags:
  - Wine
  - Ubuntu
publish: true
---

# Ubuntu系统使用Wine方式安装钉钉和微信

## 安装Wine

```bash
sudo apt-get install -y wine winbind gnome-shell-extension-top-icons-plus gnome-tweaks
```

## 安装钉钉

从官网下载钉钉的exe安装文件后

```bash
wine ~/Downloads/DingTalk-x.exe
```

## 下载DLL并配置

下载dll，需要替换的dll在[深度论坛](https://bbs.deepin.org/forum.php?mod=viewthread&tid=182213)下载，具体的dll文件名为riched20.dll和msctf.dll。下载dll后，替换到~/.wine/drive_c/windows/syswow64/

终端运行 winecfg，新建配置指向/.wine/drive_c/Program\ Files\ \(x86\)/DingDing/main/current/DingTalk.exe
，然后在函数库里添加 riched20.dl riched32.dll msvcp60.dll msvcp120.dll

## 托盘

打开gnome-tweaks，在扩展里打开top-icon-plus
