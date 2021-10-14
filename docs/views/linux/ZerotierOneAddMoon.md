---
date: 2021-03-18
categories:
  - Linux
tags:
  - Zerotier
publish: true
---
# ZeroTier-One搭建moon节点

[原文链接](https://zhuanlan.zhihu.com/p/123956151)

Zerotier可以组建虚拟局域网，并且是P2P直连的，这个可以说是非常爽了，你可以在公司使用微软自带的远程连接直连自己家里边的电脑，访问共享远程控制等。想要P2P访问必须先通过一个中介进行连接，官方的节点在网络高峰期不是很好使，所以最好在vps上建立一个moon节点。

作为Moon服务器不需要具备太强大的CPU性能/内存空间和存储空间，虚拟机、VPS、或者云服务器甚至一个树莓派都行，这里使用的vps是三丰云，可以注册免费使用，免费虚拟主机和云服务器”，给的是1核/1G。

## 安装配置ZeroTier

```sh
curl -s https://install.zerotier.com | sudo bash

sudo systemctl start zerotier-one.service

sudo systemctl enable zerotier-one.service

# 客户端执行：将安装好ZeroTier的加入你事先注册好的ZeroTier虚拟局域网中

sudo zerotier-cli join asdfasdf
```

此处的asdfasdf是本人ZeroTier虚拟局域网的ID，请更改为你本人自己的network ID

然后去zerotier管理页面，对加入的设备进行打钩

## 搭建Moon中转服务器

### 生成moon.json

```sh
cd /var/lib/zerotier-one/
sudo zerotier-idtool initmoon identity.public > moon.json
```

修改刚刚生成的配置文件moon.json，（主要是添加公网IP，公网IP是服务器的IP，9993是zerotier的默认端口，你服务器防火墙上需要开放UDP:9993,否则是连接不上Moon的）

修改stableEndpoints

```json
{
 "id": "xxxxx",
 "objtype": "world",
 "roots": [
  {
   "identity": "xxxx:0:eeee",
   "stableEndpoints": ["10.10.0.0/9993"]
  }
 ],
 "signingKey": "asdfasdfasdf",
 "signingKey_SECRET": "asdfasdfasdfasd",
 "updatesMustBeSignedBy": "asdfasdfasdf",
 "worldType": "moon"
}
```

此处的10.10.0.0就是公网IP，这你自己服务器的IP地址

### 生成签名文件

```shell
zerotier-idtool genmoon moon.json
```

执行之后会生产一个000000xxxx.moon的文件，将这个文件通过sz下载到本地

### 将moon节点加入网络

创建moons.d文件夹，并把签名文件移动到文件夹内

```shell
cd /var/lib/zerotier-one/
sudo mkdir moons.d
sudo mv 000000xxxxxx.moon moons.d/
```

此处的000000xxxxxx.moon是上一步生成的文件名

### 重启中转服务器的 zerotier-one

```shell
sudo systemctl restart zerotier-one
```

到这里，服务器的moon就配置完成了。

## 客户端配置

对客户端安装zerotier后，将配置好的moon文件配置到客户端，并重启zerotier完成与moon的连接。

### Linux

将之前下载的文件配置到对应路径

```shell
cd /var/lib/zerotier-one/
sudo mkdir moons.d
sudo mv ~/down/000000xxxxxx.moon moons.d/
```

使用之前步骤中 moon.json 文件中的 id 值 (10 位的字符串，就是xxxxxx），不知道的话在moon服务器上执行如下命令可以得到id。

执行命令：grep id /var/lib/zerotier-one/moon.json | head -n 1

然后在客户端机器里执行命令：

执行命令：```zerotier-cli orbit ed2c88f24 ed2c88f24```，**注意，这里id有两次**

此处的ed2c88f24刚刚在服务器里生成moon.json得到的ID值

### Windows

打开服务程序services.msc, 找到服务"ZeroTier One", 并且在属性内找到该服务可执行文件路径,并且在其下建立moons.d文件夹,然后将moon服务器下生成的000xxxx.moon文件,拷贝到此文件夹内..再重启该服务即可(计算机右键管理-找到服务双击打开-找到zerotier one右键重新启动即可)

路径一般是Windows: C:\ProgramData\ZeroTier\One

### MAC OS

路径在```/Library/Application Support/ZeroTier/One/```,其他跟linux无区别

### 测试是否成功

执行命令：zerotier-cli listpeers，若有出现你的服务器IP地址,即可证明moon连接成功

完成客户端配置
