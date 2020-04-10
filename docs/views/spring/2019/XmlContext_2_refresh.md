---
date: 2019-10-02
categories:
  - Spring
  - 源码
tag:
  - Spring
  - XmlContext
  - 源码
publish: false
---
# SpringContext之xml配置(2) new XmlApplicationContext("a-c.xml")过程的refresh()方法:规整configLocation成Resource数组

内容接续[第一节:configLocation参数处理](XmlContext_1_process_config.md)，在处理完configLocation并执行完父类的构造方法后，正式开始扫描Xml并进行bean的构造与存储，即执行ClassPathXmlApplicationContext类的父类AbstractApplicationContext的refresh()方法，代码如下：

```java
    /**
     * Load or refresh the persistent representation of the configuration,
     * which might an XML file, properties file, or relational database schema.
     * <p>As this is a startup method, it should destroy already created singletons
     * if it fails, to avoid dangling resources. In other words, after invocation
     * of that method, either all or no singletons at all should be instantiated.
     * @throws BeansException if the bean factory could not be initialized
     * @throws IllegalStateException if already initialized and multiple refresh
     * attempts are not supported
     */
    @Override
    public void refresh() throws BeansException, IllegalStateException {
        synchronized (this.startupShutdownMonitor) {
            // Prepare this context for refreshing.
            prepareRefresh();

            // Tell the subclass to refresh the internal bean factory.
            ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();

            // Prepare the bean factory for use in this context.
            prepareBeanFactory(beanFactory);

            try {
                // Allows post-processing of the bean factory in context subclasses.
                postProcessBeanFactory(beanFactory);

                // Invoke factory processors registered as beans in the context.
                invokeBeanFactoryPostProcessors(beanFactory);

                // Register bean processors that intercept bean creation.
                registerBeanPostProcessors(beanFactory);

                // Initialize message source for this context.
                initMessageSource();

                // Initialize event multicaster for this context.
                initApplicationEventMulticaster();

                // Initialize other special beans in specific context subclasses.
                onRefresh();

                // Check for listener beans and register them.
                registerListeners();

                // Instantiate all remaining (non-lazy-init) singletons.
                finishBeanFactoryInitialization(beanFactory);

                // Last step: publish corresponding event.
                finishRefresh();
            }

            catch (BeansException ex) {
                if (logger.isWarnEnabled()) {
                    logger.warn("Exception encountered during context initialization - " +
                            "cancelling refresh attempt: " + ex);
                }

                // Destroy already created singletons to avoid dangling resources.
                destroyBeans();

                // Reset 'active' flag.
                cancelRefresh(ex);

                // Propagate exception to caller.
                throw ex;
            }

            finally {
                // Reset common introspection caches in Spring's core, since we
                // might not ever need metadata for singleton beans anymore...
                resetCommonCaches();
            }
        }
    }
```

整个过程分下面的几个步骤：

1. 准备操作：prepareRefresh()
2. 重新加载所有的bean定义到新的beanFactory：ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory()
3. 为新的beanFactory准备beanPostProcessor,Environment等:prepareBeanFactory(beanFactory);
4. 执行子类的postProcessBeanFactory(beanFactory)方法
5. 初始化并调用所有BeanFactoryPostProcessor类型的bean
6. 注册BeanPostProcessors：registerBeanPostProcessors(beanFactory);
7. 初始化MessageSource
8. 初始化ApplicationEventMulticaster
9. 其他操作：onRefresh()
10. 注册ApplicationListener
11. 初始化还未初始化的单例bean
12. 结束refresh()
13. refresh完成后清理缓存

## 1.1 准备操作：prepareRefresh()

prepareRefresh方法的执行过程如方法名所示，主要进行环境变量的操作、日志的打印以及某些listener的处理，主要过程如下：

1. 更改当前Context的状态，```startupDate=当前时间;closed=false;active=true;```
2. 打印debug记录
3. 初始化上下文中的propertySources占位，在这个类里是空方法体
4. 初始化earlyApplicationListeners和applicationListeners，当前用例里为空，注意存储使用的是LinkedHashSet，是有序set
5. 初始化earlyApplicationEvents为空的LinkedHashSet

## 1.2 重新加载新的beanFactory：ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory()

```java
    protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
        refreshBeanFactory();
        return getBeanFactory();
    }
```

方法中主要是调用了方法refreshBeanFactory()，然后返回getBeanFactory()的执行结果，这两个方法在AbstractApplicationContext中均为抽象方法，对于本例来说，实际由子类
AbstractRefreshableApplicationContext实现

