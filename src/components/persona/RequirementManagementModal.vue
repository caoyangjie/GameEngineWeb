<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
      <div 
        class="modal-content requirement-management-modal" 
        :class="{ 'is-maximized': isMaximized }"
        @click.stop
      >
        <!-- 头部 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditMode ? t('persona.requirementManagement.editTitle') : t('persona.requirementManagement.createTitle') }}</h3>
          <div class="header-actions">
            <button 
              class="header-btn" 
              @click="toggleMaximize"
              :title="isMaximized ? t('persona.requirementManagement.restore') : t('persona.requirementManagement.maximize')"
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
              :title="t('persona.requirementManagement.close')"
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
              <!-- 父需求（用于需求拆分） -->
              <div class="form-field">
                <label class="field-label" for="requirement-parent">{{ t('persona.requirementManagement.parentRequirement') }}</label>
                <CustomSelect
                  id="requirement-parent"
                  v-model="formData.parentRequirementId"
                  :options="parentRequirementOptions"
                  :placeholder="t('persona.requirementManagement.parentRequirementPlaceholder')"
                  :loading="parentRequirementLoading"
                  @change="handleParentRequirementChange"
                />
                <div v-if="formData.parentRequirementId" class="field-hint">
                  {{ t('persona.requirementManagement.parentRequirementHint') }}
                </div>
              </div>

              <!-- 用户画像 -->
              <div class="form-field">
                <label class="field-label" for="requirement-persona">
                  {{ t('persona.requirementManagement.persona') }}
                  <span class="required-mark">*</span>
                </label>
                <CustomSelect
                  id="requirement-persona"
                  v-model="formData.personaId"
                  :options="personaOptions"
                  :placeholder="t('persona.requirementManagement.personaPlaceholder')"
                  :loading="personaLoading"
                />
                <div v-if="formData.parentRequirementId" class="field-hint">
                  {{ t('persona.requirementManagement.personaInherited') }}
                </div>
                <div v-if="!formData.personaId" class="field-error">
                  {{ t('persona.requirementManagement.personaRequired') }}
                </div>
              </div>

              <!-- 需求标题 -->
              <div class="form-field">
                <label class="field-label" for="requirement-title">{{ t('persona.requirementManagement.title') }}</label>
                <CustomInput
                  id="requirement-title"
                  v-model="formData.title"
                  :placeholder="t('persona.requirementManagement.titlePlaceholder')"
                />
              </div>

              <!-- 显性需求 -->
              <div class="form-field">
                <label class="field-label" for="requirement-explicit">{{ t('persona.requirementManagement.explicitRequirement') }}</label>
                <textarea
                  id="requirement-explicit"
                  v-model="formData.explicitRequirement"
                  class="form-textarea"
                  :placeholder="t('persona.requirementManagement.explicitRequirementPlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 隐性需求 -->
              <div class="form-field">
                <label class="field-label" for="requirement-implicit">{{ t('persona.requirementManagement.implicitRequirement') }}</label>
                <textarea
                  id="requirement-implicit"
                  v-model="formData.implicitRequirement"
                  class="form-textarea"
                  :placeholder="t('persona.requirementManagement.implicitRequirementPlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 需求列表 -->
              <div class="form-field">
                <label class="field-label" for="requirement-list">{{ t('persona.requirementManagement.requirementList') }}</label>
                <textarea
                  id="requirement-list"
                  v-model="formData.requirementList"
                  class="form-textarea"
                  :placeholder="t('persona.requirementManagement.requirementListPlaceholder')"
                  rows="4"
                ></textarea>
              </div>

              <!-- 需求优先级 -->
              <div class="form-field">
                <label class="field-label" for="requirement-priority">{{ t('persona.requirementManagement.priority') }}</label>
                <CustomSelect
                  id="requirement-priority"
                  v-model="formData.priority"
                  :options="priorityOptions"
                  :placeholder="t('persona.requirementManagement.priorityPlaceholder')"
                />
              </div>

              <!-- 用户痛点 -->
              <div class="form-field">
                <label class="field-label" for="requirement-pain-points">{{ t('persona.requirementManagement.userPainPoints') }}</label>
                <textarea
                  id="requirement-pain-points"
                  v-model="formData.userPainPoints"
                  class="form-textarea"
                  :placeholder="t('persona.requirementManagement.userPainPointsPlaceholder')"
                  rows="3"
                ></textarea>
              </div>

              <!-- 需求的背景和情境 -->
              <div class="form-field">
                <label class="field-label" for="requirement-context">{{ t('persona.requirementManagement.requirementContext') }}</label>
                <textarea
                  id="requirement-context"
                  v-model="formData.requirementContext"
                  class="form-textarea"
                  :placeholder="t('persona.requirementManagement.requirementContextPlaceholder')"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="modal-footer">
          <button class="btn-secondary" @click="handleClose">
            {{ t('persona.requirementManagement.cancel') }}
          </button>
          <button class="btn-primary" @click="handleSave">
            {{ t('persona.requirementManagement.save') }}
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
import CustomSelect from '../common/CustomSelect.vue'
import { getParentRequirementList, getRequirementById } from '../../api/requirement.js'
import { getPersonaList } from '../../api/persona.js'
import { showAlert } from '../../utils/alert.js'

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
  requirementId: {
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
const isEditMode = computed(() => !!props.requirementId)

// 父需求相关
const parentRequirementLoading = ref(false)
const parentRequirementList = ref([])
const parentRequirementOptions = computed(() => {
  const options = [
    { value: '', label: t('persona.requirementManagement.parentRequirementPlaceholder') }
  ]
  parentRequirementList.value.forEach(req => {
    options.push({
      value: req.requirementId,
      label: req.title || t('persona.requirementManagement.noTitle'),
      personaId: req.personaId // 保存父需求的用户画像ID
    })
  })
  return options
})

// 用户画像相关
const personaLoading = ref(false)
const personaList = ref([])
const personaOptions = computed(() => {
  const options = [
    { value: '', label: t('persona.requirementManagement.personaPlaceholder') }
  ]
  personaList.value.forEach(persona => {
    options.push({
      value: persona.personaId ? String(persona.personaId) : '',
      label: persona.name || t('persona.requirementManagement.noTitle')
    })
  })
  return options
})

// 优先级选项
const priorityOptions = computed(() => [
  { value: '', label: t('persona.requirementManagement.priorityPlaceholder') },
  { value: 'Must', label: t('persona.requirementManagement.priorityMust') },
  { value: 'Should', label: t('persona.requirementManagement.priorityShould') },
  { value: 'Could', label: t('persona.requirementManagement.priorityCould') },
  { value: 'Wont', label: t('persona.requirementManagement.priorityWont') }
])

const formData = ref({
  parentRequirementId: '',
  personaId: '',
  title: '',
  explicitRequirement: '',
  implicitRequirement: '',
  requirementList: '',
  priority: '',
  userPainPoints: '',
  requirementContext: ''
})

// 加载用户画像列表
const loadPersonaList = async () => {
  if (!props.canvasId) {
    return
  }
  
  personaLoading.value = true
  try {
    const params = {
      pageNum: 1,
      pageSize: 1000, // 加载所有用户画像
      canvasId: props.canvasId
    }
    const response = await getPersonaList(params)
    if (response.code === 200) {
      personaList.value = response.data.records || []
    } else {
      personaList.value = []
    }
  } catch (error) {
    console.error('加载用户画像列表失败:', error)
    personaList.value = []
  } finally {
    personaLoading.value = false
  }
}

// 加载父需求列表
const loadParentRequirements = async (personaId = null) => {
  if (!props.canvasId) {
    return
  }
  
  parentRequirementLoading.value = true
  try {
    const params = {
      canvasId: props.canvasId,
      excludeRequirementId: props.requirementId || null
    }
    // 如果有用户画像ID，则只加载该用户画像的父需求
    const targetPersonaId = personaId || formData.value.personaId
    if (targetPersonaId) {
      params.personaId = Number(targetPersonaId)
    }
    const response = await getParentRequirementList(params)
    if (response.code === 200) {
      parentRequirementList.value = response.data || []
    } else {
      parentRequirementList.value = []
    }
  } catch (error) {
    console.error('加载父需求列表失败:', error)
    parentRequirementList.value = []
  } finally {
    parentRequirementLoading.value = false
  }
}

// 处理父需求变化
const handleParentRequirementChange = async (parentRequirementId) => {
  if (parentRequirementId) {
    // 选择了父需求，如果当前没有选择用户画像，则建议继承父需求的用户画像
    if (!formData.value.personaId) {
      const parentRequirement = parentRequirementList.value.find(req => {
        // 处理类型转换，确保比较正确
        const reqId = typeof req.requirementId === 'string' ? Number(req.requirementId) : req.requirementId
        const targetId = typeof parentRequirementId === 'string' ? Number(parentRequirementId) : parentRequirementId
        return reqId === targetId
      })
      
      if (parentRequirement && parentRequirement.personaId) {
        // 如果当前没有选择用户画像，则自动填入父需求的用户画像作为建议
        formData.value.personaId = String(parentRequirement.personaId)
      } else {
        // 如果父需求列表中没有用户画像信息，则通过API获取
        try {
          const requirementId = typeof parentRequirementId === 'string' ? Number(parentRequirementId) : parentRequirementId
          const response = await getRequirementById(requirementId)
          if (response.code === 200 && response.data && response.data.personaId) {
            formData.value.personaId = String(response.data.personaId)
          }
        } catch (error) {
          console.error('获取父需求详情失败:', error)
        }
      }
    }
    // 如果已经选择了用户画像，则保持用户的选择，不做强制修改
  } else {
    // 取消选择父需求，如果当前用户画像是从父需求继承的且没有初始数据，则恢复为传入的 personaId
    if (!props.initialData || !props.initialData.personaId) {
      // 只有在没有初始数据时才恢复为传入的 personaId
      if (props.personaId) {
        formData.value.personaId = String(props.personaId)
      }
    }
  }
}

// 监听初始数据变化
watch(() => props.initialData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    formData.value = {
      parentRequirementId: newVal.parentRequirementId || '',
      personaId: newVal.personaId ? String(newVal.personaId) : (props.personaId ? String(props.personaId) : ''),
      title: newVal.title || '',
      explicitRequirement: newVal.explicitRequirement || '',
      implicitRequirement: newVal.implicitRequirement || '',
      requirementList: newVal.requirementList || '',
      priority: newVal.priority || '',
      userPainPoints: newVal.userPainPoints || '',
      requirementContext: newVal.requirementContext || ''
    }
  }
}, { immediate: true, deep: true })

