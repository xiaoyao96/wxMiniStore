/**
 * @author 逍遥
 * @date 2018.8.30
 */

let event = null;
function Store(options) {
  
  this.$r = []; //所有实例
  this.$state = {}; //状态

  typeof options === 'object' && (this.$state = { ...options
  });

  let [_this, OriginCom, OriginPage] = [this, Component, Page];

  //重构Component
  Component = function() {
    //全局注入
    let attached = arguments[0].attached;
    arguments[0].attached = function() {
      _this.$r.push(this);
      if (event) {
        event();
        event = null;
      } else {
        this.setData({
          $state: _this.$state
        })
      }
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
      if(event){
        event();
        event = null;
      }else{
        this.setData({
          $state: _this.$state
        })
      }
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

Store.prototype.setState = function(arg, callback) {
  if(typeof arg != 'object' && arg !== null){
    throw new Error('第一个参数必须为object对象')
  }
  let _this = this;
  let pros = [];
  if(_this.$r.length > 0){
    _this.$r.forEach(item => {
      for (let key in arg) {
        let p = new Promise(resolve => {
          item.setData({
            ['$state.' + key]: arg[key]
          }, resolve)
        });
        pros.push(p);
      }
    });
    Promise.all(pros).then(_ => {
      typeof callback === 'function' && callback();
    })
    _this.$state = _this.$r[0].data.$state    
  }else{
     event = function(){
       _this.$r.forEach(item => {
         for (let key in arg) {
           let p = new Promise(resolve => {
             item.setData({
               ['$state.' + key]: arg[key]
             }, resolve)
           });
           pros.push(p);
         }
       });
       Promise.all(pros).then(_ => {
         typeof callback === 'function' && callback();
       })
       _this.$state = _this.$r[0].data.$state;
     }
  }
}

module.exports = Store