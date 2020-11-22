---
date: 2019-11-22
categories:
  - Java
tags:
  - 
publish: true
---

# Java泛型：循环形参（recursive type parameter）与builder设计模式中的builder类继承

## 简单的泛型循环形参

```Java
/**
     * 返回Collections中的最大值（取决于compare方法的实现）
     * @author kkyeer
     * @date 2018/10/18 21:57
     * @param collection 要比较的入参
     * @param <E> recursive parameter type
     * @return E Collections中的最大值
     */
    public static <E extends Comparable<E>> E max(Collection<E> collection) {
        if (collection.isEmpty()) {
            throw new IllegalArgumentException();
        }
        Iterator<E> iterator = collection.iterator();
        E current = iterator.next();
        while (iterator.hasNext()) {
            E next = iterator.next();
            if (next.compareTo(current)>0) {
                current = next;
            }
        }
        return current;
    }
```

方法定义中用到了泛型中循环形参表示法<E extends Comparable<E>>，按Effective Java的说法，此表示法的意义是，E为任何可与自身比较的类
>The type bound <E extends Comparable<E>> may be read as “any type E that can
be compared to itself,” which corresponds more or less precisely to the notion of
mutual comparability

个人认为，同样可以理解为，E表示任何**实现了Comparable接口**的类
此处包含以下几重含义

1. 使用时传入的实际类，应实现Comparable接口
2. 使用时传入的类，在实现Comparable接口时使用的为泛型定义的方式，非RawType
**以上两点可以保证在while循环中，使用next.compareTo(current)方法时是类型安全的**

## Builder模式中的循环形参

Effective Java 中有介绍一种Builder写法，具体如下

- 父类

```Java
/**
 * @author kkyeer@gmail.com
 * @date 2018/10/1 17:49
 */
public abstract class AbsPerson {
    int age;
    String name;
    String id;

    AbsPerson(AbsBuilder absBuilder) {
        this.age = absBuilder.age;
        this.name = absBuilder.name;
        this.id = absBuilder.id;
    }

    protected abstract static class AbsBuilder<T,B extends AbsBuilder<T,B>> {
        int  age;
        String name;
        String id;

        public AbsBuilder(int age, String name) {
            this.age = age;
            this.name = name;
        }

        @SuppressWarnings(""unchecked"")
        public B id(String id) {
            this.id = id;
            return self();
        }

        protected abstract B self();

        abstract T build();
    }
}
```

- 子类

```Java
/**
 * @author kkyeer@gmail.com
 * @date 2018/10/2 21:29
 */
public class Student extends AbsPerson {
    private int classNo;

    private Student(StuBuilder builder) {
        super(builder);
        this.classNo = builder.classNo;
    }

    public static class StuBuilder extends AbsPerson.AbsBuilder<AbsPerson,StuBuilder> {
        int classNo;

        public StuBuilder(int age, String name, int classNo) {
            super(age, name);
            this.classNo = classNo;
        }

        public StuBuilder classNo(int classNo) {
            this.classNo = classNo;
            return this;
        }

        @Override
        protected StuBuilder self() {
            return this;
        }

        @Override
        Student build() {
            return new Student(this);
        }
    }

    @Override
    public String toString() {
        return ""Student{"" +
                ""classNo="" + classNo +
                "", age="" + age +
                "", name='"" + name + '\'' +
                "", id='"" + id + '\'' +
                '}';
    }
}

```

注1：此处泛型保证AbsBuilder的使用泛型的子类，必须在泛型处声明此builder对应build出的类型T，第二个形参为子类本身，保证id方法返回值为子类类型
如以下声明是可以编译通过的

```Java
public static class StuBuilder extends AbsPerson.AbsBuilder<AbsPerson,StuBuilder>{...}

```

下面的是有编译报错的

```Java
public static class WrongExampleBuilder extends AbsPerson.AbsBuilder<WrongExample, AbsBuilder>

```
