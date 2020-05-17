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
  redis1:
    image: redis
    ports:
      - 6380:6379
    volumes:
      - /etc/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command:
      redis-server /usr/local/etc/redis/redis.conf
    container_name: redis1
  redis2:
    image: redis
    ports:
      - 6381:6379
    volumes:
      - /etc/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command:
      redis-server /usr/local/etc/redis/redis.conf
    container_name: redis2
  redis3:
    image: redis
    ports:
      - 6382:6379
    volumes:
      - /etc/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command:
      redis-server /usr/local/etc/redis/redis.conf
    container_name: redis3
  redis4:
    image: redis
    ports:
      - 6384:6379
    volumes:
      - /etc/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command:
      redis-server /usr/local/etc/redis/redis.conf
    container_name: redis4
  redis5:
    image: redis
    ports:
      - 6385:6379
    volumes:
      - /etc/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command:
      redis-server /usr/local/etc/redis/redis.conf
    container_name: redis5
  redis6:
    image: redis
    ports:
      - 6386:6379
    volumes:
      - /etc/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command:
      redis-server /usr/local/etc/redis/redis.conf
    container_name: redis6
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
