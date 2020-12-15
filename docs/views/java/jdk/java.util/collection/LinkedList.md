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