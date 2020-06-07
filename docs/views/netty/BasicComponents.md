---
date: 2020-06-04
categories:
  - Netty
tags:
  - Netty
publish: false
---

# Netty 基本组件

- Channel: 抽象的IO事件处理接口，read/write
- ChannelHandler: 数据处理接口
- ChannelPipeline: 串联ChannelHandler
- EventLoop:
- ChannelFuture: 配合ChannelFutureListener实现异步回调
- Bootstrap: 用来初始化，分为ServerBootstrap和Bootstrap(客户端用)

## 为什么Netty管理Channel不需要多线程同步

Channel-EventLoop是一一对应的，而EventLoop会绑定唯一的Thread

## ChannelHandler

### 分类

分为ChannelInboundHandler和ChannelOutboundHanlder两种，Netty对此有一系列包装，提供了```ChannelInboundHandlerAdapter```和```ChannelOutboundHandlerAdapter```两套抽象类，实际使用时，可以继承两种实现或其子类来进行进一步的扩展。

> Inbound: Client -> Server
> Outbound: Server -> Client

### Encoder/Decoder

Encoder和Decoder是特殊的ChannelHandler，分别对应Outbound和Inbound的情况，Netty自带某些实现，其中```ByteToMessageDecoder```将byte流解析成对象(Message)，典型的如```ProtobufDecoder```

注意，**使用EventExecutorGroup来管理阻塞式的逻辑**

## Channel

### 功能

- 消息格式转换
- 异常通知
- Channel状态变更(Active,Inactive)通知
- Channel从EventLoop中注册/注销通知
- 自定义事件通知

### 多线程

<!-- TODO Channel保证线程安全？保证的是什么-->

### Channel分类

| Name     | Package                     | 描述                             |
|----------|-----------------------------|----------------------------------|
| NIO      | io.netty.channel.socket.nio | 使用java.nio.channel             |
| OIO      | io.netty.channel.socket.oio | 使用java.net包                   |
| Local    | io.netty.channel.local      | vm内部通信                       |
| Embedded | io.netty.channel.embedded   | 嵌入式，不依赖网络通信，适合测试 |
