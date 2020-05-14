---
date: 2017-11-14
categories:
  - Linux
tags:
  - SSL
publish: true
---

# 配置免费HTTPS : let's encrypt+centos7+nginx+tomcat

## 前言

突然想给自己的基础版阿里云服务器增加https支持，折腾了许久，简单记一下

## 获取证书

1）获取certbot-auto脚本

```shell
wget https://dl.eff.org/certbot-auto
```

2）使certbot-auto脚本可执行

```bash
chmod a+x ./certbot-auto
```

3）运行certbot-auto，安装Certbot

>1. ./certbot-auto certonly
>2. 选择2

运行完毕后，获得的私钥等在文件夹/etc/letsencrypt/live/{websiteDomain}/下，websiteDomain为申请时输入的网站名

## 刷新证书

1）Let's Encrypt的证书只有3个月期限，到期刷新

```Shell
./certbot-auto renew
```

## 附1：nginx 配置ssl

nginx本身作为静态资源服务器，配置https需要编辑nginx/conf/nginx.conf文件，示例配置如下，将下述代码中的{websiteDomain}替换成自己的域名，比如域名是www.abc.com,则 ssl_certificate      /etc/letsencrypt/live/www.abc.com/fullchain.pem;

```text
    server{
    listen 80;
    server_name localhost;
    #http请求转发443端口
    rewrite ^(.*)$  https://$host$1 permanent;
    }
    server {
    #增加https设置
        listen       443 ssl;
        server_name  localhost;

        ssl_certificate      /etc/letsencrypt/live/{websiteDomain}/fullchain.pem;
        ssl_certificate_key  /etc/letsencrypt/live/{websiteDomain}/privkey.pem;
        ssl_session_timeout  5m;

        location / {
            root   /webroot;
        index index.html;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    #........省略其他设置
    }
```

## 附2：Tomcat配置https

### 第一步：Tomcat安装apr

因为下一步tomcat配置https需要需要编译apr
**注意，编译过程中需要jni相关头文件，在openjdk里没有找到，所以临时安装了OracleJDK，即下述--with-java-home参数指定的路径**

1. 安装依赖
yum install apr-devel apr apr-util
2. 解压tomcat文件夹中自带的tomcat-native源码，不需下载，在bin目录下有
tar -xvf tomcat/bin/tomcat-native.tar.gz
3. 可选：下载并解压OracleJDK到当前文件夹，步骤略
4. 编译
cd tomcat-native-1.2.16-src/native/
./configure --prefix=/usr/local/apr --with-java-home=./jdk1.8.0_181/
./configure && make && make install

### 第二步：Tomcat配置

- #### conf/web.xml

增加如下配置

```xml
<security-constraint>
        <web-resource-collection >
            <web-resource-name >SSL</web-resource-name>
            <url-pattern>/*</url-pattern>
        </web-resource-collection>

        <user-data-constraint>
            <transport-guarantee>CONFIDENTIAL</transport-guarantee>
        </user-data-constraint>
</security-constraint>
```

- #### conf/server.xml

将相关接口配置为https服务，将下述代码中的{websiteDomain}替换成自己的域名，比如域名是www.abc.com,则certificateKeyFile="/etc/letsencrypt/live/www.abc.com/privkey.pem",其他位置类似

```xml
    <Connector port="12334" protocol="org.apache.coyote.http11.Http11AprProtocol"
               maxThreads="150" SSLEnabled="true" >
        <UpgradeProtocol className="org.apache.coyote.http2.Http2Protocol" />
        <SSLHostConfig>
            <Certificate certificateKeyFile="/etc/letsencrypt/live/{websiteDomain}/privkey.pem"
                         certificateFile="/etc/letsencrypt/live/{websiteDomain}/cert.pem"
                         certificateChainFile="/etc/letsencrypt/live/{websiteDomain}/chain.pem"
                         type="RSA" />
        </SSLHostConfig>
    </Connector>
```
