# wxMiniStore 

[![NPM version](https://img.shields.io/npm/v/wxministore.svg)](https://www.npmjs.com/package/wxministore)
[![License](https://img.shields.io/npm/l/wxministore.svg)](https://www.npmjs.com/package/wxministore)

一个基于原生小程序的 mini 全局状态管理库，跨页面/组件数据共享渲染。

- 全局状态 state 支持所有 Page 和 Component，更新时使用独有 diff 能力，性能更强。
- 周期监听 pageListener 能监听所有页面的 onLoad、onShow 等周期事件，方便埋点、统计等行为。
- 全局事件 methods，一处声明，所有 wxml 直接可用的函数。
- 适合原生小程序，即使后期引入，也只需增加几行代码。

## 更新日志

自 2022.8.31 起本人将不再更新维护此库。
推荐大家使用腾讯开源的 westore 来管理微信原生小程序状态，或直接使用 uniapp、taro 等跨平台开发框架来开发小程序更佳。
感谢之前使用过此库的开发者，以及提过pr和issue的贡献者。

### 1.3.1

\[2021.1.13\]  
`U`：优化pageListener中的onShareAppMessage能力，使其支持自定义[全局分享](#share)。

### 1.3.0

\[2020.7.28\]  
`A`：新增 [store.prototype.clearState](#clearState) 清除状态，by [@zkl2333](https://github.com/zkl2333)  
`F`：新增polyfill，修复 [#25](https://github.com/xiaoyao96/wxMiniStore/issues/25)。  
`F`：单词错误 pageLisener 改为 pageListener（已做向下兼容可放心升级）。  

### 1.2.9

\[2020.3.31\] `A`: 新增[debug 字段](#other)，用于开启/关闭 setState 时的 console。  

### 导航

- [全局状态开始](#start)
  - [安装及引入](#start-1)
  - [实例化](#state)
  - [App 中注入](#start-3)
  - [页面上使用](#start-4)
  - [修改状态](#start-5)
  - [修改状态注意事项](#start-6)
- [页面周期监听](#lisener)
  - [全局分享](#share)
- [全局方法](#f)
- 性能优化
  - [局部状态模式](#part)
  - [useProp](#useProp)
- [其他](#other)
- [non-writable 解决方案](#nonWritable)
- [Api 说明](#api)
- [总结及建议](#end)

## <div id="start">开始</div>

在开始前，你可以 clone 或下载本项目，用微信开发工具打开 demo 目录来查看效果。

### <div id="start-1">1.安装及引入</div>

目前有两种引入方式：

#### npm

首先你需要 npm init 在项目目录下生成 package.json 后，再进行安装。

```cmd
npm init
npm install wxministore -S
```

然后在微信小程序右上角详情中勾选 `使用npm模块`。  
 接着选择左上角 工具-构建 npm。
这样你就可以在项目中导入了。

```js
//app.js中
import Store from "wxministore";
//或者 const Store = require('wxministore');
App({});
```

#### clone

如果不太熟悉 npm 没关系，你可以将本项目中 lib/store.js 复制到你的项目中，并在`app.js第一行`引入：

```js
//app.js中
import Store from "./util/store.js";
//或者 const Store = require('./util/store.js');
App({});
```

### <div id="state">2. 实例化一个全局状态 state</div>

Store 为构造函数，所以需要通过 new 关键字实例化，参数为 object 类型，下面我们初始化一个 state。

```js
let store = new Store({
  state: {
    msg: "这是一个全局状态",
    user: {
      name: "李四",
    },
  },
});
console.log(store.getState().msg); //这是一个全局状态 1.2.6+
console.log(store.$state.msg); //这是一个全局状态 （不推荐）
App({});
```

初始化完成，我们如需在 js 中获取状态，可使用 `store.getState()` 获取全局状态，`1.2.6+`版本强烈推荐此方式。  
store.\$state 也可获取，但不建议使用。

### <div id="start-3">3.在 App 中注入 store</div>

这么做是为了在其他页面中使用 store。

```js
App({
  onLaunch: function () {},
  store: store,
});
```

### <div id="start-4">4.页面上使用</div>

在所有 wxml 中，可使用$state.x。
其中$state 为全局状态的容器，里面包含了所有的全局状态。

```html
<view>{{$state.user.name}}：{{$state.msg}}</view>
```

显示为 李四：这是一个全局状态。

如果在 template 文件中使用，需在属性 data 中引用\$state

```html
<!-- 这是一个template -->
<template name="t1">
  <view>{{$state.msg}}</view>
</template>

<!-- 这是引用位置 -->
<template is="t1" data="{{$state,arg1,arg2}}" />
<!--   相当于<template is="t1" data="{{$state:$state,arg1:arg1,arg2:arg2}}" /> -->
```

在版本 1.2.1+建议使用 App.Page 和 App.Component 创建页面和组件，当然也不是必须。详情查看[nonWritable](#nonWritable)

```js
// 没问题
Page({
  //...
});

// 更好
App.Page({
  //...
});
```

如果使用时，页面空白，说明你没有在 App 创建前 new Store。

### <div id="start-5">5.如何修改状态</div>

使用 app.store.setState 进行更新状态。如:

```js
const app = getApp();
App.Page({
  data: {},
  onLoad: function () {
    //所有wxml中的$state.msg会同步更新
    app.store.setState({
      msg: "我被修改了，呜呜...",
    });
  },
});
```

### <div id="start-6">修改状态注意事项</div>

```js
// 错误的示范 视图不会更新
let { user } = app.store.$state;
user.name = "张三";
app.store.setState({
  user,
});

//正确的示范
let { user } = app.store.getState();
user.name = "张三";
app.store.setState({
  user,
});
```

获取全局状态需使用 app.store.getState()。

## <div id="lisener">周期监听 pageListener</div>

在有的场景，我希望每个页面在 onLoad 时执行一个方法（如统计页面，监听等）。原本做法是一个一个的复制粘贴，很麻烦。  
现在我们可以把某个周期，写入 pageListener 中，Store 会自动在`相应周期优先执行pageListener然后再执行原页面周期内事件`。

### 1.加入监听

现在以监听 onLoad 为例， 在 Store 中新增一个 pageListener 对象，将需要监听的周期写入:

```js
// store中
let store = new Store({
  //状态
  state: {
    //...
  },
  //方法
  methods: {
    //...
  },
  //页面监听
  pageListener: {
    onLoad(options) {
      console.log("我在" + this.route, "参数为", options);
    },
  },
});
```

就这样所有页面的 onLoad，将会优先执行此监听。接下来看页面内代码：

```js
// index/index.js 页面
App.Page({
  onLoad() {
    console.log(2);
  },
});
```

执行结果为:

```js
// 我在index/index 参数为 {...}
// 2
```

### <div id="share">2.全局分享 `1.3.1+`</div>

现支持全局分享功能，以方便开发者能一次性定义所有页面的分享功能。  
```js
// store中
let store = new Store({
  //页面监听
  pageListener: {
    onShareAppMessage(res){
      return {
        title: '全局分享',
        path: '/index/index'
      }
    }
  },
});
```
store中onShareAppMessage返回值的优先级是`次于`页面级的，所以当Page中有onShareAppMessage且有返回值，则会优先使用Page中的分享。

### 3.没有第二步...

总结：

- 先执行 pageListener 监听，后执行原本页面中周期。
- 还支持其他周期事件 ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']

## <div id="f">全局方法 methods</div>

新增 methods，全局可使用。
适用于各个 wxml 中的交互事件(bindtap 等), 你可以封装一些常用的交互事件，如 行为埋点，类型跳转等。

### 1.创建一个全局方法

在原有状态基础上，新增一个 methods 对象，写入你的全局方法：

```js
let store = new Store({
  //状态
  state: {
    msg: "这是一个全局状态",
  },
  //方法
  methods: {
    goAnyWhere(e) {
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
      });
    },
    sayHello() {
      console.log("hello");
    },
  },
});
```

这里创建了一个全局封装的跳转 goAnyWhere。

### 2.使用全局方法

在 wxml 中，直接使用`方法名`调用:

```html
<view bindtap="goAnyWhere" data-url="/index/index">
  首页
</view>
```

在 js 中，直接使用 `this.方法名` 来调用:

```js
App.Page({
  onLoad() {
    this.sayHello();
  },
});
```

在非页面的 js 中，我们不建议使用 Store 中的全局方法。但你可使用 getCurrentPage().pop().sayHello() 来调用。

### 3.说明

- 尽量封装复用率高的全局方法
- 非交互型事件（即非 bindxx）的公用方法，建议不写入 Store 中。写入 App 中更好。

## <div id="part">局部状态模式</div>

在项目的组件和页面越来越多且复用率越来越高时，全局$state的利用率就很低，这时候就出现了一种情况，页面中的组件和页面达到百千量级，每个内部都有一个$state，而用到它的可能就只有 1 个或几个。就会引起各种性能问题。比如更新$state十分缓慢，且低效。  
这时候你需要将$state 调整为部分组件和页面可用，而不是所有。

### 1.开启局部模式

```js
let store = new Store({
  //。
  state: {
    msg: "这是一个全局状态",
  },
  openPart: true,
});
```

openPart 字段表示是否开启局部模式，默认值为 false。当我们想规定只有某些页面和组件使用\$state 时，就需开启此模式，设置为 true。

### 2.设置范围

在需要使用$state的组件中，加入`useStore: true`，表示当前页面或组件可用$state。

```js
// a.js
App.Page({
  useStore: true,
  onLoad() {
    console.log(this.data.$state); // { msg: '这是一个全局状态' }
    console.log(getApp().store.getState()); // { msg: '这是一个全局状态' }
  },
});

// b.js
App.Page({
  onLoad() {
    console.log(this.data.$state); // undefined
    console.log(getApp().store.getState()); // { msg: '这是一个全局状态' }
  },
});
```

a 页面设置了 Store 可用，所以可以通过 this.data.\$state 获取。
b 页面没有设置，所以为 undefined，但两个页面均可通过 store.getState()读取全局状态。

```html
<--! a页面有效 -->
<view>{{$state.msg}}</view>

<--! b页面无效 -->
<view>{{$state.msg}}</view>
```

### 3.注意事项

- openPart 一旦开启，所有没有设置 useStore 的页面和组件将不能在 wxml 中使用\$state。
- 组件或页面.js 中，我们建议使用 getApp().store.getState()去获取全局状态，因为他没有限制。
- 仅在 wxml 中需要用到\$state 的页面和组件中开启 useStore。

你可以 clone 或下载本项目，用微信开发工具打开 demo 目录来查看具体用法。

## <div id="useProp"> 页面中 useProp 属性 `1.2.3+`</div>

useProp 用于控制当前页面/组件，使用哪些状态，不传则所有状态均可在当前页面中使用。

观察以下代码及注释：

```js
// App.js
let store = new Store({
  state: {
    s1: "s1状态",
    s2: "s2状态",
  },
});

// A页面中
App.Page({
  useProp: ["s1"], //指定使用s1
  onLoad() {
    console.log(this.data.$state); // { s1: 's1状态' }
    console.log(getApp().store.getState()); // { s1: 's1状态', s2: 's2状态' }
  },
});

// B页面中
App.Page({
  useProp: ["s2"], //指定使用s2
  onLoad() {
    console.log(this.data.$state); // { s2: 's2状态' }
    console.log(getApp().store.getState()); // { s1: 's1状态', s2: 's2状态' }
  },
});

// C页面中
App.Page({
  onLoad() {
    console.log(this.data.$state); // { s1: 's1状态', s2: 's2状态' }
    console.log(getApp().store.getState()); // { s1: 's1状态', s2: 's2状态' }
  },
});
```

useProp 是控制当前组件/页面使用哪些状态，而 useStore 是控制哪些组件/页面可使用 state 这个功能，两者可以同时作用。如：

```js
// App.js中
let store = new Store({
  state: {
    s1: "s1状态",
    s2: "s2状态",
  },
  openPart: true,
});

// A页面中
App.Page({
  useStore: true,
  useProp: ["s1"], //指定使用s1
  onLoad() {
    console.log(this.data.$state); // { s1: 's1状态' }
    console.log(getApp().store.getState()); // { s1: 's1状态', s2: 's2状态' }
  },
});

// B页面中
App.Page({
  useProp: ["s1"], //指定使用s1 但没设置useStore，所以无效
  onLoad() {
    console.log(this.data.$state); // undefined
    console.log(getApp().store.getState()); // { s1: 's1状态', s2: 's2状态' }
  },
});
```

## <div id="other">其他 `1.2.9+`</div>

实例化 Store 时，提供 debug 字段，用于开启/关闭框架内部 console 日志。 默认值为 true，即开启状态。如不需要，则设置 false 即可。

```js
new Store({
  debug: false, // 关闭内部日志的输出。
});
```

## <div id="nonWritable">non-writable 解决方案 `1.2.1+`</div>

收到开发者的反馈，在小程序中使用插件时，会报错提示:

```js
// [non-writable] modification of global variable "Page" is not allowed when using plugins at app.json.
// 在app.json中使用插件时，不允许修改全局变量 Page
```

原因是 store 源码重写了 Page、Component 方法。

### 1、开启防改写

在你的 store 配置中，加入 `nonWritable: true`。

```js
let store = new Store({
  nonWritable: true,
});
```

### 2、创建页面与组件调整

将你所有页面与组件创建方法改为`App.Page(...) 和 App.Component(...)`。

```js
//页面.js
App.Page({
  data: {},
  onLoad: function () {},
});

//组件.js
App.Component({
  data: {},
});
```

以上就解决了此问题。

## <div id="api">api</div>

这里列举了所有涉及到 Store 的属性与方法。

### new Store(options: Object) \*已更新

该函数使用 new 关键字返回一个 Store 类型的实例。
参数 options，为配置参数，  
options.state 为初始全局状态。  
options.methods 为全局方法。  
options.openPart 状态局部模式。  
options.pageListener 周期监听。  
options.nonWritable 是否重写 Page，Componenet。

### store.setState(data: Object, callback: Function)

用于修改全局状态，用法与微信小程序的 Page.prototype.setData 完全一致。
_提示：页面中应避免使用 this.setData({\$state: ...})去操作当前页面下的\$state。如有相关需求，请使用页面其他状态存储。_

### store.\$state: Object

该对象为实例.\$state， 返回的是全局状态，应避免直接操作修改它。

### store.\$r: Array

该对象为所有页面或组件的实例。

### store.getState: () => Object `1.2.6+`

该 api 返回的是全局状态的拷贝。

### <div id="clearState">store.clearState(callback: Function) `1.3.0+`</div>

用于清空全局状态，使所有$state下任意的状态为undefined。

## <div id="end">总结及建议</div>

考虑到后期的 app.js 内 store 不直观，可以把整套 store 单独写入一个 js 中，通过 require 引入。如：

```js
// mystore.js中
const Store = require("../util/store.js");
module.exports = new Store({
  state: {},
  methods: {},
});
//---------------------------
// app.js中
let store = require("store/mystore.js");
App({
  store,
});
```

MiniStore 非常适合原生小程序。可以随时引入，不影响原有的业务，拓展性强。
欢迎 star、欢迎提 issue 甚至 pr...

## License

MIT © [Leisure](https://github.com/xiaoyao96)
