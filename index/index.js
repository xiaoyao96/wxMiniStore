const app = getApp()

App.Page({
  useStore: true,
  data: {

  },
  onLoad: function () {
    // let { user } = app.store.getState();
    app.store.setState({
      user: {}
    })
  }
})
