<template>
  <div class="persona-list-container">
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
        <h1 class="page-title">{{ t('persona.list.title') }}</h1>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleBack">
            {{ t('persona.list.back') }}
          </button>
          <button class="btn-primary" @click="handleCreate">
            {{ t('persona.list.create') }}
          </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="filter-row">
          <div class="filter-field">
            <div class="filter-label">{{ t('persona.detail.name') }}</div>
            <CustomInput
              v-model="nameFilter"
              :placeholder="t('persona.detail.namePlaceholder')"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">{{ t('persona.detail.gender') }}</div>
            <CustomSelect
              v-model="genderFilter"
              :options="genderOptions"
              :placeholder="t('persona.list.allGender')"
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
      <div class="persona-list-section">
        <div
          v-for="persona in personaList"
          :key="persona.personaId"
          class="persona-item"
          @click="handleView(persona.personaId)"
        >
          <button class="persona-delete-btn" @click.stop="handleDelete(persona.personaId)" :title="t('persona.list.delete')">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="persona-header">
            <div class="persona-avatar">
              <img v-if="persona.avatar" :src="persona.avatar" :alt="persona.name" />
              <div v-else class="avatar-placeholder">{{ getAvatarInitial(persona.name) }}</div>
            </div>
            <div class="persona-info">
              <h3 class="persona-name">{{ persona.name }}</h3>
              <div class="persona-basic">
                <span v-if="persona.age" class="info-badge">{{ persona.age }}{{ t('persona.list.ageUnit') }}</span>
                <span v-if="persona.gender" class="info-badge">{{ getGenderLabel(persona.gender) }}</span>
                <span v-if="persona.identity" class="info-badge">{{ persona.identity }}</span>
              </div>
            </div>
          </div>
          <div class="persona-content" v-if="persona.hobbies || persona.usageScenario">
            <div class="persona-field" v-if="persona.hobbies">
              <div class="field-label">{{ t('persona.detail.hobbies') }}:</div>
              <div class="field-content">{{ persona.hobbies }}</div>
            </div>
            <div class="persona-field" v-if="persona.usageScenario">
              <div class="field-label">{{ t('persona.detail.usageScenario') }}:</div>
              <div class="field-content">{{ persona.usageScenario }}</div>
            </div>
          </div>
          <div class="persona-meta">
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="meta-label">{{ t('persona.list.createTime') }}:</span>
              <span class="meta-value">{{ formatDate(persona.createTime) }}</span>
            </div>
            <button class="btn-action btn-scenario" @click.stop="handleScenarioAnalysis(persona.personaId)">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 17l-5-5-5 5-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 11l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ t('persona.list.scenarioAnalysis') }}</span>
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="personaList.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">👤</div>
          <p>{{ t('persona.list.empty') }}</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <p>{{ t('persona.list.loading') }}</p>
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

    <!-- 场景分析弹窗 -->
    <ScenarioAnalysisModal
      v-model="showScenarioModal"
      :persona-id="currentPersonaId"
      :initial-content="scenarioContent"
      @save="handleScenarioSave"
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
import ScenarioAnalysisModal from './ScenarioAnalysisModal.vue'
import { getPersonaList, deletePersona } from '../../api/persona.js'
import { showAlert, showConfirm } from '../../utils/alert.js'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)

// 从window获取canvasId
const canvasId = ref(window.canvasId ? Number(window.canvasId) : null)

// 场景分析弹窗
const showScenarioModal = ref(false)
const currentPersonaId = ref(null)
const scenarioContent = ref('')

// 数据
const personaList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const nameFilter = ref('')
const genderFilter = ref('')

// 性别选项
const genderOptions = computed(() => [
  { value: '', label: t('persona.list.allGender') },
  { value: 'male', label: t('persona.detail.genderMale') },
  { value: 'female', label: t('persona.detail.genderFemale') },
  { value: 'other', label: t('persona.detail.genderOther') }
])

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
      name: nameFilter.value || undefined,
      gender: genderFilter.value || undefined
    }
    const response = await getPersonaList(params)
    if (response.code === 200) {
      personaList.value = response.data.records || []
      total.value = response.data.total || 0
      totalPages.value = response.data.pages || 0
    } else {
      showAlert(response.msg || t('persona.list.loadFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.list.loadFailed'), { type: 'error' })
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
  nameFilter.value = ''
  genderFilter.value = ''
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
  router.goToBusinessModelCanvasList()
}

