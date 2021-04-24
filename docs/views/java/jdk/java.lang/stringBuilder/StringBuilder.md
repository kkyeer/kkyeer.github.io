---
date: 2021-04-11
categories:
  - JDK源码
tags:
  - 源码
publish: true
---

# JDK源码-StringBuilder

## 扩容机制

1. int newCapacity = (value.length << 1) + 2;  此处+2是为了容纳最后的'\0';
2. 如果不够用，尝试将容量扩容到需求长度
3. 如果还不够用，尝试扩容到数组长度最大值
4. 如果还不够用，抛出OutOfMemoryError

```java
    private void ensureCapacityInternal(int minimumCapacity) {
        // overflow-conscious code
        if (minimumCapacity - value.length > 0) {
            value = Arrays.copyOf(value,
                    newCapacity(minimumCapacity));
        }
    }
    private int newCapacity(int minCapacity) {
        // overflow-conscious code
        int newCapacity = (value.length << 1) + 2;
        if (newCapacity - minCapacity < 0) {
            newCapacity = minCapacity;
        }
        return (newCapacity <= 0 || MAX_ARRAY_SIZE - newCapacity < 0)
            ? hugeCapacity(minCapacity)
            : newCapacity;
    }

    private int hugeCapacity(int minCapacity) {
        if (Integer.MAX_VALUE - minCapacity < 0) { // overflow
            throw new OutOfMemoryError();
        }
        return (minCapacity > MAX_ARRAY_SIZE)
            ? minCapacity : MAX_ARRAY_SIZE;
    }
```

## append方法的拷贝次数

1-2次

1. 字符串value数组如果需要扩容，则会发生数组的复制:```value = Arrays.copyOf(value,newCapacity(minimumCapacity));```
2. 将传入的String变量的内容拷贝到StringBuilder的内部value数组中，使用数组拷贝:```System.arraycopy(value, srcBegin, dst, dstBegin, srcEnd - srcBegin)```

## StringBuffer为什么的是线程安全的

这里线程安全的定义：

StringBuilder非线程安全，会导致两个线程同时调用append方法，在某些情况下，两者同时调用数组复制方法，造成数据丢失错误，或者交替操作count的值，造成count值与数组不一致

StringBuffer在append等方法加了```syncronized```关键字修饰
