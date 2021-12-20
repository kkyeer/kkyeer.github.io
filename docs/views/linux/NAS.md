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
  -v /data/windown:/data/downloads \
  --restart unless-stopped \
  linuxserver/qbittorrent
```

## EMBY

```shell
docker run -d -v /etc/emby/config:/config -v /data/nas:/mnt/nas -p 8920:8920 -p8096:8096 --name emby  emby/embyserver
```

## jellyfin

```shell
docker run -d -v /etc/jellyfin/config:/config -v /data/nas:/mnt/nas -p 28920:8920 -p28096:8096 
--device=/dev/dri/renderD128 
--device /dev/dri/card0:/dev/dri/card0
--name jellyfin  jellyfin/jellyfin
```

docker create \
  --name=qbittorrent2 \
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
  -v /data/windown:/data/downloads \
  --restart unless-stopped \
  linuxserver/qbittorrent