### 1.2.1 refreshBeanFactory()

此方法的具体代码如下：

```java
    /**
     * This implementation performs an actual refresh of this context's underlying
     * bean factory, shutting down the previous bean factory (if any) and
     * initializing a fresh bean factory for the next phase of the context's lifecycle.
     */
    @Override
    protected final void refreshBeanFactory() throws BeansException {
        if (hasBeanFactory()) {
            destroyBeans();
            closeBeanFactory();
        }
        try {
            DefaultListableBeanFactory beanFactory = createBeanFactory();
            beanFactory.setSerializationId(getId());
            customizeBeanFactory(beanFactory);
            loadBeanDefinitions(beanFactory);
            synchronized (this.beanFactoryMonitor) {
                this.beanFactory = beanFactory;
            }
        }
        catch (IOException ex) {
            throw new ApplicationContextException("I/O error parsing bean definition source for " + getDisplayName(), ex);
        }
    }
```

执行过程分析：

1. 销毁当前所有已经创建的bean，关闭beanFactory
2. 创建一个新的beanFactory并赋值新序列号
3. 自定义beanFactory
4. 加载bean定义
5. 赋值给当前ApplicationContext的beanFactory

主要关注点应该在第2、3、4步中：

#### 1.2.1.1 初始化BeanFactory:createBeanFactory()

```java
    protected DefaultListableBeanFactory createBeanFactory() {
        return new DefaultListableBeanFactory(getInternalParentBeanFactory());
    }
```

注意到初始化的BeanFactory类型为DefaultListableBeanFactory，且此处调用的是带参构造方法，参数类型为BeanFactory，值为getInternalParentBeanFactory()方法的返回值，实例初始化的过程可分为三步

![DefaultListableBeanFactory的类图](uml/DefaultListableBeanFactory.png)

1. DefaultListableBeanFactory的类加载、final变量加载
2. 获取getInternalParentBeanFactory()方法的返回值
3. 构造器调用

##### 1.2.1.1.1 DefaultListableBeanFactory的类加载、final变量加载

1. 静态代码块，测试classpath中是否有```javax.inject.Provider```类
2. Map from serialized id to factory instance.```private static final Map<String, Reference<DefaultListableBeanFactory>> serializableFactories = new ConcurrentHashMap<>(8);```

##### 1.2.1.1.2 getInternalParentBeanFactory()

```java
    return (getParent() instanceof ConfigurableApplicationContext ?
                ((ConfigurableApplicationContext) getParent()).getBeanFactory() : getParent());
```

如果this.parent变量指向的是ConfigurableApplicationContext，则返回this.parent.getBeanFactory()，否则返回this.parent，对于当前用例，this.parent == null，所以返回null

##### 1.2.1.1.3 DefaultListableBeanFactory构造器调用

1. 显示调用super的带参构造方法```public DefaultListableBeanFactory(@Nullable BeanFactory parentBeanFactory) {super(parentBeanFactory);}```
2. 父类AbstractAutowireCapableBeanFactory的带参构造方法

AbstractAutowireCapableBeanFactory类主要实现了bean的创建、初始化、参数注入、构造方法注入等功能

```java
    public AbstractAutowireCapableBeanFactory(@Nullable BeanFactory parentBeanFactory) {
        this();
        setParentBeanFactory(parentBeanFactory);
    }
```

this()调用的无参构造方法:

```java
    public AbstractAutowireCapableBeanFactory() {
        super();
        ignoreDependencyInterface(BeanNameAware.class);
        ignoreDependencyInterface(BeanFactoryAware.class);
        ignoreDependencyInterface(BeanClassLoaderAware.class);
    }
```

super()调用的父类无参构造方法，沿继承链上溯到DefaultSingletonBeanRegistry类中，

###### 1.2.1.1.3.1 DefaultSingletonBeanRegistry类的初始化

此类中定义了存取SingletonBean的缓存和相关方法，其中主要属性列举如下：

1. 存储各种bean的缓存：

    - Cache of singleton objects: bean name to bean instance. ```private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);```
    - Cache of singleton factories: bean name to ObjectFactory.```private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);```
    - Cache of early singleton objects: bean name to bean instance.```private final Set<String> registeredSingletons = new LinkedHashSet<>(256);```
    - Disposable bean instances: bean name to disposable instance.```private final Map<String, Object> disposableBeans = new LinkedHashMap<>();```

    注意，存储单例对象的缓存应该是主要缓存，且会被并发访问，因此使用ConcurrentHashMap保证线程安全的同时，初始容量设置为256来减少初期的Map扩容

