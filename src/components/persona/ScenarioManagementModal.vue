<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
      <div 
        class="modal-content scenario-management-modal" 
        :class="{ 'is-maximized': isMaximized }"
        @click.stop
      >
        <!-- 头部 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditMode ? t('persona.scenarioManagement.editTitle') : t('persona.scenarioManagement.createTitle') }}</h3>
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
          <div class="form-container">
            <div class="form-scroll">
              <!-- 场景标题 -->
              <div class="form-field">
                <label class="field-label" for="scenario-title">{{ t('persona.scenarioManagement.title') }}</label>
                <CustomInput
                  id="scenario-title"
                  v-model="formData.title"
                  :placeholder="t('persona.scenarioManagement.titlePlaceholder')"
                />
              </div>

              <!-- 用户角色 -->
              <div class="form-field">
                <label class="field-label" for="scenario-user-role">{{ t('persona.scenarioManagement.userRole') }}</label>
                <textarea
                  id="scenario-user-role"
                  v-model="formData.userRole"
                  class="form-textarea"
                  :placeholder="t('persona.scenarioManagement.userRolePlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 环境 -->
              <div class="form-field">
                <label class="field-label" for="scenario-environment">{{ t('persona.scenarioManagement.environment') }}</label>
                <textarea
                  id="scenario-environment"
                  v-model="formData.environment"
                  class="form-textarea"
                  :placeholder="t('persona.scenarioManagement.environmentPlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 目标 -->
              <div class="form-field">
                <label class="field-label" for="scenario-goal">{{ t('persona.scenarioManagement.goal') }}</label>
                <textarea
                  id="scenario-goal"
                  v-model="formData.goal"
                  class="form-textarea"
                  :placeholder="t('persona.scenarioManagement.goalPlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 动机 -->
              <div class="form-field">
                <label class="field-label" for="scenario-motivation">{{ t('persona.scenarioManagement.motivation') }}</label>
                <textarea
                  id="scenario-motivation"
                  v-model="formData.motivation"
                  class="form-textarea"
                  :placeholder="t('persona.scenarioManagement.motivationPlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 情境状况 -->
              <div class="form-field">
                <label class="field-label" for="scenario-situation">{{ t('persona.scenarioManagement.situation') }}</label>
                <textarea
                  id="scenario-situation"
                  v-model="formData.situation"
                  class="form-textarea"
                  :placeholder="t('persona.scenarioManagement.situationPlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 行为流程 -->
              <div class="form-field">
                <label class="field-label" for="scenario-behavior-flow">{{ t('persona.scenarioManagement.behaviorFlow') }}</label>
                <textarea
                  id="scenario-behavior-flow"
                  v-model="formData.behaviorFlow"
                  class="form-textarea"
                  :placeholder="t('persona.scenarioManagement.behaviorFlowPlaceholder')"
                  rows="4"
                ></textarea>
              </div>

              <!-- 障碍与痛点 -->
              <div class="form-field">
                <label class="field-label" for="scenario-obstacles">{{ t('persona.scenarioManagement.obstacles') }}</label>
                <textarea
                  id="scenario-obstacles"
                  v-model="formData.obstacles"
                  class="form-textarea"
                  :placeholder="t('persona.scenarioManagement.obstaclesPlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 结果与期望 -->
              <div class="form-field">
                <label class="field-label" for="scenario-result-expectation">{{ t('persona.scenarioManagement.resultExpectation') }}</label>
                <textarea
                  id="scenario-result-expectation"
                  v-model="formData.resultExpectation"
                  class="form-textarea"
                  :placeholder="t('persona.scenarioManagement.resultExpectationPlaceholder')"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="modal-footer">
          <button class="btn-secondary" @click="handleClose">
            {{ t('persona.scenarioManagement.cancel') }}
          </button>
          <button class="btn-primary" @click="handleSave">
            {{ t('persona.scenarioManagement.save') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomInput from '../common/CustomInput.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  personaId: {
    type: [Number, String],
    default: null
  },
  canvasId: {
    type: [Number, String],
    default: null
  },
  scenarioId: {
    type: [Number, String],
    default: null
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

const isMaximized = ref(false)
const isEditMode = computed(() => !!props.scenarioId)

const formData = ref({
  title: '',
  userRole: '',
  environment: '',
  goal: '',
  motivation: '',
  situation: '',
  behaviorFlow: '',
  obstacles: '',
  resultExpectation: ''
})

// 监听初始数据变化
watch(() => props.initialData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    formData.value = {
      title: newVal.title || '',
      userRole: newVal.userRole || '',
      environment: newVal.environment || '',
      goal: newVal.goal || '',
      motivation: newVal.motivation || '',
      situation: newVal.situation || '',
      behaviorFlow: newVal.behaviorFlow || '',
      obstacles: newVal.obstacles || '',
      resultExpectation: newVal.resultExpectation || ''
    }
  }
}, { immediate: true, deep: true })

// 监听弹窗打开
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 弹窗打开时，如果有初始数据则加载
    if (props.initialData && Object.keys(props.initialData).length > 0) {
      formData.value = {
        title: props.initialData.title || '',
        userRole: props.initialData.userRole || '',
        environment: props.initialData.environment || '',
        goal: props.initialData.goal || '',
        motivation: props.initialData.motivation || '',
        situation: props.initialData.situation || '',
        behaviorFlow: props.initialData.behaviorFlow || '',
        obstacles: props.initialData.obstacles || '',
        resultExpectation: props.initialData.resultExpectation || ''
      }
    } else {
      // 重置表单
      formData.value = {
        title: '',
        userRole: '',
        environment: '',
        goal: '',
        motivation: '',
        situation: '',
        behaviorFlow: '',
        obstacles: '',
        resultExpectation: ''
      }
    }
  } else {
    // 弹窗关闭时重置最大化状态
    isMaximized.value = false
  }
})

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

// 保存
const handleSave = () => {
  const data = {
    scenarioId: props.scenarioId || null,
    personaId: props.personaId,
    canvasId: props.canvasId,
    ...formData.value
  }
  emit('save', data)
  handleClose()
}
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

.scenario-management-modal {
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

.scenario-management-modal.is-maximized {
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

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

.form-field {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #ffd700;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  line-height: 1.6;
  outline: none;
  resize: vertical;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-textarea:focus {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* 滚动条样式 */
.form-scroll::-webkit-scrollbar {
  width: 8px;
}

.form-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.form-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 4px;
}

.form-scroll::-webkit-scrollbar-thumb:hover {
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

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scenario-management-modal {
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

