/**
 * 1. 引入store
 */
const Store = require('util/store.js');
/**
 * 2. 实例化一个Store，且允许初始化一个全局状态
 */
let store = new Store({
  state: {
    //以下为自定义的全局状态，用法和页面中的data: {...} 一致。
    msg: 'Mini Store 是一个基于微信小程序的全局状态库。\n能够在Page，Component，template中任意wxml文件内使用全局状态。\n且全局的状态完全同步。',
    user: {
      name: '李四',
      time: new Date()
    }
  },
  methods: {
    goAnyWhere(e) {
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    }
  }
})
App({
  onLaunch: function () {

  },
  /**
   * 3.Introduction to app
   */
  store: store
})
