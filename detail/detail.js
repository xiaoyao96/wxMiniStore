const app = getApp()

Page({
  data: {

  },
  onLoad: function () {

  },
  finish(){
    app.store.setState({
      finish: true
    })
    wx.navigateBack();
  }
})
