---
date: 2018-11-24
categories:
  - 前端
tags:
  - 
publish: true
---

# CSS Deep

http://stackoverflow.com/a/25609679

HTML5 Web Components offer full encapsulation of CSS styles.

This means that:

styles defined within a component cannot leak out and effect the rest of the page
styles defined at the page level do not modify the component's own styles
However sometimes you want to have page-level rules to manipulate the presentation of component elements defined within their shadow DOM. In order to do this, you add /deep/ to the CSS selector.

So in the example shown, html /deep/ [self-end] is selecting all elements under the html (top level) element that have the self-end attribute, including those buried inside web components' shadow DOMs roots.

If you require a selected element to live within a shadow root, then you can use the ::shadow pseudo selector on it's parent element.

Consider:

<div>
  <span>Outer</span>
  #shadow-root
  <my-component>
    <span>Inner</span>
  </my-component>
</div>
The selector html /deep/ span will select both <span> elements.

The selector ::shadow span will select only the inner <span> element.

Read more about this in the W3C's CSS Scoping Module specification.
