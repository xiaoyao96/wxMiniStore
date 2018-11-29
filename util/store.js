'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @author 逍遥
 * @update 2018.11.29
 * @version 1.11   
 */
var pageLife = ['data', 'onLoad', 'onShow', 'onReady', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap'];
/** 
 * Store的构造函数
 * @param {Object} options 所有状态
 * @return {Store} 用new关键字初始化，可获得一个全局状态
 */
function Store() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  //所有页面及组件
  this.$r = [];
  //状态库
  options.state || (options.state = {});
  this.$state = _extends({}, options.state);

  var _this = this,
    OriginCom = Component,
    OriginPage = Page;

  var behavior = options.behavior;
  var methods = options.methods;
  var pageLisener = options.pageLisener;
  var openPart = options.openPart
  this.$openPart = openPart;
  //栈清空
  var runEvent = function() {
    this.setData(_defineProperty({}, '$state', _extends({}, _this.$state)));
  }
  //重构Component
  Component = function Component() {
    var arg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var attached = arg.attached;
    //behavior 注入
    if (behavior) {
      if (arg.behaviors) {
        arg.behaviors = [behavior].concat(_toConsumableArray(arg.behaviors));
      } else {
        arg.behaviors = [behavior];
      }
    }
    // 全局方法注入
    if ((typeof methods === 'undefined' ? 'undefined' : _typeof(methods)) === 'object') {
      if (_typeof(arg.methods) === 'object') {
        arg.methods = _extends({}, methods, arg.methods);
      } else {
        arg.methods = _extends({}, methods);
      }
    }
    //状态注入
    if (openPart){
      if (arg.useStore === true) {
        arg.data = _extends({}, arg.data, {
          $state: _this.$state
        });
      }
    }else{
      arg.data = _extends({}, arg.data, {
        $state: _this.$state
      });
    }
    arg.attached = function () {
      _this.$r.push(this);
      if (openPart) {
        if (arg.useStore === true) {
          this.useStore = true
          runEvent.call(this)
        }
      } else {
        runEvent.call(this)
      }
      attached && attached.call.apply(attached, [this].concat(Array.prototype.slice.call(arguments)));
    };
    var detached = arg.detached;
    arg.detached = function () {
      var _this2 = this;
      _this.$r.splice(_this.$r.findIndex(function (item) {
        return item === _this2;
      }), 1);
      detached && detached.call.apply(detached, [this].concat(Array.prototype.slice.call(arguments)));
    };
    OriginCom(arg);
  };

  //重构Page
  Page = function Page() {
    var arg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if ((typeof methods === 'undefined' ? 'undefined' : _typeof(methods)) === 'object') {
      var _loop = function _loop(key) {
        if (!pageLife.some(function (item) {
          return item === key;
        })) {
          arg[key] = methods[key];
        }
      };

      for (var key in methods) {
        _loop(key);
      }
    }
    if ((typeof pageLisener === 'undefined' ? 'undefined' : _typeof(pageLisener)) === 'object') {
      var _loop2 = function _loop2(key) {
        if (pageLife.some(function (item) {
          return item === key;
        }) && typeof pageLisener[key] === 'function') {
          var originLife = arg[key];
          arg[key] = function () {
            var _pageLisener$key;

            (_pageLisener$key = pageLisener[key]).call.apply(_pageLisener$key, [this].concat(Array.prototype.slice.call(arguments)));
            originLife && originLife.call.apply(originLife, [this].concat(Array.prototype.slice.call(arguments)));
          };
        }
      };

      for (var key in pageLisener) {
        _loop2(key);
      }
    }
    //状态注入
    if (openPart) {
      if (arg.useStore === true) {
        arg.data = _extends({}, arg.data, {
          $state: _this.$state
        });
      }
    } else {
      arg.data = _extends({}, arg.data, {
        $state: _this.$state
      });
    }
    var onLoad = arg.onLoad;
    arg.onLoad = function () {
      _this.$r.push(this);
      if (openPart) {
        if (arg.useStore === true) {
          this.useStore = true
          runEvent.call(this)
        }
      } else {
        runEvent.call(this)
      }
      onLoad && onLoad.call.apply(onLoad, [this].concat(Array.prototype.slice.call(arguments)));
    };
    var onUnload = arg.onUnload;
    arg.onUnload = function () {
      var _this3 = this;

      _this.$r.splice(_this.$r.findIndex(function (item) {
        return item === _this3;
      }), 1);
      onUnload && onUnload.call.apply(onUnload, [this].concat(Array.prototype.slice.call(arguments)));
    };
    OriginPage(arg);
  };
}

/** 
 * 用于同步更新全局状态
 * @param {Object} arg 初始化节点
 * @param {Function} callback 更新后的回调，可获取Dom
 * @return 无返回值
 */
Store.prototype.setState = function (arg, callback) {
  if ((typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) != 'object' && arg !== null) {
    throw new Error('第一个参数必须为object对象');
  }
  
  var _this = this,
    pros = [],
    obj = {},
    isNull = false;
  var $r = _this.$r;
  var f = function(){
    if (_this.$openPart){
      $r = _this.$r.filter(function(item){
        return item.useStore === true
      })
    }
    if($r.length === 0){
      isNull = true;
      $r = [_this.$r[0]]
      $r[0].data.$state = _extends({}, _this.$state)
    }
    //组装将要更新的obj
    for (var key in arg) {
      obj['$state.' + key] = arg[key];
    }
    var _loop3 = function _loop3(i) {
      var item = $r[i];
      var p = new Promise(function (resolve) {
        item.setData(_extends({}, obj), resolve);
      });
      pros.push(p);
    };
    // 倒着更新。后进先出
    for (var i = $r.length - 1; i >= 0; i--) {
      _loop3(i);
    }
    Promise.all(pros).then(function (_) {
      typeof callback === 'function' && callback();
    });
    if (isNull) {
      $r[0] && (_this.$state = _extends({}, _this.$state, $r[0].data.$state));
      $r[0].setData({
        $state: {}
      })
      delete $r[0].data.$state;
    } else {
      $r[0] && (_this.$state = _extends({}, $r[0].data.$state));
    }
  }
  if($r.length == 0){
    var inter = setInterval(function(){
      if(_this.$r.length > 0){
        f()
        clearInterval(inter)
      }
    }, 100)
  }else{
    f();
  }
  

};
Store.version = 1.11;
module.exports = Store;