// 监听 personaId 变化，确保在弹窗打开时自动设置
watch(() => props.personaId, (newVal) => {
  if (props.modelValue && newVal && !formData.value.personaId && (!props.initialData || Object.keys(props.initialData).length === 0)) {
    // 如果弹窗已打开，表单中的 personaId 为空，且没有初始数据，则设置传入的 personaId
    formData.value.personaId = String(newVal)
  }
}, { immediate: true })

// 监听弹窗打开
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    // 加载用户画像列表
    await loadPersonaList()
    
    // 弹窗打开时，如果有初始数据则加载
    if (props.initialData && Object.keys(props.initialData).length > 0) {
      formData.value = {
        parentRequirementId: props.initialData.parentRequirementId || '',
        personaId: props.initialData.personaId ? String(props.initialData.personaId) : (props.personaId ? String(props.personaId) : ''),
        title: props.initialData.title || '',
        explicitRequirement: props.initialData.explicitRequirement || '',
        implicitRequirement: props.initialData.implicitRequirement || '',
        requirementList: props.initialData.requirementList || '',
        priority: props.initialData.priority || '',
        userPainPoints: props.initialData.userPainPoints || '',
        requirementContext: props.initialData.requirementContext || ''
      }
    } else {
      // 重置表单，使用传入的 personaId 作为默认值
      formData.value = {
        parentRequirementId: '',
        personaId: props.personaId ? String(props.personaId) : '',
        title: '',
        explicitRequirement: '',
        implicitRequirement: '',
        requirementList: '',
        priority: '',
        userPainPoints: '',
        requirementContext: ''
      }
    }
    
    // 加载父需求列表（需要在设置 personaId 之后）
    await loadParentRequirements()
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
  // 验证：必须选择用户画像
  if (!formData.value.personaId) {
    showAlert(t('persona.requirementManagement.personaRequired'), { type: 'error' })
    return
  }
  
  // 使用用户选择的用户画像，不做强制继承
  const personaId = formData.value.personaId
  
  const data = {
    requirementId: props.requirementId || null,
    personaId: Number(personaId),
    canvasId: props.canvasId,
    parentRequirementId: formData.value.parentRequirementId ? (typeof formData.value.parentRequirementId === 'string' ? Number(formData.value.parentRequirementId) : formData.value.parentRequirementId) : null,
    title: formData.value.title,
    explicitRequirement: formData.value.explicitRequirement,
    implicitRequirement: formData.value.implicitRequirement,
    requirementList: formData.value.requirementList,
    priority: formData.value.priority,
    userPainPoints: formData.value.userPainPoints,
    requirementContext: formData.value.requirementContext
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

.requirement-management-modal {
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
}

.required-mark {
  color: #f44336;
  margin-left: 4px;
}

.field-hint {
  font-size: 12px;
  color: rgba(255, 215, 0, 0.7);
  margin-top: 6px;
  font-style: italic;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.field-error {
  font-size: 12px;
  color: #f44336;
  margin-top: 6px;
  font-style: italic;
  text-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
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
  .requirement-management-modal {
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

