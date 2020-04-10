---
date: 2020-04-02
categories:
  - dubbo
  - 源码
tag:
  - dubbo
  - 源码
---
# Dubbo源码-命名SPI

## 1. Dubbo SPI

DubboBootStrap作为单例类，在初始化单例时，通过Dubbo特殊的SPI机制初始化了一些Extension实例

### 1.1 加载插件

插件使用ExtensionLoader类的实例进行加载，类似SPI，但是提供了命名机制

1. 每个实例对应一个接口type，会按序在位置通过dubbo自定义的SPI机制进行搜寻并实例化，并缓存到本ExtensionLoader实例中
2. 各种ExtensionLoader实例缓存到本类的静态的缓存map里，key为实现的接口，value为实例列表。
3. **Adaptive实例靠代码生成器编译出来**，实际上是通过class模板生成了一个代理，在代理类中，method实际调用```ExtensionLoader.getExtensionLoader(接口.class).getExtension(extName)```获取到插件实例，并调用其对应method的方法实现。这里的extName是关键，获取逻辑为：
    1. 对应的方法的参数列表中，第一个参数是org.apache.dubbo.common.URL的参数
    2. 如果所有参数均没有URL或其子类的，则直接调用getUrl方法获取URL参数
    3. 调用获取到的url.getProtocol方法获取名称，以其作为extName
4. **Dubbo会自动为实例增加Wrapper包装类**，Dubbo对包装类的定义为：如果一个接口实例有个构造方法，且这个构造方法接收一个同样接口的实例作为参数，其为包装类

#### 1.1.1 加载SPI定义

Dubbo的SPI机制会从配置文件中获取配置，配置文件名为接口全限定名，Dubbo会按下列顺序加载配置文件

1. META-INF/dubbo/internal：尝试包名org.apache开头，然后com.alibaba开头，**dubbo-x.x.x.jar**包中一般包含这个文件
2. META-INF/dubbo/：同样尝试org.apache，com.alibaba
3. META-INF/services/：

配置文件内容是name=实现类全限定名，比如org.apache.dubbo.rpc.Protocol文件

```properties
filter=org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper
listener=org.apache.dubbo.rpc.protocol.ProtocolListenerWrapper
mock=org.apache.dubbo.rpc.support.MockProtocol
dubbo=org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol
```