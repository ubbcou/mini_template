import { testLogin } from '../api/interceptors'

Page({
  async testLogin() {
    await testLogin()
    wx.navigateBack({
      success: () => {
        console.log(getCurrentPages());
      }
    })
  }
})