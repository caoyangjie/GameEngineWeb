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
 * 获取验证码
 */
export function getCaptchaImage() {
  return request({
    url: '/captchaImage',
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

/**
 * 用户注册
 * @param {string} firstName 名字
 * @param {string} lastName 姓氏
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @param {string} confirmPassword 确认密码
 * @param {string} code 验证码
 * @param {string} uuid 唯一标识
 * @param {string} recruiterId 招聘者ID（可选）
 */
export function register(firstName, lastName, email, password, confirmPassword, code, uuid, recruiterId = '') {
  return request({
    url: '/register',
    method: 'post',
    data: {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      code,
      uuid,
      recruiterId
    }
  })
}

/**
 * 忘记密码
 * @param {string} email 邮箱
 * @param {string} code 验证码
 * @param {string} uuid 唯一标识
 */
export function forgotPassword(email, code, uuid) {
  return request({
    url: '/forgotPassword',
    method: 'post',
    data: {
      email,
      code,
      uuid
    }
  })
}

