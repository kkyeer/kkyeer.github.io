# SpringContext(7)-CachedIntrospectionResults

BeanWrapperImpl对象中会缓存每个Property的PropertyDescriptor以及Bean的相关信息到CachedIntrospectionResults对象中，BeanWrapperImpl调用CachedIntrospectionResults的静态方法forClass来获取CachedIntrospectionResults对象

```java
    static CachedIntrospectionResults forClass(Class<?> beanClass) throws BeansException {
        CachedIntrospectionResults results = strongClassCache.get(beanClass);
        if (results != null) {
            return results;
        }
        results = softClassCache.get(beanClass);
        if (results != null) {
            return results;
        }

        results = new CachedIntrospectionResults(beanClass);
        ConcurrentMap<Class<?>, CachedIntrospectionResults> classCacheToUse;

        if (ClassUtils.isCacheSafe(beanClass, CachedIntrospectionResults.class.getClassLoader()) ||
                isClassLoaderAccepted(beanClass.getClassLoader())) {
            classCacheToUse = strongClassCache;
        }
        else {
            classCacheToUse = softClassCache;
        }

        CachedIntrospectionResults existing = classCacheToUse.putIfAbsent(beanClass, results);
        return (existing != null ? existing : results);
    }
```

CachedIntrospectionResults内部维护了两个静态缓存：strongClassCache和softClassCache，均为ConcurrentMap类型，key为Class对象，value为解析出的CachedIntrospectionResults，区别是前者存储强引用，后者是ConcurrentReferenceHashMap类型的Map，存储的弱引用，一个Class满足下列条件中的一种时，存储强引用，否则存储弱引用：

1. Class对象的ClassLoader与CachedIntrospectionResults的ClassLoader相同或者前者是后者的子加载器
2. 上面不符合时，需要Class对象可被CachedIntrospectionResults的ClassLoader加载
3. Class对象的ClassLoader在CachedIntrospectionResults的静态acceptedClassLoaders里

forClass静态方法通过调用构造器private CachedIntrospectionResults(Class<?> beanClass)来初始化新对象：

```java
    private CachedIntrospectionResults(Class<?> beanClass) throws BeansException {
        try {
            this.beanInfo = getBeanInfo(beanClass);
            this.propertyDescriptorCache = new LinkedHashMap<>();

            // This call is slow so we do it once.
            PropertyDescriptor[] pds = this.beanInfo.getPropertyDescriptors();
            for (PropertyDescriptor pd : pds) {
                if (Class.class == beanClass &&
                        ("classLoader".equals(pd.getName()) ||  "protectionDomain".equals(pd.getName()))) {
                    // Ignore Class.getClassLoader() and getProtectionDomain() methods - nobody needs to bind to those
                    continue;
                }
                pd = buildGenericTypeAwarePropertyDescriptor(beanClass, pd);
                this.propertyDescriptorCache.put(pd.getName(), pd);
            }

            // Explicitly check implemented interfaces for setter/getter methods as well,
            // in particular for Java 8 default methods...
            Class<?> currClass = beanClass;
            while (currClass != null && currClass != Object.class) {
                introspectInterfaces(beanClass, currClass);
                currClass = currClass.getSuperclass();
            }

            this.typeDescriptorCache = new ConcurrentReferenceHashMap<>();
        }
        catch (IntrospectionException ex) {
            throw new FatalBeanException("Failed to obtain BeanInfo for class [" + beanClass.getName() + "]", ex);
        }
    }
```

1. 调用getBeanInfo(beanClass)结果放入新CachedIntrospectionResults实例的beanInfo属性中
2. 调用beanInfo属性的getPropertyDescriptors()方法获取所有的PropertyDescriptor构成的数组
3. 迭代每个PropertyDescriptor对象，对其调用buildGenericTypeAwarePropertyDescriptor方法进行解析，解析后将PropertyDescriptor放入新CachedIntrospectionResults实例的propertyDescriptorCache缓存中
4. 递归检查Class的继承链，解析可能有的接口的default方法(Since Java 8)
5. 初始化typeDescriptorCache

## 1.1 Class到BeanInfo：getBeanInfo方法

