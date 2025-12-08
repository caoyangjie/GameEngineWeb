import request from './request.js'

/**
 * 获取测试汉字
 * @param {string} educationLevel 教育阶段: primary(小学), middle(初中), high(高中)
 * @param {number} count 测试字数
 */
export function getTestCharacters(educationLevel, count) {
  return request({
    url: '/characterTest/getCharacters',
    method: 'get',
    params: {
      educationLevel,
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

