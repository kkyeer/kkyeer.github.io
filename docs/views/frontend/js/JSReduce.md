---
date: 2019-05-14
categories:
  - JS
tags:
  - JS
publish: true
---

# JS: Array.prototype.reduce

## 定义

reduce是js里Array.prototype的方法，用来通过给定的函数，对数组进行迭代后得到单值。

## 用法

### arr.reduce(callback[, initialValue])

1. 回调函数callback的入参如下：

   - **accumulator**: 上次调用此回调得到的值，如果提供initialValue的话，初始值是initialValue，否则初始值为数组第一个值
   - **currentValue**: 当前迭代到的值
   - **currentIndex（可选参数）**: 当前迭代到的索引，默认初始为1，当有initialValue的时候，初始为0
   - **array（可选参数）**: 被迭代的数组

2. initialValue是初始值

## 示例

### 1. 无initialValue的情况

第一次迭代时，accumulator为数组第一个元素，currentValue为数组第二个元素：

```javascript
let arr1 = ['tom', 'and', 'jerry']

let count = 1;
let result1 = arr1.reduce(
    (acc, crtValue, crtIndex) => {
        console.log(`第${count++}次迭代的acc:${acc}, index:${crtIndex}`);
        return acc + '-' + crtValue;
    }
)
console.log(`迭代完成，共${count}次迭代，结果:${result1}`);
```

输出：
```
第1次迭代的acc:tom, index:1
第2次迭代的acc:tom-and, index:2
迭代完成，共3次迭代，结果:tom-and-jerry
```

### 2. 有initialValue的情况

第一次迭代时，accumulator为initialValue，currentValue为数组第一个元素：

```javascript
let arr1 = ['tom', 'and', 'jerry']

let count = 1;
let result1 = arr1.reduce(
    (acc, crtValue, crtIndex) => {
        console.log(`第${count++}次迭代的acc:${acc}, index:${crtIndex}`);
        return acc + '-' + crtValue;
    },
    'I would like to see'
)
console.log(`迭代完成，共${count}次迭代，结果:${result1}`);
```

输出：
```
第1次迭代的acc:I would like to see, index:0
第2次迭代的acc:I would like to see-tom, index:1
第3次迭代的acc:I would like to see-tom-and, index:2
迭代完成，共4次迭代，结果:I would like to see-tom-and-jerry
```

## 常见用法

### 1. 数组求和

```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, cur) => acc + cur, 0);
console.log(sum); // 15
```

### 2. 数组去重

```javascript
const arr = [1, 2, 2, 3, 3, 4];
const unique = arr.reduce((acc, cur) => {
    if (!acc.includes(cur)) {
        acc.push(cur);
    }
    return acc;
}, []);
console.log(unique); // [1, 2, 3, 4]
```

### 3. 统计字符出现次数

```javascript
const str = 'hello world';
const count = str.split('').reduce((acc, cur) => {
    acc[cur] = (acc[cur] || 0) + 1;
    return acc;
}, {});
console.log(count); // {h: 1, e: 1, l: 3, o: 2, ' ': 1, w: 1, r: 1, d: 1}
```

### 4. 二维数组转一维

```javascript
const arr = [[1, 2], [3, 4], [5, 6]];
const flat = arr.reduce((acc, cur) => acc.concat(cur), []);
console.log(flat); // [1, 2, 3, 4, 5, 6]
```

## 注意事项

1. 如果数组为空且没有提供initialValue，会抛出TypeError
2. reduce不会改变原数组
3. 回调函数中return的值会作为下一次迭代的accumulator

## 参考

- [MDN: Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
