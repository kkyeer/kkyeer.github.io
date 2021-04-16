---
date: 2021-03-01
categories:
  - Java
tags:
  - 并发
  - 线程池
publish: false
---

# JDK源码-ThreadPoolExecutor

JVM中的线程与JVM Thread对象，os_thread系统线程一一对应，由于线程本身的申请、销毁以及上下文切换比较耗费资源，因此需要合理的复用已创建的Thread对象，JDK原生提供了ThreadPoolExecutor类来提供池化线程对象的实现。

## 基本数据结构

## 线程池初始化核心参数

coreSize: 核心线程数
maxSize: 最大线程数
idleKeepTime: 超过核心线程数的线程，最大空闲存活时间
Queue: 存储Runnable对象的队列
RejectPolicy: 线程无法存入线程池时会被调用，默认是丢弃，还有CallerRun，抛异常，丢弃Oldest，也可以扩展自己的实现
ThreadFactory: 初始化Thread实例的工厂类

## 原生自带的几种线程池与参数

1. FixedThreadPool: core和maxSize固定，Queue为LinkedBlockingQueue且大小为Integer.maxValue，存活0S
2. CachedThreadPool: Queue为SyncronizedQueue，本身不存储Runnable,线程无限增长，线程会被复用，存活60s
3. ForkJoinPool: 特殊的线程池
4. SingleThreadPool: core和max为1，Queue为LinkedBlockingQueue且大小为Integer.maxValue

## 线程池提交Task过程

一般来说，调用execute方法来提交Runnable对象到线程池中，对于JUC包中的ThreadPool实现，大概流程如下

![execute.svg](https://cdn.jsdelivr.net/gh/kkyeer/picbed/execute.svg)

代码及解析

```java
public void execute(Runnable command) {
  // 防御性编程
    if (command == null)
        throw new NullPointerException();

    // 获取线程池当前状态
    int c = ctl.get();
    if (workerCountOf(c) < corePoolSize) {
      // 第一次判断线程池数量，如果小于corePoolSize，则理论上应该新增Core线程（Worker）

      // ！！！多线程安全！！！
      // addWorker方法为原子性，这里原子性的意义为，考虑变量c为局部变量，上面判断workerCountOf(c)方法执行完以后，
      // 可能在另外的线程又成功执行了execute方法，导致执行到此时，实际的count已经等于corePoolSize，
      // 此时addWorker方法会返回false，类似CAS的思路
        if (addWorker(command, true))
            return;
      // 如果上面新增Core线程失败，则说明c有变化，重新获取
        c = ctl.get();
    }
    // 执行到此，说明核心线程已满

    // 判断线程池是否Running，尝试将command加入队列
    if (isRunning(c) && workQueue.offer(command)) {
        // command加入队列成功

        // ！！！多线程安全！！！
        // 这里重新获取并检查线程池状态
        int recheck = ctl.get();
        // 如果线程池非运行，调用remove方法，此方法尝试将上面入队的command移出队列，并调用拒绝策略
        if (! isRunning(recheck) && remove(command))
            reject(command);
            // 二次检查线程池状态发现是进行中，再次检查worker数量，如果worker数量为0，新增一个worker，空command，且为核心线程
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    // 线程池Running，且入队列失败，新建非核心线程执行command
    else if (!addWorker(command, false))
    // 线程池Running，入队列失败，新建非核心线程失败，调用拒绝策略
        reject(command);
}
```

### 线程池状态与数量

对于ThreadPool对象来说，决定其当前状态有两个参数，state与worker数量，这两个参数需要保证原子性，即不允许出现两者不匹配的情况，因此，与其每次操作时上锁，将之合到一个Atomic变量中效率更高

```java
// 存储线程状态
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
// =29
private static final int COUNT_BITS = Integer.SIZE - 3;
// 前3bit为0，后面为1
private static final int CAPACITY   = (1 << COUNT_BITS) - 1;

// runState is stored in the high-order bits
private static final int RUNNING    = -1 << COUNT_BITS;
private static final int SHUTDOWN   =  0 << COUNT_BITS;
private static final int STOP       =  1 << COUNT_BITS;
private static final int TIDYING    =  2 << COUNT_BITS;
private static final int TERMINATED =  3 << COUNT_BITS;
// Packing and unpacking ctl
private static int runStateOf(int c)     { return c & ~CAPACITY; }
private static int workerCountOf(int c)  { return c & CAPACITY; }
private static int ctlOf(int rs, int wc) { return rs | wc; }
```

### 原子性addWorker方法

### remove方法

### 为什么入队后，再次检查worker数量为0，addWorker参数为(null, false)

## 线程池的线程安全
