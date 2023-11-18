---
date: 2023-11-18 21:58:08
categories:
  - 技巧
tags:
  - Windows
publish: true
---

# Windows修改iTunes备份文件夹路径

iTunes默认将iPhone/iPad的备份文件保存在C盘，动辄100G以上的备份对于C盘压力不小，因此希望将备份文件放到数据盘。

iTunes默认未提供此选项，需要使用Windows的软链接来实现，整体思路参考了[知乎上的文章](https://zhuanlan.zhihu.com/p/419358584),略有变化。

1. 找到原备份存储目录，截止本文的2023年11月，目录在```C:\Users\[你的用户名]\AppData\Roaming\Apple Computer\MobileSync```，目录下
2. 删除上述目录已有的所有文件，或者移动到其他位置待软链接完成后再迁移到新的目录
3. 新建目标文件夹，如```E:\iPhoneBackuo```
4. 建立链接，这里一定要使用cmd(powershell不行)，输入```MkLink /J "%AppData%\Apple Computer\MobileSync\Backup" "E:\iPhoneBackup"```，当出现下述提示时表示成功
   1. > 为 C:\Users\[username]\AppData\Roaming\Apple Computer\MobileSync\Backup <<===>> E:\iPhoneBackup 创建的联接
5. 如果第2步有迁移过旧备份文件，则迁移回新的目录
