const app = getApp()

Page({
  useStore: true,
  data: {

  },
  onLoad: function () {
    console.log('获取得到，开启了useStore', this.data.$state)
  }
})
