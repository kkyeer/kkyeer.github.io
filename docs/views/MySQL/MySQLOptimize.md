# MySQL性能优化

## 简单情况，缺少索引

索引只有batch_id，查询实际上是
select * from w\_table where batch\_id = 1 and status = 2

## 索引不能乱加！！！在错误的列上建立索引导致磁盘空间爆炸

在timestamp字段建立索引，导致数据空间16G的情况下，索引空间占用达到60G！

**原因？？？**

## 索引下推

## 慢SQL优化

1. 索引下推变为顺序查询（MRR）

优化前

`select c1,c2 from tableA where relation_id_1 in (1,2,3) and relation_id_2 in (400,500,600)`

此时索引下推，Explain表现

| id | select_type | table  | partitions | type  | possible_keys       | key       | key_len | ref  | rows   | filtered | Extra                              |
|----|-------------|--------|------------|-------|---------------------|-----------|---------|------|--------|----------|------------------------------------|
| 1  | SIMPLE      | tableA | NULL       | range | idx_C2_C3,idx_C2_C1 | idx_C2_C3 | 8       | NULL | 540780 | 5        | Using index condition; Using where |

优化业务逻辑，```relation_id_1 in (1,2,3)```优化为多个```relation_id_1 = 1```（边缘定时任务，业务可接受），整个SQL优化为

`select c1,c2 from tableA where relation_id_1 = 1 and relation_id_2 in (400,500,600)`

| id  | select_type | table  | partitions | type  | possible_keys       | key       | key_len | ref  | rows   | filtered | Extra                                         |
|-----|-------------|--------|------------|-------|---------------------|-----------|---------|------|--------|----------|-----------------------------------------------|
| 改造前 | SIMPLE      | tableA | NULL       | range | idx_C2_C3,idx_C2_C1 | idx_C2_C3 | 8       | NULL | 540780 | 5        | Using index condition; Using where            |
| 改造后 | SIMPLE      | tableA | NULL       | range | idx_C2_C3,idx_C2_C1 | idx_C2_C1 | 17      | NULL | 172    | 10       | Using index condition; Using where; Using MRR |

注意，改造前后都使用了索引下推技术（Using index condition），但是改造后多了Using MRR