2. 存储bean和bean关系的各种Map:

    - Map between containing bean names: bean name to Set of bean names that the bean contains.```private final Map<String, Set<String>> containedBeanMap = new ConcurrentHashMap<>(16);```
    - Map between dependent bean names: bean name to Set of dependent bean names.```private final Map<String, Set<String>> dependentBeanMap = new ConcurrentHashMap<>(64);```
    - Map between depending bean names: bean name to Set of bean names for the bean's dependencies.```private final Map<String, Set<String>> dependenciesForBeanMap = new ConcurrentHashMap<>(64);```

除了存储创建好的Bean的缓存外，还有一些属性，表征创建过程状态的如singletonsCurrentlyInCreation，inCreationCheckExclusions，singletonsCurrentlyInDestruction等。

DefaultSingletonBeanRegistry初始化完成后，沿继承链轮到DefaultListableBeanFactory的父类AbstractBeanFactory初始化：

###### 1.2.1.1.3.2 AbstractBeanFactory类

这个类中，除从父类继承来的SingletonBean相关属性方法外，还定义了很多处理类和更多的缓存变量，列举如下：

1. bean过程处理相关的类和flag

    - ClassLoader：
    - beanMetaData的flag：是否缓存metaData，默认true
    - propertyEditorRegistrars：Set\<PropertyEditorRegistrar>类型
    - ```Map<Class<?>, Class<? extends PropertyEditor>> customEditors```，自定义的PeropertyEditors
    - ```List<StringValueResolver> embeddedValueResolvers```:String resolvers to apply e.g. to annotation attribute values.
    - ```List<BeanPostProcessor> beanPostProcessors```

2. Bean缓存变量和过程变量

    - ```Map<String, Scope> scopes```:Map from scope identifier String to corresponding Scope.
    - ```Map<String, RootBeanDefinition> mergedBeanDefinitions```:Map from bean name to merged RootBeanDefinition.
    - ```Set<String> alreadyCreated```:Names of beans that have already been created at least once.
    - ```ThreadLocal<Object> prototypesCurrentlyInCreation```:Names of beans that are currently in creation.

AbstractBeanFactory实例初始化完成后，沿继承链回到AbstractAutowireCapableBeanFactory类的初始化

###### 1.2.1.1.3.3 AbstractAutowireCapableBeanFactory的变量初始化

父类全部初始化完成后，初始化本类的变量：

- ```private InstantiationStrategy instantiationStrategy = new CglibSubclassingInstantiationStrategy();```
- ```private ParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();```
- ```private final Set<Class<?>> ignoredDependencyTypes = new HashSet<>();```
- ```private final Set<Class<?>> ignoredDependencyInterfaces```,注意，这个set在空构造器中被放入了BeanNameAware、BeanFactoryAware、BeanClassLoaderAware三个接口
- ```private final NamedThreadLocal<String> currentlyCreatedBean```:The name of the currently created bean, for implicit dependency registration on getBean etc invocations triggered from a user-specified Supplier callback.
- ```private final ConcurrentMap<String, BeanWrapper> factoryBeanInstanceCache```:Cache of unfinished FactoryBean instances: FactoryBean name to BeanWrapper.
- ```private final ConcurrentMap<Class<?>, Method[]> factoryMethodCandidateCache```:Cache of candidate factory methods per factory class.
- ```private final ConcurrentMap<Class<?>, PropertyDescriptor[]> filteredPropertyDescriptorsCache```:Cache of filtered PropertyDescriptors: bean Class to PropertyDescriptor array.

在初始化完成上述变量后将this.parentBeanFactory=parentBeanFactory也就是null，至此AbstractAutowireCapableBeanFactory实例初始化完成

##### 1.2.1.1.4 DefaultListableBeanFactory变量初始化

- ```private AutowireCandidateResolver autowireCandidateResolver = new SimpleAutowireCandidateResolver();```
- ```private final Map<Class<?>, Object> resolvableDependencies```:依赖Class到实例
- ```private final Map<String, BeanDefinition> beanDefinitionMap```:bean名到bean定义
- ```private final Map<Class<?>, String[]> allBeanNamesByType```:依赖class到bean名的数组，不管bean是否单例
- ```private final Map<Class<?>, String[]> singletonBeanNamesByType```:依赖class到bean名的数组，bean是单例
- ```private volatile List<String> beanDefinitionNames```:按register顺序存储的beanDefinitionNames
- ```private volatile Set<String> manualSingletonNames```:按register顺序存储的手动注册的单例

