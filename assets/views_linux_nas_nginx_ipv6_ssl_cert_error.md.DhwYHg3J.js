import{_ as a,o as n,c as e,ac as i}from"./chunks/framework.DnBnwVZk.js";const _=JSON.parse('{"title":"一次SSL证书交换错误的解决记录","description":"","frontmatter":{"date":"2023-11-11T18:50:47.000Z","categories":["Linux"],"tags":["NAS"],"publish":true},"headers":[],"relativePath":"views/linux/nas/nginx_ipv6_ssl_cert_error.md","filePath":"views/linux/nas/nginx_ipv6_ssl_cert_error.md","lastUpdated":1775714960000}'),l={name:"views/linux/nas/nginx_ipv6_ssl_cert_error.md"};function p(o,s,r,c,t,d){return n(),e("div",{"data-pagefind-body":!0,"data-pagefind-meta":"date:1699728647000"},[...s[0]||(s[0]=[i(`<h1 id="一次ssl证书交换错误的解决记录" tabindex="-1">一次SSL证书交换错误的解决记录 <a class="header-anchor" href="#一次ssl证书交换错误的解决记录" aria-label="Permalink to &quot;一次SSL证书交换错误的解决记录&quot;">​</a></h1><h2 id="现象" tabindex="-1">现象 <a class="header-anchor" href="#现象" aria-label="Permalink to &quot;现象&quot;">​</a></h2><p>某个网站，当用户手机访问的时候，<strong>偶尔出现</strong>无法访问，报错如下，点击显示详细信息发现访问<code>a.my-domain.com</code>时，返回了<code>b.my-domain.com</code>的证书</p><p><img src="https://cdn.jsdmirror.com/gh/kkyeer/picbed/nginx_ipv6_ssl_cert_error_msg.png" alt="nginx_ipv6_ssl_cert_error_msg"></p><h2 id="排查" tabindex="-1">排查 <a class="header-anchor" href="#排查" aria-label="Permalink to &quot;排查&quot;">​</a></h2><h3 id="复现" tabindex="-1">复现 <a class="header-anchor" href="#复现" aria-label="Permalink to &quot;复现&quot;">​</a></h3><p>经过自己的设备尝试，有以下发现</p><ul><li>公司电脑访问正常</li><li>手机偶尔访问正常，比如刚重启的一小会</li><li>有时候连WiFi正常访问，5G/4G移动网一直不行</li></ul><blockquote><p>最讨厌的是不能稳定复现的bug -by鲁迅</p></blockquote><h3 id="过程" tabindex="-1">过程 <a class="header-anchor" href="#过程" aria-label="Permalink to &quot;过程&quot;">​</a></h3><ol><li>了解目标网络拓扑：<img src="https://cdn.jsdmirror.com/gh/kkyeer/picbed/nginx_ipv6_ssl_cert_error_topolory.svg" alt="nginx_ipv6_ssl_cert_error_topolory"></li><li>可以看到证书由SLB服务（此处是nginx）进行管理与应答</li><li>【排查配置】SSL证书错乱，以往的经验都是错误配置导致，因此首先排查了域名与证书的对应关系，未发现问题</li><li>此时事情已经比较蹊跷，因为目前看正常的场景和错误的场景没有什么关联关系，不同的设备/网络接入/运营商都有可能出现正常或者不正常</li><li>经过多次尝试，发现手机上相对稳定的复现问题，于是考虑抓包来解析ssl证书交换过程异常，抓包过程略</li><li>抓包后的结果：同样的手机，在同样网络下（同网络的另外一台电脑作为代理+抓包设备），完全正常，关掉抓包代理则完全异常</li><li>没思路了，使用回溯大法，挨个回溯最近的修改，直到排查到最近某个子域名增加了ipv6配置</li></ol><h2 id="原因" tabindex="-1">原因 <a class="header-anchor" href="#原因" aria-label="Permalink to &quot;原因&quot;">​</a></h2><ol><li>入口端口启用了IPv6协议，且根据请求头（子域名来进行负载均衡），比如下面，子域名<code>a.my-domain.com</code>、<code>b.my-domain.com</code>、<code>c.my-domain.com</code>均使用443端口，通过区分访问地址在nginx中进行负载均衡</li></ol><div class="language-conf vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">conf</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>server{</span></span>
<span class="line"><span>  listen 443 ssl;</span></span>
<span class="line"><span>  listen [::]:443 ssl;</span></span>
<span class="line"><span>  server_name a.my-domain.com;</span></span>
<span class="line"><span> ### 其他省略</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>server{</span></span>
<span class="line"><span>  listen 443 ssl;</span></span>
<span class="line"><span>  listen [::]:443 ssl;</span></span>
<span class="line"><span>  server_name b.my-domain.com;</span></span>
<span class="line"><span> ### 其他省略</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>server{</span></span>
<span class="line"><span>  listen 443 ssl;</span></span>
<span class="line"><span>  server_name c.my-domain.com;</span></span>
<span class="line"><span> ### 其他省略</span></span>
<span class="line"><span>}</span></span></code></pre></div><ol start="2"><li>部分server没有启用IPv6协议监听(如上面的<code>c.my-domain.com</code>)，nginx启动的时候会报错</li></ol><div class="language-conf vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">conf</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> server{</span></span>
<span class="line"><span>   listen 443 ssl;</span></span>
<span class="line"><span>   listen [::]:443 ssl;</span></span>
<span class="line"><span>   ↑↑↑这个子域名监听ipv6</span></span>
<span class="line"><span>   server_name a.my-domain.com;</span></span>
<span class="line"><span> }</span></span>
<span class="line"><span></span></span>
<span class="line"><span> server{</span></span>
<span class="line"><span>   listen 443 ssl;</span></span>
<span class="line"><span>   ↑↑↑这个子域名没有监听ipv6</span></span>
<span class="line"><span>   server_name c.my-domain.com;</span></span>
<span class="line"><span> }</span></span></code></pre></div><p><img src="https://cdn.jsdmirror.com/gh/kkyeer/picbed/nginx-ipv6-ssl-cert-error-docker-log.png" alt="nginx-ipv6-ssl-cert-error-docker-log"></p><ol start="3"><li>当客户端与网站握手时，比如上面的<code>c.my-domain.com</code>，如果使用IPv6协议栈（比如使用手机的移动网络），由于原因2，<code>c.my-domain.com</code>没有接入ipv6协议栈的监听，这时候nginx随机返回一个证书（比如a.my-domain.com），由于证书与域名不匹配，被系统拦截（证书校验不通过）</li><li>上述原因也能解释故障不能稳定复现的原因，因为设备不是在所有场景下都能获取到IPv6地址，即使获取到也不一定使用IPv6协议，导致出现偶发的诡异现象</li></ol><h2 id="解决" tabindex="-1">解决 <a class="header-anchor" href="#解决" aria-label="Permalink to &quot;解决&quot;">​</a></h2><p>知道了原因，解决就简单了，将需要ipv6的子域名单独放到独立的SLB，或者将其他的子域名也配置IPv6协议栈即可</p>`,20)])])}const h=a(l,[["render",p]]);export{_ as __pageData,h as default};
