import { createApp } from 'vue'
import './assets/styles/main.css'
import App from './App.vue'
import i18n from './i18n/index.js'
import { showAlert } from './utils/alert.js'

const app = createApp(App).use(i18n)

// 将自定义 alert 挂载到全局，替换原生 alert
window.alert = showAlert

app.mount('#app')

