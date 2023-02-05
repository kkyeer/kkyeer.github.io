(window.webpackJsonp=window.webpackJsonp||[]).push([[73],{597:function(t,a,s){"use strict";s.r(a);var e=s(6),n=Object(e.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"tomcat服务-oom导致异常不自动恢复研究"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#tomcat服务-oom导致异常不自动恢复研究"}},[t._v("#")]),t._v(" Tomcat服务，OOM导致异常不自动恢复研究")]),t._v(" "),s("p",[t._v("某晚，收到同事的告警:“xx服务预发环境挂了，报超时和404错误，"),s("strong",[t._v("来回持续半个小时了")]),t._v("，不像是发布导致的，看下？”")]),t._v(" "),s("p",[t._v("由于是预发环境，且整体影响面不大（只是间歇不可用），有足够的时间慢慢排查，因此暂时没有回滚。")]),t._v(" "),s("blockquote",[s("p",[t._v("服务栈")]),t._v(" "),s("ul",[s("li",[t._v("服务为内部服务，服务间使用OpenFeign作为RPC调用手段，使用SpringBoot+默认Tomcat作为Http服务提供者")]),t._v(" "),s("li",[t._v("使用注册中心进行服务注册发现，使用SpringCloud默认的"),s("code",[t._v("/actuator/health")]),t._v("接口作为健康检查指标")]),t._v(" "),s("li",[t._v("k8s服务整合进程探测，同时与注册中心通信，作为容器健康检查的2个因子，持续3次全部健康检查失败的容器会被销毁并重新拉起（"),s("strong",[t._v("预发环境关闭了这个逻辑")]),t._v("）")])])]),t._v(" "),s("h2",{attrs:{id:"_1-404错误"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-404错误"}},[t._v("#")]),t._v(" 1. 404错误")]),t._v(" "),s("p",[t._v("404错误一般是由于预发环境仅单节点，服务因为FullGC等原因健康检查失败导致被注册中心摘除后，暂时没有服务提供者导致，对于线上环境会快速拉起新容器短暂恢复，对于预发环境一般需要等服务恢复后重新注册，然后又出现问题")]),t._v(" "),s("ul",[s("li",[t._v("查看注册中心事件日志发现确实持续有节点健康检查失败事件")]),t._v(" "),s("li",[t._v("容器内部检查后发现服务进程正常，8080端口正常绑定，但是"),s("code",[t._v("netstat")]),t._v("指令的输出，第2列和第3列与平时貌似不太一样\n"),s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/tcprecvnotempty.png",alt:"tcprecvnotempty"}})]),t._v(" "),s("li",[t._v("经验判断服务出现了某些异常导致健康检查失败，考虑到调用方有较多的超时报错，从此处入手是一个不错的思路")])]),t._v(" "),s("h2",{attrs:{id:"_2-健康检查失败同时调用方超时的一般思路"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-健康检查失败同时调用方超时的一般思路"}},[t._v("#")]),t._v(" 2. 健康检查失败同时调用方超时的一般思路")]),t._v(" "),s("h3",{attrs:{id:"_2-1-rt高时的一般现象"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-rt高时的一般现象"}},[t._v("#")]),t._v(" 2.1 RT高时的一般现象")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/RTHighHealthCheck.png",alt:"RTHighHealthCheck"}})]),t._v(" "),s("p",[t._v("接口调用超时一般分为2种，建连超时（"),s("code",[t._v("connectionTimeout")]),t._v("）和响应发送/读取超时（"),s("code",[t._v("socketReadTimeout")]),t._v("）,按一般经验，当出现某接口RT高时，两者会交替出现")]),t._v(" "),s("ol",[s("li",[s("p",[t._v("最初是接口RT高，调用方报错超时（也有可能不报错，看调用方的容忍度），本服务Tomcat线程堆积")]),t._v(" "),s("ul",[s("li",[t._v("这里与接口RT(ms)，QPS，Tomcat最大线程数3个参数有关，当3者出现如下关系时，会导致Tomcat线程持续堆积，即线程无法即使处理请求并释放到线程池")]),t._v(" "),s("li",[s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/QpsRTThread2.svg",alt:"QpsRTThread2"}})]),t._v(" "),s("li",[t._v("注意这里是假定服务只有一个接口，实际上服务同时有很多接口所以会有所偏差")]),t._v(" "),s("li",[t._v("举例，一般来说Tomcat线程池默认200，假设某接口集群QPS为20000，集群规模50，则单节点承受400QPS压力，此时接口RT至少要保持在 200*1000/400=500ms 以下才可保证线程池始终有可用的线程")])])]),t._v(" "),s("li",[s("p",[t._v("Tomcat线程很快达到最大线程数，线程池没有线程来立即处理请求，此时请求排队进行处理，上游"),s("code",[t._v("socketReadTimeout")]),t._v("超时报错逐渐增多")])]),t._v(" "),s("li",[s("p",[t._v("线程堆积到一定程度，开始拒绝TCP连接，此时上游开始报错"),s("code",[t._v("connectionTimeout")]),t._v("，建立连接失败")])]),t._v(" "),s("li",[s("p",[t._v("与此同时，健康检查调用"),s("code",[t._v("/actuator/health")]),t._v("接口也超时，此时被暂时从注册中心摘除")])]),t._v(" "),s("li",[s("p",[t._v("随着被注册中心摘除，新请求暂时不会调用到问题pod，积压请求处理完成后，pod恢复正常，健康检查成功，重新放入注册中心")])]),t._v(" "),s("li",[s("p",[t._v("由于接口RT仍旧存在问题，如此往复")])])]),t._v(" "),s("h3",{attrs:{id:"_2-2-问题排查与解决"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-问题排查与解决"}},[t._v("#")]),t._v(" 2.2 问题排查与解决")]),t._v(" "),s("blockquote",[s("p",[t._v("一般思路")])]),t._v(" "),s("p",[t._v("根据上面的分析，碰到双超时出现，首先分析接口RT，90%的情况下通过接口监控定位到特别慢的接口，再结合调用链监控或者性能剖析，定位到具体的代码、服务、依赖可解决。")]),t._v(" "),s("blockquote",[s("p",[t._v("问题原因")])]),t._v(" "),s("p",[t._v("但是这次通过接口定位发现所有接口的RT都有大幅上升，排查性能瓶颈与依赖后，发现根本原因是某处请求处理代码，实现时未考虑大数据量的处理，导致出现OOM报错，代码修改后问题解决。")]),t._v(" "),s("blockquote",[s("p",[t._v("延伸")])]),t._v(" "),s("p",[t._v("深入观察发现，问题代码需要某条特殊的响应才会触发（1小时以上才会有1次请求），确实导致了1分钟的FullGC和OOM异常，经验来说，请求处理线程因为OOM报错后，线程销毁，栈上引用消失，最多1次FullGC后，容器会恢复正常响应，但是现象中说超时持续了半小时没有自动恢复，为什么？")]),t._v(" "),s("p",[t._v("详细排查日志后发现，在MQ线程OOM报错的同时，Tomcat有个Acceptor线程同时OOM异常，以往碰到的情况都是exec线程崩溃但会自动恢复，会不会这个线程不一样？\n"),s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/TomcatAcceptorOOM.png",alt:"TomcatAcceptorOOM"}})]),t._v(" "),s("h2",{attrs:{id:"_3-accetpor线程不会自动恢复"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_3-accetpor线程不会自动恢复"}},[t._v("#")]),t._v(" 3. Accetpor线程不会自动恢复")]),t._v(" "),s("h3",{attrs:{id:"_3-1-tomcat线程模型"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_3-1-tomcat线程模型"}},[t._v("#")]),t._v(" 3.1 Tomcat线程模型")]),t._v(" "),s("p",[t._v("Tomcat的核心Acceptor线程在建连后崩溃，但是端口仍旧绑定中，最终的结果是TCP连接可以建立（系统内核处理的部分），但是TCP请求体无法被取回处理（Tomcat的Acceptor线程处理的部分），这个时候需要了解下Tomcat的线程模型(图引用自 "),s("a",{attrs:{href:"https://zhuanlan.zhihu.com/p/555519862",target:"_blank",rel:"noopener noreferrer"}},[t._v("Tomcat线程模型全面解析"),s("OutboundLink")],1),t._v(")，以及线程（池）恢复机制")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/TomcatNioThreadPool.png",alt:"TomcatNioThreadPool"}})]),t._v(" "),s("p",[t._v("以上是模型图，事实上不同的线程初始化的数量是不一致的，线程崩溃后的恢复策略也不一致")]),t._v(" "),s("h3",{attrs:{id:"_3-2-问题模拟与现象观测"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_3-2-问题模拟与现象观测"}},[t._v("#")]),t._v(" 3.2 问题模拟与现象观测")]),t._v(" "),s("p",[t._v("下面是具体的实例，在5分钟左右模拟了一次OOM导致的Acceptor线程崩溃（代码参见"),s("a",{attrs:{href:"https://github.com/kkyeer/lab/tree/explore/oom_kill_tomcat_acceptor",target:"_blank",rel:"noopener noreferrer"}},[t._v("Github"),s("OutboundLink")],1),t._v(")")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/TomcatRunningThread.png",alt:"TomcatRunningThread"}})]),t._v(" "),s("p",[t._v("进一步的观测网络异常栈")]),t._v(" "),s("blockquote",[s("p",[t._v("服务正常\n"),s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/20230205182952.png",alt:"20230205182952"}}),t._v("\nAcceptor线程崩溃\n"),s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/20230205183107.png",alt:"20230205183107"}}),t._v("\n崩溃后新请求进入\n"),s("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/20230205183225.png",alt:"20230205183225"}})])]),t._v(" "),s("p",[t._v("从模型、模拟以及现象观察中可以得出初步结论："),s("strong",[t._v("程序启动时，Acceptor线程只有一个，此线程OOM后没有被恢复，导致新请求阻塞在内核的TCP队列中")])]),t._v(" "),s("h3",{attrs:{id:"_3-3-简单源码剖析"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_3-3-简单源码剖析"}},[t._v("#")]),t._v(" 3.3 简单源码剖析")]),t._v(" "),s("p",[t._v("下述代码为Tomcat启动Acceptor线程的代码，可以看到，只有一个线程，且无异常恢复机制（线程，内部对象均为方法本地变量）")]),t._v(" "),s("div",{staticClass:"language-Java line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// org.apache.tomcat.util.net.AbstractEndpoint#startAcceptorThread")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("protected")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("void")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("startAcceptorThread")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    acceptor "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Acceptor")]),s("span",{pre:!0,attrs:{class:"token generics"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("String")]),t._v(" threadName "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"-Acceptor"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    acceptor"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setThreadName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("threadName"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Thread")]),t._v(" t "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Thread")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("acceptor"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" threadName"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    t"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setPriority")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getAcceptorThreadPriority")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    t"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setDaemon")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getDaemon")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    t"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("start")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br")])]),s("blockquote",[s("p",[t._v("参考")])]),t._v(" "),s("ul",[s("li",[s("a",{attrs:{href:"https://zhuanlan.zhihu.com/p/555519862",target:"_blank",rel:"noopener noreferrer"}},[t._v("Tomcat线程模型全面解析"),s("OutboundLink")],1)]),t._v(" "),s("li",[s("a",{attrs:{href:"http://uniquezhangqi.top/2018/10/27/Tomcat-Tomcat%E6%94%AF%E6%8C%81%E7%9A%84%E5%9B%9B%E7%A7%8D%E7%BA%BF%E7%A8%8B%E6%A8%A1%E5%9E%8B/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Tomcat支持的四种线程模型"),s("OutboundLink")],1)]),t._v(" "),s("li",[s("a",{attrs:{href:"https://www.cnblogs.com/54chensongxia/p/13289174.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("从连接器组件看Tomcat的线程模型——NIO模式"),s("OutboundLink")],1)]),t._v(" "),s("li",[s("a",{attrs:{href:"https://www.jianshu.com/p/be9bf92de667",target:"_blank",rel:"noopener noreferrer"}},[t._v("Tomcat 网络处理线程模型"),s("OutboundLink")],1)])])])}),[],!1,null,null,null);a.default=n.exports}}]);