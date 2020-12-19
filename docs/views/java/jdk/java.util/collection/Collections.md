---
date: 2020-12-14
categories:
  - Java
tags:
  - JDK
publish: true
---

# JDK源码学习-常用Collection

## LinkedList

LinkedList同时实现了List和Deque两个接口，考虑到底层用链表实现，因此插入效率高，随机查询效率低。

LinkedList底层为双向链表，每个节点为Node对象，内部分别有Prev和Next两个指针指向前后节点

![LinkedList](https://cdn.jsdelivr.net/gh/kkyeer/picbed/LinkedList.png)

## LinkedHashMap

```LinkedHashMap```是```HashMap```的子类，这意味着其也是基于Node数组进行存储，在根据Key进行查找时，同样基于key的hash值进行寻址。

但是两者不同的是```LinkedHashMap```的Node节点进行了改造，除了保存key-value信息外，还保存了两个指针before和after，分别指向**序列**前后两个Node，整体结构如下：

![LinkedHashMap](https://cdn.jsdelivr.net/gh/kkyeer/picbed/LinkedHashMap.svg)

默认情况下，before和after指针串联的列表维持**对象放入的顺序**，但是可以通过下面的构造器，在构造LinkedHashMap时指定参数```accessOrder=true```，来使这个顺序变为访问顺序：

```java
    public LinkedHashMap(int initialCapacity,
                         float loadFactor,
                         boolean accessOrder) {
        super(initialCapacity, loadFactor);
        this.accessOrder = accessOrder;
    }
```

原理是在每次调用```get(key)```及相关方法时，调整顺序

```java
    public V get(Object key) {
        Node<K,V> e;
        if ((e = getNode(hash(key), key)) == null)
            return null;
        if (accessOrder)    
            afterNodeAccess(e); // <-- 这里调整顺序
        return e.value;
    }
```

通过上述特性可以快速构造LRU缓存


