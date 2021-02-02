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

存储程序配置的容器,ServerBootstrap,Bootstrap，
ServerBootstrap有两个EventLoopGroup，一个负责处理来的Channel，另一个负责处理与客户端建立好的Channel？？？（这两个什么区别？？？）

## Channel

IO接口抽象，定义了read,write,connect,bind四种操作，常用的Channel如SocketNioChannel

channel是线程安全的？？？（如何理解这个的线程安全）

### 方法

1. isActive
2. write
3. writeAndFlush

### Channel的生命周期

Channel Registered -> Channel Active -> Channel Inactive ->
Channel Unregistered

## Channel Handler

流上**事件**处理器，如active，read事件，netty提供了类似***ChannelInboundHandlerAdapter***的基础类，这些类实现了对应的接口，内部将对应的事件转发到Pipeline的下一个Handler

### 数据写出

一般在Channel Handler内部保存ChannelHandlerContext，并通过这个引用写出数据。写出数据有两种方式，一种是获取Channel对象写出，数据从最后一个OutboundHandler处理，另一种是通过ChannelHandlerContext写出，数据从***下一个OutboundHandler***开始处理

## Channel Pipeline

Channel Handler处理链，每一个Channel都有对应的pipeline，在Channel对象初始化时会实例化一个pipeline对象

## Channel Initializer

// TODO Initializer本身**如何**作为ChannelHandler注册到pipeline上，调用完方法注册后，将自己删除

传入Channel Pipeline对象，允许操作此pipeline，同时此类也实现了Channel Handler接口

## EventLoop/EventLoopGroup

一个EventLoop处理多个Channel的事件，一个EventLoopGroup处理多个EventLoop

## ChannelFuture

异步操作的返回值，允许调用此类的方法注册ChannelFutureListener来响应完成事件

## Transport

NIO
OIO
LOCAL:VM内通信
EMBEDDED:测试用
？？？如何体现？Channel不一样？

## ByteBuf

Netty使用引用计数来判断ByteBuf对象是否可以被释放

类型：

1. HeapBuf: 堆上分配的Buffer
2. DirectBuffer: allocate和deallocate代价比较高，需要池化
3. CompositeByteBuf: 包装各种Buffer，比如分离Header的buf和Body的Buf

### Discard和Clear

1. Discard:将当前的读位置后的数据复制到头部，涉及到复制
2. clear:重置指针位置

### ByteBufAllocator

负责初始化，分配内存

### Pooled/Unpooled

### ByteBufUtil

## 冷知识

### 客户端连接服务器的最大连接数

对于Windows，由于动态分配端口限制为1024-5000，所以客户端连接最大3077
对于Linux，单进程收ulimit限制，最多1024个句柄，去除标准输入输出，错误输出，剩1021个

### ByteBuff的最大值

默认Integer.Max_VALUE,即2G byte