```java
    private static BeanInfo getBeanInfo(Class<?> beanClass) throws IntrospectionException {
        for (BeanInfoFactory beanInfoFactory : beanInfoFactories) {
            BeanInfo beanInfo = beanInfoFactory.getBeanInfo(beanClass);
            if (beanInfo != null) {
                return beanInfo;
            }
        }
        return (shouldIntrospectorIgnoreBeaninfoClasses ?
                Introspector.getBeanInfo(beanClass, Introspector.IGNORE_ALL_BEANINFO) :
                Introspector.getBeanInfo(beanClass));
    }
```

1. 遍历beanInfoFactories，解析Class对象来获取BeanInfo，如果获取成功则返回获取的BeanInfo
2. 如果第一步未获取到，则根据shouldIntrospectorIgnoreBeaninfoClasses属性（可以在初始化时定义"spring.beaninfo.ignore"参数来修改，），调用Introspector类的getBeanInfo方法获取BeanInfo

### 1.1.1 beanInfoFactory及其getBeanInfo方法

beanInfoFactories：在CachedIntrospectionResults类加载时调用```SpringFactoriesLoader.loadFactories(BeanInfoFactory.class, CachedIntrospectionResults.class.getClassLoader())```方法来加载，这个方法会扫描所有Classpath（包括Jar包）下定义的**META-INF/spring.factories**文件，解析内部所有的factoryClassName-factoryName对，通过使用LinkedMultiValueMap（每个key对应一个LinkedList），将factoryClassName对应的factoryName全部存储到LinkedList中，初始化实例后排序并返回

由于spring-beans的jar包下有定义META-INF/spring.factories文件，且内部有定义BeanInfoFactory：```org.springframework.beans.BeanInfoFactory=org.springframework.beans.ExtendedBeanInfoFactory```，因此实际上至少会调用到ExtendedBeanInfoFactory的getBeanInfo方法：

```java
    @Override
    @Nullable
    public BeanInfo getBeanInfo(Class<?> beanClass) throws IntrospectionException {
        return (supports(beanClass) ? new ExtendedBeanInfo(Introspector.getBeanInfo(beanClass)) : null);
    }
```

1. 调用supports方法，判断是否满足此Factory应用的条件：beanClass是否有定义或者继承返回的beanProperty或者setter方法
2. 如果上述为真，则调用Instrospector的getBeanInfo方法来获取BeanInfo，并包裹到ExtendedBeanInfo对象中返回，否则返回null，交由调用者处理

#### 1.1.1.1 ExtendedBeanInfoFactory的suppoorts判断

```java
    /**
     * Return whether the given bean class declares or inherits any non-void
     * returning bean property or indexed property setter methods.
     */
    private boolean supports(Class<?> beanClass) {
        for (Method method : beanClass.getMethods()) {
            if (ExtendedBeanInfo.isCandidateWriteMethod(method)) {
                return true;
            }
        }
        return false;
    }
```

其中对Method的判断如下：

```java
    public static boolean isCandidateWriteMethod(Method method) {
        String methodName = method.getName();
        Class<?>[] parameterTypes = method.getParameterTypes();
        int nParams = parameterTypes.length;
        return (methodName.length() > 3 && methodName.startsWith("set") && Modifier.isPublic(method.getModifiers()) &&
                (!void.class.isAssignableFrom(method.getReturnType()) || Modifier.isStatic(method.getModifiers())) &&
                (nParams == 1 || (nParams == 2 && int.class == parameterTypes[0])));
    }
```

要求方法必须满足下面的所有条件，才算可能的write方法

1. 方法名为setX形式
2. 方法是public
3. 方法返回值为非void或者是static方法
4. 只有一个参数或两个参数但第一个参数为int型

一般来说，定义JavaBean的时候，set方法返回值均为void，不符合第三点，因此返回false

### 1.1.2 Introspector类的getBeanInfo方法

