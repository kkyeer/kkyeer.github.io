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

## 输入框无法输入处理

下载dll，需要替换的dll在[深度论坛](https://bbs.deepin.org/forum.php?mod=viewthread&tid=182213)下载，具体的dll文件名为riched20.dll和msctf.dll。下载dll后，替换到~/.wine/drive_c/windows/syswow64/

终端运行 winecfg，新建配置指向/.wine/drive_c/Program\ Files\ \(x86\)/DingDing/main/current/DingTalk.exe
，然后在函数库里添加 riched20.dl riched32.dll msvcp60.dll msvcp120.dll

## 字体乱码处理

新建注册表文件，内容如下,导入注册表，命令:```regedit font.reg```

```regedit
REGEDIT4

[HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\FontSubstitutes]
"Arial"="wqy-microhei.ttc"
"Arial CE,238"="wqy-microhei.ttc"
"Arial CYR,204"="wqy-microhei.ttc"
"Arial Greek,161"="wqy-microhei.ttc"
"Arial TUR,162"="wqy-microhei.ttc"
"Courier New"="wqy-microhei.ttc"
"Courier New CE,238"="wqy-microhei.ttc"
"Courier New CYR,204"="wqy-microhei.ttc"
"Courier New Greek,161"="wqy-microhei.ttc"
"Courier New TUR,162"="wqy-microhei.ttc"
"FixedSys"="wqy-microhei.ttc"
"Helv"="wqy-microhei.ttc"
"Helvetica"="wqy-microhei.ttc"
"MS Sans Serif"="wqy-microhei.ttc"
"MS Shell Dlg"="wqy-microhei.ttc"
"MS Shell Dlg 2"="wqy-microhei.ttc"
"System"="wqy-microhei.ttc"
"Tahoma"="wqy-microhei.ttc"
"Times"="wqy-microhei.ttc"
"Times New Roman CE,238"="wqy-microhei.ttc"
"Times New Roman CYR,204"="wqy-microhei.ttc"
"Times New Roman Greek,161"="wqy-microhei.ttc"
"Times New Roman TUR,162"="wqy-microhei.ttc"
"Tms Rmn"="wqy-microhei.ttc"
```

## 托盘处理

对于Gnome桌面，安装gnome-tweaks，在扩展里安装插件：top-icon-plus
