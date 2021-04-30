
export const Token = 'Token'

class StorageItem {
  /**
   * @param {string} key     存储键名
   * @param {*} defaultValue 获取的默认值
   */
  constructor(key, defaultValue = null) {
    this.key = key
    this.defaultValue = defaultValue
  }
  /** 获取 */
  get() {
    return wx.getStorageSync(this.key) || this.defaultValue
  }
  /** 设置 */
  set(value) {
    return wx.setStorageSync(
      this.key,
      value,
    )
  }
  /** 移除 */
  remove() {
    return wx.removeStorageSync(this.key)
  }
}

// 清除全部
export const clearLoc = wx.clearStorageSync

export const locToken = new StorageItem(Token, '')