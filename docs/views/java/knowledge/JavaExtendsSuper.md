---
date: 2022-09-17 19:57:31
categories:
  - Java进阶
tags:
  - 
publish: true
---

# Java中extends和super使用

Y extends X 表示Y是X的子类，实际使用时，读取可以指向X类型，但无法写入（编译器无法知道底层是什么具体类型，无法保证安全）
M super N 表示M是N的超类，实际使用时，读取则仅能**安全的**读到```Object```类型，如果需要N类型，则需要配合```instanceof```关键字和类型强转，写入可以比较随心所欲，原因是虽然编译器无法知道底层是什么具体类型，但因为上面读取方法的约定，所以可以不用管，本质上是把选择权交给coder，但是也就存在处理不好运行时报错的可能性

> PECS原则
PECS（Producer Extends Consumer Super）原则

- 频繁往外读取内容的，适合用上界Extends
- 经常往里插入的，适合用下界Super

```java
public class TSuperExtends {
    static class Person{
        public void eat(){
            System.out.println("eat");
        }
    }

    static class Father extends Person{
        public void work(){}
    }

    static class Son extends Father{
        public void school(){}
    }

    public static void main(String[] args) {
        List<Father> underList = new ArrayList<>();
        underList.add(new Father());
        underList.add(new Son());

        // extends 关键字
        List<? extends Father> personList;
        personList = underList;
        // 读取可以正常操作，虽然编译器不知道具体底层是什么类型，只知道是Father的子类型之一，但是根据Java的约定，任何子类型都可以赋值给父类型的引用
        Person person = personList.get(0);
        person.eat();
        // ERROR!!! 写入会被编译器阻断，因为编译器不知道具体底层是什么类型，只知道是Father的子类型之一，因此写入是不安全的
        personList.add(new Person());

        // super 关键字
        List<? super Father> sonList;
        sonList = underList;
        // 写入不会被编译器阻断
        sonList.add(new Son());
        sonList.add(new Father());
        // ERROR!!! 读取会被编译器阻断，因为编译器不知道具体底层是什么类型，只知道是Father的父类型之一，所以只允许放入Father和Father的子类对象（这是一定安全的）
        sonList.add(new Person());
        // ERROR!!! 读取会被编译器阻断，
        Object object = sonList.get(0);
        Person p = (Person) object;
        p.eat();
    }
}
```
