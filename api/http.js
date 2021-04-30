import { responseInter, requestInter } from './interceptors'

class Http {
  get(url, data, config) {
    return this.request(this.combineConfig(url, 'GET', data, config))
  }

  post(url, data, config) {
    return this.request(this.combineConfig(url, 'POST', data, config))
  }

  put(url, data, config) {
    return this.request(this.combineConfig(url, 'PUT', data, config))
  }

  delete(url, data, config) {
    return this.request(this.combineConfig(url, 'DELETE', data, config))
  }

  // 处理 config
  combineConfig(url, method, data, config = {}) {
    const {
      timeout = 30000,
      header,
    } = config
    const result = {
      url,
      method,
      timeout,
      data,
      header
    }
    return result
  }

  async request(config) {
    const currentConfig = await requestInter(config)
    const response = await this.base(currentConfig)
    return responseInter(config, response)
  }

  base(config) {
    const {
      url,
      method,
      header,
      data,
      timeout
    } = config
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        header,
        method,
        data,
        timeout,
        success: res => {
          resolve(res)
        },
        fail: (err) => {
          reject(new Error(`无响应(${err.errMsg})`))
        },
      })
    })
  }

}
export default new Http()
