---
date: 2018-11-24
categories:
  - 前端
tags:
  - JS
publish: true
---

# 模块化module.exports,exports,require,export/import

- module.exports/exports：CommonJS标准定义的模块导出方法，仅在Node环境中可用
- export/import：ES6定义的导出导入方法，只有ES6支持
- require：ES6和node都支持的导入方法：使用方法为let a = require('路径')
- module.exports属性表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取module.exports变量
- exports：node在每一个模块头部隐式的定义了一个exports变量，即var exports=module.exports，若导出的为函数，则只能使用module.exports

备注：export/import 语法现在node原生不支持，浏览器也不支持，实际使用中都是babel插件转化的，所以尽量不要用

## 参考：

- 阮一峰博客 http://javascript.ruanyifeng.com/nodejs/module.html#toc0
- 另一篇博客：https://segmentfault.com/a/1190000010426778