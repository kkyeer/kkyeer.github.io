---
date: 2021-06-02 14:20:22
categories:
  - 线上问题
tags:
  - 线程池
  - 死锁
  - 问题
publish: true
---

# 线程池死锁-线程池嵌套提交

## 现象

流量峰值时发现大量调用超时，通过链路追踪锁定超时发生的节点，隔离节点后，在Pod中使用```jstack```命令追踪进程:

```shell
jstack -l 1 |grep "java.lang.Thread.State"|sort -nr|uniq -c 
```

发现有大量线程阻塞在WAITING状态

```shell
  11    java.lang.Thread.State: WAITING (parking)
   2    java.lang.Thread.State: WAITING (on object monitor)
   8    java.lang.Thread.State: RUNNABLE
```

Dump线程信息:```jstack -l 1 > stack.log```，分析WAITING状态的线程，发现问题出现在提交到线程池的Runnable中嵌套提交了Runnable到同一线程池中，造成死锁

## 极限情况-完全死锁

### 代码示例

完整代码见[Github](https://github.com/kkyeer/JavaPlayground/blob/master/src/main/java/issue/threadstarvation/ThreadStarvationEmulator.java)

核心代码如下，外层任务

```java
public void test() throws ExecutionException, InterruptedException {
    List<Future<String>> outerFutureList = new ArrayList<>(10);
    for (int i = 0; i < 11; i++) {
        outerFutureList.add(
                executorService.submit(
                        new BadTask(executorService)
                )
        );
    }
    // 阻塞等待完成
    for (Future<String> outerFuture : outerFutureList) {
        System.out.println(outerFuture.get());
    }
    executorService.shutdownNow();
}
```

BadTask类中造成问题的代码，省略了一些非核心的代码

```java
private static class BadTask implements Callable<String>{
    private BadTask(ExecutorService executorService) {
        this.executorService = executorService;
    }

    @Override
    public String call() throws InterruptedException {
//            rpc等耗时操作
        TimeUnit.MILLISECONDS.sleep(10L);
        List<Future<String>> innerFutureList = new ArrayList<>(5);
//            因为有些SDK的接口有参数数量限制，所以多次调用，为提高RT，复用线程池并发调用
        for (int i = 0; i < 5; i++) {
            innerFutureList.add(
              // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓这里又提交了一些Callable到同一个线程池
                    this.executorService.submit(
                            ()->{
                              //            rpc等耗时操作
                                TimeUnit.MILLISECONDS.sleep(20L);
                                return "OK";
                            }
                    )
            );
        }
        // 阻塞等待全部完成
        for (Future<String> innerFuture : innerFutureList) {
          innerFuture.get();
        }
        return "OK";
    }
}
```

或许看图解比较直观

### 图解

![MainTask.svg](https://cdn.jsdmirror.com/gh/kkyeer/picbed/sequence.svg)
![ThreadStarvation.svg](https://cdn.jsdmirror.com/gh/kkyeer/picbed/ThreadStarvation.svg)

### 完全死锁的必要条件

1. 线程池必须有阻塞队列，亦即有可能部分Runnable对象存在阻塞队列，实际上发生死锁的就是Worker里执行的Runnable和阻塞队列的Runnable
2. 父任务和子任务向同一个线程池提交任务【核心原因】
3. 父任务阻塞等待所有子任务完成，子任务部分在阻塞队列里
4. Worker里全为父任务，且对应的**所有**子任务都在阻塞队列里

破坏以上任何条件，都不会造成完全死锁，但是只要符合条件1,2，在某些情况下仍旧会造成线程执行慢

## 典型情况-嵌套提交导致的RT上升

**破坏上面的必要条件的第4点**，即由于压力没有那么大导致并非所有子任务都阻塞在队列里，这样会有部分Worker线程可以拿到子任务执行，但是由于执行子任务的线程数量少，最开始只有一小部分子任务有机会被执行，从宏观看最开始约等于**子任务串行执行**，导致RT非常高，完整代码见[Github上的代码](https://github.com/kkyeer/JavaPlayground/blob/master/src/main/java/issue/threadstarvation/ThreadStarvationEmulator.java)

![20210607114327](https://cdn.jsdmirror.com/gh/kkyeer/picbed/20210607114327.png)

执行结果如下：

```shell
----------------------模拟半死锁--------------------
Time consume:55ms
Time consume:85ms
Time consume:105ms
Time consume:115ms
Time consume:125ms
Time consume:135ms
Time consume:145ms
Time consume:156ms
Time consume:156ms
----------------------完成-------------------------
```

理想的情况下，第一个任务是10ms(mainTask)+10ms(subTask)=20ms，但是由于近似死锁(开始只有一个Worker线程可以执行subTask)，导致所有任务的RT都很高

## 问题解决

方案围绕破坏上述[必要条件](#完全死锁的必要条件)

- 不使用阻塞队列，即使用同步队列```java.util.concurrent.SynchronousQueue```
- 父任务和子任务使用不同的线程池
- 控制并发低于共享线程池的核心线程数（仅在无法使用上述方案时使用）

使用方案1的效果如下

```shell
----------------------模拟问题解决------------------
Time consume:22ms
Time consume:22ms
Time consume:23ms
Time consume:25ms
Time consume:26ms
Time consume:27ms
Time consume:31ms
Time consume:31ms
Time consume:31ms
----------------------完成-------------------------
```
