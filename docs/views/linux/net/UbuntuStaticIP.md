---
date: 2022-01-12 14:12:15
categories:
  - Linux
tags:
  - Ubuntu
  - 网卡
publish: true
---

# Ubuntu18.04 server 配置静态IP地址

```shell
sudo vi /etc/netplan/00-installer-config.yaml
sudo netplan try
```

内容参考

```yaml
# This is the network config written by 'subiquity'
network:
  ethernets:
    ens18:
      addresses:
        - "192.168.1.3/20"
        - "240e:aa:bb:cc::4/64"
      gateway4: 192.168.1.1
      gateway6: 240e:aa:bb:cc::1
  version: 2
```


