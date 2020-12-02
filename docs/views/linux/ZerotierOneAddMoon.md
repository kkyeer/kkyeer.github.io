ZeroTier-One搭建moon

https://zhuanlan.zhihu.com/p/123956151

Zerotier可以组建虚拟局域网，并且是P2P直连的，这个可以说是非常爽了，你可以在公司使用微软自带的远程连接直连自己家里边的电脑，访问共享远程控制等。想要P2P访问必须先通过一个中介进行连接，官方的节点在网络高峰期不是很好使，所以最好在vps上建立一个moon节点。

作为Moon服务器不需要具备太强大的CPU性能/内存空间和存储空间，虚拟机、VPS、或者云服务器甚至一个树莓派都行，这里使用的vps是三丰云，可以注册免费使用，免费虚拟主机和云服务器”，给的是1核/1G。


安装配置ZeroTier客户端

执行命令： curl -s https://install.zerotier.com/ | sudo bash

运行完后即安装成功，界面会出现如图，

启动安装好的ZeroTier

执行命令：sudo systemctl start zerotier-one.service

执行命令：sudo systemctl enable zerotier-one.service

将安装好ZeroTier的加入你事先注册好的ZeroTier虚拟局域网中

执行命令：sudo zerotier-cli join e5cd7a9e1c86361e

此处的e5cd7a9e1c86361e是本人ZeroTier虚拟局域网的ID，请更改为你本人自己的ID

以上两个步骤如果成功会反馈如图

然后去zerotier管理页面，对加入的设备进行打钩

搭建ZeroTier的Moon中转服务器，生成moon配置文件

执行命令：cd /var/lib/zerotier-one/

执行命令：sudo zerotier-idtool initmoon identity.public > moon.json

修改配置文件moon.json，（主要是添加公网IP，公网IP是服务器的IP，9993是zerotier的默认端口，你服务器防火墙上需要开放UDP:9993,否则是连接不上Moon的）修改有两个办法，一个方法a使用vi编辑；一个方法b是使用宝塔面板进行编辑

执行命令：vi moon.json

出现如图，没有，接按界面提示按enter键继续

按 i 键，界面结尾出现如图后可以进行文本编辑，

修改stableEndpoints，如图

此处的111.67.194.236就是公网IP，这你自己服务器的IP地址

按esc键 退出编辑

执行命令： :wq #注意是“ :” 键 “w” 键 “p” 键三个字符


生成签名文件

执行命令：zerotier-idtool genmoon moon.json

执行之后会生产一个000000xxxx.moon的文件，将这个文件通过宝塔面板下载本地，xxxx是随机的如图，记住这个后面要用

将moon节点加入网络。创建moons.d文件夹，并把签名文件移动到文件夹内

执行命令：sudo mkdir moons.d

执行命令：sudo mv 000000448c38987b.moon moons.d/

此处的000000448c38987b.moon是上一步生成的文件名，请改成你自己本人的。

重启中转服务器的 zerotier-one ：

执行命令：sudo systemctl restart zerotier-one
到这里，服务器的moon就配置完成了。

对客户端安装zerotier后，将配置好的moon文件配置到客户端，并重启zerotier完成与moon的连接。

1.配置客户端：

Linux:

使用之前步骤中 moon.json 文件中的 id 值 (10 位的字符串，就是xxxxxx），不知道的话在服务器上执行如下命令可以得到id。

执行命令：grep id /var/lib/zerotier-one/moon.json | head -n 1

然后在客户端机器里执行命令：

执行命令：zerotier-cli orbit ed2c88f24 ed2c88f24

此处的ed2c88f24刚刚在服务器得到的ID值

Windows:

打开服务程序services.msc, 找到服务"ZeroTier One", 并且在属性内找到该服务可执行文件路径,并且在其下建立moons.d文件夹,然后将moon服务器下生成的000xxxx.moon文件,拷贝到此文件夹内..再重启该服务即可(计算机右键管理-找到服务双击打开-找到zerotier one右键重新启动即可)

路径一般是Windows: C:\ProgramData\ZeroTier\One

2.测试是否成功（客户端cmd运行）若有出现你的服务器IP地址,即可证明moon连接成功

执行命令：zerotier-cli listpeers

完成客户端配置

发布于 04-03
局域网
组建局域网
推荐阅读

zerotier简明教程

原文可以在这里看到： zerotier简明教程 - Jiajun的编程随想最近使用zerotier替换了frp来实现内网穿透，zerotier是一个软交换机，使用zerotier可以让多台内网机器组成一个局域网。 首先要安…
heroz...发表于Jiaju...
局域网文件夹共享，除了FTP，还有什么好方案？
局域网文件夹共享，除了FTP，还有什么好方案？
云盒子发表于关于企业私...
免费内网穿透工具，完美实现虚拟局域网的组建—ZeroTier
免费内网穿透工具，完美实现虚拟局域网的组建—ZeroTier
木头分享
树莓派frp内网穿透
树莓派frp内网穿透
希格斯的玻色子
4 条评论
写下你的评论...

    司徒
    司徒06-05
    请问客户端是手机的话要怎么办

鵺NE
鵺NE (作者) 回复司徒06-09
这个还真不知道，看到过别人是通过在手机上进行命令运行，替换手机端的配置文件达到效果，但是这个是知识盲区了
Hance
Hance08-21

最后配置客户端没有Mac的啊？
十拿九稳
十拿九稳11-18

搞定了，我用阿里云弄，速度还不错啊，这个有点SD-WAN的感觉
