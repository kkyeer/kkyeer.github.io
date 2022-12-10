---
date: 2022-12-10 11:00:26
categories:
  - IDEA
tags:
  - 
publish: false
---

# IDEA插件开发学习笔记

## 初始化步骤

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

- [官方Code Sample](https://github.com/JetBrains/intellij-sdk-code-samples)
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
- 因为用的是JavaFrame，所以需要改动依赖变为IDEA专属，参考[官方资料](https://plugins.jetbrains.com/docs/intellij/plugin-compatibility.html#exploring-module-and-plugin-apis)
  - plugin.xml的配置修改:depends改为```<depends>com.intellij.java</depends>```
  - gradle.properties的配置新增:```platformPlugins =com.intellij.java```
- runIDE
