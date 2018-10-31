# wxMiniStore

一个基于微信小程序的mini全局状态管理库。源码为微信小程序片段，可下载导入微信开发助手中查看。
## 更新日志
\[2018.10.31\] 拓展新增[周期监听 pageLisener字段](#lisener)，可监听所有页面的所有生命周期事件。  
\[2018.10.30\] 拓展新增功能[全局方法 methods字段](#f)，大幅优化setState性能。更新前需调整Store结构，请阅读[Store对象参数详情](#api)。  
\[2018.9.26\] 由于引用关系错乱且微信会报错，已修改为部分引用关系。即各个页面的$state不再完全相等，但$state.key 完全相等。  
\[2018.9.10\] 修复在页面未加载完时，调用setState报错。  

### 导航
* [开始](#start)  
* [全局状态](#state)
* [全局方法](#f)
* [全局页面周期](#lisener)
* [Api说明](#api)
* [总结及建议](#end)


## <div id="start">开始</div>
### 1. 引入
引入util下的store.js
```js
const Store = require('util/store.js');
```
### <div id="state">2. 实例化一个全局状态 state</div>
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

## <div id="f">全局方法 methods</div>
  新增methods，全局可使用。
  适用于各个wxml中的交互事件(bindtap等), 你可以封装一些常用的交互事件，如 行为埋点，类型跳转等。
  ### 1.创建一个全局方法
  在原有状态基础上，新增一个methods对象，写入你的全局方法：
  ```js
		let store = new Store({
		  //状态
		  state: {
			msg: '这是一个全局状态'
		  },
		  //方法
		  methods: {
			goAnyWhere(e){
				wx.navigateTo({
					url: e.currentTarget.dataset.url
				})
			},
			sayHello(){
				console.log('hello')
			}
		  }
		})
  ```
  这里创建了一个全局封装的跳转 goAnyWhere。
  
  ### 2.使用全局方法
  在wxml中，直接使用`方法名`调用:
  ```html
	<view bindtap="goAnyWhere" data-url="/index/index">
		首页
	</view>
  ```
  在js中，直接使用 `this.方法名` 来调用:
  ```js
	Page({
		onLoad(){
		  this.sayHello();
		}
	})
  ```
  在非页面的js中，我们不建议使用Store中的全局方法。但你可使用getCurrentPage().pop().sayHello() 来调用。
  
  ### 3.说明
  * 尽量封装复用率高的全局方法
  * 非交互型事件（即非bindxx）的公用方法，建议不写入Store中。写入App中更好。
  
  
  

## <div id="lisener">周期监听 pageLisener</div>
在有的场景，我希望每个页面在onLoad时执行一个方法（如统计页面，监听等）。原本做法是一个一个的复制粘贴，很麻烦。  
现在我们可以把某个周期，写入pageLisener中，Store会自动在`相应周期优先执行pageLisnner然后再执行原页面周期内事件`。

### 1.加入监听
现在以监听onLoad为例， 在Store中新增一个pageLisener对象，将需要监听的周期写入:
```js
	// store中
	let store = new Store({
	  //状态
	  state: {
		...
	  },
	  //方法
	  methods: {
		...
	  },
	  //页面监听
	  pageLisener: {
		onLoad(options){
			console.log('我在' + this.route, '参数为', options);
		}
	  }
	})
```
	就这样所有页面的onLoad，将会优先执行此监听。接下来看页面内代码：
```js
	// index/index.js 页面
	Page({
		onLoad(){
			console.log(2)
		}
	})
```
执行结果为:
``` js
// 我在index/index 参数为 {...} 
// 2
```
### 2.没有第二步...
总结：  
* 先执行pageLisener监听，后执行原本页面中周期。
* 还支持其他周期事件 ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']
	


## <div id="api">api</div>
这里列举了所有涉及到Store的属性与方法。
### new Store(options: Object) *已更新
该函数使用new关键字返回一个Store类型的实例。
参数options，为配置参数，
options.state 为初始全局状态。
options.methods 为全局方法。

### Store.prototype.setState(Object data, Function callback)
用于修改全局状态，用法与微信小程序的 Page.prototype.setData完全一致。在页面中调用setState的数据为同步，渲染为异步。在页面未加载完成时，调用setState的数据为异步（页面周期attached时完成），渲染为异步。
*提示：页面中应避免使用this.setData({\$state: ...})去操作当前页面下的$state。如有相关需求，请使用页面其他状态存储。*

### store.\$state : Object
该对象为实例.$state， 返回的是全局状态（部分引用）。应避免直接操作修改它。

### store.$r : Object
该对象为所有页面或组件的实例。  


## <div id="end">总结及建议</div>
考虑到后期的app.js内store不直观，可以把整套store单独写入一个js中，通过require引入。如：
  ``` js
	// mystore.js中
	const Store = require('../util/store.js');
	module.exports = new Store({
		state: {...},
		methods: {...}
	})
//---------------------------
	// app.js中
	let store = require('store/mystore.js')
	App({
	 store
	})
  ```

此适用于全局的状态大范围同步变动，如用户信息，临时的购物车信息，等等应用场景。原理实现上，源码很清晰，后期慢慢优化，欢迎指正。