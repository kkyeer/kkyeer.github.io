---
date: 2019-09-01
categories:
  - Spring
tag:
  - Spring
  - Context
  - 源码
sidebarDepth: 3
summary: 本系列主要介绍了SpringContext框架中，通过纯xml配置来初始化一个ApplicationContext，并通过class参数来获取实例bean的过程，本节主要介绍了学习过程中的配置文件，以及初始化ClassPathXmlApplicationContext实例过程中的第一部分，即处理入参字符串的部分
publish: true
---
# SpringContext源码-Xml上下文初始化与Bean获取

本系列主要介绍了SpringContext框架中，通过纯xml配置来初始化一个ApplicationContext，并通过class
参数来获取实例bean的过程，本节主要介绍了学习过程中的配置文件，以及初始化ClassPathXmlApplicationContext实例过程中的
第一部分，即处理入参字符串的部分

## 1. 环境准备

### 1.1. pom.xml

```xml
    <!-- https://mvnrepository.com/artifact/org.springframework/spring-context -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>5.1.8.RELEASE</version>
    </dependency>
```

### 1.2. application-context.xml

文件application-context.xml位于src/main/resources目录下，bean定义如下：

```xml
    <bean id="myBean" class="com.kkyeer.taste.Person">
        <property name="age" value="12"/>
        <property name="name" value="Zhang San"/>
    </bean>
```

### 1.3. BeanClass类

Person.java类包含age,name两个Field，入口类比较简单，先从application-context.xml文件中加载一个ApplicationContext，再通过getBean(Person.class)方法获取Bean，最后打印验证

### 1.4. 应用入口

```Java
public class TasteSpring {
    public static void main(String[] args) {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("application-context.xml");
        Person person = applicationContext.getBean(Person.class);
        System.out.println(person.getName());
    }
}
```

## 2.1 初始化上下文

```new ClassPathXmlApplicationContext("a-c.xml")```

### 2.1.1 UML

![UML](uml/ClassPathXmlApplicationContext.png)

### 2.1.2 构造方法

```new ClassPathXmlApplicationContext("a-c.xml")```直接调用到：

```java
    public ClassPathXmlApplicationContext(String configLocation) throws BeansException {
        this(new String[] {configLocation}, true, null);
    }
```

此构造方法显式调用到ClassPathXmlApplicationContext的另一个构造方法

```java
    public ClassPathXmlApplicationContext(
            String[] configLocations, boolean refresh, @Nullable ApplicationContext parent)
            throws BeansException {
        super(parent);
        setConfigLocations(configLocations);
        if (refresh) {
            refresh();
        }
    }
```

1. 调用父类的参数为(String[])的构造方法
2. 调用setConfigLocations(configLocations)方法
3. refresh

接下来，沿继承链调用父类的无参构造方法：

>> AbstractApplicationContext

```java
    public AbstractApplicationContext() {
        this.resourcePatternResolver = getResourcePatternResolver();
    }
```

1. 此构造方法没有显式调用任何父类的构造方法，则隐式调用直接父类的无参构造方法：

    ```java
        public DefaultResourceLoader() {
            this.classLoader = ClassUtils.getDefaultClassLoader();
        }
    ```

2. AbstractApplicationContext定义的实例变量初始化

3. 调用getResourcePatternResolver()获取并赋值到this.resourcePatternResolver

#### 2.1.2.1. DefaultResourceLoader的无参构造方法

1. 实例变量初始化

    - ```private final Set<ProtocolResolver> protocolResolvers = new LinkedHashSet<>(4);```
    - ```private final Map<Class<?>, Map<Resource, ?>> resourceCaches = new ConcurrentHashMap<>(4);```

2. 执行构造方法体

```private ClassLoader classLoader = = ClassUtils.getDefaultClassLoader();```，这里的getDefaultClassLoader方法用来获取ClassLoader，优先级：当前线程的ContextClassLoader > ClassUtils.class的ClassLoadeer > SystemClassLoader

