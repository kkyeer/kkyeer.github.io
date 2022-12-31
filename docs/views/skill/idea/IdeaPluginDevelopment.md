---
date: 2022-12-10 11:00:26
categories:
  - IDEA
tags:
  - 插件
publish: true
---

# IDEA插件开发学习

## 初始化插件工程

1. 在GitHub页面使用[官方模板](https://github.com/JetBrains/intellij-platform-plugin-template)创建一个仓库
    ![20221210105755](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20221210105755.png)
2. ```git clone```仓库到本地，使用idea打开
3. 配置Gradle镜像：修改```build.gradle.kts```文件，在20行左右添加如下配置

   ```kotlin
   // Configure project's dependencies
    repositories {
        maven {
            setUrl("https://maven.aliyun.com/repository/public/")
        }
        maven {
            setUrl("https://maven.aliyun.com/repository/spring/")
        }
        mavenCentral()
    }
    ```

4. 新增版本（必需，否则运行报错）：修改```CHANGELOG.md```文件，在最下面新增如下内容

    ```markdown
    ## [1.1.0] - 2019-02-15

    ### Added
    ```

5. 运行，右上角已有现成配置，点击```Run Plugin```即可

## 参考范例

- [官方Code Samples](https://github.com/JetBrains/intellij-sdk-code-samples)
- 首先参考**project_view_pane**项目，结合[官方文档](https://plugins.jetbrains.com/docs/intellij/plugin-extensions.html#declaring-extensions)一起
- 找到官方debugger对应的代码位置：```com.intellij.xdebugger```

## 实现

- 尝试在Debugger窗口加一个按钮，参考**action_basics**
  1. 新建一个类，继承```AnAction```类:```public class ToUmlDebuggerAction extends AnAction{...}```
  2. 在```plugin.xml```文件里配置Action:

      ```xml
      <action>
          <action id="myAction" class="com.kkyeer.debugger.to.uml.ToUmlDebuggerAction" text="My Action" description="My action description"
                  icon="com.kkyeer.debugger.to.uml.icons.SdkIcons.Sdk_default_icon">
              <add-to-group group-id="XDebugger.ToolWindow.LeftToolbar" anchor="last"/>
          </action>
      </actions>
      ```

  3. 尝试获取DebuggerFramesList：参考类```com.intellij.xdebugger.impl.frame.XDebuggerFramesList```
- 因为用的是**Java**Frame，所以需要改动依赖变为IDEA专属，参考[官方资料](https://plugins.jetbrains.com/docs/intellij/plugin-compatibility.html#exploring-module-and-plugin-apis)
  - plugin.xml的配置修改:depends改为```<depends>com.intellij.java</depends>```
  - gradle.properties的配置新增:```platformPlugins =com.intellij.java```
  - runIDE，效果达成![20221211113559](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20221211113559.png)
- 接下来需要考虑时序图生成

## 生成时序图

各种搜索后，准备参考这个插件的代码[SequencePlugin](https://github.com/Vanco/SequencePlugin)，尝试后发现耦合度相当高，抽离需要付出相当大的精力，暂时作为PLAN B。
继续搜索后从[这里](https://rishirajrandive.github.io/uml-parser/)找到灵感，准备使用PlantUML+GraphViz的组合实现，效果参考![https://raw.githubusercontent.com/rishirajrandive/uml-parser/master/images/sequence.png](https://raw.githubusercontent.com/rishirajrandive/uml-parser/master/images/sequence.png)

### PlantUML

[官网](https://plantuml.com)，示例：

```sql
@startuml
participant Participant as Foo
actor       Actor       as Foo1
boundary    Boundary    as Foo2
control     Control     as Foo3
entity      Entity      as Foo4
database    Database    as Foo5
collections Collections as Foo6
queue       Queue       as Foo7
Foo -> Foo1 : To actor 
Foo -> Foo2 : To boundary
Foo -> Foo3 : To control
Foo -> Foo4 : To entity
Foo -> Foo5 : To database
Foo -> Foo6 : To collections
Foo -> Foo7: To queue
@enduml
```

## IDEA展示图片

先使用较简单的弹窗展示图像：<https://plugins.jetbrains.com/docs/intellij/dialog-wrapper.html#dialogwrapper>

Swing默认不支持SVG，解决方案：<https://xmlgraphics.apache.org/batik/>

## 发布插件

1. 补充信息，参考[官方文档](https://plugins.jetbrains.com/docs/intellij/plugin-configuration-file.html#idea-plugin)
   - 注意，插件介绍**不要**配置在plugin.xml中，打包的时候会强制从```README```中读取，配置在```Plugin description```部分后面
2. 签名，根据[官方文档](https://plugins.jetbrains.com/docs/intellij/plugin-signing.html#gradle-intellij-plugin)生成签名，**注意，生成签名后，不要按文档描述将key文件内容复制到环境变量，需要如下改动```build.gradle.kts```文件，并将2个文件路径配置到环境变量**，原因为[环境变量多行文本配置需要特别注意](https://intellij-support.jetbrains.com/hc/en-us/community/posts/4408839632146-Signing-Plugin-always-throws-NullPointerException-pemObject-must-not-be-null)

    ```kotlin
    signPlugin {
        certificateChain.set(File(System.getenv("CERTIFICATE_CHAIN")).readText())
        privateKey.set(File(System.getenv("PRIVATE_KEY")).readText())
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }
    ```

3. 在[官网](https://plugins.jetbrains.com/plugin/add#intellij)登录并上传插件

