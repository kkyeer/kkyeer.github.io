---
date: 2020-04-17
categories:
  - Basic
tags:
  - Security
publish: true
---

# 网络安全基础

## 1. 密码安全

密码安全思路为对【密码】或【密码+用户名】进行一定的Hash运算，数据库只保存密码的hash值，这样即使被脱库，也无法从hash值直接算出明文密码。常见的Hash方法如下

Hash函数|资源占用|安全性|弱点|优点
----------|---------|--------|----|----
MD5，SHA1、SHA256|低|低，不可用|彩虹表即可破解|对服务器占用低
加盐MD5、SHA1、SHA256|中|中|算力穷举可以破解|均衡占用与安全性
bcrypt,PBKDF2, scrypt, argon2|高，自适应|高，自适应|需要调试，需要配合另外的机制作授权|动态调整资源占用

一般认为比较安全的思路为SHA256函数的加盐版本，但是鉴于算力膨胀，GPU运算可以轻易的完成**每秒上亿次**的hash运算，使得针对普通加盐的暴力破解成为可能，因此推荐使用bcrypt,PBKDF2, scrypt,一般认为比较安全的思路为SHA256函数的加盐版本，但是鉴于算力膨胀，GPU运算可以轻易的完成每秒上亿次的hash运算，使得针对普通加盐的暴力破解成为可能，因此推荐使用bcrypt,PBKDF2, scrypt, argon2算法之一。 密码安全性即服务器资源占用与安全性的权衡，上述4种算法的特点是，可以通过调整系数来快速适应机器的性能提升，即可以将Hash运算的性能占用锁定在一个可以接受的水平，比如每秒一次Hash，这样可以在大幅提高暴力破解需要的算力的同时，不对服务器造成过重负载。能提升，即可以将Hash运算的性能占用锁定在一个可以接受的水平，比如每秒一次Hash，这样可以在大幅提高暴力破解需要的算力的同时，不对服务器造成过重负载。

Spring配置密码加密:配置一个```PasswordEncoder```类型的Bean

## 2. CSRF

对于A网站依赖Cookie传输授权校验信息的场景，由于浏览器允许第三方网站通过js发起A网站的请求，且浏览器会在请求中自动附带Cookie，因此第三方网站可以轻易突破这种授权。值得一提的是，Chrome51以后，Cookie新增了```SameSite```属性来防止第三方网站发起请求时附带本Cookie，但由于浏览器实现不统一，实践时需要配置但不可依赖此特性。

### 2.1 Login /Logout CSRF

Login CSRF是一类特殊的CSRF攻击，攻击者在第三方网站插入如下form(或等效js)

```html
<form method="POST" action="http://honest.site/login">
  <input type="text" name="user" value="攻击者申请的账号" />
  <input type="password" name="pass" value="攻击者账号对应密码" />
</form>
<script>
    document.forms[0].submit();
</script>
```

当受害者点开此第三方页面时，请求发起->服务器响应->浏览器接收响应中的Set-Cookie头并替换本地的JSESSION_COOKIE为刚收到的攻击者账号对应的会话ID，由于整个流程，是浏览器自动完成的，因此受害者没有察觉。如果网站通过SESSION_COOKIE来获取会话并识别用户，则此受害者的后续请求实际上**关联到攻击者账户**，可以被攻击者通过正常登陆攻击者账户来提取使用：

- 浏览记录，活动记录
- **信用卡档案**
- 等等

类似的，对于基于```SESSION```和```SESSION_COOKIE```的登出操作，攻击者也可以通过下面的CSRF来log out用户后，再执行Login CSRF.

```html
<form method="POST" action="http://honest.site/logout">
</form>
<script>
    document.forms[0].submit();
</script>
```

下面是一些相关的参考连接

- [https://labs.detectify.com/2017/03/15/loginlogout-csrf-time-to-reconsider/](https://labs.detectify.com/2017/03/15/-loginlogout-csrf-time-to-reconsider/)
- [http://lists.webappsec.org/pipermail/websecurity_lists.webappsec.org/2011-February/007533.html](http://lists.webappsec.org/pipermail/websecurity_lists.webappsec.org/2011-February/007533.html)
- [https://labs.detectify.com/2017/03/15/loginlogout-csrf-time-to-reconsider/](https://labs.detectify.com/2017/03/15/loginlogout-csrf-time-to-reconsider/)

## 3. XSS-跨站脚本攻击

当一个网站，允许用户上传或者输入任意脚本，并且不加验证的下发到其他用户的浏览器时，便存在XSS漏洞。此时受害者的浏览器收到可信服务器下发的JS或者Flash内容并且执行，而实际上这些内容是恶意程序。

XSS攻击分为三类，存储和反射和DOM型攻击。

存储型攻击：恶意脚本被持久化到服务器的存储区如数据库，访问记录等
反射型攻击：用户点击钓鱼网站或者钓鱼邮件，发送特制的请求到服务器，服务器执行请求后，给浏览器的**响应**中包含恶意脚本，浏览器执行此恶意脚本后，把敏感数据发送给攻击者

防护：

1. 关闭HTTP TRACE，用户发送HTTP TRACE请求时，浏览器会自动附带cookie信息
2. 永远校验用户的上传内容
3. 不要把用户上传的内容以html或者类似格式回传浏览器

[参考资料:OWASP相关概念说明](https://owasp.org/www-community/attacks/xss/)
[参考资料:防护](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## 4. 响应头配置

- 缓存相关：如果允许缓存，当被别人点击后退时，可能获取到上次请求的响应

```html
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
```

- 禁止Content-Type嗅探:当允许用户上传自定义内容时，用户可以利用嗅探机制来运行恶意代码

```html
X-Content-Type-Options: nosniff
```

- HSTS:网站开启HSTS后，只要用户进入一次此网站，下次请求时，即使用户错误的请求了HTTP版本，也会被浏览器强制重定向到HTTPS版本

```html
Strict-Transport-Security: max-age=31536000 ; includeSubDomains ; preload
```

- 禁止FRAME

```html
X-Frame-Options: DENY
```

- 开启XSS保护

```html
X-XSS-Protection: 1; mode=block
```

- CSP:保证内容从指定源加载

```html
Content-Security-Policy: script-src https://trustedscripts.example.com; report-uri
/csp-report-endpoint/
```

[参考资料](https://www.html5rocks.com/en/tutorials/security/content-security-policy/)

- Referrer Policy：控制Referrer策略

```html
Referrer-Policy: same-origin
```

- Feature-Policy：控制浏览器某些API

```html
Feature-Policy: geolocation 'self'
```

- 清除浏览器数据

```html
Clear-Site-Data: "cache", "cookies", "storage", "executionContexts"
```