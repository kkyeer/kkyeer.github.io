---
date: 2020-03-29
categories:
  - Spring
  - 源码
tag:
  - SpringBoot
  - 源码
---
# SpringBoot源码-App启动过程

## 1. 整体流程

1. a = new SpringApplication(primarySources)
2. a.run

### 1.1 初始化SpringApplication实例

1. 判断webApplicationType:通过尝试使用ClassLoader加载对应的标识类来判断WebApp类型，首先判断WEBFLUX,然后根据javax.servlet.Servlet类和WebApplicationContext类判断是否Servlet,都不是则返回None
2. 加载所有Jar包中META-INF/spring.facotry文件定义的工厂类：
3. 初始化ApplicationContextInitializer类型实例
4. 初始化ApplicationListener实例
5. 获取MainApplicationClass：通过从调用栈中获取main方法所在的类来获取

### 1.2 启动初始化完成的SpringApplication

1. 开启计时器
2. 设置java.awt.headless：Headless模式是系统的一种配置模式。在该模式下，系统缺少了显示设备、键盘或鼠标。
3. 初始化并启动配置的SpringApplicationRunListeners类型实例:
    1. SpringBoot包定义一个EventPublishingRunListener实现，此实现在构造过程中会在内部初始化SimpleApplicationEventMulticaster实例：
    2. 广播ApplicationStartingEvent事件到相应的Listener：
        - LoggingApplicationListener：加载log实现，顺序：org.springframework.boot.logging.LoggingSystem定义>logback>log4j>jul
        - BackgroundPreinitializer: 提前开始初始化耗时的Bean如Conversion、Jackson等Bean
        - DelegatingApplicationListener：无操作
        - LiquibaseServiceLocatorApplicationListener：无操作
4. Prepare Environment实例：
    1. 初始化PropertySources：servletConfigInitParams,servletContextInitParams,systemProperties,systemEnvironment
    2. 初始化ConversionService: 使用ApplicationConversionService实例
    3. 读取Profile
    4. Environment Prepare完成，广播ApplicationEnvironmentPreparedEvent事件,调用所有的ApplicationListener，调用对应方法，下面仅挑选重点的几个：
        - ConfigFileApplicationListener: 见#### 1.2.1 Config文件加载
        - LoggingApplicationListener：处理Logger相关
    5. Bind过程---->todo
    6. 自定义Environment转换为标准Environment
    7. 新增一个ConfigurationPropertySources
5. 设置spring.beaninfo.ignore，默认为true，即跳过BeanInfo检测
6. 打印Banner
7. 创建上下文：ApplicationContext：对于SERVLET模式,实际初始化AnnotationConfigServletWebServerApplicationContext对象，见[AnnotationConfigServletWebServerApplicationContext源码解读](./ServletApplicationContext.md)
8. 创建SpringBootExceptionReporter实例
    - org.springframework.boot.diagnostics.FailureAnalyzers
9. prepare上下文，见[AnnotationConfigServletWebServerApplicationContext源码解读](./ServletApplicationContext.md)
10. refresh上下文，见[AnnotationConfigServletWebServerApplicationContext源码解读](./ServletApplicationContext.md)
11. afterRefresh,默认无操作


#### 1.2.1 Config文件加载

时机：EnvironmentPrepared事件发布后
类：ConfigFileApplicationListener

1. 读取EnvironmentPostProcessor列表，并分别调用：
    - SystemEnvironmentPropertySourceEnvironmentPostProcessor：将Environment中的SystemEnvironmentPropertySource替换成OriginAwareSystemEnvironmentPropertySource
    - SpringApplicationJsonEnvironmentPostProcessor：处理spring.application.json数据为Spring数据源，来源包括环境变量（SPRING_APPLICATION_JSON），系统属性或者properties定义
    - CloudFoundryVcapEnvironmentPostProcessor：处理云环境的VCAP数据
    - ConfigFileApplicationListener：见1.2.1.1，配置文件加载到Environment

##### 1.2.1.1 配置文件加载到Environment

- 时机：EnvironmentPrepared事件广播->调用ApplicationListener->调用ConfigFileApplicationListener的onApplicationEvent方法->加载并调用所有的EnvironmentPostProcessor类型的实例的postProcessEnvironment方法->ConfigFileApplicationListener实例本身属于EnvironmentPostProcessor类，调用其postProcessEnvironment方法
- 方法：ConfigFileApplicationListener实例的postProcessEnvironment方法
- 过程：

1. 初始化Loader实例:
    1. 初始化placeholdersResolver：```new PropertySourcesPlaceholdersResolver(this.environment);```
    2. 初始化resourceLoader：```new DefaultResourceLoader();```
    3. 初始化propertySourceLoaders：```SpringFactoriesLoader.loadFactories(PropertySourceLoader.class, getClass().getClassLoader())```：
        - org.springframework.boot.env.PropertiesPropertySourceLoader
        - org.springframework.boot.env.YamlPropertySourceLoader
2. 调用Loader.load()方法
    1. 获取Active Profile：读取PropertySource(到当前阶段，主要还是SystemProperties和SystemEnvironment值)的spring.profiles.active和spring.profiles.include的配置
    2. 根据profile读取配置文件:
        - 位置：
            1. 环境变量中spring.config.location配置的位置
            2. 环境变量中spring.config.additional-location配置的位置
            3. 预设的位置：**注意，由于有reverse操作，所以最后一个为先**：classpath:/,classpath:/config/,file:./,file:./config/，
        - 加载策略：
            1. 如果有spring.config.name定义，则加载定义的文件名，否则加载文件名由application开头的文件
            2. 调用所有的PropertySourceLoader，处理所有其定义的文件后缀对应的文件，对于默认情况，分别有两个默认加载器，其中Properties加载器负责加载
