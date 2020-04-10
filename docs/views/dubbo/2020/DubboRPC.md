---
date: 2020-04-02
categories:
  - dubbo
  - 源码
tag:
  - dubbo
  - 源码
---
# Dubbo源码-RPC调用

## 1. Provider

Dubbo调用中，Provider方提供监听程序，在监听到某个Service的调用后，通过内部的代理来调用对应实例的相应方法，将结果或异常序列化后通过socket连接返回给调用方

### 1.1 Init & export

1. Spring扫描```BeanDefinition```的过程中，Dubbo通过```ServiceAnnotationBeanPostProcessor```介入，来将带有Dubbo自定义注解```@Service```的类注册成```BeanDefinition```
2. 在Bean实例初始化过程中，上述```BeanDefinition```被初始化成```ServiceBean```实例，内部存储Service的所有配置信息，包括URL
3. Spring发布ContextRefreshed事件后，DubboBootstrap的start方法被触发，在初始化相关环境后，开始exportService
4. export:遍历所有的ServiceBean，调用其export方法(实际上是父类ServiceConfig类的实现):
    1. 初始化serviceMetadata对象
    2. 注册Service到ServiceRepository
    3. 解析HostIp,顺序：环境变量(DUBBO_IP_TO_BIND) -> Java System Properties(DUBBO_IP_TO_BIND) -> 配置文件配置(单独配置或全局配置) -> /etc/hosts -> InetAddress类获取到的第一个可用IP
    4. 解析HostPort,顺序:环境变量(DUBBO_PORT_TO_BIND) -> Java system properties -> 配置文件配置 -> 传输协议默认端口 -> 随机端口
    5. 创建Invoker：ProxyFactory的getInvoker将代理包装成Invoker对象
    6. 调用Wrapper方法，启动qos，进行filter
    7. Invoker包装成InvokerDelegate
    8. 构建InvokerChain，Invoker包装成匿名内部类
    9. 调用到DubboProtocol的invoke方法
    10. 启动监听服务器:层层包装：NettyServer->HeaderExchangeServer->ExchangeServer->DubboProtocolServer
    11. 优化序列化过程
    12. 向注册中心注册provider url
    13. 发布ServiceDefinition

### 1.2 Provider Invoker调用

Provider被调用的入口```DecodeHandler.received```方法，此方法顺序调用```ChannelHandler.received```-> ```HeaderExchangeHandler.handleRequest``` -> ```DubboProtocol匿名内部类的reply```方法，开始调用链：

1. Invoker的包装链

Invoker -> ProxyFactory匿名Wrapper -> AbstractProxyInvoker -> DelegateProviderMetaDataInvoker -> InvokerWrapper -> ProtocolFilterWrapper

调用与包装链相反，即先调用ProtocolFilterWrapper，顺序调用到实际实现类
2. ProtocolFilterWrapper内部存储了大量Filter实现，调用时会根据注解的Order来顺序调用
    - EchoFilter：处理echo协议
    - ClassLoaderFilter：更换ClassLoader为Proxy Target的ClassLoader
    - GenericFilter：处理泛型调用,即```$invoke("xxxMethod",[paramtypes],[params])```类型的调用
    - ContextFilter：处理上下文
    - TraceFilter：跟踪处理时间等
    - TimeoutFilter：处理超时
    - MonitorFilter：处理监控数据上报
    - ExceptionFilter：异常处理

## 2. Consumer

参与Consumer的rpc调用的主要插件有：

- ServiceRepository：存储所有的Service,Consumer和Provider
- ConsumerModel：
- RouterFactory：创建Router对象
- Router：负责处理路由策略
- RouterChain: 顾名思义，路由链
- RegistryDirectory：处理注册中心的url转换与存储，注册与订阅逻辑
- MetadataService：存储ServiceDefinition
- Invoker：实际执行调用

### 2.1 Init & refer

Spring初始化单例Bean过程中，对@Reference注解的Field，初始化并注入一个ReferenceBean。然后创建代理类，连接Transporter和实际执行逻辑的Bean，代理创建流程如下

1. 初始化、升级Config
    1. 初始化、从注册中心拉取、校验ConsumerConfig
    2. 读取可能的dubbo resolve 文件：dubbo-resolve.properties
