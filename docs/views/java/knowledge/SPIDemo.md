---
date: 2019-11-22
categories:
  - 懂
tags:
  - 
publish: true
---

# SPI的实现

java.util.ServiceLoader

## 定义

Service Provider Interface
面向接口编程的重要思路

## 实现过程

1. 定义接口

```Java
public interface Printer {
    void print(String inString);
}
```

2. 定义实现类

- 实现类1

```Java
public class FunnyPrinter implements Printer {
    @Override
    public void print(String inString) {
        System.out.println(""---This is a funny printer----"");
        System.out.println(inString);
    }
}
```

- 实现类2

```Java
public class DiyPrinter implements Printer{

    @Override
    public void print(String inString) {
        System.out.println(""---This is a diy printer----"");
        System.out.println(inString);
    }
}
```

3. 在项目中定义接口的实现类
   1. 项目根目录中添加META-INF/services文件夹，具体实现方法各异，idea的实现方法之一如下
      1. 新建resources文件夹
      2. 右键resources文件夹，mark as resources root，默认情况下，resources root对应的文件夹下的内容会自动部署到项目根目录
      3. 在新建的resources文件夹下创建META-INF/services文件夹
   2. 新建文件，文件名为**接口**的全限定名，本例为tasteSPI.printer
   3. 文件内容为具体实现类的类命，本例为tasteSPI.DiyPrinter或tasteSPI.FunnyPrinter
4. 测试是否成功
在配置为tasteSPI.DiyPrinter时

```Java
public class TestCase {
    public static void main(String[] args) {
        ServiceLoader<Printer> printers = ServiceLoader.load(Printer.class);
        Iterator<Printer> printerIterator = printers.iterator();
        Printer printer;
        while (printerIterator.hasNext()) {
            printer = printerIterator.next();
            printer.print(""test  page"");
        }

    }
}
```

输出
>---This is a diy printer----
test  page
