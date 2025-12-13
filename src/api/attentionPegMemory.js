import request from './request.js'

/**
 * 保存定桩记忆训练记录
 * @param {Object} record
 */
export function savePegMemoryRecord(record) {
  return request({
    url: '/attention/pegMemory/records',
    method: 'post',
    data: record
  })
}

/**
 * 获取定桩记忆排行榜
 * @param {number} limit
 */
export function getPegMemoryTopRecords(limit = 10) {
  return request({
    url: '/attention/pegMemory/records/top',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取所有定桩记忆模板
 */
export function getAllPegMemoryTemplates() {
  return request({
    url: '/attention/pegMemory/templates',
    method: 'get'
  })
}

/**
 * 根据ID获取模板
 * @param {number} id
 */
export function getPegMemoryTemplateById(id) {
  return request({
    url: `/attention/pegMemory/templates/${id}`,
    method: 'get'
  })
}

/**
 * 创建模板
 * @param {Object} template
 */
export function createPegMemoryTemplate(template) {
  return request({
    url: '/attention/pegMemory/templates',
    method: 'post',
    data: template
  })
}

/**
 * 更新模板
 * @param {number} id
 * @param {Object} template
 */
export function updatePegMemoryTemplate(id, template) {
  return request({
    url: `/attention/pegMemory/templates/${id}`,
    method: 'put',
    data: template
  })
}

/**
 * 删除模板
 * @param {number} id
 */
export function deletePegMemoryTemplate(id) {
  return request({
    url: `/attention/pegMemory/templates/${id}`,
    method: 'delete'
  })
}

/**
 * 获取默认模板
 */
export function getDefaultPegMemoryTemplates() {
  return request({
    url: '/attention/pegMemory/templates/default',
    method: 'get'
  })
}

/**
 * 按分类获取模板
 * @param {string} category
 */
export function getPegMemoryTemplatesByCategory(category) {
  return request({
    url: '/attention/pegMemory/templates/byCategory',
    method: 'get',
    params: { category }
  })
}

