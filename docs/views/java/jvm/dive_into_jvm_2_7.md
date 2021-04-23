---
date: 2020-10-22
categories:
  - JVM
tags:
  - jvm
publish: true
---

# 《深入Java虚拟机》代码2-7 String.intern()示例代码问题

## 环境说明

openjdk7u11 自己从源码编译的版本

## 源码

参考书上的源码

```Java
public class FunWithIntern {
    public static void main(String[] args) {
        String str1 = new StringBuilder("沙").append("发").toString();
        System.out.println(str1.intern() == str1);

        String str2 = new StringBuilder("ja").append("va").toString();
        System.out.println(str2.intern() == str2);

        String str3 = new StringBuilder("open").append("jdk").toString();
        System.out.println(str3.intern() == str3);
    }
}
```

上述程序运行的结果为

```
true
true
false
```

**与书上的说明不符**
按书上的说明，由于jdk1.7中，String.intern()返回的是**首次出现**的字符串的引用，所以对于str1，由于str1即字符串”沙发“在环境中第一次出现，str1.intern()返回的是str1的引用，所以str1.intern()==str1结果为true
问题出在str2，书上说字符串**"java"**不是在此方法中第一次出现，因此在运行此程序之前，即环境初始化时已有字符串**"Java"**，所以理论str2.intern()==str2结果应为false，然而实际运行中，此方法仍旧为true，即环境中预先不存在此字符串，与书中描述不符

## 探秘

实际中，书中指的预先存在的字符串是在System类初始化中定义的，查看System类源码

```Java
public final class System {

    /* register the natives via the static initializer.
     *
     * VM will invoke the initializeSystemClass method to complete             <===VM调用initializeSystemClass方法
     * the initialization for this class separated from clinit.
     * Note that to use properties set by the VM, see the constraints
     * described in the initializeSystemClass method.
     */
    private static native void registerNatives();
    static {
        registerNatives();
    }
//...
    private static void initializeSystemClass() {
//...
        sun.misc.VM.saveAndRemoveProperties(props);
        lineSeparator = props.getProperty("line.separator");
        sun.misc.Version.init();//                                             <===此方法中会调用sun.misc.Version.init()方法
   }
}
```

注意上面两处箭头注释 ：VM调用initializeSystemClass方法=>此方法中会调用sun.misc.Version.init()方法，而sun.misc.Version类如下

```Java
public class Version {
    private static final String launcher_name = "openjdk";
    private static final String java_version = "1.7.0-internal";
//...
}
```

在某些环境中上面的launcher_name的值为"java"，第一个程序运行时，**"java"**预先存在，str2.intern()==str2返回false
我的openjdk中**"java"**预先不存在，str2.intern()==str2返回true，但str3.intern()==str3返回false

参考 <https://blog.csdn.net/w605283073/article/details/72753494>
