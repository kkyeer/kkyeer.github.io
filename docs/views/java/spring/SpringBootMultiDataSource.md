---
date: 2023-05-26 11:34:38
categories:
  - Spring
tags:
  - Java
  - Spring
  - SpringBoot
  - 配置
publish: true
---

# SpringBoot中CK+MySQL多数据源结合MyBatisPlus配置浅探

常见的基于Spring框架的web程序中，使用Mybatis作为ORM框架是一个很常见的方案，尤其是一些简单的CRUD场景下，使用```spring-data-starter-jdbc```配合```mybatis(plus)```来进行快速搭建，足以完成业务需求，同时兼顾一定的灵活性（比如连接池参数动态调整）。

得益于SpringBoot以及各种starter包的良好封装，以往工作中，项目的配置极其简单，甚至在单数据源且仅限于MySQL存储的情况下，在项目入口类添加寥寥2-3行注解，然后照教程进行一些数据源url的配置即可3分钟完成启动与接入，进入业务Coding环节。

但近日在工作中由于某项业务的需求，评估后需要使用ClickHouse作为OLAP分析底层数据源，结合MySQL进行一些元数据存储。对于这种场景下ORM框架层的初始化，网上搜索得到的资料良莠不齐，有的不考虑连接池配置，也有的从```Class.forName()```开始，没有考虑到SpringBoot已有的基建，有重复造轮子的嫌疑。基于此，决定花一点时间探究SpringBoot，MyBatis(iBatis)，以及连接池实现(HikariCP,DBCP,Druid)之间的配置、Bean注入和引用关系，得到下面的关系图。

![SpringBootDataSource](https://cdn.jsdelivr.net/gh/kkyeer/picbed/SpringBootDataSource.svg)

> 说明

1. SpringBoot的部分，主要完成动态配置的承接，以及根据type进行DataSource的初始化，默认初始化```HikariCP```，当结合SpringTX时，会默认初始化一个事务管理器```TransactionalManager```
2. 无论是Hikari还是Druid数据源，都同时具备**连接池**和**新建连接**两种能力，过程中用到的连接池参数和JDBC参数，默认由Spring通过配置机制获取，也可自定义
3. iBatis具备**对象映射**能力，Mybatis-Spring通过```SqlSessionFactory```,```SqlSessionTemplate```完成iBatis和Spring中DataSource的连接

## CK+MySQL多数据源与MybatisPlus的融合配置实现

从参数动态自定义的角度考量，无论是Hikari还是Druid数据源都具备同时动态初始化JDBC驱动和连接池的能力，通过```SqlSessionFactory```,```SqlSessionTemplate```作为桥梁，结合```@MapperScan```注解中的```SqlSessionTemplateRef```参数，可分别指定不同的Java包路径使用不同数据源。
另外一种思路是借用MybatisPlus的多数据源能力，调用时通过```@DS("ck")```类似的注解随便指定数据源，考虑到项目代码管理的简便，没有采用这个方案。

完整代码参见[Github](https://github.com/kkyeer/lab/tree/explore/spring-ck-mysql)

优点：可以使用全部的连接池能力，且不需要在初始化配置时指定任何参数，支持生产环境连接池参数的动态配置（基于配置中心等）
缺点：DataSource绑定Hikari实现，如果生产运行中需要动态切换连接池类型如Hikari切换Druid连接池，需要修改代码

## 代码说明

1. 分别继承父数据源，使用SpringPropery动态注入实现，不同的数据源指定不同的prefix

```Java
@Configuration
@EnableConfigurationProperties
@ConfigurationProperties("spring.datasource.mysql")
public class MySQLDataSource extends HikariDataSource {
}

@Configuration
@EnableConfigurationProperties
@ConfigurationProperties("spring.datasource.ck")
public class ClickHouseDataSource extends HikariDataSource {

}
```

2. Mybatis配置，自定义```SqlSessionTemplate```，不同数据源不同的包路径

```Java
@Configuration
@MapperScan(basePackages = "com.kkyeer.study.spring.dal.ck",sqlSessionTemplateRef = "ckSqlSessionTemplate")
@MapperScan(basePackages = "com.kkyeer.study.spring.dal.mysql",sqlSessionTemplateRef = "mysqlSqlSessionTemplate")
public class MybatisConfig {

    @Bean
    public SqlSessionTemplate ckSqlSessionTemplate(ClickHouseDataSource clickHouseDataSource) throws Exception {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(clickHouseDataSource);
        SqlSessionFactory sqlSessionFactory = sqlSessionFactoryBean.getObject();
        return new SqlSessionTemplate(sqlSessionFactory);
    }


    @Bean
    public SqlSessionTemplate mysqlSqlSessionTemplate(MySQLDataSource clickHouseDataSource) throws Exception {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(clickHouseDataSource);
        SqlSessionFactory sqlSessionFactory = sqlSessionFactoryBean.getObject();
        return new SqlSessionTemplate(sqlSessionFactory);
    }

}
```
