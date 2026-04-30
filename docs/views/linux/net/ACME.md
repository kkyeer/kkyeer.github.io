---
date: 2026-04-10 13:45:51
categories:
  - Linux
tags:
  - Linux
  - Net
publish: true
---

# ACME自动申请HTTPS证书（国内版）

## 1. 安装

由于某些原因，直接使用官方的安装方式大概率碰到网络问题，因此使用下面的方案安装，这个方式是来源于[acme的github官方文档](https://github.com/acmesh-official/acme.sh/wiki/Install-in-China)

```shell
git clone https://gitee.com/neilpang/acme.sh.git
cd acme.sh
./acme.sh --install -m my@example.com
```

> 备注：官方安装方案：```curl https://get.acme.sh | sh -s email=my@example.com```

## 2. 一次性快速申请

这里仅列举dns验证方式，即需要有修改DNS记录的权限，除此之外还可以使用challenge的方式，将来有时间再补充

### 2.1. 发起证书申请

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

### 2.2. 手动修改DNS记录

略

### 2.3. 刷新获取证书

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

## 3. Nginx配置

### 3.1 修改Nginx配置

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

### 3.2. 重启nginx

```shell
systemctl restart nginx
```

## 4. 自动刷新证书-阿里云dns

### 4.1 申请阿里云RAM账号

自动刷新需要用到阿里云账号的AK/SK，考虑到安全原因，**不建议直接使用主账号**，最佳实践是使用子账号。

在阿里云右上角，点击AccessKey，或者直接访问此网址[https://ram.console.aliyun.com/overview](https://ram.console.aliyun.com/overview)，在打开的弹窗或指引中，选择新建子账号,记得勾选```使用永久 AccessKey 访问```，创建成功后点击```保存结果```按钮，会下载到一个包含AK/SK的csv文件

![20260430103938](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20260430103938.png)

授权新的子账号的DNS权限

![20260430104138](https://cdn.jsdelivr.net/gh/kkyeer/picbed/20260430104138.png)

### 4.2 命令行配置AK/SK

打开4.1拿到的csv文件，获取AK和SK，在需要访问acme的服务器上执行下列命令配置环境变量

```shell
export Ali_Key="csv文件里的AccessKeyId"
export Ali_Secret="csv文件里的AccessKeySecret"
```

### 4.3 申请证书

命令

```shell
acme.sh --issue --dns dns_ali -d *.your.domain --force
```

注意这里的```your.domain```需要替换成你的域名

输出

```shell
~# acme.sh --issue --dns dns_ali -d your.domain --force
[Thu Apr 30 10:53:42 AM CST 2026] Using CA: https://acme.zerossl.com/v2/DV90
[Thu Apr 30 10:53:42 AM CST 2026] Account key creation OK.
[Thu Apr 30 10:53:42 AM CST 2026] No EAB credentials found for ZeroSSL, let's obtain them
[Thu Apr 30 10:53:44 AM CST 2026] Registering account: https://acme.zerossl.com/v2/DV90
[Thu Apr 30 10:53:47 AM CST 2026] Registered
[Thu Apr 30 10:53:47 AM CST 2026] ACCOUNT_THUMBPRINT='ASDFASDF'
[Thu Apr 30 10:53:47 AM CST 2026] Creating domain key
[Thu Apr 30 10:53:47 AM CST 2026] The domain key is here: /root/.acme.sh/your.domain_ecc/your.domain.key
[Thu Apr 30 10:53:47 AM CST 2026] Single domain='your.domain'
[Thu Apr 30 10:53:51 AM CST 2026] Getting webroot for domain='your.domain'
[Thu Apr 30 10:53:51 AM CST 2026] Adding TXT value: ADFAS-EQRW for domain: _acme-challenge.your.domain
[Thu Apr 30 10:53:52 AM CST 2026] The TXT record has been successfully added.
[Thu Apr 30 10:53:52 AM CST 2026] Let's check each DNS record now. Sleeping for 20 seconds first.
[Thu Apr 30 10:54:13 AM CST 2026] You can use '--dnssleep' to disable public dns checks.
[Thu Apr 30 10:54:13 AM CST 2026] See: https://github.com/acmesh-official/acme.sh/wiki/dnscheck
[Thu Apr 30 10:54:13 AM CST 2026] Checking your.domain for _acme-challenge.your.domain
[Thu Apr 30 10:54:13 AM CST 2026] Please refer to https://curl.haxx.se/libcurl/c/libcurl-errors.html for error code: 35
[Thu Apr 30 10:54:23 AM CST 2026] Please refer to https://curl.haxx.se/libcurl/c/libcurl-errors.html for error code: 28
[Thu Apr 30 10:54:23 AM CST 2026] Success for domain your.domain '_acme-challenge.your.domain'.
[Thu Apr 30 10:54:23 AM CST 2026] All checks succeeded
[Thu Apr 30 10:54:23 AM CST 2026] Verifying: your.domain
[Thu Apr 30 10:54:26 AM CST 2026] Processing. The CA is processing your order, please wait. (1/30)
[Thu Apr 30 10:54:30 AM CST 2026] Success
[Thu Apr 30 10:54:30 AM CST 2026] Removing DNS records.
[Thu Apr 30 10:54:30 AM CST 2026] Removing txt: ASDFf-FASDF for domain: _acme-challenge.your.domain
[Thu Apr 30 10:54:31 AM CST 2026] Successfully removed
[Thu Apr 30 10:54:31 AM CST 2026] Verification finished, beginning signing.
[Thu Apr 30 10:54:31 AM CST 2026] Let's finalize the order.
[Thu Apr 30 10:54:31 AM CST 2026] Le_OrderFinalize='https://acme.zerossl.com/v2/DV90/order/BCD/finalize'
[Thu Apr 30 10:54:32 AM CST 2026] Order status is 'processing', let's sleep and retry.
[Thu Apr 30 10:54:32 AM CST 2026] Sleeping for 15 seconds then retrying
[Thu Apr 30 10:54:48 AM CST 2026] Polling order status: https://acme.zerossl.com/v2/DV90/order/BCD
[Thu Apr 30 10:54:51 AM CST 2026] Downloading cert.
[Thu Apr 30 10:54:51 AM CST 2026] Le_LinkCert='https://acme.zerossl.com/v2/DV90/cert/ABCD'
[Thu Apr 30 10:54:53 AM CST 2026] Cert success.
-----BEGIN CERTIFICATE-----
AA
A
A
A
A
BB
-----END CERTIFICATE-----
[Thu Apr 30 10:54:53 AM CST 2026] Your cert is in: /root/.acme.sh/your.domain_ecc/your.domain.cer
[Thu Apr 30 10:54:53 AM CST 2026] Your cert key is in: /root/.acme.sh/your.domain_ecc/your.domain.key
[Thu Apr 30 10:54:53 AM CST 2026] The intermediate CA cert is in: /root/.acme.sh/your.domain_ecc/ca.cer
[Thu Apr 30 10:54:53 AM CST 2026] And the full-chain cert is in: /root/.acme.sh/your.domain_ecc/fullchain.cer
```

### 4.4 安装证书到Nginx

acme可以**自动刷新并安装**你的证书，假设你的nginx配置文件指向的证书路径为```/etc/nginx/ssl/your.domain/****.cer```和```/etc/nginx/ssl/your.domain/****.key```,则命令为

```shell
acme.sh --install-cert -d your.domain \
--key-file       /usr/local/nginx/ssl/your.domain/cert.key \
--fullchain-file /usr/local/nginx/ssl/your.domain/fullchain.cer \
--reloadcmd     "systemctl reload nginx"
```

完成

## 5. 参考文档

- [csdn](https://blog.csdn.net/qq_40622375/article/details/146523428)
- [zhihu](https://zhuanlan.zhihu.com/p/347064501)
