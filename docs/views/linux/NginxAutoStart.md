---
date: 2019-07-14
categories:
  - Linux
tags:
  - nginx
publish: true
---

# Nginx开机自动启动

切换到/lib/systemd/system/目录，创建nginx.service文件vim nginx.service

```bash
cd /lib/systemd/system/
vim nginx.service
```

文件内容如下：

```text
[Unit]
Description=nginx
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/nginx/sbin/nginx
ExecReload=/usr/local/nginx/sbin/nginx reload
ExecStop=/usr/local/nginx/sbin/nginx quit
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

退出并保存文件，执行systemctl enable nginx.service使nginx开机启动

```bash
systemctl enable nginx.service
```

---------------------

本文来自 stinkstone 的CSDN 博客 ，全文地址请点击：<https://blog.csdn.net/stinkstone/article/details/78082748?utm_source=copy>
