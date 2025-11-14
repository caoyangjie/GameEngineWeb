<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
      <div 
        class="modal-content scenario-detail-modal" 
        :class="{ 'is-maximized': isMaximized }"
        @click.stop
      >
        <!-- 头部 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ t('persona.scenarioList.detailTitle') }}</h3>
          <div class="header-actions">
            <button 
              class="header-btn" 
              @click="toggleMaximize"
              :title="isMaximized ? t('persona.scenarioManagement.restore') : t('persona.scenarioManagement.maximize')"
            >
              <svg v-if="!isMaximized" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V5M16 3V5M3 8H5M19 8H21M3 16H5M19 16H21M8 21V19M16 21V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button 
              class="header-btn close-btn" 
              @click="handleClose"
              :title="t('persona.scenarioManagement.close')"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="modal-body">
          <div class="detail-container">
            <div class="detail-scroll">
              <!-- 场景标题 -->
              <div class="detail-field">
                <label class="field-label">{{ t('persona.scenarioManagement.title') }}</label>
                <div class="field-value">{{ scenarioData.title || t('persona.scenarioList.noTitle') }}</div>
              </div>

              <!-- 用户画像 -->
              <div class="detail-field" v-if="scenarioData.personaName">
                <label class="field-label">{{ t('persona.detail.name') }}</label>
                <div class="field-value">{{ scenarioData.personaName }}</div>
              </div>

              <!-- 用户角色 -->
              <div class="detail-field" v-if="scenarioData.userRole">
                <label class="field-label">{{ t('persona.scenarioManagement.userRole') }}</label>
                <div class="field-value">{{ scenarioData.userRole }}</div>
              </div>

              <!-- 环境 -->
              <div class="detail-field" v-if="scenarioData.environment">
                <label class="field-label">{{ t('persona.scenarioManagement.environment') }}</label>
                <div class="field-value">{{ scenarioData.environment }}</div>
              </div>

              <!-- 目标 -->
              <div class="detail-field" v-if="scenarioData.goal">
                <label class="field-label">{{ t('persona.scenarioManagement.goal') }}</label>
                <div class="field-value">{{ scenarioData.goal }}</div>
              </div>

              <!-- 动机 -->
              <div class="detail-field" v-if="scenarioData.motivation">
                <label class="field-label">{{ t('persona.scenarioManagement.motivation') }}</label>
                <div class="field-value">{{ scenarioData.motivation }}</div>
              </div>

              <!-- 情境状况 -->
              <div class="detail-field" v-if="scenarioData.situation">
                <label class="field-label">{{ t('persona.scenarioManagement.situation') }}</label>
                <div class="field-value">{{ scenarioData.situation }}</div>
              </div>

              <!-- 行为流程 -->
              <div class="detail-field" v-if="scenarioData.behaviorFlow">
                <label class="field-label">{{ t('persona.scenarioManagement.behaviorFlow') }}</label>
                <div class="field-value">{{ scenarioData.behaviorFlow }}</div>
              </div>

              <!-- 障碍与痛点 -->
              <div class="detail-field" v-if="scenarioData.obstacles">
                <label class="field-label">{{ t('persona.scenarioManagement.obstacles') }}</label>
                <div class="field-value">{{ scenarioData.obstacles }}</div>
              </div>

              <!-- 结果与期望 -->
              <div class="detail-field" v-if="scenarioData.resultExpectation">
                <label class="field-label">{{ t('persona.scenarioManagement.resultExpectation') }}</label>
                <div class="field-value">{{ scenarioData.resultExpectation }}</div>
              </div>

              <!-- 创建时间 -->
              <div class="detail-field" v-if="scenarioData.createTime">
                <label class="field-label">{{ t('persona.scenarioList.createTime') }}</label>
                <div class="field-value">{{ formatDate(scenarioData.createTime) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="modal-footer">
          <button class="btn-primary" @click="handleClose">
            {{ t('persona.scenarioManagement.close') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  scenarioData: {
    type: Object,
    default: () => ({})
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const isMaximized = ref(false)

// 切换最大化
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 点击遮罩层
const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听弹窗关闭
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    // 弹窗关闭时重置最大化状态
    isMaximized.value = false
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlay-fade-in 0.3s ease;
}

@keyframes overlay-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.scenario-detail-modal {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(20, 10, 0, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 15px;
  padding: 0;
  width: 90%;
  max-width: 900px;
  height: 85vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 0 50px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  animation: modal-slide-up 0.3s ease;
  position: relative;
  overflow: hidden;
}

.scenario-detail-modal.is-maximized {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  max-height: 100vh;
  border-radius: 0;
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  flex-shrink: 0;
}

.modal-title {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.6);
  font-weight: bold;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-btn {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: #ffd700;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  padding: 0;
}

.header-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
  transform: scale(1.1);
}

.header-btn.close-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.6);
  color: #f44336;
}

.header-btn svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px 30px;
}

.detail-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

.detail-field {
  margin-bottom: 24px;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #ffd700;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.field-value {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  word-break: break-word;
  white-space: pre-wrap;
}

/* 滚动条样式 */
.detail-scroll::-webkit-scrollbar {
  width: 8px;
}

.detail-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.detail-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 4px;
}

.detail-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
  flex-shrink: 0;
}

.btn-primary {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scenario-detail-modal {
    width: 100%;
    height: 100vh;
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-body {
    padding: 15px 20px;
  }

  .modal-footer {
    padding: 15px 20px;
  }
}
</style>

