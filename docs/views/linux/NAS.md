---
date: 2021-04-24 12:07:42
categories:
  - 
tags:
  - 
publish: false
---
# NAS

## SAMBA

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
  --net=host \
  -v /etc/qbittorrent/:/config \
  -v /data/download:/downloads \
  -v /data/windown:/data/downloads \
  --restart unless-stopped \
  linuxserver/qbittorrent
```

## EMBY

```shell

# 找到render组的gid
getent group render | cut -d: -f3

# 假设上面是108

 docker run -d -v /etc/emby/config:/config -v /data/nas:/mnt/nas -p 8920:8920 -p8096:8096 --name emby \
 --device /dev/dri/renderD128:/dev/dri/renderD128 \
 --env UID=1000 \
 --env GID=108 \
 --env GIDLIST=108 \
 lovechen/embyserver
```

注意这里的108是render组的id

## jellyfin

```shell
docker run -d -v /etc/jellyfin/config:/config -v /data/nas:/mnt/nas -p 28920:8920 -p28096:8096 \
 --device /dev/dri/renderD128:/dev/dri/renderD128 \
 --env UID=1000 \
 --env GID=108 \
 --env GIDLIST=108 \
--name jellyfin  jellyfin/jellyfin
```

完成后，需要手动升级jellyfin-ffmpeg(10.7.0问题)
下载路径: https://repo.jellyfin.org/releases/server/debian/stable/ffmpeg/jellyfin-ffmpeg_4.4.1-4-buster_amd64.deb
安装:

```shell
docker exec -it jellyfin /bin/bash
dpkg -i xxx.deb
```

## PVE配置ipv6

```shell
vi /etc/network/interfaces
```

```conf
iface vmbr0 inet6 static
        address your ipv6 prefix::3
        gateway your ipv6 prefix::1
        netmask 64
```

## nginx

```shell
docker run --name tmp-nginx-container -d nginx
docker cp tmp-nginx-container:/etc/nginx/nginx.conf /etc/nginx/nginx2.conf
docker cp tmp-nginx-container:/etc/nginx/mime.types /etc/nginx/mime.types
docker rm -f tmp-nginx-container

docker run --name nginx -d --net=host \
-v /etc/nginx/:/etc/nginx/:rw \
nginx
```
