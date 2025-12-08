import request from './request.js'

/**
 * 获取测试汉字
 * @param {string} educationLevel 教育阶段: primary(小学), middle(初中), high(高中)
 * @param {string} grade 年级标识: 例如 primary-1 表示小学一年级
 * @param {number} count 测试字数
 */
export function getTestCharacters(educationLevel, grade, count) {
  return request({
    url: '/characterTest/getCharacters',
    method: 'get',
    params: {
      educationLevel,
      grade,
      count
    }
  })
}

/**
 * 获取所有汉字（用于管理）
 */
export function getAllCharacters() {
  return request({
    url: '/characterTest/getAllCharacters',
    method: 'get'
  })
}

/**
 * 保存测试记录
 * @param {Object} record 测试记录对象
 */
export function saveTestRecord(record) {
  return request({
    url: '/characterTest/saveTestRecord',
    method: 'post',
    data: record
  })
}

/**
 * 获取所有测试记录
 */
export function getAllTestRecords() {
  return request({
    url: '/characterTest/getAllTestRecords',
    method: 'get'
  })
}

/**
 * 分页查询测试记录
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.studentName 学生姓名（模糊查询）
 * @param {string} params.startDate 开始日期
 * @param {string} params.endDate 结束日期
 * @param {number} params.minMasteryRate 最小掌握率
 * @param {number} params.maxMasteryRate 最大掌握率
 */
export function getTestRecordsPage(params) {
  return request({
    url: '/characterTest/getTestRecordsPage',
    method: 'get',
    params
  })
}

/**
 * 根据ID获取测试记录
 * @param {number} id 测试记录ID
 */
export function getTestRecordById(id) {
  return request({
    url: `/characterTest/getTestRecord/${id}`,
    method: 'get'
  })
}

/**
 * 删除测试记录
 * @param {number} id 测试记录ID
 */
export function deleteTestRecord(id) {
  return request({
    url: `/characterTest/deleteTestRecord/${id}`,
    method: 'delete'
  })
}

