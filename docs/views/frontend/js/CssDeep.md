---
date: 2018-11-24
categories:
  - JS
tags:
  - CSS
publish: true
---

# CSS Deep选择器

## 背景

HTML5 Web Components提供了完整的CSS样式封装。

这意味着：
- 在组件内定义的样式不会泄漏到页面其他部分
- 页面级别的样式不会修改组件自身的样式

然而，有时你可能需要从页面级别操纵组件内部Shadow DOM中的元素。为此，你需要在CSS选择器中使用 `/deep/`。

## 语法

### 1. `/deep/` 选择器

`/deep/` 选择器用于穿透Shadow DOM边界：

```css
html /deep/ [self-end] {
    /* 选择html元素下所有具有self-end属性的元素，包括Shadow DOM内部的 */
}
```

### 2. `::shadow` 伪类

`::shadow` 伪类用于选择Shadow DOM根元素：

```css
::shadow span {
    /* 选择Shadow DOM内部的span元素 */
}
```

## 示例

### HTML结构

```html
<div>
    <span>Outer</span>
    #shadow-root
    <my-component>
        <span>Inner</span>
    </my-component>
</div>
```

### CSS选择器

```css
/* 选择所有span元素，包括Shadow DOM内部的 */
html /deep/ span {
    color: red;
}

/* 只选择Shadow DOM内部的span元素 */
::shadow span {
    color: blue;
}
```

## 实际应用

### 1. 样式穿透

```css
/* 穿透第三方组件样式 */
.parent /deep/ .child {
    color: red;
}

/* Vue中使用 >>> */
.parent >>> .child {
    color: red;
}

/* Sass/LESS中使用 ::v-deep */
.parent ::v-deep .child {
    color: red;
}
```

### 2. Vue中的深度选择器

在Vue中，深度选择器用于修改子组件样式：

```vue
<template>
    <div class="parent">
        <ChildComponent />
    </div>
</template>

<style scoped>
/* 穿透scoped样式 */
.parent ::v-deep .child {
    color: red;
}
</style>
```

### 3. Angular中的深度选择器

```css
/* Angular中使用 ::ng-deep */
:host ::ng-deep .child {
    color: red;
}
```

## 注意事项

1. `/deep/` 和 `::shadow` 是实验性特性，可能不被所有浏览器支持
2. 现代框架（Vue、Angular、React）提供了自己的深度选择器语法
3. 深度选择器可能会破坏组件封装，应谨慎使用

## 兼容性

- Chrome 45+ 支持 `/deep/`
- Chrome 45+ 支持 `::shadow`
- 现代浏览器可能已移除这些特性
- 建议使用框架提供的深度选择器

## 替代方案

### 1. CSS变量

```css
/* 定义CSS变量 */
:root {
    --primary-color: red;
}

/* 在组件中使用 */
.child {
    color: var(--primary-color);
}
```

### 2. 属性选择器

```css
/* 使用属性选择器 */
[data-theme="dark"] .child {
    color: white;
}
```

## 参考

- [MDN: CSS Scoping Module](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scoping)
- [W3C: CSS Scoping Module Level 1](https://www.w3.org/TR/css-scoping-1/)
- [Vue: Deep Selectors](https://vue-loader.vuejs.org/guide/scoped-css.html#deep-selectors)
