---
date: 2021-02-19
categories:
  - Redis
tags:
  - 分布式
  - 缓存
publish: true
---

# 缓存击穿、穿透与雪崩

## 缓存击穿

缓存击穿指**数据存在**，但是由于缓存失效同时由于短时间的高并发，导致数据库承受大量读请求，常见于Cache-Aside Pattern。问题出现在缓存失效后，一瞬间收到大量请求，所有的请求**同时**发现缓存失效后又**同时**请求数据库。

>为什么叫缓存击穿

我个人的理解是，对于数据库有数据的情况，Redis本来是可以作为一道缓冲降低大量读请求对数据库的冲击，但是由于设计不当导致这种缓冲不存在，所以是击穿，即击中并穿透了原来应该起作用的缓冲层。

### 缓存击穿解决方案

Cache-Aside-Pattern，当缓存失效后，从数据库重新加载回DB之前，新增全局Redis锁，并且抢到锁以后，由于不确定是否已经被其他线程刷新到缓存完毕，再次尝试从缓存读取，类似单例模式的双重校验锁逻辑。
同时，考虑缓存击穿的前提条件：**热点key**瞬间收到大量读请求，因此对于热点数据的失效时间，加载策略进行优化，也是一种解决问题的方案，比如

1. 增大热点key的存活时间
2. 采用单线程异步刷新机制定时更新缓存

### 全局锁解决方案示例代码

```java
    public BusiTargetData getData(int id){
      BusiTargetData result = getDataFromRedis(id);
      if(result == null){
        Lock lock = redis.globalLock(CACHE_LOAD_KEY_PREFIX+"id");
        if(lock.tryLock()){
          result = getDataFromRedis(id);
          if(result == null){
            result = getDataFromDb(id);
            saveToRedis(KEY_PREFIX_+"id",result);
          }
          lock.unLock;
        }
      }
    }
```

## 缓存穿透

缓存穿透是指**数据不存在**，但是由于客户端代码问题、恶意攻击等原因，反复加载不存在的数据，导致数据库压力升高。
与缓存击穿比，穿透所需的力更小，因为理论上对于这种类型的请求，缓冲层是不存在的，不做任何处理的话请求一定会直接冲击到DB。

### 缓存穿透解决方案

1. 通过WAF阻断，用户权限校验（JWT）过滤部分非法请求
2. 通过布隆过滤器进行过滤，如果一个key的hash值不存在布隆过滤器中，则返回null，此方法**需要将所有可能的key值进行hash**
3. 如果数据在缓存和数据库均不存在，仍旧在缓存中存储null值，将这个缓存的过期时间存储为（业务可以接受的最大时间，比如5分钟），这样在5分钟之内，这个key对应的数据不会导致缓存穿透

### 缓存穿透示例代码-布隆过滤器

布隆过滤器可以考虑放到本地（使用Guava）或者使用Redis的BitMap(使用Redisson已经包装好的BloomFilter)

```java
    public BusiTargetData getData(int id){
      BusiTargetData result = getDataFromRedis(id);
      if(result == null){
        // 先使用布隆过滤器判断数据是否在DB
        BloomFilter bloomFilter = redis.getBloomFilter(FILTER_KEY);
        if(bloomFilter.exists(id)){
          Lock lock = redis.globalLock(CACHE_LOAD_KEY_PREFIX+"id");
          if(lock.tryLock()){
            result = getDataFromRedis(id);
            if(result == null){
              result = getDataFromDb(id);
              saveToRedis(KEY_PREFIX_+"id",result);
            }
            lock.unLock;
          }
        }else{
          return null;
        }
      }
    }
```

## 缓存雪崩

与缓存击穿相比，缓存雪崩指大范围的缓存失效，导致的大量请求打到数据库。导致缓存雪崩的原因有很多，如请求毛刺，CacheAside加载数据过期时间过于集中，冷数据反复加载，缓存集群宕机等。

### 缓存雪崩解决方案

#### 环境准备

> 保证集群服务高可用

如果使用单机服务，部署1主2从。
集群模式，使用哨兵+多个主从节点，同时配合一致性哈希来平衡多个节点的缓存，这样即使1台redis甚至是1个主从节点宕机，整体的redis集群仍旧有一定的可用性。

> 尽快恢复

开启缓存持久化，重启后从磁盘加载AOF+RDB缓存，尽最大努力保证缓存的可用性。

#### 大型活动缓存预热

对于双11，公众号活动推文等等情况，做好多部门协同，提前进行缓存预热。

#### 兜底策略

使用熔断器，非核心服务对于瞬间的大量请求，先执行熔断策略，配合前端友好的提示，优先保证核心服务的可用性
