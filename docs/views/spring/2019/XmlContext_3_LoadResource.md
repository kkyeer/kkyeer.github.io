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
# SpringContext之xml配置(3) new XmlApplicationContext("a-c.xml")过程的refresh()方法:Resource加载中BeanDefinition

在[第二节:规整configLocation成Resource数组](./XmlContext_2_refresh.md)中，在初始化完BeanFactory和XmlBeanDefinitionReader对象后，XmlBeanDefinitionReader对象将每一个configLocation字符串规整为Resource数组完成后，开始遍历获取到的Resource数组，并在每个对象上调用的loadBeanDefinitions(Resource resource)方法来加载BeanDefinition到reader内部的BeanFactory中，代码如下：

```java
    public int loadBeanDefinitions(Resource resource) throws BeanDefinitionStoreException {
        return loadBeanDefinitions(new EncodedResource(resource));
    }
```

调用下面的方法

```java
    public int loadBeanDefinitions(EncodedResource encodedResource) throws BeanDefinitionStoreException {
        Assert.notNull(encodedResource, "EncodedResource must not be null");
        if (logger.isTraceEnabled()) {
            logger.trace("Loading XML bean definitions from " + encodedResource);
        }

        Set<EncodedResource> currentResources = this.resourcesCurrentlyBeingLoaded.get();
        if (currentResources == null) {
            currentResources = new HashSet<>(4);
            this.resourcesCurrentlyBeingLoaded.set(currentResources);
        }
        if (!currentResources.add(encodedResource)) {
            throw new BeanDefinitionStoreException(
                    "Detected cyclic loading of " + encodedResource + " - check your import definitions!");
        }
        try {
            InputStream inputStream = encodedResource.getResource().getInputStream();
            try {
                InputSource inputSource = new InputSource(inputStream);
                if (encodedResource.getEncoding() != null) {
                    inputSource.setEncoding(encodedResource.getEncoding());
                }
                return doLoadBeanDefinitions(inputSource, encodedResource.getResource());
            }
            finally {
                inputStream.close();
            }
        }
        catch (IOException ex) {
            throw new BeanDefinitionStoreException(
                    "IOException parsing XML document from " + encodedResource.getResource(), ex);
        }
        finally {
            currentResources.remove(encodedResource);
            if (currentResources.isEmpty()) {
                this.resourcesCurrentlyBeingLoaded.remove();
            }
        }
    }
```

代码逻辑如下：

1. 判断是当前reader中是否有相同的resource正在加载，如果有说明配置错误，报错
2. 获取resource的inputStream，并包裹成sax类型的InputSource
3. 调用doLoadBeanDefinitions(inputSource, encodedResource.getResource())方法来读取xml文件并加载BeanDefinition

其中第三步的doLoadBeanDefinitions(inputSource, encodedResource.getResource())方法中，先加载xml到Document对象实例中，再调用```public int registerBeanDefinitions(Document doc, Resource resource)```方法进行bean的注册，并处理过程中的异常与打印，后者是核心方法

## 1.1 ClassPathResource获取inputStream

首先，底层调用ClassLoader类中getResource(String name)方法获取文件对应的URL，其内部执行的顺序为：

1. 调用父ClassLoader的getResource(name)的方法，如果返回值不为空则返回
2. 在虚拟机的内置BootStrap ClassLoader里寻找name对应的url，有则返回结果
3. 调用本对象的findResource(name)方法（默认是返回null，可能被子类复写），无论是否返回调用结果

在本例中，实际上是在第三步中，调用当前的UrlClassLoader的方法获取到URL，获取到的URL为file协议，指向项目target/classes目录下的application-context.xml目录，形式上类似"file:/myproject/target/classes/application-context.xml"文件，获取到文件后，通过调用URL类的openConnection方法返回相关的文件流InputStream

## 1.2 XmlBeanDefinitionReader从xml流中加载Bean定义：doLoadBeanDefinitions方法

1. 调用doLoadDocument(inputSource, resource)方法将xml加载为Document对象
2. 调用registerBeanDefinitions(doc, resource)方法，将上一步加载的Document对象作为第一个参数传入来注册Bean定义

