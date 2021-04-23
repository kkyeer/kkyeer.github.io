---
date: 2020-09-19
categories:
  - 开发问题
tags:
  - BUG
publish: true
---

# JDK中的Bug: Array和List的互相转化

​众所周知，JDK提供了一对方法来进行Array和List的互相转换:

- ```Arrays.asList()```  Array->List

- ```arr.toArray()```  List->Array

但是上述方法内部含有一些已知bug，会导致**编译器正常但运行时报错**

## 报错

// TODO 放入链接

Bug示例代码:

```java
public class ToArrayBugExperiment {
    public static void main(String[] args) {
        Child[] childArray = {new Child(), new Child()};
//        使用List<Object>接响应
        List<Object> arr = Arrays.asList(childArray);  
        try {
            // 此处报错1
            arr.set(0, new Object());
        } catch (Exception e) {
            e.printStackTrace();
        }
//        正确的方法
        List<Child> childArrayList = Arrays.asList(childArray);
//        调用带参的toArray方法
        Object[] withParam = childArrayList.toArray(new Object[0]);
        System.out.println("带参方法的返回数组类型:"+withParam.getClass());
        withParam[0] = new Object();
//        调用无参的toArray方法
        Object[] withoutParam = childArrayList.toArray();
        System.out.println("无参方法的返回数组类型:"+withoutParam.getClass());
        try {
            // 此处报错2
            withoutParam[0] = new Object();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static class Child extends Parent{}

    private static class Parent{}
}
```

此代码可以**正常编译**，但是**运行时抛出异常**:
![toArrayException.png](https://cdn.jsdelivr.net/gh/kkyeer/picbed/toArrayException.png.png)

- 报错1:将一个Child类型的array,通过Arrays.asList转化成了一个```List<Object>```，理论上此类型的List可以存储任何Object类型（及其子类型）的对象，下面的set方法理应可以正常执行，但是报错了
- 报错2:```Arrays.asList```转换而成的List，再次执行```toArray()```后的```Object[]```数组，放入```Object```对象报错

### 原因(JDK8)

如果仔细查看```java.util.Arrays#asList```方法，会发现其只是将入参数组传入了```ArrayList```的构造器，并返回构造出的实例，此处有几个关键点:

1. 这里的类是```java.util.Arrays.ArrayList```，是Arrays的内部类，而非常用的```java.util.ArrayList```
2. 看下述的源码，此类只是简单的将传入的array的**引用**赋值给内部的数组
3. 后面的```get```和```set```方法，都是直接对包裹的数组进行操作。因此在上述测试代码set的时候，实质上是想赋值一个```Child```类型的数组的位置为Object，根据数组的约定，是不允许的，因此报错
4. ```toArray()```方法调用```clone()```，此方法会直接复制原数组，因此返回值仍是```Child[]```类型，**发生了协变，即实际类型为```Child[]```的数组，被一个```Object[]```类型的变量引用**
5. ```toArray(T... a)```方法调用```Arrays.copyOf```或者```System.arraycopy```方法，两种方法均保证返回值数组为```Object[]```类型

```java
private static class ArrayList<E> extends AbstractList<E>
    implements RandomAccess, java.io.Serializable
{
    private final E[] a;

    ArrayList(E[] array) {
        // 这里是构造方法，直接引用赋值
        a = Objects.requireNonNull(array);
    }

    // 下面两个方法实现不同
    @Override
    public Object[] toArray() {
        return a.clone();
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T[] toArray(T[] a) {
        int size = size();
        if (a.length < size)
            return Arrays.copyOf(this.a, size,
                                    (Class<? extends T[]>) a.getClass());
        System.arraycopy(this.a, 0, a, 0, size);
        if (a.length > size)
            a[size] = null;
        return a;
    }

    // 省略其他方法实现
}
```

### 解决

1. 使用```Arrays.asList(T... a)```方法时，注意返回值的List的泛型应该与传入的类型T一致，**编译器不会报错**

    ```java
    List<Child> arr = Arrays.asList(childArray);  // <== 此处List的泛型应为Child，不能随便修改
    ```

2. 使用```toArray(T[] a)```来保证结果数组与预期类型一致，**避免使用无参的```toArray()```方法**

## JDK11的变化

JDK11中，```java.util.Arrays.ArrayList```类的实现有变化， toArray()方法同时会修改返回值的类型，强制转为```Object[]```，具体代码如下:

```java
    private static class ArrayList<E> extends AbstractList<E>
        implements RandomAccess, java.io.Serializable
    {
        // 这是JDK8的实现
        @Override
        public Object[] toArray() {
            return a.clone();
        }
        // 这是JDK11的实现，数组的类型有变化
        @Override
        public Object[] toArray() {
            return Arrays.copyOf(a, a.length, Object[].class);
        }
    }
```

对于JDK11来说，返回的数组永远是```Object[]```，不会因为协变导致问题。因此第二个问题不会报错。
