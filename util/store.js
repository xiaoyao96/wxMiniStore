/**
 * @author 逍遥
 * @update 2019.3.17
 * @version 1.2 
 */

const TYPE_ARRAY = '[object Array]'
const TYPE_OBJECT = '[object Object]'
function Store(option) {
  //必要参数的默认值处理
  const {
    state = {},
    openPart = false,
    behavior,
    methods = {},
    pageLisener = {}
  } = option;
  //状态初始化
  this.$state = {};
  if (_typeOf(option.state) === TYPE_OBJECT) {
    this.$state = Object.assign({}, option.state);
  }
  //页面+组件树
  this.$r = [];
  //创建时，添加组件
  const _create = function (r) {
    _store.$r.push(r);
    r.setData({
      $state: _store.$state
    })
  }
  //销毁时，移除组件
  const _destroy = function (r) {
    let index = _store.$r.findIndex(item => item === r);
    if (index > -1) {
      _store.$r.splice(index, 1)
    }
  }
  //状态局部模式
  this.$openPart = openPart;
  //其他参数
  const _store = this;
  const pageLife = ['data', 'onLoad', 'onShow', 'onReady', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap'];
  const canUseStore = function (o) {
    return (openPart === true && o.useStore === true) || !openPart;
  }

  const originPage = Page,
    originComponent = Component;
  //重写Page
  Page = function (o, ...args) {
    if (canUseStore(o)) {
      //状态注入
      o.data = Object.assign(o.data || {}, {
        $state: _store.$state
      });
    }
    //行为注入
    Object.keys(methods).forEach(key => {
      //不能是周期事件
      if (typeof methods[key] === 'function' && !pageLife.some(item => item === key)) {
        o[key] = methods[key];
      }
    })
    //覆盖原周期
    const originCreate = o.onLoad;
    o.onLoad = function () {
      if (canUseStore(o)) {
        _create(this);
      }
      originCreate && originCreate.apply(this, arguments)
    }
    const originonDestroy = o.onUnload;
    o.onUnload = function () {
      _destroy(this);
      originonDestroy && originonDestroy.apply(this, arguments)
    }
    //其他页面周期事件注入 pageListener
    Object.keys(pageLisener).forEach(key => {
      //不能是周期事件
      if (typeof pageLisener[key] === 'function' && pageLife.some(item => item === key)) {
        const originLife = o[key];
        o[key] = function () {
          pageLisener[key].apply(this, arguments);
          originLife.apply(this, arguments);
        }
      }
    })
    originPage(o, ...args)
  }

  //重写组件
  Component = function (o, ...args) {
    //状态注入
    if (canUseStore(o)) {
      o.data = Object.assign(o.data || {}, {
        $state: _store.$state
      });
    }
    //行为注入
    Object.keys(methods).forEach(key => {
      //不能是周期事件
      if (typeof methods[key] === 'function' && !pageLife.some(item => item === key)) {
        o.methods || (o.methods = {});
        o.methods[key] = methods[key];
      }
    })
    //behavior
    if (behavior) {
      o.behaviors = [behavior, ...(o.behaviors || [])]
    }
    //覆盖原周期
    const originCreate = o.attached;
    o.attached = function () {
      if (canUseStore(o)) {
        _create(this);
      }
      originCreate && originCreate.apply(this, arguments)
    }
    const originonDestroy = o.detached;
    o.detached = function () {
      _destroy(this);
      originonDestroy && originonDestroy.apply(this, arguments)
    }
    originComponent(o, ...args)
  }
  this.version = 1.2
}

Store.prototype.setState = function (obj, fn) {
  if (_typeOf(obj) !== TYPE_OBJECT) {
    throw new Error('setState的第一个参数须为object!')
  }
  console.timeline('setState')
  if (this.$r.length > 0) {
    const newObj = {}
    Object.keys(obj).forEach(key => {
      newObj['$state.' + key] = obj[key]
    })
    let pros = this.$r.map(item => {
      return new Promise(r => {
        item.setData(newObj, r)
      })
    })
    Promise.all(pros).then(fn);
  } else {
    setData(obj, this.$state);
    fn();
  }
  console.timelineEnd('setState')
}

const _typeOf = function (val) {
  return Object.prototype.toString.call(val)
}

const setData = function (obj, data) {
  Object.keys(obj).forEach(key => {
    dataHandler(key, obj[key], data);
  })
}

const dataHandler = function (key, result, data) {
  let arr = pathHandler(key);
  let d = data;
  for (let i = 0; i < arr.length - 1; i++) {
    keyToData(arr[i], arr[i + 1], d);
    d = d[arr[i]];
  }
  d[arr[arr.length - 1]] = result;
}

const pathHandler = function (key) {
  let current = '',
    keyArr = [];
  for (let i = 0, len = key.length; i < len; i++) {
    if (key[0] === '[') {
      throw new Error('key值不能以[]开头')
    }
    if (key[i].match(/\.|\[/g)) {
      cleanAndPush(current, keyArr)
      current = '';
    }
    current += key[i];
  }
  cleanAndPush(current, keyArr)
  return keyArr;
}

const cleanAndPush = function (key, arr) {
  let r = cleanKey(key);
  if (r !== '') {
    arr.push(r)
  }
}

const keyToData = function (prev, current, data) {
  if (prev === '') {
    return
  }
  const type = _typeOf(data[prev]);
  if (typeof current === 'number' && type !== TYPE_ARRAY) {
    data[prev] = []
  } else if (typeof current === 'string' && type !== TYPE_OBJECT) {
    data[prev] = {}
  }
}

const cleanKey = function (key) {
  if (key.match(/\[\S+\]/g)) {
    let result = key.replace(/\[|\]/g, '');
    if (!Number.isNaN(parseInt(result))) {
      return +result
    } else {
      throw new Error(`[]中必须为数字`)
    }
  }
  return key.replace(/\[|\.|\]| /g, '')
}
module.exports = Store
