# RocketMQ

## 概述

主要优势：

1. 支持延迟队列
2. 支持事务消息
3. 支持灵活配置消息重发
4. Java原生
5. 支持海量Topic
6. 支持服务端推送
7. Broker端tag过滤，减少不必要的网络负载
8. 面向业务

主要缺点：

1. 效率低于Kafka
2. 社区活跃度一般，客户端少
3. 无法自动选主，运维要求高
4. nameserver本身不落盘集群数据、不与其他nameserver通信？？？
5. 由于所有Topic的消息在同一队列，Consumer进度在另外队列，所以读取时，需要进行两次查询，且对于实际定位到对应文件是大文件下的随机读

![20201226132447](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20201226132447.png)

## RocketMQ 的集群

Broker集群：手动指定Broker Name和Broker Id，同一个Broker Name的为同一集群，Broker Id为0的是Master，Master可以部署多个
NameServer：无状态，不进行数据持久化，互相之间不通讯。Broker启动时，需要显式配置所有NameServer，Broker上传自己的Topic信息到NameServer，并保持间隔30S的心跳连接

## 事务消息（两方事务）

网络通信正常流程：
