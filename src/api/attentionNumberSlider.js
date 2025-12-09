import request from './request.js'

/**
 * 获取数字华容道游戏的 TOP 记录
 * @param {number} gridSize 方格尺寸（如 4 表示 4x4），用于区分不同尺寸的排行榜
 * @param {number} limit 最大返回记录数
 */
export function getNumberSliderTopRecords(gridSize, limit = 10) {
  return request({
    url: '/attention/numberSlider/records/top',
    method: 'get',
    params: { gridSize, limit }
  })
}

/**
 * 保存数字华容道游戏记录
 * @param {Object} record
 * @param {number} record.gridSize 方格尺寸（如 4 表示 4x4）
 * @param {number} record.durationMs 完成所用毫秒数
 * @param {number} record.moveCount 移动次数
 * @param {string} record.username 显示名
 */
export function saveNumberSliderRecord(record) {
  return request({
    url: '/attention/numberSlider/records',
    method: 'post',
    data: record
  })
}

