<template>
  <div class="requirement-list-container">
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
        <h1 class="page-title">{{ t('persona.requirementList.title') }}</h1>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleBack">
            {{ t('persona.requirementList.back') }}
          </button>
          <button class="btn-primary" @click="handleCreate">
            {{ t('persona.list.createRequirement') }}
          </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="filter-row">
          <div class="filter-field">
            <div class="filter-label">{{ t('persona.requirementManagement.title') }}</div>
            <CustomInput
              v-model="titleFilter"
              :placeholder="t('persona.requirementList.titlePlaceholder')"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">{{ t('persona.requirementList.personaName') }}</div>
            <CustomSelect
              v-model="personaFilter"
              :options="personaOptions"
              :placeholder="t('persona.requirementList.allPersona')"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">{{ t('persona.requirementList.status') }}</div>
            <CustomSelect
              v-model="statusFilter"
              :options="statusOptions"
              :placeholder="t('persona.requirementList.allStatus')"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">{{ t('persona.requirementList.createTime') }}</div>
            <CustomInput
              v-model="timeFilter"
              type="date"
              :placeholder="t('persona.requirementList.timePlaceholder')"
            />
          </div>
          <div class="filter-field filter-field-button">
            <div class="filter-label">&nbsp;</div>
            <button class="btn-reset" @click="handleReset">
              {{ t('persona.list.reset') }}
            </button>
          </div>
        </div>
        <button class="btn-search" @click="handleSearch">
          {{ t('persona.list.search') }}
        </button>
      </div>

      <!-- 列表 -->
      <div class="requirement-list-section">
        <div
          v-for="requirement in requirementList"
          :key="requirement.requirementId"
          class="requirement-item"
          @click="handleRequirementClick(requirement)"
        >
          <button class="requirement-close-btn" @click.stop="handleDelete(requirement.requirementId)" :title="t('persona.requirementList.delete')">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="requirement-header">
            <h3 class="requirement-title">{{ requirement.title || t('persona.requirementManagement.noTitle') }}</h3>
            <span v-if="requirement.priority" class="requirement-priority-badge">
              {{ getPriorityLabel(requirement.priority) }}
            </span>
          </div>
          <div class="requirement-content">
            <div class="requirement-field" v-if="requirement.personaName">
              <div class="field-label">{{ t('persona.requirementList.personaName') }}:</div>
              <div class="field-content">{{ requirement.personaName }}</div>
            </div>
            <div class="requirement-field" v-if="requirement.explicitRequirement">
              <div class="field-label">{{ t('persona.requirementManagement.explicitRequirement') }}:</div>
              <div class="field-content">{{ requirement.explicitRequirement }}</div>
            </div>
            <div class="requirement-field" v-if="requirement.implicitRequirement">
              <div class="field-label">{{ t('persona.requirementManagement.implicitRequirement') }}:</div>
              <div class="field-content">{{ requirement.implicitRequirement }}</div>
            </div>
          </div>
          <div class="requirement-meta">
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="meta-label">{{ t('persona.requirementList.createTime') }}:</span>
              <span class="meta-value">{{ formatDate(requirement.createTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="requirementList.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>{{ t('persona.requirementList.empty') }}</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <p>{{ t('persona.requirementList.loading') }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination">
        <button
          class="btn-page"
          :disabled="pageNum <= 1"
          @click="handlePageChange(pageNum - 1)"
        >
          {{ t('persona.list.prevPage') }}
        </button>
        <span class="page-info">
          {{ t('persona.list.pageInfo', { current: pageNum, total: totalPages }) }}
        </span>
        <button
          class="btn-page"
          :disabled="pageNum >= totalPages"
          @click="handlePageChange(pageNum + 1)"
        >
          {{ t('persona.list.nextPage') }}
        </button>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      :active-route="router.currentRoute.value"
      @close="handleSidebarClose"
    />

    <!-- 需求管理弹窗 -->
    <RequirementManagementModal
      v-model="showRequirementManagementModal"
      :persona-id="requirementData.personaId || (personaFilter ? Number(personaFilter) : null)"
      :canvas-id="canvasId"
      :requirement-id="currentRequirementId"
      :initial-data="requirementData"
      @save="handleRequirementManagementSave"
      @close="handleRequirementManagementClose"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomInput from '../common/CustomInput.vue'
import CustomSelect from '../common/CustomSelect.vue'
import RequirementManagementModal from './RequirementManagementModal.vue'
import { getRequirementList, deleteRequirement, updateRequirement, createRequirement } from '../../api/requirement.js'
import { getPersonaList } from '../../api/persona.js'
import { showAlert, showConfirm } from '../../utils/alert.js'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)

// 从window获取参数
const canvasId = ref(window.canvasId ? Number(window.canvasId) : null)
// 如果从 PersonaListPage 跳转过来，设置默认的 personaId
const defaultPersonaId = ref(window.personaId ? Number(window.personaId) : null)

// 需求管理弹窗
const showRequirementManagementModal = ref(false)
const currentRequirementId = ref(null)
const requirementData = ref({})

// 数据
const requirementList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const titleFilter = ref('')
const personaFilter = ref(defaultPersonaId.value ? String(defaultPersonaId.value) : '')
const statusFilter = ref('')
const timeFilter = ref('')

// 用户画像选项
const personaOptions = ref([])

// 状态选项（使用优先级作为状态）
const statusOptions = computed(() => [
  { value: '', label: t('persona.requirementList.allStatus') },
  { value: 'Must', label: t('persona.requirementManagement.priorityMust') },
  { value: 'Should', label: t('persona.requirementManagement.priorityShould') },
  { value: 'Could', label: t('persona.requirementManagement.priorityCould') },
  { value: 'Wont', label: t('persona.requirementManagement.priorityWont') }
])

// 加载用户画像列表
const loadPersonaList = async () => {
  if (!canvasId.value) return
  
  try {
    const params = {
      pageNum: 1,
      pageSize: 1000, // 加载所有用户画像
      canvasId: canvasId.value
    }
    const response = await getPersonaList(params)
    if (response.code === 200) {
      const personas = response.data.records || []
      personaOptions.value = [
        { value: '', label: t('persona.requirementList.allPersona') },
        ...personas.map(p => ({
          value: String(p.personaId),
          label: p.name || t('persona.requirementList.noTitle')
        }))
      ]
    }
  } catch (error) {
    console.error('加载用户画像列表失败:', error)
  }
}

// 加载列表
const loadList = async () => {
  if (!canvasId.value) {
    showAlert(t('persona.list.canvasIdRequired'), { type: 'error' })
    return
  }
  
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      canvasId: canvasId.value,
      personaId: personaFilter.value ? Number(personaFilter.value) : undefined,
      title: titleFilter.value || undefined
    }
    const response = await getRequirementList(params)
    if (response.code === 200) {
      let records = response.data.records || []
      
      // 如果设置了状态筛选（优先级），在前端进行过滤
      if (statusFilter.value) {
        records = records.filter(item => 
          item.priority === statusFilter.value
        )
      }
      
      // 如果设置了时间筛选，在前端进行过滤
      if (timeFilter.value) {
        const filterDate = new Date(timeFilter.value)
        filterDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(filterDate)
        nextDay.setDate(nextDay.getDate() + 1)
        
        records = records.filter(item => {
          if (!item.createTime) return false
          const itemDate = new Date(item.createTime)
          return itemDate >= filterDate && itemDate < nextDay
        })
      }
      
      // 为每个需求添加用户画像名称
      const personaMap = new Map()
      personaOptions.value.forEach(opt => {
        if (opt.value) {
          personaMap.set(Number(opt.value), opt.label)
        }
      })
      
      records = records.map(item => {
        if (item.personaId && personaMap.has(item.personaId)) {
          item.personaName = personaMap.get(item.personaId)
        }
        return item
      })
      
      requirementList.value = records
      total.value = records.length
      totalPages.value = Math.ceil(total.value / pageSize.value)
    } else {
      showAlert(response.msg || t('persona.requirementList.loadFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.requirementList.loadFailed'), { type: 'error' })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  loadList()
}

// 重置
const handleReset = () => {
  titleFilter.value = ''
  personaFilter.value = defaultPersonaId.value ? String(defaultPersonaId.value) : ''
  statusFilter.value = ''
  timeFilter.value = ''
  pageNum.value = 1
  loadList()
}

// 分页
const handlePageChange = (page) => {
  pageNum.value = page
  loadList()
}

// 返回
const handleBack = () => {
  router.goToPersonaList()
  window.canvasId = canvasId.value
}

// 创建需求
const handleCreate = () => {
  currentRequirementId.value = null
  requirementData.value = {
    personaId: personaFilter.value ? Number(personaFilter.value) : null,
    canvasId: canvasId.value
  }
  showRequirementManagementModal.value = true
}

// 点击需求项显示编辑弹窗
const handleRequirementClick = (requirement) => {
  currentRequirementId.value = requirement.requirementId
  requirementData.value = { ...requirement }
  // 确保传递 personaId 和 canvasId
  if (!requirementData.value.personaId && personaFilter.value) {
    requirementData.value.personaId = Number(personaFilter.value)
  }
  if (!requirementData.value.canvasId && canvasId.value) {
    requirementData.value.canvasId = canvasId.value
  }
  showRequirementManagementModal.value = true
}

// 删除
const handleDelete = async (requirementId) => {
  const confirmed = await showConfirm(t('persona.requirementList.confirmDelete'), { type: 'error' })
  if (!confirmed) {
    return
  }
  try {
    const response = await deleteRequirement([requirementId])
    if (response.code === 200) {
      showAlert(t('persona.requirementList.deleteSuccess'), { type: 'success' })
      loadList()
    } else {
      showAlert(response.msg || t('persona.requirementList.deleteFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.requirementList.deleteFailed'), { type: 'error' })
  }
}

// 保存需求管理
const handleRequirementManagementSave = async (data) => {
  try {
    let response
    if (data.requirementId) {
      // 更新需求
      response = await updateRequirement(data)
    } else {
      // 创建需求
      response = await createRequirement(data)
    }
    
    if (response.code === 200) {
      showAlert(t('persona.requirementManagement.saveSuccess'), { type: 'success' })
      // 刷新用户画像列表（可能新增了用户画像）
      await loadPersonaList()
      loadList()
    } else {
      showAlert(response.msg || t('persona.requirementManagement.saveFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.requirementManagement.saveFailed'), { type: 'error' })
  }
}

// 需求管理弹窗关闭
const handleRequirementManagementClose = () => {
  requirementData.value = {}
  currentRequirementId.value = null
}

// 获取优先级标签
const getPriorityLabel = (priority) => {
  const map = {
    'Must': t('persona.requirementManagement.priorityMust'),
    'Should': t('persona.requirementManagement.priorityShould'),
    'Could': t('persona.requirementManagement.priorityCould'),
    'Wont': t('persona.requirementManagement.priorityWont')
  }
  return map[priority] || priority
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

// 侧边栏切换
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 关闭事件
const handleSidebarClose = () => {
  sidebarOpen.value = false
}

// 初始化
onMounted(async () => {
  if (!canvasId.value) {
    showAlert(t('persona.list.canvasIdRequired'), { type: 'error' })
    router.goToBusinessModelCanvasList()
    return
  }
  
  // 加载用户画像列表
  await loadPersonaList()
  loadList()
})
</script>

<style scoped>
.requirement-list-container {
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
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
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
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 列表区域 */
.requirement-list-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}

.requirement-item {
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
  cursor: pointer;
}

.requirement-item:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.requirement-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%);
  color: #f44336;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 2px 8px rgba(244, 67, 54, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 10;
  padding: 0;
}

.requirement-close-btn:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.25) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  box-shadow: 
    0 4px 12px rgba(244, 67, 54, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.1) rotate(90deg);
}

.requirement-close-btn:active {
  transform: scale(0.95);
}

.requirement-close-btn svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(244, 67, 54, 0.3));
}

.requirement-header {
  margin-bottom: 15px;
  padding-right: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.requirement-title {
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
  flex: 1;
}

.requirement-priority-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.4);
  white-space: nowrap;
  flex-shrink: 0;
}

.requirement-content {
  flex: 1;
  margin-bottom: 15px;
}

.requirement-field {
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

.requirement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%);
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.meta-item:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  transform: translateY(-1px);
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 215, 0, 0.9);
  flex-shrink: 0;
}

.meta-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
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

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.btn-page {
  padding: 10px 20px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .requirement-list-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .requirement-list-section {
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

  .requirement-list-section {
    grid-template-columns: 1fr;
  }

  .requirement-header {
    padding-right: 40px;
  }
}
</style>

