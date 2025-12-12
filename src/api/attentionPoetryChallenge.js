import request from './request.js'

/**
 * 调用后端生成诗词词单并入库
 * @param {Object} payload
 * @param {string} payload.prompt 主题/提示词
 * @param {number} payload.count 生成数量
 * @param {string} payload.difficulty 难度
 * @param {string} payload.domain 场景/领域
 * @param {string[]} payload.tags 标签
 */
export function generatePoetryList(payload) {
  return request({
    url: '/attention/poetryChallenge/poetries/generate',
    method: 'post',
    data: payload
  })
}

/**
 * 获取最近生成的诗词词单
 * @param {number} limit 数量
 */
export function getLatestPoetries(limit = 8) {
  return request({
    url: '/attention/poetryChallenge/poetries/latest',
    method: 'get',
    params: { limit }
  })
}

/**
 * 保存诗词记忆训练记录
 * @param {Object} record
 */
export function savePoetryRecord(record) {
  return request({
    url: '/attention/poetryChallenge/records',
    method: 'post',
    data: record
  })
}

/**
 * 获取诗词记忆排行榜
 * @param {number} limit
 */
export function getPoetryTopRecords(limit = 10) {
  return request({
    url: '/attention/poetryChallenge/records/top',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取全部诗词标签
 */
export function getPoetryTags() {
  return request({
    url: '/attention/poetryChallenge/poetries/tags',
    method: 'get'
  })
}

/**
 * 按标签获取诗词
 * @param {string} tag
 * @param {number} limit
 */
export function getPoetriesByTag(tag, limit = 30) {
  return request({
    url: '/attention/poetryChallenge/poetries/byTag',
    method: 'get',
    params: { tag, limit }
  })
}

/**
 * 检索诗词：先从数据库查询，没有则调用DeepSeek获取
 * @param {string} title 诗词标题
 */
export function searchPoetry(title) {
  return request({
    url: '/attention/poetryChallenge/poetries/search',
    method: 'get',
    params: { title }
  })
}

