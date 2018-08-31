# wxMiniStore

一个基于微信小程序的mini全局状态管理库。源码为微信小程序片段，可下载导入微信开发助手中使用。

## 开始
### 1. 引入store
```js
const Store = require('util/store.js');
```
### 2. 实例化一个Store，且允许初始化一个全局状态
Store 允许传一个参数，类型为Object，意为初始化一个全局状态，全局状态都将存入store.$state中。
```js 
let store = new Store({
  //。
  msg: '这是一个全局状态',
  user: {
    name: '李四',
    time: new Date()
  }
})
console.log(store.$state.user.name); //李四
```
### 3.在App中注入store
```js
App({
  onLaunch: function () {

  },
  store: store
})
```
### 4.页面上使用
在所有wxml中，可使用$state.x。
其中$state为全局状态的容器，里面包含了所有的全局状态。
```html
  <view>{{$state.user.name}}：{{$state.msg}}</view>
```
显示为 李四：这是一个全局状态。
 
如果在template文件中使用，需在属性data中引用$state
```html
  <!-- 这是一个template -->
  <template name="t1">
    <view>{{$state.msg}}</view>
  </template>

<!-- 这是引用位置 -->
  <template is="t1" data="{{$state,arg1,arg2}}" />
<!--   相当于<template is="t1" data="{{$state:$state,arg1:arg1,arg2:arg2}}" /> -->
```

### 5.如何修改状态
js中使用app中的store来进行操作状态，。具体参见下面api说明。
```js
const app = getApp()
Page({
  data: {

  },
  onLoad: function () {
    //所有wxml中的$state.msg会同步更新
    app.store.setState({
       msg: "我被修改了，呜呜..."
    });
  }
});

```
## api
这里列举了所有涉及到Store的属性与方法。
### new Store(initState: Object)
该函数使用new关键字返回一个Store类型的实例。
参数initState，为初始全局状态，可不传。

### Store.prototype.setState(Object data, Function callback)
用于修改全局状态，用法与微信小程序的 Page.prototype.setData完全一致。

*提示：页面中应避免使用this.setData({$state: ...})去操作当前页面下的$state。如有相关需求，请使用页面其他状态存储。*

### store.$state : Object
该对象为实例.$state， 返回的是全局状态（引用）。应避免直接操作修改它。

### store.$r : Object
该对象为所有页面或组件的实例。

## 总结
适用于全局的状态大范围同步变动，如用户信息，临时的购物车信息，等等应用场景。原理实现上，源码很清晰，后期慢慢优化，欢迎指正。


