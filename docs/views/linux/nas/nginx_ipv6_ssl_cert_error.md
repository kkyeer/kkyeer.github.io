---
date: 2023-11-11 18:50:47
categories:
  - Linux
tags:
  - NAS
publish: true
---

# 一次SSL证书交换错误的解决记录

## 现象

某个网站，当用户手机访问的时候，**偶尔出现**无法访问，报错如下，点击显示详细信息发现访问```a.my-domain.com```时，返回了```b.my-domain.com```的证书

![nginx_ipv6_ssl_cert_error_msg](https://cdn.jsdelivr.net/gh/kkyeer/picbed/nginx_ipv6_ssl_cert_error_msg.png)

## 排查

### 复现

经过自己的设备尝试，有以下发现

- 公司电脑访问正常
- 手机偶尔访问正常，比如刚重启的一小会
- 有时候连WiFi正常访问，5G/4G移动网一直不行

> 最讨厌的是不能稳定复现的bug  -by鲁迅

### 过程

1. 了解目标网络拓扑：![nginx_ipv6_ssl_cert_error_topolory](https://cdn.jsdelivr.net/gh/kkyeer/picbed/nginx_ipv6_ssl_cert_error_topolory.svg)
2. 可以看到证书由SLB服务（此处是nginx）进行管理与应答
3. 【排查配置】SSL证书错乱，以往的经验都是错误配置导致，因此首先排查了域名与证书的对应关系，未发现问题
4. 此时事情已经比较蹊跷，因为目前看正常的场景和错误的场景没有什么关联关系，不同的设备/网络接入/运营商都有可能出现正常或者不正常
5. 经过多次尝试，发现手机上相对稳定的复现问题，于是考虑抓包来解析ssl证书交换过程异常，抓包过程略
6. 抓包后的结果：同样的手机，在同样网络下（同网络的另外一台电脑作为代理+抓包设备），完全正常，关掉抓包代理则完全异常
7. 没思路了，使用回溯大法，挨个回溯最近的修改，直到排查到最近某个子域名增加了ipv6配置

## 原因

1. 入口端口启用了IPv6协议，且根据请求头（子域名来进行负载均衡），比如下面，子域名```a.my-domain.com```、```b.my-domain.com```、```c.my-domain.com```均使用443端口，通过区分访问地址在nginx中进行负载均衡

 ```conf
 server{
   listen 443 ssl;
   listen [::]:443 ssl;
   server_name a.my-domain.com;
  ### 其他省略
 }

 server{
   listen 443 ssl;
   listen [::]:443 ssl;
   server_name b.my-domain.com;
  ### 其他省略
 }

 server{
   listen 443 ssl;
   server_name c.my-domain.com;
  ### 其他省略
 }

 ```

2. 部分server没有启用IPv6协议监听(如上面的```c.my-domain.com```)，nginx启动的时候会报错

```conf
 server{
   listen 443 ssl;
   listen [::]:443 ssl;
   ↑↑↑这个子域名监听ipv6
   server_name a.my-domain.com;
 }

 server{
   listen 443 ssl;
   ↑↑↑这个子域名没有监听ipv6
   server_name c.my-domain.com;
 }

 ```

![nginx-ipv6-ssl-cert-error-docker-log](https://cdn.jsdelivr.net/gh/kkyeer/picbed/nginx-ipv6-ssl-cert-error-docker-log.png)

3. 当客户端与网站握手时，比如上面的```c.my-domain.com```，如果使用IPv6协议栈（比如使用手机的移动网络），由于原因2，```c.my-domain.com```没有接入ipv6协议栈的监听，这时候nginx随机返回一个证书（比如a.my-domain.com），由于证书与域名不匹配，被系统拦截（证书校验不通过）
4. 上述原因也能解释故障不能稳定复现的原因，因为设备不是在所有场景下都能获取到IPv6地址，即使获取到也不一定使用IPv6协议，导致出现偶发的诡异现象

## 解决

知道了原因，解决就简单了，将需要ipv6的子域名单独放到独立的SLB，或者将其他的子域名也配置IPv6协议栈即可