classLoader初始化完成后，DefaultResourceLoader的无参构造方法执行完成

###### 2.1.2.1.1.2. AbstractApplicationContext定义的实例变量初始化

- ```public static final String MESSAGE_SOURCE_BEAN_NAME = "messageSource";```
- ```public static final String LIFECYCLE_PROCESSOR_BEAN_NAME = "lifecycleProcessor";```
- ```public static final String APPLICATION_EVENT_MULTICASTER_BEAN_NAME = "applicationEventMulticaster";```
- ```private String id = ObjectUtils.identityToString(this);```
- ```private String displayName = ObjectUtils.identityToString(this);```
- ```private final AtomicBoolean active = new AtomicBoolean();```false
- ```private final List<BeanFactoryPostProcessor> beanFactoryPostProcessors = new ArrayList<>();```**这是个关键列表，存储了所有介入BeanFactory处理过程的实现BeanFactoryPostProcessor的实例**
- ```private final AtomicBoolean closed = new AtomicBoolean();```false
- ```private final Object startupShutdownMonitor = new Object();```**refresh和destroy方法的Monitor对象**
- ```private final Set<ApplicationListener<?>> applicationListeners = new LinkedHashSet<>();```**ApplicationListener对象**
- ```protected final Log logger = LogFactory.getLog(getClass());```

**注意，logger字段是protected的，子类可以访问**，这里调用org.apache.commons.logging.LogFactory的getLog方法，返回的也是同一个包下的Log对象实例，实际执行过程中通过顺序尝试加载log4j_spi\log4j_slf4j\slf4j_spi\slf4j的核心类来确认当前使用的Logger，并通过LogAdapter类中的各种适配器将实际类中的方法适配到common.logging包下的Log接口的方法

###### 2.1.2.1.1.3. 构造resourcePatternResolver

调用getResourcePatternResolver()获取并赋值到this.resourcePatternResolver，后者内部初始化一个PathMatchingResourcePatternResolver对象：

1. 初始化pathMatcher：```private PathMatcher pathMatcher = new AntPathMatcher();```
2. 将PathMatchingResourcePatternResolver内部的resourceLoader变量初始化为正在初始化的ApplicationContext

以上全部执行完毕后，所有无参构造方法调用完毕，继续执行

##### 2.1.2.1.2. AbstractApplicationContext的setParent(parent)

```java
    @Override
    public void setParent(@Nullable ApplicationContext parent) {
        this.parent = parent;
        if (parent != null) {
            Environment parentEnvironment = parent.getEnvironment();
            if (parentEnvironment instanceof ConfigurableEnvironment) {
                getEnvironment().merge((ConfigurableEnvironment) parentEnvironment);
            }
        }
    }
```

对于此次给定的初始化参数来说，由于parent为null，因此此处无操作

##### 2.1.2.1.3. 逐级初始化剩下的ClassPathXmlApplicationContext父类的实例变量

1. AbstractRefreshableApplicationContext:
    - ```private final Object beanFactoryMonitor = new Object();```：这是BeanFactory创建时的Monitor对象
2. AbstractRefreshableConfigApplicationContext:
    - ```private boolean setIdCalled = false;```
3. AbstractXmlApplicationContext:
    - ```private boolean validating = true;```

至此ClassPathXmlApplicationContext显式调用的```super(parent)```构造方法全部执行完成

### 2.1.3 路径字符串数组解析为绝对路径

setConfigLocations(configLocations)
这里configLocations是字符串数组: ["application-context.xml"]，这个方法的方法体为：

```java
    /**
     * Set the config locations for this application context.
     * <p>If not set, the implementation may use a default as appropriate.
     */
    public void setConfigLocations(@Nullable String... locations) {
        if (locations != null) {
            Assert.noNullElements(locations, "Config locations must not be null");
            this.configLocations = new String[locations.length];
            for (int i = 0; i < locations.length; i++) {
                this.configLocations[i] = resolvePath(locations[i]).trim();
            }
        }
        else {
            this.configLocations = null;
        }
    }
```

