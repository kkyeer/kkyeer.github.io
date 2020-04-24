---
date: 2020-04-24
categories:
  - JDK
tags:
  - Map
publish: false
---

# JDK源码-JDK里自带的各种Collection

除了常用的HashSet,HashMap,ArrayList和ConcurrentHashMap外，JDK1.8自带了多种不同的Collection实现，可以适用到不同的场景：

Map:

- ```EnumMap```:Key是同一个枚举类的所有值，内部使用数组存储，由于枚举类的值有固定顺序，因此读写复杂度均为O(1)，对此特定场景效率很高
- ```HashTable```:线程安全的Map实现，HashTable要求key非null，但由于并发控制为synchronized锁定所有方法，并发转为线性执行，效率低，对于Hash碰撞，使用链表存储，没有红黑树优化，最差情况的查询时间复杂度为O(n)
- ```IdentityHashMap```:使用a==b而不是a.equals(b)来判断key是否相等，适用于对象深拷贝等场景，实现与HashTable相似
- ```

Set:

- ```EnumSet```:内部可接受，同一个枚举类的值，需要在初始化时指定枚举类，用来替代BitFlag，由于Enum的实例有固定顺序，通过bit来存储状态，效率非常高，适合替代状态判断，但是默认没有带public实现
- 