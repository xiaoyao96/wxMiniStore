import { _typeOf, _deepClone, TYPE_ARRAY, TYPE_OBJECT } from "./common";
import diff from "./diff";
import pkg from "../package.json";
const Version = pkg.version;
console.log("当前wxministore版本：" + Version);
/**
 * Store
 * @author Leisure
 * @update 2019.11.27
 * @version 1.2.8
 */
class Store {
  version = Version;
  $state = {};
  $r = [];
  constructor(option) {
    //必要参数的默认值处理
    const {
      openPart = false,
      behavior,
      methods = {},
      pageLisener = {},
      nonWritable = false
    } = option;

    //状态初始化
    this.$state = {};
    if (_typeOf(option.state) === TYPE_OBJECT) {
      this.$state = Object.assign({}, _deepClone(option.state));
    }
    //页面+组件树
    this.$r = [];
    //创建时，添加组件
    const _create = function(r, o = {}) {
      r.$store = {};
      const { useProp } = o;
      if (o.hasOwnProperty("useProp")) {
        if (
          (useProp && typeof useProp === "string") ||
          _typeOf(useProp) === TYPE_ARRAY
        ) {
          r.$store.useProp = [].concat(useProp);
        } else {
          r.$store.useProp = [];
        }
      }

      r.$store.useStore = canUseStore(o);
      if (canUseStore(o)) {
        _store.$r.push(r);
        if (r.$store.useProp) {
          r.setData({
            $state: _filterKey(
              _store.$state,
              r.$store.useProp,
              (key, usekey) => key === usekey
            )
          });
        } else {
          r.setData({
            $state: _store.$state
          });
        }
      }
    };
    //销毁时，移除组件
    const _destroy = function(r) {
      let index = _store.$r.findIndex(item => item === r);
      if (index > -1) {
        _store.$r.splice(index, 1);
      }
    };
    //状态局部模式
    this.$openPart = openPart;
    //其他参数
    const _store = this;
    const pageLife = [
      "data",
      "onLoad",
      "onShow",
      "onReady",
      "onHide",
      "onUnload",
      "onPullDownRefresh",
      "onReachBottom",
      "onShareAppMessage",
      "onPageScroll",
      "onTabItemTap"
    ];
    const canUseStore = function(o = {}) {
      return (openPart === true && o.useStore === true) || !openPart;
    };

    const originPage = Page,
      originComponent = Component;

    //重写Page
    App.Page = function(o = {}, ...args) {
      if (canUseStore(o)) {
        //状态注入
        o.data = Object.assign(o.data || {}, {
          $state: _store.$state
        });
      }
      //行为注入
      Object.keys(methods).forEach(key => {
        //不能是周期事件
        if (
          typeof methods[key] === "function" &&
          !pageLife.some(item => item === key)
        ) {
          o[key] = methods[key];
        }
      });
      //覆盖原周期
      const originCreate = o.onLoad;
      o.onLoad = function() {
        _create(this, o);
        originCreate && originCreate.apply(this, arguments);
      };
      const originonDestroy = o.onUnload;
      o.onUnload = function() {
        _destroy(this);
        originonDestroy && originonDestroy.apply(this, arguments);
      };
      //其他页面周期事件注入 pageListener
      Object.keys(pageLisener).forEach(key => {
        //不能是周期事件
        if (
          typeof pageLisener[key] === "function" &&
          pageLife.some(item => item === key)
        ) {
          const originLife = o[key];
          o[key] = function() {
            pageLisener[key].apply(this, arguments);
            originLife && originLife.apply(this, arguments);
          };
        }
      });
      originPage(o, ...args);
    };

    if (!nonWritable) {
      try {
        Page = App.Page;
      } catch (e) {}
    }

    //重写组件
    App.Component = function(o = {}, ...args) {
      //状态注入
      if (canUseStore(o)) {
        o.data = Object.assign(o.data || {}, {
          $state: _store.$state
        });
      }
      //行为注入
      Object.keys(methods).forEach(key => {
        //不能是周期事件
        if (
          typeof methods[key] === "function" &&
          !pageLife.some(item => item === key)
        ) {
          o.methods || (o.methods = {});
          o.methods[key] = methods[key];
        }
      });
      //behavior
      if (behavior) {
        o.behaviors = [behavior, ...(o.behaviors || [])];
      }
      const { lifetimes = {} } = o;

      let originCreate = lifetimes.attached || o.attached,
        originonDestroy = lifetimes.detached || o.detached;
      const attached = function() {
        _create(this, o);
        originCreate && originCreate.apply(this, arguments);
      };

      const detached = function() {
        _destroy(this);
        originonDestroy && originonDestroy.apply(this, arguments);
      };
      if (_typeOf(o.lifetimes) === TYPE_OBJECT) {
        o.lifetimes.attached = attached;
        o.lifetimes.detached = detached;
      } else {
        o.attached = attached;
        o.detached = detached;
      }

      //覆盖原周期

      originComponent(o, ...args);
    };
    if (!nonWritable) {
      try {
        Component = App.Component;
      } catch (e) {}
    }
  }

