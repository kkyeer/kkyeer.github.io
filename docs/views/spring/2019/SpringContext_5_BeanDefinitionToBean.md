---
date: 2019-10-02
categories:
  - Spring
tag:
  - Spring
  - Context
  - XmlContext
  - 源码
publish: true
---
# SpringContext(5)-BeanDefinition对象初始化为Bean

在完成了Environment等必要的bean的创建后，AbstractBeanFactory开始调用doGetBean方法来进行具体的bean创建过程:

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


1. 获取bean的beanName```final String beanName = transformedBeanName(name);```，主要是去掉入参的name前可能有的FactoryBean的&，然后把别名转换成唯一的beanName
2. bean初始化的过程，可以细分为以下几种情况：
    1. 如果有eagerly cached的实例，且args为空
    2. beanDefinition存储在parentBeanFactory
    3. beanDefinition存储在当前BeanFactory的情况，表明需由this进行bean的初始化，则
        1. 合并并校验BeanDefinition
        2. 初始化BeanDefinition中dependsOn属性定义的bean
        3. 根据不同的scope调用不同的策略进行创建
            1. 且scope为默认或者Singleton
            2. 且scope为"prototype"
            3. 且scope为其他类型
3. 校验生成的bean跟指定的requiredType是否match，如果不match，则调用TypeConverter转换

对于第2步中各种情况的过程详细解析如下：

## 1.1 如果有eagerly cached的实例，且args为空

```java
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
```

在这种情况下，调用```protected Object getObjectForBeanInstance(Object beanInstance, String name, String beanName, @Nullable RootBeanDefinition mbd)```方法来获取bean实例，其中第二个参数name可能包含FactoryBean的"&"开头，第三个是去掉以后的name，具体过程如下

1. 校验bean名称，如果为"&"开头，且缓存的实例是NullBean，则直接返回调用时传入的beanInstance，否则校验FactoryBean
2. 如果需要的是FactoryBean本身，即name以"&"开头，则返回实例
3. 如果需要的是FactoryBean创建的实例，即name不以"&"开头，首先获取缓存getCachedObjectForFactoryBean中存储的Object，如果为空则调用getObjectFromFactoryBean方法来获取bean实例对象

### 1.1.1 从FactoryBean获取对象

实际调用的是FactoryBeanRegistrySupport的```protected Object getObjectFromFactoryBean(FactoryBean<?> factory, String beanName, boolean shouldPostProcess)```方法，过程如下：

```java
    /**
     * Obtain an object to expose from the given FactoryBean.
     * @param factory the FactoryBean instance
     * @param beanName the name of the bean
     * @param shouldPostProcess whether the bean is subject to post-processing
     * @return the object obtained from the FactoryBean
     * @throws BeanCreationException if FactoryBean object creation failed
     * @see org.springframework.beans.factory.FactoryBean#getObject()
     */
    protected Object getObjectFromFactoryBean(FactoryBean<?> factory, String beanName, boolean shouldPostProcess) {
        if (factory.isSingleton() && containsSingleton(beanName)) {
            synchronized (getSingletonMutex()) {
                Object object = this.factoryBeanObjectCache.get(beanName);
                if (object == null) {
                    object = doGetObjectFromFactoryBean(factory, beanName);
                    // Only post-process and store if not put there already during getObject() call above
                    // (e.g. because of circular reference processing triggered by custom getBean calls)
                    Object alreadyThere = this.factoryBeanObjectCache.get(beanName);
                    if (alreadyThere != null) {
                        object = alreadyThere;
                    }
                    else {
                        if (shouldPostProcess) {
                            if (isSingletonCurrentlyInCreation(beanName)) {
                                // Temporarily return non-post-processed object, not storing it yet..
                                return object;
                            }
                            beforeSingletonCreation(beanName);
                            try {
                                object = postProcessObjectFromFactoryBean(object, beanName);
                            }
                            catch (Throwable ex) {
                                throw new BeanCreationException(beanName,
                                        "Post-processing of FactoryBean's singleton object failed", ex);
                            }
                            finally {
                                afterSingletonCreation(beanName);
                            }
                        }
                        if (containsSingleton(beanName)) {
                            this.factoryBeanObjectCache.put(beanName, object);
                        }
                    }
                }
                return object;
            }
        }
        else {
            Object object = doGetObjectFromFactoryBean(factory, beanName);
            if (shouldPostProcess) {
                try {
                    object = postProcessObjectFromFactoryBean(object, beanName);
                }
                catch (Throwable ex) {
                    throw new BeanCreationException(beanName, "Post-processing of FactoryBean's object failed", ex);
                }
            }
            return object;
        }
    }
```

