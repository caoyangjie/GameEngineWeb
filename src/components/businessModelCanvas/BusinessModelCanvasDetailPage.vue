<template>
  <div class="business-model-canvas-detail-container">
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
          {{ isEditMode ? t('businessModelCanvas.detail.editTitle') : 
             isViewMode ? t('businessModelCanvas.detail.viewTitle') : 
             t('businessModelCanvas.detail.createTitle') }}
        </h1>
      </div>

      <!-- 表单 -->
      <div class="canvas-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h2 class="section-title">{{ t('businessModelCanvas.detail.basicInfo') }}</h2>
          <div class="form-group">
            <label for="canvas-title" class="form-label">{{ t('businessModelCanvas.detail.title') }} *</label>
            <CustomInput
              id="canvas-title"
              v-model="formData.title"
              :disabled="isViewMode"
              :placeholder="t('businessModelCanvas.detail.titlePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label for="canvas-status" class="form-label">{{ t('businessModelCanvas.detail.status') }}</label>
            <CustomSelect
              id="canvas-status"
              v-model="formData.status"
              :options="statusOptions"
              :disabled="isViewMode"
              :placeholder="t('businessModelCanvas.detail.statusPlaceholder')"
            />
          </div>
        </div>

        <!-- 商业模式画布9要素 -->
        <div class="canvas-grid">
          <!-- 左侧：关键合作、关键活动、关键资源、价值主张 -->
          <div class="canvas-left">
            <div class="canvas-block">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.keyPartners') }}</h3>
              <CustomTextarea
                v-model="formData.keyPartners"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.keyPartnersPlaceholder')"
                :rows="6"
              />
            </div>
            <div class="canvas-block">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.keyActivities') }}</h3>
              <CustomTextarea
                v-model="formData.keyActivities"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.keyActivitiesPlaceholder')"
                :rows="6"
              />
            </div>
            <div class="canvas-block">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.keyResources') }}</h3>
              <CustomTextarea
                v-model="formData.keyResources"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.keyResourcesPlaceholder')"
                :rows="6"
              />
            </div>
            <div class="canvas-block highlight">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.valuePropositions') }}</h3>
              <CustomTextarea
                v-model="formData.valuePropositions"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.valuePropositionsPlaceholder')"
                :rows="6"
              />
            </div>
          </div>

          <!-- 中间：客户关系、渠道通路、客户细分 -->
          <div class="canvas-center">
            <div class="canvas-block">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.customerRelationships') }}</h3>
              <CustomTextarea
                v-model="formData.customerRelationships"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.customerRelationshipsPlaceholder')"
                :rows="6"
              />
            </div>
            <div class="canvas-block">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.channels') }}</h3>
              <CustomTextarea
                v-model="formData.channels"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.channelsPlaceholder')"
                :rows="6"
              />
            </div>
            <div class="canvas-block">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.customerSegments') }}</h3>
              <CustomTextarea
                v-model="formData.customerSegments"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.customerSegmentsPlaceholder')"
                :rows="6"
              />
            </div>
          </div>

          <!-- 右侧：成本构成、售卖途径 -->
          <div class="canvas-right">
            <div class="canvas-block">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.costStructure') }}</h3>
              <CustomTextarea
                v-model="formData.costStructure"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.costStructurePlaceholder')"
                :rows="6"
              />
            </div>
            <div class="canvas-block">
              <h3 class="block-title">{{ t('businessModelCanvas.detail.revenueStreams') }}</h3>
              <CustomTextarea
                v-model="formData.revenueStreams"
                :disabled="isViewMode"
                :placeholder="t('businessModelCanvas.detail.revenueStreamsPlaceholder')"
                :rows="6"
              />
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div class="form-section">
          <h2 class="section-title">{{ t('businessModelCanvas.detail.remark') }}</h2>
          <CustomTextarea
            v-model="formData.remark"
            :disabled="isViewMode"
            :placeholder="t('businessModelCanvas.detail.remarkPlaceholder')"
            :rows="4"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="handleBack" class="reset-btn">
          {{ t('businessModelCanvas.detail.back') }}
        </button>
        <button v-if="!isViewMode" @click="handleSave" class="save-btn">
          {{ t('businessModelCanvas.detail.save') }}
        </button>
        <button v-if="isViewMode" @click="handleEdit" class="save-btn">
          {{ t('businessModelCanvas.detail.edit') }}
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
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomSelect from '../common/CustomSelect.vue'
import CustomInput from '../common/CustomInput.vue'
import CustomTextarea from '../common/CustomTextarea.vue'
import { getCanvasById, createCanvas, updateCanvas } from '../../api/businessModelCanvas.js'
import { showAlert } from '../../utils/alert.js'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)

