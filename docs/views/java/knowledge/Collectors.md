---
date: 2019-11-22
categories:
  - Java进阶
tags:
  - 
publish: true
---

# Stream类中的collect方法和Collector/Collectors类

# 一、Stream类中的collect方法

## 概述

collect方法为java.util.Stream类的内部方法，有两种重载形式（Java 1.8），主要用于将Stream中的元素通过一定的计算过程转化为另外的表现形式

## 重载形式说明

### 1.接受supplier,accumulator,combiner

#### 方法定义

```Java
<R> R collect(Supplier<R> supplier, BiConsumer<R, ? super T> accumulator, BiConsumer<R, R> combiner);
```

入参：
supplier：出参的supplier，由于会被不确定次地调用，因此要求每次调用supplier返回的值均为新的
accumulator:BiConsumer类型，接收一个R类型的入参和T类型的入参，负责主要的入参转化为结果的工作
combiner:BiConsumer类型，接收一个R类型的入参和T类型的入参，负责将多个R类型合并为一个R类型

出参：
R类型的实例

#### 方法运行过程

```Java
    private static <R,T> R simuCollect(Stream<T> stream, Supplier<R> supplier, BiConsumer<R,T> accumulator,BiConsumer<R,R> combiner){
//        获得一个R类型的Result，此方法执行不确定次
        R midResult1 = supplier.get();
        R midResult2 = supplier.get();
//        遍历stream,填充到result中，此方法遍历到哪些stream内部元素，取决于实现方法
        stream.forEach((element)->accumulator.accept(midResult1, element));
        stream.forEach((element)->accumulator.accept(midResult2, element));
//        将多个R类型的result合并以生成最终结果
        combiner.accept(midResult1,midResult2);
        return midResult1;
    }
```

#### 代码示例

单词计数器

```Java
     public static void main(String[] args) {
        Stream<String> words = Stream.of(""GNU"",""not"",""Unix"",""GNU"");
        HashMap<String,Integer> count = words.collect(
                HashMap::new,
                (map,word)->map.merge(word,1,(ori,newVal)->ori+newVal),
                Map::putAll
        );
        System.out.println(count);//输出： {Unix=1, not=1, GNU=2}
    }
```

### 2.接受一个Collector型入参

#### 方法定义

```Java
<R, A> R collect(Collector<? super T, A, R> collector);
```

入参为一个Collector实例对象

#### 方法运行过程

```Java
@Override
    @SuppressWarnings(""unchecked"")
    public final <R, A> R collect(Collector<? super P_OUT, A, R> collector) {
        A container;
        if (isParallel()
                && (collector.characteristics().contains(Collector.Characteristics.CONCURRENT))
                && (!isOrdered() || collector.characteristics().contains(Collector.Characteristics.UNORDERED))) {
            container = collector.supplier().get();
            BiConsumer<A, ? super P_OUT> accumulator = collector.accumulator();
            forEach(u -> accumulator.accept(container, u));
        }
        else {
            container = evaluate(ReduceOps.makeRef(collector));
        }
        return collector.characteristics().contains(Collector.Characteristics.IDENTITY_FINISH)
               ? (R) container
               : collector.finisher().apply(container);
    }
```

evaluate(ReduceOps.makeRef(collector))基本运行过程与重载格式1一致，区别在于Collector类允许额外定义一个finisher函数，以在Result完全计算完成以后，还可以将Result转化成另外的格式

#### 代码示例

单词计数器2见下述Collectors类与Collector类

# 二、Collectors接口与Collector类

## 1.Collector接口介绍

Collector接口主要保存以下信息

- supplier：出参的supplier，由于会被不确定次地调用，因此要求每次调用supplier返回的值均为新的
- accumulator:BiConsumer类型，接收一个R类型的入参和T类型的入参，负责主要的入参转化为结果的工作
- combiner:BiConsumer类型，接收一个R类型的入参和T类型的入参，负责将多个R类型合并为一个R类型
- finisher:Function类型，接收一个R类型的入参，负责将入参转化为A类型
- characteristics:内部枚举类型，存储本对象是否并发、是否无序、finisher是否出入参类型一致等信息

## 2.Collectors类介绍

Collectors类作为Collector接口对应的工具类，除提供了对应的实现类（CollectorImpl)以外,还提供了各种快速生成Collector实例的工具方法

