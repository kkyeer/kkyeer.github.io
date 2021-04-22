---
date: 2020-10-17
categories:
  - 懂
tags:
  - 读书笔记
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

## Object方法

### 谨慎覆盖equals/hashcode方法

对于常用的HashMap，在put和get方法放入对象时，判断Key是否存在/相等时，使用如下代码:

```java
hash(k)==hash
....
((k = e.key) == key || (key != null && key.equals(k)))
```

即，以下两种情况均判断为key相等：

1. 两个对象hash相同，且a==b(地址相同)
2. 两个对象hash相同，且a.equals(b)返回true

#### Mutable对象

对于一个可变(Mutable)对象，复写hashcode/equals方法是非常危险的，如果成员变量(Field)数值变化导致a.equals(a)在某个时刻不存在，会破坏HashMap的有效性，比如出现如下结果

```java
Set<Object> set = new HashSet<>();
set.add(a);
// a在这里变化了
System.out.println(set.contains(a)); // 这里返回false，导致程序异常
```

#### 无法继承某个类并实现妥当的equals复写？？？

假设某个类 Animal 有自己的一些Field，并根据这些Field复写了equals方法，

```java
public class Animal{
    public int age;
    public boolean equals(Object o){
      if(o==null || !o instanceof Animal) return false;
      return ((Animal)o).age == this.age;
    }
}
```

新建了一个子类Cat，继承Animal类，添加了新的Field：type：

```java
public class Cat extends Animal{
    public int type;
    public boolean equals(Object o){
       
    }
}
```

考虑Cat实现自己的equals方法，思路是调用Animal类的equals方法进行比较：

```java
public boolean equals(Object o){
    if(o==null || !o instanceof Cat){
      return false;
    }
    return super.equals(o)&&this.type==((Cat)o).type;
}
```