校验输入后，遍历传入的configLocations数组，对每个元素分别调用resolvPath()方法并存入this.configLocations数组

#### 2.1.3.1 用系统的环境变量替换Config Location字符串中的PlaceholderresolvePath方法

```java
    /**
     * Resolve the given path, replacing placeholders with corresponding
     * environment property values if necessary. Applied to config locations.
     * @param path the original file path
     * @return the resolved file path
     * @see org.springframework.core.env.Environment#resolveRequiredPlaceholders(String)
     */
    protected String resolvePath(String path) {
        return getEnvironment().resolveRequiredPlaceholders(path);
    }
```

获取ApplictionContext的environment，为空则new StandardEnvironment()并放入

#### 2.1.3.2 StandardEnvironment的初始化

此类的父类为AbstractEnvironment，StandardEnvironment在父类基础上复写了customizePropertySources方法，大部分初始化及方法都在父类中，下面是父类AbstractEnvironment初始化的过程

1. AbstractEnvironment的实例变量初始化

    - ```private final MutablePropertySources propertySources = new MutablePropertySources();```
    父类内部维护了一个MutablePropertySources类型的propertySources变量，此类型本质上是CopyOnWriteArrayList\<PropertySource>，而PropertySource是对Map对象（或其实现等K-V对容器）的再包装，子类需要提供根据key获取值、删除某键值对等方法

    - ```private final ConfigurablePropertyResolver propertyResolver = new PropertySourcesPropertyResolver(this.propertySources);```，propertyResolver是Environment的核心成员变量，其他的属性等均是为此成员变量服务的，在AbstractEnvironment初始化过程中，将内部维护的propertySources属性传递给新初始化的ConfigurablePropertyResolver实例，PropertySourcesPropertyResolver主要是复写了父类的getProperty方法,主要的初始化工作由父类AbstractPropertyResolver完成：主要是final类型字符串常量的初始化

AbstractEnvironment的无参构造方法调用了customizePropertySources(this.propertySources);方法，StandardEnvironment复写了此方法，加载以下两部分Property：

1. "systemProperties"，值为System.getProperties()返回的map包装成的PropertiesPropertySource
2. "systemEnvironment"，值为System.getenv()返回的map包装成的SystemEnvironmentPropertySource，值得一提的是如果提供了spring.properties文件并指定spring.getenv.ignore=false，则不加载

#### 2.1.3.3 解析Placeholder

实际调用的是AbstractEnvironment类的resolveRequiredPlaceholders(String text)方法：

```java
    @Override
    public String resolveRequiredPlaceholders(String text) throws IllegalArgumentException {
        return this.propertyResolver.resolveRequiredPlaceholders(text);
    }
```

调用了propertyResolver的对应方法

```java
    @Override
    public String resolveRequiredPlaceholders(String text) throws IllegalArgumentException {
        if (this.strictHelper == null) {
            this.strictHelper = createPlaceholderHelper(false);
        }
        return doResolvePlaceholders(text, this.strictHelper);
    }
```

其中createPlaceholderHelper(false)为核心方法：

```java
    private PropertyPlaceholderHelper createPlaceholderHelper(boolean ignoreUnresolvablePlaceholders) {
        return new PropertyPlaceholderHelper(this.placeholderPrefix, this.placeholderSuffix,
                this.valueSeparator, ignoreUnresolvablePlaceholders);
    }
```

这个类是一个辅助类，用来把对应字符串的占位符替换成已经加载的相关property，比如字符串
"${abcd}"会被替换成abcd对应的property值返回

### 2.1.4. refresh过程

ClassPathXmlApplicationContext没有复写此方法，实际调用的是父类AbstractApplicationContext的refresh方法，在这个方法中会进行Bean的初始化，具体的过程参考[refresh过程](./XmlContext_2_refresh.md)

## 2.2 获取单例Bean

