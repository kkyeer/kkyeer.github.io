---
date: 2018-11-24
categories:
  - JS
tags:
  - JavaScript
  - Array
  - map
publish: true
---

# Array.prototype.map()

## 定义

`map()` 方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。

## 语法

```js
arr.map(callback(currentValue[, index[, array]])[, thisArg])
```

### 参数

- **callback**: 生成新数组元素的函数，接收三个参数：
  - **currentValue**: 当前正在处理的元素
  - **index**（可选）: 当前正在处理的元素的索引
  - **array**（可选）: 调用 `map` 的数组
- **thisArg**（可选）: 执行 `callback` 函数时使用的 `this` 值

### 返回值

一个新数组，每个元素都是回调函数的返回值。

## 示例

### 1. 基本用法

```js
let arr = ['adsf', 'uio', 'jnzxcv']
let arrb = arr.map(
    (val, index, arr) => {
        console.log(`${val}-${index}-${arr}`);
        return val + index;
    }
)
// adsf-0-adsf,uio,jnzxcv
// uio-1-adsf,uio,jnzxcv
// jnzxcv-2-adsf,uio,jnzxcv

console.log(arrb)
// ["adsf0", "uio1", "jnzxcv2"]
```

### 2. 数字处理

```js
let numbers = [1, 4, 9, 16];
let doubles = numbers.map(x => x * 2);
console.log(doubles); // [2, 8, 18, 32]

let roots = numbers.map(Math.sqrt);
console.log(roots); // [1, 2, 3, 4]
```

### 3. 对象数组处理

```js
let users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 35 }
];

let names = users.map(user => user.name);
console.log(names); // ['Alice', 'Bob', 'Charlie']

let ages = users.map(user => user.age);
console.log(ages); // [25, 30, 35]
```

### 4. 字符串处理

```js
let str = 'hello world';
let chars = str.split('').map(char => char.toUpperCase());
console.log(chars.join('')); // HELLO WORLD
```

## 注意事项

1. `map()` 不会修改原数组
2. `map()` 不会对空数组进行检测
3. `map()` 返回的是一个新数组
4. 如果需要修改原数组，应该使用 `forEach()`

## 与 forEach 的区别

```js
let arr = [1, 2, 3, 4, 5];

// map 返回新数组
let mapped = arr.map(x => x * 2);
console.log(mapped); // [2, 4, 6, 8, 10]
console.log(arr); // [1, 2, 3, 4, 5] 原数组不变

// forEach 没有返回值
let forEached = arr.forEach(x => x * 2);
console.log(forEached); // undefined
console.log(arr); // [1, 2, 3, 4, 5] 原数组不变
```

## 链式调用

```js
let numbers = [1, 2, 3, 4, 5];

let result = numbers
    .filter(x => x % 2 === 0)  // 筛选偶数
    .map(x => x * 2)           // 乘以2
    .reduce((acc, cur) => acc + cur, 0); // 求和

console.log(result); // 12
```

## 实际应用场景

### 1. 数据转换

```js
let rawData = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
];

let formatted = rawData.map(user => ({
    value: user.id,
    label: user.name,
    description: user.email
}));
```

### 2. 提取特定属性

```js
let products = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 200 }
];

let prices = products.map(product => product.price);
console.log(prices); // [100, 200]
```

### 3. 格式化数据

```js
let dates = ['2023-01-01', '2023-02-15', '2023-03-20'];
let formattedDates = dates.map(date => {
    let [year, month, day] = date.split('-');
    return `${month}/${day}/${year}`;
});
console.log(formattedDates); // ['01/01/2023', '02/15/2023', '03/20/2023']
```

## 兼容性

- ES5+ 支持
- IE9+ 支持
- 需要polyfill或转译

## 参考

- [MDN: Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