// 创建
const handleCreate = () => {
  router.goToPersonaDetail()
  window.personaEditMode = 'create'
  window.canvasId = canvasId.value
}

// 查看
const handleView = (personaId) => {
  router.goToPersonaDetail()
  window.personaId = personaId
  window.personaEditMode = 'view'
  window.canvasId = canvasId.value
}

// 编辑
const handleEdit = (personaId) => {
  router.goToPersonaDetail()
  window.personaId = personaId
  window.personaEditMode = 'edit'
  window.canvasId = canvasId.value
}

// 场景分析
const handleScenarioAnalysis = (personaId) => {
  currentPersonaId.value = personaId
  // TODO: 从服务器加载已保存的场景分析内容
  scenarioContent.value = ''
  showScenarioModal.value = true
}

// 保存场景分析
const handleScenarioSave = async (data) => {
  try {
    // TODO: 调用API保存场景分析内容
    // const response = await saveScenarioAnalysis(data.personaId, data.content)
    showAlert(t('persona.scenarioAnalysis.saveSuccess'), { type: 'success' })
  } catch (error) {
    showAlert(error.message || t('persona.scenarioAnalysis.saveFailed'), { type: 'error' })
  }
}

// 删除
const handleDelete = async (personaId) => {
  const confirmed = await showConfirm(t('persona.list.confirmDelete'), { type: 'error' })
  if (!confirmed) {
    return
  }
  try {
    const response = await deletePersona([personaId])
    if (response.code === 200) {
      showAlert(t('persona.list.deleteSuccess'), { type: 'success' })
      loadList()
    } else {
      showAlert(response.msg || t('persona.list.deleteFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.list.deleteFailed'), { type: 'error' })
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

// 获取性别标签
const getGenderLabel = (gender) => {
  const map = {
    'male': t('persona.detail.genderMale'),
    'female': t('persona.detail.genderFemale'),
    'other': t('persona.detail.genderOther')
  }
  return map[gender] || gender
}

// 获取头像首字母
const getAvatarInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
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
  if (!canvasId.value) {
    showAlert(t('persona.list.canvasIdRequired'), { type: 'error' })
    router.goToBusinessModelCanvasList()
    return
  }
  loadList()
})
</script>

<style scoped>
.persona-list-container {
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
  grid-template-columns: 1fr 1fr auto;
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
.persona-list-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}

.persona-item {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.persona-delete-btn {
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

.persona-delete-btn:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.25) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  box-shadow: 
    0 4px 12px rgba(244, 67, 54, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.1) rotate(90deg);
}

.persona-delete-btn:active {
  transform: scale(0.95);
}

.persona-delete-btn svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(244, 67, 54, 0.3));
}

.persona-item:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.persona-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
  justify-content: space-between;
}

.persona-header .btn-scenario {
  flex-shrink: 0;
  white-space: nowrap;
}

.persona-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 215, 0, 0.5);
  flex-shrink: 0;
}

.persona-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  color: #ffd700;
  font-size: 24px;
  font-weight: bold;
}

.persona-info {
  flex: 1;
}

.persona-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin: 0 0 8px 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.persona-basic {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.persona-content {
  flex: 1;
  margin-bottom: 0;
}

.persona-field {
  margin-bottom: 10px;
}

.field-label {
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 5px;
}

.field-content {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.persona-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: auto;
  padding-top: 15px;
  min-height: 50px;
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

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.btn-action:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
}

.btn-action:active {
  transform: translateY(0);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.btn-scenario {
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
}

.btn-scenario:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%);
  border-color: rgba(76, 175, 80, 0.7);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-scenario .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(76, 175, 80, 0.3));
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

  .persona-list-section {
    grid-template-columns: 1fr;
  }

  .persona-header {
    flex-wrap: wrap;
  }

  .persona-header .btn-scenario {
    width: 100%;
    margin-top: 10px;
  }

  .persona-meta {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .persona-meta .meta-item {
    justify-content: center;
  }

  .persona-meta .btn-action {
    width: 100%;
    justify-content: center;
  }

  .persona-delete-btn {
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
  }

  .persona-delete-btn svg {
    width: 14px;
    height: 14px;
  }
}
</style>

