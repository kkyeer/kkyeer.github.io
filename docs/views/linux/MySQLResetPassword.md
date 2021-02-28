---
date: 2018-11-24
categories:
  - Linux
tags:
  - MySQL
publish: true
---

# mysql重置密码

参考[https://www.cnblogs.com/activiti/p/7810166.html](https://www.cnblogs.com/activiti/p/7810166.html)

操作系统为centos7 x64

1、修改 /etc/my.cnf，在 [mysqld] 小节下添加一行：skip-grant-tables=1

这一行配置让 mysqld 启动时不对密码进行验证

2、重启 mysqld 服务：systemctl restart mysqld

3、使用 root 用户登录到 mysql：mysql -u root

4、切换到mysql数据库，更新 user 表：

update user set authentication_string = password('root'), password_expired = 'N', password_last_changed = now() where user = 'root';

在之前的版本中，密码字段的字段名是 password，5.7版本改为了 authentication_string

5、退出 mysql，编辑 /etc/my.cnf 文件，删除 skip-grant-tables=1 的内容

6、重启 mysqld 服务，再用新密码登录即可

另外，MySQL 5.7 在初始安装后（CentOS7 操作系统）会生成随机初始密码，并在 /var/log/mysqld.log 中有记录，可以通过 cat 命令查看，找 password 关键字

找到密码后，在本机以初始密码登录，并且（也只能）通过 alter user 'root'@'localhost' identified by 'root' 命令，修改 root 用户的密码为 root，然后退出，重新以root用户和刚设置的密码进行登录即可.
