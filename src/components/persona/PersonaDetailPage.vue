<template>
  <div class="persona-detail-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
    </div>

    <!-- 顶部导航栏 -->
    <TopHeader @toggle-sidebar="toggleSidebar" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">
          {{ isEditMode ? t('persona.detail.editTitle') : 
             isViewMode ? t('persona.detail.viewTitle') : 
             t('persona.detail.createTitle') }}
        </h1>
      </div>

      <!-- 表单 -->
      <div class="persona-form">
        <!-- 基本信息 -->
        <div class="form-section basic-info-card">
          <h2 class="section-title">{{ t('persona.detail.basicInfo') }}</h2>
          <div class="basic-info-content">
            <!-- 左侧信息区域 -->
            <div class="info-section">
              <div class="info-row">
                <div class="info-group">
                  <label for="persona-name" class="form-label">{{ t('persona.detail.name') }} *</label>
                  <CustomInput
                    id="persona-name"
                    v-model="formData.name"
                    :disabled="isViewMode"
                    :placeholder="t('persona.detail.namePlaceholder')"
                  />
                </div>
                <div class="info-group">
                  <label for="persona-age" class="form-label">{{ t('persona.detail.age') }}</label>
                  <CustomInput
                    id="persona-age"
                    v-model="formData.age"
                    :disabled="isViewMode"
                    :placeholder="t('persona.detail.agePlaceholder')"
                    type="number"
                  />
                </div>
              </div>
              <div class="info-row">
                <div class="info-group">
                  <label for="persona-gender" class="form-label">{{ t('persona.detail.gender') }}</label>
                  <CustomSelect
                    id="persona-gender"
                    v-model="formData.gender"
                    :options="genderOptions"
                    :disabled="isViewMode"
                    :placeholder="t('persona.detail.genderPlaceholder')"
                  />
                </div>
                <div class="info-group">
                  <label for="persona-identity" class="form-label">{{ t('persona.detail.identity') }}</label>
                  <CustomInput
                    id="persona-identity"
                    v-model="formData.identity"
                    :disabled="isViewMode"
                    :placeholder="t('persona.detail.identityPlaceholder')"
                  />
                </div>
              </div>
            </div>
            <!-- 右侧头像区域 -->
            <div class="avatar-section">
              <div class="avatar-label">{{ t('persona.detail.avatar') }}</div>
              <AvatarDisplay
                id="persona-avatar"
                v-model="formData.avatar"
                :disabled="isViewMode"
                :is-view-mode="isViewMode"
                :placeholder="t('persona.detail.avatarPlaceholder')"
              />
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="form-section">
          <div class="form-group">
            <label for="persona-hobbies" class="form-label">{{ t('persona.detail.hobbies') }}</label>
            <CustomTextarea
              id="persona-hobbies"
              v-model="formData.hobbies"
              :disabled="isViewMode"
              :placeholder="t('persona.detail.hobbiesPlaceholder')"
              :rows="4"
            />
          </div>
          <div class="form-group">
            <label for="persona-usageScenario" class="form-label">{{ t('persona.detail.usageScenario') }}</label>
            <CustomTextarea
              id="persona-usageScenario"
              v-model="formData.usageScenario"
              :disabled="isViewMode"
              :placeholder="t('persona.detail.usageScenarioPlaceholder')"
              :rows="6"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="handleBack" class="reset-btn">
          {{ t('persona.detail.back') }}
        </button>
        <button v-if="!isViewMode" @click="handleSave" class="save-btn">
          {{ t('persona.detail.save') }}
        </button>
        <button v-if="isViewMode" @click="handleEdit" class="save-btn">
          {{ t('persona.detail.edit') }}
        </button>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      :active-route="router.currentRoute.value"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomSelect from '../common/CustomSelect.vue'
import CustomInput from '../common/CustomInput.vue'
import CustomTextarea from '../common/CustomTextarea.vue'
import AvatarDisplay from '../common/AvatarDisplay.vue'
import { getPersonaById, createPersona, updatePersona } from '../../api/persona.js'
import { showAlert } from '../../utils/alert.js'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)

// 性别选项
const genderOptions = computed(() => [
  { value: '', label: t('persona.detail.genderPlaceholder') },
  { value: 'male', label: t('persona.detail.genderMale') },
  { value: 'female', label: t('persona.detail.genderFemale') },
  { value: 'other', label: t('persona.detail.genderOther') }
])

// 模式：create, edit, view
const mode = ref('create')
const loading = ref(false)

// 表单数据
const formData = ref({
  personaId: null,
  canvasId: null,
  name: '',
  age: null,
  gender: '',
  identity: '',
  hobbies: '',
  usageScenario: '',
  avatar: '',
  createTime: null
})

