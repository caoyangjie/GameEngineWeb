import request from './request.js'

/**
 * 查询用户需求列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.personaId - 用户画像ID
 * @param {number} params.canvasId - 画布ID
 * @param {string} params.title - 标题
 * @returns {Promise}
 */
export function getRequirementList(params) {
  return request({
    url: '/requirement/list',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询用户需求详情
 * @param {number} requirementId - 用户需求ID
 * @returns {Promise}
 */
export function getRequirementById(requirementId) {
  return request({
    url: `/requirement/${requirementId}`,
    method: 'get'
  })
}

/**
 * 新增用户需求
 * @param {Object} data - 用户需求数据
 * @returns {Promise}
 */
export function createRequirement(data) {
  return request({
    url: '/requirement',
    method: 'post',
    data
  })
}

/**
 * 修改用户需求
 * @param {Object} data - 用户需求数据
 * @returns {Promise}
 */
export function updateRequirement(data) {
  return request({
    url: '/requirement',
    method: 'put',
    data
  })
}

/**
 * 删除用户需求
 * @param {Array<number>} requirementIds - 用户需求ID数组
 * @returns {Promise}
 */
export function deleteRequirement(requirementIds) {
  return request({
    url: `/requirement/${requirementIds.join(',')}`,
    method: 'delete'
  })
}

/**
 * 查询父需求列表（用于需求拆分）
 * @param {Object} params - 查询参数
 * @param {number} params.personaId - 用户画像ID
 * @param {number} params.canvasId - 画布ID
 * @param {number} params.excludeRequirementId - 排除的需求ID（编辑时排除自己）
 * @returns {Promise}
 */
export function getParentRequirementList(params) {
  return request({
    url: '/requirement/parent-list',
    method: 'get',
    params
  })
}

