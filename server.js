const http = require('http')

const port = 3000
const hostname = 'localhost'

const server = http.createServer((req, res) => {
  if (req.headers['ubbcou-header']) {
    res.statusCode = 200
    res.end(JSON.stringify({
      success: true,
      message: 'hello world',
      data: req.headers['ubbcou-header'],
    }))
  } else {
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
