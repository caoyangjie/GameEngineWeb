import request from './request.js'

/**
 * 查询所有可用模板（用于下拉选择）
 * @returns {Promise}
 */
export function getAllTemplates() {
  return request({
    url: '/learning-methodology-template/all',
    method: 'get'
  })
}

/**
 * 根据ID查询模板详情
 * @param {number} templateId - 模板ID
 * @returns {Promise}
 */
export function getTemplateById(templateId) {
  return request({
    url: `/learning-methodology-template/${templateId}`,
    method: 'get'
  })
}

/**
 * 查询模板列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.title - 标题
 * @param {string} params.status - 状态
 * @param {string} params.searchValue - 搜索值
 * @returns {Promise}
 */
export function getTemplateList(params) {
  return request({
    url: '/learning-methodology-template/list',
    method: 'get',
    params
  })
}

/**
 * 新增模板
 * @param {Object} data - 模板数据
 * @returns {Promise}
 */
export function createTemplate(data) {
  return request({
    url: '/learning-methodology-template',
    method: 'post',
    data
  })
}

/**
 * 修改模板
 * @param {Object} data - 模板数据
 * @returns {Promise}
 */
export function updateTemplate(data) {
  return request({
    url: '/learning-methodology-template',
    method: 'put',
    data
  })
}

/**
 * 删除模板
 * @param {Array<number>} templateIds - 模板ID数组
 * @returns {Promise}
 */
export function deleteTemplate(templateIds) {
  return request({
    url: `/learning-methodology-template/${templateIds.join(',')}`,
    method: 'delete'
  })
}

/**
 * 查询学习记录列表（按学生姓名分组）
 * @param {Object} params - 查询参数
 * @param {number} params.templateId - 模板ID
 * @param {string} params.studentName - 学生姓名（可选）
 * @returns {Promise}
 */
export function getLearningRecordList(params) {
  return request({
    url: '/learning-record/list',
    method: 'get',
    params
  })
}

/**
 * 创建学习记录
 * @param {Object} data - 学习记录数据
 * @param {number} data.templateId - 模板ID
 * @param {string} data.studentName - 学生姓名
 * @param {string} data.learningTopic - 学习主题
 * @returns {Promise}
 */
export function createLearningRecord(data) {
  return request({
    url: '/learning-record',
    method: 'post',
    data
  })
}

/**
 * 更新学习记录的步骤数据
 * @param {number} recordId - 记录ID
 * @param {Object|string} stepsData - 步骤数据（对象或JSON字符串）
 * @returns {Promise}
 */
export function updateLearningRecordStepsData(recordId, stepsData) {
  return request({
    url: `/learning-record/${recordId}/steps-data`,
    method: 'put',
    data: {
      stepsData: typeof stepsData === 'string' ? stepsData : JSON.stringify(stepsData)
    }
  })
}

/**
 * 根据模板ID和学习主题查询学习记录
 * @param {Object} params - 查询参数
 * @param {number} params.templateId - 模板ID
 * @param {string} params.learningTopic - 学习主题
 * @returns {Promise}
 */
export function getLearningRecordByTopic(params) {
  return request({
    url: '/learning-record/list',
    method: 'get',
    params
  })
}

/**
 * 删除学习记录
 * @param {Array<number>} recordIds - 记录ID数组
 * @returns {Promise}
 */
export function deleteLearningRecord(recordIds) {
  return request({
    url: `/learning-record/${recordIds.join(',')}`,
    method: 'delete'
  })
}

