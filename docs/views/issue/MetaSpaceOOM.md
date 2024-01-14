---
date: 2024-01-14 09:03:45
categories:
  - 疑难问题
tags:
  - JVM
  - 反射
  - 疑难问题
publish: true
---

# 一次OOM问题分析

## 现象

```
1. 观测平台告警：FullGC次数大于阈值，5分钟内大于11次，频次大概1-2周有一次
2. 告警后服务概率性会自动恢复，控制台打印
Exception: java.lang.OutOfMemoryError thrown from the UncaughtExceptionHandler in thread "Thread-17"
Exception: java.lang.OutOfMemoryError thrown from the UncaughtExceptionHandler in thread "SimpleAsyncTaskExecutor-1"
3. 不自动恢复时，服务对应容器会挂掉，需要被kill
```

## 过程

1.  首先查看GC日志，发现FullGC出现在MetaSpace元空间
    
2.  下载FullGC日志分析，暂时未发现线索
    
3.  将堆整体Dump下来，上传[HeapDump](https://memory.console.heapdump.cn)网站分析，在“类加载器”视图发现有大量的`sun.reflect.DelegatingClassLoader`类加载器，且大部分只加载了1个类: `sun.reflect.GeneratedMethodAccessor6036`。
    
    1.  疑问1: `sun.reflect.DelegatingClassLoader`类加载器是做什么的？
    2.  疑问2: 为什么有7000个`DelegatingClassLoader类加载器`类加载器？类加载器有一个不就够了，毕竟是用来加载别的类的。
    3.  疑问3: 为什么类加载器只加载1个类？`sun.reflect.GeneratedMethodAccessor6036`相似的类为什么有7000多个
    4.  疑问4: 为什么这些类加载器的parent类加载器是`org.springframework.boot.loader.LaunchedURLClassLoader`？
    
    解决了上面的上面的3个疑问，对于问题最终的定位应该有极大的帮助
    

![20240114090610](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20240114090610.png)

## 反射与sun.reflect.DelegatingClassLoader

> 按以往所学的双亲委派和Spring的知识，加载器一般只有`BootStrap`，`AppClassLoader`，`ExtClassLoader`，再加上Spring的`LaunchedURLClassLoader`几种，且数量不会太多，毕竟是类**加载器**，有一个能把类加载进VM即可

经过对`DelegatingClassLoader`关键字的检索，大部分网页都提到了反射，参考[简书这篇贴子](https://www.jianshu.com/p/20b7ab284c0a)的方案，结合自己的理解，验证代码如下

```java
public class TestReflection {
    public static class SomePojo{
        private String f1;
        public String getF1() {
            return f1;
        }
    }

    public static void main(String[] args)  throws NoSuchMethodException, InvocationTargetException, IllegalAccessException, InterruptedException{
        Method method = SomePojo.class.getDeclaredMethod("getF1");
        SomePojo target = new SomePojo();
        target.f1 = "aaa";
        for (int i = 0; i < 15; i++) {
            method.invoke(target);
        }
        String result = (String) method.invoke(target);
        System.out.println(result);
    }
}
```

在`sun.reflect.NativeMethodAccessorImpl#invoke`方法里，针对某个方法反射的次数不同有2种方案

1.  反射调用15次及以下的时候，使用字节码编译执行
2.  反射调用15次以上的时候，值得为此构建一个专门的类来调用反射，虽然这低16次会慢，但是后续因为JIT的原因会大大变快

```java
    public Object invoke(Object obj, Object[] args)
        throws IllegalArgumentException, InvocationTargetException
    {
    // 当反射调用次数>阈值15次的时候，会调用new MethodAccessorGenerator().generateMethod方法来实现invoke
        if (++numInvocations > ReflectionFactory.inflationThreshold()
                && !ReflectUtil.isVMAnonymousClass(method.getDeclaringClass())) {
            MethodAccessorImpl acc = (MethodAccessorImpl)
                new MethodAccessorGenerator().
                    generateMethod(method.getDeclaringClass(),
                                   method.getName(),
                                   method.getParameterTypes(),
                                   method.getReturnType(),
                                   method.getExceptionTypes(),
                                   method.getModifiers());
            parent.setDelegate(acc);
        }
    // 当反射调用次数<=阈值15次的时候，使用native的字节码编译执行来实现invoke
        return invoke0(method, obj, args);
    }
```

```
问题就出在多次反射调用的```new MethodAccessorGenerator().generateMethod```方法，此方法内部最终会调用如下代码来生成一个类，可以看到这个类是用一个新创建的```sun.reflect.DelegatingClassLoader```来加载的，这个新的ClassLoader仅用来加载一个class，且父类加载器是**调用者**的类加载器
```

```java
static Class<?> defineClass(String name, byte[] bytes, int off, int len,
                                final ClassLoader parentClassLoader)
    {
        ClassLoader newLoader = AccessController.doPrivileged(
            new PrivilegedAction<ClassLoader>() {
                public ClassLoader run() {
                        return new DelegatingClassLoader(parentClassLoader);
                    }
                });
        return unsafe.defineClass(name, bytes, off, len, newLoader, null);
    }
```

核心代码的时序见下图：

![Sequence_20240104213019](https://cdn.jsdelivr.net/gh/kkyeer/picbed/Sequence_20240104213019.svg)


上面可以解释疑问1和疑问3，疑问2也很简单，既然反射调用的时候会对**每一个方法**来调用上面的逻辑，在POJO很多的服务中，大量应用反射来调用```settter```和```gettter```方法，自然会导致**7000+**的```DelegatingClassLoader```类加载器和对应的```sun.reflect.GeneratedMethodAccessor```


> 1.  疑问1: `sun.reflect.DelegatingClassLoader`类加载器是做什么的？----反射用的
> 2.  疑问2: 为什么有7000个`DelegatingClassLoader类加载器`类加载器？类加载器有一个不就够了，毕竟是用来加载别的类的？----JDK内部实现如此，具体为什么这么实现待确认
> 3.  疑问3: 为什么类加载器只加载1个类？`sun.reflect.GeneratedMethodAccessor6036`相似的类为什么有？----JDK内部实现如此，具体为什么这么实现待挖掘

至此，表面上看是因为代码中反射用的太多导致，下一步是需要定位具体有哪些地方用到了反射，除了MetaSpace的参数修改（线上用-XX:MaxMetaspaceSize=256m 参数限定了最大空间），还需要注意哪些？

> _彩蛋，生成类名的逻辑_

```java
private static synchronized String generateName(boolean isConstructor,
                                                    boolean forSerialization)
    {
        if (isConstructor) {
            if (forSerialization) {
                int num = ++serializationConstructorSymnum;
                return "sun/reflect/GeneratedSerializationConstructorAccessor" + num;
            } else {
                int num = ++constructorSymnum;
                return "sun/reflect/GeneratedConstructorAccessor" + num;
            }
        } else {
            int num = ++methodSymnum;
            return "sun/reflect/GeneratedMethodAccessor" + num; 
            ↑↑↑↑这里就是生成的反射调用类的类名，可以看到有一个数字尾号，是一个全局的自增数字
        }
    }
```

## 疑点2:被`SpringLaunchedURLClassLoader`加载的`DelegatingClassLoader`?

> `DelegatingClassLoader`的父类加载器为调用者的类加载器，当本地调试时，由于IDEA自动解析并把依赖jar包放入classpath,最终所有依赖是App类加载器载入，所以`DelegatingClassLoader`的父类加载器为`sun.misc.Launcher$AppClassLoader`；当生产环境运行时，运行的是Spring打包出的FatJar，依赖也在其中，此时依赖的类（举例：Gson）是由Spring的UrlClassLoader加载，因此反射的父类加载器也为```SpringLaunchedURLClassLoader```

明白了反射的原理后，接下来需要定位导致OOM的原因，有2种可能

1. 第三方SDK等原因导致目标应用加载的类**异常增加**
2. 因为长期滥用反射，导致现有的256M空间不足以支撑业务运行

定位上述原因有多种方案，比如临时扩容元空间，查看内存占用是否会无序增长。在运维修改发布参数的同时，好奇看看生成的`GeneratedMethodAccessor`在堆快照里是否有线索？

考虑到`sun.reflect.GeneratedMethodAccessor6036`类名后缀的4位是自增的，而应用启动越往后生成的越有可能是最终导致OOM的罪魁祸首（也有可能是冲垮大堤的最后一只蚂蚁），因此从类名+后缀4位入手倒着查。  
![20240114090654](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20240114090654.png)

最后的680x这些类，看到一片待回收的对象，抽查后发现类加载器的父类加载器都是 `org.springframework.boot.loader.LaunchedURLClassLoader`  
![20240114090721](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20240114090721.png)

在堆上更进一步的挖掘，没有找到更多有用的信息，考虑使用Arthas的stack命令来监控Spring的哪些位置使用了反射？以及为什么容器运行了7天后还有反射，是invoke的次数少没有达到15次？还是边缘代码路径？

## Arthas trace 

Arthas的使用不是本文的重点，不再赘述，此处仅列举```stack```指令相关内容。

1. 对于有JAVA_TOOL_OPTIONS注入的，外部启动arthas的流程

```shell
unset JAVA_TOOL_OPTIONS
java -jar arthas/arthas-boot.jar
```

2. 进入以后，先选择进程

```console
options unsafe true
stack sun.reflect.MethodAccessorGenerator generateMethod >> stack-monitor-reflect.out &
```

3. 一定要**正常exit**

最后拿到如下输出，Mock如下

```shell
ts=2024-01-10 16:22:32;thread_name=http-nio-8080-exec-1;id=17;is_daemon=true;priority=5;TCCL=org.springframework.boot.web.embedded.tomcat.TomcatEmbeddedWebappClassLoader@3ee0fea4
    @sun.reflect.MethodAccessorGenerator.generateMethod()
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:53)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
		
		↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓关注这里↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        at org.springframework.beans.BeanUtils.copyProperties(BeanUtils.java:821)
        at org.springframework.beans.BeanUtils.copyProperties(BeanUtils.java:719)
        at com.kkyeer.study.spring.controller.DemoController.pingPong2(DemoController.java:32)
		↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
		
        at sun.reflect.NativeMethodAccessorImpl.invoke0(NativeMethodAccessorImpl.java:-2)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
        at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:205)
        at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:150)
        at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:117)
        at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:895)
        at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:808)
        at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87)
        at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1071)
        at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:964)
        at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1006)
        at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:909)
        at javax.servlet.http.HttpServlet.service(HttpServlet.java:696)
        at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:883)
        at javax.servlet.http.HttpServlet.service(HttpServlet.java:779)
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:227)
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162)
        at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:53)
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189)
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162)
        at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100)
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189)
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162)
        at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93)
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189)
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162)
        at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201)
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189)
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162)
        at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:197)
        at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:97)
        at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:541)
        at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:135)
        at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:92)
        at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:78)
        at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:360)
        at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:399)
        at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:65)
        at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:893)
        at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1789)
        at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49)
        at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191)
        at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659)
        at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
        at java.lang.Thread.run(Thread.java:750)
```

从上述arthas采集到的调用栈可以看到，由于```DemoController.pingPong2```内部调用了```BeanUtils.copyProperties```方法，此方法内部使用反射，进一步导致 new DelegatingClassLoader以及类加载，导致MetaSpace的使用量增加。业务代码中有部分同学使用此方法来进行浅拷贝，以完成DTO到VO的转换，这是导致MetaSpace随着迭代快速增加的原因。

类似的还有Spring内部的Jackson反序列化、Gson、FastJson库，均会导致MetaSpace的使用量增加。

## 解决

根据代码的不同类型，确定解决方案

1. 短期方案：MetaSpace上限调整，比如从256M提升到384M
2. 中长期方案：代码优化，降低反射的使用
     - 优化浅拷贝：去除BeanUtils.copyProperties()方法使用，改造成MapStruct等方式进行浅拷贝
     - 优化反序列化：随着业务持续发展，负载持续增加，考虑将部分payload的编码从JSON切换到ProtoBuf，Avro等二进制方案
     - 优化深拷贝：深拷贝在此业务代码中出现比较多，但抽样部分代码CR后发现，前期因为业务快速迭代原因，在部分原本应该是只读对象的业务中出现了少量的属性修改，临时使用深拷贝解决，这种情况需要进行代码优化，保证**只读对象使用引用共享**，而不需要大量拷贝

## 结果

1. 增大MetaSpace空间后，观察1周，暂时没有新的FullGC或者OOM出现，元空间大小稳定在300M左右
2. 代码优化是一个长期的过程，待进一步观察