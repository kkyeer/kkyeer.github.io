---
date: 2021-04-22
categories:
  - 懂
tags:
  - MySQL
  - InnoDB
publish: true
---

# MySQL中InnoDB引擎的死锁检测

MySQL官方提供了InnoDB引擎下，事务死锁的**主动检测**与丢弃机制，官方允许通过```innodb_deadlock_detect```这个参数进行控制，默认开启。同时如果禁用此选项，依旧可以通过锁超时参数```innodb_lock_wait_timeout```来进行控制。对于这两个参数的取舍，[官方的说明](https://dev.mysql.com/doc/refman/5.7/en/innodb-deadlock-detection.html)是

>On high concurrency systems, deadlock detection can cause a slowdown when numerous threads wait for the same lock. At times, it may be more efficient to disable deadlock detection and rely on the innodb_lock_wait_timeout setting for transaction rollback when a deadlock occurs. Deadlock detection can be disabled using the innodb_deadlock_detect configuration option.

对于主动检测到死锁后的丢弃，官方说明是丢弃小事务，此处大小的衡量依据是插入、更新、删除操作受影响的行数

## 死锁检测原理

>If the LATEST DETECTED DEADLOCK section of InnoDB Monitor output includes a message stating TOO DEEP OR LONG SEARCH IN THE LOCK TABLE WAITS-FOR GRAPH, WE WILL ROLL BACK FOLLOWING TRANSACTION, this indicates that the number of transactions on the wait-for list has reached a limit of 200. A wait-for list that exceeds 200 transactions is treated as a deadlock and the transaction attempting to check the wait-for list is rolled back. The same error may also occur if the locking thread must look at more than 1,000,000 locks owned by transactions on the wait-for list.

如果开启了死锁检测，那么在每次上锁之前，都会进行一次死锁检测，底层使用图遍历算法，对于并发量比较高的应用，每次进行死锁检测的消耗累积起来还是比较高。

图遍历中，过于深的检测会指数级递增的影响检测效率，这方面，MySQL限制最大为200，超过200则事务被认定为死锁，发起死锁检测的事务被回滚。

```c
class DeadlockChecker, method check_and_resolve (DeadlockChecker::check_and_resolve)

Every InnoDB (row) Lock (for mode LOCK_S or LOCK_X) and type ORed with LOCK_GAP or
LOCK_REC_NOT_GAP, ORed with LOCK_INSERT_INTENTION

Enqueue a waiting request for a lock which cannot be granted immediately.

lock_rec_enqueue_waiting()
```

## 参考资料

- [博客](https://fromdual.com/innodb-deadlock-detect-rather-hands-off)
- [官方文档中死锁检测的说明](https://dev.mysql.com/doc/refman/5.7/en/innodb-deadlock-detection.html)
