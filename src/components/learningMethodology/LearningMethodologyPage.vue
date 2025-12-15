<template>
  <div class="learning-methodology-container">
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
        <h1 class="page-title">学习模板管理</h1>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleBack">返回首页</button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="filter-row">
          <div class="filter-field">
            <div class="filter-label">模板标题</div>
            <CustomInput
              v-model="titleFilter"
              placeholder="请输入模板标题"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">模板描述</div>
            <CustomInput
              v-model="descriptionFilter"
              placeholder="请输入模板描述"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">状态</div>
            <CustomSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="全部状态"
            />
          </div>
          <div class="filter-field filter-field-button">
            <div class="filter-label">&nbsp;</div>
            <button class="btn-reset" @click="handleReset">
              重置
            </button>
          </div>
        </div>
        <button class="btn-search" @click="handleSearch">
          搜索
        </button>
      </div>

      <!-- 模板列表 -->
      <div class="template-list-section">
        <div
          v-for="template in filteredTemplates"
          :key="template.templateId"
          class="template-item"
          @click="handleTemplateClick(template)"
        >
          <div class="template-header">
            <h3 class="template-title">{{ template.title || '未命名模板' }}</h3>
            <div :class="['status-badge', template.status === '0' ? 'status-normal' : 'status-disabled']">
              <span class="badge-text">
                {{ template.status === '0' ? '正常' : '停用' }}
              </span>
            </div>
          </div>
          
          <div class="template-content">
            <div class="template-field" v-if="template.description">
              <div class="field-label">描述:</div>
              <div class="field-content">{{ template.description }}</div>
            </div>
          </div>
          
          <div class="template-actions">
            <button 
              class="btn-start" 
              @click.stop="handleStartLearning(template)"
              :disabled="template.status !== '0'"
            >
              开始学习
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredTemplates.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📚</div>
          <p>暂无学习模板</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <p>加载中...</p>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.LEARNING_METHODOLOGY"
      @close="handleSidebarClose"
    />

    <!-- 学习主题输入弹窗 -->
    <div v-if="showTopicModal" class="modal-overlay" @click="closeTopicModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">开始学习</h3>
          <button class="modal-close" @click="closeTopicModal">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label for="student-name-input" class="input-label">学生姓名</label>
            <input
              id="student-name-input"
              v-model="studentName"
              type="text"
              placeholder="请输入学生姓名"
              class="topic-input"
              @keyup.enter="confirmStartLearning"
              ref="studentNameInputRef"
            />
          </div>
          <div class="input-group">
            <label for="learning-topic-input" class="input-label">学习主题</label>
            <input
              id="learning-topic-input"
              v-model="learningTopic"
              type="text"
              placeholder="请输入您要学习的主题，例如：Python编程基础、微积分、世界历史等"
              class="topic-input"
              @keyup.enter="confirmStartLearning"
              ref="topicInputRef"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeTopicModal">取消</button>
          <button class="btn-confirm" @click="confirmStartLearning" :disabled="!studentName.trim() || !learningTopic.trim()">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomInput from '../common/CustomInput.vue'
import CustomSelect from '../common/CustomSelect.vue'
import { ROUTES, useRouter } from '../../composables/useRouter.js'
import { getAllTemplates, createLearningRecord } from '../../api/learningMethodology.js'
import { showAlert } from '../../utils/alert.js'

const router = useRouter()
const sidebarOpen = ref(false)

const templates = ref([])
const loading = ref(false)
const showTopicModal = ref(false)
const studentName = ref('')
const learningTopic = ref('')
const selectedTemplate = ref(null)
const studentNameInputRef = ref(null)
const topicInputRef = ref(null)

// 搜索筛选
const titleFilter = ref('')
const descriptionFilter = ref('')
const statusFilter = ref('')

// 状态选项
const statusOptions = [
  { value: '', label: '全部状态' },
  { value: '0', label: '正常' },
  { value: '1', label: '停用' }
]

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  let result = templates.value

  // 标题筛选
  if (titleFilter.value) {
    result = result.filter(t => 
      t.title && t.title.includes(titleFilter.value)
    )
  }

  // 描述筛选
  if (descriptionFilter.value) {
    result = result.filter(t => 
      t.description && t.description.includes(descriptionFilter.value)
    )
  }

  // 状态筛选
  if (statusFilter.value !== '') {
    result = result.filter(t => t.status === statusFilter.value)
  }

  return result
})

