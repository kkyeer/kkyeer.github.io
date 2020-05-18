---
date: 2019-10-14
categories:
  - Linux
tags:
  - Skill
publish: true
---

# Linux:叹号!使用总结

## 前言

实际上，不起眼的“!”在linux中有着很多让你惊叹的妙用。本文就来细数那些“!”的神奇用法。下面话不多说了，来一起看看详细的介绍吧

[引用](https://www.jb51.net/article/153946.htm)

## 使用

### 执行上一条命令

例如，在执行完上面一条命令后，可以使用下面的方式再次执行上一条命令：

```Shell
whereis bash #执行命令
bash: /bin/bash /etc/bash.bashrc /usr/share/man/man1/bash.1.gz
!!  #再次执行上一条命令
whereis bash
bash: /bin/bash /etc/bash.bashrc /usr/share/man/man1/bash.1.gz
```

!!代表了上一条执行的命令。可以看到，当输入两个感叹号时，它显示上条命令的同时会执行上一条命令。当然了，通常我们还会想到使用“UP”键来完成这个事情。但是如果是基于上条命令扩充，!!就来得更加方便了。
比如，你想查看某个文件，但是忘了输入more：

```Shell
/opt/user/test.txt #忘记输入more
more !! #这样是不是快多了？
```

使用!!是不是方便多了？

### 使用上个命令第一个或最后一个的参数执行命令

使用上条命令最后一个参数
比如，你在使用ls列出目录内容时，没有带任何参数，但是想再次执行，带上-al参数，又不想输入长长的参数，可以使用下面的方式：

```Shell
$ ls /proc/1/task/1/net/tcp
/proc/1/task/1/net/tc
$ ls -al !$
ls -al /proc/1/task/1/net/tcp
-r--r--r-- 1 root root 0 12月 22 17:30 /proc/1/task/1/net/tcp
```

这里的!$代表了上一条命令的最后一个参数。

使用上条命令第一个参数
而使用上条命令的第一个参数只需要使用!^，例如：

```sh
$ ls -al !^
// 输出忽略
```

### 去掉最后一个参数执行上一个命令

如果想执行上条命令，但不想带上最后一个参数：

```Shell
$ ls -al dir #假设dir是一个很长的字符串
$ !:-
$ !!:gs/old/new
ls -al
```

什么场景下可能会用呢？比如你上一条命令最后一个参数是一个长长的字符串，而你恰好不想不用它，并且退格键删除又慢的时候，可以使用上面的方法。

使用上条命令的所有参数
前面说了使用上条命令的最后一个参数，那如果不是最后一个参数，该如何使用呢？很简单，使用!*即可。例如我们在输入find命令输错了，想要纠正的时候：

```Shell
$ fin -name "test.zip" #这里find输错了。
$ find !*
find ./ -name "test.zip"
./workspaces/shell/find/test.zip
./workspaces/shell/test.zip
```

使用上条命令指定的参数
有的读者可能会问了，如果我只想用其中某个参数呢？按照![命令名]:[参数号]的规则即可。例如：

```Shell
$ cp -rf dira dirb/ #将dira拷贝到dirb
$ ls -l !cp:2  #查看dira的内容
ls -l dira
total 0
-rw-rw-r-- 1 hyb hyb 0 12月 22 17:45 testfile
```

当上条命令的参数很长，而你需要取用中间的某个参数时，效果就比较明显了。$ !!:gs/old/new

### 执行history中的命令

我们都知道可以通过history命令可以查看之前执行过的命令，但是如何再次执行history中的命令呢？我们可以通过“UP”键可以查看，但是历史命令很长的时候，并不是很方便，这个时候“!”便派上了用场：

```Shell
$ history
(这里省略更多内容)
2043 touch ./dira/testfile
 2044 cp -rf dira dirb/
 2045 ls -al dira
 2046 ls -l dira
 2047 ls -al dira
 2048 ls -l dira
 2049 ls -al dira
 2050 ls -l dira
 2051 history
```

我们可以看到，history命令出来可以看到之前执行过的命令，也会看到它前面带了一个数值。如果我们想执行前面的cp -rf dira dirb/命令

```Shell
$ !2044 #2044是执行的第n条命令
cp -rf dira dirb/
```

即通过![历史命令数值]的方式执行历史命令。
当然了，如果我们想执行倒数第二条命令，也是有方法的：

```Shell
$ !-2 #感叹号后面跟着一个负数，负几代表倒数第几条
```

### 按照关键字执行历史命令

!可以根据关键字执行命令。

执行上一条以关键字开头的命令
例如，执行上一条find命令：

```Shell
$ !find #执行上条以find开头的命令
```

执行上一条包含关键字的命令
再例如，执行上一条包含name的命令：

```Shell
$ find ./ -name "test"
./test
./find/test
$ !?name?
find ./ -name "test"
./test
./find/test
```

替换上条命令的参数
例如：

```Shell
$ find ./ -name "old*" -a -name "*.zip"
```

如果我们需要将这条命令中的old更换为new：

```Shell
$ !!:gs/old/new

```

### 逻辑非的作用

这个是它最为人所熟悉的作用，例如删除除了cfg结尾以外的所有文件：

```sh
rm !(*.cfg) #删除需谨慎
```

这里就不再详述。
