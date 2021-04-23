---
date: 2018-11-24
categories:
  - JS
tags:
  - JS
publish: true
---

# JS的展开语法(...)

1.rest操作符，用在函数参数列表里，结构参数列表...args
function [funcName](...args){
/* 此时args等同于arguments，参数名args可随意定义 */
}
示例：

```js
function test(...params){
    console.log(params);
}
test('ha','hei')
// [""ha"", ""hei""]
进阶用法：
function func2(param1,...param2){
    console.log(param1);
    console.log(param2);
}
func2('p1','p2')
// p1
// [""p2""]
```

2.spread参数
数据解构
示意：

```js
let arr = ['str1','str2','str3']
let [arr1,...arr2] = arr;
console.log(arr1)
// str1
console.log(arr2)
// [""str2"", ""str3""]
```

3.解构数组

```js
let arr = ['str1','str2','str3']
let [arr1,...arr2] = arr;
let arr = ['str1','str2','str3']
let [arr1,...arr2] = arr;
console.log(arr1)
// str1
console.log(arr2)
// [""str2"", ""str3""]
```

4.构造数组

```js
let arr=['str1','str2','str3']
let arrb = ['str4','str5']
let arrc = [...arr,...arrb]
console.log(arrc)
// Array(5) [ ""str1"", ""str2"", ""str3"", ""str4"", ""str5"" ]
```
