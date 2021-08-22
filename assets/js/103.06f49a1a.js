(window.webpackJsonp=window.webpackJsonp||[]).push([[103],{627:function(t,e,n){"use strict";n.r(e);var a=n(6),s=Object(a.a)({},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("h1",{attrs:{id:"mysql中innodb引擎的死锁检测"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#mysql中innodb引擎的死锁检测"}},[t._v("#")]),t._v(" MySQL中InnoDB引擎的死锁检测")]),t._v(" "),n("p",[t._v("MySQL官方提供了InnoDB引擎下，事务死锁的"),n("strong",[t._v("主动检测")]),t._v("与丢弃机制，官方允许通过"),n("code",[t._v("innodb_deadlock_detect")]),t._v("这个参数进行控制，默认开启。同时如果禁用此选项，依旧可以通过锁超时参数"),n("code",[t._v("innodb_lock_wait_timeout")]),t._v("来进行控制。对于这两个参数的取舍，"),n("a",{attrs:{href:"https://dev.mysql.com/doc/refman/5.7/en/innodb-deadlock-detection.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("官方的说明"),n("OutboundLink")],1),t._v("是")]),t._v(" "),n("blockquote",[n("p",[t._v("On high concurrency systems, deadlock detection can cause a slowdown when numerous threads wait for the same lock. At times, it may be more efficient to disable deadlock detection and rely on the innodb_lock_wait_timeout setting for transaction rollback when a deadlock occurs. Deadlock detection can be disabled using the innodb_deadlock_detect configuration option.")])]),t._v(" "),n("p",[t._v("对于主动检测到死锁后的丢弃，官方说明是丢弃小事务，此处大小的衡量依据是插入、更新、删除操作受影响的行数")]),t._v(" "),n("h2",{attrs:{id:"死锁检测原理"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#死锁检测原理"}},[t._v("#")]),t._v(" 死锁检测原理")]),t._v(" "),n("blockquote",[n("p",[t._v("If the LATEST DETECTED DEADLOCK section of InnoDB Monitor output includes a message stating TOO DEEP OR LONG SEARCH IN THE LOCK TABLE WAITS-FOR GRAPH, WE WILL ROLL BACK FOLLOWING TRANSACTION, this indicates that the number of transactions on the wait-for list has reached a limit of 200. A wait-for list that exceeds 200 transactions is treated as a deadlock and the transaction attempting to check the wait-for list is rolled back. The same error may also occur if the locking thread must look at more than 1,000,000 locks owned by transactions on the wait-for list.")])]),t._v(" "),n("p",[t._v("如果开启了死锁检测，那么在每次上锁之前，都会进行一次死锁检测，底层使用图遍历算法，对于并发量比较高的应用，每次进行死锁检测的消耗累积起来还是比较高。")]),t._v(" "),n("p",[t._v("图遍历中，过于深的检测会指数级递增的影响检测效率，这方面，MySQL限制最大为200，超过200则事务被认定为死锁，发起死锁检测的事务被回滚。")]),t._v(" "),n("div",{staticClass:"language-c line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-c"}},[n("code",[t._v("class DeadlockChecker"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" method "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("check_and_resolve")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("DeadlockChecker"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("::")]),t._v("check_and_resolve"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\nEvery "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("InnoDB")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("row"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("Lock")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" mode LOCK_S or LOCK_X"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" and type ORed with LOCK_GAP or\nLOCK_REC_NOT_GAP"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" ORed with LOCK_INSERT_INTENTION\n\nEnqueue a waiting request "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" a lock which cannot be granted immediately"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("lock_rec_enqueue_waiting")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br"),n("span",{staticClass:"line-number"},[t._v("7")]),n("br"),n("span",{staticClass:"line-number"},[t._v("8")]),n("br")])]),n("h2",{attrs:{id:"参考资料"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#参考资料"}},[t._v("#")]),t._v(" 参考资料")]),t._v(" "),n("ul",[n("li",[n("a",{attrs:{href:"https://fromdual.com/innodb-deadlock-detect-rather-hands-off",target:"_blank",rel:"noopener noreferrer"}},[t._v("博客"),n("OutboundLink")],1)]),t._v(" "),n("li",[n("a",{attrs:{href:"https://dev.mysql.com/doc/refman/5.7/en/innodb-deadlock-detection.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("官方文档中死锁检测的说明"),n("OutboundLink")],1)])])])}),[],!1,null,null,null);e.default=s.exports}}]);