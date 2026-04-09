import{_ as i,o as a,c as n,ac as t}from"./chunks/framework.DnBnwVZk.js";const g=JSON.parse('{"title":"String到底相不相等？String初始化及String.intern()方法浅析","description":"","frontmatter":{"date":"2020-11-22T00:00:00.000Z","categories":["Java进阶"],"tags":[null],"publish":true},"headers":[],"relativePath":"views/java/knowledge/StringEquals.md","filePath":"views/java/knowledge/StringEquals.md","lastUpdated":1775654397000}'),h={name:"views/java/knowledge/StringEquals.md"};function p(l,s,k,e,d,r){return a(),n("div",{"data-pagefind-body":!0,"data-pagefind-meta":"date:1606003200000"},[...s[0]||(s[0]=[t(`<h1 id="string到底相不相等-string初始化及string-intern-方法浅析" tabindex="-1">String到底相不相等？String初始化及String.intern()方法浅析 <a class="header-anchor" href="#string到底相不相等-string初始化及string-intern-方法浅析" aria-label="Permalink to &quot;String到底相不相等？String初始化及String.intern()方法浅析&quot;">​</a></h1><h2 id="引言" tabindex="-1">引言 <a class="header-anchor" href="#引言" aria-label="Permalink to &quot;引言&quot;">​</a></h2><p>在各种面试题中经常见到类似下述的面试题</p><p>写出main方法的打印结果</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> test</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">args</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">){</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String s1 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String s2 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;11&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s1 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s2);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            s2.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">intern</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String s3 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;111&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s2 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s3);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String s4 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s1.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">intern</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s4 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s1);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String s6 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String s7 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            String s8 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s6.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">intern</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s7 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s6);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s8 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s6);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s7 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s8);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span></code></pre></div><p>答案为:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>false</span></span>
<span class="line"><span>true</span></span>
<span class="line"><span>false</span></span>
<span class="line"><span>false</span></span>
<span class="line"><span>false</span></span>
<span class="line"><span>true</span></span>
<span class="line"><span>false</span></span>
<span class="line"><span>false</span></span>
<span class="line"><span>true</span></span></code></pre></div><p>此题要求对String类的引用有相关了解，提炼相关的要点如下</p><h2 id="要点列表" tabindex="-1">要点列表 <a class="header-anchor" href="#要点列表" aria-label="Permalink to &quot;要点列表&quot;">​</a></h2><ol><li>两个对象obj1和obj2，当且仅当obj1与obj2指向相同的引用(内存地址，对象地址)时，ojb1==obj2返回true，其他返回false</li><li>String初始化时，若采用String s = &quot;1&quot;;这种字面量直接赋值的形式，则过程为： 判断字符串常量池中是否有值与字面量相同的引用，有的话s指向这个引用指向的对象，否则在堆上新建值为字面量的String对象，s指向新建的对象,并在字符串常量池中存储对应的引用</li><li>String初始化时，若采用String s = new String(&quot;1&quot;);这种new对象的形式，或者使用其他带参构造器，则过程为： 在堆上新建字符串实例，值为相关值，s直接指向堆上新增的这个对象</li><li>String s = new String(&quot;1&quot;) + new String(&quot;1&quot;)等同于String s = new StringBuilder().append(&quot;1&quot;).append(&quot;1&quot;).toString();由于StringBuilder的toString方法也是调用的String的带参构造方法， 因此在引用处理时，结果与3相同</li><li>String类的intern()方法执行过程为:检查字符串常量区是否有相同值(hash)的引用，有的话返回此引用，否则将调用者放入字符串常量区，并返回调用者的引用</li></ol><h2 id="实际代码分析" tabindex="-1">实际代码分析 <a class="header-anchor" href="#实际代码分析" aria-label="Permalink to &quot;实际代码分析&quot;">​</a></h2><p>如下为上述代码及每一行的分析</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String s1 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><pre><code>                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        上面这段代码，在运行时会在堆上创建对象&quot;1&quot;并在字符串常量池中创建对应的引用，
        同时由于字符串常量池中没有值为&quot;111&quot;的对象，因此会在堆上创建一个值为&quot;111&quot;的对象，
        s1指向刚创建的这个&quot;111&quot;对象，但不会在常量池中新创建值为&quot;111&quot;的引用，因此常量池中仍旧
        没有值为&quot;111&quot;的对象

                                   ↓↓↓↓↓↓↓↓内存状态↓↓↓↓↓↓↓↓↓
        --------------------------------------堆--------------------------------------------
        addr1(&quot;1&quot;)
        addr2(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------字符串常量池---------------------------------------
        addr1(&quot;1&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------------变量-----------------------------------------
        s1 -&gt; addr2
        ------------------------------------------------------------------------------------
</code></pre><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String s2 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;11&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><pre><code>    /*
                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        上面这段代码，在运行时会在堆上创建对象&quot;11&quot;并在字符串常量池中创建对应的引用，
        同时由于字符串常量池中仍旧没有值为&quot;111&quot;的对象，因此会在堆上创建一个值为&quot;111&quot;的对象，
        s2指向刚创建的这个&quot;111&quot;对象，
        注意，此&quot;111&quot;对象地址与s1不同，此时在堆上存在两个值都为&quot;111&quot;的String对象

                                   ↓↓↓↓↓↓↓↓内存状态↓↓↓↓↓↓↓↓↓
        --------------------------------------堆--------------------------------------------
        addr1(&quot;1&quot;)
        addr2(&quot;111&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------字符串常量池---------------------------------------
        addr1(&quot;1&quot;)
        addr3(&quot;11&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------------变量-----------------------------------------
        s1 -&gt; addr2
        s2 -&gt; addr4
        ------------------------------------------------------------------------------------
</code></pre><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s1 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s2);</span></span></code></pre></div><pre><code>    /*
                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        根据上面的运行过程可知，s1和s2分别指向堆上两个对象，只是堆上的对象恰巧值均为&quot;111&quot;,
        因此打印false
     */
    s2.intern();
    /*
                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        根据JDK7以后的实现，上面这句代码会检查字符串常量区，此时字符串常量区中没有值为&quot;111&quot;
        的引用，因此，会将s2的引用复制到字符串常量区

                                   ↓↓↓↓↓↓↓↓内存状态↓↓↓↓↓↓↓↓↓
        --------------------------------------堆--------------------------------------------
        addr1(&quot;1&quot;)
        addr2(&quot;111&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------字符串常量池---------------------------------------
        addr1(&quot;1&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------------变量-----------------------------------------
        s1 -&gt; addr2
        s2 -&gt; addr4
        ------------------------------------------------------------------------------------
     */
</code></pre><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String s3 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;111&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><pre><code>    /*
                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        执行了上述intern()过程后，字符串常量区中已有值为&quot;111&quot;的引用，根据实现，s3赋值为常量
        区中值为&quot;111&quot;对应的引用也就是s2指向的堆上那个对象的地址

                                   ↓↓↓↓↓↓↓↓内存状态↓↓↓↓↓↓↓↓↓
        --------------------------------------堆--------------------------------------------
        addr1(&quot;1&quot;)
        addr2(&quot;111&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------字符串常量池---------------------------------------
        addr1(&quot;1&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------------变量-----------------------------------------
        s1 -&gt; addr2
        s2 -&gt; addr4
        s3 -&gt; addr4
        ------------------------------------------------------------------------------------
     */
</code></pre><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s2 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s3);</span></span></code></pre></div><pre><code>    /*
                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        s3和s2指向相同的堆上的对象，因此结果为true
     */
</code></pre><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String s4 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s1.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">intern</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><pre><code>    /*
                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        因为字符串常量区中已有值为&quot;111&quot;的引用，因此此方法不会对字符串常量区中的值产生影响，
        但因为inter()方法返回的是字符串常量区中的引用，因此s4指向s2对应的对象

                                   ↓↓↓↓↓↓↓↓内存状态↓↓↓↓↓↓↓↓↓
        --------------------------------------堆--------------------------------------------
        addr1(&quot;1&quot;)
        addr2(&quot;111&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------字符串常量池---------------------------------------
        addr1(&quot;1&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------------变量-----------------------------------------
        s1 -&gt; addr2
        s2 -&gt; addr4
        s3 -&gt; addr4
        s4 -&gt; addr4
        ------------------------------------------------------------------------------------
     */
</code></pre><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s4 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s1);</span></span></code></pre></div><pre><code>    /*
                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        s4和s1指向堆上的不同的对象，因此结果为false
     */
</code></pre><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String s6 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String s7 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String s8 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s6.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">intern</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><pre><code>    /*
                                    ↓↓↓↓↓↓↓↓解析↓↓↓↓↓↓↓↓↓
        根据上面的内存状态可知，s6仍旧指向堆上一个新建的值为&quot;1&quot;的对象，
        s6.inter()返回的是字符串常量区已有的值为&quot;1&quot;的对象地址，
        s8也等于这个地址

                                   ↓↓↓↓↓↓↓↓内存状态↓↓↓↓↓↓↓↓↓
        --------------------------------------堆--------------------------------------------
        addr1(&quot;1&quot;)
        addr2(&quot;111&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        addr5(&quot;1&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------字符串常量池---------------------------------------
        addr1(&quot;1&quot;)
        addr3(&quot;11&quot;)
        addr4(&quot;111&quot;)
        ------------------------------------------------------------------------------------

        ---------------------------------------变量-----------------------------------------
        s1 -&gt; addr2
        s2 -&gt; addr4
        s3 -&gt; addr4
        s4 -&gt; addr4
        s6 -&gt; addr5
        s7 -&gt; addr1
        s8 -&gt; addr1
        ------------------------------------------------------------------------------------


     */
</code></pre><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s7 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s6);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s8 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s6);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        System.out.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">println</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(s7 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> s8);</span></span></code></pre></div><pre><code>    /*
        根据上面的内存状态可知，打印结果为：
        false
        false
        true
     */
</code></pre><h2 id="延申" tabindex="-1">延申 <a class="header-anchor" href="#延申" aria-label="Permalink to &quot;延申&quot;">​</a></h2><ol><li>由于使用有参构造器来初始化变量时，总会在堆上新建变量，因此在极限情况下，确有可能在初始化阶段造成OOM，解决方法是尽量使用字面量初始化字符串</li><li>String内部字符串常量区的实现方式不同，openjdk中，实现类似HashMap，当放入过多常量时，插入与查找也会产生部分性能损耗，因此，调用String的intern()方法也要看情况确定</li></ol>`,32)])])}const o=i(h,[["render",p]]);export{g as __pageData,o as default};
