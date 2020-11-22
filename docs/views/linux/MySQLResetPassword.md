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

操作系统为centos7 64

1、修改 /etc/my.cnf，在 [mysqld] 小节下添加一行：skip-grant-tables=1

这一行配置让 mysqld 启动时不对密码进行验证

2、重启 mysqld 服务：systemctl restart mysqld

3、使用 root 用户登录到 mysql：mysql -u root

4、切换到mysql数据库，更新 user 表：

update user set authentication_string = password('root'), password_expired = 'N', password_last_changed = now() where user = 'root';

在之前的版本中，密码字段的字段名是 password，5.7版本改为了 authentication_string
