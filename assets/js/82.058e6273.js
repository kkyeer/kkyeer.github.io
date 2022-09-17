(window.webpackJsonp=window.webpackJsonp||[]).push([[82],{606:function(s,t,a){"use strict";a.r(t);var n=a(6),e=Object(n.a)({},(function(){var s=this,t=s.$createElement,a=s._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("h1",{attrs:{id:"修复ubuntu系统下idea中文输入法不跟随光标问题"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#修复ubuntu系统下idea中文输入法不跟随光标问题"}},[s._v("#")]),s._v(" 修复Ubuntu系统下IDEA中文输入法不跟随光标问题")]),s._v(" "),a("h2",{attrs:{id:"下载编译jetbrainsruntime"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#下载编译jetbrainsruntime"}},[s._v("#")]),s._v(" 下载编译JetBrainsRuntime")]),s._v(" "),a("blockquote",[a("p",[a("strong",[s._v("注意，单纯使用这种方式编译的JDK缺少JCEF，会导致某些插件无法使用（比如leetcode插件）")])])]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" clone https://gitee.com/mirrors_JetBrains/JetBrainsRuntime.git\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" clone https://github.com/prehonor/myJetBrainsRuntime.git\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("cp")]),s._v(" myJetBrainsRuntime/idea.patch JetBrainsRuntime/\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" JetBrainsRuntime\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# git checkout cfc3e87f2ac27a0b8c78c729c113aa52535feff6")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" apply idea.patch\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("apt-get")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" autoconf "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v(" build-essential libx11-dev libxext-dev libxrender-dev libxtst-dev libxt-dev libxrandr-dev libcups2-dev libfontconfig1-dev libasound2-dev openjdk-11-jdk\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sh")]),s._v(" ./configure --disable-warnings-as-errors\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v(" images\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br")])]),a("p",[s._v("如果使用上面的JDK启动IDEA，出现下面报错，说明有插件使用了JCEF，则编译时需要带入jcef")]),s._v(" "),a("p",[a("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/IDEA_missing_jcef.png",alt:"IDEA_missing_jcef"}})]),s._v(" "),a("blockquote",[a("p",[s._v("带JCEF的版本")])]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("export")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token assign-left variable"}},[s._v("JDK_11")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("/usr/lib/jvm/java-11-openjdk-amd64\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("export")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token assign-left variable"}},[s._v("ANT_HOME")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("PATH_TO_APACHE_ANT/apache-ant-1.9.16\n\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" clone https://gitee.com/mirrors_JetBrains/JetBrainsRuntime.git\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" clone https://github.com/prehonor/myJetBrainsRuntime.git\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" clone https://github.com/JetBrains/jcef.git\n\n\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" jcef\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("mkdir")]),s._v("  -p jcef_build "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("&&")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" jcef_build\ncmake -G "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Unix Makefiles"')]),s._v(" -DCMAKE_BUILD_TYPE"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("Release "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v(" -j4\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v("/jb/tools/linux "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("&&")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("chmod")]),s._v(" +x *\n./build.sh all\n\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v("/"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v("/"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v("/"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v("/JetBrainsRuntime/\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("cp")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v("/myJetBrainsRuntime/idea.patch ./\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" apply idea.patch\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("mkdir")]),s._v(" -p jcef_linux_x64\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("tar")]),s._v(" xzf "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v("/jcef/jcef_linux_x64.tar.gz -C jcef_linux_x64\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("export")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token assign-left variable"}},[s._v("MODULAR_SDK_PATH")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("jcef_linux_x64/modular-sdk\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("apt-get")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" autoconf "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v(" build-essential libx11-dev libxext-dev libxrender-dev libxtst-dev libxt-dev libxrandr-dev libcups2-dev libfontconfig1-dev libasound2-dev openjdk-11-jdk\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v(" clean\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sh")]),s._v(" ./configure --disable-warnings-as-errors --with-import-modules"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("jcef_linux_x64/modular-sdk\njb/project/tools/linux/scripts/mkimages_x64.sh "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("11")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" 13b1751 jcef\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br"),a("span",{staticClass:"line-number"},[s._v("17")]),a("br"),a("span",{staticClass:"line-number"},[s._v("18")]),a("br"),a("span",{staticClass:"line-number"},[s._v("19")]),a("br"),a("span",{staticClass:"line-number"},[s._v("20")]),a("br"),a("span",{staticClass:"line-number"},[s._v("21")]),a("br"),a("span",{staticClass:"line-number"},[s._v("22")]),a("br"),a("span",{staticClass:"line-number"},[s._v("23")]),a("br"),a("span",{staticClass:"line-number"},[s._v("24")]),a("br"),a("span",{staticClass:"line-number"},[s._v("25")]),a("br")])]),a("p",[s._v("最终构建产物为JetBrainsRuntime文件夹下的jbr_jcef-11-linux-x64-b13b1751.tar.gz")]),s._v(" "),a("h2",{attrs:{id:"修改idea启动参数-使用自己编译的运行时"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#修改idea启动参数-使用自己编译的运行时"}},[s._v("#")]),s._v(" 修改IDEA启动参数，使用自己编译的运行时")]),s._v(" "),a("h3",{attrs:{id:"方法1-idea内修改jdk"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#方法1-idea内修改jdk"}},[s._v("#")]),s._v(" 方法1 IDEA内修改JDK")]),s._v(" "),a("p",[s._v("IDEA内双击shift按键，输入Choose Boot 后，出现下面提示，根据提示选择刚才编译后的JDK")]),s._v(" "),a("p",[a("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/kkyeer/picbed/IDEA_Choose_Runtime.png",alt:"IDEA_Choose_Runtime"}})]),s._v(" "),a("h3",{attrs:{id:"方法2-修改文件参数"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#方法2-修改文件参数"}},[s._v("#")]),s._v(" 方法2 修改文件参数")]),s._v(" "),a("p",[s._v("修改文件: home/idea-2020.1/bin/idea.sh (找到你自己的idea的安装路径)")]),s._v(" "),a("p",[s._v("在文件开头添加环境变量，指向你自己的编译的JDK所在目录")]),s._v(" "),a("div",{staticClass:"language-sh line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-sh"}},[a("code",[a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("export")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token assign-left variable"}},[s._v("IDEA_JDK")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("PATH_TO_HOME/JetBrainsRuntime/build/linux-x86_64-normal-server-release/jdk\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br")])]),a("h2",{attrs:{id:"参考资料"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#参考资料"}},[s._v("#")]),s._v(" 参考资料")]),s._v(" "),a("ul",[a("li",[a("a",{attrs:{href:"https://bbs.archlinuxcn.org/viewtopic.php?id=10529",target:"_blank",rel:"noopener noreferrer"}},[s._v("fcitx输入法在Intellij IDEA开发工具中输入法候选框无法跟随光标"),a("OutboundLink")],1)]),s._v(" "),a("li",[a("a",{attrs:{href:"https://blog.csdn.net/u011166277/article/details/106287587",target:"_blank",rel:"noopener noreferrer"}},[s._v("IDEA 中文输入法定位不准问题修复(fcitx框架输入法)"),a("OutboundLink")],1)]),s._v(" "),a("li",[a("a",{attrs:{href:"https://github.com/JetBrains/JetBrainsRuntime/issues/86",target:"_blank",rel:"noopener noreferrer"}},[s._v("JetBrains Runtime关于JCEF的issue"),a("OutboundLink")],1)]),s._v(" "),a("li",[a("a",{attrs:{href:"https://github.com/RikudouPatrickstar/JetBrainsRuntime-for-Linux-x64/blob/master/.github/workflows/jbr-linux-x64.yml",target:"_blank",rel:"noopener noreferrer"}},[s._v("开发者的Github Action文件"),a("OutboundLink")],1)])])])}),[],!1,null,null,null);t.default=e.exports}}]);