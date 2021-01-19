---
date: 2021-01-19
categories:
  - 知识技能
tags:
  - VPN
publish: true
---

# 强制OpenVPN仅指定网段走VPN

在服务端没有配置Split Tunneling的情况下，客户端手动配置

## 前提条件

1. 拿到ovpn文件
2. 使用TunnelBlick能连接成功

## 步骤(Mac)

1. TunnelBlick配置，与正常配置相同
2. 停止正在运行的VPN
3. 找到ovpn配置文件，路径```/Library/Application\ Support/Tunnelblick/Shared/{你的VPN在TunnelBlick的名称}.tblk/Contents/Resources
4. 在配置文件增加下面几行

    说明：

    ```config
    route-nopull    <- 此行固定
    route 10.1.0.0 255.255.0.0   <- 第一部分route固定 第二部分为网段 第三部分为子网掩码
    ```

    实例：

    ```config
    route-nopull    
    route 10.111.0.0 255.255.0.0
    route 10.122.0.0 255.255.0.0
    ```

5. 重启VPN
