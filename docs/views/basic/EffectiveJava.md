---
date: 2020-10-17
categories:
  - Basic
tags:
  - Book
publish: false
---

# Effective Java读书笔记

## 创建对象实例

### 工厂方法优先于Constructor

优点：

1. 可以解耦调用与实现，如JDBC
2. 可以共享实例，如单例模式，缓存实例等
3. 方法名可以定制
4. 可以返回指定返回值的子类
5. 可以根据参数返回不同类型的实例

### Builder模式优先于Constructor

如果一个对象有多个Field，**有多个Field为创建对象是必须的，有多个Field为非必须的**，那么使用Constructor或者静态工厂都会导致方法参数列表过长

```java
//  width 和 height是必须的
public Box getInstance(double width,double height){
  // ...
}
// 组合必须的和非必须的
public Box getInstance(double width,double height,double height,double transparency,double gamma ){
  // ...
}

// 调用方法,非常难读
BoxFactory.getInstance(1.0,2.0,3.0,5.0,4.0);
```

Java Bean模式，即使用Setter可以解决难读的问题，但是不能解决强制初始化必须字段的问题，**所以此场景优先考虑Builder模式**

```java
Box.newBuilder(2.0,3.0)
    .height(5.0)
    .build();
```

### 使用依赖注入

### 