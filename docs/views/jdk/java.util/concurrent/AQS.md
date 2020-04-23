---
date: 2020-04-18
categories:
  - JDK
tags:
  - 源码
publish: false
---

# JDK源码-AQS

## 1. 整体架构

AQS作为JDK实现并发处理的核心类，提供了线程并发控制所需要的一些基础能力，比如公平锁，互斥锁等。

AQS内部维护一个双向链表(CLH Queue)，内部存储Node实例，Node实例存储了线程/ConditionQueue的状态，当获取锁/释放锁等操作发生时，通过CAS操作遍历此链表来提高效率。

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

- SIGNAL: -1 Node被激活，其后代已经或即将被block
- CANCELLED: 1 Node被取消，可能的原因是超时或interrupt，注意这是唯一>0的状态，所以一般判断如果waitStatus>0则Node为Cancelled状态
- CONDITION: -2 Node在Condition Queue里，除非被转移，不然不可以用作同步队列的No~de
- PROPAGATE: -3 当前Node被releaseShared，且需要被扩散，只出现在head里
- 0: 初始状态

整个设计的目标是可以通过符号来判断Node是否需要被SIGNAL，当为正时不需要。

## 3. AQS的waitQueue

AQS实例，内部存储一个双向队列，通过```head```和```tail```两个指针来存储队列的头和尾。

入队操作：通过CAS操作来set tail指针

unpark指定Node的后代：unpark指定的线程：先尝试入参节点的next指向的Node，如果为空或者已经Cancel，则从tail向前遍历到**最前面**可以unpard的线程。

PS:为什么是向前追溯？Unpark只是保证调用的时间的状态中需要unpark的线程被唤起~，因为并发同时可能还有线程在入队，新入队线程会自动放到队列尾，导致状态变更
