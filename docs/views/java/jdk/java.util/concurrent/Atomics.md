---
date: 2020-12-21
categories:
  - Java
tags:
  - 源码
  - 并发
publish: false
---

# JDK源码-JUC包中的Atomic类

JUC包中有多个常用类型的原子操作包装类，包括```AtomicInteger```,```AtomicLong```,```AtomicReference```，内部封装了对于原生数值、索引的操作，主要是更新数据时使用CAS操作。

基本类型的封装，基本原理是通过底层的```Unsafe```类CAS方法更新数组对应的内存空间的值:

- AtomicBoolean
- AtomicInteger
- AtomicLong
- AtomicIntegerArray
- AtomicLongArray
- AtomicReferenceArray

另外值得注意的是，针对CAS操作中的ABA问题，提供了```AtomicStampedReference```类来支持带version的CAS操作

针对并发经计算字段的情景，提供了下面的几个类来提高操作效率

## LazySet方法：高效非可靠volitile

大部分Atomic类提供了LazySet方法，Java Doc对其描述为最终将数值变更为给定值，比较模糊。

```java
    /**
     * Eventually sets to the given value.
     *
     * @param newValue the new value
     * @since 1.6
     */
    public final void lazySet(int newValue) {
        unsafe.putOrderedInt(this, valueOffset, newValue);
    }
```

追踪代码：```Unsafe.putOrdered*``` -> unsafe.cpp：```SET_FIELD_VOLATILE``` -> ```OrderAccess::release_store_fence``` -> orderAccess.hpp: ```release_store_fence xchg```，在X86指令集下， 此方法最终实现为xchg指令。
根据StackOverFlow的说法，这个指令的作用类似Store-Store屏障，**保证此指令前面的指令Happen-Before此指令**，但是此指令和后面的指令可能产生指令重排序，**不保证此指令的操作马上对其他CPU可见**，但是此指令比volitile关键字用的MESI协议或总线锁轻量很多（20个cycle）,因此对于某些场景，可以用LasySet方法提升效率，如常见的计数逻辑，多写少读且不强求所有时间的强一致性。

参考1: [Stack overflow上的讨论](https://stackoverflow.com/questions/1468007/atomicinteger-lazyset-vs-set)
参考2: [说明与性能比较](http://psy-lob-saw.blogspot.com/2012/12/atomiclazyset-is-performance-win-for.html)

### 测试LazySet方法效率

考虑如下场景，生产者与消费者分布在不同的线程，两者通过共享的索引来同步当前生产者进度：一个AtomicInteger对象，其他线程读取这个数字来确定当前的消费进度，全量代码见[GitHub](https://github.com/kkyeer/JavaPlayground/blob/master/src/main/java/concurrent/lab/TestAtomicLazySetCatch.java)，核心代码：

```java
    public Thread producer(){
        return new Thread(
                ()->{;
                    for (int i = 0; i < ARRAY_LENGTH; i++) {
                        counter.lazySet(i);
//                        counter.set(i);
                        array[i] = i;
                    }
                    END_LATCH.countDown();
                }
        );
    }
```

```java
    public Thread consumer(){
        return new Thread(
                ()->{
                    int consumerIndex = 0;
                    int producerIndex;
                    int end = ARRAY_LENGTH -1;
                    while ((producerIndex = counter.get()) < end) {
                        if (consumerIndex < producerIndex) {
                            if (array[consumerIndex] != consumerIndex) {
                                throw new RuntimeException();
                            }
                            consumerIndex++;
                        }
                    }
                    END_LATCH.countDown();
                }
        );
    }
```

经本机测试，使用LazySet的效率是直接Set的三倍，原因是直接Set的情况下，由于value是[volatile](https://www.tpfuture.top/views/java/jdk/java.util/concurrent/volatile.html)的，根据JMM的要求，每次set（即store操作）都会触发内存屏障（PCIE锁）导致效率低。

### strip