Instrospector类是rt.jar包中提供的工具类，调用时，先查看ThreadGroupContext的beanInfoCache是否已有BeanInfo被缓存，否则构造一个新的Introspector实例```new Introspector(beanClass, null, USE_ALL_BEANINFO).getBeanInfo()```，并调用新实例的getBeanInfo方法，如果当前类有父类，则优先构造父类的BeanInfo（这是个接口，实际上返回的是GenericBeanInfo对象），具体的获取BeanInfo的方法参考JDK实现

## 1.2. 调用beanInfo属性的getPropertyDescriptors()方法获取所有的PropertyDescriptor构成的数组

具体参考JDK中java.beans包中Introspector的内部类GenericBeanInfo的实现

## 1.3. buildGenericTypeAwarePropertyDescriptor

尝试把PropertyDescriptor的属性解构，存入GenericTypeAwarePropertyDescriptor对象中：```new GenericTypeAwarePropertyDescriptor(beanClass, pd.getName(), pd.getReadMethod(),pd.getWriteMethod(), pd.getPropertyEditorClass())```

GenericTypeAwarePropertyDescriptor对应的构造方法为

```java
    public GenericTypeAwarePropertyDescriptor(Class<?> beanClass, String propertyName,
            @Nullable Method readMethod, @Nullable Method writeMethod, Class<?> propertyEditorClass)
            throws IntrospectionException {

        super(propertyName, null, null);
        this.beanClass = beanClass;

        Method readMethodToUse = (readMethod != null ? BridgeMethodResolver.findBridgedMethod(readMethod) : null);
        Method writeMethodToUse = (writeMethod != null ? BridgeMethodResolver.findBridgedMethod(writeMethod) : null);
        if (writeMethodToUse == null && readMethodToUse != null) {
            // Fallback: Original JavaBeans introspection might not have found matching setter
            // method due to lack of bridge method resolution, in case of the getter using a
            // covariant return type whereas the setter is defined for the concrete property type.
            Method candidate = ClassUtils.getMethodIfAvailable(
                    this.beanClass, "set" + StringUtils.capitalize(getName()), (Class<?>[]) null);
            if (candidate != null && candidate.getParameterCount() == 1) {
                writeMethodToUse = candidate;
            }
        }
        this.readMethod = readMethodToUse;
        this.writeMethod = writeMethodToUse;

        if (this.writeMethod != null) {
            if (this.readMethod == null) {
                // Write method not matched against read method: potentially ambiguous through
                // several overloaded variants, in which case an arbitrary winner has been chosen
                // by the JDK's JavaBeans Introspector...
                Set<Method> ambiguousCandidates = new HashSet<>();
                for (Method method : beanClass.getMethods()) {
                    if (method.getName().equals(writeMethodToUse.getName()) &&
                            !method.equals(writeMethodToUse) && !method.isBridge() &&
                            method.getParameterCount() == writeMethodToUse.getParameterCount()) {
                        ambiguousCandidates.add(method);
                    }
                }
                if (!ambiguousCandidates.isEmpty()) {
                    this.ambiguousWriteMethods = ambiguousCandidates;
                }
            }
            this.writeMethodParameter = new MethodParameter(this.writeMethod, 0);
            GenericTypeResolver.resolveParameterType(this.writeMethodParameter, this.beanClass);
        }

        if (this.readMethod != null) {
            this.propertyType = GenericTypeResolver.resolveReturnType(this.readMethod, this.beanClass);
        }
        else if (this.writeMethodParameter != null) {
            this.propertyType = this.writeMethodParameter.getParameterType();
        }

        this.propertyEditorClass = propertyEditorClass;
    }
```

1. 调用父类的构造器，初始化当前的PD的Name，初始化readMethod和writeMethod，先置为null
2. 判断readMethod是否为null，不为null的话，调用BridgeMethodResolver来解析实际的readMethod
3. 判断writeMethod是否为null，不为null的话，调用BridgeMethodResolver来解析实际的writeMethod
4. 如果解析出来发现有readMethod，但是没有writeMethod，有可能是set方法使用了实际的类型，调用ClassUtils.getMethodIfAvailable方法获取可能的备用writeMethod
5. 将上面解析出的readMethod和WriteMethod赋值给当前的PropertyDescriptor实例
6. 根据readMethod的返回值类型或者writeMethod的参数判断propertyType并赋值
