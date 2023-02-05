---
date: 2023-01-07 20:43:03
categories:
  - 懂
tags:
  - Tomcat
  - 故障
  - 问题
publish: true
---

# Tomcat服务，OOM导致异常不自动恢复研究

某晚，收到同事的告警:“xx服务预发环境挂了，报超时和404错误，**来回持续半个小时了**，不像是发布导致的，看下？”

由于是预发环境，且整体影响面不大（只是间歇不可用），有足够的时间慢慢排查，因此暂时没有回滚。

> 服务栈
>
> - 服务为内部服务，服务间使用OpenFeign作为RPC调用手段，使用SpringBoot+默认Tomcat作为Http服务提供者
> - 使用注册中心进行服务注册发现，使用SpringCloud默认的```/actuator/health```接口作为健康检查指标
> - k8s服务整合进程探测，同时与注册中心通信，作为容器健康检查的2个因子，持续3次全部健康检查失败的容器会被销毁并重新拉起（**预发环境关闭了这个逻辑**）

## 1. 404错误

404错误一般是由于预发环境仅单节点，服务因为FullGC等原因健康检查失败导致被注册中心摘除后，暂时没有服务提供者导致，对于线上环境会快速拉起新容器短暂恢复，对于预发环境一般需要等服务恢复后重新注册，然后又出现问题

- 查看注册中心事件日志发现确实持续有节点健康检查失败事件
- 容器内部检查后发现服务进程正常，8080端口正常绑定，但是```netstat```指令的输出，第2列和第3列与平时貌似不太一样
![tcprecvnotempty](https://cdn.jsdelivr.net/gh/kkyeer/picbed/tcprecvnotempty.png)
- 经验判断服务出现了某些异常导致健康检查失败，考虑到调用方有较多的超时报错，从此处入手是一个不错的思路

## 2. 健康检查失败同时调用方超时的一般思路

### 2.1 RT高的时间线

![RTHighHealthCheck](https://cdn.jsdelivr.net/gh/kkyeer/picbed/RTHighHealthCheck.png)

接口调用超时一般分为2种，建连超时（```connectionTimeout```）和响应发送/读取超时（```socketReadTimeout```）,按一般经验，当出现某接口RT高时，两者会交替出现

1. 最初是接口RT高，调用方报错超时（也有可能不报错，看调用方的容忍度），本服务Tomcat线程堆积
   - 这里与接口RT(ms)，QPS，Tomcat最大线程数3个参数有关，当3者出现如下关系时，会导致Tomcat线程持续堆积，即线程无法即使处理请求并释放到线程池
   - ![QpsRTThread2](https://cdn.jsdelivr.net/gh/kkyeer/picbed/QpsRTThread2.svg)
   - 注意这里是假定服务只有一个接口，实际上服务同时有很多接口所以会有所偏差
   - 举例，一般来说Tomcat线程池默认200，假设某接口集群QPS为20000，集群规模50，则单节点承受400QPS压力，此时接口RT至少要保持在 200*1000/400=500ms 以下才可保证线程池始终有可用的线程

2. Tomcat线程很快达到最大线程数，线程池没有线程来立即处理请求，此时请求排队进行处理，上游```socketReadTimeout```超时报错逐渐增多
3. 线程堆积到一定程度，开始拒绝TCP连接，此时上游开始报错```connectionTimeout```，建立连接失败
4. 与此同时，健康检查调用```/actuator/health```接口也超时，此时被暂时从注册中心摘除
5. 随着被注册中心摘除，新请求暂时不会调用到问题pod，积压请求处理完成后，pod恢复正常，健康检查成功，重新放入注册中心
6. 由于接口RT仍旧存在问题，如此往复

根据上面的分析，碰到双超时出现，首先分析接口RT，90%的情况下通过接口监控定位到特别慢的接口，再结合调用链监控或者性能剖析，定位到具体的代码位置可解决。

但是这次通过接口定位发现所有接口的RT都有大幅上升，排查性能瓶颈与依赖后，发现根本原因是某处请求处理代码，实现时未考虑大数据量的处理，导致出现OOM报错，代码修改后问题解决。

但是深入观察发现，问题代码需要某条特殊的响应才会触发（1小时以上才会有1次请求），确实导致了1分钟的FullGC和OOM异常，经验来说，请求处理线程因为OOM报错后，线程销毁，栈上引用消失，最多1次FullGC后，容器会恢复正常响应，但是现象中说超时持续了半小时没有自动恢复，为什么？

详细排查日志后发现，在MQ线程OOM报错的同时，Tomcat有个Acceptor线程同时OOM异常，以往碰到的情况都是exec线程崩溃但会自动恢复，会不会这个线程不一样？
![TomcatAcceptorOOM](https://cdn.jsdelivr.net/gh/kkyeer/picbed/TomcatAcceptorOOM.png)

## 3. Accetpor线程不会自动恢复

Tomcat的核心Acceptor线程在建连后崩溃，但是端口仍旧绑定中，最终的结果是TCP连接可以建立（系统内核处理的部分），但是TCP请求体无法被取回处理（Tomcat的Acceptor线程处理的部分），这个时候需要了解下Tomcat的线程模型(图引用自 [Tomcat线程模型全面解析](https://zhuanlan.zhihu.com/p/555519862))，以及线程（池）恢复机制

![TomcatNioThreadPool](https://cdn.jsdelivr.net/gh/kkyeer/picbed/TomcatNioThreadPool.png)

以上是模型图，事实上不同的线程初始化的数量是不一致的，线程崩溃后的恢复策略也不一致

下面是具体的实例，在5分钟左右模拟了一次OOM导致的Acceptor线程崩溃（代码参见[Github](https://github.com/kkyeer/lab/tree/explore/oom_kill_tomcat_acceptor))

![TomcatRunningThread](https://cdn.jsdelivr.net/gh/kkyeer/picbed/TomcatRunningThread.png)

进一步的观测网络异常栈
![20230205182952](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20230205182952.png)
![20230205183107](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20230205183107.png)
![20230205183225](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20230205183225.png)

从模型、模拟以及现象观察中可以得出初步结论：**程序启动时，Acceptor线程只有一个，此线程OOM后没有被恢复，导致新请求阻塞在内核的TCP队列中**，更进一步的论证需要Tomcat源码解析，与下文代码有关，可以看到，只有一个线程，且无异常恢复机制

```Java
// org.apache.tomcat.util.net.AbstractEndpoint#startAcceptorThread
protected void startAcceptorThread() {
    acceptor = new Acceptor<>(this);
    String threadName = getName() + "-Acceptor";
    acceptor.setThreadName(threadName);
    Thread t = new Thread(acceptor, threadName);
    t.setPriority(getAcceptorThreadPriority());
    t.setDaemon(getDaemon());
    t.start();
}
```

> 参考

- [Tomcat线程模型全面解析](https://zhuanlan.zhihu.com/p/555519862)
- [Tomcat支持的四种线程模型](http://uniquezhangqi.top/2018/10/27/Tomcat-Tomcat%E6%94%AF%E6%8C%81%E7%9A%84%E5%9B%9B%E7%A7%8D%E7%BA%BF%E7%A8%8B%E6%A8%A1%E5%9E%8B/)
- [从连接器组件看Tomcat的线程模型——NIO模式](https://www.cnblogs.com/54chensongxia/p/13289174.html)
- [Tomcat 网络处理线程模型](https://www.jianshu.com/p/be9bf92de667)