// 状态选项
const statusOptions = computed(() => [
  { value: '0', label: t('businessModelCanvas.detail.statusNormal') },
  { value: '1', label: t('businessModelCanvas.detail.statusDisabled') }
])

// 模式：create, edit, view
const mode = ref('create')
const loading = ref(false)

// 表单数据
const formData = ref({
  canvasId: null,
  title: '',
  keyPartners: '',
  keyActivities: '',
  keyResources: '',
  valuePropositions: '',
  customerRelationships: '',
  channels: '',
  customerSegments: '',
  costStructure: '',
  revenueStreams: '',
  status: '0',
  remark: ''
})

// 计算属性
const isEditMode = computed(() => mode.value === 'edit')
const isViewMode = computed(() => mode.value === 'view')
const isCreateMode = computed(() => mode.value === 'create')

// 加载数据
const loadData = async () => {
  const canvasId = window.canvasId
  if (!canvasId) {
    mode.value = 'create'
    return
  }

  loading.value = true
  try {
    const response = await getCanvasById(canvasId)
    if (response.code === 200) {
      Object.assign(formData.value, response.data)
      mode.value = window.canvasEditMode || 'view'
    } else {
      showAlert(response.msg || '加载失败', 'error')
      handleBack()
    }
  } catch (error) {
    showAlert(error.message || '加载失败', 'error')
    handleBack()
  } finally {
    loading.value = false
  }
}

// 保存
const handleSave = async () => {
  if (!formData.value.title) {
    showAlert(t('businessModelCanvas.detail.titleRequired'), 'error')
    return
  }

  loading.value = true
  try {
    let response
    if (isCreateMode.value) {
      response = await createCanvas(formData.value)
    } else {
      response = await updateCanvas(formData.value)
    }

    if (response.code === 200) {
      showAlert(
        isCreateMode.value ? t('businessModelCanvas.detail.createSuccess') : t('businessModelCanvas.detail.updateSuccess'),
        'success'
      )
      handleBack()
    } else {
      showAlert(response.msg || '保存失败', 'error')
    }
  } catch (error) {
    showAlert(error.message || '保存失败', 'error')
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
  router.navigate(ROUTES.BUSINESS_MODEL_CANVAS_LIST)
  // 清理全局变量
  delete window.canvasId
  delete window.canvasEditMode
}

// 侧边栏切换
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 关闭事件
const handleSidebarClose = () => {
  sidebarOpen.value = false
}

// 初始化
onMounted(() => {
  mode.value = window.canvasEditMode || 'create'
  if (window.canvasId) {
    loadData()
  }
})
</script>

<style scoped>
.business-model-canvas-detail-container {
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
  max-width: 1600px;
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

.canvas-form {
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

.section-title {
  font-size: 24px;
  color: #ffd700;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #ffd700;
  font-size: 16px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background: rgba(255, 255, 255, 0.05);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-select option {
  background: #1a1f3a;
  color: white;
}

.canvas-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.canvas-block {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.canvas-block:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
}

.canvas-block.highlight {
  background: linear-gradient(
    to bottom,
    rgba(255, 152, 0, 0.2) 0%,
    rgba(255, 140, 0, 0.3) 100%
  );
  border-color: rgba(255, 152, 0, 0.6);
}

.block-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 12px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.canvas-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 150px;
  transition: all 0.3s;
}

.canvas-textarea:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.canvas-textarea:disabled {
  background: rgba(255, 255, 255, 0.05);
  cursor: not-allowed;
  opacity: 0.7;
}

.canvas-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 1200px) {
  .canvas-grid {
    grid-template-columns: 1fr 1fr;
  }
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

  .canvas-grid {
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
