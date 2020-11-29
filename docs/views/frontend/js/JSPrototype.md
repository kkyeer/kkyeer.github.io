---
date: 2019-05-14
categories:
  - 前端
tags:
  - JS
publish: true
---

# JS：prototype chain

## 定义

每个JS对象都有一个prototype，这个prototype又有自己的prototype，以此类推直到某个对象的prototype 是null为止，一个一个串成链

## 获取

- ECMA2015:Object.getPrototypeOf(),对应的是Object.setPrototypeOf()
- 大部分浏览器实现:Object.\__proto__

## 注意点

1. **函数的func.prototype表示的是当此函数作为构造器时，构造的对象对应的prototype链接**

```JavaScript
let f1 = function () {
    this.a = 1;
    this.b = 2
}
let obj1 = new f1();
console.log(Object.getPrototypeOf(obj1));// f1{}
console.log(obj1.a);//1
console.log(obj1.c);// undefined
f1.prototype.c = 3;
console.log(obj1.a);//1
console.log(obj1.c);//3
```

## 继承到的“方法”

当一个对象继承到的方法被执行时，方法内部的this指向的是当前继承到方法的对象

```javascript
let animal = {
    name: 'animal',
    getName: function () {
        return this.name;
    },
    getNameArrow: () => {
        return this.name
    }
}
console.log(animal.getName()); // animal
console.log(animal.getNameArrow()); // undefined,因为箭头函数定义时的上下文为全局作用域
let cat = Object.create(animal);
cat.name = 'cat'
console.log(cat.getName()); // cat
console.log(cat.getNameArrow()); // undefined,因为箭头函数定义时的上下文为全局作用域
```

## 使用原型链

1. 函数原型作为构造器

    ```javascript
    function animal() {}
    animal.prototype.name = 'noname'
    let cat = new animal()
    console.log(cat.name);// noname
    ```

2. 函数原型上的属性会被以函数作为构造器的实例类获取

```js
function gen1() {}
gen1.prototype.foo = "bar"
let gen2 = new gen1();
gen2.prop = "some prop"
console.log(`gen2.prop:${gen2.prop}`);
console.log(`gen2.foo :${gen2.foo}`);
console.log(`gen1.prop:${gen1.prop}`);
console.log(`gen1.foo :${gen1.foo}`);
console.log(`gen1.prototype.prop:${gen1.prototype.prop}`);
console.log(`gen1.prototype.foo:${gen1.prototype.foo}`);
//
gen2.prop:some prop
gen2.foo :bar
gen1.prop:undefined
gen1.foo :undefined
gen1.prototype.prop:undefined
gen1.prototype.foo:bar
```

## 创建对象的几种方法及相关原型链

1. 语法构造器

    ```js
    //  直接构造的对象原型链o1 ---> Object.prototype ---> null
    let o1 = {
        a: 1
    }
    console.log(o1.__proto__ === Object.prototype); // true
    // 函数的原型为Function.prototype
    let f1 = function () {}
    console.log(f1.__proto__ === Function.prototype); // true
    // 数组的原型为Array.prototype,Array.prototype的原型为Object.prototype
    let a1 = ['1asdf', 'asdf']
    console.log(a1.__proto__ === Array.prototype); // true
    console.log(a1.__proto__.__proto__ === Object.prototype);// true
    ```

2. 使用构造器：即new 后加函数

    ```js
    function animal() {
        this.name = 'ani'
    }
    let cat = new animal();
    console.log(cat.__proto__ === animal.prototype); // true
    console.log(animal.prototype.__proto__ === Object.prototype); // true
    ```

3. Object.create()

    ```js
    let o = {
        name: 'ooo'
    }
    let o2 = Object.create(o)
    console.log(o2.__proto__ === o);// true
    ```

4. class关键词

    ```js
    'use strict'
    class animal {
        constructor(age) {
            this.age = age;
        }
    }

    class cat extends animal {
        constructor(age, name) {
            super(age)
            this.name = name
        }
        get desc() {
            return this.name + ':' + this.age
        }
        set realName(catN) {
            this.name = catN
        }
    }
    let pet = new cat(12, 'kitty');
    console.log(pet.desc);// kitty:12
    pet.realName = 'mojo'
    console.log(pet.desc);// mojo:12
    ```

### 各种方式优劣势比较

[优劣势比较](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#Summary_of_methods_for_extending_the_protoype_chain)

## 关注Performance

- 寻找属性时，在没找到前总是会沿着原型链往上找
- 若整条链上没有这个属性，则总会走完完整的原型链
- 若不想从原型链往上tranverse,可以调用obj.hasOwnProperty()

    ```js
    let o = {
        name: 'ooo'
    }
    let o2 = Object.create(o)
    console.log(o2.__proto__ === o); // true
    console.log(o2.hasOwnProperty('name')); // false
    ```

参考：
[Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#Summary_of_methods_for_extending_the_protoype_chain)
