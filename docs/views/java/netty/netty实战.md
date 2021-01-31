---
date: 2021-01-31
categories:
  - Java
tags:
  - Netty
publish: false
---

# 《Netty实战读书笔记》

1. Future/Callback netty的处理逻辑
2. Handler
3. 关注点分离
4. EventLoop是由**一个线程**执行的，负责管理一个Channel的事件并分发，因此（不需要考虑ChannelHandler的同步问题）？？？
5. channelReadComplete事件，标识上次读到的数据为最后的数据，如何判断？
6. 启动服务器，EventGroup/Bootstrap/pipeline/channel class/bind/Future/Channel Initializer

## Bootstrap

存储程序配置的容器,ServerBootstrap,Bootstrap

## Channel

IO接口抽象，定义了read,write,connect,bind四种操作，常用的Channel如SocketNioChannel

## Channel Handler

流上**事件**处理器，如active，read事件

## Channel Pipeline

Channel Handler处理链，每一个Channel都有对应的pipeline，在Channel对象初始化时会实例化一个pipeline对象

## Channel Initializer

// TODO Initializer本身**如何**作为ChannelHandler注册到pipeline上，调用完方法注册后，将自己删除
传入Channel Pipeline对象，允许操作此pipeline，同时此类也实现了Channel Handler接口

## EventLoop/EventLoopGroup

一个EventLoop处理多个Channel的事件，一个EventLoopGroup处理多个EventLoop

## ChannelFuture

异步操作的返回值，允许调用此类的方法注册ChannelFutureListener来响应完成事件
