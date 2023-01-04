---
date: 2022-11-13 16:37:09
categories:
  - Spring
tags:
  - Transaction
publish: true
---

# SpringTransaction第一篇-代理扫描与组装

SpringTx为开发者提供了声明式和注解时声明的支持，为了更好理解Spring在底层具体做了什么实现了各种复杂的机制，对过程的探究是必要的。而SpringTx底层依赖SpringAOP机制与实现，因此第一步先研究SpringAOP的扫描、组装过程

## 启动时扫描与代理组装

![SequenceDiagram](https://cdn.jsdelivr.net/gh/kkyeer/picbed/spring-tx-simple.svg)

### BeanPostProcessor

Spring启动时，在组装bean的过程中（具体是Bean初始化后），会扫描上下文的**BeanPostProcessor**并执行，其中包含SpringAOP包提供的```org.springframework.aop.framework.autoproxy.InfrastructureAdvisorAutoProxyCreator```，这个类(的父类)会负责后续的SpringAOP相关的代理对象的创建

![20221206140716](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20221206140716.png)

![InfrastructureAdvisorAutoProxyCreator](https://cdn.jsdelivr.net/gh/kkyeer/picbed/InfrastructureAdvisorAutoProxyCreator.svg)

实际的执行逻辑在上述类的父类```org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator```的```wrapIfNecessary```方法中，在具体研究代码之前，先看看SpringAOP中的几个重要角色和概念

- Advice:指的的AOP中具体要执行的动作
- Advisor:Advice的包装类和驱动器，存储Advice对象

```Java
/**
    * Wrap the given bean if necessary, i.e. if it is eligible for being proxied.
    * @param bean the raw bean instance
    * @param beanName the name of the bean
    * @param cacheKey the cache key for metadata access
    * @return a proxy wrapping the bean, or the raw bean instance as-is
    */
protected Object wrapIfNecessary(Object bean, String beanName, Object cacheKey) {
    // 1. 校验是否需要代理，不需要的话，直接返回原Bean实例，过程略
    // 开始创建代理
    // 2. 查找Advice和Advisor
    Object[] specificInterceptors = getAdvicesAndAdvisorsForBean(bean.getClass(), beanName, null);
    if (specificInterceptors != DO_NOT_PROXY) {
        this.advisedBeans.put(cacheKey, Boolean.TRUE);
        // 3. 生成代理增强类
        Object proxy = createProxy(
                bean.getClass(), beanName, specificInterceptors, new SingletonTargetSource(bean));
        this.proxyTypes.put(cacheKey, proxy.getClass());
        // 4. 返回增强后的Bean给Spring上下文
        return proxy;
    }

    this.advisedBeans.put(cacheKey, Boolean.FALSE);
    return bean;
}
```

### 扫描Advisor

org.springframework.aop.framework.autoproxy.BeanFactoryAdvisorRetrievalHelper#findAdvisorBeans

```Java
public List<Advisor> findAdvisorBeans() {
    // 第一次扫描完成后会保存到缓存中
    String[] advisorNames = this.cachedAdvisorBeanNames;
    if (advisorNames == null) {
        // 底层是BeanFactory的按类型扫描，扫描org.springframework.aop.Advisor类型的Bean
        advisorNames = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(
                this.beanFactory, Advisor.class, true, false);
        this.cachedAdvisorBeanNames = advisorNames;
    }
    if (advisorNames.length == 0) {
        return new ArrayList<>();
    }

    List<Advisor> advisors = new ArrayList<>();
    for (String name : advisorNames) {
        // 这是简化后的代码，略过了校验和控制
        advisors.add(this.beanFactory.getBean(name, Advisor.class));
    }
    return advisors;
}
```

其中会扫描到```org.springframework.transaction.interceptor.BeanFactoryTransactionAttributeSourceAdvisor```，在这个类中封装了事务与AOP需要用到的组件和方法，包括Pointcut,Advice等，在获取到Advisor后，还需要判断当前是否适用此Advisor
![findAdvisorThatCanApply2](https://cdn.jsdelivr.net/gh/kkyeer/picbed/findAdvisorThatCanApply2.svg)

org.springframework.aop.support.AopUtils#findAdvisorsThatCanApply  ->
org.springframework.aop.support.AopUtils#canApply(org.springframework.aop.Pointcut, java.lang.Class<?>, boolean) ->
org.springframework.transaction.interceptor.TransactionAttributeSourcePointcut#matches ->
org.springframework.transaction.interceptor.AbstractFallbackTransactionAttributeSource#computeTransactionAttribute

```Java
@Nullable
protected TransactionAttribute computeTransactionAttribute(Method method, @Nullable Class<?> targetClass) {
    // 这里规定只允许Public方法可以代理
    if (this.allowPublicMethodsOnly() && !Modifier.isPublic(method.getModifiers())) {
        return null;
    } else {
        Method specificMethod = AopUtils.getMostSpecificMethod(method, targetClass);
        // 遍历方法签名上的注解，抽取@Transactional注解属性
        TransactionAttribute txAttr = this.findTransactionAttribute(specificMethod);
        if (txAttr != null) {
            return txAttr;
        } else {
            txAttr = this.findTransactionAttribute(specificMethod.getDeclaringClass());
            // 略过部分
            return txAttr;
        }
    }
}
```

### 生成代理后的类

> ProxyFactory的初始化：这个类中存储了后续实际生成代理中需要的配置项等

```org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator#createProxy```

```Java
protected Object createProxy(Class<?> beanClass, @Nullable String beanName,
        @Nullable Object[] specificInterceptors, TargetSource targetSource) {
    // 在Bean定义中存储代理前的原始类Class
    if (this.beanFactory instanceof ConfigurableListableBeanFactory) {
        AutoProxyUtils.exposeTargetClass((ConfigurableListableBeanFactory) this.beanFactory, beanName, beanClass);
    }

    ProxyFactory proxyFactory = new ProxyFactory();
    proxyFactory.copyFrom(this);

    // 处理BeanClass是Interface或者Lambda表达式的情况，略
    if (proxyFactory.isProxyTargetClass()) {
        // ...
    } else {
        // ...
    }

    // proxyFactory的处理
    Advisor[] advisors = buildAdvisors(beanName, specificInterceptors);
    proxyFactory.addAdvisors(advisors);
    proxyFactory.setTargetSource(targetSource);
    customizeProxyFactory(proxyFactory);

    proxyFactory.setFrozen(this.freezeProxy);
    if (advisorsPreFiltered()) {
        proxyFactory.setPreFiltered(true);
    }

    // ClassLoader
    ClassLoader classLoader = getProxyClassLoader();
    if (classLoader instanceof SmartClassLoader && classLoader != beanClass.getClassLoader()) {
        classLoader = ((SmartClassLoader) classLoader).getOriginalClassLoader();
    }
    return proxyFactory.getProxy(classLoader);
}

```

> 根据情况判断代理类型: JDK代理或者SpringObjenesis代理（CglibAopProxy的子类）

```Java
@Override
public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {
    if (!NativeDetector.inNativeImage() &&
            (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config))) {
        Class<?> targetClass = config.getTargetClass();
        if (targetClass == null) {
            throw new AopConfigException("TargetSource cannot determine target class: " +
                    "Either an interface or a target is required for proxy creation.");
        }
        if (targetClass.isInterface() || Proxy.isProxyClass(targetClass) || ClassUtils.isLambdaClass(targetClass)) {
            return new JdkDynamicAopProxy(config);
        }
        return new ObjenesisCglibAopProxy(config);
    }
    else {
        return new JdkDynamicAopProxy(config);
    }
}
```

> 代理类生成

```Java
@Override
public Object getProxy(@Nullable ClassLoader classLoader) {
    try {
        Class<?> rootClass = this.advised.getTargetClass();
        Class<?> proxySuperClass = rootClass;
        // 被CGLIB代理过，则在proxyFactory对象记一下
        if (rootClass.getName().contains(ClassUtils.CGLIB_CLASS_SEPARATOR)) {
            proxySuperClass = rootClass.getSuperclass();
            Class<?>[] additionalInterfaces = rootClass.getInterfaces();
            for (Class<?> additionalInterface : additionalInterfaces) {
                this.advised.addInterface(additionalInterface);
            }
        }

        // 校验与检查
        validateClassIfNecessary(proxySuperClass, classLoader);

        // Configure CGLIB Enhancer...
        Enhancer enhancer = createEnhancer();
        if (classLoader != null) {
            enhancer.setClassLoader(classLoader);
            if (classLoader instanceof SmartClassLoader &&
                    ((SmartClassLoader) classLoader).isClassReloadable(proxySuperClass)) {
                enhancer.setUseCache(false);
            }
        }
        enhancer.setSuperclass(proxySuperClass);
        enhancer.setInterfaces(AopProxyUtils.completeProxiedInterfaces(this.advised));
        enhancer.setNamingPolicy(SpringNamingPolicy.INSTANCE);
        enhancer.setStrategy(new ClassLoaderAwareGeneratorStrategy(classLoader));

        Callback[] callbacks = getCallbacks(rootClass);
        Class<?>[] types = new Class<?>[callbacks.length];
        for (int x = 0; x < types.length; x++) {
            types[x] = callbacks[x].getClass();
        }
        // fixedInterceptorMap only populated at this point, after getCallbacks call above
        enhancer.setCallbackFilter(new ProxyCallbackFilter(
                this.advised.getConfigurationOnlyCopy(), this.fixedInterceptorMap, this.fixedInterceptorOffset));
        enhancer.setCallbackTypes(types);

        // Generate the proxy class and create a proxy instance.
        return createProxyClassAndInstance(enhancer, callbacks);
    }
    catch (CodeGenerationException | IllegalArgumentException ex) {...}
    catch (Throwable ex) {...}
}
```

这里核心在Callbacks：

```Java
Callback[] mainCallbacks = new Callback[] {
        aopInterceptor,  // for normal advice
        targetInterceptor,  // invoke target without considering advice, if optimized
        new SerializableNoOp(),  // no override for methods mapped to this
        targetDispatcher, this.advisedDispatcher,
        new EqualsInterceptor(this.advised),
        new HashCodeInterceptor(this.advised)
};
```

> Proxy底层

```org.springframework.aop.framework.CglibAopProxy.DynamicAdvisedInterceptor```

```Java
public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
    Object oldProxy = null;
    boolean setProxyContext = false;
    Object target = null;
    TargetSource targetSource = this.advised.getTargetSource();
    try {
        // 被代理的原对象
        target = targetSource.getTarget();
        Class<?> targetClass = (target != null ? target.getClass() : null);
        List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
        Object retVal;
        if (chain.isEmpty() && CglibMethodInvocation.isMethodProxyCompatible(method)) {
            Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
            retVal = invokeMethod(target, method, argsToUse, methodProxy);
        }
        else {
            // We need to create a method invocation...
            retVal = new CglibMethodInvocation(proxy, target, method, args, targetClass, chain, methodProxy).proceed();
        }
        retVal = processReturnType(proxy, target, method, retVal);
        return retVal;
    }
    finally {
        if (target != null && !targetSource.isStatic()) {
            targetSource.releaseTarget(target);
        }
        if (setProxyContext) {
            AopContext.setCurrentProxy(oldProxy);
        }
    }
}
```

## 事务注解失效

### 同方法调用，外层没有Transactional，内层即使调用的目标为public方法，且内层方法有Transactional注解，事务也会失效

```Java
@RestController
@RequestMapping("/demo")
@Slf4j
public class DemoController {
    
    @Autowired
    @Lazy
    private DemoController demoController;

    @GetMapping("/failByInnerInvoke")
    public String failByInnerInvoke() throws Exception {
        // 这里调用的是this，根据AOP的实现底层原理，this指的是最原始的对象，未被代理，意味着不会走到代理逻辑（也即不会被增强）
        myControllerLogic();
        return "fail";
    }

    @GetMapping("/successByBeanInjection")
    public String successByBeanInjection() throws Exception {
        // 这里调用的是经过代理增强后的对象，在调用此方法前会先调用AOP代理方法
        demoController.myControllerLogic();
        return "success";
    }
}
```

注意下面图里，注入的对象和this之间的Class区别

![20230101161902](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20230101161902.png)

## SpringTx时序

下一章更新SpringTx具体的内部逻辑，包含TransactionAttribute等的实现

![transactionInner](https://cdn.jsdelivr.net/gh/kkyeer/picbed/transactionInner.svg)
