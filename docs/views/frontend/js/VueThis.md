---
date: 2018-11-24
categories:
  - JS
tags:
  - JS
publish: true
---

# Vue中的this

## 严格模式

ES5定义的内容，进入标志为 `"use strict"`。

严格模式下，this的值不再指向全局对象。

```js
function strict() {
    'use strict';
    return this;
}
console.log(strict()); // undefined
```

## Vue生命周期钩子中的this

所有的生命周期钩子自动绑定 `this` 上下文到实例中，因此你可以访问数据，对属性和方法进行运算。

**注意**：你不能使用箭头函数来定义一个生命周期方法（例如 `created: () => this.fetchTodos()`）。这是因为箭头函数绑定了父上下文，因此 `this` 与你期待的 Vue 实例不同。

### 示例

```js
export default {
    data() {
        return {
            message: 'Hello Vue!'
        }
    },
    created() {
        // 正确：this指向Vue实例
        console.log(this.message); // Hello Vue!
        
        // 错误：箭头函数中的this指向父上下文（window）
        // setTimeout(() => {
        //     console.log(this.message); // undefined
        // }, 100);
        
        // 正确：使用普通函数
        setTimeout(function() {
            console.log(this.message); // Hello Vue!
        }, 100);
    }
}
```

## Vue方法中的this

在Vue组件的方法中，`this` 指向当前Vue实例：

```js
export default {
    data() {
        return {
            count: 0
        }
    },
    methods: {
        increment() {
            // this指向Vue实例
            this.count++;
            console.log(this.count);
        },
        decrement() {
            // 箭头函数中的this指向父上下文（Vue实例）
            setTimeout(() => {
                this.count--;
                console.log(this.count);
            }, 100);
        }
    }
}
```

## Vue计算属性中的this

在计算属性中，`this` 同样指向当前Vue实例：

```js
export default {
    data() {
        return {
            firstName: 'John',
            lastName: 'Doe'
        }
    },
    computed: {
        fullName() {
            // this指向Vue实例
            return this.firstName + ' ' + this.lastName;
        }
    }
}
```

## Vue侦听器中的this

在侦听器中，`this` 指向当前Vue实例：

```js
export default {
    data() {
        return {
            searchQuery: ''
        }
    },
    watch: {
        searchQuery(newVal, oldVal) {
            // this指向Vue实例
            console.log('Search query changed:', this.searchQuery);
        }
    }
}
```

## 常见问题

### 1. 箭头函数导致的this问题

```js
export default {
    data() {
        return {
            items: []
        }
    },
    methods: {
        fetchItems() {
            // 错误：箭头函数中的this指向父上下文
            // axios.get('/api/items').then((response) => {
            //     this.items = response.data; // this不是Vue实例
            // });
            
            // 正确：使用普通函数
            axios.get('/api/items').then(function(response) {
                this.items = response.data;
            });
            
            // 或者使用箭头函数但保存this引用
            const vm = this;
            axios.get('/api/items').then((response) => {
                vm.items = response.data;
            });
        }
    }
}
```

### 2. 事件处理函数中的this

```html
<template>
    <button @click="handleClick">Click me</button>
</template>

<script>
export default {
    methods: {
        handleClick() {
            // this指向Vue实例
            console.log('Button clicked');
            console.log(this); // Vue实例
        }
    }
}
</script>
```

## 最佳实践

1. **避免在Vue生命周期钩子和方法中使用箭头函数**
2. **需要在回调中访问Vue实例时，使用普通函数或保存this引用**
3. **使用ES6的class语法时，确保正确绑定this**

```js
// 使用bind绑定this
export default {
    methods: {
        handleClick: function() {
            console.log(this);
        }.bind(this)
    }
}
```

## 总结

| 场景 | this指向 | 是否可使用箭头函数 |
|------|----------|-------------------|
| 生命周期钩子 | Vue实例 | ❌ |
| methods | Vue实例 | ❌ |
| 计算属性 | Vue实例 | ❌ |
| 侦听器 | Vue实例 | ❌ |
| 事件处理函数 | Vue实例 | ❌ |

## 参考

- [Vue.js: The Vue Instance](https://vuejs.org/v2/guide/instance.html)
- [Vue.js: Methods](https://vuejs.org/v2/guide/events.html)