onMounted(() => {
  loadTemplates()
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const handleBack = () => {
  // 重定向到学习记录管理页面（模板选择界面）
  router.goToLearningRecordList(null)
}

const loadTemplates = async () => {
  loading.value = true
  try {
    const response = await getAllTemplates()
    if (response.code === 200 && response.data) {
      templates.value = response.data
    } else {
      showAlert('加载模板失败: ' + (response.msg || '未知错误'), 'error')
    }
  } catch (error) {
    showAlert('加载模板失败: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 使用 computed 自动过滤，这里可以添加其他逻辑
}

// 重置
const handleReset = () => {
  titleFilter.value = ''
  descriptionFilter.value = ''
  statusFilter.value = ''
}

// 点击模板项跳转到学习记录管理页面（已废弃，保留兼容性）
const handleTemplateClick = (template) => {
  router.goToLearningRecordList(template.templateId)
}

const handleStartLearning = (template) => {
  if (template.status !== '0') {
    showAlert('该模板已停用，无法使用', 'warning')
    return
  }
  
  selectedTemplate.value = template
  studentName.value = ''
  learningTopic.value = ''
  showTopicModal.value = true
  
  // 聚焦输入框
  nextTick(() => {
    if (studentNameInputRef.value) {
      studentNameInputRef.value.focus()
    }
  })
}

const closeTopicModal = () => {
  showTopicModal.value = false
  studentName.value = ''
  learningTopic.value = ''
  selectedTemplate.value = null
}

const confirmStartLearning = async () => {
  if (!studentName.value.trim()) {
    showAlert('请输入学生姓名', 'warning')
    return
  }
  
  if (!learningTopic.value.trim()) {
    showAlert('请输入学习主题', 'warning')
    return
  }
  
  if (!selectedTemplate.value) {
    showAlert('请选择模板', 'warning')
    return
  }
  
  try {
    // 自动创建学习记录
    const recordData = {
      templateId: selectedTemplate.value.templateId,
      studentName: studentName.value.trim(),
      learningTopic: learningTopic.value.trim()
    }
    
    const response = await createLearningRecord(recordData)
    if (response.code === 200) {
      // 跳转到步骤页面，传递模板ID、学生姓名和学习主题
      router.goToLearningSteps(
        selectedTemplate.value.templateId, 
        learningTopic.value.trim(),
        studentName.value.trim()
      )
      closeTopicModal()
    } else {
      showAlert(response.msg || '创建学习记录失败', 'error')
    }
  } catch (error) {
    showAlert(error.message || '创建学习记录失败', 'error')
  }
}
</script>

<style scoped>
.learning-methodology-container {
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

/* 主要内容区域 */
.main-content {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 40px 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
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

.header-actions {
  display: flex;
  gap: 15px;
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

/* 搜索区域 */
.search-section {
  margin-bottom: 30px;
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

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.filter-field-button {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-search {
  width: 100%;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
}

.btn-search:hover {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.btn-reset {
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 列表区域 */
.template-list-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}

.template-item {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 280px;
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

.template-item:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.template-header {
  margin-bottom: 15px;
  padding-right: 40px;
}

.template-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.status-normal {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.15) 100%);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.status-disabled {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.25) 0%, rgba(244, 67, 54, 0.15) 100%);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.template-content {
  flex: 1;
  margin-bottom: 15px;
}

.template-field {
  margin-bottom: 12px;
}

.field-label {
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 5px;
}

.field-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.template-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.btn-start {
  padding: 10px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  border: none;
  color: #1a0a2e;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.empty-state,
.loading-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 0;
  min-width: 500px;
  max-width: 90%;
  box-shadow:
    0 0 40px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.modal-title {
  font-size: 20px;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.25s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-body {
  padding: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-label {
  font-size: 14px;
  color: #c5c5c5;
  font-weight: 500;
}

.topic-input {
  width: 100%;
  padding: 14px 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 16px;
  transition: all 0.25s;
}

.topic-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.topic-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-confirm {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  border: none;
  color: #1a0a2e;
}

.btn-confirm:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .template-list-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .template-list-section {
    grid-template-columns: repeat(2, 1fr);
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

  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .filter-field-button {
    grid-column: 1;
  }
  
  .btn-search {
    width: 100%;
  }
  
  .btn-reset {
    width: 100%;
  }

  .template-list-section {
    grid-template-columns: 1fr;
  }

  .template-header {
    padding-right: 40px;
  }

  .modal-content {
    min-width: auto;
    width: 90%;
  }
}
</style>