# 三、Collectors类中的工具方法

## 1. toList/toSet/(toCollection)

- 无入参
- 返回Collector,其中supplier为new方法，accumulator为返回类的add方法，combiner为返回类的addAll方法，collector执行后的结果为ArrayList/HashSet，
- toCollection的入参为Collection的supplier，出参中supplier为入参
- 示例

```Java
 words = Stream.of(""GNU"",""not"",""Unix"",""GNU"");
        System.out.println(words.collect(Collectors.toSet()));//[Unix, not, GNU]
```

## 2. summingLong、summingInt、summingDouble

- 入参为一个将流内元素映射到long/int/double的Function
- 返回Collector,accumulator为入参，combiner为值加和，collect的结果为入参映射后的值的和

```Java
//        统计字母数
 Stream<String> words = Stream.of(""GNU"",""not"",""Unix"",""GNU"");
        int count = words.collect(Collectors.summingInt(String::length));
        System.out.println(count);//13
```

## 3. averagingInt/averagingDouble/averagingLong

- 入参为一个将流内元素映射到long/int/double的Function
- 返回Collector,accumulator为入参，combiner为值加和，collect的结果为入参映射后的值的平均值

## 4. summarizingInt/summarizingLong/summarizingDouble

- 入参为一个将流内元素映射到long/int/double的Function
- 返回Collector,accumulator为入参，combiner为值加和，collect的结果为IntSummaryStatistics...实例，此类实例内部包含count、sum、max、min信息

```Java
//        统计字母数出现次数数据
        Stream<String> words = Stream.of(""GNU"",""not"",""Unix"",""GNU"");
        IntSummaryStatistics summaryStatistics = words.collect(Collectors.summarizingInt(String::length));
        System.out.println(summaryStatistics);//IntSummaryStatistics{count=4, sum=13, min=3, average=3.250000, max=4}
```

## 5. toMap/toConcurrentMap及各种重载形式

此两类方法之间为是否并发的区别,最终结果分别为HashMap和ConcurrentHashMap,同时各自有三种重载形式，
全入参非并发的方法定义如下

```Java
public static <T, K, U, M extends Map<K, U>>
    Collector<T, ?, M> toMap(Function<? super T, ? extends K> keyMapper,
                                Function<? super T, ? extends U> valueMapper,
                                BinaryOperator<U> mergeFunction,
                                Supplier<M> mapSupplier) {
        BiConsumer<M, T> accumulator
                = (map, element) -> map.merge(keyMapper.apply(element),
                                              valueMapper.apply(element), mergeFunction);
        return new CollectorImpl<>(mapSupplier, accumulator, mapMerger(mergeFunction), CH_ID);
    }
```

### ①入参说明

keyMapper:将stream内部元素映射为key的表达式
valueMapper:将stream内部元素映射为value的表达式
mergeFunction:当同一个key对应的value冲突时，重新映射的表达式
mapSupplier:map的supplier

### ②出参说明

见方法实现，其中mapMerger中解决冲突时同样调用mergeFunction解决

### ③重构形式

- 不传入mapSupplier，mapSupplier默认为HashMap::new
- 不传入mapSupplier和mergeFunction,mapSupplier默认为HashMap::new,在发生value冲突时会报错
- 示例

```Java
 Stream<String> words = Stream.of(""GNU"",""not"",""Unix"",""GNU"");
//        统计各单词出现次数
        Map<String, Integer> count = words.collect(Collectors.toMap(
                Function.identity(),
                (word)->1,
                (x,y)->x+y)
        );
        System.out.println(count);//输出{Unix=1, not=1, GNU=2}
```

## 6.joining及其重载形式

CharSequence类连接方法，**非并发**
全入参非并发的方法定义如下

```Java
public static Collector<CharSequence, ?, String> joining(CharSequence delimiter,CharSequence prefix,CharSequence suffix);
```

### ①入参说明

delimiter:分隔符，默认空
prefix:前缀，默认空
suffix:后缀，默认空

```Java
 Stream<String> words = Stream.of(""GNU"",""not"",""Unix"",""GNU"");
        System.out.println(words.collect(Collectors.joining(""---"",""Result is:"",""。"")));
//  Result is:GNU---not---Unix---GNU。
```

## 7. reducing及其重载形式，maxBy,minBy

