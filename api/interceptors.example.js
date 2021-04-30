import { isUrl } from '../utils/is'
const host = 'http://localhost:3000'

// interceptors.js
// 请求拦截
export function requestInter(config) {
  const { url } = config
  return {
    ...config,
    header: {
      ...config.header,
      url: isUrl(url) ? url : `${host}${url}`,
      'ubbcou-header': 'added the header',
    }
  }
}

export function responseInter(config, response) {
  const { statusCode, data } = response
  if (statusCode === 200) {
    return data
  } else {
    return Promise.reject(new Error('响应非200'))
  }
}
