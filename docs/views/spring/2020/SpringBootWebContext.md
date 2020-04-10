# SpringBoot源码-上下文AnnotationConfigServletWebServerApplicationContext

## 1. UML图

![AnnotationConfigServletWebServerApplicationContext.png](https://cdn.jsdelivr.net/gh/kkyeer/picbed/AnnotationConfigServletWebServerApplicationContext.svg)

## 2. 初始化

1. BeanFactory初始化为DefaultListableBeanFactory实例
2. 初始化AnnotatedBeanDefinitionReader实例
3. 初始化lassPathBeanDefinitionScanner实例
4. Environment初始化为StandardServletEnvironment实例

## 3. SpringApplication中prepare上下文过程

1. setEnvironment，注意，此时把初始化给的默认Environment替换掉，包括reader和scanner中
2. postProcess过程：
    1. beanFactory中放入非空的beanNameGenerator实例，注意默认为空
    2. 接收非空的resourceLoader及其classLoader，注意默认为空
    3. 接收非空，注意默认为空
    4. beanFactory实例setConvertionService，取的是共享的单例
3. 调用ApplicationContextInitializer实例的initialize方法，这些实例是在SpringApplication初始化过程中从spring.factory中加载的
    - DubboApplicationContextInitializer:注册一个BeanFactoryPostProcessor实例,OverrideBeanDefinitionRegistryPostProcessor类型
    - DelegatingApplicationContextInitializer:调用"context.initializer.classes"属性定义的所有类的initialize方法
    - SharedMetadataReaderFactoryContextInitializer:注册BeanFactoryPostProcessor：CachingMetadataReaderFactoryPostProcessor
    - ContextIdApplicationContextInitializer:初始ApplicationContextId，优先取spring.application.name定义的值，没有默认"application",并把对应的ContextId对象注册到BeanFactory
    - ConfigurationWarningsApplicationContextInitializer:注册BeanFactoryPostProcessor:ConfigurationWarningsPostProcessor,其不允许@ComponentScan对应的值为"org"或"org.springframework"
    - ServerPortInfoApplicationContextInitializer:注册ApplicationListener:自己，其处理```local.server.port```属性，中间的server可能被ServerNamespace指定的值替代
    - ConditionEvaluationReportLoggingListener：新增一个ApplicationListener:ConditionEvaluationReportListener
4. 发布contextPrepared事件到所有的ApplicationListener:
    - BackgroundPreinitializer:无操作
    - DelegatingApplicationListener：无操作
5. 打印Start Up Log，打印Profile
6. beanFacotry注册Bean```springApplicationArguments：ApplicationArguments```
7. beanFacotry注册Bean```springBootBanner```
8. 根据先前读取的值设置beanFactory的allowBeanDefinitionOverriding属性，Dubbo会默认将其设为true
9. 根据SpringApplication.run()中的参数列表，读取主source，一般来说就是run方法的Class变量
10. 解析上一步配置的resource为BeanDefinition，并放入BeanFactory，详情见[Bean读取](./ReadBeanDefinition.md)
11. 广播ApplicationPreparedEvent事件:
    - ConfigFileApplicationListener:注册BeanFactoryPostProcessor：PropertySourceOrderingPostProcessor
    - LoggingApplicationListener：注册Bean：```springBootLoggingSystem:this.loggerSystem```

## 4. SpringApplication中refresh上下文

1. prepare:处理PropertySource
2. obtainFreshBeanFactory
3. prepareBeanFactory:
    1. 初始化ClassLoader
    2. 注册BeanPostProcessor：ApplicationContextAwareProcessor，并将各种Aware添加到忽略列表
    3. 注册BeanFactory，ResourceLoader，ApplicationEventPublisher，ApplicationContext为可Autowire的Bean，指向BeanFactory本身
    4. 注册BeanPostProcessor：ApplicationListenerDetector
    5. 注册Bean:```environment```,```systemProperties```,```systemEnvironment```，这些在Environment的准备过程中已经OK
4. postProcessBeanFactory：
    1. 注册BeanPostProcessor：WebApplicationContextServletContextAwareProcessor
    2. 忽略ServletContextAware
    3. scanBasePackage，这里扫描的是直接手动初始化上下文时给定的basePackage
5. 调用BeanFactoryPostProcessor,**注意这里的Factory**:
    1. 调用所有的BeanDefinitionRegistryPostProcessor：
        1. SharedMetadataReaderFactoryContextInitializer:注册SharedMetadataReaderFactoryBean，name为```org.springframework.boot.autoconfigure.internalCachingMetadataReaderFactory```，并将这个对象放入```org.springframework.context.annotation.internalConfigurationAnnotationProcessor```这个Bean的Property列表中
        2. ConfigurationWarningsApplicationContextInitializer：检查basePackage是否非法
    2. 调用上面这一步处理后新加入的BeanDefinitionRegistryPostProcessor：
        1. 先调用@PriorityOrdered
            1. ConfigurationClassPostProcessor：读取所有@Configuration注解的BeanDefinition，见[Spring处理@Configuration]
        2. 再调用@Ordered
        3. 最后调用剩余的
    3. 调用一遍上面拿到的BeanFactoryPostProcessor的postProcessBeanFactory方法，这里有个Spring默认的，会把Property列表中默认的defaultProperties放到最后
    4. 遍历扫出来的所有的Bean，找到新加入的BeanFactoryPostProcessor，调用postProcessBeanFactory方法：
        1. PropertySourcesPlaceholderConfigurer:处理@Value和其他的${key:defaultValue}
    5. 加载loadTimeWeaver
6. 注册BeanPostProcessor，顺序同样@PriorityOrdered>@Ordered>其他，调用beanFactory的getBean方法来初始化实例，并放入beanFactory的BeanPostProcessor列表中，其中有一类非常特殊，实现了MergedBeanDefinitionPostProcessor接口，标明这些类会在beanDefinition生成后，实例化BeanPostProcessor之前被调用
7. 初始化MessageSource
8. 初始化applicationEventMulticaster
9. onRefresh方法：
    1. 初始化themeSource
    2. 初始化webServer:调用ServletWebServerFactory，见```org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext#createWebServer```
10. 把原来的pplicationListener注册到上面初始化的applicationEventMulticaster里，并广播暂存的earlyApplicationEvents事件
11. 完成BeanFactory初始化，提前初始化所有非懒加载的Bean：
    1. 初始化conversionService
    2. 初始化LoadTimeWeaverAware
    3. 初始化Spring内置的辅助工具类：注解辅助类等
    4. 调用所有SmartInitializingSingleton类型的Bean的afterSingletonsInstantiated方法
12. 收尾，清理缓存，调用LifecycleProcessor,广播ContextRefreshedEvent:
    1. 清理缓存
    2. 发布ContextRefreshedEvent事件
    3. LiveBeansView注册Mbean
    4. 启动WebServer
    5. 发布ServletWebServerInitializedEvent事件
        - ServerPortInfoApplicationContextInitializer：注册端口信息到Property

Refresh完成