````applicationContext.getBean(Person.class)```执行过程中，实际调用Context内部的BeanFactory的getBean方法，这可以视为**装饰器模式**的实际应用：

```java
    @Override
    public <T> T getBean(Class<T> requiredType) throws BeansException {
        assertBeanFactoryActive();
        return getBeanFactory().getBean(requiredType);
    }
```

1. 断言BeanFactory的状态：断言当前的上下文是否状态处于active且非closed，对于ClassPathXmlApplicationContext而言，BeanFactory的状态由内部的BeanFactory来维护
2. 获取BeanFactory，调用BeanFactory的getBean方法来获取Bean，对于ClassPathXmlApplicationContext来说，内部的BeanFactory是DefaultListableBeanFactory类，所以调用的也是这个类的getBean方法：

    ```java
        public <T> T getBean(Class<T> requiredType, @Nullable Object... args) throws BeansException {
            Assert.notNull(requiredType, "Required type must not be null");
            Object resolved = resolveBean(ResolvableType.forRawClass(requiredType), args, false);
            if (resolved == null) {
                throw new NoSuchBeanDefinitionException(requiredType);
            }
            return (T) resolved;
        }
    ```

    1. 根据Class获取ResolvableType
    2. 根据ResolvableType获取Bean

### 2.2.1 根据Class获取ResolvableType

此类型是对java.lang.reflect.Type的封装（装饰模式）

```java
    public static ResolvableType forRawClass(@Nullable Class<?> clazz) {
        return new ResolvableType(clazz) {
            @Override
            public ResolvableType[] getGenerics() {
                return EMPTY_TYPES_ARRAY;
            }
            @Override
            public boolean isAssignableFrom(Class<?> other) {
                return (clazz == null || ClassUtils.isAssignable(clazz, other));
            }
            @Override
            public boolean isAssignableFrom(ResolvableType other) {
                Class<?> otherClass = other.getRawClass();
                return (otherClass != null && (clazz == null || ClassUtils.isAssignable(clazz, otherClass)));
            }
        };
    }
```

### 2.2.2 根据ResolvableType获取Bean

```java
    @Nullable
    private <T> T resolveBean(ResolvableType requiredType, @Nullable Object[] args, boolean nonUniqueAsNull) {
        NamedBeanHolder<T> namedBean = resolveNamedBean(requiredType, args, nonUniqueAsNull);
        if (namedBean != null) {
            return namedBean.getBeanInstance();
        }
        BeanFactory parent = getParentBeanFactory();
        if (parent instanceof DefaultListableBeanFactory) {
            return ((DefaultListableBeanFactory) parent).resolveBean(requiredType, args, nonUniqueAsNull);
        }
        else if (parent != null) {
            ObjectProvider<T> parentProvider = parent.getBeanProvider(requiredType);
            if (args != null) {
                return parentProvider.getObject(args);
            }
            else {
                return (nonUniqueAsNull ? parentProvider.getIfUnique() : parentProvider.getIfAvailable());
            }
        }
        return null;
    }
