---
date: 2021-11-08 11:50:29
categories:
  - JDK源码
tags:
  - 源码
  - 并发
publish: false
---

# JDK源码-ForkJoinPool

## 简介

- ForkJoinPool的特点：work-stealing，优势
  - 一个task可以fork其他subtask
  - 许多小task提交到线程池
  - 线程池参数:asyncMode =true????
  - 事件驱动的task，不join的时候
- commonPool():动态回收和创建线程
- parallelism level:默认等于number of available processors???
- 理论上会动态增加/休眠/恢复线程，但是BIO情况下无法保证：ForkJoinPool.ManagedBlocker？？？
- 调用形式

s is the case with other ExecutorServices, there are three main task execution methods summarized in the following table. These are designed to be used primarily by clients not already engaged in fork/join computations in the current pool. The main forms of these methods accept instances of ForkJoinTask, but overloaded forms also allow mixed execution of plain Runnable- or Callable- based activities as well. However, tasks that are already executing in a pool should normally instead use the within-computation forms listed in the table unless using async event-style tasks that are not usually joined, in which case there is little difference among choice of methods.？？？？？？？？

| 场景                           | 客户端call            | 内部计算                                      |
| ------------------------------ | --------------------- | --------------------------------------------- |
| Arrange async execution        | execute(ForkJoinTask) | ForkJoinTask.fork                             |
| Arrange exec and obtain Future | submit(ForkJoinTask)  | ForkJoinTask.fork (ForkJoinTasks are Futures) |
| Await and obtain result        | invoke(ForkJoinTask)  | ForkJoinTask.invoke                           |

- fjp的commonPool参数可以由system properties指定

> implementation Overview

- 有多个queue？？？
- 每个queue的动作只允许owning线程执行:push,pop,pull(或者上锁)
- 每个线程有自己的任务queue，或者从其他线程steal
- 线程池本身创建、激活、注销、阻塞、terminate 线程，依靠非中心化信息
- ctl变量存储了各种信息，id count negation
- runState变量存储状态位
- !!runstate在高度竞争的情况下，使用wait/notify来唤醒，有性能问题
- scanState被worker和pool用来标识是否active，**低16位表示此worker在pool的index**
- work-stealing的核心操作,出队列-设置状态
- memory ordering!!!!volatile的base变量，and always read it before other fields.The owner thread must ensure ordered updates, so writes use ordered intrinsics unless they can piggyback on those for other writes. ???这里具体在代码怎么体现的
- FJP里构建线程：ThreadFactory返回null则忽略，只是少个线程。如果抛异常，会抛出
- worker不活跃的放到wait queue（等待被唤醒）。队列的问题，一个producer线程，看不到处于暂态的worker(这个worker不在steal，但是没有进入wait queue）.解决方案：scanners compute checksums of queue states during sweeps.Workers give up and try to deactivate only after the sum is stable across scans.
- join的处理:joiner线程直接执行,或者补偿
- join的处理:每个worker的currentSteal记录了最近steal的任务,currentJoin记录了在join的task
- join的处理:对于补偿(compensation),老版本是立即补偿(即时一个线程因为gc而block),但是效果不好,原因是大部分情况下这些gc都是正常的
- 因为线程在准备销毁时就-1了,所以实际的线程数可能(在有线程被销毁中)偶尔超过限制
- 外部线程提交到common pool的时候,即使join了,也可以进行子线程处理,不然这些提交者等待完成时会被block,所以在不适用的场景下,额外的工作(这些工作是通过通过大量稀疏的状态检查实现的) 相当于ForkJoinTask.Join之前自旋等待的另外一种奇怪的表现形式

## 动态调整线程状态/数量
