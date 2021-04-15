---
date: 2021-02-15
categories:
  - 知识技能
tags:
  - 
publish: false
---
# 线上问题排查指令

线上问题解决思路：

1. 优先回滚上一个版本
2. 保留现场，排查解决问题

## CPU

### 1. 找到占用最高的进程

注意，**一个进程可能有多个子进程**，所以通过```ps -ef|grep xxx```查到对应的父进程后，需要通过```top -H -p pid```进一步定位具体的占用高的子进程，其中—H表示线程模式，-p表示跟踪指定进程ID（与子进程）的情况

按大写的F键，然后按s可以将进程按照相应的列进行排序。而大写的 R 键可以将当前的排序倒转。

按大写的F键，配合a-z可以控制展示列的配置。

### 2. 打印进程堆栈

通过上面找到对应的占用高的进程后，通过```printf '%x\n' pid```得到16进制的nid，然后通过```jstack pid|grep '上一步的nid'```获取具体的堆栈信息，进一步的分析可以考虑如下指令统计各种状态的线程数

```shell
jstack 26 > jstack.log
cat jstack.log |grep "java.lang.Thread.State"|sort -nr|uniq -c

56    java.lang.Thread.State: WAITING (parking)
5    java.lang.Thread.State: WAITING (on object monitor)
8    java.lang.Thread.State: TIMED_WAITING (sleeping)
19    java.lang.Thread.State: TIMED_WAITING (parking)
2    java.lang.Thread.State: TIMED_WAITING (on object monitor)
33    java.lang.Thread.State: RUNNABLE
```

如果```WAITING```,```TIMED_WAITING```,```BLOCKED```状态的线程较多，说明有问题，需要分析具体的栈状态

## GC

### GC频繁

首先查看gc分代变化情况

```shell
 jstat -gc 26 1000
```

S0C/S1C、S0U/S1U、EC/EU、OC/OU、MC/MU分别代表两个Survivor区、Eden区、老年代、元数据区的容量和使用量。YGC/YGT、FGC/FGCT、GCT则代表YoungGc、FullGc的耗时和次数以及总耗时

### 打印日志

在启动参数中加上-verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps来开启GC日志

### 启用G1

-XX:+UseG1GC

### MetaSpace溢出

打印包下面Class加载数

```shell
jcmd <PID> GC.class_stats|awk '{print$13}'|sed  's/\(.*\)\.\(.*\)/\1/g'|sort |uniq -c|sort -nrk1
```

## 上下文切换

```shell
vmstat
```

cs 表示上下文切换次数

## 磁盘

```shell
df -h
iostat -d -k -x

Device            r/s     w/s     rkB/s     wkB/s   rrqm/s   wrqm/s  %rrqm  %wrqm r_await w_await aqu-sz rareq-sz wareq-sz  svctm  %util
loop0            0.00    0.00      0.00      0.00     0.00     0.00   0.00   0.00    1.10    0.00   0.00     4.32     0.00   0.06   0.00
loop1            0.00    0.00      0.00      0.00     0.00     0.00   0.00   0.00    1.13    0.00   0.00     7.01     0.00   0.14   0.00
loop2            0.00    0.00      0.00      0.00     0.00     0.00   0.00   0.00    0.00    0.00   0.00     1.86     0.00   0.00   0.00
scd0             0.00    0.00      0.00      0.00     0.00     0.00   0.00   0.00    1.38    0.00   0.00    21.82     0.00   1.35   0.00
sda              0.06   11.36      1.17    260.79     0.00    29.50   0.04  72.20    1.21    2.22   0.01    19.11    22.96   0.12   0.14
```

最后一列%util可以看到每块磁盘写入的程度，而rrqpm/s以及wrqm/s分别表示读写速度，一般就能帮助定位到具体哪块磁盘出现问题了。

如果要定位进程，需要使用```iotop```命令获取tid,再转换成pid

```shell
sudo iotop
# tid转pid
readlink -f /proc/*/task/349/../..
/proc/349
# 查看进行IO情况
cat /proc/349/io
# 查看进程打开的文件
lsof -p 349
```

## 内存

```shell
free -h
```

### OOM

```shell
# dump堆快照
jmap -dump:format=b,file=my.bin 26
```

堆快照可以配合MAT进行分析

### 线程数

```shell
# 统计线程数
pstreee -p pid |wc -l
```

### 堆外内存

```shell
# 通过pmap来查看下进程占用的内存情况，这段意思是查看对应pid倒序前30大的内存段
pmap -x pid | sort -rn -k3 | head -30
# 如果确定有可疑的内存端，需要通过gdb来分析gdb --batch --pid {pid} -ex "dump memory filename.dump {内存起始地址} {内存起始地址+内存块大小}"
```

NMT是Java7U40引入的HotSpot新特性，配合jcmd命令我们就可以看到具体内存组成了。需要在启动参数中加入 -XX:NativeMemoryTracking=summary 或者 -XX:NativeMemoryTracking=detail，会有略微性能损耗。

一般对于堆外内存缓慢增长直到爆炸的情况来说，可以先设一个基线jcmd pid VM.native_memory baseline。
然后等放一段时间后再去看看内存增长的情况，通过jcmd pid VM.native_memory detail.diff(summary.diff)做一下summary或者detail级别的diff。
