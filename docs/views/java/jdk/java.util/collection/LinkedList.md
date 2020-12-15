---
date: 2020-12-14
categories:
  - Java
tags:
  - JDK
publish: false
---

# JDK源码学习-LinkedList

LinkedList同时实现了List和Deque两个接口，考虑到底层用链表实现，因此插入效率高，随机查询效率低。

## 底层数据结构

LinkedList底层为双向链表，每个节点为Node对象，内部分别有Prev和Next两个指针指向前后节点

![LinkedList](https://cdn.jsdelivr.net/gh/kkyeer/picbed/LinkedList.png)