上述属性初始化完成后，DefaultListableBeanFactory初始化完成，初始化完成的DefaultListableBeanFactory实例返回到refreshBeanFactory方法，返回的beanFactory被赋值序列号：类名@hashcode

#### 1.2.1.2 customizeBeanFactory(beanFactory)

根据当前上下文的变量更新beanFactory的allowBeanDefinitionOverriding和allowCircularReferences属性，当前用例中都是null，因此无操作

#### 1.2.1.3 AbstractXmlApplicationContext对象方法：loadBeanDefinitions(beanFactory)

将所有的bean定义加载到内部的beanFactory，ClassPathXmlApplicationContext的父类AbstractXmlApplicationContext复写了这个方法：

```java
    @Override
    protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory) throws BeansException, IOException {
        // Create a new XmlBeanDefinitionReader for the given BeanFactory.
        XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);

        // Configure the bean definition reader with this context's
        // resource loading environment.
        beanDefinitionReader.setEnvironment(this.getEnvironment());
        beanDefinitionReader.setResourceLoader(this);
        beanDefinitionReader.setEntityResolver(new ResourceEntityResolver(this));

        // Allow a subclass to provide custom initialization of the reader,
        // then proceed with actually loading the bean definitions.
        initBeanDefinitionReader(beanDefinitionReader);
        loadBeanDefinitions(beanDefinitionReader);
    }
```

XmlBeanDefinitionReader的初始化和赋值，并分别初始化beanDefinitionReader的environment,resourceLoader和entityResolver变量，initBeanDefinitionReader(beanDefinitionReader)方法把this.validating变量赋值给beanDefinationReader.validating，最后的loadBeanDefinitions(beanDefinitionReader)方法最终通过beanDefinationReader的帮助，将xml里的bean声明加载出来，加载的顺序如代码所示：

```java
    protected void loadBeanDefinitions(XmlBeanDefinitionReader reader) throws BeansException, IOException {
        Resource[] configResources = getConfigResources();
        if (configResources != null) {
            reader.loadBeanDefinitions(configResources);
        }
        String[] configLocations = getConfigLocations();
        if (configLocations != null) {
            reader.loadBeanDefinitions(configLocations);
        }
    }
```

对于AbstractXmlApplicationContext，configResources为null，在本用例中，configLocations={"application-context.xml"},
调用到XmlBeanDefinitionReader实例的loadBeanDefinitions(configLocations)

##### 1.2.1.3.1 XmlBeanDefinitionReader实例的reader.loadBeanDefinitions(configLocations)方法

下面是XmlBeanDefinitionReader的类UML图

![XmlBeanDefinitionReader的类UML图](uml/XmlBeanDefinitionReader.png)

实际调用的是抽象类AbstractBeanDefinitionReader的方法

```java
    public int loadBeanDefinitions(String location, @Nullable Set<Resource> actualResources) throws BeanDefinitionStoreException {
        ResourceLoader resourceLoader = getResourceLoader();
        if (resourceLoader == null) {
            throw new BeanDefinitionStoreException(
                    "Cannot load bean definitions from location [" + location + "]: no ResourceLoader available");
        }

        if (resourceLoader instanceof ResourcePatternResolver) {
            // Resource pattern matching available.
            try {
                Resource[] resources = ((ResourcePatternResolver) resourceLoader).getResources(location);
                int count = loadBeanDefinitions(resources);
                if (actualResources != null) {
                    Collections.addAll(actualResources, resources);
                }
                if (logger.isTraceEnabled()) {
                    logger.trace("Loaded " + count + " bean definitions from location pattern [" + location + "]");
                }
                return count;
            }
            catch (IOException ex) {
                throw new BeanDefinitionStoreException(
                        "Could not resolve bean definition resource pattern [" + location + "]", ex);
            }
        }
        else {
            // Can only load single resources by absolute URL.
            Resource resource = resourceLoader.getResource(location);
            int count = loadBeanDefinitions(resource);
            if (actualResources != null) {
                actualResources.add(resource);
            }
            if (logger.isTraceEnabled()) {
                logger.trace("Loaded " + count + " bean definitions from location [" + location + "]");
            }
            return count;
        }
    }
```

在这里，入参location是字符串"application-context.xml"，actualResources为null，程序执行过程如下

1. 获取resourceLoader对象，此对象负责把入参的location字符串规整为Resource对象数组
2. 遍历上一步规整好的Resource数组，对每一个Resource对象调用loadBeanDefinitions方法，此方法将初始化好的bean定义存入reader内部的registry变量中，
此变量即ApplicationContext的refresh方法新创建的beanFactory，在初始化reader的过程中被关联进来
3. 返回加载的BeanDefinition的数量

