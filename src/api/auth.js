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
 * 获取第三方登录授权地址
 * @param {string} provider 第三方平台标识（wechat/qq/feishu/dingtalk）
 */
export function getSocialAuthorizeUrl(provider) {
  return request({
    url: `/oauth/authorize/${provider}`,
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

/**
 * 获取用户扩展信息
 */
export function getUserExtInfo() {
  return request({
    url: '/profile/getExtInfo',
    method: 'get'
  })
}

/**
 * 更新用户扩展信息
 * @param {string} recruitmentLink 招聘链接
 * @param {string} currentLevel 当前旅程等级
 * @param {string} playerId 玩家ID
 * @param {string} bep20Address BEP20地址
 */
export function updateUserExtInfo(recruitmentLink, currentLevel, playerId, bep20Address) {
  return request({
    url: '/profile/updateExtInfo',
    method: 'post',
    data: {
      recruitmentLink,
      currentLevel,
      playerId,
      bep20Address
    }
  })
}

/**
 * 更新用户密码
 * @param {string} oldPassword 旧密码
 * @param {string} newPassword 新密码
 * @param {string} confirmPassword 确认密码
 */
export function updatePassword(oldPassword, newPassword, confirmPassword) {
  return request({
    url: '/profile/updatePassword',
    method: 'post',
    data: {
      oldPassword,
      newPassword,
      confirmPassword
    }
  })
}

/**
 * 生成二维码
 * @param {string} content 二维码内容
 */
export function generateQRCode(content) {
  return request({
    url: '/profile/generateQRCode',
    method: 'get',
    params: {
      content
    }
  })
}

/**
 * 获取存款地址和二维码
 */
export function getDepositAddresses() {
  return request({
    url: '/deposit/getAddresses',
    method: 'get'
  })
}

