---
date: 2020-04-02
categories:
  - dubbo
  - 源码
tag:
  - dubbo
  - 源码
---
# Dubbo源码解析-初始化

Dubbo通过利用Spring的生命周期钩子、监听器等机制来初始化及构造自己的配置。

## 1. 自定义SpringBoot生命周期类

### 1.1 ApplicationListener

- OverrideDubboConfigApplicationListener：负责加载Dubbo配置，优先级：
    1. Spring管理的配置
    2. Spring配置中dubbo.properties.file定义的文件内部的配置
    3. 系统环境变量中配置的dubbo.properties.file定义的文件内部的配置
- DubboConfigBeanDefinitionConflictApplicationListener：负责确保上下文中只有一个org.apache.dubbo.config.ApplicationConfig类型的Bean
- WelcomeLogoApplicationListener：展示Logo页面
- AwaitingNonWebApplicationListener：判断当前是否是WEB环境(通过ApplicationContext类型判断),并在非WEB环境下阻塞，保证程序唤醒

### 1.2 ApplicationContextInitializer

DubboApplicationContextInitializer：SpringApplication实例初始化过程中调用，向上下文注入自定义的BeanFactoryPostProcessor：OverrideBeanDefinitionRegistryPostProcessor类

### 1.3 EnvironmentPostProcessor

DubboDefaultPropertiesEnvironmentPostProcessor：读取application.name等信息，并写入自定义的PropertySource到Environment,主要是在Properties里加入或替换默认配置,名称为"defaultProperties"，2.7.5版本是以下4个：
    - dubbo.application.name：默认取spring.application.name配置
    - dubbo.config.multiple：默认true
    - dubbo.application.qos-enable：默认false
    - spring.main.allow-bean-definition-overriding：默认true，即允许BeanOverride=

## 2. 利用AutoConfiguration机制注入Bean、BeanDefinition、BeanFactoryPostProcessor

### 2.1 AutoConfiguration导入配置类直接定义Bean

- DubboRelaxedBinding2AutoConfiguration：
  - PropertyResolver:注册dubbo.scan.开头的property
  - ConfigurationBeanBinder:BinderDubboConfigBinder
- DubboAutoConfiguration
  - ServiceAnnotationBeanPostProcessor：需要定义dubbo.scan.base-packages
  - ReferenceAnnotationBeanPostProcessor
  - SingleDubboConfigConfiguration:单配置情况下：允许通过properties文件来定义bean，比如dubbo.application=com.my.DubboAppConfig
  - MultipleDubboConfigConfiguration:多配置情况下：同上
  - PropertyResolver：指向默认的Environment
- DubboRelaxedBindingAutoConfiguration:SpringBoot1.X用，已废弃

### 2.2 通过@Import自定义的BeanRegistrar来注册框架Bean

@EnableDubbo注解作为Dubbo的根注解，其中Import了以下的Registrar

- DubboConfigConfigurationRegistrar：
    1. 注册Bean:DubboConfigConfiguration.Single或者MultipleBean
    2. 注册Bean:DubboConfigAliasPostProcessor
    3. 注册Bean:NamePropertyDefaultValueDubboConfigBeanCustomizer
- DubboComponentScanRegistrar:
    1. 处理@DubboComponentScan定义的package,如果没有定义，则默认取mainClass的包名
    2. 注册INFRA_Bean:ServiceAnnotationBeanPostProcessor,后续处理@Service注解，构造器参数中的basePackages为上一步处理的结果
    3. 注解INFRA_Bean:ReferenceAnnotationBeanPostProcessor
- DubboConfigBindingRegistrar
    1. 处理@EnableDubboConfigBinding注解定义的自定义的Dubbo配置文件前缀
- DubboLifecycleComponentRegistrar
    1. 注册DubboLifecycleComponentApplicationListener，此类负责加载自定义的DubboComponent生命周期钩子类：```org.apache.dubbo.common.context.Lifecycle```
    2. 注册DubboBootstrapApplicationListener，此类负责在Context开启和关闭时调用**DubboBootstrap**中的生命周期钩子