对于当前实例来说

1. 第一步中，resourceLoader在初始化过程中被赋值成当前的ClassPathXmlApplicationContext
2. 第二步中，调用getResource(location)方法获取Resource数组时，程序中判断resourceLoader是否是ResourcePatternResolver实例，是则调用ResourcePatternResolver实例的方法,否则调用resourceLoader的方法来加载，在本例中，由于AbstractApplicationContext实现ResourcePatternResolver接口，因此调用了实现方法：```return this.resourcePatternResolver.getResources(locationPattern);```，在这里this.resourcePatternResolver为PathMatchingResourcePatternResolver对象

###### 1.2.1.3.1.1 读取Resource数组：PathMatchingResourcePatternResolver实例方法：getResources(locationPattern)

此方法根据传入的字符串的特征来调用相应的策略，将传入的字符串解析成Resource数组，策略按顺序如下：

1. "classpath*:"开头的，首先检测是否有通配符('*','?',{})等，如果有，则遍历所有的classpath上的文件包括jar和zip文件来匹配并返回，如果没有通配符，则调用内部ClassLoader的getResources方法匹配相关路径，将结果包裹在UrlResource对象数组中返回
2. 非"classpath*:"开头的，首先检测是否有通配符('*','?',{})等，如果有，则遍历所有的classpath上的文件包括jar和zip文件来匹配并返回，否则就是当前实例的情况，调用内部ClassLoader的getResources方法匹配相关路径，将结果包裹在UrlResource对象数组中返回，当前实例的ResourceLoader是当前的ClassPathXmlApplicationContext，其中resourceLoader相关的方法在父类DefaultResourceLoader中实现，此方法同样是对传入值进行各种模式判断，再根据判断结果使用不同的策略来返回结果，

    1. ”/“开头的，将参数包裹为ClassPathContextResource对象返回
    2. ”classpath:"开头的，去掉”classpath:"后将参数包裹为ClassPathResource对象返回
    3. 上述都不符合，首先尝试包装参数成URL对象，再根据Url对象的protocol包装成FileUrlResource或者UrlResource对象
    4. 无法解析成URL对象的，如本例的入参，则将参数包装成ClassPathContextResource对象返回，本例符合这种情况

至此所有的configLocation字符串已经解析成Resource数组，当前实例中为一个ClassPathContextResource对象的数组，返回后，程序将继续进行Bean定义的读取

###### 1.2.1.3.1.2 AbstractBeanDefinitionReader从Resource对象中加载Bean定义

AbstractBeanDefinitionReader获取到Resource数组后，会迭代数组元素，对每个Resource执行```loadBeanDefinitions(Resource resource)```方法来加载Bean定义，并将读取到的Bean定义数目加和后返回，具体的读取流程见下一节[AbstractBeanDefinitionReader从Resource对象中加载Bean定义](XmlContext_3_LoadResource.md)

每个configLocation的每个Resource对象的Bean全部加载完成后，beanFactory被存入ApplicationContext，继续进行refresh操作

## 1.3 prepareBeanFactory(beanFactory)

在这一步之前，所有的beanDefinition已经被读取并存入beanFactory中，这一步在bean初始化之前，准备一些环境相关的bean：

