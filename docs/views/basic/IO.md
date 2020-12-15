---
date: 2020-12-14
categories:
  - 通识
publish: true
---

# Java中的IO模型与响应式编程

Java中的IO模型分为阻塞式IO、非阻塞式IO，IO多路复用，异步IO，事件驱动5种：

- 阻塞式IO：Blocking IO，BIO，阻塞当前线程，等待IO完成后进行后续业务操作，线程模型，每个线程同时段仅处理一个IO请求
- 非阻塞IO：Non-Blocking IO，NIO，
- 异步IO：Async IO，类似BIO，区别是将后续业务操作包裹在另外一个线程中丢给线程池执行，Java中的实现为Future和Callback模型（注意**不是**Callable），后者典型的如Swing的EventListener
- IO多路复用：继承自Unix的IO Multiplex，
- 事件驱动：