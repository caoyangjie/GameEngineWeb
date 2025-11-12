import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import es from './locales/es.json'
import de from './locales/de.json'

const messages = {
  'zh-CN': zhCN,
  'en': en,
  'zh-TW': zhTW,
  'ja': ja,
  'ko': ko,
  'es': es,
  'de': de
}

// 从 localStorage 获取保存的语言设置，默认为简体中文
// 使用 try-catch 防止在 SSR 环境中出错
let savedLocale = 'zh-CN'
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    savedLocale = localStorage.getItem('locale') || 'zh-CN'
  }
} catch (e) {
  console.warn('Failed to access localStorage:', e)
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true // 允许在模板中使用 $t
})

export default i18n