```

1. 尝试获取NamedBeanHolder
2. 如果第一步未获取成功，则尝试上溯父BeanFactory加载Bean：
    1. 如果父BeanFactory是DefaultListableBeanFactory类型，则递归调用resolveBean方法
    2. 否则调用parent.getBeanProvider(requiredType)，然后调用相关方法获取Bean

#### 2.2.2.1 获取NamedBeanHolder

```java
    @Nullable
    private <T> NamedBeanHolder<T> resolveNamedBean(
            ResolvableType requiredType, @Nullable Object[] args, boolean nonUniqueAsNull) throws BeansException {

        Assert.notNull(requiredType, "Required type must not be null");
        String[] candidateNames = getBeanNamesForType(requiredType);

        if (candidateNames.length > 1) {
            List<String> autowireCandidates = new ArrayList<>(candidateNames.length);
            for (String beanName : candidateNames) {
                if (!containsBeanDefinition(beanName) || getBeanDefinition(beanName).isAutowireCandidate()) {
                    autowireCandidates.add(beanName);
                }
            }
            if (!autowireCandidates.isEmpty()) {
                candidateNames = StringUtils.toStringArray(autowireCandidates);
            }
        }

        if (candidateNames.length == 1) {
            String beanName = candidateNames[0];
            return new NamedBeanHolder<>(beanName, (T) getBean(beanName, requiredType.toClass(), args));
        }
        else if (candidateNames.length > 1) {
            Map<String, Object> candidates = new LinkedHashMap<>(candidateNames.length);
            for (String beanName : candidateNames) {
                if (containsSingleton(beanName) && args == null) {
                    Object beanInstance = getBean(beanName);
                    candidates.put(beanName, (beanInstance instanceof NullBean ? null : beanInstance));
                }
                else {
                    candidates.put(beanName, getType(beanName));
                }
            }
            String candidateName = determinePrimaryCandidate(candidates, requiredType.toClass());
            if (candidateName == null) {
                candidateName = determineHighestPriorityCandidate(candidates, requiredType.toClass());
            }
            if (candidateName != null) {
                Object beanInstance = candidates.get(candidateName);
                if (beanInstance == null || beanInstance instanceof Class) {
                    beanInstance = getBean(candidateName, requiredType.toClass(), args);
                }
                return new NamedBeanHolder<>(candidateName, (T) beanInstance);
            }
            if (!nonUniqueAsNull) {
                throw new NoUniqueBeanDefinitionException(requiredType, candidates.keySet());
            }
        }

        return null;
    }
```

1. 根据Class对象查找可能的BeanName数组，查找出了多个BeanName，过滤BeanName数组，只留下beanDefinitionMap没有的，或者AutowireCandidate的Bean的Name
2. 如果上面过滤以后，只剩一个BeanName，则调用getBean的重载方法```getBean(String name, @Nullable Class<T> requiredType, @Nullable Object... args)```来获取Bean实例，跟剩下的这个BeanName一起包裹到一个NamedBeanHolder对象中返回
3. 如果第2步过滤以后，还有多个BeanName，则调用匹配到多个BeanName的逻辑

##### 2.2.2.1.1 根据Class对象获取BeanName数组

```java
    @Override
    public String[] getBeanNamesForType(ResolvableType type) {
        Class<?> resolved = type.resolve();
        if (resolved != null && !type.hasGenerics()) {
            return getBeanNamesForType(resolved, true, true);
        }
        else {
            return doGetBeanNamesForType(type, true, true);
        }
    }
```

1. 对于目标Class没有泛型定义的，调用重载方法```getBeanNamesForType(resolved, true, true)```
2. 对于有泛型定义的Class对象，调用```doGetBeanNamesForType(type, true, true)```方法来获取BeanName数组

###### 2.2.2.1.1.1 非泛型类获取BeanName数组

```java
    @Override
    public String[] getBeanNamesForType(@Nullable Class<?> type, boolean includeNonSingletons, boolean allowEagerInit) {
        if (!isConfigurationFrozen() || type == null || !allowEagerInit) {
            return doGetBeanNamesForType(ResolvableType.forRawClass(type), includeNonSingletons, allowEagerInit);
        }
        Map<Class<?>, String[]> cache =
                (includeNonSingletons ? this.allBeanNamesByType : this.singletonBeanNamesByType);
        String[] resolvedBeanNames = cache.get(type);
        if (resolvedBeanNames != null) {
            return resolvedBeanNames;
        }
        resolvedBeanNames = doGetBeanNamesForType(ResolvableType.forRawClass(type), includeNonSingletons, true);
        if (ClassUtils.isCacheSafe(type, getBeanClassLoader())) {
            cache.put(type, resolvedBeanNames);
        }
        return resolvedBeanNames;
    }
