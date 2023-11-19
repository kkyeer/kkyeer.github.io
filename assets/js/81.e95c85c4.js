(window.webpackJsonp=window.webpackJsonp||[]).push([[81],{517:function(s,a,t){"use strict";t.r(a);var n=t(2),e=Object(n.a)({},(function(){var s=this,a=s._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("h1",{attrs:{id:"springboot中ck-mysql多数据源结合mybatisplus配置浅探"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#springboot中ck-mysql多数据源结合mybatisplus配置浅探"}},[s._v("#")]),s._v(" SpringBoot中CK+MySQL多数据源结合MyBatisPlus配置浅探")]),s._v(" "),a("p",[s._v("常见的基于Spring框架的web程序中，使用Mybatis作为ORM框架是一个很常见的方案，尤其是一些简单的CRUD场景下，使用"),a("code",[s._v("spring-data-starter-jdbc")]),s._v("配合"),a("code",[s._v("mybatis(plus)")]),s._v("来进行快速搭建，足以完成业务需求，同时兼顾一定的灵活性（比如连接池参数动态调整）。")]),s._v(" "),a("p",[s._v("得益于SpringBoot以及各种starter包的良好封装，以往工作中，项目的配置极其简单，甚至在单数据源且仅限于MySQL存储的情况下，在项目入口类添加寥寥2-3行注解，然后照教程进行一些数据源url的配置即可3分钟完成启动与接入，进入业务Coding环节。")]),s._v(" "),a("p",[s._v("但近日在工作中由于某项业务的需求，评估后需要使用ClickHouse作为OLAP分析底层数据源，结合MySQL进行一些元数据存储。对于这种场景下ORM框架层的初始化，网上搜索得到的资料良莠不齐，有的不考虑连接池配置，也有的从"),a("code",[s._v("Class.forName()")]),s._v("开始，没有考虑到SpringBoot已有的基建，有重复造轮子的嫌疑。基于此，决定花一点时间探究SpringBoot，MyBatis(iBatis)，以及连接池实现(HikariCP,DBCP,Druid)之间的配置、Bean注入和引用关系，得到下面的关系图。")]),s._v(" "),a("p",[a("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/SpringBootDataSource.svg",alt:"SpringBootDataSource"}})]),s._v(" "),a("blockquote",[a("p",[s._v("说明")])]),s._v(" "),a("ol",[a("li",[s._v("SpringBoot的部分，主要完成动态配置的承接，以及根据type进行DataSource的初始化，默认初始化"),a("code",[s._v("HikariCP")]),s._v("，当结合SpringTX时，会默认初始化一个事务管理器"),a("code",[s._v("TransactionalManager")])]),s._v(" "),a("li",[s._v("无论是Hikari还是Druid数据源，都同时具备"),a("strong",[s._v("连接池")]),s._v("和"),a("strong",[s._v("新建连接")]),s._v("两种能力，过程中用到的连接池参数和JDBC参数，默认由Spring通过配置机制获取，也可自定义")]),s._v(" "),a("li",[s._v("iBatis具备"),a("strong",[s._v("对象映射")]),s._v("能力，Mybatis-Spring通过"),a("code",[s._v("SqlSessionFactory")]),s._v(","),a("code",[s._v("SqlSessionTemplate")]),s._v("完成iBatis和Spring中DataSource的连接")])]),s._v(" "),a("h2",{attrs:{id:"ck-mysql多数据源与mybatisplus的融合配置实现"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#ck-mysql多数据源与mybatisplus的融合配置实现"}},[s._v("#")]),s._v(" CK+MySQL多数据源与MybatisPlus的融合配置实现")]),s._v(" "),a("p",[s._v("从参数动态自定义的角度考量，无论是Hikari还是Druid数据源都具备同时动态初始化JDBC驱动和连接池的能力，通过"),a("code",[s._v("SqlSessionFactory")]),s._v(","),a("code",[s._v("SqlSessionTemplate")]),s._v("作为桥梁，结合"),a("code",[s._v("@MapperScan")]),s._v("注解中的"),a("code",[s._v("SqlSessionTemplateRef")]),s._v("参数，可分别指定不同的Java包路径使用不同数据源。\n另外一种思路是借用MybatisPlus的多数据源能力，调用时通过"),a("code",[s._v('@DS("ck")')]),s._v("类似的注解随便指定数据源，考虑到项目代码管理的简便，没有采用这个方案。")]),s._v(" "),a("p",[s._v("完整代码参见"),a("a",{attrs:{href:"https://github.com/kkyeer/lab/tree/explore/spring-ck-mysql",target:"_blank",rel:"noopener noreferrer"}},[s._v("Github"),a("OutboundLink")],1)]),s._v(" "),a("p",[s._v("优点：可以使用全部的连接池能力，且不需要在初始化配置时指定任何参数，支持生产环境连接池参数的动态配置（基于配置中心等）\n缺点：DataSource绑定Hikari实现，如果生产运行中需要动态切换连接池类型如Hikari切换Druid连接池，需要修改代码")]),s._v(" "),a("h2",{attrs:{id:"代码说明"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#代码说明"}},[s._v("#")]),s._v(" 代码说明")]),s._v(" "),a("ol",[a("li",[s._v("分别继承父数据源，使用SpringPropery动态注入实现，不同的数据源指定不同的prefix")])]),s._v(" "),a("div",{staticClass:"language-Java line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Configuration")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@EnableConfigurationProperties")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@ConfigurationProperties")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"spring.datasource.mysql"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("MySQLDataSource")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("extends")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("HikariDataSource")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Configuration")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@EnableConfigurationProperties")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@ConfigurationProperties")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"spring.datasource.ck"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("ClickHouseDataSource")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("extends")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("HikariDataSource")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br")])]),a("ol",{attrs:{start:"2"}},[a("li",[s._v("Mybatis配置，自定义"),a("code",[s._v("SqlSessionTemplate")]),s._v("，不同数据源不同的包路径")])]),s._v(" "),a("div",{staticClass:"language-Java line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Configuration")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@MapperScan")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("basePackages "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"com.kkyeer.study.spring.dal.ck"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("sqlSessionTemplateRef "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"ckSqlSessionTemplate"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@MapperScan")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("basePackages "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"com.kkyeer.study.spring.dal.mysql"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("sqlSessionTemplateRef "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"mysqlSqlSessionTemplate"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("MybatisConfig")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n\n    "),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Bean")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionTemplate")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("ckSqlSessionTemplate")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("ClickHouseDataSource")]),s._v(" clickHouseDataSource"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("throws")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Exception")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionFactoryBean")]),s._v(" sqlSessionFactoryBean "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionFactoryBean")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n        sqlSessionFactoryBean"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("setDataSource")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("clickHouseDataSource"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionFactory")]),s._v(" sqlSessionFactory "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" sqlSessionFactoryBean"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("getObject")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionTemplate")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("sqlSessionFactory"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n\n    "),a("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Bean")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionTemplate")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("mysqlSqlSessionTemplate")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("MySQLDataSource")]),s._v(" clickHouseDataSource"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("throws")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Exception")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionFactoryBean")]),s._v(" sqlSessionFactoryBean "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionFactoryBean")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n        sqlSessionFactoryBean"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("setDataSource")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("clickHouseDataSource"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionFactory")]),s._v(" sqlSessionFactory "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" sqlSessionFactoryBean"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("getObject")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n        "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SqlSessionTemplate")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("sqlSessionFactory"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br"),a("span",{staticClass:"line-number"},[s._v("17")]),a("br"),a("span",{staticClass:"line-number"},[s._v("18")]),a("br"),a("span",{staticClass:"line-number"},[s._v("19")]),a("br"),a("span",{staticClass:"line-number"},[s._v("20")]),a("br"),a("span",{staticClass:"line-number"},[s._v("21")]),a("br"),a("span",{staticClass:"line-number"},[s._v("22")]),a("br"),a("span",{staticClass:"line-number"},[s._v("23")]),a("br")])])])}),[],!1,null,null,null);a.default=e.exports}}]);