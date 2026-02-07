---
date: 2026-01-26 15:18:03
categories:
  - Vibe Coding
tags:
  - Vibe Coding
  - opencode
  - claude code
  - ai
publish: true
---

# OpenCode快速配置

## why [opencode](https://opencode.ai)

先前一直用的是Claude Code Cli，配合自己的AI中继提供的三方便宜大碗的模型token，可以兼顾经济性和稳定性。但是最近Claude骚操作不断，最近更是发现自己和小伙伴cli端连接relay的方式被封杀，决定暂时使用opencode作为开源平替应付日常使用，再逐步考查其他工具。

![vibe-coding-arch](https://cdn.jsdelivr.net/gh/kkyeer/picbed/vibe-coding-arch.svg)

## 安装Node.js

首先需要安装Node.js如果没有安装过，建议直接安装nvm，其他方式可以参考[Node.js官网](https://nodejs.org/zh-cn/download)

### nvm 安装

参考[官方文档](https://nvm.uihtm.com/doc/install.html)
对于Windows，需要下载exe文件安装，并配置环境变量。
对于Linux/macOS，直接在命令行(终端、terminal)运行下列命令：

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

安装完成后，在命令行(终端、terminal)运行```nvm --version```命令，如果输出版本号，表明安装完成

```shell
nvm --version # 应该输出版本号：0.40.3

```

### 使用nvm安装nodeJS

nvm支持切换Node.js的版本，对于open code来说，使用最新的lts版本是最优选择，当前安装 24 版本即可

```shell
# 开始安装
nvm install 24
# 切换版本
nvm use 24
# 安装完成后运行下列命令输出node版本号
node -v # 应该输出版本号类似：v24.13.0
```

## 安装配置opencode

### 安装

```shell
# 使用镜像站安装，加速安装过程
npm i -g opencode-ai --registry=https://registry.npmmirror.com
```

opencode默认支持[https://models.dev](https://models.dev)网站中的大模型服务提供商，如果你使用的模型服务不在这个列表里(比如自建new-api服务的场景)，需要自己配置provider需要配置Provider，下面是linux/macOS的配置

### 配置ProviderUrl(第三方模型提供者baseUrl)

1. 创建文件

```shell
# 创建配置文件
touch ~/.config/opencode/opencode.json
```

2. 配置url

注意，下述内容中的```zhipuai```，是你想要用的模型的provider-id（比如GLM-4.7就是zhipuai），取自[https://models.dev](https://models.dev)网站中的provider列(如下图)，你的提供商不在列表里，选择官方的那一行即可。

![modelsdev2](https://cdn.jsdelivr.net/gh/kkyeer/picbed/modelsdev2.png)

使用文本编辑器或者vim等，编辑上面的文件的内容

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "zhipuai": {
      "options": {
        "baseURL": "https://你的三方提供者域名/v1"
      }
    }
  }
}
```

### 配置API key

在任意文件夹命令行打开opencode

```shell
opencode
```

在打开的命令行窗口输入```/connect```，注意**前面的斜杠也要输入**，然后选择相应的提供商和模型，注意如果是三方或者自建的提供商，提供商的名称(models.dev)要跟前面provider对应

![opencode-connect](https://cdn.jsdelivr.net/gh/kkyeer/picbed/opencode-connect.png)

![opencode-connect-provider](https://cdn.jsdelivr.net/gh/kkyeer/picbed/opencode-connect-provider.png)

按提示输入api key,可以愉快的vibe-coding了！

## 切换模型

在命令行输入```/models```可以切换模型，如果对应的提供商需要api-key鉴权(大部分都要)，那么按上面的步骤配置provider和进行```/connect```

## 其他参考资料

- [官网](https://opencode.ai)
- [官网文档](https://opencode.ai/docs)
- [三方中文使用文档](https://opencodeguide.com/zh/docs/intro/)
