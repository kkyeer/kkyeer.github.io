---
date: 2021-04-24 12:07:42
categories:
  - 
tags:
  - 
publish: false
---
# NAS

## 　SAMBA

```shell
sudo mount -t cifs //192.168.50.150/download /mnt/download -o username=kkyeer,sec=ntlmssp,iocharset=utf8,uid=0,gid=0
```

## qbittorrent

```shell
docker create \
  --name=qbittorrent \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Asia/Shanghai \
  -e UMASK_SET=022 \
  -e WEBUI_PORT=41234 \
  -e WEBUI_ADDRESS=0.0.0.0 \
  -p 6881:6881 \
  -p 6881:6881/udp \
  -p 41234:41234 \
  -v /etc/qbittorrent/:/config \
  -v /data/download:/downloads \
  --restart unless-stopped \
  linuxserver/qbittorrent
```
