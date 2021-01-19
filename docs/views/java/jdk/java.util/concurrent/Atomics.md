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

JUC包中有多个常用类型的原子操作包装类，内部封装了对于数值、数组的操作。

针对并发计算的情景，提供了Adder和Accumulator类来提高操作效率，前者接收操作数，后者接收一个Function作为构造参数，操作时接收操作数作为此Function的操作数。

类型/操作 | 基础操作 | Array | Adder | Accumulator
------|------|-------|-------|------------
Boolean | AtomicBoolean |  |  | 
Integer | AtomicInteger |  |  | 
Double |  |  | DoubleAdder | DoubleAccumulator
Long | AtomicLong | AtomicLongArray | LongAdder | LongAccumulator
引用类型 | AtomicReference | AtomicReferenceArray |  | 

另外值得注意的是，针对CAS操作中的ABA问题，提供了```AtomicStampedReference```类来支持带version的CAS操作

## Set与Get

对于基本类型的原子类（```AtomicInteger```等)，内部存储对应数值的变量被**volatile**关键词修饰，即所有的Store-Load操作，均插入内存屏障（锁内存总线），保证此线程对此value的写入操作不参与前置指令的重排序，且**写入后对其他CPU立即可见**

```java
  private volatile int value;
```

## CAS操作

```java
public final boolean compareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}
```

类似上面的原子类的CAS操作，底层是通过调用CPU的cas指令（即下面的```cmpxchgl```）执行的，效果是比较原值，如果相等则替换成新值，返回1，否则返回0，此操作为原子操作。注意不是所有CPU都支持CAS操作，但是现代CPU一般都有。

```c
template<>
template<typename T>
inline T Atomic::PlatformCmpxchg<4>::operator()(T volatile* dest,
                                                T compare_value,
                                                T exchange_value,
                                                atomic_memory_order /* order */) const {
  STATIC_ASSERT(4 == sizeof(T));
  __asm__ volatile ("lock cmpxchgl %1,(%3)"
                    : "=a" (exchange_value)
                    : "r" (exchange_value), "a" (compare_value), "r" (dest)
                    : "cc", "memory");
  return exchange_value;
}
```

## 原子性++操作

a++及++a操作，在Java中是非原子性操作，即在多线程运行环境下会产生数据一致性问题，为解决此问题，Atomic原子类提供了类似下述方法来进行原子性的+1，-1操作

```java
/**
  * Atomically increments by one the current value.
  *
  * @return the previous value
  */
public final int getAndIncrement() {
    return unsafe.getAndAddInt(this, valueOffset, 1);
}
```

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

追踪代码：```Unsafe.putOrdered*``` -> unsafe.cpp：```SET_FIELD_VOLATILE ``` -> ```OrderAccess::release_store_fence``` -> orderAccess.hpp: ```release_store_fence    xchg ```，在X86指令集下， 此方法最终实现为xchg指令。
根据StackOverFlow的说法，这个指令的作用类似Store-Store屏障，**保证此指令前面的指令Happen-Before此指令**，但是此指令和后面的指令可能产生指令重排序，**且不保证此指令的操作对其他CPU马上可见**，但是此指令（20个cycle）比volitile关键字用的总线锁（80cycle）轻量很多,因此对于某些场景，可以用LasySet方法提升效率，如常见的计数逻辑，多写少读且不强求所有时间的强一致性。

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
