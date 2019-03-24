const app = getApp()

App.Page({
  onLoad: function () {
    console.log('获取不到，没有开启useStore', this.data.$state)
  },
  finish(){
    app.store.setState({
      finish: true
    })
    wx.navigateBack();
  }
})
