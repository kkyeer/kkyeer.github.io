---
date: 2020-04-13
categories:
  - Dubbo
tags:
  - Dubbo
  - 源码
description: JDK的SPI机制允许在打包的时候，通过META-INF下的配置文件来切换某接口不同的实现，但是一般认为这种动态切换发生在打包过程，程序运行前。Dubbo在此基础上进行了扩展，以方便打包，并提供运行时的动态切换功能。
---
# Dubbo源码-特殊SPI：Extension机制

JDK的SPI机制允许在打包的时候，通过META-INF下的配置文件来切换某接口不同的实现，但是一般认为这种动态切换发生在打包过程，程序运行前。Dubbo在此基础上进行了扩展，以方便打包，并提供运行时的动态切换功能。

## 1. Dubbo Extension

1. 配置：相对于JDK的SPI,Dubbo的Extension支持命名，通过在具体的实现之前指定name来关联相关实现，如实现远程二进制流传输的接口```org.apache.dubbo.remoting.Transporter```，对应的配置文件如下，使用时可以通过```netty3```和```netty4```来切换传输的实现

    ```properties
    netty3=org.apache.dubbo.remoting.transport.netty.NettyTransporter
    netty4=org.apache.dubbo.remoting.transport.netty4.NettyTransporter
    netty=org.apache.dubbo.remoting.transport.netty4.NettyTransporter
    ```

2. 编译期切换：由于一个接口有多种不同的实现被加载，Dubbo在对应的接口上通过注解来配置默认的实现名，如Transporter接口，默认为```netty```即netty4实现

    ```java
    @SPI("netty")
    public interface Transporter {
      ....
    }
    ```

3. 运行时动态切换：对于Dubbo来说，动态切换有多个场景：

    1. 启动时切换，通过本地配置或者配置中心下载到的配置来动态装载，如全局切换Transporter:

        ```properties
        dubbo.protocol.transporter=netty3
        ```

    2. 调用时切换，根据不同的URL动态切换不同的实现，如某个Service的URL指定采用一致性哈希而非默认的random来进行负载均衡，```dubbo://127.0.0.1:28080/service?loadBalance=consistenthash```，调用时应该采用一致性哈希实现来进行负载均衡

Dubbo通过ExtensionLoader静态类来统一管理SPI的加载，并同时支持上述两种不同的场景

## 2. 加载SPI配置

ExtensionLoader第一次被调用时，会加载所有的配置文件，与JDK相同，配置文件名为接口全限定名

```java
    private Map<String, Class<?>> loadExtensionClasses() {
        cacheDefaultExtensionName();

        Map<String, Class<?>> extensionClasses = new HashMap<>();
        // META-INF/dubbo/internal/
        loadDirectory(extensionClasses, DUBBO_INTERNAL_DIRECTORY, type.getName(), true);
        loadDirectory(extensionClasses, DUBBO_INTERNAL_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"), true);
        // META-INF/dubbo/
        loadDirectory(extensionClasses, DUBBO_DIRECTORY, type.getName());
        loadDirectory(extensionClasses, DUBBO_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"));
        // META-INF/services/
        loadDirectory(extensionClasses,   , type.getName());
        loadDirectory(extensionClasses, SERVICES_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"));
        return extensionClasses;
    }
```

配置文件每行一个实现，格式为：name=实现类全限定名，比如org.apache.dubbo.rpc.Protocol文件：

```properties
...
dubbo=org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol
injvm=org.apache.dubbo.rpc.protocol.injvm.InjvmProtocol
http=org.apache.dubbo.rpc.protocol.http.HttpProtocol
...
```

## 3. 加载实例

Dubbo Extension的主要功能都存在ExtensionLoader类中，此类承担了两部分角色

1. 每个ExtensionLoader实例对应一个接口类型，实例在初始化的时候，缓存了所有的实现列表
2. 作为静态类使用，提供了静态方法来加载和获取接口的动态实现类，内部使用缓存来保存接口->ExtensionLoader实例的映射关系:```ConcurrentMap<Class<?>, ExtensionLoader<?>> EXTENSION_LOADERS```

