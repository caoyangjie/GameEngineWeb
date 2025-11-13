import request from './request.js'

/**
 * 登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @param {string} code 验证码（可选）
 * @param {string} uuid 唯一标识（可选）
 */
export function login(username, password, code = '', uuid = '') {
  return request({
    url: '/login',
    method: 'post',
    data: {
      username,
      password,
      code,
      uuid
    }
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

