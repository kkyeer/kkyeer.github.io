(window.webpackJsonp=window.webpackJsonp||[]).push([[106],{543:function(a,s,e){"use strict";e.r(s);var t=e(2),r=Object(t.a)({},(function(){var a=this,s=a._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[s("h1",{attrs:{id:"命令行申请证书"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#命令行申请证书"}},[a._v("#")]),a._v(" 命令行申请证书")]),a._v(" "),s("h2",{attrs:{id:"下载acme-sh"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#下载acme-sh"}},[a._v("#")]),a._v(" 下载acme.sh")]),a._v(" "),s("p",[a._v("参考"),s("a",{attrs:{href:"https://github.com/acmesh-official/acme.sh/wiki/Install-in-China",target:"_blank",rel:"noopener noreferrer"}},[a._v("教程"),s("OutboundLink")],1)]),a._v(" "),s("h2",{attrs:{id:"配置dns"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#配置dns"}},[a._v("#")]),a._v(" 配置DNS")]),a._v(" "),s("p",[a._v("以HE为例")]),a._v(" "),s("p",[a._v("在"),s("code",[a._v("~/.acme.sh/account.conf")]),a._v("文件中增加下列配置")]),a._v(" "),s("div",{staticClass:"language-conf line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v("export HE_Usernmae='username'\nexport HE_Password='password'\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br")])]),s("p",[a._v("其他服务商见"),s("a",{attrs:{href:"https://github.com/acmesh-official/acme.sh/wiki/dnsapi",target:"_blank",rel:"noopener noreferrer"}},[a._v("Github"),s("OutboundLink")],1)]),a._v(" "),s("h2",{attrs:{id:"签发"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#签发"}},[a._v("#")]),a._v(" 签发")]),a._v(" "),s("p",[s("code",[a._v("./acme.sh --issue -d YOUR.com -d '*.YOUR.com' -k ec-256 --dns dns_he --dnssleep 60")])]),a._v(" "),s("h2",{attrs:{id:"安装证书到指定位置"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#安装证书到指定位置"}},[a._v("#")]),a._v(" 安装证书到指定位置")]),a._v(" "),s("p",[s("code",[a._v('./acme.sh --install-cert -d YOUR.com --ecc --key-file /etc/nginx/ssl/YOUR.com.key --fullchain-file /etc/nginx/ssl/YOUR.com_fullchain.cer --reloadcmd "docker restart nginx"')])]),a._v(" "),s("h2",{attrs:{id:"检查cron表达式是否有效"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#检查cron表达式是否有效"}},[a._v("#")]),a._v(" 检查CRON表达式是否有效")]),a._v(" "),s("p",[s("code",[a._v("./acme.sh --cron")])]),a._v(" "),s("h2",{attrs:{id:"自动更新证书"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#自动更新证书"}},[a._v("#")]),a._v(" 自动更新证书")]),a._v(" "),s("p",[a._v("脚本会把自己添加到crontab里自动运行，不需要额外处理")]),a._v(" "),s("h2",{attrs:{id:"手动更新证书"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#手动更新证书"}},[a._v("#")]),a._v(" 手动更新证书")]),a._v(" "),s("div",{staticClass:"language-shell line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# 更新一个证书")]),a._v("\nacme.sh "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("--renew")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-d")]),a._v(" example.com "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("--ecc")]),a._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# 更新所有证书")]),a._v("\nacme.sh --renew-all\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# 运行 cronjob 来更新证书（可用于检查 cronjob 命令是否正确）")]),a._v("\nacme.sh "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("--cron")]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br"),s("span",{staticClass:"line-number"},[a._v("8")]),s("br")])]),s("h2",{attrs:{id:"参考资料"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#参考资料"}},[a._v("#")]),a._v(" 参考资料")]),a._v(" "),s("ul",[s("li",[s("a",{attrs:{href:"https://blog.dalutou.com/posts/issue-a-free-wildcard-ssl-certificate-with-acme-sh/",target:"_blank",rel:"noopener noreferrer"}},[a._v("使用 acme.sh 签发免费的通配符 SSL 证书"),s("OutboundLink")],1)])])])}),[],!1,null,null,null);s.default=r.exports}}]);