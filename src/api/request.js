import axios from 'axios'
import { getToken, removeToken } from '../utils/auth.js'
import { ROUTES } from '../composables/useRouter.js'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

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

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加 token 到请求头
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 添加语言设置到请求头，后端根据此请求头返回对应语言的响应
    const locale = getCurrentLocale()
    if (locale) {
      config.headers['lang'] = locale
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 如果返回的状态码不是 200，说明有错误
    if (res.code && res.code !== 200) {
      // 401: 未登录或 token 过期
      if (res.code === 401) {
        // 清除 token 和用户信息
        removeToken()
        // 跳转到登录页
        if (window.router) {
          window.router.goToLogin()
        }
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    
    return res
  },
  (error) => {
    console.error('响应错误:', error)
    
    // 处理 HTTP 错误状态码
    if (error.response) {
      const { status } = error.response
      
      // 401: 未授权，token 无效或过期
      if (status === 401) {
        removeToken()
        if (window.router) {
          window.router.goToLogin()
        }
      }
      
      // 其他错误
      const message = error.response.data?.msg || error.response.data?.message || `请求失败 (${status})`
      return Promise.reject(new Error(message))
    }
    
    // 网络错误
    if (error.message === 'Network Error') {
      return Promise.reject(new Error('网络连接失败，请检查网络'))
    }
    
    return Promise.reject(error)
  }
)

export default service

