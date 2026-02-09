---
date: 2026-02-07 18:22:08
categories:
  - Vibe Coding
tags:
  - Vibe Coding
  - acp
publish: true
---

# 鱼和熊掌兼得：ACP协议搭建Vibe Coding环境

一直以来，在我心目中，Vibe Coding工具环境的完美形态是IDE环境和最新的agent功能的完美结合，这个形态需要包含3个方面

1. 保持最新的agent能力，如Open Code类似，支持mcp，支持skill，支持自定义插件，支持自由切换模型
2. 适配各种IDE，比如写Java项目的时候，我希望只打开IDEA就可以完成，而不需要为了ai功能，在**一个项目打开多个代码环境**，比如打开antigravity来修改代码，同时打开IDEA来使用类型和跳转、搜索等能力
3. ai chat框与代码编辑器的深度整合，典型的如代码片段的选择能力，通义灵码插件可以随时框选多段代码片段来放入提示词上下文，而不是在聊天框手搓：“给我修改a.b.c类的m方法”，稍显原始

目前来看，通义灵码插件同时适配VSCode系以及Jetbrains系的IDE,是最接近上述形态的解决方案，唯一的不完美是感觉在agent能力层面稍逊一筹，略微差于Open Code类似的cli方案。

最新读到了[韩骏老师的文](https://zhuanlan.zhihu.com/p/2003423070828912693)，感觉ACP协议有望解决这个问题。

>ACP 解决的是：任何 AI Agent → 任何支持的编辑器

acp协议官网列出了支持的[agent列表](https://agentclientprotocol.com/get-started/agents)和[IDE](https://agentclientprotocol.com/get-started/clients)，对我来说，目前常用的agent是Open Code，IDE是JetBrains系列以及VsCode(目前暂不支持)

## IDEA插件配置

### 下载插件

打开idea的market place，下载```JetBrains AI Assistant```插件.

![download_plugin](https://cdn.jsdelivr.net/gh/kkyeer/picbed/download_plugin.png)

### 配置插件

#### 安装opencode agent插件

在AI 聊天窗口的底部，点击**Install From ACP Registry```
![install-from-acp](https://cdn.jsdelivr.net/gh/kkyeer/picbed/install-from-acp.png)

在打开的窗口中安装对应的agent配置
![select-agent](https://cdn.jsdelivr.net/gh/kkyeer/picbed/select-agent.png)

#### 配置acp.json

在ai chat窗口点击右上角的三个点，在打开的option对话框点击```Add Custom Agent```按钮。

![chat-option](https://cdn.jsdelivr.net/gh/kkyeer/picbed/chat-option.png)
![config-agent1](https://cdn.jsdelivr.net/gh/kkyeer/picbed/config-agent1.png)

会打开acp.json配置文件的编辑窗口，插件自动探测到open code的安装位置，直接点击插入即可

![add-config](https://cdn.jsdelivr.net/gh/kkyeer/picbed/add-config.png)

#### 使用效果

上述配置完成后，在AI 聊天窗口即可选择Open Code，并且支持切换模型，以及在上下文嵌入代码文件引用

![ok](https://cdn.jsdelivr.net/gh/kkyeer/picbed/ok.png)

## 参考资料

- [Jetbrains官方文档](https://www.jetbrains.com/zh-cn/help/ai-assistant/acp.html#acp-troubleshooting)
- [JetBrains IDE 重磅新功能：AI Agent 终于可以像插件一样使用了](https://zhuanlan.zhihu.com/p/2003423070828912693)
