import request from './request.js'

/**
 * 生成数学测试题目
 * @param {string} operationTypes 计算类型列表（加减乘除），多个用逗号分隔
 * @param {number} count 题目数量
 * @param {number} minNumber 数字范围最小值
 * @param {number} maxNumber 数字范围最大值
 */
export function generateQuestions(operationTypes, count, minNumber, maxNumber) {
  return request({
    url: '/mathTest/generateQuestions',
    method: 'get',
    params: {
      operationTypes,
      count,
      minNumber,
      maxNumber
    }
  })
}

/**
 * 保存测试记录
 * @param {Object} record 测试记录对象
 */
export function saveTestRecord(record) {
  return request({
    url: '/mathTest/saveTestRecord',
    method: 'post',
    data: record
  })
}

/**
 * 获取所有测试记录
 */
export function getAllTestRecords() {
  return request({
    url: '/mathTest/getAllTestRecords',
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
 * @param {number} params.minAccuracyRate 最小正确率
 * @param {number} params.maxAccuracyRate 最大正确率
 */
export function getTestRecordsPage(params) {
  return request({
    url: '/mathTest/getTestRecordsPage',
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
    url: `/mathTest/getTestRecord/${id}`,
    method: 'get'
  })
}

/**
 * 删除测试记录
 * @param {number} id 测试记录ID
 */
export function deleteTestRecord(id) {
  return request({
    url: `/mathTest/deleteTestRecord/${id}`,
    method: 'delete'
  })
}

