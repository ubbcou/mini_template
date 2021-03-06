import { locToken } from './local'
import http from './http'
import { isUrl } from '../utils/is'
const host = 'http://localhost:3000'

// 登录校验值
let token = locToken.get()
export function requestInter(config) {
  const { url } = config
  return {
    ...config,
    url: isUrl(url) ? url : `${host}${url}`,
    header: {
      ...config.header,
      'ubbcou-header': token, // 请求中携带的 ubbcou-header 有值，server则认为访问有效
    }
  }
}

export function responseInter(config, response) {
  return new Promise((resolve, reject) => {
    const { statusCode } = response
    if (statusCode === 200) {
      resolve(response)
    } else if (statusCode === 401) {
      // server 鉴权无效，返回401
      // 请求尝试失败，将进入登录等待
      // 这里执行进入登录，并存储本次请求信息
      waitLogin(config, resolve, reject)
    } else {
      reject(new Error('响应非200'))
    }
  })
}
// 等待队列
const loginQueue = []

/**
 * 
 * @param {*} config 为了重新发起相同的请求
 * @param {*} resolve 重新发起的请求将使用这个 resolve 来按照原路径提交结果
 * @param {*} reject 同上
 */
function waitLogin(config, resolve, reject) {
  // 创建新的请求，并且使用resolve
  // 这里的作用是：创建新的请求，新的请求结束后，将结果使用原请求的resove/reject返回结果
  const currentRequest = async () => {
    try {
      const response = await http.request(config)
      resolve(response)
    } catch (error) {
      reject(error)
    }
  }
  loginQueue.push(currentRequest)
  wx.navigateTo({
    url: '/login/login',
  })
}

export async function testLogin() {
  token = 'insert token'
  locToken.set(token)
  try {
    // 取得token，继续请求
    console.log('取得token，继续请求');
    await Promise.all(requestQueue.splice(0))
  } catch (error) {
    
  }
}