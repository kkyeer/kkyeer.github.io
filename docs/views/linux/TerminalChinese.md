---
date: 2022-06-20 12:47:14
categories:
  - Linux
tags:
  - Terminal
publish: true
---

# 终端zsh中文乱码问题解决

```shell
vi ~/.zshrc
# 添加下面2行到文件最后
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
# 然后执行
source ~/.zshrc
```

如果是bash，只需要把上面的```~/.zshrc```改为```~/.bash_profile```即可

参考:[CSDN博客](https://blog.csdn.net/blue_zy/article/details/79855380)