```

1. 获取Class对象到String[]数组的缓存:如果仅查找单例则this.singletonBeanNamesByType，否则this.allBeanNamesByType，在此缓存里查找，查找到直接返回对应的BeanName数组
2. 如果缓存没有查找到，则还是调用```doGetBeanNamesForType(ResolvableType.forRawClass(type), includeNonSingletons, true)```方法来获取实例BeanName数组
3. 校验Class是否由当前上下文的Classloader加载的，如果是，则把获取到的Class到BeanName数组放入缓存

###### 2.2.2.1.1.2 获取BeanName数组的核心方法：doGetBeanNamesForType

```java

    private String[] doGetBeanNamesForType(ResolvableType type, boolean includeNonSingletons, boolean allowEagerInit) {
        List<String> result = new ArrayList<>();

        // Check all bean definitions.
        for (String beanName : this.beanDefinitionNames) {
            // Only consider bean as eligible if the bean name
            // is not defined as alias for some other bean.
            if (!isAlias(beanName)) {
                try {
                    RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
                    // Only check bean definition if it is complete.
                    if (!mbd.isAbstract() && (allowEagerInit ||
                            (mbd.hasBeanClass() || !mbd.isLazyInit() || isAllowEagerClassLoading()) &&
                                    !requiresEagerInitForType(mbd.getFactoryBeanName()))) {
                        // In case of FactoryBean, match object created by FactoryBean.
                        boolean isFactoryBean = isFactoryBean(beanName, mbd);
                        BeanDefinitionHolder dbd = mbd.getDecoratedDefinition();
                        boolean matchFound =
                                (allowEagerInit || !isFactoryBean ||
                                        (dbd != null && !mbd.isLazyInit()) || containsSingleton(beanName)) &&
                                (includeNonSingletons ||
                                        (dbd != null ? mbd.isSingleton() : isSingleton(beanName))) &&
                                isTypeMatch(beanName, type);
                        if (!matchFound && isFactoryBean) {
                            // In case of FactoryBean, try to match FactoryBean instance itself next.
                            beanName = FACTORY_BEAN_PREFIX + beanName;
                            matchFound = (includeNonSingletons || mbd.isSingleton()) && isTypeMatch(beanName, type);
                        }
                        if (matchFound) {
                            result.add(beanName);
                        }
                    }
                }
                catch (CannotLoadBeanClassException ex) {
                    if (allowEagerInit) {
                        throw ex;
                    }
                    onSuppressedException(ex);
                }
                catch (BeanDefinitionStoreException ex) {
                    if (allowEagerInit) {
                        throw ex;
                    }
                    onSuppressedException(ex);
                }
            }
        }

        // Check manually registered singletons too.
        for (String beanName : this.manualSingletonNames) {
            try {
                // In case of FactoryBean, match object created by FactoryBean.
                if (isFactoryBean(beanName)) {
                    if ((includeNonSingletons || isSingleton(beanName)) && isTypeMatch(beanName, type)) {
                        result.add(beanName);
                        // Match found for this bean: do not match FactoryBean itself anymore.
                        continue;
                    }
                    // In case of FactoryBean, try to match FactoryBean itself next.
                    beanName = FACTORY_BEAN_PREFIX + beanName;
                }
                // Match raw bean instance (might be raw FactoryBean).
                if (isTypeMatch(beanName, type)) {
                    result.add(beanName);
                }
            }
            catch (NoSuchBeanDefinitionException ex) {
            }
        }

        return StringUtils.toStringArray(result);
    }
