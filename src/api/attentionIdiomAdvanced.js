import request from './request.js'

/**
 * 调用后端生成成语词单并入库
 * @param {Object} payload
 * @param {string} payload.prompt 主题/提示词
 * @param {number} payload.count 生成数量
 * @param {string} payload.difficulty 难度
 * @param {string} payload.domain 场景/领域
 * @param {string[]} payload.tags 标签
 */
export function generateIdiomList(payload) {
  return request({
    url: '/attention/idiomAdvanced/idioms/generate',
    method: 'post',
    data: payload
  })
}

/**
 * 获取最近生成的成语词单
 * @param {number} limit 数量
 */
export function getLatestIdioms(limit = 8) {
  return request({
    url: '/attention/idiomAdvanced/idioms/latest',
    method: 'get',
    params: { limit }
  })
}

/**
 * 保存成语记忆训练记录
 * @param {Object} record
 */
export function saveIdiomRecord(record) {
  return request({
    url: '/attention/idiomAdvanced/records',
    method: 'post',
    data: record
  })
}

/**
 * 获取成语记忆排行榜
 * @param {number} limit
 */
export function getIdiomTopRecords(limit = 10) {
  return request({
    url: '/attention/idiomAdvanced/records/top',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取全部成语标签
 */
export function getIdiomTags() {
  return request({
    url: '/attention/idiomAdvanced/idioms/tags',
    method: 'get'
  })
}

/**
 * 按标签获取成语
 * @param {string} tag
 * @param {number} limit
 */
export function getIdiomsByTag(tag, limit = 30) {
  return request({
    url: '/attention/idiomAdvanced/idioms/byTag',
    method: 'get',
    params: { tag, limit }
  })
}

/**
 * 检索成语：先从数据库查询，没有则调用DeepSeek获取
 * @param {string} idiom 成语文本
 */
export function searchIdiom(idiom) {
  return request({
    url: '/attention/idiomAdvanced/idioms/search',
    method: 'get',
    params: { idiom }
  })
}


