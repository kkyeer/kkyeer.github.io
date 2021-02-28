---
date: 2020-04-18
categories:
  - Java
tags:
  - 源码
  - 并发
publish: false
---

# JDK源码-AQS

## 1. 整体架构

AQS位于```java.util.concurrent.locks```包作为JDK实现并发处理的核心类，提供了实现各种锁所需要的一些基础能力，比如公平锁，互斥锁等。

AQS内部维护一个双向链表(CLH Queue)，链表内部存储Node实例，Node实例存储了线程/ConditionQueue的状态，当获取锁/释放锁等操作发生时，通过轻量级的CAS操作来提高效率。

![AQS_try_aquire](https://cdn.jsdelivr.net/gh/kkyeer/picbed/AQS_try_aquire.png)

## 2. Node类

Node存储了一个线程或者ConditionQueue，```thread```属性存储了关联的线程，通过```pre```和```prev```属性来指向当前队列的前后Node。

对于ConditionQueue的情况，节点头部为一个静态实例Node,内部通过```nextWaiter```属性来链接一个单链表

```java
static final class Node {
    /** Marker to indicate a node is waiting in shared mode */
    static final Node SHARED = new Node();
}
```

### 2.1 Node的waitStatus

整个Node类的核心状态，有下面几个选项：

- CANCELLED: 1 Node被取消，可能的原因是超时或interrupt，注意这是唯一>0的状态，所以一般判断如果waitStatus>0则Node为Cancelled状态
- SIGNAL: -1 Node被激活，其后代已经或即将被block
- CONDITION: -2 Node在Condition Queue里，除非被转移，不然不可以用作同步队列的No~de
- PROPAGATE: -3 当前Node被releaseShared，且需要被扩散，只出现在head里
- 0: 初始状态

整个设计的目标是可以通过符号来判断Node是否需要被SIGNAL，当为正时不需要。

## 3. 可重入互斥锁的上锁过程

![ReentrantLock_lock](https://cdn.jsdelivr.net/gh/kkyeer/picbed/ReentrantLock_lock.svg)

1. 首次上锁:AQS的state为0，线程通过cas操作将state设置为1
2. 重入:state通过cas(0,1)失败，判断当前线程是否为互斥锁线程（保存在AQS的父类Field）中
3. 互斥:cas(0,1)不为0时，入队操作（addWaiter），线程CAS失败，则执行enq过程将线程包裹到Node对象并压入waitQueue中，然后执行park过程

AQS的state不为0时的逻辑:

```java
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

```tryAcquire(arg)```方法包含了判断重入的逻辑，如果不可重入，则首先调用addWaiter方法，将此线程压入waitQueue，然后调用```acquireQueued```方法来阻塞

### 3.1 AQS的waitQueue

AQS实例，内部存储一个CLH队列，基本结构为双向链表，称为waitQueue，存储所有正在等待获取锁的线程对应的Node对象，通过```head```和```tail```两个指针来存储链表的头和尾。

### 3.2 addWaiter:入队操作

addWaiter的源码解析如下：

```java
    /**
     * Creates and enqueues node for current thread and given mode.
     *
     * @param mode Node.EXCLUSIVE for exclusive, Node.SHARED for shared
     * @return the new node
     */
    private Node addWaiter(Node mode) {
        Node node = new Node(Thread.currentThread(), mode);
        // Try the fast path of enq; backup to full enq on failure
        Node pred = tail;
        // 判断waitQueue是否初始化，未初始化时,head = tail = null;
        if (pred != null) {
            // 进入此分支说明waitQueue已经初始化，则只需要把当前node挂到队列末尾
            node.prev = pred;
            // CAS操作，把此nodeSet到尾部
            if (compareAndSetTail(pred, node)) {
              // 尾部set成功，补全prev指针，返回
                pred.next = node;
                return node;
            }
            // tail的CAS操作失败，说明另外一个线程抢先set成功tail，则继续下面的enq操作
        }
        enq(node);
        return node;
    }
```

注意，在恰好没有并发的时候，```compareAndSetTail```操作成功，表明node对象成功赋值到尾指针，则只需要补全prev指针即可。但并发严重或者waitQueue未初始化时，很有可能```compareAndSetTail```操作失败，则调用```enq(node)```方法来不断重试入队方法。

```java
    private Node enq(final Node node) {
        for (;;) {
            Node t = tail;
            if (t == null) { // Must initialize
            // 初始化waitQueue,head指向一个新node对象，此对象内部没有Thread
                if (compareAndSetHead(new Node()))
                // CAS成功，queue已经被初始化，则tail指向这次成功的head
                // 注意，此处有另外一种情况即上面的CAS语句成功，但是下面的赋值语句暂未执行，那么在其他线程看来，tail仍旧为null
                // 其他线程仍旧会尝试compareAndSetHead，但是此时head已经不是null了，其他线程CAS一定会失败
                    tail = head;
            } else {
              // CAS操作来抢占tail，抢占成功后补全prev指针
                node.prev = t;
                if (compareAndSetTail(t, node)) {
                    t.next = node;
                    return t;
                }
            }
        }
    }
```

总结起来，初始化queue和tail都是使用cas操作来尝试抢占，抢占失败则进入下次循环，直到成功

### 3.3 state标记

```java
    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor();
                // 由于head不存储线程，则p==head表示此线程已经在队列头，线程可以获取锁
                // 考虑到具体的实现可能在获取锁的时候有另外的操作，如可重入锁，需要记录当前线程，
                // 因此再次调用tryAcquire方法
                if (p == head && tryAcquire(arg)) {
                    // 此时state应该已经不是0，这一方法相当于出队列，会清除node的线程，将node变为虚节点
                    setHead(node);
                    // 原来的head设为null来帮助GC
                    p.next = null; // help GC
                    failed = false;
                    return interrupted;
                }
                // 此方法：标记node节点前面的所有节点状态为Signal，直到遇到node已经为Signal状态的节点
                // 上面直到的意思是，调用到此方法时，可能有多个未标记waitState的新node已经串在前面，因此for循环向前标记
                // 一个节点waitState为Signa代表此节点的后续节点已经park，需要唤醒
                if (shouldParkAfterFailedAcquire(p, node) &&
                // park操作，即标记
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }
```

### 3.4 park操作

```java
    public static void park(Object blocker) {
        Thread t = Thread.currentThread();
        // blocker指针存储在Thread对象上，实际存储的是具体的lock对象，方便监控使用以及死锁时判断具体的锁对象
        setBlocker(t, blocker);
        // 阻塞调用
        UNSAFE.park(false, 0L);
        // 阻塞返回，清除线程上的Thread对象
        setBlocker(t, null);
    }
```

关于```Unsafe.park(false,0)```方法的实现细节可以参考![CSDN博客](https://blog.csdn.net/weixin_43767015/article/details/107207643)

## 4. unlock与唤醒过程

unpark指定Node的后代：unpark指定的线程：先尝试入参节点的next指向的Node，如果为空或者已经Cancel，则从tail向前遍历到**最前面**可以unpark的线程。

PS:为什么是向前追溯？Unpark只是保证调用的时间的状态中需要unpark的线程被唤起~，因为并发同时可能还有线程在入队，新入队线程会自动放到队列尾，导致状态变更，状态变更后，新入队的

## 1.1 互斥锁与共享锁

## 1.2 公平锁与非公平锁

众所周知，AQS作为JUC包的核心类，同时提供了公平锁与非公平锁的实现，两者的区别主要在于在调用tryAccuire