1. 如果factoryBean是单例的且beanName对应的bean已经存在BeanFactory的singletonObjects内，那么
    1. 尝试从缓存factoryBeanObjectCache中获取实例，如果缓存中有，返回获取的实例
    2. 如果缓存中没有，则调用```private Object doGetObjectFromFactoryBean(final FactoryBean<?> factory, final String beanName)```方法获取实例，该方法会调用factoryBean的getObject()方法获取实例，注意如果getObject()方法返回null，会被包裹为NullBean实例，该方法并不会将实例放入缓存
    3. 上述方法执行完成后，检查缓存，如果此时缓存中有了，说明有其他getBean过程创建了实例，那么放弃刚刚创建的实例，直接返回缓存内的实例
    4. 如果需要执行postProcess过程（shouldPostProcess为true），那么在控制并发创建的前提下，顺序执行beforeSingletonCreation(beanName);object = postProcessObjectFromFactoryBean(object, beanName);afterSingletonCreation(beanName);过程，然后放入缓存并返回
2. 如果factoryBean不是单例的或beanName对应的bean不存在BeanFactory的singletonObjects内，则直接调用```private Object doGetObjectFromFactoryBean(final FactoryBean<?> factory, final String beanName)```方法获取实例，postProcess后返回获取的实例

## 1.2 beanDefinition存储在parentBeanFactory的情况

    ```java
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
    ```

根据调用的方法不同，调用对应的parentBeanFactory的getBean方法，返回调用结果

## 1.3. beanDefinition存储在当前BeanFactory的情况

### 1.3.1. 合并并校验BeanDefinition

    ```java
        final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
        checkMergedBeanDefinition(mbd, beanName, args);
    ```

### 1.3.2. 初始化BeanDefinition中dependsOn属性定义的bean

    ```java
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
    ```

### 1.3.3. 根据不同的scope调用不同的策略进行创建

#### 1.3.3.1. 默认或"singleton"

AbstractBeanFacory内关于获取Singleton类型bean的代码如下

```java
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
```

主要过程如下

1. 调用getSingleton方法，传入的参数1是beanName，第二个是ObjectFactory\<T>类型的Lambda表达式，内部封装了获取bean的实例的方法
2. 调用getObjectForBeanInstance获取最终的bean

##### 1.3.3.1.1 获取单例bean：getSingleton(String beanName, ObjectFactory<?> singletonFactory)

这实际上是AbstractBeanFactory的父类DefaultSingletonBeanRegistry的方法：

```java
    public Object getSingleton(String beanName, ObjectFactory<?> singletonFactory) {
        Assert.notNull(beanName, "Bean name must not be null");
        synchronized (this.singletonObjects) {
            Object singletonObject = this.singletonObjects.get(beanName);
            if (singletonObject == null) {
                if (this.singletonsCurrentlyInDestruction) {
                    throw new BeanCreationNotAllowedException(beanName,
                            "Singleton bean creation not allowed while singletons of this factory are in destruction " +
                            "(Do not request a bean from a BeanFactory in a destroy method implementation!)");
                }
                if (logger.isDebugEnabled()) {
                    logger.debug("Creating shared instance of singleton bean '" + beanName + "'");
                }
                beforeSingletonCreation(beanName);
                boolean newSingleton = false;
                boolean recordSuppressedExceptions = (this.suppressedExceptions == null);
                if (recordSuppressedExceptions) {
                    this.suppressedExceptions = new LinkedHashSet<>();
                }
                try {
                    singletonObject = singletonFactory.getObject();
                    newSingleton = true;
                }
                catch (IllegalStateException ex) {
                    // Has the singleton object implicitly appeared in the meantime ->
                    // if yes, proceed with it since the exception indicates that state.
                    singletonObject = this.singletonObjects.get(beanName);
                    if (singletonObject == null) {
                        throw ex;
                    }
                }
                catch (BeanCreationException ex) {
                    if (recordSuppressedExceptions) {
                        for (Exception suppressedException : this.suppressedExceptions) {
                            ex.addRelatedCause(suppressedException);
                        }
                    }
                    throw ex;
                }
                finally {
                    if (recordSuppressedExceptions) {
                        this.suppressedExceptions = null;
                    }
                    afterSingletonCreation(beanName);
                }
                if (newSingleton) {
                    addSingleton(beanName, singletonObject);
                }
            }
            return singletonObject;
        }
    }
```

