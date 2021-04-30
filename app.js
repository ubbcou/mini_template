App({
  onLaunch() {
    console.group('项目执行介绍：')
    console.log(`
      # 1. 使用 nodejs，开启一个本地server，模拟登录校验。
      $ node server.js

      # 2. 本地 server 开启后，重新编译执行小程序，小程序界面自动跳到登录页面，点击按钮模拟登录成功后会回到上一个页面并且返回响应
    `)
    console.groupEnd()
  }
})

