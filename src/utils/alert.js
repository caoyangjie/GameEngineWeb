import { createApp, h } from 'vue'
import CustomAlert from '../components/common/CustomAlert.vue'
import CustomConfirm from '../components/common/CustomConfirm.vue'
import i18n from '../i18n/index.js'

/**
 * 显示自定义 Alert 弹框
 * @param {string} message - 提示消息
 * @param {Object} options - 配置选项
 * @param {string} options.type - 类型：'success' | 'error' | 'info'，默认 'info'
 * @param {number} options.duration - 自动关闭时间（毫秒），0 表示不自动关闭，默认 3000
 * @param {string} options.confirmText - 确认按钮文字，默认使用多语言配置
 * @param {boolean} options.closeOnClickOverlay - 点击遮罩层是否关闭，默认 true
 * @returns {Promise} 返回一个 Promise，点击确认后 resolve
 */
export function showAlert(message, options = {}) {
  return new Promise((resolve) => {
    const {
      type = 'info',
      duration = 3000,
      confirmText,
      closeOnClickOverlay = true
    } = options
    
    // 如果没有提供 confirmText，使用多语言配置
    const finalConfirmText = confirmText || i18n.global.t('common.alertConfirm')

    // 创建容器元素
    const container = document.createElement('div')
    document.body.appendChild(container)

    // 创建 Vue 应用实例
    const app = createApp({
      setup() {
        const handleClose = () => {
          app.unmount()
          document.body.removeChild(container)
          resolve()
        }

        const handleConfirm = () => {
          handleClose()
        }

        return () => h(CustomAlert, {
          message,
          type,
          duration,
          confirmText: finalConfirmText,
          closeOnClickOverlay,
          onClose: handleClose,
          onConfirm: handleConfirm
        })
      }
    })

    // 使用 i18n，确保组件内可以使用 useI18n()
    app.use(i18n)

    // 挂载应用
    app.mount(container)
  })
}

/**
 * 显示成功提示
 * @param {string} message - 提示消息
 * @param {Object} options - 配置选项
 */
export function showSuccess(message, options = {}) {
  return showAlert(message, { ...options, type: 'success' })
}

/**
 * 显示错误提示
 * @param {string} message - 提示消息
 * @param {Object} options - 配置选项
 */
export function showError(message, options = {}) {
  return showAlert(message, { ...options, type: 'error' })
}

/**
 * 显示信息提示
 * @param {string} message - 提示消息
 * @param {Object} options - 配置选项
 */
export function showInfo(message, options = {}) {
  return showAlert(message, { ...options, type: 'info' })
}

/**
 * 显示确认对话框（带确认和取消按钮）
 * @param {string} message - 提示消息
 * @param {Object} options - 配置选项
 * @param {string} options.type - 类型：'success' | 'error' | 'info'，默认 'info'
 * @param {string} options.confirmText - 确认按钮文字，默认使用多语言配置
 * @param {string} options.cancelText - 取消按钮文字，默认使用多语言配置
 * @param {boolean} options.closeOnClickOverlay - 点击遮罩层是否关闭，默认 false
 * @returns {Promise<boolean>} 返回一个 Promise，点击确认后 resolve(true)，点击取消后 resolve(false)
 */
export function showConfirm(message, options = {}) {
  return new Promise((resolve) => {
    const {
      type = 'info',
      confirmText,
      cancelText,
      closeOnClickOverlay = false
    } = options
    
    // 如果没有提供按钮文字，使用多语言配置
    const finalConfirmText = confirmText || i18n.global.t('common.alertConfirm')
    const finalCancelText = cancelText || i18n.global.t('common.alertCancel')

    // 创建容器元素
    const container = document.createElement('div')
    document.body.appendChild(container)

    // 创建 Vue 应用实例
    const app = createApp({
      setup() {
        const handleClose = (confirmed) => {
          app.unmount()
          document.body.removeChild(container)
          resolve(confirmed)
        }

        const handleConfirm = () => {
          handleClose(true)
        }

        const handleCancel = () => {
          handleClose(false)
        }

        return () => h(CustomConfirm, {
          message,
          type,
          confirmText: finalConfirmText,
          cancelText: finalCancelText,
          closeOnClickOverlay,
          onClose: handleClose,
          onConfirm: handleConfirm,
          onCancel: handleCancel
        })
      }
    })

    // 使用 i18n，确保组件内可以使用 useI18n()
    app.use(i18n)

    // 挂载应用
    app.mount(container)
  })
}

// 为了兼容原生 alert 的调用方式，导出一个默认的 alert 函数
export default function alert(message, options = {}) {
  return showAlert(message, options)
}

