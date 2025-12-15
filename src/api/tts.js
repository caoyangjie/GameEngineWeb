import axios from 'axios'
import { getToken } from '../utils/auth.js'

/**
 * TTS 语音合成 API
 */

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
 * 合成语音
 * @param {Object} payload
 * @param {string} payload.text - 要合成的文本
 * @param {string} [payload.voice] - 发音人，默认为 Cherry
 * @param {number} [payload.targetNumber] - 数字传真目标数字
 * @param {number} [payload.groupCount] - 数字组数
 * @param {string} [payload.groupsJson] - 所有数字组的 JSON 字符串
 * @param {number} [payload.correctAnswer] - 正确答案
 * @param {number|null} [payload.userAnswer] - 用户答案（可空）
 * @returns {Promise<string>} 音频 URL 或 Base64 编码的音频数据
 */
export function synthesizeTts({
  text,
  voice = 'Cherry',
  targetNumber,
  groupCount,
  groupsJson,
  correctAnswer,
  userAnswer
}) {
  if (!text) {
    return Promise.reject(new Error('文本不能为空'))
  }
  // 为 TTS 请求创建单独的 axios 实例，设置更长的超时时间（60秒）
  const ttsRequest = axios.create({
    baseURL: '/api',
    timeout: 60000, // 60秒超时
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // 添加请求拦截器（使用统一的 token 和语言设置逻辑）
  ttsRequest.interceptors.request.use(
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
  ttsRequest.interceptors.response.use(
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
  
  return ttsRequest({
    url: '/tts/synthesize',
    method: 'post',
    data: {
      text,
      voice,
      targetNumber,
      groupCount,
      groupsJson,
      correctAnswer,
      userAnswer
    }
  }).then(res => {
    if (res.code === 200 && res.data) {
      return res.data
    }
    throw new Error(res.msg || 'TTS 合成失败')
  })
}

