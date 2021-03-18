---
date: 2021-03-01
categories:
  - Java
tags:
  - 并发
  - 线程池
publish: true
---

# JDK源码-ThreadPoolExecutor

JVM中的线程与JVM Thread对象，os_thread系统线程一一对应，由于线程本身的申请、销毁以及上下文切换比较耗费资源，因此需要合理的复用已创建的Thread对象，JDK原生提供了ThreadPoolExecutor类来提供池化线程对象的实现。

## 基本数据结构

## 线程池的核心参数

coreSize: 核心线程数
maxSize: 最大线程数
idleKeepTime: 超过核心线程数的线程，最大空闲存活时间
Queue:
RejectPolicy:默认是丢弃，还有CallerRun，抛异常，丢弃，丢弃Oldest
ThreadFactory:

## 原生自带的几种线程池

1. FixedThreadPool: core和maxSize固定，Queue为LinkedBlockingQueue且大小为Integer.maxValue，存活0S
2. CachedThreadPool: Queue为SyncronizedQueue，本身不存储Runnable,线程无限增长，线程会被复用，存活60s
3. ForkJoinPool: 特殊的线程池
4. SingleThreadPool: core和max为1，Queue为LinkedBlockingQueue且大小为Integer.maxValue
