---
date: 2020-12-15
categories:
  -  懂
tags:
  - SQL
publish: true
---

# SQL数组生成临时表

考虑如下场景：安全部门用Excel的方式给出了一个Email名单，需要筛选这个名单中最近**没有**登录过系统的列表，当前报表数据库中有一张表，存储Email登录记录

思路：将Excel的Email导出为临时表，用临时表与登录记录表进行关联查询，数据量不大的情况，考虑直接在SELECT语句中生成临时表:

## 语法

```sql
SELECT * 
    FROM (
        VALUES 
            (值1),
            (值2)，
            。。。
    ) 表名(列名)
```

示例

```sql
SELECT *
  FROM (
      VALUES
      ('a@cc.com'),
      ('b@cc.com'),
      ('c@bb.com')
    )  import_table(email)
```

## 实例

查询给定Email列表中不在登陆记录表的部分

```sql
SELECT distinct(import_table.email)
  FROM (
      VALUES
      ('a@cc.com'),
      ('b@cc.com'),
      ('c@bb.com')
    )  import_table(email) 
    LEFT JOIN login_record ON import_table.email = login_record.email
    WHERE login_record.email is null
```