此类允许通过以下三种方式来获取实例

- 指定name：```public T getExtension(String name)```
- 获取默认实现：```public T getDefaultExtension()```
- 获取动态代理：```public T getAdaptiveExtension()```

1. 命名实现的懒加载：

    ```java
        private T createExtension(String name) {
            Class<?> clazz = getExtensionClasses().get(name);
            if (clazz == null) {
                throw findException(name);
            }
            try {
                T instance = (T) EXTENSION_INSTANCES.get(clazz);
                if (instance == null) {
                    // 通过反射创建实例
                    EXTENSION_INSTANCES.putIfAbsent(clazz, clazz.newInstance());
                    instance = (T) EXTENSION_INSTANCES.get(clazz);
                }
                // 调用set方法进行属性注入
                injectExtension(instance);
                // Wrapper处理
                Set<Class<?>> wrapperClasses = cachedWrapperClasses;
                if (CollectionUtils.isNotEmpty(wrapperClasses)) {
                    for (Class<?> wrapperClass : wrapperClasses) {
                        instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
                    }
                }
                // 调用初始化方法
                initExtension(instance);
                return instance;
            } catch (Throwable t) {
                throw new IllegalStateException("Extension instance (name: " + name + ", class: " +
                        type + ") couldn't be instantiated: " + t.getMessage(), t);
            }
        }
    ```

    其中涉及到Wrapper注入，Dubbo对Wrapper的定义是，如果一个Extension实现类，接口是A，同时有一个构造器，接收一个A类型参数，类似如下结构，则此类为Wrapper类，**所有的Extension实例都会被同类型的Wrapper类自动包裹**：

    ```java
    public ServiceWrapper extends MyService{
      private MyService wrappedObj;
      public ServiceWrapper(MyService wrappedObj){
        this.wrappedObj = wrappedObj;
      }
    }
    ```

2. 默认实现，默认实现即加载接口定义注解里name对应的实现，如Protocol接口默认为"dubbo"：

    ```java
    @SPI("dubbo")
    public interface Protocol {
    }
    ```

3. **AdaptiveExtension**,即允许通过调用时根据参数URL里的不同取值，调用不同的实现的代理实现，具体见下面一章

## 4. 自适应动态代理

Dubbo允许在调用方法（注意这里的方法必须要有```@Adaptive```注解）时根据传入的URL的参数来调用不同的Extension，相关的动态代理由ExtensionLoader的**AdaptiveExtension**机制来实现。创建过程如下：

```java
    private T createAdaptiveExtension() {
        try {
            return injectExtension((T) getAdaptiveExtensionClass().newInstance());
        } catch (Exception e) {
            throw new IllegalStateException("Can't create adaptive extension " + type + ", cause: " + e.getMessage(), e);
        }
    }
```

过程一行代码，简洁明了：

1. 获取Class对象
2. 反射创建实例
3. 注入属性

其中后两步与其他Extension的过程一致，不一样的是第一步获取AdaptiveClass对象的过程，其中Class的代码通过模板生成，通过ClassLoader加载

```java
    private Class<?> createAdaptiveExtensionClass() {
        String code = new AdaptiveClassCodeGenerator(type, cachedDefaultName).generate();
        ClassLoader classLoader = findClassLoader();
        Compiler compiler = ExtensionLoader.getExtensionLoader(Compiler.class).getAdaptiveExtension();
        return compiler.compile(code, classLoader);
    }
```

代码生成，核心在Method方法体的生成过程，核心是从参数列表获取URL对象，并从对象中，根据key来获取对应的实现名，调用具体实现完成：

1. 在Method的参数列表里获取URL参数
    1. 尝试直接获取URL类型的参数
    2. 尝试从各参数里获取get方法返回值为URL类的参数
