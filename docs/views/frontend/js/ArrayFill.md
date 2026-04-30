---
date: 2018-11-24
categories:
  - JS
tags:
  - JavaScript
  - Array
publish: true
---

# Array.prototype.fill()

## 定义

`fill()` 方法用一个固定值填充一个数组中从起始索引到终止索引内的全部元素。不包括终止索引。

## 语法

```js
arr.fill(value[, start[, end]])
```

### 参数

- **value**: 用来填充数组元素的值
- **start**（可选）: 起始索引，默认值为0
- **end**（可选）: 终止索引，默认值为 `arr.length`

### 返回值

修改后的数组。

## 示例

### 1. 基本用法

```js
let array1 = [1, 2, 3, 4];

// 从索引2开始填充0，直到索引4（不包括4）
console.log(array1.fill(0, 2, 4));
// [1, 2, 0, 0]

// 从索引1开始填充5
console.log(array1.fill(5, 1));
// [1, 5, 5, 5]

// 填充整个数组
console.log(array1.fill(6));
// [6, 6, 6, 6]
```

### 2. 创建固定长度数组

```js
// 创建长度为5的数组，全部填充为0
let arr = new Array(5).fill(0);
console.log(arr); // [0, 0, 0, 0, 0]
```

### 3. 二维数组初始化

```js
// 创建3x4的二维数组
let matrix = new Array(3).fill(null).map(() => new Array(4).fill(0));
console.log(matrix);
// [[0, 0, 0, 0],
//  [0, 0, 0, 0],
//  [0, 0, 0, 0]]
```

### 4. 填充对象（注意引用问题）

```js
// 注意：fill填充的是同一个引用
let arr = new Array(3).fill({ name: 'test' });
console.log(arr);
// [{ name: 'test' }, { name: 'test' }, { name: 'test' }]

arr[0].name = 'changed';
console.log(arr);
// [{ name: 'changed' }, { name: 'changed' }, { name: 'changed' }]

// 正确做法：使用map创建新对象
let arr2 = new Array(3).fill(null).map(() => ({ name: 'test' }));
arr2[0].name = 'changed';
console.log(arr2);
// [{ name: 'changed' }, { name: 'test' }, { name: 'test' }]
```

## 注意事项

1. `fill()` 会修改原数组
2. 如果 `start` 或 `end` 为负数，会从数组末尾开始计算
3. 如果 `start` 大于数组长度，不会填充任何元素
4. 如果 `end` 大于数组长度，会填充到数组末尾

## 实际应用场景

### 1. 初始化数组

```js
// 初始化一个长度为10的数组，值为索引
let arr = new Array(10).fill(0).map((_, i) => i);
console.log(arr); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### 2. 重置数组

```js
let arr = [1, 2, 3, 4, 5];
arr.fill(0);
console.log(arr); // [0, 0, 0, 0, 0]
```

### 3. 创建测试数据

```js
// 创建100个测试数据
let testData = new Array(100).fill(null).map((_, i) => ({
    id: i,
    name: `user_${i}`,
    age: Math.floor(Math.random() * 50) + 18
}));
```

## 兼容性

- ES6+ 支持
- IE不支持
- 需要polyfill或转译

## 参考

- [MDN: Array.prototype.fill()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