  setState(obj, fn = () => {}) {
    if (_typeOf(obj) !== TYPE_OBJECT) {
      throw new Error("setState的第一个参数须为object!");
    }
    console.time && console.time("setState");
    let prev = this.$state;
    let current = setData(obj, prev);
    this.$state = current;
    //如果有组件
    if (this.$r.length > 0) {
      let diffObj = diff(current, prev);
      console.log("diff后实际设置的值：", _deepClone(diffObj));
      let keys = Object.keys(diffObj);
      if (keys.length > 0) {
        const newObj = {};
        keys.forEach(key => {
          newObj["$state." + key] = diffObj[key];
        });
        let pros = this.$r.map(r => {
          if (r.$store.hasOwnProperty("useProp")) {
            let useprops = _filterKey(
              newObj,
              r.$store.useProp,
              (key, useKey) =>
                key === "$state." + useKey ||
                !!key.match(new RegExp("^[$]state." + useKey + "[.|[]", "g"))
            );
            if (Object.keys(useprops).length > 0) {
              return new Promise(resolve => {
                r.setData(useprops, resolve);
              });
            } else {
              return Promise.resolve();
            }
          }
          return new Promise(resolve => {
            r.setData(newObj, resolve);
          });
        });
        Promise.all(pros).then(fn);
      } else {
        fn();
      }
    } else {
      fn();
    }
    console.timeEnd && console.timeEnd("setState");
  }
  getState() {
    return _deepClone(this.$state);
  }
}

const _filterKey = function(obj, useKeys = [], fn) {
  let result = {};
  Object.keys(obj)
    .filter(key =>
      useKeys.some(usekey => {
        return fn(key, usekey);
      })
    )
    .forEach(key => {
      result[key] = obj[key];
    });
  return result;
};

const setData = function(obj, data) {
  let result = _deepClone(data);
  let origin = _deepClone(obj);
  Object.keys(origin).forEach(key => {
    dataHandler(key, origin[key], result);
  });
  return result;
};

const dataHandler = function(key, result, data) {
  let arr = pathHandler(key);
  let d = data;
  for (let i = 0; i < arr.length - 1; i++) {
    keyToData(arr[i], arr[i + 1], d);
    d = d[arr[i]];
  }
  d[arr[arr.length - 1]] = result;
};

const pathHandler = function(key) {
  let current = "",
    keyArr = [];
  for (let i = 0, len = key.length; i < len; i++) {
    if (key[0] === "[") {
      throw new Error("key值不能以[]开头");
    }
    if (key[i].match(/\.|\[/g)) {
      cleanAndPush(current, keyArr);
      current = "";
    }
    current += key[i];
  }
  cleanAndPush(current, keyArr);
  return keyArr;
};

const cleanAndPush = function(key, arr) {
  let r = cleanKey(key);
  if (r !== "") {
    arr.push(r);
  }
};

const keyToData = function(prev, current, data) {
  if (prev === "") {
    return;
  }
  const type = _typeOf(data[prev]);
  if (typeof current === "number" && type !== TYPE_ARRAY) {
    data[prev] = [];
  } else if (typeof current === "string" && type !== TYPE_OBJECT) {
    data[prev] = {};
  }
};

const cleanKey = function(key) {
  if (key.match(/\[\S+\]/g)) {
    let result = key.replace(/\[|\]/g, "");
    if (!Number.isNaN(parseInt(result))) {
      return +result;
    } else {
      throw new Error(`[]中必须为数字`);
    }
  }
  return key.replace(/\[|\.|\]| /g, "");
};

export default Store;
