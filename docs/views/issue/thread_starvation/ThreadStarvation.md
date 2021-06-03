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

流量峰值时发现大量调用超时，通过链路追踪锁定超时发生的节点，```jstack```命令追踪进程:

```shell
jstack -l 1 |grep "java.lang.Thread.State"|sort -nr|uniq -c 
```

发现有大量线程阻塞在WAITING状态

```shell
  11    java.lang.Thread.State: WAITING (parking)
   2    java.lang.Thread.State: WAITING (on object monitor)
   8    java.lang.Thread.State: RUNNABLE
```

Dump线程信息:```jstack -l 1 > stack.log```，分析WAITING状态的线程，发现问题出现在线程提交到线程池的Runnable中也提交了Runnable到此线程池中，造成死锁

## 极限情况-完全死锁

完整代码见[Github](https://github.com/kkyeer/JavaPlayground/blob/fccaa0c21101d4e5b3bdc07d9fde74b4bc454331/src/main/java/issue/threadstarvation/ThreadStarvation.java)

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

![ThreadStarvation.svg](https://cdn.jsdelivr.net/gh/kkyeer/picbed/ThreadStarvation.svg)

### 完全死锁的必要条件

1. 父任务和子任务向同一个线程池提交任务【核心原因】
2. 父任务阻塞等待所有子任务完成，子任务部分在阻塞队列里
3. **所有**子任务都在阻塞队列里

任何一个条件不满足，都不会造成完全死锁，但是只要符合条件1，在某些情况下仍旧会造成线程执行慢

## 典型情况-嵌套提交导致的RT上升

破坏上面的必要条件的第3点，即由于压力不大导致并非所有子任务都在阻塞队列里，这样会有部分线程可以慢慢执行完子任务，但是由于这部分线程数量少，导致RT非常高，完整代码见[ThreadHalfStarvation](https://github.com/kkyeer/JavaPlayground/blob/fccaa0c21101d4e5b3bdc07d9fde74b4bc454331/src/main/java/issue/threadstarvation/ThreadHalfStarvation.java)

![20210602170319](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20210602170319.png)
