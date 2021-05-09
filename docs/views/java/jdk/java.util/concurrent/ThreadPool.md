# JDK中的线程池

## 线程池的核心参数

coreSize:
maxSize:
idleKeepTime:
Queue:
RejectPolicy:默认是丢弃，还有CallerRun，抛异常，丢弃，丢弃Oldest
ThreadFactory:

## 原生自带的几种线程池

1. FixedThreadPool: core和maxSize固定，Queue为LinkedBlockingQueue且大小为Integer.maxValue，存活0S
2. CachedThreadPool: Queue为SyncronizedQueue，本身不存储Runnable,线程无限增长，线程会被复用，存活60s
3. ForkJoinPool: 特殊的线程池
4. SingleThreadPool: core和max为1，Queue为LinkedBlockingQueue且大小为Integer.maxValue