```

1. 遍历当前BeanFactory的beanDefinitionNames缓存，这个缓存里存储了所有的BeanName，这里只处理非alias的BeanName：
    1. 获取RootBeanDefinition
    2. 校验获取到的bd是否complete，需要满足下面所有条件
        1. 非抽象类
        2. 满足下列所有条件
            1. 满足下列条件之一
                - 允许EagerInit
                - 满足下列条件之一
                    - bd已经解析出BeanClass
                    - bd非懒加载
                    - beanFactory允许饿汉式加载Class
            2. 不需要EagerInit(Bean不是未初始化完成的FactoryBean)
    3. 判断类型是否匹配到,需要满足下列所有条件：
        1. 下列条件之一
            - 允许EagerInit
            - 非FactoryBean
            - bd内部的decoratedDefinition非空或者bd非懒加载
            - 当前BeanFactory已经初始化完成beanName对应的bean
        2. 下列条件之一
            - 在非单例里查找
            - 只查找单例且Bean确实是单例
        3. BeanFactory内部此BeanName对应的Bean实例与目标ResolvableType匹配：
            1. 对于FactoryBean，校验的是FactoryBean获取的Object的类型是否与ResolvableType匹配
            2. 是否匹配，调用的是ResolvableType的isAssignableFrom方法，实际是ClassUtils.isAssignable方法
    4. 如果上一步没有匹配到而且是FactoryBean，那么试试匹配FactoryBean本身类型是否是目标类型
    5. 如果第3，4步匹配到了，则把当前迭代的BeanName放入最终返回的结果数组里
2. 遍历当前BeanFactory的manualSingletonName缓存，这个缓存里存储了所有的BeanName，这里只处理非alias的BeanName：
    1. 如果是工厂类，判断FactoryBean和其创建的对象是否类型匹配
    2. 如果不是，直接判断是否类型匹配
    3. 如果第1，2步匹配到了，则把当前迭代的BeanName放入最终返回的结果数组里

##### 2.2.2.1.2 根据BeanName获取到Bean实例的过程

```java
    public <T> T getBean(String name, @Nullable Class<T> requiredType, @Nullable Object... args)
            throws BeansException {

        return doGetBean(name, requiredType, args, false);
    }
