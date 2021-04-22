---
date: 2019-05-14
categories:
  - 懂
tags:
  - JAR
publish: true
---

# 替换单独Jar包的某个文件

Java jar 工具来替换。
jar uvf test.jar test.class
这样会直接把test.class 直接添加到jar包的根目录。
jar uvf test.jar com/test/test.class 
这样就可以替换相应目录的class文件了。
这里值得注意的是  test.class 必须放在com/test 文件下，要和jar的路径对应起来。不然会说
没有这个文件或目录。jar 包 和 com 文件夹的上级在同一个目录。