2. 初始化serivceMetadata
3. 校验Stub实现
4. 获取ServiceRepository并注册Consumer
5. ServiceRepository创建Proxy：
    1. 判断是否走本地Jvm代理：主要是判断Service的scope属性是否是"local"
    2. 获取并校验注册中心列表
    3. 调用RegistryProtocol.refer方法获取Invoker
        1. 生成RegistryDirectory
        2. 参数处理，URL处理，构建成Consumer URL，即:consumer://192.168.1.1/some.interface?的形式
        3. 注册Consumer：将上面构建的ConsumerUrl转换成文件路径，调用RegistryDirectory的register方法尝试注册到注册中心，consumer注册完成
        4. 构建RouterChain：调用所有的RouterFactory来获取Router列表并排序
        5. 订阅Provider：调用RegistryDirectory的subscribe方法，获取下列路径的文件
            - /dubbo/name.of.service/providers
            - /dubbo/name.of.service/configurators
            - /dubbo/name.of.service/routers
        6. 根据获取到的Provider的URL列表，构建InvokerChain，Invoker的构造过程见[Invoker构造](### 2.3),构建InvokerChain即获取所有的Filter并链式调用Invoker
        7. 上面构建成InvokerChain后的Invoker包装成InvokerDelegate
        8. cluster.join后，上面的Invoker再包装成MockClusterInvoker
    4. 检测Invoker是否连接，如果Service的所有Invoker都无法连接，报错退出
    5. PublishServiceDefinition:把对应接口的ServiceDefinition放到MetadataService里
    6. 使用ProxyFactory把Invoker对象代理成对应接口，底层实现为JavaassistProxyFactory，Dubbo在JDK自带Proxy的基础上进行了代码的二次编译
6. 发布事件:ReferenceConfigInitializedEvent

### 2.2 ReferenceBean的主要属性

1. ServiceMetadata:Service的元信息：接口名，Group，version等信息
2. ConsumerConfig:保存Consumer配置信息，包括代理相关的策略name，调度相关的线程池参数，RPC相关的客户端类型等
3. ServiceDescriptor：Service描述符，跟ServiceMeta属性重复，这部分有很多冗余代码
4. RegistryConfig:注册中心配置
5. MetadataService：存储与发布Service元数据
6. RegistryDirectory：存储到注册中心的文件夹

### 2.3 Invoker构造过程

1. 根据URL,获取ExchangeClient数组
2. 初始化Exchanger，默认使用HeaderExchanger，ExchangeHandler使用Dubbo内部类
3. 初始化DubboClient，设置代理目标Interface,url,ExchangeClient数组,invoker数组
4. 构造->DubboInvoker组件构成
    1. 列表-DubboClient：
        1. url
        2. interface
        3. ExchangeClient
            1. ExchangeChannel
            2. Handler
        4. Invokers
    2. version
    3. invokers->指向Protocol的Invoker列表
5. 层层包装:DubboInvoker->AsyncToSyncInvoker->ListenerInvokerWrapper

附：Invoker千层饼层层包装：

DubboInvoker -> AsysncToSyncInvoker -> ListenerInvokerWrapper -> ProtocolFilterWrapper -> InvokerDelegate ->  AbstractClusterInvoker -> AbstractCluster.InterceptorInvokerNode ->  MockClusterInvoker

### 2.4 Invoker调用过程

逆向沿Invoker对应的包装过程一路调用下去

1. MockClusterInvoker:创建RpcInvocation对象，判断是否Mock，非Mock继续调用
2. AbstractCluster.InterceptorInvokerNode:
    1. before:创建RpcContext
    2. 调用内部的Invoker
    3. after:清理RpcContext
3. AbstractClusterInvoker:
    1. 顺序调用Router获取Invoker列表
    2. 初始化LoadBalance:未指定的话是Random
    3. 获取默认重试次数
    4. 带重试，选取并调用使用的Invoker
        1. 有sticky Invoker直接返回它
        2. 调用策略选取一个Invoker，但是在下面的情况下会触发reselect
            1. 本次调用在重试，且前面已经调用过这个Invoker，表明这个Invoker很可能有问题
            2. 选取的Invoker不可用
        3. 调用Invoker
4. ProtocolFilterWrapper:
5. AsyncToSyncInvoker:
    1. 上下文属性处理
    2. 调用DubboInvoker的Invoke方法
    3. 阻塞直到拿到result或抛出异常
6. DubboInvoker:调用ExchangeClient的send(不需要获取响应的情况)或者request方法(需要获取响应的情况)，返回CompletableFuture给上层
    1. 底层调用HeaderExchangeChannel的send/request方法
    2. 返回Future对象

总结：Router->LoadBalance->reTry->Invoke
