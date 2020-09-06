---
date: 2020-09-05
categories:
  - 待发布
tags:
  - 寻根究底
publish: false
---

# Java是如何获取本地IP的

Java 获取当前运行环境的IP地址，涉及到下面的几个细节

1. 多网卡环境下，本地IP指哪个网卡的IP？
2. 多网卡环境下，能否通过指定网卡/外部配置来指定用哪张网卡？

下面是实际的代码

```java
public static void main(String[] args) throws IOException {
    // TODO
    System.out.println(Inet4Address.getLocalHost().getCanonicalHostName());
    // 获取IP
    System.out.println(Inet4Address.getLocalHost().getHostAddress());
    //  TODO
    System.out.println(Inet4Address.getLocalHost().getHostName());
}
```

## InetAddress/Inet4Address/Inet6Address

InetAddress

## 实例化InetAddressImpl

InetAddressImpl类初始化时，在静态代码块里初始化InetAddressImpl

1. 判断IPV6是否可用

    TODO
    ```net_util.c```文件里的```ipv6_available()```方法&&  preferIPV4Stack

2. 根据上面的结果初始化InetV4和InetV6
3. 创建Namespace Provider
