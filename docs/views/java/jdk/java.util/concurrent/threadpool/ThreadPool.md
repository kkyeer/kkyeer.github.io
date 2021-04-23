---
date: 2021-03-01
categories:
  - JDK源码
tags:
  - 并发
  - 线程池
publish: false
---

# JDK源码-ThreadPoolExecutor

JVM中的线程与JVM Thread对象，os_thread系统线程一一对应，由于线程本身的申请、销毁以及上下文切换比较耗费资源，因此需要合理的复用已创建的Thread对象，JDK原生提供了ThreadPoolExecutor类来提供池化线程对象的实现。

## 概述

### 线程池初始化核心参数

coreSize: 核心线程数
maxSize: 最大线程数
idleKeepTime: 超过核心线程数的线程，最大空闲存活时间
Queue: 存储Runnable对象的队列
RejectPolicy: 线程无法存入线程池时会被调用，默认是丢弃，还有CallerRun，抛异常，丢弃Oldest，也可以扩展自己的实现
ThreadFactory: 初始化Thread实例的工厂类

### 原生线程池与默认参数

1. FixedThreadPool: core和maxSize固定，Queue为LinkedBlockingQueue且大小为Integer.maxValue，存活0S
2. CachedThreadPool: Queue为SyncronizedQueue，本身不存储Runnable,线程无限增长，线程会被复用，存活60s
3. ForkJoinPool: 特殊的线程池
4. SingleThreadPool: core和max为1，Queue为LinkedBlockingQueue且大小为Integer.maxValue

## 线程池execute过程

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

### 线程池运行状态与数量

对于ThreadPool对象来说，决定其当前状态有两个参数，state与worker数量，这两个参数需要保证原子性，即不允许出现两者不匹配的情况，因此，与其每次操作时上锁，将之合到一个Atomic变量中效率更高

```java
// 存储线程状态
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
// =29
private static final int COUNT_BITS = Integer.SIZE - 3;
// 前3bit为0，后面为1，可以理解为mask
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

![ThreadPoolLifeCycle](https://cdn.jsdelivr.net/gh/kkyeer/picbed/ThreadPoolLifeCycle.svg)

注意线程池状态字段，RUNNING是唯一一个非负数，因此判断线程池是否在运行时状态可以使用```rs >= SHUTDOWN```来判断。

运行状态的一些定义：

- RUNNING：接受新任务并处理排队任务
- SHUTDOWN：不接受新任务，但处理排队任务
- STOP：不接受新任务，不处理排队任务，并中断正在进行的任务
- TIDYING：所有任务已经终止，workerCount为零，线程转换到状态TIDYING将运行terminate()钩子方法
- TERMINATED：terminated()已经完成，该方法执行完毕代表线程池已经完全终止

### addWorker方法

![addworker](https://cdn.jsdelivr.net/gh/kkyeer/picbed/addworker.svg)

```java
private boolean addWorker(Runnable firstTask, boolean core) {
        // 1阶段:判断线程池状态，Worker数量+1
        retry:
        for (;;) {
            int c = ctl.get();
            int rs = runStateOf(c);

            // Check if queue empty only if necessary.
            // 这里进行线程池状态检查，如果线程池状态 >= SHUTDOWN意味着线程池非RUNNING
            // 同时检查是否线程池标记为SHUTDOWN且等待队列非空，增加Worker来处理队列中的任务，这种场景发生在线程池标记为SHUTDOWN状态后，清理IdleWorker发现线程数量不够
            if (rs >= SHUTDOWN &&
                ! (rs == SHUTDOWN && firstTask == null && ! workQueue.isEmpty()))
                return false;


            for (;;) {
                int wc = workerCountOf(c);
                if (wc >= CAPACITY ||
                    wc >= (core ? corePoolSize : maximumPoolSize))
                    return false;
                // CAS增加worker数，成功后进入下一阶段
                if (compareAndIncrementWorkerCount(c))
                    break retry;
                c = ctl.get();  // Re-read ctl
                // CAS增加Worker数失败，可能是其他线程也新增/减少了Worker，此时可能会导致线程池状态变化，此处判断下，如果确实线程池状态变化，从外循环开始走，否则继续CAS
                if (runStateOf(c) != rs)
                    continue retry;
                // else CAS failed due to workerCount change; retry inner loop
            }
        }

        // 2阶段：新增Worker
        boolean workerStarted = false;
        boolean workerAdded = false;
        Worker w = null;
        try {
            // Worker对象初始化
            w = new Worker(firstTask);
            final Thread t = w.thread;
            if (t != null) {
                // 重入锁，所有的Worker操作都需要上锁
                final ReentrantLock mainLock = this.mainLock;
                mainLock.lock();
                try {
                    // Recheck while holding lock.
                    // Back out on ThreadFactory failure or if
                    // shut down before lock acquired.
                    int rs = runStateOf(ctl.get());

                    // 同样，有两种线程池状态可以增加Worker:线程池运行中或者SHUTDOWN状态但是增加Worker来处理Queue
                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        if (t.isAlive()) // precheck that t is startable
                            throw new IllegalThreadStateException();
                        workers.add(w);
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                        workerAdded = true;
                    }
                } finally {
                    mainLock.unlock();
                }
                if (workerAdded) {
                    // 线程开启，实际上执行的是ThreadPoolExecutor类的runWorker方法，这里的关键点是
                    // 上面获取的thread的初始化代码: this.thread = getThreadFactory().newThread(this);
                    // 此处newThread(this)中this指向Worker对象，
                    t.start();
                    workerStarted = true;
                }
            }
        } finally {
            // 线程增加失败，可能的原因如线程池状态变化，此时需要把第一阶段增加的线程数减掉
            if (! workerStarted)
                addWorkerFailed(w);
        }
        return workerStarted;
    }
