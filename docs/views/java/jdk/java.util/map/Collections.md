---
date: 2020-04-24
categories:
  - JDK源码
tags:
  - Collection
publish: true
---

# JDK源码-JDK里自带的各种Collection

除了常用的HashSet,HashMap,ArrayList和ConcurrentHashMap外，JDK1.8自带了多种不同的Collection实现，可以适用到不同的场景：

Map:

- ```EnumMap```:Key是同一个枚举类的所有值，内部使用数组存储，由于枚举类的值有固定顺序，因此读写复杂度均为O(1)，对此特定场景效率很高
- ```HashTable```:线程安全的Map实现，HashTable要求key非null，但由于并发控制为synchronized锁定所有方法，并发转为线性执行，效率低，对于Hash碰撞，使用链表存储，没有红黑树优化，最差情况的查询时间复杂度为O(n)
- ```IdentityHashMap```:使用a==b而不是a.equals(b)来判断key是否相等，适用于对象深拷贝等场景，实现与HashTable相似
- ```LinkedHashMap```:内部使用HashMap的实现进行普通存储，节点之间同时维护双向链表，迭代时可以按照insert顺序迭代
- ```TreeMap```:实现接口```NavigableMap```，内部假定key有序，提供了一些根据给定key值向上/下查询等类似方法，适用key有序的哈希表场景，如一致性哈希

Set:

- ```EnumSet```:内部可接受，同一个枚举类的值，需要在初始化时指定枚举类，用来替代BitFlag，由于Enum的实例有固定顺序，通过bit来存储状态，效率非常高，适合替代状态判断，但是默认没有带public实现
- ```LinkedHashSet```:1.8的实现中，就是HashSet
- ```TreeSet```:有序的Set，底层依赖TreeSet实现
- ```WeakHashMap```:使用弱引用来存储键，在空间不足时会被GC

List:

- ```LinkedList```:链表存储元素
- ```Vector```:并发安全数组，底层原理为将所有的public方法加```synchronized```关键字
- ```Stack```:FILO队列，底层为Vector

Queue/Deque:

- ```PriorityQueue```:有序队列，内部使用堆排序，head指向最小的，要求内部元素实现```Comparable```接口，或构造时传入```Comparator```对象
