---
date: 2020-04-24 12:09:02
categories:
  - Spring
tags:
  - 
publish: true
---
# SpringBoot源码-Fun Fact

## 事件-Event

1. ApplicationStartingEvent：应用启动
2. ApplicationEnvironmentPreparedEvent：Environment初始化完成
3. contextPrepared：ApplicationContext实例创建并prepare完成
4. ApplicationPreparedEvent:读取并注册根Class的BeanDefinition完成
5. AutoConfigurationImportEvents
6. ContextRefreshedEvent:上下文refresh完成
7. ServletWebServerInitializedEvent：SerletWebServer初始化完成
8. ApplicationStartedEvent:整个应用启动完成

## 可用配置

- context.initializer.classes：定义的类会在SpringApplication初始化完成ApplicationContext后，prepare过程中被调用initialize方法

## Aware

- BeanClassLoaderAware
- BeanFactoryAware
- EnvironmentAware
- ResourceLoaderAware
- LoadTimeWeaverAware

## 配置文件处理

### 1. 影响Spring对配置文件加载的配置

1. spring.profiles.active和spring.profiles.include:影响可以被加载的profile,间接影响文件名后缀部分
2. spring.config.location和spring.config.additional-location，影响查找配置文件的路径
3. 默认的配置文件加载路径，**注意，顺序是相反的**：classpath:/,classpath:/config/,file:./,file:./config/
4. PropertySourceLoader类，影响加载配置文件的后缀，默认提供两个实现，分别是:
    - org.springframework.boot.env.PropertiesPropertySourceLoader:加载.xml和.properties
    - org.springframework.boot.env.YamlPropertySourceLoader:加载yaml

### 2. 读取配置文件的时机

1. org.springframework.boot.context.config.ConfigFileApplicationListener类，在EnvironmentPrepared事件广播后

## Auto Config原理

### spring-boot-autoconfiguration包

此包定义了很多默认的Bean，涵盖了数据库，消息队列，云环境，各种插件等，随便扫一眼可以看到jdbc,amqp,kafka,es,neo4j等，包罗万象，这些Bean和配置通过@Conditional和@ConditionalOnMissingBean等来进行动态加载，尤其是@Conditional(XXXX.class)，在Spring加载配置阶段，通过在classpath上筛选依赖的Class是否存在，可以快速加载默认Bean，也可以剔除依赖不满足的Bean

### AutoConfigurationImportSelector

此类负责加载所有的@EnableAutoConfiguration注解的类，并根据各个类的@Conditional配置来进行筛选
