import request from './request.js'
import axios from 'axios'
import { getToken } from '../utils/auth.js'

// 获取当前语言设置
function getCurrentLocale() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('locale') || 'zh-CN'
    }
  } catch (e) {
    console.warn('Failed to access localStorage:', e)
  }
  return 'zh-CN'
}

/**
 * 调用后端生成感官记忆内容并入库
 * 使用单独的 axios 实例，设置 60 秒超时
 * @param {Object} payload
 * @param {string} payload.prompt 主题/提示词
 * @param {string} payload.keywords 关键词/关键句子（可选）
 * @param {number} payload.count 生成数量（5-10）
 * @param {string} payload.difficulty 难度
 * @param {string} payload.contentType 内容类型：word(词语) / sentence(句子)
 * @param {string[]} payload.tags 标签
 */
export function generateSensoryContents(payload) {
  // 为生成请求创建单独的 axios 实例，设置更长的超时时间（60秒）
  const generateRequest = axios.create({
    baseURL: '/api',
    timeout: 60000, // 60秒超时
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // 添加请求拦截器（使用统一的 token 和语言设置逻辑）
  generateRequest.interceptors.request.use(
    (config) => {
      // 使用统一的 getToken() 函数获取 token
      const token = getToken()
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      
      // 添加语言设置
      const locale = getCurrentLocale()
      if (locale) {
        config.headers['lang'] = locale
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  // 添加响应拦截器
  generateRequest.interceptors.response.use(
    (response) => {
      const res = response.data
      if (res.code && res.code !== 200) {
        return Promise.reject(new Error(res.msg || '请求失败'))
      }
      return res
    },
    (error) => {
      if (error.response) {
        const message = error.response.data?.msg || error.response.data?.message || `请求失败 (${error.response.status})`
        return Promise.reject(new Error(message))
      }
      if (error.message === 'Network Error') {
        return Promise.reject(new Error('网络连接失败，请检查网络'))
      }
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return Promise.reject(new Error('请求超时，请稍后重试'))
      }
      return Promise.reject(error)
    }
  )
  
  return generateRequest({
    url: '/attention/sensoryMemory/contents/generate',
    method: 'post',
    data: payload
  })
}

/**
 * 获取最近生成的感官记忆内容
 * @param {number} limit 数量
 */
export function getLatestSensoryContents(limit = 10) {
  return request({
    url: '/attention/sensoryMemory/contents/latest',
    method: 'get',
    params: { limit }
  })
}

/**
 * 保存感官记忆训练记录
 * @param {Object} record
 */
export function saveSensoryMemoryRecord(record) {
  return request({
    url: '/attention/sensoryMemory/records',
    method: 'post',
    data: record
  })
}

/**
 * 获取感官记忆排行榜
 * @param {number} limit
 */
export function getSensoryMemoryTopRecords(limit = 10) {
  return request({
    url: '/attention/sensoryMemory/records/top',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取全部标签
 */
export function getSensoryMemoryTags() {
  return request({
    url: '/attention/sensoryMemory/contents/tags',
    method: 'get'
  })
}

/**
 * 按标签获取内容
 * @param {string} tag
 * @param {number} limit
 */
export function getSensoryContentsByTag(tag, limit = 30) {
  return request({
    url: '/attention/sensoryMemory/contents/byTag',
    method: 'get',
    params: { tag, limit }
  })
}

/**
 * 分页查询用户记录
 * @param {number} pageNum
 * @param {number} pageSize
 */
export function getSensoryMemoryRecords(pageNum = 1, pageSize = 10) {
  return request({
    url: '/attention/sensoryMemory/records/list',
    method: 'get',
    params: { pageNum, pageSize }
  })
}

