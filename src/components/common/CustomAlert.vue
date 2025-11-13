<template>
  <Transition name="alert-fade">
    <div v-if="visible" class="custom-alert-overlay" @click.self="handleOverlayClick">
      <div class="custom-alert-container">
        <div class="custom-alert-content">
          <div class="custom-alert-icon" :class="type">
            <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="custom-alert-message">{{ message }}</div>
        </div>
        <div class="custom-alert-footer">
          <button class="custom-alert-button" @click="handleConfirm">
            {{ finalConfirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // success, error, info
    validator: (value) => ['success', 'error', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000 // 自动关闭时间（毫秒），0 表示不自动关闭
  },
  confirmText: {
    type: String,
    default: '' // 如果为空，将使用多语言配置
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

// 计算最终的确认按钮文本，如果未提供则使用多语言配置
const finalConfirmText = computed(() => {
  return props.confirmText || t('common.alertConfirm')
})

const emit = defineEmits(['close', 'confirm'])

const visible = ref(false)
let timer = null

onMounted(() => {
  visible.value = true
  
  if (props.duration > 0) {
    timer = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})

const handleConfirm = () => {
  handleClose()
  emit('confirm')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

const handleClose = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // 等待动画完成
}
</script>

<style scoped>
.custom-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: overlay-fade-in 0.3s ease;
}

.custom-alert-container {
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 16px;
  padding: 0;
  min-width: 360px;
  max-width: 500px;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  overflow: hidden;
  animation: alert-scale-in 0.3s ease;
}

.custom-alert-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.custom-alert-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.custom-alert-icon svg {
  width: 36px;
  height: 36px;
  color: #ffd700;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
}

.custom-alert-icon.success {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.3);
}

.custom-alert-icon.success svg {
  color: #4ade80;
  filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.6));
}

.custom-alert-icon.error {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.3);
}

.custom-alert-icon.error svg {
  color: #f87171;
  filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.6));
}

.custom-alert-message {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  line-height: 1.6;
  word-break: break-word;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.custom-alert-footer {
  padding: 0 30px 25px 30px;
  display: flex;
  justify-content: center;
}

.custom-alert-button {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  padding: 12px 40px;
  font-size: 16px;
  font-weight: 600;
  color: #ffd700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  letter-spacing: 1px;
  min-width: 120px;
}

.custom-alert-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%);
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.custom-alert-button:active {
  transform: translateY(0);
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.3),
    inset 0 0 15px rgba(255, 215, 0, 0.05);
}

/* 动画效果 */
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.3s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes alert-scale-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .custom-alert-container {
    min-width: 300px;
    max-width: 90%;
    margin: 20px;
  }
  
  .custom-alert-content {
    padding: 25px 20px;
  }
  
  .custom-alert-message {
    font-size: 14px;
  }
  
  .custom-alert-button {
    padding: 10px 30px;
    font-size: 14px;
  }
}
</style>

