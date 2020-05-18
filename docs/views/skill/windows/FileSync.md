---
date: 2019-05-14
categories:
  - Skill
tags:
  - FileSync
publish: true
---

# 使用FreeFileSync自动同步文件夹中的文件

1. 下载安装文件并安装
2. 打开桌面的FreeFileSync
3. 在打开的页面中选中需同步的两个文件夹，点击比较->点击同步，然后文件->另存为批处理xxx.ffs_batch
4. 打开桌面的RealTimeSync，导入刚才另存的ffs_batch文件
5. 设置扫描间隔等，然后另存为ffs_real文件
6. 桌面新建快捷方式，输入以下链接，其中第一部分为RealTimeSync.exe的路径，后面跟一个空格，第二部分为上一步另存的ffs_real文件

    ```shell
    "C:\Program Files\FreeFileSync\RealTimeSync.exe" "C:\Users\kk\Documents\FileSync\SourceCode.ffs_real"
    ```

7. 打开文件浏览器，输入shell:startup进入启动菜单，将刚才的快捷方式拖入
8. 完成，此时会自动同步并且开机启动