当然，无论是文件读取，xml解析，bean定义解析都会碰到各种各样的异常，比如SAX解析异常，bean定义错误，IO异常等，在这个方法中将碰到的所有异常全部包裹为BeanDefinitionStoreException并抛出，下面一步步解析这两步具体的过程

### 1.2.1 xml文件流读取为Document对象

Spring采用SAX方式读取xml配置文件，实际调用的是DefaultDocumentLoader对象的```Document loadDocument(InputSource inputSource,EntityResolver entityResolver,ErrorHandler errorHandler, int validationMode, boolean namespaceAware)throws Exception;```方法，各参数如下：

- entityResolver使用ResourceEntityResolver
- xml校验模式调用XmlValidationModeDetector对象的detectValidationMode方法进行探测，具体策略为假如xml开头有"DOCTYPE"字样证明是DTD校验，没有则为XSD校验，在本例使用的xml配置文件没有"DOCTYPE"字段，因此校验模式为XSD校验
- namespaceAware为false

具体简化为

```java
    DocumentBuilderFactory factory = createDocumentBuilderFactory(validationMode, namespaceAware);
    DocumentBuilder builder = createDocumentBuilder(factory, entityResolver, errorHandler);
    return builder.parse(inputSource);
```

第一步构建DocumentBuilderFactory，第二步构建DocumentBuilder，第三步调用parse方法来加载文件流到Document对象

### 1.2.2 DOM文件解析成beanDefinition

```java
    public int registerBeanDefinitions(Document doc, Resource resource) throws BeanDefinitionStoreException {
        BeanDefinitionDocumentReader documentReader = createBeanDefinitionDocumentReader();
        int countBefore = getRegistry().getBeanDefinitionCount();
        documentReader.registerBeanDefinitions(doc, createReaderContext(resource));
        return getRegistry().getBeanDefinitionCount() - countBefore;
    }
```

第一步初始化了BeanDefinitionDocumentReader类型的对象，在此是DefaultBeanDefinitionDocumentReader类，然后调用其registerBeanDefinitions方法来进行bean的注册，调用完成后通过检查BeanFactory内部Bean的数量变化，返回实际初始化的bean，此方法第二个参数是XmlReaderContext对象，调用的构造函数为

```java
    public XmlReaderContext(
            Resource resource, ProblemReporter problemReporter,
            ReaderEventListener eventListener, SourceExtractor sourceExtractor,
            XmlBeanDefinitionReader reader, NamespaceHandlerResolver namespaceHandlerResolver) {

        super(resource, problemReporter, eventListener, sourceExtractor);
        this.reader = reader;
        this.namespaceHandlerResolver = namespaceHandlerResolver;
    }
```

其中参数：

- problemReporter为FailFastProblemReporter对象，这个类中碰到error和fatal均包裹成BeanDefinitionParsingException并抛出
- eventListener为EmptyReaderEventListener对象，不做任何操作
- sourceExtractor允许自定义如何从定义中提取额外的bean的meta data并存入beanFactory，这里为了节约内存一律不提取
- namespaceHandlerResolver为DefaultNamespaceHandlerResolver对象

#### 1.2.2.1 DefaultBeanDefinitionDocumentReader实例方法：protected void doRegisterBeanDefinitions(Element root)

此方法负责初始化delegate，校验处理profile，并调用方法来处理DOM对象，代码简化如下：

```java
    protected void doRegisterBeanDefinitions(Element root) {
        // <beans>元素的嵌套会导致递归调用，为保证<beans>元素的default-*属性能正确传导，因此对于每个子元素的delegate，
        // 均记录父delegate以便fallback和回溯
        BeanDefinitionParserDelegate parent = this.delegate;
        this.delegate = createDelegate(getReaderContext(), root, parent);

        if (this.delegate.isDefaultNamespace(root)) {
            String profileSpec = root.getAttribute(PROFILE_ATTRIBUTE);
            if (StringUtils.hasText(profileSpec)) {
                String[] specifiedProfiles = StringUtils.tokenizeToStringArray(
                        profileSpec, BeanDefinitionParserDelegate.MULTI_VALUE_ATTRIBUTE_DELIMITERS);
                // We cannot use Profiles.of(...) since profile expressions are not supported
                // in XML config. See SPR-12458 for details.
                if (!getReaderContext().getEnvironment().acceptsProfiles(specifiedProfiles)) {
                    if (logger.isDebugEnabled()) {
                        logger.debug("Skipped XML bean definition file due to specified profiles [" + profileSpec +
                                "] not matching: " + getReaderContext().getResource());
                    }
                    return;
                }
            }
        }

        preProcessXml(root);
        parseBeanDefinitions(root, this.delegate);
        postProcessXml(root);

        this.delegate = parent;
    }
```

