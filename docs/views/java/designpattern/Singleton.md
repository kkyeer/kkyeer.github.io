---
date: 2018-11-22
categories:
  - Java
tags:
  - 设计模式
publish: true
---

# 设计模式-单例模式【实现、序列化、反射】

[toc]

## 1. 实现

单例模式的实现有很多种，分类方式也不一而足，比如分为预加载和懒加载，以及线程安全的实现及线程不安全的实现

### 1.1. 线程不安全

#### 1.1.1 饿汉式

调用时判断实例是否已经初始化，没有的话初始化并赋值。
优点：

1. 懒加载
2. 运行效率高

缺点：

1. 非线程安全：实例未初始化时，如果有多个线程并发调用getInstance方法，可能会造成各线程获取到不同的实例

适用：如非确定不会被多线程调用，否则不建议使用

```java
public static PlainNotSafe getInstance() {
        if (instance == null) {
            instance = new PlainNotSafe();
        }
        return instance;
    }
```

### 1.2. 线程安全

#### 1.2.1 饱汉式

在类初始化过程中即进行实例的创建：

优点：

1. 实现简单
2. 线程安全：实例初始化在类加载阶段完成，JVM内部保证此过程的线程安全性

缺点：

1. 非懒加载

适用： 实例初始化耗费资源少，或者启动时间不敏感，或者业务要求启动后快速响应

```java
class LoadAhead implements Singleton{
    private static LoadAhead instance = new LoadAhead();
    private LoadAhead(){}
    public static LoadAhead getInstance(){
        return instance;
    }
}
```

#### 1.2.2 单同步锁

使用syncronized关键字修饰getInstance方法

```java
    public static synchronized LazyLoadWithOneSynchronization getInstance(){
        if (instance == null) {
            instance = new LazyLoadWithOneSynchronization();
        }
        return instance;
    }
```

优点：

1. 线程安全
2. 实现简单

缺点：

1. 高并发环境，执行效率低：同时只有一个线程可以获取实例

适用： 不适用任何场景

#### 1.2.3 双重检查+同步锁

考虑到实例创建过程仅需要同步一次，后面不需要同步，因此只在实例未创建时进行同步：

```java
    public static LazyLoadWithDoubleCheckSynchronization getInstance(){
        if (instance == null) {
            synchronized (LazyLoadWithDoubleCheckSynchronization.class) {
                if (instance == null) {
                    instance = new LazyLoadWithDoubleCheckSynchronization();
                }
            }
        }
        return instance;
    }
```

优点：

1. 线程安全
2. 并发执行效率高：仅在实例第一次创建过程有锁竞争

缺点：

1. 实现复杂

适用：对于不考虑序列化及反射破坏唯一性的场景，推荐使用此方法

#### 1.2.4 内部类

通过内部类持有唯一实例，通过类加载机制保证懒加载和线程安全

```java
/**
 * @Author: kkyeer
 * @Description: 懒汉式3，使用内部类来进行懒加载，原理是内部类初始化时，使用
 * @Date:Created in 14:57 2019/6/24
 * @Modified By:
 */
class LazyLoadWithInnerClass implements Singleton{
    private LazyLoadWithInnerClass(){}

    private static class Inner{
        static LazyLoadWithInnerClass instance = new LazyLoadWithInnerClass();
    }

    public static LazyLoadWithInnerClass getInstance(){
        return Inner.instance;
    }
}
```

优点：

1. 线程安全
2. 懒加载

缺点：

1. 实现复杂

适用：相对上一个双重检查，多一次（或多次）寻址开销，不推荐使用

#### 1.2.5 枚举

通过枚举实现单例，推荐使用此方式，能在多个维度保证安全：

1. 线程安全
2. 序列化不破坏唯一性
3. 反射调用不破坏唯一性
4. 实现简单

实现如下：

```java
enum LazyLoadWithEnum implements Singleton{
    INSTANCE;
    Singleton getInstance(){
        return INSTANCE;
    }
}
```

## 2. 其他创建对象方式对单例唯一的破坏

单例模式的核心是，在设定的上下文中，指定的类的实例仅有一个，此处的上下文，根据需求不同，可能指JVM、同一SpringContext等，然而，我们都学过，创建一个对象有4种方式：

