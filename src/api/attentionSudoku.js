import request from './request.js'

/**
 * 获取数独游戏的 TOP 记录
 * @param {number} gridSize 数独尺寸（如 3 表示 3x3，9 表示 9x9），用于区分不同尺寸的排行榜
 * @param {string} difficulty 难度级别（easy/medium/hard），用于区分不同难度的排行榜
 * @param {number} limit 最大返回记录数
 */
export function getSudokuTopRecords(gridSize, difficulty, limit = 10) {
  return request({
    url: '/attention/sudoku/records/top',
    method: 'get',
    params: { gridSize, difficulty, limit }
  })
}

/**
 * 保存数独游戏记录
 * @param {Object} record
 * @param {number} record.gridSize 数独尺寸（如 3 表示 3x3，9 表示 9x9）
 * @param {string} record.difficulty 难度级别（easy/medium/hard）
 * @param {number} record.durationMs 完成所用毫秒数
 * @param {string} record.username 显示名
 * @param {string|number} record.userId 用户ID，用于数据隔离
 */
export function saveSudokuRecord(record) {
  return request({
    url: '/attention/sudoku/records',
    method: 'post',
    data: record
  })
}

/**
 * 校验数独查看答案验证码
 * @param {string} code 验证码内容
 * @param {string} uuid 验证码唯一标识
 */
export function verifySudokuCaptcha(code, uuid) {
  return request({
    url: '/attention/sudoku/verifyCaptcha',
    method: 'post',
    data: { code, uuid }
  })
}

