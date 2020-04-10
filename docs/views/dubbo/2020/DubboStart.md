---
date: 2020-04-02
categories:
  - dubbo
  - 源码
tags:
  - dubbo
  - 源码
---
# Dubbo源码解析-DubboBootstrap.start

在Spring上下文refresh完成后，会广播```ContextRefreshed```事件，此时```DubboBootstrapApplicationListener```的监听被触发，调用dubboBootstrap实例的```start```方法，DubboBootStrap作为单例类，在初始化单例时，通过Dubbo特殊的SPI机制初始化了一些Extension实例

## 1.1 加载的插件

1. EventDispatcher:Dubbo相关事件分发，通过监听模式实现，有parallel和direct两种实现，在初始化Dispatcher实例时，会初始化EventListener
2. ExtensionFactory:插件实例工厂类，
    - SpringExtensionFactory：从Spring上下文(BeanFactory)中加载Extension实例
    - SpiExtensionFactory：使用DubboSPI机制加载Extension实例
    - AdaptiveExtensionFactory：通过内置的AdaptiveCompiler编译为对应的Adaptive实例，来适配所有已加载的Extension的实现，遍历上述两个Factory来加载实例，其本身也是通过SPI机制来初始化的
3. EventListener:Dubbo事件监听器，会被放入EventDispatcher实例
    - ServiceNameMappingListener:ServiceConfigExportedEvent时，导出ServiceMap
    - 各种LoggingEventListener：打印Service事件日志
    - CustomizableServiceInstanceListener：ServiceInstancePreRegisteredEvent事件后，调用各种ServiceInstanceCustomizer
4. ExecutorRepository：
5. FrameExt:框架相关的插件，
    - ConfigManager:配置管理
    - Environment：Dubbo环境管理，整合Spring配置等，初始化时会调用ConfigManager插件来获取配置中心信息
    - ServiceRepository：注册Service，包括Provider和Consumer
6. ShutdownHookCallback：shutdown的钩子
7. Protocol：各种rpc协议，默认为dubbo,可以查看```org.apache.dubbo.rpc.protocol```包，实际也是通过Dubbo的Compile机制编译成的Adaptive插件，**注意，实际上检查各种Protocol的依赖包是在这个编译过程中进行的**
8. ProxyFactory：代理类的工厂类，默认是javassist
9. BuiltinServiceDetector：加载内置Service：GenericService和EchoService
10. DynamicConfigurationFactory:动态获取配置的工厂类，对于每一种protocol，都有对应的实现
11. ZookeeperTransporter：实际执行与zk的连接过程
12. WritableMetadataService:MetadataService，负责管理某个Service的元数据，provider侧用inMemory保存本地提供的Service，consumer侧用remote保存订阅的Provider信息
13. MetadataServiceExporter:负责管理ServiceConfig和MetadataService List

### 1.2 加载配置管理器：ConfigManager

- 配置中心：自实现ConfigCenterConfig可以

### 1.3 注册ShutdownHook 

## 2. Initialize

1. 加载FrameworkExt插件：加载@SPI注解的FrameworkExt接口的实现类，调用其Initialize方法，主要是Environment插件的getConfig方法来获取配置中心-dubbo.configCenter.xxx的配置
2. 启动配置中心
3. 如果没有配置中心，使用Registry即注册中心当作配置中心
    - prepareEnvironment: 这个过程会尝试读取配置中心的配置，由于把注册中心复用为配置中心，此时会加载注册中心相关的Ext，并尝试连接注册中心获取动态配置
4. 开启MetadataReport：
    1. 调用InfraAdapter
        - EnvironmentAdapter:获取OS Environment: DUBBO_LABELS=tag=pre;key=value 、JVM Options: -Denv_keys = DUBBO_KEY1, DUBBO_KEY2,放入配置
5. 从远程配置中加载注册中心
6. 校验配置：校验长度、正则表达式等
7. 初始化MetadataService
8. 初始化MetadataServiceExporter
9. 注册事件监听：DubboBootstrap实例也监听了某些事件

## 3. export Dubbo Services

遍历ConfigManager里面的每个"service"配置

1. 生成对应的ServiceMetadata
2. ServiceRepository注册Provider，每个Provider包裹在ProviderModel里，内部包含元信息和MethodModel列表
3. 生成Exporter和注册Exporter
    1. 生成需要往注册中心注册的URL，URL里包含以下信息
        - Protocol，通过组合默认配置和自定义配置，决定传输协议，本机IP，端口等信息
        - 通过从ProviderConfig里提取，决定接口，方法列表等信息
    2. 调用ProxyFactory插件来生成Invoker，把Invoker和url包裹成Exporter，对于Provider侧，代理默认使用Javassist来生成Injvm代理，
    3. Exporter根据URL打开本地的ExchangServer，默认使用Netty4，并进行序列化优化
4. publishServiceDefinition：生成ServiceDefinition
5. 服务发布，发布ServiceConfigExportedEvent，触发对应的Listener
    - ServiceNameMapping

## 4. referServices

