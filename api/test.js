import http from './http'

export function test(data) {
  return http.get('/api/test', { data })
}
