---
date: 2021-04-12
categories:
  - 开发问题
tags:
  - 
publish: true
---

# MybatisPlus与Lombok Builder注解冲突

## 背景

某次代码运行，发现在PO类加上```@Builder```注解，且某个Field加上```@TableField(exist = false)```注解后，查询报错：

```log
Caused by: java.lang.IndexOutOfBoundsException: Index: 3, Size: 3
  at java.util.ArrayList.rangeCheck(ArrayList.java:659)
  at java.util.ArrayList.get(ArrayList.java:435)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.createUsingConstructor(DefaultResultSetHandler.java:708)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.createByConstructorSignature(DefaultResultSetHandler.java:693)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.createResultObject(DefaultResultSetHandler.java:657)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.createResultObject(DefaultResultSetHandler.java:630)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.getRowValue(DefaultResultSetHandler.java:397)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.handleRowValuesForSimpleResultMap(DefaultResultSetHandler.java:354)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.handleRowValues(DefaultResultSetHandler.java:328)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.handleResultSet(DefaultResultSetHandler.java:301)
  at org.apache.ibatis.executor.resultset.DefaultResultSetHandler.handleResultSets(DefaultResultSetHandler.java:194)
  at org.apache.ibatis.executor.statement.PreparedStatementHandler.query(PreparedStatementHandler.java:65)
  at org.apache.ibatis.executor.statement.RoutingStatementHandler.query(RoutingStatementHandler.java:79)
  at com.baomidou.mybatisplus.core.executor.MybatisSimpleExecutor.doQuery(MybatisSimpleExecutor.java:69)
  at org.apache.ibatis.executor.BaseExecutor.queryFromDatabase(BaseExecutor.java:325)
  at org.apache.ibatis.executor.BaseExecutor.query(BaseExecutor.java:156)
  at com.baomidou.mybatisplus.core.executor.MybatisCachingExecutor.query(MybatisCachingExecutor.java:165)
  at com.baomidou.mybatisplus.core.executor.MybatisCachingExecutor.query(MybatisCachingExecutor.java:92)
  at org.apache.ibatis.session.defaults.DefaultSqlSession.selectList(DefaultSqlSession.java:147)
```

## 原因

经过代码debug发现，问题出在MybatisPlus的下列方法中

```java
  private Object createUsingConstructor(ResultSetWrapper rsw, Class<?> resultType, List<Class<?>> constructorArgTypes, List<Object> constructorArgs, Constructor<?> constructor) throws SQLException {
    boolean foundValues = false;
    for (int i = 0; i < constructor.getParameterTypes().length; i++) {
      Class<?> parameterType = constructor.getParameterTypes()[i];
      String columnName = rsw.getColumnNames().get(i);
      TypeHandler<?> typeHandler = rsw.getTypeHandler(parameterType, columnName);
      Object value = typeHandler.getResult(rsw.getResultSet(), columnName);
      constructorArgTypes.add(parameterType);
      constructorArgs.add(value);
      foundValues = value != null || foundValues;
    }
    return foundValues ? objectFactory.create(resultType, constructorArgTypes, constructorArgs) : null;
  }
```

@Builder注解默认生成全参数构造器

MBP使用全全参数构造器时会枚举自己根据Field处理过后的ResultSetWrapper，但是这个ResultSetWrapper对于@TableField(exist=false)的处理是不会在ResultSetWrapper中，导致ResultSetWrapper的项数与构造器的参数项数不一致

## 解决

在对应的PO上增加```@NoArgsConstructor```注解来显示生成无参构造器，但是由于此注解与```@Builder```冲突，所以还要显示的增加全参构造器```@AllArgsConstructor```