```java
    protected void prepareBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // Tell the internal bean factory to use the context's class loader etc.
        beanFactory.setBeanClassLoader(getClassLoader());
        beanFactory.setBeanExpressionResolver(new StandardBeanExpressionResolver(beanFactory.getBeanClassLoader()));
        beanFactory.addPropertyEditorRegistrar(new ResourceEditorRegistrar(this, getEnvironment()));

        // Configure the bean factory with context callbacks.
        beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));
        beanFactory.ignoreDependencyInterface(EnvironmentAware.class);
        beanFactory.ignoreDependencyInterface(EmbeddedValueResolverAware.class);
        beanFactory.ignoreDependencyInterface(ResourceLoaderAware.class);
        beanFactory.ignoreDependencyInterface(ApplicationEventPublisherAware.class);
        beanFactory.ignoreDependencyInterface(MessageSourceAware.class);
        beanFactory.ignoreDependencyInterface(ApplicationContextAware.class);

        // BeanFactory interface not registered as resolvable type in a plain factory.
        // MessageSource registered (and found for autowiring) as a bean.
        beanFactory.registerResolvableDependency(BeanFactory.class, beanFactory);
        beanFactory.registerResolvableDependency(ResourceLoader.class, this);
        beanFactory.registerResolvableDependency(ApplicationEventPublisher.class, this);
        beanFactory.registerResolvableDependency(ApplicationContext.class, this);

        // Register early post-processor for detecting inner beans as ApplicationListeners.
        beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(this));

        // Detect a LoadTimeWeaver and prepare for weaving, if found.
        if (beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
            beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
            // Set a temporary ClassLoader for type matching.
            beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
        }

        // Register default environment beans.
        if (!beanFactory.containsLocalBean(ENVIRONMENT_BEAN_NAME)) {
            beanFactory.registerSingleton(ENVIRONMENT_BEAN_NAME, getEnvironment());
        }
        if (!beanFactory.containsLocalBean(SYSTEM_PROPERTIES_BEAN_NAME)) {
            beanFactory.registerSingleton(SYSTEM_PROPERTIES_BEAN_NAME, getEnvironment().getSystemProperties());
        }
        if (!beanFactory.containsLocalBean(SYSTEM_ENVIRONMENT_BEAN_NAME)) {
            beanFactory.registerSingleton(SYSTEM_ENVIRONMENT_BEAN_NAME, getEnvironment().getSystemEnvironment());
        }
    }
```

1. 设置BeanClassLoader：与当前ApplicationContext相同
2. 设置BeanExpressionResolver：一个StandardBeanExpressionResolver实例
3. 新增PropertyEditorRegistrar
4. 新增BeanPostProcessor：ApplicationContextAwareProcessor
5. 忽略依赖类：EnvironmentAware，EmbeddedValueResolverAware，ResourceLoaderAware，ApplicationEventPublisherAware，MessageSourceAware，ApplicationContextAware
6. 把beanFactory本身注册为ResolvableDependency，类型为BeanFactory
7. 把ApplicationContext本身注册为ResolvableDependency，类型是ResourceLoader，ApplicationEventPublisher，ApplicationContext
8. 新增BeanPostProcessor：ApplicationListenerDetector
9. 如果有定义LoadTimeWeaver，则新增BeanPostProcessor：LoadTimeWeaverAwareProcessor，并初始化临时ClassLoader:new ContextTypeMatchClassLoader
10. 将上下文内部的Environment注册为名叫"environment"的单例bean
11. 将上下文内部的Environment内部的SystemProperties注册为名叫"systemProperties"的单例bean
12. 将上下文内部的Environment内部的SystemEnvironment注册为名叫"systemEnvironment"的单例bean

在这里初始化并添加了两个BeanPostProcessor类型的对象:

- ApplicationContextAwareProcessor：这个类对Aware接口的bean有效，在bean实例初始化之前把ApplicationContext中的属性注入到bean中：

```java
    private void invokeAwareInterfaces(Object bean) {
        if (bean instanceof Aware) {
            if (bean instanceof EnvironmentAware) {
                ((EnvironmentAware) bean).setEnvironment(this.applicationContext.getEnvironment());
            }
            if (bean instanceof EmbeddedValueResolverAware) {
                ((EmbeddedValueResolverAware) bean).setEmbeddedValueResolver(this.embeddedValueResolver);
            }
            if (bean instanceof ResourceLoaderAware) {
                ((ResourceLoaderAware) bean).setResourceLoader(this.applicationContext);
            }
            if (bean instanceof ApplicationEventPublisherAware) {
                ((ApplicationEventPublisherAware) bean).setApplicationEventPublisher(this.applicationContext);
            }
            if (bean instanceof MessageSourceAware) {
                ((MessageSourceAware) bean).setMessageSource(this.applicationContext);
            }
            if (bean instanceof ApplicationContextAware) {
                ((ApplicationContextAware) bean).setApplicationContext(this.applicationContext);
            }
        }
    }
```

- ApplicationListenerDetector：这个BeanPostProcessor对ApplicationListener接口的bean有效，在Bean初始化结束后，```this.applicationContext.addApplicationListener((ApplicationListener<?>) bean);```，值得一提的是，这个类覆写了.equals方法为```return (this == other || (other instanceof ApplicationListenerDetector && this.applicationContext == ((ApplicationListenerDetector) other).applicationContext))```，这样只要内部存有相同的applicationContext，则必定equals返回true，这样做的目的是保证在applicationContext存储BeanProcessor的map中，只有一个实例（ApplicationContext内部使用CopyOnWriteList存储BeanPostProcessor，而其remove时根据==和.equals()方法来判断对象是否存在）

## 1.4. 执行子类的postProcessBeanFactory(beanFactory)方法

