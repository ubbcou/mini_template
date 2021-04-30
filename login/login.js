import { testLogin } from '../api/interceptors'

Page({
  async testLogin() {
    await testLogin()
    wx.navigateBack()
  }
})