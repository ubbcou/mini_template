# 小程序请求封装

## 一 目标：  

  1. 使用方法：`http.get('/test-url', { id: 1 })`
  2. 请求拦截
  3. 响应拦截

## 二 步骤

1. 请求封装
2. 定义细化方法
3. 提供默认拦截中间件

### 第一步 封装原生请求为 `Promise`

```javascript
class Http {
  ...
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
          reject(new Error(`客户端错误(${err.errMsg})`))
        },
      })
    })
  }
  .
}
```

### 第二步 定义 `get`、`post`、`put`、`delete` 方法

```javascript
class Http {
  base() { ... }
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
  
  // 请求中间层，稍后用到
  async request(config) {
    return await this.base(currentConfig)
  }
  
  /** 处理 `get` `post` `put` `delete` 方法的 config */
  combineConfig(url, method, config = {}) {
    const {
      timeout = 30000,
      header,
      data
    } = config
    // 如果不是正常的 url<如传入的url是 '/api/test'>
    // 给url加上 host 前缀
    if (!isUrl(url)) {
      // 声明的默认请求 host
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
}
```

### 第三步 增加请求、响应拦截中间件

```javascript
// http.js
class Http {
  /** 
   * 修改 request，
   * requestInter  请求拦截，返回处理后的 config
   * responseInter 响应拦截，返回处理后的 response
   */
  async request(config) {
    const currentConfig = await requestInter(config)
    // 请求开始
    const response = await this.base(currentConfig)
    // 请求结束
    return responseInter(config, response)
  }
}
```

默认拦截方法

```javascript
// interceptors.js
// 请求拦截
function requestInter(config) {
  return {
    ...config,
    header: {
      ...config.header,
      customTag: '我加上了这个header',
    }
  }
  // 也可以返回一个一个promise
  // return new Promise((resolve) => {
  //   resolve({
  //     ...config,
  //     header: {
  //       ...config.header,
  //       customTag: 'Bear header tag',
  //     }
  //   })
  // })
}
// 响应拦截
// 同样可以返回 Promise
function responseInter(config, response) {
  const { statusCode, data } = response
  if (statusCode === 200) {
    return response
  } else {
    return Promise.reject(new Error('响应非200'))
  }
}
```

## 使用这个请求库，来实现自定义登录拦截的业务

业务目标：
请求过程中发现需要登录，则执行登录行为，登录成功后将发起新的请求，把新的请求结果返回给第一次请求

1. 创建本地server，以供鉴权模拟请求
2. 修改拦截方法
3. 登录持久化

### 第一步 创建本地server

```javascript
// server.js
// 运行server：node ./server.js

const http = require('http')

const port = 3000
const hostname = 'localhost'

const server = http.createServer((req, res) => {
  // 如果存在这个 request header，则表明登录是有效的
  if (req.headers['ubbcou-header']) {
    res.statusCode = 200
    res.end(JSON.stringify({
      success: true,
      message: 'hello world',
      data: req.headers['ubbcou-header'],
    }))
  } else {
    // 否则 401 无权访问
    res.statusCode = 401
    res.end(JSON.stringify({
      success: false,
      data: req.headers,
    }))
  }
})

server.listen(port, () => {
  console.log(`服务器运行在 http://${hostname}:${port}/`)
})

```

### 第二步 修改拦截方法

```javascript
// interceptors.js
// 登录校验值
let token = ''

export function requestInter(config) {
  return {
    ...config,
    header: {
      ...config.header,
      'ubbcou-header': token, // 鉴权 header
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
      // 此时不resolve/reject结束Promise，保存
      // 这里执行进入登录，并存储本次请求信息
      waitLogin(config, resolve, reject)
    } else {
      reject(new Error('响应非200'))
    }
  })
}
```

请求拦截中的登录处理逻辑

```javascript
// login.js

// 需要重新触发的请求队列
const requestQueue = []

function waitLogin(config, originResolve, originReject) {
  // 这里的作用是：创建新的请求，新的请求结束后，将结果使用原请求的resolve/reject返回结果
  const currentRequest = async () => {
    try {
      resolve(await http.request(config))
    } catch (error) {
      reject(error)
    }
  }
  requestQueue.push(currentRequest)
  wx.navigateTo({
    url: '/login/login',
  })
}

function login() {
  token = 'insert token'
  try {
    // 取得token，请求队列
    await Promise.all(requestQueue.splice(0))
  } catch (error) {
    
  }
}
```

### 持久化

现在的token仅仅保留在内存中，小程序重新运行就需要重新获取token，因此我们需要增加持久化功能来提高用户体验。

本地存储是个很好的选择，但是我们需要妥善的存取。在实际开发中，或许有很多同学是没有规划地使用。现在我们要达成的目标是：简化localStorage的使用方法、集中化管理项目中用到的 `Storage` 对象。

下面这段封装就可以满足我们的需求了。`get` `set` `remove` 方法易于使用，同时还提供了设置默认值的功能。

```javascript
// local.js
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
```

我们实际使用看看。

```javascript
//interceptors.js

// 首先我们会从 本地 中查询是否存在token
let token = locToken.get()

export function requestInter(config) {
  return {
    ...config,
    header: {
      ...config.header,
      'ubbcou-header': token, // 鉴权 header
    }
  }
}

// 修改登录是的token存储
function login() {
  token = 'insert token'
  locToken.set(token)
  try {
    // 取得token，请求队列
    await Promise.all(requestQueue.splice(0))
  } catch (error) {
    
  }
}
```

## 总结

到这里我们就完成了。

这里我们使用到了请求封装、请求拦截、NodeJS Server、本地缓存管理。
- 完整片段：https://developers.weixin.qq.com/s/EyEGMWmx7npp
- github：https://github.com/ubbcou/mini_request_interceptors
