---
date: 2024-10-01 22:35:54
categories:
  - Linux
tags:
  - Linux
  - AndroidTV
  - Self Host
publish: true
---

# AndroidTV安装CA证书

1. openssl x509 -inform PEM -subject_hash_old -in your-certificate.pem | head -n 1
    将 your-certificate.pem 替换成你的证书全路径，执行之后会得到一个 hash 值，如：711d79cc
2. 将你本地的 xxx.pem 证书 重命名为 上一步得到的 hash.0，如：711d79cc.0
3. 通过 adb 链接设备:```sudo adb connect 192.168.1.xxx```
4. 切换为root:```adb root```
5. 重新mount分区:```adb remount```
6. 文件传送：```adb push hash.0 /system/etc/security/cacerts/hash.0```
7. 更改权限:```adb shell chmod 644 /system/etc/security/cacerts/hash.0```

ps : /system/etc/security/cacerts TV 设备的证书存储在此目录下，最终目的就是将需要安装的证书，push 到这里即代表已安装。

参考：[Android TV、Phone 安装 CA 证书](https://cmlgithub.github.io/2021/06/30/Android%20TV%20Phone%20%E5%AE%89%E8%A3%85%20CA%20%E8%AF%81%E4%B9%A6/)
