(window.webpackJsonp=window.webpackJsonp||[]).push([[124],{559:function(e,n,o){"use strict";o.r(n);var t=o(2),i=Object(t.a)({},(function(){var e=this,n=e._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[n("h1",{attrs:{id:"windows修改itunes备份文件夹路径"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#windows修改itunes备份文件夹路径"}},[e._v("#")]),e._v(" Windows修改iTunes备份文件夹路径")]),e._v(" "),n("p",[e._v("iTunes默认将iPhone/iPad的备份文件保存在C盘，动辄100G以上的备份对于C盘压力不小，因此希望将备份文件放到数据盘。")]),e._v(" "),n("p",[e._v("iTunes默认未提供此选项，需要使用Windows的软链接来实现，整体思路参考了"),n("a",{attrs:{href:"https://zhuanlan.zhihu.com/p/419358584",target:"_blank",rel:"noopener noreferrer"}},[e._v("知乎上的文章"),n("OutboundLink")],1),e._v(",略有变化。")]),e._v(" "),n("ol",[n("li",[e._v("找到原备份存储目录，截止本文的2023年11月，目录在"),n("code",[e._v("C:\\Users\\[你的用户名]\\AppData\\Roaming\\Apple Computer\\MobileSync")]),e._v("，目录下")]),e._v(" "),n("li",[e._v("删除上述目录已有的所有文件，或者移动到其他位置待软链接完成后再迁移到新的目录")]),e._v(" "),n("li",[e._v("新建目标文件夹，如"),n("code",[e._v("E:\\iPhoneBackuo")])]),e._v(" "),n("li",[e._v("建立链接，这里一定要使用cmd(powershell不行)，输入"),n("code",[e._v('MkLink /J "%AppData%\\Apple Computer\\MobileSync\\Backup" "E:\\iPhoneBackup"')]),e._v("，当出现下述提示时表示成功\n"),n("ol",[n("li",[n("blockquote",[n("p",[e._v("为 C:\\Users[username]\\AppData\\Roaming\\Apple Computer\\MobileSync\\Backup <<===>> E:\\iPhoneBackup 创建的联接")])])])])]),e._v(" "),n("li",[e._v("如果第2步有迁移过旧备份文件，则迁移回新的目录")])])])}),[],!1,null,null,null);n.default=i.exports}}]);