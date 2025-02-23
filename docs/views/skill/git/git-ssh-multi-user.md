---
date: 2025-02-23 10:52:19
categories:
  - 知识&技巧
tags:
  - git
  - ssh
publish: true
---

# git仓库使用指定私钥

[全文引用](https://zhuanlan.zhihu.com/p/684059388)

当不同的git库需要使用不同的private key的时候，可在运行git命令的时候指定私钥 private key。

## 使用SSH配置文件

我们可以通过SSH配置文件来指定在git clone过程中使用特定的私钥。

具体来说，我们可以在~/.ssh/config文件中为不同的私钥创建两个单独的主机。然后，在git clone期间，根据我们想要使用的密钥，我们可以在SSH连接字符串中指定不同的主机。

如：

```shell
 cat ~/.ssh/config
 Host github-work
     HostName github.com
     IdentityFile ~/.ssh/id_rsa_work
 ​
 Host github-personal
     HostName github.com
     IdentityFile ~/.ssh/id_rsa_personal
```

现在，可以通过id_rsa_work私钥访问的存储库上运行git clone命令，我们可以使用github-work作为其主机来指定SSH连接字符串。

如：

```shell
 git clone git@github-work:corporateA/webapp.git
 git clone git@github-personal:bob/blog.git
```

## 使用core.sshCommand

Git仓库提供了一个可配置的选项core.sshCommand。当运行任何需要SSH隧道的命令时，此配置将覆盖默认的SSH命令。

配置 core.sshCommand

```git clone -c "core.sshCommand=ssh -i ~/.ssh/id_rsa_work" <git@github.com>:corporateA/webapp.git```
以上例子中，使用-c选项在运行时覆盖core.sshCommand。具体来说，我们使用-i选项将SSH命令更改为指向我们想要使用的私钥。

在存储库级别上持久化core.sshCommand

我们可以使用git config命令将配置覆盖持久化到存储库级别，而不是每次重复配置覆盖

```git config core.sshCommand "ssh -i ~/.ssh/id_rsa_work"```

该命令将core.sshCommand配置持久化到仓库中。这意味着Git将在后续的调用中使用该SSH命令。

可以使用以下命令验证是否配置成功

```shell
 $ git config --get core.sshCommand
 ssh -i ~/.ssh/id_rsa_work
```
