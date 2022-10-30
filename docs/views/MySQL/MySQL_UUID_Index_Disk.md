---
date: 2022-10-16 18:43:33
categories:
  - MySQL
tags:
  - MySQL
publish: true
---

# MySQL在UUID建立索引导致的磁盘占用高

对于MySQL数据库，建立BTREE索引时，如果选择在uuid类型的字段上建立索引时，会引起磁盘占用暴增

## 问题复现

1. 创建一个新的MySQL服务器

新建MySQL服务的方法有多种，根据自己的技术储备、机器资源，选择Docker镜像或者原生安装方式均可，本次为了简便，使用docker镜像方式启动，并将数据文件夹挂载到宿主机

- 启动一次镜像（这一步是为了下一步能从镜像中拉取到默认配置文件）:```docker run -d -e MYSQL_RANDOM_ROOT_PASSWORD=12345t --name=mysqltest mysql```

- 将容器的文件拷贝出来，这一步目的是将来启动后可以方便的从宿主机修改配置：```docker cp mysqltest:/etc/mysql config```
- 正式启动，文件如下

  ```yaml
  # Use root/example as user/password credentials
  version: '3.1'

  services:

    db:
      image: mysql
      command: --default-authentication-plugin=mysql_native_password
      restart: always
      environment:
        MYSQL_ROOT_PASSWORD: example
      volumes:
        - ./data:/var/lib/mysql       
      ports:
        - 3306:3306
  ```

2. 新建库和表

  ```sql
  create database test;
  create table index_push_down_test
  (
    id bigint auto_increment primary key,
    uuid varchar(64) not null,
    time datetime default CURRENT_TIMESTAMP null,
    some_data int null
  );
  ```

3. 充填数据

  ```sql
  -- 填充数据
    delimiter $$
    drop procedure if exists fillTest $$
    create procedure fillTest(in num int)
    begin 
      
      set @currNum = 0;
      
    -- 这里设置随机的字符串
      set @chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      while @currNum < num do 
        -- 这里设置sql后面拼接
        set @insertSql = concat("insert into index_push_down_test (uuid,time,some_data) values ( ");
        set @columnNum = 1;
      
        -- uuid
        set @uuid := '';
        set @counter = 0;
        while @counter < 63 do    
            set @uuid = concat(@uuid,substr(@chars,ceil(rand()*(length(@chars)-1)),1));  
          set @counter = @counter + 1;
        end while;
        set @uuid = concat("'" , @uuid , "'");
      
        -- time
      
        set @rndDate = FROM_UNIXTIME(UNIX_TIMESTAMP('2021-10-22 14:53:27') + FLOOR(0 + (RAND() * 83072000)));
        set @rndDate = concat("'" , @rndDate , "'");
        
      
        -- some_data
        
        set @someData := '';
        set @counter = 0;
        while @counter < 63 do    
            set @someData = concat(@someData,substr(@chars,ceil(rand()*(length(@chars)-1)),1));  
          set @counter = @counter + 1;
        end while;
        set @someData = concat("'" , @someData , "'");
        set @insertSql = concat(@insertSql , @uuid , ' , ',@rndDate,' , ',@someData,')');
      -- 执行
        prepare stmt from @insertSql;
        execute stmt;
        deallocate prepare stmt;
        
        set @currNum = @currNum + 1;
      
      end while;
      
    end $$
    delimiter ;
  -- 调用存储过程
  call fillTest(220000);
  ```

```sql
-- 创建索引
create index idx_test_uuid_time on index_push_down_test(uuid,time);
create index idx_test_uuid on index_push_down_test(uuid);
create index idx_test_time on index_push_down_test(time);

-- 重新优化索引等
ANALYZE TABLE index_push_down_test ;

-- 查看表索引空间和数据空间
show table status like 'index_push_down_test';

-- 索引下推示例，以后用
SELECT * from index_push_down_test ipdt where id = 37823;
explain SELECT  some_data from index_push_down_test ipdt where uuid like 'NqHgekYTCn4bKcI47rOOCDnWDlO4RacuRSQCwKeTNljyQAodSNoxzchPk%' and time <='2023-03-30 03:21:13';

```

## 磁盘占用数据统计

| 场景 |         索引          | 数据表空间 | 索引表空间 | 备注                 | 对比                 |
| ---- | :-------------------: | ---------- | ---------- | -------------------- | -------------------- |
| 1    | uuid_time，time，uuid | 38354944   | 63848448   | 先建立索引后插入数据 | 索引空间 >> 数据空间 |
| 2    |    uuid_time，uuid    | 39403520   | 57016320   | 先建立索引后插入数据 | 索引空间 >> 数据空间 |
| 3    |         uuid          | 39403520   | 30048256   | 先建立索引后插入数据 | 索引空间 ≈ 数据空间  |
| 4    |         uuid          | 39403520   | 20561920   | 先有数据后建立索引   | 索引空间 ≈ 数据空间  |
| 5    |         time          | 39403520   | 5783552    | 先有数据后建立索引   |                      |
| 6    |       uuid_time       | 39403520   | 21626880   | 先有数据后建立索引   | 索引空间 ≈ 数据空间  |
| 7    |    uuid_time，uuid    | 39403520   | 42188800   | 先有数据后建立索引   | 索引空间 > 数据空间  |

### 结论与避坑

1. UUID类型的字段上建立索引，需要考虑索引空间大于数据空间后，磁盘占用情况

## 参考资料

- [MySQL填充测试数据](https://www.cnblogs.com/nineyang/p/7323965.html)
- [掘金-五分钟搞懂MySQL索引下推](https://juejin.cn/post/7005794550862053412)
