import request from './request.js'

/**
 * 获取照相记忆游戏的 TOP 记录
 * @param {number} gridSize 方格尺寸（如 4 表示 4x4），用于区分不同尺寸的排行榜
 * @param {number} limit 最大返回记录数
 */
export function getPhotoMemoryTopRecords(gridSize, limit = 10) {
  return request({
    url: '/attention/photoMemory/records/top',
    method: 'get',
    params: { gridSize, limit }
  })
}

/**
 * 保存照相记忆游戏记录
 * @param {Object} record
 * @param {number} record.gridSize 方格尺寸（如 4 表示 4x4）
 * @param {number} record.durationMs 完成所用毫秒数
 * @param {number} record.accuracy 准确率（0-100）
 * @param {number} record.totalCells 总格子数
 * @param {number} record.correctCells 正确点击的格子数
 * @param {string} record.username 显示名
 */
export function savePhotoMemoryRecord(record) {
  return request({
    url: '/attention/photoMemory/records',
    method: 'post',
    data: record
  })
}

