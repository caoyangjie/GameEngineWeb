import request from './request.js'

/**
 * 查询用户场景列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.personaId - 用户画像ID
 * @param {number} params.canvasId - 画布ID
 * @param {string} params.title - 标题
 * @returns {Promise}
 */
export function getScenarioList(params) {
  return request({
    url: '/scenario/list',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询用户场景详情
 * @param {number} scenarioId - 用户场景ID
 * @returns {Promise}
 */
export function getScenarioById(scenarioId) {
  return request({
    url: `/scenario/${scenarioId}`,
    method: 'get'
  })
}

/**
 * 新增用户场景
 * @param {Object} data - 用户场景数据
 * @returns {Promise}
 */
export function createScenario(data) {
  return request({
    url: '/scenario',
    method: 'post',
    data
  })
}

/**
 * 修改用户场景
 * @param {Object} data - 用户场景数据
 * @returns {Promise}
 */
export function updateScenario(data) {
  return request({
    url: '/scenario',
    method: 'put',
    data
  })
}

/**
 * 删除用户场景
 * @param {Array<number>} scenarioIds - 用户场景ID数组
 * @returns {Promise}
 */
export function deleteScenario(scenarioIds) {
  return request({
    url: `/scenario/${scenarioIds.join(',')}`,
    method: 'delete'
  })
}

