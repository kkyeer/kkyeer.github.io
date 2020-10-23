 Nginx服务器的反向代理proxy_pass配置方法讲解

Nginx的配置还是比较简单的，如：
1
2
3
4
	
location ~ /* 
{
proxy_pass http://127.0.0.1:8008;
}

或者可以
1
2
3
4
	
location /
{
proxy_pass http://127.0.0.1:8008;
}

Apache2的反向代理的配置是：
1
	
ProxyPass /ysz/ http://localhost:8080/

然而，如果要配置一个相对复杂的反向代理
Nginx相对Apache2就要麻烦一些了
比如，将url中以/wap/开头的请求转发到后台对应的某台server上
可以再Nginx里设置一个变量，来临时保存/wap/后面的路径信息
1
2
3
4
5
6
7
8
9
	
location ^~ /wap/
{
if ($request_uri ~ /wap/(\d+)/(.+))
{
set $bucketid $1;
set $params $2;
}
proxy_pass http://mx$bucketid.test.com:6601/$params;
}

也可以首先rewrite一下，然后再代理：
1
2
3
4
	
location ^~ /wap/{
rewrite /wap/(\d+)/(.+) /$2?$args break;
proxy_pass http://mx$1.test.com:6601;
}

或者
1
2
3
4
	
location ~* /wap/(\d+)/(.+)
{
proxy_pass http://mx$1.test.com:6601/$2?$args;
}

注意上面最后的?$args，表明把原始url最后的get参数也给代理到后台
如果在proxy_pass中使用了变量（不管是主机名变量$1或后面的$2变量），则必须得加这段代码
但如果pass_proxy后没用任何变量，则不需要加，它默认会把所有的url都给代理到后台，如：
1
2
3
4
	
location ~* /wap/(\d+)/(.+)
{
proxy_pass http://mx.test.com:6601;
}

而Apache2相对就简单多了：
1
2
3
4
5
6
	
ProxyPassMatch ^/wap/(.*)$  http://192.168.132.147/$1
  
if ($host ~* www.(.*)){
      set $host_without_www $1;
      rewrite (.*)$ http://$host_without_www/www$1;
    }

url的/问题
在nginx中配置proxy_pass时，当在后面的url加上了/，相当于是绝对根路径，则nginx不会把location中匹配的路径部分代理走;如果没有/，则会把匹配的路径部分也给代理走。
 
下面四种情况分别用http://192.168.1.4/proxy/test.html 进行访问。
第一种：
1
2
3
	
location /proxy/ {
     proxy_pass http://127.0.0.1:81/;
}

会被代理到http://127.0.0.1:81/test.html 这个url
 
第二咱(相对于第一种，最后少一个 /)
1
2
3
	
location /proxy/ {
     proxy_pass http://127.0.0.1:81;
}

会被代理到http://127.0.0.1:81/proxy/test.html 这个url
 
第三种：
1
2
3
	
location /proxy/ {
     proxy_pass http://127.0.0.1:81/ftlynx/;
}

会被代理到http://127.0.0.1:81/ftlynx/test.html 这个url。
 
第四种情况(相对于第三种，最后少一个 / )：
1
2
3
	
location /proxy/ {
     proxy_pass http://127.0.0.1:81/ftlynx;
}

会被代理到http://127.0.0.1:81/ftlynxtest.html 这个url
 
上面的结果都是本人结合日志文件测试过的。从结果可以看出，应该说分为两种情况才正确。即http://127.0.0.1:81 (上面的第二种) 这种和 http://127.0.0.1:81/.... （上面的第1，3，4种） 这种。

https://www.cnblogs.com/lianxuan1768/p/8383804.html