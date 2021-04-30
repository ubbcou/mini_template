// interceptors.js
// 请求拦截
export function requestInter(config) {
  return {
    ...config,
    header: {
      ...config.header,
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
