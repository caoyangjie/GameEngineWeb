import request from './request.js'

/**
 * 获取数字入门游戏的 TOP 记录
 * @param {number} gridSize 方格尺寸（如 5 表示 5x5），用于区分不同尺寸的排行榜
 * @param {number} limit 最大返回记录数
 */
export function getDigitIntroTopRecords(gridSize, limit = 10) {
  return request({
    url: '/attention/digitIntro/records/top',
    method: 'get',
    params: { gridSize, limit }
  })
}

/**
 * 保存数字入门游戏记录
 * @param {Object} record
 * @param {number} record.gridSize 方格尺寸（如 5 表示 5x5）
 * @param {number} record.durationMs 完成所用毫秒数
 * @param {string} record.username 显示名
 * @param {string|number} record.userId 用户ID，用于数据隔离
 */
export function saveDigitIntroRecord(record) {
  return request({
    url: '/attention/digitIntro/records',
    method: 'post',
    data: record
  })
}