1. new关键字：```new Object()```
2. 对象反序列化：```objectInputStream.readObject()```
3. 反射调用：```Object.class.getDeclaredConstructor().newInstance()```
4. clone方法：```obj.clone()```

虽然在上述的单例实现中，已经考虑了构造器私有化，保证使用者无法通过new一个新对象的方式破坏唯一性，但仍旧有可能通过其他三种方式，获取到另外的实例，破坏单例模式的唯一性

### 2.1 clone方法另外创建单例对象破坏单例唯一性

clone方法为Object的方法，理论上所有的对象都继承，但是由于此方法为protected方法，且要求必须显式的implement Cloneable接口，换句话说，必须本类（或父类）显式实现clone方法并将之扩大为public权限，因此，clone方法虽然会破坏单例模式的唯一性，但更多是由于在定义单例类时，override clone方法时造成的错误，因此不做讨论

### 2.2 对象反序列化破坏单例唯一性

对于非Enum的单例实现来说，对象反序列化能破坏单例模式的唯一性：

```java
private static void testSerialization(){
        Singleton created = LazyLoadWithInnerClass.getInstance();
        System.out.println(created.hashCode());
        File testFile = new File("obj.txt");
        try {
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(new FileOutputStream(testFile));
            objectOutputStream.writeObject(created);
            objectOutputStream.close();

            ObjectInputStream objectInputStream = new ObjectInputStream(new FileInputStream(testFile));
            Singleton dematerializedObject = (Singleton) objectInputStream.readObject();
            objectInputStream.close();
            System.out.println(dematerializedObject.hashCode());
            Assertions.assertTrue(dematerializedObject == created,"破坏了单例唯一性");
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        } finally {
            testFile.delete();
        }
    }
```

运行结果：

```shell
1995265320
1880587981
Exception in thread "main" java.lang.AssertionError: 破坏了单例唯一性
    at utils.Assertions.assertTrue(Assertions.java:27)
    at design.pattern.singleton.TestCase.testSerialization(TestCase.java:116)
    at design.pattern.singleton.TestCase.main(TestCase.java:25)
```

### 2.2.1 源码解析

ObjectInputStream.readObject方法内部，会判断要反序列化的对象的类型，对于普通对象(非String, Class,* ObjectStreamClass, array, or enum constant),调用下列方法来反序列化:

```java
 private Object readOrdinaryObject(boolean unshared)
        throws IOException
    {
        // 略
        // ↓↓↓↓↓↓↓↓↓初始化新实例↓↓↓↓↓↓↓↓↓↓
        obj = desc.isInstantiable() ? desc.newInstance() : null;
        // 略
        // ↓↓↓↓↓↓↓↓↓调用readResolve方法覆盖↓↓↓↓↓↓↓↓↓↓
        if (obj != null &&
            handles.lookupException(passHandle) == null &&
            desc.hasReadResolveMethod())
        {
            Object rep = desc.invokeReadResolve(obj);
            // 略
            if (rep != obj) {
                // 略
                handles.setObject(passHandle, obj = rep);
            }
        }
        return obj;
    }
```

过程为：

1. 对于可以实例化(调用public无参构造器)的对象，调用ObjectStreamClass的newInstance方法:

    ```java
    Object newInstance()
        throws InstantiationException, InvocationTargetException,
            UnsupportedOperationException
    {
        // 略
        return cons.newInstance();
        // 略
    }
    ```

    变量cons为```private Constructor<?> cons;```,忽略安全检查部分，实际上通过反射来创建新的实例对象，如果将此新创建的对象作为最终结果，则破坏了单例的唯一性
2. 如果目标类实现了readResolve方法，则调用readResolve方法，并用返回的结果覆盖上一步的结果，因此，一种避免序列化破坏单例唯一性的思路即手动实现readResolve方法：

    ```java
    private Object readResolve(){
        return Inner.instance;
    }
    ```

### 2.3 反射调用破坏单例的唯一性