// 计算属性
const isEditMode = computed(() => mode.value === 'edit')
const isViewMode = computed(() => mode.value === 'view')
const isCreateMode = computed(() => mode.value === 'create')

// 加载数据
const loadData = async () => {
  const personaId = window.personaId
  if (!personaId) {
    mode.value = 'create'
    // 设置 canvasId
    if (window.canvasId) {
      formData.value.canvasId = Number(window.canvasId)
    }
    return
  }

  loading.value = true
  try {
    const response = await getPersonaById(personaId)
    if (response.code === 200) {
      Object.assign(formData.value, response.data)
      // 确保 age 是数字
      if (formData.value.age) {
        formData.value.age = Number(formData.value.age)
      }
      mode.value = window.personaEditMode || 'view'
    } else {
      showAlert(response.msg || t('persona.detail.loadFailed'), { type: 'error' })
      handleBack()
    }
  } catch (error) {
    showAlert(error.message || t('persona.detail.loadFailed'), { type: 'error' })
    handleBack()
  } finally {
    loading.value = false
  }
}

// 保存
const handleSave = async () => {
  if (!formData.value.name || formData.value.name.trim() === '') {
    showAlert(t('persona.detail.nameRequired'), { type: 'error' })
    return
  }

  if (!formData.value.canvasId) {
    showAlert(t('persona.detail.canvasIdRequired'), { type: 'error' })
    return
  }

  loading.value = true
  try {
    // 准备提交数据
    const submitData = {
      ...formData.value,
      age: formData.value.age ? Number(formData.value.age) : null
    }

    let response
    if (isCreateMode.value) {
      response = await createPersona(submitData)
    } else {
      response = await updatePersona(submitData)
    }

    if (response.code === 200) {
      showAlert(
        isCreateMode.value ? t('persona.detail.createSuccess') : t('persona.detail.updateSuccess'),
        { type: 'success' }
      )
      handleBack()
    } else {
      showAlert(response.msg || t('persona.detail.saveFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.detail.saveFailed'), { type: 'error' })
  } finally {
    loading.value = false
  }
}

// 编辑
const handleEdit = () => {
  mode.value = 'edit'
}

// 返回
const handleBack = () => {
  router.goToPersonaList()
  // 清理全局变量
  delete window.personaId
  delete window.personaEditMode
  // 保留 canvasId，因为返回列表页还需要
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
    minute: '2-digit',
    second: '2-digit'
  })
}

// 侧边栏切换
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 关闭事件
const handleSidebarClose = () => {
  sidebarOpen.value = false
}

// 回车键事件处理
const handleKeydown = (event) => {
  // 如果按的是回车键，且不在只读模式下，触发保存
  if (event.key === 'Enter' && !isViewMode.value && !loading.value) {
    // 如果焦点在输入框或文本框中，不触发保存（避免与表单提交冲突）
    const target = event.target
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // 如果是在文本框中，允许回车触发保存
      if (target.tagName === 'TEXTAREA') {
        // 对于 textarea，Ctrl+Enter 或 Cmd+Enter 触发保存
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          handleSave()
        }
      }
      return
    }
    // 其他情况下，回车键触发保存
    event.preventDefault()
    handleSave()
  }
}

// 初始化
onMounted(() => {
  mode.value = window.personaEditMode || 'create'
  // 设置 canvasId
  if (window.canvasId) {
    formData.value.canvasId = Number(window.canvasId)
  }
  if (window.personaId) {
    loadData()
  }
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown)
})

// 清理
onUnmounted(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.persona-detail-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层 */
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #0a0e27 0%,
    #1a1f3a 20%,
    #2d3a5a 40%,
    #1a2332 60%,
    #0f1419 100%
  );
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, #ffd700, transparent),
    radial-gradient(1px 1px at 60% 70%, #fff, transparent),
    radial-gradient(2px 2px at 50% 50%, #ff6b9d, transparent),
    radial-gradient(1px 1px at 80% 10%, #fff, transparent),
    radial-gradient(2px 2px at 90% 40%, #ffd700, transparent);
  background-repeat: repeat;
  background-size: 200% 200%;
  animation: twinkle 3s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.main-content {
  position: relative;
  z-index: 5;
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 40px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 36px;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  margin: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.save-btn,
.reset-btn {
  padding: 12px 40px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
}

.save-btn:hover {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.persona-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.basic-info-card {
  padding: 30px;
}

.section-title {
  font-size: 24px;
  color: #ffd700;
  margin-bottom: 25px;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  padding-bottom: 10px;
}

.basic-info-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.avatar-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  min-width: 180px;
}

.avatar-label {
  color: #ffd700;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-readonly {
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #ffd700;
  font-size: 16px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 100px 20px 20px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .basic-info-content {
    flex-direction: column;
    gap: 20px;
  }

  .avatar-section {
    width: 100%;
    min-width: auto;
  }

  .info-row {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .save-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>