2. 从URL里获取实际要调用的Extension的Name，如果参数列表有Invocation则调用其相应方法，```protocol```需要做特殊处理
3. 根据获取到的ExtensionName，调用对应实现的方法
4. 生成代码的逻辑如下

    ```java
        private String generateMethodContent(Method method) {
            // 校验方法是否有@Adaptive注解
            Adaptive adaptiveAnnotation = method.getAnnotation(Adaptive.class);
            StringBuilder code = new StringBuilder(512);

            // 尝试在方法的参数列表里获取URL类型的参数，生成对应的获取URL的代码
            int urlTypeIndex = getUrlTypeIndex(method);
            if (urlTypeIndex != -1) {
                // Null Point check
                code.append(generateUrlNullCheck(urlTypeIndex));
            } else {
                // 尝试在方法的参数列表里获取get返回值为URL类型的参数，生成对应的获取URL的代码
                code.append(generateUrlAssignmentIndirectly(method));
            }

            // 候选的ExtensionName列表，如果方法的@Adaptive注解有指定列表，则使用，否则为全部的实现
            String[] value = getMethodAdaptiveValue(adaptiveAnnotation);

            // 判断方法参数里是否有Invocation对象
            boolean hasInvocation = hasInvocationArgument(method);

            // Invocation非空判断代码
            code.append(generateInvocationArgumentNullCheck(method));
            // Ext name获取代码
            code.append(generateExtNameAssignment(value, hasInvocation));
            // Ext name非空判断代码
            code.append(generateExtNameNullCheck(value));

            // Ext对象获取与调用
            code.append(generateExtensionAssignment());
            code.append(generateReturnAndInvocation(method));

            return code.toString();
        }
    ```

5. 生成的代码示例：

```java
package org.apache.dubbo.rpc;

import org.apache.dubbo.common.extension.ExtensionLoader;

public class Protocol$Adaptive implements org.apache.dubbo.rpc.Protocol {
    public void destroy() {
        throw new UnsupportedOperationException("The method public abstract void org.apache.dubbo.rpc.Protocol.destroy() of interface org.apache.dubbo.rpc.Protocol is not adaptive method!");
    }

    public int getDefaultPort() {
        throw new UnsupportedOperationException("The method public abstract int org.apache.dubbo.rpc.Protocol.getDefaultPort() of interface org.apache.dubbo.rpc.Protocol is not adaptive method!");
    }

    public org.apache.dubbo.rpc.Exporter export(org.apache.dubbo.rpc.Invoker arg0) throws org.apache.dubbo.rpc.RpcException {
        if (arg0 == null) throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument == null");
        if (arg0.getUrl() == null)
            throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument getUrl() == null");
        org.apache.dubbo.common.URL url = arg0.getUrl();
        String extName = (url.getProtocol() == null ? "dubbo" : url.getProtocol());
        if (extName == null)
            throw new IllegalStateException("Failed to get extension (org.apache.dubbo.rpc.Protocol) name from url (" + url.toString() + ") use keys([protocol])");
        org.apache.dubbo.rpc.Protocol extension = (org.apache.dubbo.rpc.Protocol) ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.Protocol.class).getExtension(extName);
        return extension.export(arg0);
    }

    public org.apache.dubbo.rpc.Invoker refer(java.lang.Class arg0, org.apache.dubbo.common.URL arg1) throws org.apache.dubbo.rpc.RpcException {
        if (arg1 == null) throw new IllegalArgumentException("url == null");
        org.apache.dubbo.common.URL url = arg1;
        String extName = (url.getProtocol() == null ? "dubbo" : url.getProtocol());
        if (extName == null)
            throw new IllegalStateException("Failed to get extension (org.apache.dubbo.rpc.Protocol) name from url (" + url.toString() + ") use keys([protocol])");
        org.apache.dubbo.rpc.Protocol extension = (org.apache.dubbo.rpc.Protocol) ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.Protocol.class).getExtension(extName);
        return extension.refer(arg0, arg1);
    }

    public java.util.List getServers() {
        throw new UnsupportedOperationException("The method public default java.util.List org.apache.dubbo.rpc.Protocol.getServers() of interface org.apache.dubbo.rpc.Protocol is not adaptive method!");
    }
}
```