- ConfigurationBeanBindingRegistrar
    1. 注册DubboConfigBean：根据properties定义的dubbo.xxx来初始化对应的ConfigBean
    2. 注册Bean：ConfigurationBeanBindingPostProcessor

### 2.3 自定义的BeanDefinitionRegistryPostProcessor:介入BeanDefinition过程

- DubboConfigAliasPostProcessor:负责在Dubbo相关的ConfigBean注册后，把ID注册成Bean的别名 
- ServiceAnnotationBeanPostProcessor：
  - 注册DubboBootstrapApplicationListener：@EnableDubbo已经注册了这个Listener
  - 扫描指定的package下面的所有类，获得Dubbo@Service注解后的类，并注册成BeanDefinition：
        1. 通过调用Spring提供的方法，指定注解扫描
        2. 获取Interface，注意这里支持三种模式，1. 注解定义Class，2.注解定义interface全限定名，3.根据继承来定义,**注意，Dubbo只会提取第一个interface**
        3. 处理对应的Bean中@Service注解内部的attribute：
            - provider
            - monitor
            - application
            - module
            - registry:指定注册中心配置类
            - protocol
        4. BeanName为```ServiceBean:接口名:version:group```
        5. BeanDefinition会被BeanPostProcessor处理复制成Dubbo的ServiceBean，复制后的大部分属性跟Spring扫描出来的bd相同，区别是增加了protocol等dubbo特有属性，而且class被设置成了ServiceBean！，这些ServiceBean在初始化过程中，由于附录1中的代码，会在构造完成后把自己注册到configManager中：

附录1 ServiceBean把自己注册到ConfigManager中

```java
  @PostConstruct
  public void addIntoConfigManager() {
      ApplicationModel.getConfigManager().addConfig(this);
  }
```

### 2.4 自定义的BeanFacotryPostProcessor

- ConfigurationBeanBindingPostProcessor:加载两个BeanPostProcessor
  - ConfigurationBeanBinder
  - ConfigurationBeanCustomizer：为bean注入name属性

## 3. 自定义的BeanPostProcessor在Bean创建过程介入

- ConfigurationBeanBindingPostProcessor:
  - BeforeInitialization:把PropertySource内部的配置绑定到对应的配置类的Field中，并且调用ConfigurationBeanCustomizer注入Name
- ReferenceAnnotationBeanPostProcessor:
  - 在Bean实例初始化后，populateBean阶段，调用到postProcessPropertyValues方法：
    1. 查找@Reference注解，获取注解配置信息
    2. 根据注解构造一个ReferenceBean,这个Bean里保存了后续生成代理所需要的必要属性信息，比如version等
    3. 把上面的ReferenceBean注入到@Reference注解对应的Field中
    4. 创建代理：Invoker，根据Protocol对应的实例，默认使用RegistryProtocol，调用其refer方法，见[DubboReference源码解析](./DubboReference.md)

## 4. 自定义的事件监听，在上下文事件中处理并启动Dubbo

- DubboLifecycleComponentApplicationListener：
  - ContextRefreshedEvent：加载所有Dubbo的Lifecycle类到缓存，并调用其start方法，默认实现没有Lifecycle实现类
- DubboBootstrapApplicationListener：
  - ContextRefreshedEvent：加载DubboBootStrap类，调用dubboBootstrap的start方法，**这是Dubbo的核心类和核心方法**

## 5. ApplicationModel

1. Bean初始化阶段，初始化ConfigManger对象内部的各种Config:
    - ApplicationConfig: 保存Application级别的配置
    - RegistryConfig: 注册中心配置
    - Protocol：序列化配置
    - ProviderConfig: 
    - **ServiceBean**：注意，所有的Service，都是以ServiceBean的形式存在Spring的工厂里，ServiceBean内存存储了每个Service的元信息
    - ConfigCenter:配置中心
    - Monitor：监视器
    - Metric:指标
    - Module:
    - SSL
