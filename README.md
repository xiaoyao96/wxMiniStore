# wxMiniStore

一个基于微信小程序的mini全局状态管理库。源码为微信小程序片段，可下载导入微信开发助手中查看。
## 更新日志
\[2018.10.30\] 拓展新增methods全局方法，大幅优化setState性能。更新需调整Store结构，请阅读Store对象参数详情。  
\[2018.9.26\] 由于引用关系错乱且微信会报错，已修改为部分引用关系。即各个页面的$state不再完全相对，但$state.key 完全相等。  
\[2018.9.10\] 修复在页面未加载完时，调用setState报错。  


## 开始
### 1. 引入
引入util下的store.js
```js
const Store = require('util/store.js');
```
### 2. 实例化
Store 允许传一个参数，类型为Object，全局状态写入对象state中，读取请使用store.$state。
```js 
let store = new Store({
  //。
  state: {
    msg: '这是一个全局状态'
  }
})
console.log(store.$state.msg); //这是一个全局状态
```
### 3.在App中注入store
这么做是为了在其他页面中使用store。
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
js中使用app中的store来进行操作状态。具体参见下面api说明。
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
## 全局方法 methods
  由于官方wxs与js差异明显，且无法调试wxs的错误。所以新增了methods。同样支持所有页面组件调用，且为js

  ### 1. 创建一个全局方法
  在原有基础上，新增一个methods对象，写入你的全局方法：
  ```js
	let store = new Store({
	  //。
	  state: {
		msg: '这是一个全局状态'
	  },
	  methods: {
		toUpper(str){
			return str.toLocaleUpperCase();
		},
		goAnyWhere(e){
		
			wx.navigateTo({
				url: e.currentTarget.dataset.url
			})
		}
	  }
	})
  ```
  这里创建了两个全局方法，一个是封装的转化大小写toUpper，一个是封装的跳转 goAnyWhere。
  
  ### 2.使用全局方法
  ```html
	<view bindtap="goAnyWhere" data-url="/index/index">
		{{toUpper('abc')}}
	</view>
	
  ```
  直接使用方法名即可使用。
  ### 3.说明
  全局方法可以完全替代wxs，性能上不会太损耗（方法都指向一个内存地址），所以可以放心使用。  
  
  
 
  


## api
这里列举了所有涉及到Store的属性与方法。
### new Store(options: Object) *已更新
该函数使用new关键字返回一个Store类型的实例。
参数options，为配置参数，
options.state 为初始全局状态。
options.methods 为全局方法。

### Store.prototype.setState(Object data, Function callback)
用于修改全局状态，用法与微信小程序的 Page.prototype.setData完全一致。在页面中调用setState的数据为同步，渲染为异步。在页面未加载完成时，调用setState的数据为异步（页面周期attached时完成），渲染为异步。
*提示：页面中应避免使用this.setData({$state: ...})去操作当前页面下的$state。如有相关需求，请使用页面其他状态存储。*

### store.$state : Object
该对象为实例.$state， 返回的是全局状态（部分引用）。应避免直接操作修改它。

### store.$r : Object
该对象为所有页面或组件的实例。

## 总结
考虑到后期的app.js内store不直观，可以把整套store单独写入一个js中，通过require引入。如：
  ``` js
	// mystore.js中
	const Store = require('../util/store.js');
	module.exports = new Store({
		state: {...},
		methods: {...}
	})
//=========================
	// app.js中
	let store = require('store/mystore.js')
	App({
	 store
	})
  ```

此适用于全局的状态大范围同步变动，如用户信息，临时的购物车信息，等等应用场景。原理实现上，源码很清晰，后期慢慢优化，欢迎指正。