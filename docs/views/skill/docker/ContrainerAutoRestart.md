---
date: 2020-08-16
categories:
  - 知识&技巧
tags:
  - Docker
publish: true
---

# Docker容器自动重启

## 容器不存在

```shell
docker run --restart=always
```

## 容器已存在

```shell
docker update --restart=always <CONTAINER ID>
```
