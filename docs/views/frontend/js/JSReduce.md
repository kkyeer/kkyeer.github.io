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
reduce是js里Array.prototype的方法，用来通过给定的函数，对数组进行迭代后得到单值
## 用法
### arr.reduce(callback[, initialValue])
1. 回调函数callback的入参如下
- **accumulator**
上次调用此回调得到的值，如果提供initialValue的话，初始值是initialValue，否则初始值为数组第一个值

- **currentValue**
当前迭代到的值
- **currentIndex（可选参数）**
当前迭代到的索引，默认初始为1，当有initialValue的时候，初始为0
- **array（可选参数）**
被迭代的数组
2. initialValue是初始值

## 测试代码
```javascript
let arr1 = ['tom', 'and', 'jerry']

// 无initialValue的情况，第一次迭代acc为数组元素【0】
let arr1 = ['tom', 'and', 'jerry']

// 无initialValue的情况，第一次迭代acc为数组元素【0】
let count = 1;
let result1 = arr1.reduce(
    (acc, crtValue, crtIndex) => {
        console.log(`第${count++}次迭代的acc:${acc},index:${crtIndex}`);
        return acc + '-' + crtValue;
    }
)
console.log(`迭代完成，共${count++}次迭代，结果:${result1}`);
/*
第1次迭代的acc:tom,index:1
第2次迭代的acc:tom-and,index:2
迭代完成，共3次迭代，结果:tom-and-jerry
*/

count = 1;
result1 = arr1.reduce(
    (acc, crtValue, crtIndex) => {
        console.log(`第${count++}次迭代的acc:${acc},index:${crtIndex}`);
        return acc + '-' + crtValue;
    },
    'I would like to see'
)
console.log(`迭代完成，共${count++}次迭代，结果:${result1}`);
/*
第1次迭代的acc:I would like to see,index:0
第2次迭代的acc:I would like to see-tom,index:1
第3次迭代的acc:I would like to see-tom-and,index:2
迭代完成，共4次迭代，结果:I would like to see-tom-and-jerry
*/
```