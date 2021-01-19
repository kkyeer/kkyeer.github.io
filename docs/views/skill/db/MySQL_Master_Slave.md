---
date: 2021-01-06
categories:
  - 分布式
tags:
  - MySQL
publish: false
---

# MySQL主从宕机切换与数据一致性

![MySQL官方对于主从的说明](https://dev.mysql.com/doc/internals/en/replication.html)

## 主从模式延迟与读写分离

根据MySQL官方文档，主从复制的过程分为下列步骤

1. 收到数据变更语句，写出binlog【同步】
2. 

## 主从切换

## 主库宕机与恢复

## 从库升级后宕机与恢复

## 宕机-恢复过程数据处理