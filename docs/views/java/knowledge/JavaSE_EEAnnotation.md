---
date: 2018-11-22
categories:
  - Java进阶
tags:
  - 
publish: true
---

# JavaSE进阶-注解：JavaSE元注解和JavaEE原生注解

> 在注解定义时，用在注解头部的注解，称为元注解，目前元注解在java.lang.annotation包内，分别@Target,@Retention,@Documented,@Inherited,@Repeatable,@Native

## @Documented

当一个注解上面有此注解时，使用此注解的方法等在生成Doc时，Doc中会包含此注解，举例如下

实验用注解：

```Java
@Documented
@Target(ElementType.TYPE)
@interface Version {
    String value();
}
```

测试类：

```Java
@Version("1.0")
public class TestCase {

}
```

生成的文档中

taste.annotations.meta.documented
类 TestCase

    java.lang.Object
        taste.annotations.meta.documented.TestCase 


    @Version(value="1.0")  <<注解会被包含在文档中
    public class TestCase
    extends java.lang.Object

## @Inherited

注解被用在类声明上时，可以使用此注解，被这类注解修饰的类，子类与父类有相同的注解
比如

```Java
@Inherited @interface Persistent { }
@Persistent class Employee { . . . }
class Manager extends Employee { . . . } // <==这个类，也有Persitent注解
```

类Manager同样有@Persistent注解，也即一个类是可持久化的，那他的子类也是可持久化的，类似的例子还有@Serializable，但由于这个特性是在JDK1.1推出的，早于注解出现前，因此没有用注解的形式

## @Repeatable

注解被指定为@Repeatable时，注解可以在同一个位置多次实现，但定义此注解时，需要同时定义一个容器注解，来包括重复的注解类，

### 知识要点

1. 容器注解必须有一个名为value,类型为包裹注解数组的变量，且其他变量必须有默认值
2. 获取注解时，若注解确实是多次定义，则调用getAnnotation(*.class)方法返回null，实际使用时，若需处理可重复注解，请使用getDeclaredAnnotationsByType(*.class)方法，返回的是对应注解实例的数组

举例：
>定义可重复注解：

```Java
@Repeatable(InfoArray.class)
@Retention(RetentionPolicy.RUNTIME)
@interface Info {
    String value();
}
```

>定义包裹的注解

```Java
@Retention(RetentionPolicy.RUNTIME)
@interface InfoArray {
    Info[] value();
    String desc() default "a";
}
```

>使用注解：

```Java
@Info("Created by kk")
@Info("On 2019/4/13")
public class TestCase {
}
```

>获取注解：

```Java
    public static void main(String[] args) {
        Class<TestCase> testCaseClass = TestCase.class;
        Info infoAnnotation = testCaseClass.getAnnotation(Info.class);
        System.out.println(infoAnnotation);

        Info[] infoArray = testCaseClass.getDeclaredAnnotationsByType(Info.class);
        for (Info info : infoArray) {
            System.out.println(info.value());
        }
    }
```

输出
>null
Created by kk
On 2019/4/13

# JavaEE原生注解

## @SuppressWarnings("unchecked")

忽略某些Warning

## @Override

表明某方法是复写父类方法

## @Generated

表明此代码为自动生成，用来给IDE提供标识以隐藏默写代码，或者给代码生成工具提供标识以替换，有三个Field，典型用法：

```Java
@Generated(value = "com.kkyeer.taste",date = "2019-01-04T12:00:00",comment = "some comment")
```

## @PostConstruct和PreDestroy

分别注解在实例初始化后和销毁前执行的方法
**注意，这两个注解本身并不提供这两个功能，需要配合相关框架或者处理类才能发挥效果**

## @Resource

表明注解的变量由容器注入
