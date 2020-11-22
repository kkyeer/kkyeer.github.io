---
date: 2018-11-24
categories:
  - FrontEnd
tags:
  - js
publish: true
---

# js: array.map

```js
array.map(callback(value,index,array))
```

将array映射成另外一个array，接受一个回调方法
callback的三个参数
0.value：迭代到的值
1.index：当前迭代的序号
2.array：数组
示例：

```js
let arr = ['adsf','uio','jnzxcv']
let arrb = arr.map(
    (val,index,arr)=>{
      console.log(`${val}-${index}-${arr}`);
      return val+index;
    }
)
// adsf-0-adsf,uio,jnzxcv
// uio-1-adsf,uio,jnzxcv
 // jnzxcv-2-adsf,uio,jnzxcv
console.log(arrb)
// [""adsf0"", ""uio1"", ""jnzxcv2""]
```
