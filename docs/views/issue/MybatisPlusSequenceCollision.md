---
date: 2021-04-15
categories:
  - 线上问题
tags:
  - 
publish: true
---

# MybatisPlus雪花算法生成器Id重复生成

MybatisPlus版本3.3.2，使用```@TableId```注解配合Insert语句使用时，如果指定Type为```ASSIGN_ID```，使用内置的ID生成策略，线上使用此策略发现，在Pod数量较多(>32)，且流量激增时，会产生Id冲突，数据库报错Duplicate Key。

## MybatisPlus雪花算法的Bit位分配

MybatisPlus内置的雪花算法，基本思路与Twitter一致，将64bit的Long型数据如下分配

![MbpSnowFlake.svg](https://cdn.jsdmirror.com/gh/kkyeer/picbed/MbpSnowFlake2.svg)

- 42bit: 时间戳
- 5bit: DataCenterId(0-32)
- 5bit: WorkerId(0-32)
- 12bit: 毫秒内自增数量

其中DataCenterId和WorkerId决定了**同一服务**的Pod间不会产生冲突

### DataCenterId生成逻辑

具体代码如下，使用MAC地址的后两位经过计算得到DataCenterId，取值范围0-31。MAC地址48Bit=6Byte，实际计算时，取后两个Byte按位拼接，再右移6位，完毕后与32作取摸运算得到最终值。

```java
protected static long getDatacenterId(long maxDatacenterId) {
    long id = 0L;
    try {
        InetAddress ip = InetAddress.getLocalHost();
        NetworkInterface network = NetworkInterface.getByInetAddress(ip);
        if (network == null) {
            id = 1L;
        } else {
            byte[] mac = network.getHardwareAddress();
            if (null != mac) {
              // 取后两个byte按位拼接，再右移6位
                id = ((0x000000FF & (long) mac[mac.length - 2]) | (0x0000FF00 & (((long) mac[mac.length - 1]) << 8))) >> 6;
                // 取模运算
                id = id % (maxDatacenterId + 1);
            }
        }
    } catch (Exception e) {
        logger.warn(" getDatacenterId: " + e.getMessage());
    }
    return id;
}
```

### WorkerId生成逻辑

代码如下，将DataCenterId与进程的PID拼接成字符串后进行哈希运算，完成后与32取模得到最终值。

```java
protected static long getMaxWorkerId(long datacenterId, long maxWorkerId) {
    StringBuilder mpid = new StringBuilder();
    mpid.append(datacenterId);
    String name = ManagementFactory.getRuntimeMXBean().getName();
    if (StringUtils.isNotBlank(name)) {
        /*
          * GET jvmPid
          */
        mpid.append(name.split(StringPool.AT)[0]);
    }
    /*
      * MAC + PID 的 hashcode 获取16个低位
      */
    return (mpid.toString().hashCode() & 0xffff) % (maxWorkerId + 1);
}
```

## 错误复盘

### 原因

雪花算法冲突，常见原因为时钟回拨、同一ms内数量过大导致溢出、workerId冲突，此算法实现中已经处理了时钟回拨的情况，源码略。

考虑同一ms内数量过大导致溢出的情况，此算法在同一ms数据量过大时，会暂时阻塞，等待下一ms，服务内部不会产生重复ID，排除Pod内ID重复可能，核心代码如下

```java
    public synchronized long nextId() {
      // 省略部分逻辑
        if (lastTimestamp == timestamp) {
            // 相同毫秒内，序列号自增
            sequence = (sequence + 1) & sequenceMask;
            if (sequence == 0) {
                // 同一毫秒的序列数已经达到最大
                timestamp = tilNextMillis(lastTimestamp);
            }
        } 
        // 省略部分逻辑
    }

    protected long tilNextMillis(long lastTimestamp) {
        long timestamp = timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = timeGen();
        }
        return timestamp;
    }

    protected long timeGen() {
        return SystemClock.now();
    }


```

经过数据分析，线上产生ID重复时，确实是Pod间同时向同一张表插入数据，抓取到的互相冲突的Pod参与计算的关键数值如下
| Pod | MAC后两位 | PID     |
|-----|-----------|---------|
| 1   | -126,-111 | 2645473 |
| 2   | -79,-95   | 2147074 |

通过下列代码可以计算各自的DataCenterId和WorkerId

```java
import java.net.UnknownHostException;
import java.util.concurrent.ExecutionException;

/**
 * @Author: kkyeer
 * @Description: 计算雪花算法ID
 * @Date:Created in 下午5:47 2021/4/16
 * @Modified By:
 */
public class IdCalculator {
    public static void main(String[] args) throws UnknownHostException, ExecutionException, InterruptedException {
        printDataCenterIdAndWorkerId(-126,-111,2645473);
        printDataCenterIdAndWorkerId(-79,-95, 2147074);
    }

    static void printDataCenterIdAndWorkerId(long mac1,long mac2,long pid){
        long dataCenterId = getDatacenterId(mac1,mac2,31);
        long workerId = getMaxWorkerId(dataCenterId, 31, pid);
        System.out.println(String.format("DataCenterId:%d,WorkerId:%d",dataCenterId,workerId));
    }

    static long getDatacenterId(long mac1,long mac2,long maxDatacenterId) {
        long id = 0L;
        id = ((0x000000FF & (long) mac1) | (0x0000FF00 & (((long) mac2) << 8))) >> 6;
        id = id % (maxDatacenterId + 1);
        return id;
    }


    static long getMaxWorkerId(long datacenterId, long maxWorkerId,long pid) {
        StringBuilder mpid = new StringBuilder();
        mpid.append(datacenterId);
        mpid.append(pid);
        /*
         * MAC + PID 的 hashcode 获取16个低位
         */
        return (mpid.toString().hashCode() & 0xffff) % (maxWorkerId + 1);
    }
}
```

计算的结果为

```shell
DataCenterId:6,WorkerId:21
DataCenterId:6,WorkerId:21
```

根据bit分配，如果两个服务的DataCenterId和WorkerId一样，高并发下同一毫秒各自生产多条数据，因为前44位（时间戳）相同，45-54位（DataCenterId和WorkerId）相同，最后12bit（初始值为0-3的随机值，递增）很有可能重复，造成ID冲突。

### 影响范围

考虑DataCenterId，服务k8s集群化部署，Pod的MAC地址是随机生成的，能保证DataCenterId大体均匀分布，但是由于DataCenterId的取值范围共32个数，在Pod数量>32时，一定会发生DataCenterId碰撞的情况。

再考虑WorkerId，此ID的结果与DataCenterId相关，在常见的镜像生成插件中，业务服务进程是作为守护进程的，也就是说PID固定为1，换句话说，**只要DataCenterId相同，则WorkerId一定相同，高并发下极大概率ID冲突**。

### 结论

此算法依赖MAC地址后两位散列来保证DataCenterId不重复，同时由于打包镜像的原因，WorkerId的随机效果无效，同一服务在数量较多时，DataCenterId和WorkerId相同概率极高，数量>32时，一定会产生DataCenterId和WorkerId相同

## 解决方案

### 简单解决方案（手动）

在CI流程中，手动指定要启动的Pod的DataCenterId和WorkerId，写入环境变量，服务内部接收环境变量并用此参数初始化Sequence对象，MybatisPlus提供了对应的自定义配置

[MybatisPlus文档:自定义ID生成器](https://mp.baomidou.com/guide/id-generator.html#spring-boot)

```java
@Component
public class CustomIdGenerator implements IdentifierGenerator {
  private Sequence customSequence;

  public CustomIdGenerator(){
    long dataCenterId = Long.parseLong(System.getenv().get("DataCenterId"));
    long workerId = Long.parseLong(System.getenv().get("workerId"));
    customSequence = new Sequence(dataCenterId,workerId);
  }

  @Override
  public Long nextId(Object entity) {
    return customSequence.nextId();
  }
}
```

### 自动化方案

参考美团的唯一ID生成器，使用ZK配合虚拟节点来获取当前已经被占用的WorkerId，计算本服务的WorkerId，并使用心跳保持，代码暂略。

[Leaf——美团点评分布式ID生成系统](https://tech.meituan.com/2017/04/21/mt-leaf.html)
