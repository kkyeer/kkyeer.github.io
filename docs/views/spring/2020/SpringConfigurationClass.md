# SpringBoot源码-@Configuration配置处理

## 1. 解析Class，读取BeanDefinition

时机：refresh context，调用所有的BeanFactoryPostProcessor，其中SharedMetadataReaderFactoryContextInitializer会添加一个BeanPostProcessor:internalConfigurationAnnotationProcessor,这个会在接下来被调用
对象：FullConfiguration：@Configuration注解的类；LiteConfiguration:@Import注解的类
顺寻：根据Class的@Order进行排序
parse: 调用ConfigurationClassParser对象的parse方法来进行解析：

1. 根据@Conditional判断是否需要跳过
2. 处理@PropertySource
3. 处理@ComponentScan：读取指定的包下的所有子类，挑选@Component注解的类，读取信息成为BeanDefinitionHolder，底层调用ComponentScanAnnotationParser类的parse方法：
    1. ClassPathBeanDefinitionScanner：扫描```classpath*:com/package/name/**/*.class```，**注意，如果basePackage没有配置，则默认取@Configuration对应的类的包名
    2. 判断依据：MBean和@Component注解，包括其子注解
    3. 处理的注解：
        - @Lazy
        - @Primary
        - @Role
        - @Description
        - @DependsOn
4. 处理@Import：
    - @SpringBootApplication
        - @EnableAutoConfiguration
            - @Import(AutoConfigurationImportSelector.class)
            - @AutoConfigurationPackage
                - @Import(AutoConfigurationPackages.Registrar.class) 
    - 上面@Import进来的class分为两种：
        - ImportSelector：决定哪些Configuration类可以被选中，其子类DeferredImportSelector提供了分组的形式来细化管理Import
            - AutoConfigurationImportSelector:处理SpringAutoConfiguration包下面定义的各种Bean等
        - ImportBeanDefinitionRegistrar：注册BeanDefinition
5. 处理@ImportResource
6. 处理@Bean
7. 处理接口里的default方法
8. 处理父类
9. 递归处理过程中导入的ImportSelector，导入其定义的Configuration类，缓存

## 2. 校验Configuration

## 3. 处理ImportSelector导入的配置类

## 4. 清理工作
