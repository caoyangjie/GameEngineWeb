import request from './request.js'

/**
 * 查询用户画像列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.canvasId - 画布ID
 * @param {string} params.name - 姓名
 * @param {string} params.gender - 性别
 * @returns {Promise}
 */
export function getPersonaList(params) {
  return request({
    url: '/persona/list',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询用户画像详情
 * @param {number} personaId - 用户画像ID
 * @returns {Promise}
 */
export function getPersonaById(personaId) {
  return request({
    url: `/persona/${personaId}`,
    method: 'get'
  })
}

/**
 * 新增用户画像
 * @param {Object} data - 用户画像数据
 * @returns {Promise}
 */
export function createPersona(data) {
  return request({
    url: '/persona',
    method: 'post',
    data
  })
}

/**
 * 修改用户画像
 * @param {Object} data - 用户画像数据
 * @returns {Promise}
 */
export function updatePersona(data) {
  return request({
    url: '/persona',
    method: 'put',
    data
  })
}

/**
 * 删除用户画像
 * @param {Array<number>} personaIds - 用户画像ID数组
 * @returns {Promise}
 */
export function deletePersona(personaIds) {
  return request({
    url: `/persona/${personaIds.join(',')}`,
    method: 'delete'
  })
}

