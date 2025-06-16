---
date: 2025-06-09 15:45:56
categories:
  - 疑难问题
tags:
  - k8s
  - 内存
publish: false
---

# 一次k8s容器内存oom-kill问题研究

## 问题现象

公司最近逐步推进JRE8升级到JRE17，在解决了升级初期的一些库升级、兼容问题后，大部分应用容器趋于稳定。
随着升级的服务越来越多，最近发现部分升级JRE17服务的容器有零星的注册中心健康检查失败报错，涉及到多个服务的多个节点，虽然在**报错一次后恢复正常**，但是这个现象是以前这些服务从来没有出现过的，基于不放过任何一个疑点的原则，有必要调查一下原因。

```shell
2025-05-28 10:01:28.330
标题:断开连接(异常)
应用:xxx (default:-1)
实例:10.100.1.1:8080
```

## 初步定位

1. 最初的报错是注册中心发出，查看注册中心的事件日志确认，报错是因为注册中心调用容器的```/actuator/health```接口时，http连接异常断开
2. 一般来说，http连接异常断开有几种可能
   - 网络异常：丢包，延迟，阻塞
   - 调用方超时主动断开：连接超时、读超时
   - 被调用方响应性能异常：建连失败、响应超时、tcp reset
3. 排查异常容器的核心指标，主要是worker线程数量，内网指标tcp丢包率等，排除了上述常见可能性后，再查看容器的事件日志，发现问题容器都有被k8s重启的相关事件，且时间点与注册中心异常告警一致，初步认定**容器被k8s重启是导致注册中心告警的原因**
4. 排查k8s日志，发现对应时间点，容器进程内存占用超过了k8s配置文件对requests.limit的限制，最终导致k8s强制关闭容器
5. 排查容器内存指标，能看到容器的物理内存在30%~40%左右，但是容器内存持续保持在100%接近1分钟，带来了几个问题

问题1: 物理内存和容器内存为什么差距这么大？
问题2: 容器内存具体是什么在占用？

## 内存统计知识补全

- [参考资料:常用的内存查询命令/指标的含义是什么_应用实时监控服务(ARMS)-阿里云帮助中心](https://help.aliyun.com/zh/arms/application-monitoring/developer-reference/memory-metrics)
- [容器内存监控，是看rss还是wss?](https://www.jianshu.com/p/36a1df62cda7)
- [参考资料：容器内存分析](https://qingwave.github.io/container-memory/)

### Linux系统内存分布

![linux_memory2](https://cdn.jsdelivr.net/gh/kkyeer/picbed/linux_memory2.svg)

一般使用free命令来查看系统整体的内存占用

```shell
$ free -mh                                                                                                                                                
               total        used        free      shared  buff/cache    available                                                                    
Mem:            31Gi        15Gi       235Mi       194Mi        15Gi        15Gi
```

1. total：系统物理内存，在启动时会被启动过程，kdump等组件用掉一部分，剩下的是内核和应用程序可以使用的内存，也是free命令中输出的total字段，比物理内存略小一些
2. free：完全未分配的内存
3. buff/cache：由系统管理的缓存
4. used：total - free - buffers - cache
5. shared：Shmem共享内存页（对应共享匿名映射、tmpfs、memfd等场景），也会算到cache里

从第2点可以推断出：total = used + buff/cache + free

其中free很好理解，就是剩余未分配的物理内存，used是减出来的，所以关键是理解buffers和cache内存。

#### 关于buffers/cache

[参考资料](https://zhuanlan.zhihu.com/p/645904515)

```shell
$ man free
...

buffers
      Memory used by kernel buffers (Buffers in /proc/meminfo)

cache  Memory used by the page cache and slabs (Cached and SReclaimable in /proc/meminfo)

buff/cache
      Sum of buffers and cache
...
```

可以看出

- buffers:内核缓冲区用到的内存【Memory used by kernel buffers (Buffers in /proc/meminfo)】
- cache:PageCache和 slab【Memory used by the page cache and slabs (Cached and SReclaimable in /proc/meminfo)】

```shell
$ man proc
...
  Buffers %lu
    Relatively temporary storage for raw disk blocks that shouldn't get tremendously large (20 MB or so).
  Cached %lu
    In-memory cache for files read from the disk (the page cache).  Doesn't include SwapCached.
  SReclaimable %lu (since Linux 2.6.19)
    Part of Slab, that might be reclaimed, such as caches.
```

从下面的图片可以看出，buffer位于相对底层，是文件系统和物理磁盘（块设备）之间的缓冲区，而PageCache是系统内核和文件系统之间的缓冲区。

![20250612111718](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20250612111718.png)

另外，linux内核使用 Slab 机制，管理文件系统的目录项和索引节点的缓存。Slab 包括两部分，其中的可回收部分，是指可以被回收的内核内存，包括目录项（dentry） 和索引节点（ inode ）的缓存等，用 SReclaimable 记录；而不可回收部分，用 SUnreclaim 记录。

##### 系统Cache/Buffer回收策略

1. 系统内存不足时，会尝试异步回收cache>同步回收cache，如果仍旧不足，触发oom
2. 可以通过写入```/proc/sys/vm/drop_caches```文件来触发系统回收，其中
   1. ```echo 1 > /proc/sys/vm/drop_caches```：释放Cache的干净页
   2. ```echo 2 > /proc/sys/vm/drop_caches```：释放slab
   3. ```echo 1 > /proc/sys/vm/drop_caches```：释放Cache和slab
3. 如果想回收Cache的脏页，需要先执行sync，写入磁盘后变为干净页才可以回收

### 进程内存构成

对于一个进程来说，内存整体可以分为3部分

1. 进程独占的内存，对应