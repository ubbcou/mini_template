import { isUrl } from '../utils/is'
import { responseInter, requestInter } from './interceptors'

const DEFAULT_HOST = 'http://localhost:3000'

class Http {
  get(url, config) {
    return this.request(this.combineConfig(url, 'GET', config))
  }

  post(url, config) {
    return this.request(this.combineConfig(url, 'POST', config))
  }

  put(url, config) {
    return this.request(this.combineConfig(url, 'PUT', config))
  }

  delete(url, config) {
    return this.request(this.combineConfig(url, 'DELETE', config))
  }

  // 处理 config
  combineConfig(url, method, config = {}) {
    const {
      timeout = 30000,
      header,
      data
    } = config
    if (!isUrl(url)) {
      url = DEFAULT_HOST + url
    }
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
