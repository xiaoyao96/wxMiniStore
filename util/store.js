/**
 * @author 逍遥
 * @date 2018.8.30
 */
function Store(options) {
  this.$r = []; //所有实例
  this.$state = {}; //状态

  typeof options === 'object' && (this.$state = { ...options
  });

  let [_this, OriginCom, OriginPage] = [this, Component, Page];

  //重构Component
  Component = function() {
    let attached = arguments[0].attached;
    arguments[0].attached = function() {
      _this.$r.push(this);
      this.setData({
        $state: _this.$state
      })
      attached && attached.bind(this)(...arguments);
    }
    let detached = arguments[0].detached;
    arguments[0].detached = function() {
      _this.$r.splice(_this.$r.findIndex(item => item === this), 1);
      detached && detached.bind(this)(...arguments);
    }
    OriginCom(...arguments)
  };

  //重构Page
  Page = function() {
    let onLoad = arguments[0].onLoad;
    arguments[0].onLoad = function() {
      _this.$r.push(this);
      this.setData({
        $state: _this.$state
      })
      onLoad && onLoad.bind(this)(...arguments);
    }
    let onUnload = arguments[0].onUnload;
    arguments[0].onUnload = function() {
      _this.$r.splice(_this.$r.findIndex(item => item === this), 1);
      onUnload && onUnload.bind(this)(...arguments);
    }
    OriginPage(...arguments)
  };
}

Store.prototype.setState = function() {
  let _this = this;
  _this.$r.forEach(item => {
    for (let key in arguments[0]){
      item.setData({
        ['$state.' + key]: arguments[0][key]
      })
    }
  });
  _this.$state = _this.$r[0].data.$state
}

module.exports = Store