```

到

```java
    protected <T> T doGetBean(final String name, @Nullable final Class<T> requiredType,
            @Nullable final Object[] args, boolean typeCheckOnly) throws BeansException {

        final String beanName = transformedBeanName(name);
        Object bean;

        // Eagerly check singleton cache for manually registered singletons.
        Object sharedInstance = getSingleton(beanName);
        if (sharedInstance != null && args == null) {
            if (logger.isTraceEnabled()) {
                if (isSingletonCurrentlyInCreation(beanName)) {
                    logger.trace("Returning eagerly cached instance of singleton bean '" + beanName +
                            "' that is not fully initialized yet - a consequence of a circular reference");
                }
                else {
                    logger.trace("Returning cached instance of singleton bean '" + beanName + "'");
                }
            }
            bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
        }

        else {
            // Fail if we're already creating this bean instance:
            // We're assumably within a circular reference.
            if (isPrototypeCurrentlyInCreation(beanName)) {
                throw new BeanCurrentlyInCreationException(beanName);
            }

            // Check if bean definition exists in this factory.
            BeanFactory parentBeanFactory = getParentBeanFactory();
            if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
                // Not found -> check parent.
                String nameToLookup = originalBeanName(name);
                if (parentBeanFactory instanceof AbstractBeanFactory) {
                    return ((AbstractBeanFactory) parentBeanFactory).doGetBean(
                            nameToLookup, requiredType, args, typeCheckOnly);
                }
                else if (args != null) {
                    // Delegation to parent with explicit args.
                    return (T) parentBeanFactory.getBean(nameToLookup, args);
                }
                else if (requiredType != null) {
                    // No args -> delegate to standard getBean method.
                    return parentBeanFactory.getBean(nameToLookup, requiredType);
                }
                else {
                    return (T) parentBeanFactory.getBean(nameToLookup);
                }
            }

            if (!typeCheckOnly) {
                markBeanAsCreated(beanName);
            }

            try {
                final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
                checkMergedBeanDefinition(mbd, beanName, args);

                // Guarantee initialization of beans that the current bean depends on.
                String[] dependsOn = mbd.getDependsOn();
                if (dependsOn != null) {
                    for (String dep : dependsOn) {
                        if (isDependent(beanName, dep)) {
                            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                                    "Circular depends-on relationship between '" + beanName + "' and '" + dep + "'");
                        }
                        registerDependentBean(dep, beanName);
                        try {
                            getBean(dep);
                        }
                        catch (NoSuchBeanDefinitionException ex) {
                            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                                    "'" + beanName + "' depends on missing bean '" + dep + "'", ex);
                        }
                    }
                }

                // Create bean instance.
                if (mbd.isSingleton()) {
                    sharedInstance = getSingleton(beanName, () -> {
                        try {
                            return createBean(beanName, mbd, args);
                        }
                        catch (BeansException ex) {
                            // Explicitly remove instance from singleton cache: It might have been put there
                            // eagerly by the creation process, to allow for circular reference resolution.
                            // Also remove any beans that received a temporary reference to the bean.
                            destroySingleton(beanName);
                            throw ex;
                        }
                    });
                    bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
                }

                else if (mbd.isPrototype()) {
                    // It's a prototype -> create a new instance.
                    Object prototypeInstance = null;
                    try {
                        beforePrototypeCreation(beanName);
                        prototypeInstance = createBean(beanName, mbd, args);
                    }
                    finally {
                        afterPrototypeCreation(beanName);
                    }
                    bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
                }

                else {
                    String scopeName = mbd.getScope();
                    final Scope scope = this.scopes.get(scopeName);
                    if (scope == null) {
                        throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
                    }
                    try {
                        Object scopedInstance = scope.get(beanName, () -> {
                            beforePrototypeCreation(beanName);
                            try {
                                return createBean(beanName, mbd, args);
                            }
                            finally {
                                afterPrototypeCreation(beanName);
                            }
                        });
                        bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
                    }
                    catch (IllegalStateException ex) {
                        throw new BeanCreationException(beanName,
                                "Scope '" + scopeName + "' is not active for the current thread; consider " +
                                "defining a scoped proxy for this bean if you intend to refer to it from a singleton",
                                ex);
                    }
                }
            }
            catch (BeansException ex) {
                cleanupAfterBeanCreationFailure(beanName);
                throw ex;
            }
        }

        // Check if required type matches the type of the actual bean instance.
        if (requiredType != null && !requiredType.isInstance(bean)) {
            try {
                T convertedBean = getTypeConverter().convertIfNecessary(bean, requiredType);
                if (convertedBean == null) {
                    throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
                }
                return convertedBean;
            }
            catch (TypeMismatchException ex) {
                if (logger.isTraceEnabled()) {
                    logger.trace("Failed to convert bean '" + name + "' to required type '" +
                            ClassUtils.getQualifiedName(requiredType) + "'", ex);
                }
                throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
            }
        }
        return (T) bean;
    }
```

1. 尝试从singletonObjects或者earlySingletonObjects中获取单例实例
2. 如果第1步获取到bean实例，则调用getObjectForBeanInstance方法将bean实例转换为对象：
    1. 如果不是FactoryBean或者需要获取FactoryBean本身，返回传入的Bean实例
    2. 如果是FactoryBean且需要获取其生产的Object，则：
        1. 尝试从factoryBeanObjectCache中获取已缓存的Object
        2. 尝试从FactoryBean中获取Object
3. 如果第1步未获取到bean实例，则可能当前处于循环引用的过程
    1. 当前BeanFactory不包含对应的bd：递归调用父BeanFactory的各种获取Bean的重载方法获取Bean
    2. 当前BeanFactory包含对应的bd：初始化Bean，调用getObjectForBeanInstance方法将bean实例转换为对象
4. 判断2或者3获取到的bean是否已经是目标类型，如果不是，调用BeanFactory的TypeConverter来进行类型转换
5. 返回bean

##### 2.2.2.1.3 匹配到多个beanName的策略

1. 如果是PrimaryBean，则返回第一个匹配到的BeanName
2. 如果上面没有获取到，则获取最高优先级的BeanName
3. 1，2步应该可以获取到唯一的BeanName，获取对象并返回
