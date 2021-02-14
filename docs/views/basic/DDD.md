# DDD

## DP

### 概念

DP即Domain Primitive

将隐性条件显性化，如转账时，除了转账双方和数额，还隐含了一个**转账货币**的概念，因此在设计转账接口时，错误示范：

```java
public boolean transfer(String recipientId,BigDecimal amount);
```

以上接口没有体现转账时的货币的概念，如果将金额显性化，则为

```java
@Value
public class Money{
  private BigDecimal amount;
  // 货币
  private Currency currency;

  public Money(BigDecimal amount,Currency currency){
    this.amount = amount;
    this.currency = currency;
  }
}


// 转账接口
public void pay(Money money, Long recipientId) {
    BankService.transfer(money, recipientId);
}

```

### 对比

![20210212203100](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20210212203100.png)

![20210212204446](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20210212204446.png)

### 什么情况下应该用 Domain Primitive

常见的 DP 的使用场景包括：

- 有格式限制的 String：比如Name，PhoneNumber，OrderNumber，ZipCode，Address等

- 有限制的Integer：比如OrderId（>0），Percentage（0-100%），Quantity（>=0）等可枚举的 int ：比如 Status（一般不用Enum因为反序列化问题）
- Double 或 BigDecimal：一般用到的 Double 或 BigDecimal 都是有业务含义的，比如 Temperature、Money、Amount、ExchangeRate、Rating 等
- 复杂的数据结构：比如 Map<String, List<Integer>> 等，尽量能把 Map 的所有操作包装掉，仅暴露必要行为

## DDD拆分操作

检查下列类目中是否有遗漏的模块

- 用户
- 权限
- 订单
- 商品
- 支付
- 账单
- 地址
- 通知
- 报表单
- 日志
- 收藏
- 发票
- 财务
- 邮件
- 短信
- 行为分析

## 参考

- [阿里巴巴淘系技术](https://zhuanlan.zhihu.com/p/340911587)
