import request from './request.js'

/**
 * 保存数字传真训练记录
 * @param {Object} record
 * @param {number} record.targetNumber 目标数字
 * @param {number} record.groupCount 数字组数
 * @param {string} record.groups JSON字符串，包含所有数字组
 * @param {string} record.audioUrl 语音包下载地址
 * @param {number} record.correctAnswer 正确答案
 * @param {number} record.userAnswer 用户答案
 * @param {boolean} record.isCorrect 是否回答正确
 */
export function saveNumberFaxRecord(record) {
  return request({
    url: '/attention/numberFax/records',
    method: 'post',
    data: record
  })
}

/**
 * 获取数字传真训练记录列表
 * @param {number} limit 返回记录数，默认10
 */
export function getNumberFaxRecords(limit = 10) {
  return request({
    url: '/attention/numberFax/records',
    method: 'get',
    params: { limit }
  })
}