reducing方法在被collect方法调用时，通过给定的初值、映射和值累加器，返回与初值相同类型的新值
全入参非并发的方法定义如下

```Java
public static <T, U>
    Collector<T, ?, U> reducing(U identity,
                                Function<? super T, ? extends U> mapper,
                                BinaryOperator<U> op) {
        return new CollectorImpl<>(
                boxSupplier(identity),
                (a, t) -> { a[0] = op.apply(a[0], mapper.apply(t)); },
                (a, b) -> { a[0] = op.apply(a[0], b[0]); return a; },
                a -> a[0], CH_NOID);
    }
```

### ①入参说明

U:结果类型
identity：初值，当stream空时直接返回本值
mapper:将stream内部类型映射为U类型的方法
op：两个U类型值合并的方法

### ②出参说明

见方法实现，结果为U类型

### ③重构形式

- 不传入mapper，则stream值不映射，且出参与stream内类型一致
- 不传入mapper和identity,则当steam内类型为T时，collect结果为Optional<T>

### ④minBy和maxBy

特殊的reducing方法，接受comparator表达式作为op

### ⑤示例

```Java
 // 最简用法：返回最长的单词
        Stream<String> words = Stream.of(""GNU"",""not"",""Unix"",""Longest"",""GNU"");
        System.out.println(words.collect(Collectors.reducing(BinaryOperator.maxBy(Comparator.comparingInt(String::length)))));
//        上述方法等同于
//        System.out.println(words.reduce(BinaryOperator.maxBy(Comparator.comparingInt(String::length))));
//        输出：Optional[Longest]

        // 复杂用法：根据输入的最大值，返回各随机数的和
        Random random = new Random();
        Stream<Integer> lengths = Stream.of(3,5,1,6);
        System.out.println(lengths.collect(Collectors.reducing(0,(length)-> random.nextInt(length),(x, y)->x+y)));
```

## 8. groupingBy/groupingByConcurrent及其重载形式

全入参非并发的方法定义如下

```Java
public static <T, K, D, A, M extends Map<K, D>>
    Collector<T, ?, M> groupingBy(Function<? super T, ? extends K> classifier,
                                  Supplier<M> mapFactory,
                                  Collector<? super T, A, D> downstream) ；
```

groupingBy方法返回一个Collector，此Collector在调用时返回Map<K,D>型，其中Map的初始状态由mapFactory指定，调用如下处理

1. 生成键值对：根据classifier将T类型映射为K类型作为Key，Value默认为根据downstream中的supplier中获取的值，后续中根据downstream中的accumulator(原始值，stream中的元素t)累积处理，形成Map
2. 第二步：Map的合并根据downstream中的combiner完成
3. 第三步：downstream如果有finisher，则执行

### ①入参说明

M extends Map<K, D>:结果类型
classifier：将T类型映射为K类型作为Key的方法
mapFactory: 作为最终返回的Collector的supplier,map初始化的方法
downstream：定义结果map中值如何一步一步accumulate

### ②出参说明

见方法实现，结果为U类型

### ③重构形式

- 不传入mapFactory，则默认为HashMap::new/ConcurrentHashMap::new
- 不传入mapFactory和downstream,则downstream默认supplier为ArrayList::new，accumulator为List::add，combiner为addAll方法

### ④示例

```Java
//        返回各单词出线的频次,频次统计中忽略大小写，所以单词一律全大写再统计
        Stream<String> words = Stream.of(""GNU"",""not"",""Unix"",""Matter"",""Gnu"",""NOT"");
        Map<String,Long> stat = words.collect(Collectors.groupingBy(String::toUpperCase,Collectors.counting()));
//        上述等同于
//        Map<String,Long> stat = words.collect(Collectors.groupingBy(
//                String::toUpperCase,
//                Collectors.reducing(0L,(word)->1L,(x, y)->x+y)
//                ));
        System.out.println(stat);
//  输出: {MATTER=1, NOT=2, UNIX=1, GNU=2}
```

## 9. 其他工具方法简述

- counting():返回流内元素数量
- mapping(Function<? super T, ? extends U> mapper,Collector<? super U, A, R> downstream)：类似groupingBy
- partitioningBy(Predicate<? super T> predicate,Collector<? super T, A, D> downstream)：根据predicate表达式，以根据流内容进行分片
