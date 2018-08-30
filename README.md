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
使用$state.x展示
```html
  <view>{{$state.user.name}}：{{$state.msg}}</view>
```
显示为 李四：这是一个全局状态

### 5.如何修改状态
js中使用app中的store来进行操作状态，`getApp().store.setState(Object)`用法与页面中的`this.setData(Object)`完全一致（由于继承关系）。
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

## 总结
适用于全局的状态长期变动，如用户信息，临时的购物车信息，等等应用场景。原理实现上，源码很清晰，后期慢慢优化，欢迎指正。
