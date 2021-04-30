export function isUrl(url) {
  return /^http(s)?:\/\//.test(url)
}

// 判断是否是json string
export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      return !!(typeof obj === 'object' && obj)
    } catch (e) {
      return false
    }
  }
}
