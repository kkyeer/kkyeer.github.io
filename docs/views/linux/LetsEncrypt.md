---
date: 2020-09-12
categories:
  - Linux
tags:
  - Linux
publish: false
---

# Let's Encrypt证书申请

## CentOS安装使用

```shell
sudo yum install certbot python2-certbot-nginx
sudo certbot --nginx
sudo certbot certonly --nginx
echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

## 问题

解决ImportError: 'pyOpenSSL' module missing required functionality. Try upgrading to v0.14 or newer.

```shell
yum install http://cbs.centos.org/kojifiles/packages/pyOpenSSL/16.2.0/3.el7/noarch/python2-pyOpenSSL-16.2.0-3.el7.noarch.rpm
```