在AbstractApplicationContext里为空方法体

## 1.5. 初始化并调用所有BeanFactoryPostProcessor类型的bean

此方法初始化并调用所有BeanFactoryPostProcessor类型的bean，完成后处理 "loadTimeWeaver"，在当前用例里没有定义任何的BeanFactoryPostProcessor

## 1.6. 注册BeanPostProcessors：registerBeanPostProcessors(beanFactory)

1. 新增一个BeanPostProcessorChecker类型的BeanPostProcessor
2. 根据priority和order配置**顺序**注册实现了PriorityOrdered接口的BeanPostProcessor
3. 根据order配置**顺序**注册实现了Ordered接口的BeanPostProcessor
4. 注册其余的BeanPostProcessor
5. 注册实现了MergedBeanDefinitionPostProcessor接口的BeanPostProcessor，注意，在往AbstractBeanFactory注册BeanPostProcessor时，会先remove再add以保证新注册的在List里排在后面
6. 新建一个ApplicationListenerDetector，添加到BeanPostProcessor最后（由于其复写了.equals()方法因此仍旧会移除原有的所有内部applicationContext相同的实例）

## 1.7. 初始化MessageSource

如果beanFactory有定义MessageSource(beanName为"messageSource")，则设置当前ApplicationContext的MessageSource为定义的bean，否则初始化一个DelegatingMessageSource

## 1.8. 初始化ApplicationEventMulticaster

如果beanFactory有name为"applicationEventMulticaster"的bean，则使用，否则使用SimpleApplicationEventMulticaster

## 1.9. onRefresh()

方法体为空

## 1.10. 注册ApplicationListener

如果有ApplicationListener或者bean，将其注册到applicationEventMulticaster上，并且广播当前已经缓存的earlyEventsToProcess事件

## 1.11. 初始化还未初始化的单例bean

在beanFactory中的bean定义、环境bean、listener、processor全部准备好后，开始初始化其他还未初始化的单例bean，具体实现在AbstractApplicationContext的finishBeanFactoryInitialization方法：

```java
    protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {
        // Initialize conversion service for this context.
        if (beanFactory.containsBean(CONVERSION_SERVICE_BEAN_NAME) &&
                beanFactory.isTypeMatch(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)) {
            beanFactory.setConversionService(
                    beanFactory.getBean(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class));
        }

        // Register a default embedded value resolver if no bean post-processor
        // (such as a PropertyPlaceholderConfigurer bean) registered any before:
        // at this point, primarily for resolution in annotation attribute values.
        if (!beanFactory.hasEmbeddedValueResolver()) {
            beanFactory.addEmbeddedValueResolver(strVal -> getEnvironment().resolvePlaceholders(strVal));
        }

        // Initialize LoadTimeWeaverAware beans early to allow for registering their transformers early.
        String[] weaverAwareNames = beanFactory.getBeanNamesForType(LoadTimeWeaverAware.class, false, false);
        for (String weaverAwareName : weaverAwareNames) {
            getBean(weaverAwareName);
        }

        // Stop using the temporary ClassLoader for type matching.
        beanFactory.setTempClassLoader(null);

        // Allow for caching all bean definition metadata, not expecting further changes.
        beanFactory.freezeConfiguration();

        // Instantiate all remaining (non-lazy-init) singletons.
        beanFactory.preInstantiateSingletons();
    }
```

1. 如果定义了"conversionService"，则使用
2. 初始化beanFactory的ValueResolver：strVal -> getEnvironment().resolvePlaceholders(strVal)
3. 初始化LoadTimeWeaverAware，结束后清空临时ClassLoader
4. 冻结当前的定义状态，准备初始化及提取MetaData
5. 初始化自定义的单例Bean：preInstantiateSingletons()

### 1.11.1 初始化自定义的单例Bean

