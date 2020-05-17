---
date: 2019-05-14
categories:
  - FrontEnd
tags:
  - JS
publish: true
---

# JS里的this


1.处于window上下文或者不在任何function中时，this指向window，不管当前是否处于use strict状态
2.在一个function中调用this时，要看function如何被调用
①非strict mode，直接调用方法时，this指向window
function f1(){
    return this;
}
console.log(f1()===window);//true
let f2=()=>{
    return this;
}
console.log(f2()===window)//true
②strict mode，因为strict mode 规定，若没有在调用时显式指定this，则this为undefined
function f3(){
'use strict';
return this;
}
console.log(f3())//undefined
然而，在使用箭头表达式时，隐式的指定调用为this，即window
let f4=()=>{
    'use strict';
    return this;
}
console.log(f4()===window)// true
3.调用时需要指定this时，使用call或者apply(仅在函数是function直接定义时使用，箭头函数无此效果）
let custom={desc:'custom'}
let desc = 'window'
function normalWhatsThis(){
    return this.desc;
}
let arrowWhatsThis=()=>{
    return this.desc;
}
normalWhatsThis()//undefined
normalWhatsThis.call(custom)//"custom"
normalWhatsThis.apply(custom)//"custom"
// 箭头表达式没有这个效果
arrowWhatsThis()//undefined
arrowWhatsThis.call(custom)//undefined
arrowWhatsThis.apply(custom)//undefined
4.在调用函数时，使用bind可以绑定this
let foo={
    desc:'foo'
}
let bar={
    desc:'bar',
    printMe : function(){
        console.log(this.desc);
    }
}
bar.printMe();// bar
let printFoo=bar.printMe.bind(foo);
printFoo()//foo
5.箭头函数调用中，this指向当前未关闭的语法上下文的this(enclosing lexical context's this)
let global=this;
let test=(()=>this);
console.log(test()===this)//true
*使用call,bind或者apply调用箭头函数时，第一个入参会被忽略
let custom2 = {
    desc2:'custom'
}
let desc2 = 'window'

function arrowWhatsThis(){
    return console.log(this.desc2);
}
arrowWhatsThis()// undefined
arrowWhatsThis.call(custom) // undefined
6.如果函数本身作为对象（object）的成员，则函数中的this指向方法被调用的对象
console.log('--------1-------');
let obj1={
    a:3,
    fn:function(){
        console.log(this.a);
        console.log(this===obj1);                
    }
}
obj1.fn()
console.log('--------------2-------');
let indiFn1=function(){
    console.log(this.a);
    console.log(this===obj2);
    
}
let obj2={
    a:4,
    fn:indiFn1
}
let obj4={
    a:5,
    fn:{}
}
obj2.fn();
obj4.fn=indiFn1;
obj4.fn();
console.log('-----------3---------------');
let indiFn2=()=>{
    console.log(this.a);
    console.log(this===obj2);
    
}
let obj3={
    a:5,
    fn:indiFn2
}
obj3.fn()
输出：
--------1-------
3
true
--------------2-------
4
true
5
false
-----------3---------------
undefined
false
7.对象原型链中的this
let o = {
    f:function(){
        return this.a+this.b;
    }
}
let p = Object.create(o);
p.a=3;
p.b=4;
console.log(p.f());//7
* getter和setter的道理一致
8.构造器中的this
当一个方法被用作构造器，即方法是通过new关键词调用时，this被绑定为构造的新对象
function fn(){
    this.c=99
}
let obj = new fn();
console.log(obj.c);//99
9.作为dom事件的handler
Dom事件的handler为function，则其中的this指向抛出事件的对象，即e.currentTarget
<button id='btn' onclick="alert(this.tagName)">ClickMe</button>//BUTTON

引用：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this