---
date: 2023-11-19 21:11:26
categories:
  - Linux
tags:
  - Linux
publish: true
---

# LVM扩容

## LVM基本拓扑

![LVMTopology](https://cdn.jsdelivr.net/gh/kkyeer/picbed/LVMTopology.svg)

LVM构建在物理磁盘的分区之上，分别映射到各种文件系统的路径中

LVM（Logical Volume Manager（逻辑卷管理）的简写）文件系统由PV\VG\LV三层组合而来，其中

1. PV与磁盘分区建立映射关系
2. 多个PV构建成1个VG
3. VG内部有多个LV,分别映射到多个路径

基于以上拓扑，LV的扩容分为几种情况

- 创建新分区
- 创建新的PV
- 从VG的剩余空间扩容LV
- VG剩余空间不足时，将新的PV添加到VG

## 扩容LV

当VG空间足够时，直接扩容LV即可。

首先查看lv的情况:```lvdisplay```

```bash
$ lvdisplay

--- Logical volume ---
LV Path                /dev/abc/swap
LV Name                swap
VG Name                abc
LV UUID                dyZb7i-D1Fm-m9t6-7xW6-VTJb-StU1-e9Vptn
LV Write Access        read/write
LV Creation host, time abc, 2020-07-20 00:48:18 +0800
LV Status              available
# open                 0
LV Size                7.00 GiB
Current LE             1792
Segments               1
Allocation             inherit
Read ahead sectors     auto
- currently set to     256
Block device           253:0

--- Logical volume ---
LV Path                /dev/abc/root
LV Name                root
VG Name                abc
LV UUID                MvicDp-Brid-U9RX-9Uaz-KccO-3VDX-GiuzRH
LV Write Access        read/write
LV Creation host, time abc, 2020-07-20 00:48:18 +0800
LV Status              available
# open                 1
LV Size                255.75 GiB
Current LE             65472
Segments               3
Allocation             inherit
Read ahead sectors     auto
- currently set to     256
Block device           253:1
```

扩容LV:```lvextend```

```bash
使用下面的命令将现有的逻辑卷增加 10GB：

# lvextend -L +10G /dev/mapper/vg01-lv002
Rounding size to boundary between physical extents: 5.90 GiB
Size of logical volume vg01/lv002 changed from 5.00 GiB (1280 extents) to 15.00 GiB (3840 extents).
Logical volume var successfully resized

使用 PE 大小来扩展逻辑卷：
# lvextend -l +2560 /dev/mapper/vg01-lv002

要使用百分比（%）扩展逻辑卷，使用以下命令：
# lvextend -l +40%FREE /dev/mapper/vg01-lv002
```

现在，逻辑卷已经扩展，你需要调整文件系统的大小以扩展逻辑卷内的空间：

对于基于 ext3 和 ext4 的文件系统，运行以下命令：

```bash
# resize2fs /dev/mapper/vg01-lv002
```

对于 xfs 文件系统，使用以下命令：

```bash
# xfs_growfs /dev/mapper/vg01-lv002
```

## 创建新分区

Linux中创建新分区使用```fdisk```命令，参考[CSDN博客](https://blog.csdn.net/hjxloveqsx/article/details/120361799)，基本用法

1. 查看当前磁盘情况

    ```bash
    sudo fdisk -l
    ```

    ```bash
    ## 输出类似
    Disk /dev/sda: 953.87 GiB, 1024209543168 bytes, 2000409264 sectors
    Disk model: WD
    Units: sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    Disklabel type: gpt
    Disk identifier: 5DD86641-3E91-42BB-BB40-46DD08A44BD0

    Device          Start        End   Sectors   Size Type
    /dev/sda1          34      32767     32734    16M Linux filesystem
    /dev/sda2       32768  921399295 921366528 439.3G Linux filesystem
    /dev/sda3  1794013184 1794990079    976896   477M EFI System
    /dev/sda4  1794990080 2000409230 205419151    98G Linux filesystem
    /dev/sda5   921399296 1794013183 872613888 416.1G Linux filesystem
    ```

2. 在指定磁盘执行fdisk命令

    ```bash
    sudo fdisk /dev/[你的磁盘比如sda]
    ```

    ```bash
    Welcome to fdisk (util-linux 2.31.1).
    Changes will remain in memory only, until you decide to write them.
    Be careful before using the write command.

    Command (m for help):
    ```

3. 输入```m```，查看fdisk相关命令

    ```bash
    Command (m for help): m

    Help:

    Generic
    d   delete a partition
    F   list free unpartitioned space
    l   list known partition types
    n   add a new partition
    p   print the partition table
    t   change a partition type
    v   verify the partition table
    i   print information about a partition

    Misc
    m   print this menu
    x   extra functionality (experts only)

    Script
    I   load disk layout from sfdisk script file
    O   dump disk layout to sfdisk script file

    Save & Exit
    w   write table to disk and exit
    q   quit without saving changes

    Create a new label
    g   create a new empty GPT partition table
    G   create a new empty SGI (IRIX) partition table
    o   create a new empty DOS partition table
    s   create a new empty Sun partition table
    ```

4. 输入```p```，打印当前磁盘的分区表

    ```bash
    Command (m for help): m

        Device          Start        End   Sectors   Size Type
    /dev/sda1          34      32767     32734    16M Linux filesystem
    /dev/sda2       32768  921399295 921366528 439.3G Linux filesystem
    /dev/sda3  1794013184 1794990079    976896   477M EFI System
    /dev/sda4  1794990080 2000409230 205419151    98G Linux filesystem
    /dev/sda5   921399296 1794013183 872613888 416.1G Linux filesystem
    ```

5. 输入```F```(大写)，打印当前可分配空间

    ```bash
    Command (m for help): F

    Unpartitioned space /dev/sda: 1007.5 KiB, 1031680 bytes, 2015 sectors
    Units: sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    ```

6. 输入```n```,创建新分区

    ```bash
    Command (m for help): n

    Partition type:
    p   primary (0 primary, 0 extended, 4 free)          注：0个主分区，4个空闲分区
    e   extended                                                         注：扩展分区
    Select (default p): e     注：添加主分区，默认主分区；
    Partition number (1-4, default 1): 3     注：添加分区3，非特殊情况建议默认
    First sector (2048-39843839, default 2048):  注：直接回车，分区的开始位置。非特殊情况建议默认
    Using default value 2048
    Last sector, +sectors or +size{K,M,G} (2099200-209715199, default 209715199): +2G   注：指定分区大小，用+2G来指定大小为2G，如果全部使用则直接回车
    ```

7. 目前新分区还未生效，在生效之前执行```p```打印命令最终确认
8. **执行```w```命令写入**，新分区创建完成

    ```bash
    Command (m for help): w
    The partition table has been altered!
    ```

## 创建新PV

将刚才创建的新分区创建为新PV

```bash
pvcreate /dev/sda3[这里是具体的分区所以有数字]
```

完成后查看新创建的pv：```pvdisplay```

```bash
$ pvdisplay
--- Physical volume ---
  PV Name               /dev/sda2
  VG Name               ubuntu-vg
  PV Size               <63.00 GiB / not usable 1.00 MiB
  Allocatable           yes (but full)
  PE Size               4.00 MiB
  Total PE              16127
  Free PE               0
  Allocated PE          16127
  PV UUID               w7V6F0-EWbw-aTyZ-ABCD-yfjk-4Vgj-XqQnhe

--- NEW Physical volume ---
PV Name               /dev/sda3
VG Name
PV Size               10.00 GiB
Allocatable           NO
PE Size               0
Total PE              0
Free PE               0
Allocated PE          0
PV UUID               69d9dd18-36be-ABCD-9ebb-78f05fe3217f
```

## 新创建的PV加入VG

首先查看当前的VG组:```vgdisplay```

```bash
$ vgdisplay

--- Volume group ---
VG Name              vg01
System ID
Format               lvm2
Metadata Areas       2
Metadata Sequence No 1
VG Access            read/write
VG Status            resizable
MAX LV               0
Cur LV               0
Open LV              0
Max PV               0
Cur PV               2
Act PV               2
VG Size              14.99 GiB
PE Size              4.00 MiB
Total PE             3840
Alloc PE / Size      1280 / 4.99
Free PE / Size       2560 / 9.99 GiB
VG UUID              d17e3c31-e2c9-4f11-809c-94a549bc43b7
```

执行扩容动作::```vgextend```

```bash
vgextend vg01 /dev/sda3[pv]
```

## 验证效果

使用 df 命令查看文件系统大小：

```bash
# df -h /lvmtest1
Filesystem Size Used Avail Use% Mounted on
/dev/mapper/vg01-lv002 15360M 34M 15326M 4% /lvmtest1
```

## 参考资料

- [https://zhuanlan.zhihu.com/p/117510501](https://zhuanlan.zhihu.com/p/117510501)
- [https://zhuanlan.zhihu.com/p/261035292](https://zhuanlan.zhihu.com/p/261035292)
- [https://blog.csdn.net/digitalkee/article/details/104227915](https://blog.csdn.net/digitalkee/article/details/104227915)
- [https://blog.csdn.net/m0_38059938/article/details/120458661](https://blog.csdn.net/m0_38059938/article/details/120458661)
