---
date: 2024-12-04 13:35:00
categories:
  - Linux
tags:
  - Linux
  - Self Host
publish: true
---

# 命令行申请证书

## 下载acme.sh

参考[教程](https://github.com/acmesh-official/acme.sh/wiki/Install-in-China)

## 配置DNS

以HE为例

在```~/.acme.sh/account.conf```文件中增加下列配置

```conf
export HE_Usernmae='username'
export HE_Password='password'
```

其他服务商见[Github](https://github.com/acmesh-official/acme.sh/wiki/dnsapi)

## 签发

```./acme.sh --issue -d YOUR.com -d '*.YOUR.com' -k ec-256 --dns dns_he --dnssleep 60```

## 安装证书到指定位置

```./acme.sh --install-cert         -d YOUR.com --ecc         --key-file /etc/nginx/ssl/YOUR.com.key         --fullchain-file /etc/nginx/ssl/YOUR.com_fullchain.cer         --reloadcmd "docker restart nginx"```

## 检查CRON表达式是否有效

```./acme.sh --cron```

## 自动更新证书

脚本会把自己添加到crontab里自动运行，不需要额外处理

## 手动更新证书

```shell
# 更新一个证书
acme.sh --renew -d example.com --ecc

# 更新所有证书
acme.sh --renew-all

# 运行 cronjob 来更新证书（可用于检查 cronjob 命令是否正确）
acme.sh --cron
```

## 参考资料

- [使用 acme.sh 签发免费的通配符 SSL 证书](https://blog.dalutou.com/posts/issue-a-free-wildcard-ssl-certificate-with-acme-sh/)
