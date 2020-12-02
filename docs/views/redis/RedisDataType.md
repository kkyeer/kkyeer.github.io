---
date: 2020-05-21
categories:
  - Redis
publish: true
---

# Redis数据类型与存储结构

对于Redis来说，Key类似SQL中Table的概念。Key指向某种基本的数据类型。Redis有六种基本的数据类型：Hash, ZSet, Set, String, List, HyperLogLog。其中

1. 存储0元数据的有：String,HyperLogLog
2. 存储一元数据的有：List,Set
3. 存储二元数据的有: Hash[存储K-V对],Zset[Value+分值]

## String

存储字符串,底层采用SDS结构来存储数据，实际上是存储了当前长度和总长度的C Struct.底层存储时有多种不同的策略：

1. 长度小于44时，根据是否能parse成整数来存储为```OBJ_ENCODING_EMBSTR```或者```OBJ_ENCODING_INT```;
2. 长度大于44时，内部编码方式改为```OBJ_ENCODING_RAW```;

### 为什么是44字节分割

3.2版本前，是用39字节分割的，原因是redis希望对于短的字符串，只需要一次alloc过程。然而内存分配器jemalloc分配的内存如果超出了64个字节就认为是一个大字符串，就会用到raw编码。因此一次性分配内存限制为64字节。

首先RedisObject的定义：

```c
typedef struct redisObject {
    unsigned type:4; // 4bit
    unsigned encoding:4; // 4bit
    unsigned lru:LRU_BITS; // 24bit
    int refcount; // 32bit
    void *ptr; // 64位系统为64bit
} robj;
```

总计128bit=16字节

然后看一下SDS占用的字节数

3.2版本前:

```c
struct sdshdr {
    unsigned int len; // 4字节
    unsigned int free; // 4字节
    char buf[];
};
```

总计8个字节，算上SDS为了共用glibc的字符串函数在byte[] 数组里强制加入的```\0```结束符1个字节，剩下留给内容的空间为64-16-1-8=39字节

3.2版本后:

```c
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len; // 8bit
    uint8_t alloc;  // 8bit
    unsigned char flags;  //8bit
    char buf[];
};
```

总共占用3字节，剩余64-16-1-3=44字节

### String命令

- 基本操作：```GET```,```SET```,```INCR```,```APPEND```,```SETRANGE```
- CAS操作：```SETNX```,```MSETNX```,常用于分布式锁
- Bit操作：```BITCOUNT```,```BITFIELD```,```BITOP```,```BITPOS```

## List

List顾名思义，提供有序数组的功能，在整体数据较少或者节点数据不大时，用定长数组zipList存储，在某节点长度超过64字节或整体长度超过512时，采用双向链表存储

### List命令

- 增：```LPUSH```,```RPUSH```,```LINSERT```,CAS操作：```LPUSHX```，```RPUSHX```
- 删: ```LREM```,```LPOP```,```RPOP```,```BLPOP```,```BRPOP```
- 改：```LSET```
- 查：```LLEN```，```LINDEX```
- RPOPLPUSH:从数组1的尾部移出元素到数组2的头部

## Set

Set存储不重复的数据，底层采用int数组或者hashtable来存储，转换的边界条件一样是节点64字节或者整体长度512个。

### Set基本命令

- 增：```SADD```
- 删：```SREM```,```SPOP```[随机删除一个],```SMOVE```[将元素从一个Set转移到另外一个Set]
- 查：```SMEMBERS```,```SISMEMBER```,```SRANDMEMBER```,```SSCAN```

### Set集合命令

- DIFF:```SDIFF```,```SDIFFSTORE```
- 交：```SINTER```,```SINTERSTORE```
- 并：```SUNION```,```SUNIONSTORE```

## HyperLogLog

统计集合中不重复元素的个数，底层使用概率算法来计算，不实际存储数据，每个key对应的数据大小为12K左右，错误率0.81%,算法参考[神奇的HyperLogLog算法](http://www.rainybowe.com/blog/2017/07/13/%E7%A5%9E%E5%A5%87%E7%9A%84HyperLogLog%E7%AE%97%E6%B3%95/index.html)

### HyperLogLog基本命令

- 增：```PFADD```
- 查：```PFCOUNT```
- 合并两个HyperLogLog:```PFMERGE```

## Hash

Hash类似Java中常用的HashMap，存储K-V对，底层使用ZipList或者HashTable来存储

### 常用命令

- 增:```HSET```,```HMSET```,```HSETNX```
- 删:```HDEL```
- 改:```HINCRBY```,```HINCRBYFLOAT```
- 查Value:```HGET```,```HGETALL```,```HMGET```,```HVALS```
- 查Key:```HEXISTS```,```HKEYS```
- 查长度与迭代:```HLEN```,```HCASN```,```HSTRLEN```

## ZSET

ZSET与SET的区别在于，ZSET中元素是有序的，在ZSET新增元素时，需要指定一个SCORE参数，ZSET内部会根据SCORE进行排序并存储。底层存储使用zipList或者skiplist，转换条件是单元素长度64字节或者总元素个数128个。

### ZSET命令

- 增:```ZADD```,```ZINCBY```
- 删:```ZREM```,```ZREMRANGEBYLEX```,```ZREMRANGEBYRANK```,```ZREMRANGEBYSCORE```以及REV版本
- 总数:```ZCARD```,```ZCOUNT```
- 最值:```ZPOPMAX```,```BZPOPMAX```,```ZPOPMIN```,```BZPOPMIN```
- 范围查询:```ZRANGE```,```ZRANGEBYLEX```,```ZRANGEBYSCORE```以及REV版本
- 迭代:```ZSCAN```
- 带权重交集想加:```ZINTERSTORE```
- 并集:```ZUNIONSTORE```

解释下查询、删除中不带后缀，BYLEX和BYSCORE的区别：

普通不带后缀代表根据index查询，BYLEX表明根据value比较函数来查询范围，BYSCORE，严格按照SCORE查询范围。其中容易混淆的是不带后缀和BYSCORE后缀，两者的区别是不带后缀的是严格按照index来查询的，而对于同SCORE的两个value，index一定是不一样的，后者则按照Score排序。
