---
date: 2026-04-10 13:45:51
categories:
  - Linux
tags:
  - Linux
  - Net
publish: true
---

# Acme最快速申请证书（国内版）

## 安装

由于某些原因，直接使用官方的安装方式大概率碰到网络问题，因此使用下面的方案安装，这个方式是来源于[acme官方文档](https://github.com/acmesh-official/acme.sh/wiki/Install-in-China)

```shell
git clone https://gitee.com/neilpang/acme.sh.git
cd acme.sh
./acme.sh --install -m my@example.com
```

> 备注：官方安装方案：```curl https://get.acme.sh | sh -s email=my@example.com```

## 一次性快速申请

这里仅列举dns验证方式，即需要有修改DNS记录的权限，除此之外还可以使用challenge的方式，将来有时间再补充

### 1. 发起证书申请

命令：

```shell
acme.sh --issue -d my.example.com --dns --yes-I-know-dns-manual-mode-enough-go-ahead-please
```

注意，尾部的```--yes-I-know-dns-manual-mode-enough-go-ahead-please```是**必需**的，具体参考[官方说明](https://github.com/acmesh-official/acme.sh/wiki/dns-manual-mode)

输出:

```shell
[Fri Apr 10 01:30:43 PM CST 2026] Using CA: https://acme.zerossl.com/v2/DV90
[Fri Apr 10 01:30:43 PM CST 2026] Account key creation OK.
[Fri Apr 10 01:30:43 PM CST 2026] No EAB credentials found for ZeroSSL, let's obtain them
[Fri Apr 10 01:30:47 PM CST 2026] Registering account: https://acme.zerossl.com/v2/DV90
[Fri Apr 10 01:30:51 PM CST 2026] Registered
[Fri Apr 10 01:30:51 PM CST 2026] ACCOUNT_THUMBPRINT='adfasdfasd'
[Fri Apr 10 01:30:51 PM CST 2026] Creating domain key
[Fri Apr 10 01:30:51 PM CST 2026] The domain key is here: /root/.acme.sh/my.example.com/my.example.com.key
[Fri Apr 10 01:30:51 PM CST 2026] Single domain='my.example.com'
[Fri Apr 10 01:30:56 PM CST 2026] Getting webroot for domain='my.example.com'
[Fri Apr 10 01:30:56 PM CST 2026] Add the following TXT record:
[Fri Apr 10 01:30:56 PM CST 2026] Domain: '_acme-challenge.my.example.com'
[Fri Apr 10 01:30:56 PM CST 2026] TXT value: 'xxxx'
[Fri Apr 10 01:30:56 PM CST 2026] Please make sure to prepend '_acme-challenge.' to your domain
[Fri Apr 10 01:30:56 PM CST 2026] so that the resulting subdomain is: _acme-challenge.my.example.com
[Fri Apr 10 01:30:56 PM CST 2026] Please add the TXT records to the domains, and re-run with --renew.
[Fri Apr 10 01:30:56 PM CST 2026] Please add '--debug' or '--log' to see more information.
[Fri Apr 10 01:30:56 PM CST 2026] See: https://github.com/acmesh-official/acme.sh/wiki/How-to-debug-acme.sh
```

### 2. 修改DNS记录

略

### 3. 刷新获取证书

命令

```shell
acme.sh --issue -d my.example.com --dns --yes-I-know-dns-manual-mode-enough-go-ahead-please --renew
```

输出

```shell
[Fri Apr 10 01:32:38 PM CST 2026] The domain 'my.example.com' seems to already have an ECC cert, let's use it.
[Fri Apr 10 01:32:38 PM CST 2026] Renewing: 'my.example.com'
[Fri Apr 10 01:32:38 PM CST 2026] Renewing using Le_API=https://acme.zerossl.com/v2/DV90
[Fri Apr 10 01:32:40 PM CST 2026] Using CA: https://acme.zerossl.com/v2/DV90
[Fri Apr 10 01:32:40 PM CST 2026] Single domain='my.example.com'
[Fri Apr 10 01:32:40 PM CST 2026] Verifying: my.example.com
[Fri Apr 10 01:32:45 PM CST 2026] Processing. The CA is processing your order, please wait. (1/30)
[Fri Apr 10 01:32:50 PM CST 2026] Success
[Fri Apr 10 01:32:50 PM CST 2026] Verification finished, beginning signing.
[Fri Apr 10 01:32:50 PM CST 2026] Let's finalize the order.
[Fri Apr 10 01:32:50 PM CST 2026] Le_OrderFinalize='https://acme.zerossl.com/v2/DV90/order/__alsjkdhfaklshjdflkasdjf/finalize'
[Fri Apr 10 01:32:53 PM CST 2026] Order status is 'processing', let's sleep and retry.
[Fri Apr 10 01:32:53 PM CST 2026] Sleeping for 15 seconds then retrying
[Fri Apr 10 01:33:09 PM CST 2026] Polling order status: https://acme.zerossl.com/v2/DV90/order/__alsjkdhfaklshjdflkasdjf
[Fri Apr 10 01:33:10 PM CST 2026] Downloading cert.
[Fri Apr 10 01:33:10 PM CST 2026] Le_LinkCert='https://acme.zerossl.com/v2/DV90/cert/jiSQAlRk396hnfqz7jXhSg'
[Fri Apr 10 01:33:15 PM CST 2026] Cert success.
-----BEGIN CERTIFICATE-----
OIDUJFJALKJSNmDFLKASJDFL
......
-----END CERTIFICATE-----
[Fri Apr 10 01:33:15 PM CST 2026] Your cert is in: /root/.acme.sh/my.example.com_ecc/my.example.com.cer
[Fri Apr 10 01:33:15 PM CST 2026] Your cert key is in: /root/.acme.sh/my.example.com_ecc/my.example.com.key
[Fri Apr 10 01:33:15 PM CST 2026] The intermediate CA cert is in: /root/.acme.sh/my.example.com_ecc/ca.cer
[Fri Apr 10 01:33:15 PM CST 2026] And the full-chain cert is in: /root/.acme.sh/my.example.com_ecc/fullchain.cer
```

## 配置Nginx

```conf
$ cat /etc/nginx/conf.d/tripo.conf
server {
      listen 80;
      server_name my.example.com;
      return 301 https://$host$request_uri;
  }

  server {
      listen 443 ssl http2;
      server_name my.example.com;

      ssl_certificate /root/.acme.sh/my.example.com_ecc/my.example.com.cer;
      ssl_certificate_key /root/.acme.sh/my.example.com_ecc/my.example.com.key;

      .......
  }

```

## 重启nginx

```shell
systemctl restart nginx
```
