---
date: 2019-04-14
categories:
  - Linux
tags:
  - Nvidia
  - Ubuntu
publish: true
---

# Ubuntu安装Nvidia闭源驱动

## Nvidia 闭源驱动

1. 在驱动安装之初，首先要清除老驱动或者没清除干净的驱动残留:

    ```shell
    sudo apt-get remove --purge nvidia*
    ```

2. 把系统自带的驱动(nouveau)禁用:

    ```shell
    sudo gedit /etc/modprobe.d/blacklist.conf
    ```

    在文件最后追加：

    ``` textfile
    blacklist nouveau
    option nouveau modeset=0
    ```

    保存退出，执行以下命令生效：

    ```shell
    sudo update-initramfs -u
    ```

3. 重启电脑后输入：

    ```shell
    lsmod | grep nouveau
    ```

    没有任何输出说明禁用成功。

驱动安装方法总共有三种：

- 使用标准Ubuntu仓库进行自动化安装
- 使用PPA仓库进行自动化安装
- 使用官方的NVIDIA驱动进行手动安装

### 标准Ubuntu仓库安装(最简单，最推荐)

1. 检测你的NVIDIA显卡型号和推荐的驱动程序的模型。

    ```shell
    ubuntu-drivers devices

    == /sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0 ==
    modalias : pci:v000010DEd00001C8Dsv00001028sd000007E1bc03sc02i00
    vendor   : NVIDIA Corporation
    model    : GP107M [GeForce GTX 1050 Mobile]
    driver   : nvidia-driver-435 - distro non-free
    driver   : nvidia-driver-390 - distro non-free
    driver   : nvidia-driver-440 - distro non-free recommended
    driver   : xserver-xorg-video-nouveau - distro free builtin

    == /sys/devices/pci0000:00/0000:00:1c.5/0000:03:00.0 ==
    modalias : pci:v00008086d00003165sv00008086sd00004410bc02sc80i00
    vendor   : Intel Corporation
    model    : Wireless 3165
    manual_install: True
    driver   : backport-iwlwifi-dkms - distro free
    ```

    从输出结果可以看到，目前系统已关联到Nvidia GeForce GTX 1050显卡，建议安装（recommended）驱动程序是 nvidia-driver-440 版本的驱动。

2. 输入下列命令，重启后安装便可完成。

    >自动安装推荐驱动

    ```shell
    sudo ubuntu-drivers autoinstall
    ```

    >安装指定驱动

    ```shell
    sudo apt install nvidia-driver-390
    ```

3. 输入下列命令，查看驱动是否安装成功。

    ```bash
    nvidia-smi
    Tue Apr 14 19:26:47 2020       
    `+-----------------------------------------------------------------------------+
    | NVIDIA-SMI 440.64       Driver Version: 440.64       CUDA Version: 10.2     |
    |-------------------------------+----------------------+----------------------+
    | GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
    |===============================+======================+======================|
    |   0  GeForce GTX 1050    Off  | 00000000:01:00.0 Off |                  N/A |
    | N/A   48C    P0    N/A /  N/A |    913MiB /  4042MiB |      4%      Default |
    +-------------------------------+----------------------+----------------------+
                                                                                
    +-----------------------------------------------------------------------------+
    | Processes:                                                       GPU Memory |
    |  GPU       PID   Type   Process name                             Usage      |
    |=============================================================================|
    |    0      1147      G   /usr/lib/xorg/Xorg                            59MiB |
    |    0      1863      G   /usr/lib/xorg/Xorg                           358MiB |
    |    0      2099      G   /usr/bin/gnome-shell                         247MiB |
    |    0      5331      G   /usr/lib/firefox/firefox                      19MiB |
    |    0      6076      G   ...AAAAAAAAAAAACAAAAAAAAAA= --shared-files    36MiB |
    |    0     17423      G   ...quest-channel-token=6089203932057713800   143MiB |
    |    0     18275      G   /usr/lib/firefox/firefox                       1MiB |
    |    0     19399      G   ...-token=94C17C841BB41655B0F942E8E683FD26    34MiB |
    +-----------------------------------------------------------------------------+`
    ```

    若出现以上输出，则表明已经安装成功了。
————————————————
版权声明：本文为CSDN博主「DuCeh」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
原文链接：<https://blog.csdn.net/Knight_vae/java/article/details/102009020>
