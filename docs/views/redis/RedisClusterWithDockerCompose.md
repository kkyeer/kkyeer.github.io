---
date: 2020-05-05
categories:
  - 待发布
tags:
  - docker-compose
  - redis-cluster
publish: false
---

# 使用Docker-compose设置redis集群

## 安装Docker和DockerCompose

略

## Docker Compose 配置文件

```yml
version: "3"
services:
  redis11:
    image: redis:6.0.1
    command:
      redis-server --bind 0.0.0.0 --maxmemory 20mb --save 900 1
    container_name: redis11
    networks:
      redis_network:
        ipv4_address: 172.19.0.11
    restart: always

  redis12:
    image: redis:6.0.1
    command:
      redis-server --bind 0.0.0.0 --maxmemory 20mb --slaveof 172.19.0.11 6379 --save 900 1
    container_name: redis12
    networks:
      redis_network:
        ipv4_address: 172.19.0.12
    restart: always

  redis13:
    image: redis:6.0.1
    command:
      redis-server --bind 0.0.0.0 --maxmemory 20mb --slaveof 172.19.0.11 6379 --save 900 1
    container_name: redis13
    networks:
      redis_network:
        ipv4_address: 172.19.0.13
    restart: always
  redis_sentinel_1:
    image: redis:6.0.1
    command:
      redis-sentinel /usr/local/etc/redis/sentinel.conf --save 900 1
    container_name: redis_sentinel_1
    volumes:
      - ./sentinel.conf:/usr/local/etc/redis/sentinel.conf
    depends_on:
      - redis11
      - redis12
      - redis13
    networks:
      redis_network:
        ipv4_address: 172.19.0.101
    restart: always
networks:
  redis_network:
    external: true
```

## 配置集群

首先查看Docker网络中的容器IP

```bash
docker network inspect redis_default
```

然后组网

```bash
redis-cli --cluster create 172.20.0.7:6379 172.20.0.2:6379 172.20.0.3:6379  172.20.0.4:6379 172.20.0.5:6379 172.20.0.6:6379 --cluster-replicas 1
```
