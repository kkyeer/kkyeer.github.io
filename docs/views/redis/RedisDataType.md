---
date: 2020-05-21
categories:
  - redis
publish: false
---

# Redis数据类型与存储结构

对于Redis来说，Key类似SQL中Table的概念。Key指向某种基本的数据类型。Redis有六种基本的数据类型：Hash, ZSet, Set, String, List, HyperLogLog。其中

1. 存储0元数据的有：String
2. 存储一元数据的有：List,Set,HyperLogLog(基数)
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

### String基本命令

- 基本操作：GET，SET，INCR，APPEND，SETRANGE
- CAS操作：SETNX，MSETNX，常用于分布式锁
- Bit操作：BITCOUNT，BITFIELD，BITOP，BITPOS

## List

List顾名思义，提供有序数组的功能，在整体数据较少或者节点数据不大时，用定长数组zipList存储，在某节点长度超过64字节或整体长度超过512时，采用双向链表存储

### List基本命令

- 增：LPUSH，RPUSH，LINSERT，CAS操作：LPUSHX，RPUSHX
- 删: LREM,LPOP,RPOP,BLPOP,BRPOP
- 改：LSET
- 查：LLEN，LINDEX
- RPOPLPUSH:从数组1的尾部移出元素到数组2的头部

##　Set

Set存储不重复的数据，底层采用int数组或者hashtable来存储，转换的边界条件一样是节点64字节或者整体长度512个