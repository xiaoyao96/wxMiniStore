// counter/counter.js
const app = getApp()
Page({
  useStore: true,
  /**
   * 页面的初始数据
   */
  data: {

  },
  increase() {
    let { counter } = app.store.getState()
    app.store.setState({
      counter: counter + 1
    })
  },
  decrease() {
    let { counter } = app.store.getState()
    app.store.setState({
      counter: counter - 1
    })
  }
})