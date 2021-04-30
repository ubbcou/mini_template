import { test } from '../api/test'

const app = getApp()
Page({
  data: {

  },
  async onShow() {
    try {
      await Promise.all([
        test({ id: 1 }),
        test({ id: 2 }),
        test({ id: 3 }),
        test({ id: 4 }),
      ])
      console.log('这个结果点击登录后才得到');
    } catch (error) {
      console.log(error)
    }
  },
})