与上述反序列化的源码解析类似，直接通过class对象的newInstance方法或者通过获取其Constructor对象并调用来创建实例时，也会重新生成一个新的实例，从而破坏单例的唯一性，当然，通过在构造器中维护一个flag变量,在多次构造时抛出异常可以（一定程度上）避免此问题：

```java
    private static boolean initFlag = false;
    private LazyLoadWithDoubleCheckSynchronization(){
        if (initFlag) {
            throw new RuntimeException("多次尝试调用构造函数，破坏单例的唯一性");
        }
        initFlag = true;
        // 其他构造过程
    }
```

### 2.4 使用枚举避免序列化和反射过程中对单例的破坏

使用枚举来实现单例模式，可以防止序列化和反射过程中对单例的破坏

#### 2.4.1 单例模式避免序列化过程中对单例唯一性的破坏

对于单例的反序列化，在从流解析对象过程中，调用如下方法：

```java
private Enum<?> readEnum(boolean unshared) throws IOException {
        // 略
        String name = readString(false);
        Enum<?> result = null;
        Class<?> cl = desc.forClass();
        if (cl != null) {
            Enum<?> en = Enum.valueOf((Class)cl, name);
            result = en;
            // 略
        }
        return result;
    }
```

可见流存储的仅为枚举的name，反序列化时，根据name，调用Enum的valueOf方法，获取JVM已经初始化的实例，因此，单例模式使用枚举实现，可以保证反序列化不破坏单例的唯一性

#### 2.4.2 单例模式避免反射破坏单例唯一性

枚举类无法进行反射调用，实际考虑使用下面的代码尝试进行反射创建枚举实例

```java
    private static void testReflection()  {
        try {
            Singleton created = LazyLoadWithEnum.INSTANCE.getInstance();
            Constructor<LazyLoadWithEnum> constructor = LazyLoadWithEnum.class.getDeclaredConstructor(String.class, int.class);
            constructor.setAccessible(true);
            Singleton instanceWithReflection = constructor.newInstance();


            System.out.println(created.hashCode());
            System.out.println(instanceWithReflection.hashCode());
            Assertions.assertTrue(instanceWithReflection == created,"反射破坏单例唯一性");
        } catch (InstantiationException | IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
    }
```

注意，枚举类的Constructor对象获取和newInstance方法均不同于普通类

1. 枚举类看似有空构造方法，其实并非如此，下面是使用【DJ Java Decompiler 3.12】反编译的枚举对应的class文件:

    ```java
        final class LazyLoadWithEnum extends Enum
        implements Singleton
    {

        public static LazyLoadWithEnum[] values()
        {
            return (LazyLoadWithEnum[])$VALUES.clone();
        }

        public static LazyLoadWithEnum valueOf(String name)
        {
            return (LazyLoadWithEnum)Enum.valueOf(design/pattern/singleton/LazyLoadWithEnum, name);
        }

        private LazyLoadWithEnum(String s, int i)
        {
            super(s, i);
        }

        Singleton getInstance()
        {
            return INSTANCE;
        }

        public static final LazyLoadWithEnum INSTANCE;
        private static final LazyLoadWithEnum $VALUES[];

        static
        {
            INSTANCE = new LazyLoadWithEnum("INSTANCE", 0);
            $VALUES = (new LazyLoadWithEnum[] {
                INSTANCE
            });
        }
    }
    ```

    观察发现，此类未定义无参构造器，取而代之的是```private LazyLoadWithEnum(String s, int i)```，因此获取构造器时，应指定参数列表为(String,int)

2. 调用Constructor的newInstance()方法时，如果是枚举类型，会抛出异常:

```java
    public T newInstance(Object ... initargs)
        throws InstantiationException, IllegalAccessException,
               IllegalArgumentException, InvocationTargetException
    {
        // 略
        if ((clazz.getModifiers() & Modifier.ENUM) != 0)
            throw new IllegalArgumentException("Cannot reflectively create enum objects");
        // 略
    }
```

因此，使用Enum来实现单例，可以保证不会因为反射调用来破坏单例的唯一性

## 3. 参考

- [参考1](https://blog.csdn.net/whgtheone/article/details/82990139)
- [参考2](https://blog.csdn.net/qq_33394088/article/details/79008962)
