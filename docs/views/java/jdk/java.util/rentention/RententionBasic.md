---
date: 2019-05-01
categories:
  - JDK源码
tags:
  - 注解
publish: true
---

# JavaSE进阶-注解：基础与定义

## 1. 注解基础理解

注解是一类特殊的类，在类声明、方法声明、参数列表等位置添加注解，并结合代理等设计模式，可以提高代码的可读性，简化代码等

## 2. 注解的定义

注解的定义形似接口，具体如下：

```Java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Charger {
    String name();
    String hobby() default "ppp";
}
```

需要注意

1. interface前面加@符号
2. 属性的定义要求定义为方法，（具体的设计思路还不清楚）
3. 属性的类型可以为下述几种之一
>
>- 8种原生类型：int,short,float,double,boolean,byte,char,long
>- String
>- Class（包括可选的形参，例如Class<? extends Person>)
>- enum枚举类型
>- 注解类型
>- 上述几种类型的数组，例如String[],但是数组的数组是不允许的
>
4. @Target注解指定此注解可以使用的位置
5. @Retention注解指定此注解的声明周期
5. 注解暗中继承了java.lang.annotation.Annotation接口，因此注解也是一种特殊的对象，有自己特殊的equals,hashcode方法等的实现,具体见下面的解释
6. 注解中的成员变量，没有指定default属性的，使用时都需要显式的定义值
6. 注解成员变量名为value，使用时仅需要定义value的值时，可省略value=

### 2.1 注解的equals

两个注解对象equals返回true，当且仅当注解的成员全部互相equals时，测试代码如下，Charger注解定义如上

```Java
public class EqualsTest {

    @Charger(name = "aa")
    public void method1(){}

    @Charger(name = "bb")
    public void method2(){}

    @Charger(name = "aa")
    public void method3(){}

    @Charger(name = "aa", hobby = "daa")
    public void method4(){}

    public static void main(String[] args) throws NoSuchMethodException {
        Class<? extends EqualsTest> clazz = EqualsTest.class;
        Annotation charger1 = clazz.getMethod("method1").getAnnotation(Charger.class);
        Annotation charger2 = clazz.getMethod("method2").getAnnotation(Charger.class);
        Annotation charger3 = clazz.getMethod("method3").getAnnotation(Charger.class);
        Annotation charger4 = clazz.getMethod("method4").getAnnotation(Charger.class);
        System.out.println("1=2?"+charger1.equals(charger2));
        // false
        System.out.println("1=3?" + charger1.equals(charger3));
        // true
        System.out.println("1=4?" + charger1.equals(charger4));
        // false
    }
}

```

### 2.2 注解的hashCode

注解的hashCode按下述方法计算：

1. 注解的hashCode=各成员的特殊hashCode之和
2. 成员的特殊hashCode=成员的方法名按String.hashCode()方法得到的值*127以后，XOR成员的值的特殊hashCode
3. 成员的值的特殊hashCode计算方法为：当不为数组类型时，hashCode为调用此值的hashCode()方法的结果，当为数组时，hashCode为调用对应的java.util.Arrays#hashCode方法的返回值，具体使用那个算法取决于数组内存储的类型，Array类中，针对不同的原生类型和对象类型有不同的重载实现方式

## 3. 注解中的@Target

@Target的可能取值为以下枚举类中值的组合

```Java
public enum ElementType {
    /** Class, interface (including annotation type), or enum declaration */
    TYPE,

    /** Field declaration (includes enum constants) */
    FIELD,

    /** Method declaration */
    METHOD,

    /** Formal parameter declaration */
    PARAMETER,

    /** Constructor declaration */
    CONSTRUCTOR,

    /** Local variable declaration */
    LOCAL_VARIABLE,

    /** Annotation type declaration */
    ANNOTATION_TYPE,

    /** Package declaration */
    PACKAGE,

    /**
     * Type parameter declaration
     *
     * @since 1.8
     */
    TYPE_PARAMETER,

    /**
     * Use of a type
     *
     * @since 1.8
     */
    TYPE_USE
}
```
