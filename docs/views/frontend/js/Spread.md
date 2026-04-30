---
date: 2018-11-24
categories:
  - JS
tags:
  - JS
publish: true
---

# JS的展开语法(...)

## 1. Rest操作符

用在函数参数列表里，收集参数列表 `...args`：

```js
function funcName(...args) {
    // 此时args等同于arguments，参数名args可随意定义
    console.log(args);
}

test('ha', 'hei')
// ["ha", "hei"]
```

### 进阶用法

```js
function func2(param1, ...param2) {
    console.log(param1);
    console.log(param2);
}

func2('p1', 'p2')
// p1
// ["p2"]
```

## 2. Spread操作符

用于展开数组或对象：

### 2.1 解构数组

```js
let arr = ['str1', 'str2', 'str3']
let [arr1, ...arr2] = arr;
console.log(arr1) // str1
console.log(arr2) // ["str2", "str3"]
```

### 2.2 构造数组

```js
let arr = ['str1', 'str2', 'str3']
let arrb = ['str4', 'str5']
let arrc = [...arr, ...arrb]
console.log(arrc)
// ["str1", "str2", "str3", "str4", "str5"]
```

### 2.3 复制数组

```js
let arr = [1, 2, 3]
let arrCopy = [...arr]
console.log(arrCopy) // [1, 2, 3]
console.log(arr === arrCopy) // false
```

## 3. 对象展开

### 3.1 复制对象

```js
let obj = { a: 1, b: 2 }
let objCopy = { ...obj }
console.log(objCopy) // { a: 1, b: 2 }
console.log(obj === objCopy) // false
```

### 3.2 合并对象

```js
let obj1 = { a: 1, b: 2 }
let obj2 = { b: 3, c: 4 }
let merged = { ...obj1, ...obj2 }
console.log(merged) // { a: 1, b: 3, c: 4 }
```

**注意**：后面的属性会覆盖前面的同名属性。

## 4. 实际应用场景

### 4.1 函数调用

```js
function add(a, b, c) {
    return a + b + c;
}

let numbers = [1, 2, 3]
console.log(add(...numbers)) // 6
```

### 4.2 数组拼接

```js
let arr1 = [1, 2]
let arr2 = [3, 4]
let arr3 = [5, 6]

let combined = [...arr1, ...arr2, ...arr3]
console.log(combined) // [1, 2, 3, 4, 5, 6]
```

### 4.3 获取数组最大值

```js
let numbers = [5, 2, 8, 1, 9]
let max = Math.max(...numbers)
console.log(max) // 9
```

## 总结

| 用法 | 语法 | 说明 |
|------|------|------|
| Rest | `...args` | 收集参数到数组 |
| Spread | `...arr` | 展开数组或对象 |
| 解构 | `let [a, ...b] = arr` | 提取部分元素 |
| 复制 | `[...arr]` 或 `{...obj}` | 浅拷贝 |
| 合并 | `[...arr1, ...arr2]` | 合并数组或对象 |

## 参考

- [MDN: Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN: Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