处理过程一共5步：

1. 创建delegate并与父delegate合并
2. 校验profile
3. DOM对象前处理：preProcessXml(root)
4. DOM对象解析成BeanDefinition：parseBeanDefinitions(root, this.delegate);
5. DOM对象后处理：preProcessXml(root)

在DefaultBeanDefinitionDocumentReader对象中DOM对象前处理和后处理方法均为空方法体

##### 1.2.2.1.1 创建delegate

调用createDelegate(getReaderContext(), root, parent)方法来创建解析代理，此方法首先初始化BeanDefinitionParserDelegate实例，并将readerContext传入，然后将一些beans元素的默认属性从父节点扩散到当前节点，这些属性列举如下：

```java
    @Nullable
    private String lazyInit;

    @Nullable
    private String merge;

    @Nullable
    private String autowire;

    @Nullable
    private String autowireCandidates;

    @Nullable
    private String initMethod;

    @Nullable
    private String destroyMethod;

    @Nullable
    private Object source;
```

##### 1.2.2.1.2 校验profile

如果当前处理的是默认命名空间，并且根元素有定义profile属性，则判断运行时参数"spring.profiles.active"是否包含当前的profile，如果不包含，则记录并返回，不进行下一步操作

##### 1.2.2.1.3 DOM对象解析成BeanDefinition：preProcessXml(root)

```java
    protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
        if (delegate.isDefaultNamespace(root)) {
            NodeList nl = root.getChildNodes();
            for (int i = 0; i < nl.getLength(); i++) {
                Node node = nl.item(i);
                if (node instanceof Element) {
                    Element ele = (Element) node;
                    if (delegate.isDefaultNamespace(ele)) {
                        parseDefaultElement(ele, delegate);
                    }
                    else {
                        delegate.parseCustomElement(ele);
                    }
                }
            }
        }
        else {
            delegate.parseCustomElement(root);
        }
    }
```

在此方法中，沿传入的root节点遍历DOM树，对于每个节点，判断namespace，如果是Spring的默认命名空间，则沿树向下遍历到类型为Element的叶子节点，调用delegate的parseDefaultElement(ele,delegate)方法，如果某个节点namespace非默认，则调用delegate的parseCustomElement(ele)方法

###### 1.2.2.3.4 parseDefaultElement(ele,delegate)方法

```java
    private void parseDefaultElement(Element ele, BeanDefinitionParserDelegate delegate) {
        if (delegate.nodeNameEquals(ele, IMPORT_ELEMENT)) {
            importBeanDefinitionResource(ele);
        }
        else if (delegate.nodeNameEquals(ele, ALIAS_ELEMENT)) {
            processAliasRegistration(ele);
        }
        else if (delegate.nodeNameEquals(ele, BEAN_ELEMENT)) {
            processBeanDefinition(ele, delegate);
        }
        else if (delegate.nodeNameEquals(ele, NESTED_BEANS_ELEMENT)) {
            // recurse
            doRegisterBeanDefinitions(ele);
        }
    }
```

通过判断DOM节点的name或localname，比对预定义的三种bean类型(import，alias，bean)来调用对应的process方法，如果发现是嵌套的\<beans\>对象，则递归调用doRegisterBeanDefinitions(ele)方法。

对于当前实例，xml定义了一个\<bean>节点，因此调用processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate)方法，此方法的具体加载过程参见[第四节](XmlContext_4_NodeToBeanDefinition.md)

所有节点parse完毕后，由于处理完毕后没有操作，因此，将当前reader的delegate回溯到parent，如此循环到整个DOM树处理完毕，此时，当前Resource处理完毕，计算Resource处理前后beanDefinition数量的变化，返回变化值，此时整个XmlBeanDefinitionReader的loadBeanDefinitions方法执行完成
