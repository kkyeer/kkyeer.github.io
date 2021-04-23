---
date: 2020-09-22
categories:
  - JVM
tags:
  - jvm
publish: true
---

# 《深入Java虚拟机》代码3.6.3 长期存活对象进入老年代分析

## 书中对于代码片段3.6.3的解释不是很详细，下面是我自己的理解

1. 运行环境为Linux+自己编译的OpenJDK7u4，运行时使用的jvm参数为

>-verbose:gc -Xms20M -Xmn10M -XX:+PrintGCDetails -XX:SurvivorRatio=8 -XX:MaxTenuringThreshold=1 -XX:+PrintTenuringDistribution  -XX:+UseSerialGC

2. 示例代码

```Java
public class PromoteToTenuredGen {
    private static final int _1MB = 1024*1024;

    public static void main(String[] args) {
        byte[] allo1,allo2,allo3;
        allo1 = new byte[_1MB / 4];
        allo2 = new byte[_1MB * 4];
//      ===>  minorGC1
//     试图在Eden区划分空间给allo3指向的对象，由于allo1-3加起来有8.25M，Eden区实际为8192k ,空间不足，触发新生代minorGC
        // 此时allo3还未分配，Eden区有两个对象，分别为allo1指向及allo2指向，且均存活，allo1小于1M能被Survivor区接纳所以进入Survivor，age为1，allo2太大被移动到老年代
        // 所以GC后新生代大小为1/4M左右（allo1的大小）
//        此次GC日志如下
//        [GC[DefNew
//        Desired survivor size 524288 bytes, new threshold 1 (max 1)
//        - age   1:     584400 bytes,     584400 total
//        : 5702K->570K(9216K), 0.0066230 secs] 5702K->4666K(19456K), 0.0066470 secs] [Times: user=0.00 sys=0.00, real=0.01 secs]

        allo3 = new byte[_1MB * 4];
        allo3 = null;
        allo3 = new byte[_1MB * 4];
//      ===>  minorGC2
        // 此时Eden区有原allo3指向的对象，若想再分配新空间给allo3新指向的对象，则需共计8M空间，Eden区空间不足，触发MinorGC
        // Eden区原allo3指向的对象无引用被GC，Survivor区中allo1指向的对象age+1，变成2，晋升老年代
        // 最后的结果，新生代无对象，老年代有allo1和allo2指向的对象
//        此次GC日志如下
//        [GC[DefNew
//        Desired survivor size 524288 bytes, new threshold 1 (max 1)
//        : 4666K->0K(9216K), 0.0022280 secs] 8762K->4666K(19456K), 0.0022520 secs] [Times: user=0.00 sys=0.00, real=0.01 secs]
    }
}
```

3. 各次GC细节

- minorGC1:
        试图在Eden区划分空间给allo3指向的对象，由于allo1-3加起来有8.25M，Eden区实际为8192k ,空间不足，触发新生代minorGC
        此时allo3还未分配，Eden区有两个对象，分别为allo1指向及allo2指向，且均存活，allo1小于1M能被Survivor区接纳所以进入Survivor，age为1，allo2太大被移动到老年代
        所以GC后新生代大小为1/4M左右（allo1的大小）
        此次GC日志如下

> [GC[DefNew
        Desired survivor size 524288 bytes, new threshold 1 (max 1)
        - age   1:     584400 bytes,     584400 total
        : 5702K->570K(9216K), 0.0066230 secs] 5702K->4666K(19456K), 0.0066470 secs] [Times: user=0.00 sys=0.00, real=0.01 secs]

- minorGC2:
        此时Eden区有原allo3指向的对象，若想再分配新空间给allo3新指向的对象，则需共计8M空间，Eden区空间不足，触发MinorGC
        Eden区原allo3指向的对象无引用被GC，Survivor区中allo1指向的对象age+1，变成2，晋升老年代
        最后的结果，新生代无对象，老年代有allo1和allo2指向的对象
        此次GC日志如下

> [GC[DefNew
        Desired survivor size 524288 bytes, new threshold 1 (max 1)
        : 4666K->0K(9216K), 0.0022280 secs] 8762K->4666K(19456K), 0.0022520 secs] [Times: user=0.00 sys=0.00, real=0.01 secs]
        新生代变成0
