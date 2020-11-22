---
date: 2018-11-24
categories:
  - java
tags:
  - 
publish: true
---

# 匿名内部类的继承

1. 父类

```Java
public class Parent {
    Printer printer = new Printer() {
        @Override
        public void print(String inString) {
            System.out.println(""Parent printer start"");
            System.out.println(inString);
        }
    };

    void test(){
        this.printer.print(""This is in parent class"");
    }

    public static void main(String[] args) {
        new Parent().test();
    }
}
```

2. 子类

```Java
public class Child extends Parent {
    @Override
    void test() {
        this.printer.print(""this is in child class"");
    }

    public static void main(String[] args) {
        new Child().test();
    }
}
```
