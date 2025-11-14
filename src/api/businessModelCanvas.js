import request from './request.js'

/**
 * 查询商业模式画布列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.title - 标题
 * @param {string} params.status - 状态
 * @param {string} params.searchValue - 搜索值
 * @returns {Promise}
 */
export function getCanvasList(params) {
  return request({
    url: '/business-model-canvas/list',
    method: 'get',
    params
  })
}

/**
 * 根据ID查询商业模式画布详情
 * @param {number} canvasId - 画布ID
 * @returns {Promise}
 */
export function getCanvasById(canvasId) {
  return request({
    url: `/business-model-canvas/${canvasId}`,
    method: 'get'
  })
}

/**
 * 新增商业模式画布
 * @param {Object} data - 画布数据
 * @returns {Promise}
 */
export function createCanvas(data) {
  return request({
    url: '/business-model-canvas',
    method: 'post',
    data
  })
}

/**
 * 修改商业模式画布
 * @param {Object} data - 画布数据
 * @returns {Promise}
 */
export function updateCanvas(data) {
  return request({
    url: '/business-model-canvas',
    method: 'put',
    data
  })
}

/**
 * 删除商业模式画布
 * @param {Array<number>} canvasIds - 画布ID数组
 * @returns {Promise}
 */
export function deleteCanvas(canvasIds) {
  return request({
    url: `/business-model-canvas/${canvasIds.join(',')}`,
    method: 'delete'
  })
}

