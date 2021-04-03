---
date: 2020-04-18
categories:
  - Java
tags:
  - 源码
  - 多线程
  - 并发
publish: true
---

# Java指令重排序与volatile关键字

## 1. 重现代码重排序

### 1.1 测试代码

完整代码参见[Github](https://github.com/kkyeer/JavaPlayground/blob/master/src/main/java/concurrent/reorder/Reveal.java)，其中关键代码如下：

```java
Thread thread1 = new Thread(
        () -> {
            a = 1;
            y = b;
        }
);
Thread thread2 = new Thread(
        () -> {
            b = 1;
            x = a;
        }
);
```

### 1.2 理论推断

因为thread1和thread2都join到当前线程，则代码执行到这里以后，两个线程都执行完毕，因为多线程的原因，代码执行顺序不同，理论上xy的值可能为(1,0)(0,1)或者(1,1)，分别对应如下的执行顺序（从上到下）

- 1,0的情况

|线程1|线程2|x| y|
|-|-|-|-|
|a=1;||0|0|
|y=b;||0|0|
||b=1;|0|0|
||x=a;|1|0|

- 0,1的情况

|线程1|线程2|x| y|
|-|-|-|-|
||b=1;|0|0|
||x=a;|0|0|
|a=1;||0|0|
|y=b;||0|1|

- 1,1的情况

|线程1|线程2|x| y|
|-|-|-|-|
||b=1;|0|0|
|a=1;||0|0|
||x=a;|1|0|
|y=b;||1|1|

### 1.3 指令重排序导致的特殊情况

实际运行中，运行上述的代码足够长的时间后，会有某个线程进入错误分支，打印如下错误并关闭线程池

```shell
Wrong,x = 0 and y = 0
Exception in thread "main" java.util.concurrent.RejectedExecutionException: Task java.util.concurrent.FutureTask@d716361 rejected from java.util.concurrent.ThreadPoolExecutor@3764951d[Shutting down, pool size = 12, active threads = 12, queued tasks = 23280, completed tasks = 2713]
 at java.util.concurrent.ThreadPoolExecutor$AbortPolicy.rejectedExecution(ThreadPoolExecutor.java:2063)
 at java.util.concurrent.ThreadPoolExecutor.reject(ThreadPoolExecutor.java:830)
 at java.util.concurrent.ThreadPoolExecutor.execute(ThreadPoolExecutor.java:1379)
 at java.util.concurrent.AbstractExecutorService.submit(AbstractExecutorService.java:112)
 at concurrent.reorder.Reveal.main(Reveal.java:59)
Wrong,x = 0 and y = 0
```

表明实际运行中会有两个线程都执行完毕，然而x和y都是0的情况，这时就是发生了指令重排序，即代码运行的顺序，与源代码的顺序不一致，具体到测试代码，即可能实际运行顺序如下

- 0,0的情况（发生指令重排序）

|线程1|线程2|x| y|
|-|-|-|-|
|y=b;||0|0|
||x=a;|0|0|
|a=1;||0|0|
||b=1;|0|0|

此时最终打印x=0;y=0;

## 2. 什么是指令重排序

### 2.1 Java源代码到运行时指令

Java编译出来的class文件，仅能被Java虚拟机（JVM）识别，实际在运行时，会由实际运行的JVM编译成机器码运行，粗浅的理解为：Java.class文件 -> JVM运行时解析为机器码 (-> JIT优化过后的机器码) -> 操作系统的CPU指令，其中JVM解析为机器码、JIT优化成机器码，CPU执行CPU指令的过程中均有可能发生指令重排序

### 2.2 宿主机的内存模型与变量操作

所谓宿主机，即运行JVM的机器，可能是个人开发的电脑，线上的生产服务器，Docker容器等，操作系统、硬件的不同，内存模型和指令也不尽相同，鉴于目前多核CPU无论在开发环境和生产环境均为主流，一般认为宿主机的内存模型简化为主内存和多级CPU内部缓存再到寄存器，一般来说，在当前，多核CPU已经司空见惯，每个CPU都有多个核，一般来说，在CPU的三级缓存中，L3为各个核共享，L1和L2为核内缓存，模型如下

![CPU_architect](https://cdn.jsdelivr.net/gh/kkyeer/picbed/CPU_architect.jpg)

执行高速缓存仅仅是用作寄存器和主内存之间缓存用，CPU通过各种技术保证寄存器读取时缓存内的值与主内存的对应值一致，对于线程来说，线程的内存访问区域为寄存器，且多个CPU可以**认为同时并行**执行不同的线程，因此从线程的维度看，可以进一步简化为

>**核内存储(寄存器\L1\L2) <->核外存储(内存(L3 Cache和RAM))**

在此简化模型下，假设当前RAM中一个变量x初始值为0，一个简单的赋值操作```a=0;x=a+1```的执行顺序如下

1. 从RAM读取a的值0到CPU L3，然后逐级放入L2,L1再到寄存器，并赋予临时地址r1，可看作 r1 = a;
2. 寄存器内累加r1 = r1 + 1;
3. r1的值逐级写回内存，x=1

假设MOV [v1, v2]代表v2变量复制到v1变量，S1表示Step1，r开头的变量表示寄存器变量，则上述步骤简写为

- S1: MOV [r1, a]
- S2: MOV [x, ++r1]

执行顺序为 **S1 -> S2** ，后面也按此约定说明

### 2.3 CPU指令重排序

#### 2.3.0 测试程序

将1.1中的测试程序改写为

```java
public Test{
    int a = 0,b = 0,x = 0,y = 0;

    void test1(){
        a = 1;
        x = b;
    }

    void test2()[
        b = 1;
        y = b;
    ]
}
```

则按照2.2的写法，将test1方法内部CPU指令简写为:

- S1: MOV[a, 1]
- S2: MOV[r1, b]
- S3: MOV[x, r1]

test2方法内部CPU指令简写为:

- S4: MOV[b, 1]
- S5: MOV[r2, a]
- S6: MOV[y, r2]

后面的程序均围绕此程序展开

CPU指令重排序的定义为：CPU允许在**某些条件**下进行**指令重排序**，仅需保证**重排序后单线程下的语义一致**，这句话比较绕口，其中有三个加粗后的关键字，具体解释如下：

#### 2.3.1 某些条件

我们把变量读到寄存器的操作称为Load，把变量从寄存器写出到内存的操作称之为Store，则下面的操作称之为Store-Load操作：

- MOV[r1, x]
- MOV[y, r1]

类似的还有Load-Load,Load-Store,Store-Store操作，对于这几种操作，**规定Store-Load操作，且Store中涉及到的外存变量与Load中涉及到的外存变量不同的情况下**，可以发生指令重排序，当然对于不同的CPU、指令集，可重排序的指令不同，一般情况下认为大多数CPU均支持Store-Load重排序，具体的支持操作请参考最后的参考资料或自行查阅相关网站

#### 2.3.2 指令重排序

假设一个线程执行2.3.0中程序的test1()方法，由于S1为Store指令，S2为Load指令，且涉及的外存变量不同，根据2.3.1的说明，允许发生重排序，即

> **S2 -> S1 -> S3** 效果为 ```x=b;a=1;```

类似的test2()方法可被重排序为

> **S5 -> S4 -> S6** 效果为 ```y=a;b=1;```

#### 2.3.3 重排序后单线程下的语义一致

如果仅有一个线程顺序执行test1()和test2()方法，正常执行的结果为```a=1;b=1;x=0;y=1;```
即使指令被重排序为**S2 -> S1 -> S3 -> S5 -> S4 -> S6**，最终执行结果仍旧为```a=1;b=1;x=0;y=1;```，与源码中直接推导或者说重排序前的执行结果是一致的，这就叫做重排序后单线程下的语义一致

#### 2.3.4 指令重排序下多线程问题

2.3.3中阐明了，指令重排序对于单线程程序没有影响，但是假如有两个线程分别运行test1()方法和test2()方法，假设发生指令重排序，由于多线程程序执行顺序的不确定性，可能的一种执行顺序为：

|线程1|线程2|r1| r2|x|y|a|b|
|-|-|-|-|-|-|-|-|
|S2( MOV[r1, b] )||0|-|0|0|0|0|
||S5( MOV[r2, a] )|0|0|0|0|0|0|
|S1( MOV[a, 1] )||0|0|0|0|1|0|
|S3( MOV[x, r1] )||0|0|0|0|1|0|
||S4( MOV[b, 1] )|0|0|0|0|1|1|
||S6( MOV[x, r2] )|0|0|0|0|1|1|

在这种情况下，由于**执行线程的CPU从缓存中提前读取了脏数据**，导致最终x=0;y=0;这就是1.3中出现反直觉的结果的原因，最终展现出的效果就类似下面的表格，看上去是两个线程的代码进行了重排序

|线程1|线程2|x| y|
|-|-|-|-|
|y=b;||0|0|
||x=a;|0|0|
|a=1;||0|0|
||b=1;|0|0|

## 3. 如何避免多线程程序中指令重排序造成的错误

### 3.1 Java内存模型（JMM）

为了保证JVM的跨平台性，把Java业务代码与操作系统或硬件的指令解耦，JSR规定了一系列Java代码在多线程程序中与内存交互中的原则，如happens-before原则,serial-as-if原则，JVM实现必须遵循这些原则，同时，没有在JSR133中禁止的指令重排序、优化等等均是被允许的

#### 3.1.1 JMM的happens-before原则

如果两个动作符合happens-before原则，则两个操作互相间指令重排序受到限制，如果一个动作happens-before另一个动作，则第一个对第二个可见，且第一个排在第二个之前

- 一个线程的各个action happens-before 这个线程的subsequent action
- 一个monitor的unlock happens-before 这个monitor的subsequent lock
- 对一个volatile变量的write happens-before 这个变量的read
- 对一个线程的start()操作happens-before开启的线程里的action
- 一个线程的所有action happens-before 其他join这个线程的action
- happens-before有传递性，即如果a happens-before b,b happens-before c,则a happens-before c

## 3.2 volatile关键字

JMM对于volatile关键字的规定，可以归结为两层：
1）保证了不同线程对这个变量进行操作时的可见性，即一个线程修改了某个变量的值，这新值对其他线程来说是立即可见的
2）当指令进行到volatile变量的Store操作时，在此之前的所有指令必须执行完毕，且在此之后的指令尚未执行

### 3.2.1 volatile关键字对指令重排序的影响

从3.1.1可知，JMM规定如果一个变量被volatile修饰，则Store-Load操作不会被指令重排序

### 3.2.2 验证volatile关键字对内存的影响

将1.1中测试代码里的变量a,b用volatile修饰，则无论运行多久，都不会再出现x=0;y=0;的情况，但仅修饰a和b其中一个不会有此效果

### 3.2.3 验证代码解析

对volatile变量a,b的操作S1和S2之间，因为S1是volatile变量a的Store操作，因此S1不可和S2进行重排序，类似的，S4和S5也不可进行重排序，这就避免了2.3.4中重排序后指令的执行可能，因而不会出现```x=0;y=0;```的情况

## 4 参考

- [JVM(十一)Java指令重排序](https://blog.csdn.net/yjp198713/article/details/78839698)
- [深入理解Java内存模型2](https://www.infoq.cn/article/java-memory-model-2/)
- [Java内存模型(JMM)规范(JSR133)](http://www.cs.umd.edu/~pugh/java/memoryModel/jsr133.pdf)
- [JSR133的FAQ](https://www.cs.umd.edu/users/pugh/java/memoryModel/jsr-133-faq.html)
- [Intel对指令重排序的说明](http://www.cs.cmu.edu/~410-f10/doc/Intel_Reordering_318147.pdf)
- [从多核硬件架构，看Java内存模型](https://www.jianshu.com/p/f5883ca0348f)
