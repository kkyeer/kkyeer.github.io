---
date: 2021-04-15
categories:
  - 问题解决
tags:
  - 
publish: true
---

# MybatisPlus雪花算法生成器问题

MybatisPlus版本3.3.2，使用```@TableId```注解配合Insert语句使用时，如果指定Type为```ASSIGN_ID```，使用内置的ID生成策略，线上使用此策略发现，在Pod数量较多(>32)，且流量激增时，会产生唯一ID冲突。

## 内置雪花算法的Bit位分配

MybatisPlus内置的雪花算法，基本思路与Twitter一致，将64bit的Long型数据如下分配

0. 42bit: 时间戳
1. 5bit: DataCenterId(0-32)
2. 5bit: WorkerId(0-32)
3. 12bit: 毫秒内自增数量

其中DataCenterId和WorkerId决定了服务的Pod间不会产生冲突

## 错误数据

mac后两位:
mac:-126,-111
mac:-79,-95

pid:
2645473
2147074