此方法内进行单例方法的创建，使用存储singleton对象的this.singletonObjects对象作为同步锁，具体过程如下：

1. 确认this.singletonObjects里没有实例，否则直接返回已创建好的实例
2. 确保当前没有在销毁Singleton阶段(this.singletonsCurrentlyInDestruction作为flag字段),如果是则报错
3. 检查beanName对应的inCreationg状态:```!this.inCreationCheckExclusions.contains(beanName) && !this.singletonsCurrentlyInCreation.add(beanName)```，两个容器均为存储当前正在创建的singletonBean的beanName的set，任一个存在则表明此beanName对应的bean已在创建，则报错
4. 调用传入的ObjectFactory\<T>类型的Lambda表达式，获取单例对象，传入的Lambda表达式中，调用的是AbstractAutowireCapableBeanFactory的createBean方法，这个方法是整个bean创建过程的核心方法，过程参见[createBean的过程](./XmlContext_6_CreateBean.md)，并且newSingleton这个flag属性置为true
5. afterSingleton创建过程：确保当前bean正在创建，然后移除”正在创建"状态
6. 将创建好的Bean放入BeanRegistry的对应缓存中，同时移除中间态的缓存：
    1. this.singletonObjects.put(beanName, singletonObject);
    2. this.singletonFactories.remove(beanName);
    3. this.earlySingletonObjects.remove(beanName);
    4. this.registeredSingletons.add(beanName);

至此，初步的单例Bean创建完成

##### 1.3.3.1.2 调用getObjectForBeanInstance获取最终的bean

子类AbstractAutowireCapableBeanFactory的逻辑：

```java
    @Override
    protected Object getObjectForBeanInstance( Object beanInstance, String name, String beanName, @Nullable RootBeanDefinition mbd) {

        String currentlyCreatedBean = this.currentlyCreatedBean.get();
        if (currentlyCreatedBean != null) {
            registerDependentBean(beanName, currentlyCreatedBean);
        }

        return super.getObjectForBeanInstance(beanInstance, name, beanName, mbd);
    }
```

父类AbstractBeanFactory的实现：

```java
    protected Object getObjectForBeanInstance(
            Object beanInstance, String name, String beanName, @Nullable RootBeanDefinition mbd) {

        // Don't let calling code try to dereference the factory if the bean isn't a factory.
        if (BeanFactoryUtils.isFactoryDereference(name)) {
            if (beanInstance instanceof NullBean) {
                return beanInstance;
            }
            if (!(beanInstance instanceof FactoryBean)) {
                throw new BeanIsNotAFactoryException(beanName, beanInstance.getClass());
            }
        }

        // Now we have the bean instance, which may be a normal bean or a FactoryBean.
        // If it's a FactoryBean, we use it to create a bean instance, unless the
        // caller actually wants a reference to the factory.
        if (!(beanInstance instanceof FactoryBean) || BeanFactoryUtils.isFactoryDereference(name)) {
            return beanInstance;
        }

        Object object = null;
        if (mbd == null) {
            object = getCachedObjectForFactoryBean(beanName);
        }
        if (object == null) {
            // Return bean instance from factory.
            FactoryBean<?> factory = (FactoryBean<?>) beanInstance;
            // Caches object obtained from FactoryBean if it is a singleton.
            if (mbd == null && containsBeanDefinition(beanName)) {
                mbd = getMergedLocalBeanDefinition(beanName);
            }
            boolean synthetic = (mbd != null && mbd.isSynthetic());
            object = getObjectFromFactoryBean(factory, beanName, !synthetic);
        }
        return object;
    }
```

如果是需要FactoryBean本身或者压根不是FactoryBean，则返回Bean实例，否则调用getObjectFromFactoryBean方法，从FactoryBean中获取Bean实例返回

#### 1.3.3.2. "prototype"

#### 1.3.3.3. "prototype"
