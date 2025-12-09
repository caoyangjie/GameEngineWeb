import request from './request.js'

/**
 * 获取字母巩固游戏的 TOP 记录
 * @param {number} gridSize 方格尺寸（如 5 表示 5x5），用于区分不同尺寸的排行榜
 * @param {number} limit 最大返回记录数
 */
export function getLetterReinforceTopRecords(gridSize, limit = 10) {
  return request({
    url: '/attention/letterReinforce/records/top',
    method: 'get',
    params: { gridSize, limit }
  })
}

/**
 * 保存字母巩固游戏记录
 * @param {Object} record
 * @param {number} record.gridSize 方格尺寸（如 5 表示 5x5）
 * @param {number} record.durationMs 完成所用毫秒数
 * @param {string} record.username 显示名
 * @param {string|number} record.userId 用户ID，用于数据隔离
 */
export function saveLetterReinforceRecord(record) {
  return request({
    url: '/attention/letterReinforce/records',
    method: 'post',
    data: record
  })
}