```

>注意，线程开启，实际上执行的是ThreadPoolExecutor类的runWorker方法，这里的关键点是worker.thread的初始化代码: ```this.thread = getThreadFactory().newThread(this);```，此处newThread(this)中this指向Worker对象(**实现了```Runnable```接口**)本身，线程start的时候执行的Worker的run方法如下，注意runWorker方法是ThreadPoolExecutor类中的方法

```java
public void run() {
    // 
    runWorker(this);
}
```

### runWorker方法

![runWorker](https://cdn.jsdelivr.net/gh/kkyeer/picbed/runWorker.svg)

```java
final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();
    Runnable task = w.firstTask;
    w.firstTask = null;
    w.unlock(); // allow interrupts
    boolean completedAbruptly = true;
    try {
        // 寻找新任务
        while (task != null || (task = getTask()) != null) {
            // AQS加锁
            w.lock();
            // If pool is stopping, ensure thread is interrupted;
            // if not, ensure thread is not interrupted.  This
            // requires a recheck in second case to deal with
            // shutdownNow race while clearing interrupt

            // 检查线程池状态，如果是STOP终端本线程，如果非STOP，确认本线程未被外部interrupted
            if ((runStateAtLeast(ctl.get(), STOP) ||
                    (Thread.interrupted() &&
                    runStateAtLeast(ctl.get(), STOP))) &&
                !wt.isInterrupted())
                wt.interrupt();

            try {
                // 生命周期钩子
                beforeExecute(wt, task);
                // 执行
                Throwable thrown = null;
                try {
                    task.run();
                } catch (RuntimeException x) {
                    thrown = x; throw x;
                } catch (Error x) {
                    thrown = x; throw x;
                } catch (Throwable x) {
                    thrown = x; throw new Error(x);
                } finally {
                // 生命周期钩子
                    afterExecute(task, thrown);
                }
            } finally {
                task = null;
                w.completedTasks++;
                w.unlock();
            }
        }
        // worker正常执行完成
        completedAbruptly = false;
    } finally {
        processWorkerExit(w, completedAbruptly);
    }
}
```

### getTask方法

![ThreadPoolGetTask](https://cdn.jsdelivr.net/gh/kkyeer/picbed/ThreadPoolGetTask.svg)

```java
private Runnable getTask() {
    boolean timedOut = false; // Did the last poll() time out?

    for (;;) {
        int c = ctl.get();
        int rs = runStateOf(c);

        // Check if queue empty only if necessary.
        if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
            decrementWorkerCount();
            return null;
        }

        int wc = workerCountOf(c);

        // Are workers subject to culling?
        boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;
        // 检查是否超时，依赖上面的开关，以及每次循环时，下面从队列poll的时候带超时参数，然后判断
        if ((wc > maximumPoolSize || (timed && timedOut))
            && (wc > 1 || workQueue.isEmpty())) {
            if (compareAndDecrementWorkerCount(c))
                return null;
            continue;
        }

        try {
            // 从队列中拿取对象
            Runnable r = timed ?
                workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) :
                workQueue.take();
            if (r != null)
                return r;
            timedOut = true;
        } catch (InterruptedException retry) {
            timedOut = false;
        }
    }
}
```

### 为什么入队后，再次检查worker数量为0，addWorker参数为(null, false)

让Worker调用getTask()方法从队列中拉取任务

## Worker对象

Worker对象继承AQS来实现互斥锁。
实现了Runnable接口，将自己包装到Thread对象里。

### 构造方法

```java
Worker(Runnable firstTask) {
    setState(-1); // inhibit interrupts until runWorker
    this.firstTask = firstTask;
    this.thread = getThreadFactory().newThread(this);
}
```

Worker对象继承AQS，初始化状态为-1，绑定一个新线程，新线程的Runnable对象为**this**，此处细节为Worker对象实现了Runnable接口，在接口的run方法实现中，进行FirstTask任务的执行和队列任务的抢占

## 线程池的线程安全

### Idle线程清除

### Shutdown与新增任务

### Queue快速填满与新增CoreWorker

### Queue快速清空与新增IdleWorker
