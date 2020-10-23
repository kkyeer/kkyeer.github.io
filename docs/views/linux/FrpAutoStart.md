---
date: 2020-08-09
categories:
  - Linux
tags:
  - 
publish: true
---

# Frp自动启动

## 配置Service

使用systemctl来控制启动
首先

```shell
sudo vim /lib/systemd/system/frpc.service
```

frpc.service里写入以下内容

```shell
[Unit]
Description=frpc service
After=network.target network-online.target syslog.target
Wants=network.target network-online.target

[Service]
Type=simple

#启动服务的命令（此处写你的frpc的实际安装目录）
ExecStart=/your/path/frpc -c /your/path/frpc.ini

[Install]
WantedBy=multi-user.target
```

## 启动服务

```shell
sudo systemctl start frpc
```

## 打开自启动

```shell
sudo systemctl enable frpc
```

查看应用日志 sudo systemctl status frps