```java
    @Override
    public void preInstantiateSingletons() throws BeansException {
        if (logger.isTraceEnabled()) {
            logger.trace("Pre-instantiating singletons in " + this);
        }

        // Iterate over a copy to allow for init methods which in turn register new bean definitions.
        // While this may not be part of the regular factory bootstrap, it does otherwise work fine.
        List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);

        // Trigger initialization of all non-lazy singleton beans...
        for (String beanName : beanNames) {
            RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
            if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
                if (isFactoryBean(beanName)) {
                    Object bean = getBean(FACTORY_BEAN_PREFIX + beanName);
                    if (bean instanceof FactoryBean) {
                        final FactoryBean<?> factory = (FactoryBean<?>) bean;
                        boolean isEagerInit;
                        if (System.getSecurityManager() != null && factory instanceof SmartFactoryBean) {
                            isEagerInit = AccessController.doPrivileged((PrivilegedAction<Boolean>)
                                            ((SmartFactoryBean<?>) factory)::isEagerInit,
                                    getAccessControlContext());
                        }
                        else {
                            isEagerInit = (factory instanceof SmartFactoryBean &&
                                    ((SmartFactoryBean<?>) factory).isEagerInit());
                        }
                        if (isEagerInit) {
                            getBean(beanName);
                        }
                    }
                }
                else {
                    getBean(beanName);
                }
            }
        }

        // Trigger post-initialization callback for all applicable beans...
        for (String beanName : beanNames) {
            Object singletonInstance = getSingleton(beanName);
            if (singletonInstance instanceof SmartInitializingSingleton) {
                final SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
                if (System.getSecurityManager() != null) {
                    AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
                        smartSingleton.afterSingletonsInstantiated();
                        return null;
                    }, getAccessControlContext());
                }
                else {
                    smartSingleton.afterSingletonsInstantiated();
                }
            }
        }
    }
```

1. 复制当前的beanDefinitionNames数组到方法本地变量进行迭代，这样允许在bean初始化过程中注册新的bean到beanDefinitionNames而不影响迭代过程
2. 对于每一个bean，执行下面的过程来初始化
    1. 合并所有的BeanDefinition
    2. 对于非Abstract、非懒加载的SingletonBean，如果是FactoryBean，则先调用getBean(beanName)方法初始化名为"&"+beanName的FactoryBean，再调用getBean(beanName)方法来初始化bean，如果不是FactoryBean，则直接调用getBean(beanName)方法，getBean(beanName)方法具体执行bean的初始化、连接、注入等功能，详情见[初始化bean的过程](XmlContext_5_BeanDefinitionToBean.md)
3. 调用所有SmartInitializingSingleton类型的单例Bean的afterSingletonsInstantiated()方法

BeanFactory和FactoryBean的区别：

>FactoryBean是一个接口，接口中有getObject()方法，实现了此接口的bean，在SpringContext中作为Factory使用，beanFactory中维护了一个name为"&"+"beanName"的bean，用来生成具体的bean，"&"是Spring约定的标记一个bean为FactoryBean的标记
>BeanFactory也是一个接口，内部定义了管理Bean生命周期、存取的方法，比如getBean的各种重载方法、containsBean、isSingleton等方法，ApplicationContext接口继承了此接口，因此，各种Context也实现了ApplicationContext接口，都可以看作BeanFactory

## 1.12 12. 结束refresh()

```
    protected void finishRefresh() {
        // Clear context-level resource caches (such as ASM metadata from scanning).
        clearResourceCaches();

        // Initialize lifecycle processor for this context.
        initLifecycleProcessor();

        // Propagate refresh to lifecycle processor first.
        getLifecycleProcessor().onRefresh();

        // Publish the final event.
        publishEvent(new ContextRefreshedEvent(this));

        // Participate in LiveBeansView MBean, if active.
        LiveBeansView.registerApplicationContext(this);
    }
```

1. 清空当前上下文的resourceCaches
2. 如果上下文的BeanFactory有定义名称为"lifecycleProcessor"，类为LifecycleProcessor的Bean，则将之赋值给this.lifecycleProcessor属性，如果没有，则初始化一个DefaultLifecycleProcessor类型的单例Bean，注册到BeanFactory，名称为"lifecycleProcessor"
3. 调用this.lifecycleProcessor的onRefresh()方法:
    1. 寻找所有Lifecycle类的Bean
    2. 遍历上面的Bean，组装成phases，放入一个LifecycleGroup
    3. 按顺序调用LifecircleGroup的start方法
    4. 标记当前LifecycleProcessor的running为true
4. 发布ContextRefreshedEvent：向当前上下文中的ApplicationEventMulticaster多播事件
5. LiveBeansView.registerApplicationContext(this):如果环境变量有定义""spring.liveBeansView.mbeanDomain"，则向MBeanServer注册MBean

## 1.13 refersh完成后，清理缓存

主要是清空一些静态类的缓存：

```java
    protected void resetCommonCaches() {
        ReflectionUtils.clearCache();
        AnnotationUtils.clearCache();
        ResolvableType.clearCache();
        CachedIntrospectionResults.clearClassLoader(getClassLoader());
    }
```

至此，ClassPathXmlApplicationContext的构造方法中的refresh()过程完成
