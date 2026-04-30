---
date: 2018-11-24
categories:
  - JS
tags:
  - JS
publish: true
---

# 模块化：module.exports, exports, require, export/import

## 模块化标准

### 1. CommonJS

- **标准**：Node.js使用的模块化标准
- **导出**：`module.exports` 或 `exports`
- **导入**：`require()`
- **特点**：
  - 运行时加载
  - 同步加载
  - 值的拷贝
  - 可以在条件语句中使用

```js
// 导出
module.exports = {
    name: 'module1',
    foo: function() {
        console.log('foo');
    }
}

// 或者使用exports
exports.name = 'module1';
exports.foo = function() {
    console.log('foo');
}

// 导入
const module1 = require('./module1');
console.log(module1.name);
module1.foo();
```

**注意**：`exports` 是 `module.exports` 的引用，如果直接给 `exports` 赋值，会断开引用关系。

### 2. ES Modules

- **标准**：ES6引入的模块化标准
- **导出**：`export` 或 `export default`
- **导入**：`import`
- **特点**：
  - 编译时加载
  - 异步加载
  - 值的引用
  - 静态分析

```js
// 导出
export const name = 'module1';
export function foo() {
    console.log('foo');
}

// 或者使用export default
export default {
    name: 'module1',
    foo: function() {
        console.log('foo');
    }
}

// 导入
import { name, foo } from './module1.js';
console.log(name);
foo();

// 或者导入默认导出
import module1 from './module1.js';
console.log(module1.name);
module1.foo();
```

## 浏览器支持

### 1. 传统方式

```html
<script src="module1.js"></script>
<script>
    // 可以使用module1导出的全局变量
</script>
```

### 2. ES Modules

```html
<script type="module" src="module1.js"></script>
```

**注意**：现代浏览器都支持ES Modules，但需要在服务器环境下运行。

## Node.js支持

### 1. CommonJS（默认）

Node.js默认使用CommonJS标准：

```js
// package.json
{
    "type": "commonjs"  // 或者不设置，默认就是commonjs
}
```

### 2. ES Modules

Node.js从v12开始支持ES Modules：

```js
// package.json
{
    "type": "module"
}
```

或者使用 `.mjs` 扩展名：

```js
// module1.mjs
export const name = 'module1';
```

## 实际应用

### 1. 条件导入

```js
// CommonJS
if (condition) {
    const module1 = require('./module1');
}

// ES Modules（不支持条件导入）
// 需要使用动态import
if (condition) {
    import('./module1.js').then(module1 => {
        // 使用module1
    });
}
```

### 2. 循环依赖

```js
// a.js
const b = require('./b');
console.log('a');
module.exports = 'a';

// b.js
const a = require('./a');
console.log('b');
console.log(a); // {}
module.exports = 'b';
```

**注意**：CommonJS在处理循环依赖时，会返回一个未完成的对象。

## 总结

| 标准 | 导出 | 导入 | 特点 |
|------|------|------|------|
| CommonJS | `module.exports` | `require()` | 运行时加载，值的拷贝 |
| ES Modules | `export` | `import` | 编译时加载，值的引用 |

## 参考

- [Node.js: Modules](https://nodejs.org/api/modules.html)
- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [ES6 Modules in Node.js](https://nodejs.org/api/esm.html)
