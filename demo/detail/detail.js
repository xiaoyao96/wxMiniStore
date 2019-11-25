const app = getApp()

App.Page({
  onLoad: function () {
    console.log('获取不到，没有开启useStore', this.data.$state)
    setTimeout(() => {
      app.store.setState({
        list: [
          {
            step: '第一步',
            value: '进入 app.js 按照步骤配置 Store，并在创建App时注入'
          },
          {
            step: '第二步',
            value: '任意地方wxml中使用{{$state.x}}，template需要单独在data中引入$state'
          },
          {
            step: '第三步',
            value: 'js中使用app.store.setState({x:value})修改{{$state.x}}显示的值'
          }
        ]
      })
      setTimeout(() => {
        app.store.setState({
          [`list[2].step`]: '最后一步'
        })
      }, 1000)
    }, 1000)
  },
  finish(){
    app.store.setState({
      finish: true
    })
    wx.navigateBack();
  }
})
