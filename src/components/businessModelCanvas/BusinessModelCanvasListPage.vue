<template>
  <div class="business-model-canvas-list-container">
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
        <h1 class="page-title">{{ t('businessModelCanvas.list.title') }}</h1>
        <button class="btn-primary" @click="handleCreate">
          {{ t('businessModelCanvas.list.create') }}
        </button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="filter-row">
          <div class="filter-field">
            <div class="filter-label">{{ t('businessModelCanvas.detail.title') }}</div>
            <CustomInput
              v-model="titleFilter"
              :placeholder="t('businessModelCanvas.detail.titlePlaceholder')"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">{{ t('businessModelCanvas.detail.status') }}</div>
            <CustomSelect
              v-model="statusFilter"
              :options="statusOptions"
              :placeholder="t('businessModelCanvas.list.allStatus')"
            />
          </div>
          <div class="filter-field filter-field-button">
            <div class="filter-label">&nbsp;</div>
            <button class="btn-reset" @click="handleReset">
              {{ t('businessModelCanvas.list.reset') }}
            </button>
          </div>
        </div>
        <button class="btn-search" @click="handleSearch">
          {{ t('businessModelCanvas.list.search') }}
        </button>
      </div>

      <!-- 列表 -->
      <div class="canvas-list-section">
        <div
          v-for="canvas in canvasList"
          :key="canvas.canvasId"
          class="canvas-item"
          @click="handleView(canvas.canvasId)"
        >
          <div class="canvas-header">
            <h3 class="canvas-title">{{ canvas.title }}</h3>
            <div class="canvas-header-right">
              <button class="btn-action btn-persona" @click.stop="handlePersona(canvas.canvasId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ t('businessModelCanvas.list.persona') }}</span>
              </button>
              <button class="btn-action" @click.stop="handleEdit(canvas.canvasId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ t('businessModelCanvas.list.edit') }}</span>
              </button>
              <button class="btn-action btn-danger" @click.stop="handleDelete(canvas.canvasId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ t('businessModelCanvas.list.delete') }}</span>
              </button>
            </div>
          </div>
          
          <!-- 价值主张和关键活动 -->
          <div class="canvas-content-section" v-if="canvas.valuePropositions || canvas.keyActivities">
            <div class="content-row">
              <div class="content-item" v-if="canvas.valuePropositions">
                <div class="content-label">{{ t('businessModelCanvas.detail.valuePropositions') }}</div>
                <div class="content-value">{{ truncateText(canvas.valuePropositions, 150) }}</div>
              </div>
              <div class="content-item" v-if="canvas.keyActivities">
                <div class="content-label">{{ t('businessModelCanvas.detail.keyActivities') }}</div>
                <div class="content-value">{{ truncateText(canvas.keyActivities, 150) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 用户画像卡片列表 -->
          <div class="persona-cards-section">
            <div class="persona-cards-grid">
              <div
                v-for="(persona, index) in getPersonaListWithDemo(canvas)"
                :key="persona.personaId || `demo-${index}`"
                class="persona-card"
                :class="{ 'persona-card-demo': persona.isDemo }"
                @click.stop="!persona.isDemo && handlePersonaCardClick(canvas.canvasId, persona.personaId)"
              >
                <div class="persona-card-avatar">
                  <img v-if="persona.avatar" :src="persona.avatar" :alt="persona.name" />
                  <div v-else class="avatar-placeholder">{{ getAvatarInitial(persona.name) }}</div>
                </div>
                <div class="persona-card-info">
                  <h4 class="persona-card-name">{{ persona.name }}</h4>
                  <div class="persona-card-basic">
                    <span v-if="persona.age" class="info-badge">{{ persona.age }}{{ t('businessModelCanvas.list.ageUnit') }}</span>
                    <span v-if="persona.gender" class="info-badge">{{ getGenderLabel(persona.gender) }}</span>
                    <span v-if="persona.identity" class="info-badge">{{ persona.identity }}</span>
                  </div>
                  <div class="persona-card-desc" v-if="persona.hobbies || persona.usageScenario">
                    <span v-if="persona.hobbies" class="desc-text">{{ persona.hobbies }}</span>
                    <span v-if="persona.usageScenario" class="desc-text">{{ persona.usageScenario }}</span>
                  </div>
                </div>
              </div>
              <!-- 更多按钮 -->
              <div 
                v-if="canvas.personaTotal > 3" 
                class="persona-card-more"
                @click.stop="handlePersona(canvas.canvasId)"
              >
                <div class="more-icon">+</div>
                <div class="more-text">{{ t('businessModelCanvas.list.morePersona') }}</div>
                <div class="more-count">{{ canvas.personaTotal - 3 }}</div>
              </div>
            </div>
          </div>
          
          <div class="canvas-actions">
            <div class="canvas-actions-right">
              <div class="info-items-row">
                <div class="meta-item">
                  <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="meta-label">{{ t('businessModelCanvas.list.createTime') }}:</span>
                  <span class="meta-value">{{ formatDate(canvas.createTime) }}</span>
                </div>
                <div class="meta-item" v-if="canvas.updateTime">
                  <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                  </svg>
                  <span class="meta-label">{{ t('businessModelCanvas.list.updateTime') }}:</span>
                  <span class="meta-value">{{ formatDate(canvas.updateTime) }}</span>
                </div>
                <div class="version-badge" v-if="canvas.version">
                  <svg class="badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="badge-label">{{ t('businessModelCanvas.detail.version') }}</span>
                  <span class="badge-value">{{ canvas.version }}</span>
                </div>
                <div :class="['status-badge', canvas.status === '0' ? 'status-normal' : 'status-disabled']">
                  <svg v-if="canvas.status === '0'" class="badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else class="badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="badge-text">{{ canvas.status === '0' ? t('businessModelCanvas.list.statusNormal') : t('businessModelCanvas.list.statusDisabled') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="canvasList.length === 0 && !loading" class="empty-state">
			  <div class="empty-icon">🌳</div>
          <p>{{ t('businessModelCanvas.list.empty') }}</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <p>{{ t('businessModelCanvas.list.loading') }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination">
        <button
          class="btn-page"
          :disabled="pageNum <= 1"
          @click="handlePageChange(pageNum - 1)"
        >
          {{ t('businessModelCanvas.list.prevPage') }}
        </button>
        <span class="page-info">
          {{ t('businessModelCanvas.list.pageInfo', { current: pageNum, total: totalPages }) }}
        </span>
        <button
          class="btn-page"
          :disabled="pageNum >= totalPages"
          @click="handlePageChange(pageNum + 1)"
        >
          {{ t('businessModelCanvas.list.nextPage') }}
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
import { getCanvasList, deleteCanvas } from '../../api/businessModelCanvas.js'
import { getPersonaList } from '../../api/persona.js'
import { showAlert, showConfirm } from '../../utils/alert.js'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)

// 数据
const canvasList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const titleFilter = ref('')
const statusFilter = ref('')

// 状态选项
const statusOptions = computed(() => [
  { value: '', label: t('businessModelCanvas.list.allStatus') },
  { value: '0', label: t('businessModelCanvas.list.statusNormal') },
  { value: '1', label: t('businessModelCanvas.list.statusDisabled') }
])

// 加载列表
const loadList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      title: titleFilter.value || undefined,
      status: statusFilter.value || undefined
    }
    const response = await getCanvasList(params)
    if (response.code === 200) {
      canvasList.value = response.data.records || []
      total.value = response.data.total || 0
      totalPages.value = response.data.pages || 0
      
      // 为每个画布加载用户画像数据（最多4个）
      await loadPersonasForCanvases()
    } else {
      showAlert(response.msg || t('businessModelCanvas.list.loadFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('businessModelCanvas.list.loadFailed'), { type: 'error' })
  } finally {
    loading.value = false
  }
}

// 为所有画布加载用户画像数据
const loadPersonasForCanvases = async () => {
  if (!canvasList.value || canvasList.value.length === 0) {
    return
  }
  
  try {
    // 并行加载所有画布的用户画像数据
    const personaPromises = canvasList.value.map(async (canvas, index) => {
      try {
        const personaParams = {
          canvasId: canvas.canvasId,
          pageNum: 1,
          pageSize: 3  // 最多加载3个
        }
        const personaResponse = await getPersonaList(personaParams)
        if (personaResponse.code === 200) {
          const personas = personaResponse.data.records || []
          const total = personaResponse.data.total || 0
          // 将用户画像数据关联到画布对象（使用响应式更新）
          if (canvasList.value[index]) {
            canvasList.value[index] = {
              ...canvasList.value[index],
              personas: personas,
              personaTotal: total
            }
          }
        }
      } catch (error) {
        console.error(`加载画布 ${canvas.canvasId} 的用户画像失败:`, error)
        // 如果加载失败，设置为空数组
        if (canvasList.value[index]) {
          canvasList.value[index] = {
            ...canvasList.value[index],
            personas: [],
            personaTotal: 0
          }
        }
      }
    })
    
    await Promise.all(personaPromises)
  } catch (error) {
    console.error('加载用户画像数据失败:', error)
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
  statusFilter.value = ''
  pageNum.value = 1
  loadList()
}

// 分页
const handlePageChange = (page) => {
  pageNum.value = page
  loadList()
}

// 创建
const handleCreate = () => {
  router.navigate(ROUTES.BUSINESS_MODEL_CANVAS_DETAIL)
  // 传递新建标识
  window.canvasEditMode = 'create'
}

// 查看
const handleView = (canvasId) => {
  router.navigate(ROUTES.BUSINESS_MODEL_CANVAS_DETAIL)
  window.canvasId = canvasId
  window.canvasEditMode = 'view'
}

// 编辑
const handleEdit = (canvasId) => {
  router.navigate(ROUTES.BUSINESS_MODEL_CANVAS_DETAIL)
  window.canvasId = canvasId
  window.canvasEditMode = 'edit'
}

// 删除
const handleDelete = async (canvasId) => {
  const confirmed = await showConfirm(t('businessModelCanvas.list.confirmDelete'), { type: 'error' })
  if (!confirmed) {
    return
  }
  try {
    const response = await deleteCanvas([canvasId])
    if (response.code === 200) {
      showAlert(t('businessModelCanvas.list.deleteSuccess'), { type: 'success' })
      loadList()
    } else {
      showAlert(response.msg || t('businessModelCanvas.list.deleteFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('businessModelCanvas.list.deleteFailed'), { type: 'error' })
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

// 截断文本
const truncateText = (text, maxLength = 200) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取用户画像列表（包含demo数据，确保始终显示3个）
const getPersonaListWithDemo = (canvas) => {
  const personas = canvas.personas || []
  const maxDisplay = 3
  
  // 如果已经有3个或更多，只取前3个
  if (personas.length >= maxDisplay) {
    return personas.slice(0, maxDisplay).map(p => ({ ...p, isDemo: false }))
  }
  
  // 否则，用demo数据填充到3个
  const result = personas.map(p => ({ ...p, isDemo: false }))
  
  // Demo数据
  const demoData = [
    {
      personaId: null,
      name: t('businessModelCanvas.list.demoUserA'),
      age: 28,
      gender: 'M',
      identity: t('businessModelCanvas.list.demoIdentityA'),
      hobbies: t('businessModelCanvas.list.demoHobbiesA'),
      usageScenario: t('businessModelCanvas.list.demoScenarioA'),
      isDemo: true
    },
    {
      personaId: null,
      name: t('businessModelCanvas.list.demoUserB'),
      age: 32,
      gender: 'F',
      identity: t('businessModelCanvas.list.demoIdentityB'),
      hobbies: t('businessModelCanvas.list.demoHobbiesB'),
      usageScenario: t('businessModelCanvas.list.demoScenarioB'),
      isDemo: true
    },
    {
      personaId: null,
      name: t('businessModelCanvas.list.demoUserC'),
      age: 25,
      gender: 'M',
      identity: t('businessModelCanvas.list.demoIdentityC'),
      hobbies: t('businessModelCanvas.list.demoHobbiesC'),
      usageScenario: t('businessModelCanvas.list.demoScenarioC'),
      isDemo: true
    }
  ]
  
  // 填充demo数据，直到有3个
  while (result.length < maxDisplay) {
    const demoIndex = result.length % demoData.length
    result.push({ ...demoData[demoIndex] })
  }
  
  return result
}

// 用户画像相关方法
const handlePersona = (canvasId) => {
  router.navigate(ROUTES.PERSONA_LIST)
  window.canvasId = canvasId
}

const handlePersonaCardClick = (canvasId, personaId) => {
  router.navigate(ROUTES.PERSONA_DETAIL)
  window.canvasId = canvasId
  window.personaId = personaId
}

const getAvatarInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const getGenderLabel = (gender) => {
  if (gender === 'M') return t('persona.detail.genderMale')
  if (gender === 'F') return t('persona.detail.genderFemale')
  return gender
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
  loadList()
})
</script>

<style scoped>
.business-model-canvas-list-container {
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
.canvas-list-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.canvas-item {
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

.canvas-item:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.canvas-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.canvas-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}



/* 价值主张和关键活动展示区域 */
.canvas-content-section {
  margin-bottom: 15px;
}

.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.content-item {
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  padding: 12px 15px;
  transition: all 0.3s;
}

.content-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
}

.content-label {
  font-size: 13px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 8px;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
}

.content-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  word-wrap: break-word;
  max-height: 80px;
  overflow-y: auto;
  padding-right: 5px;
}

.content-value::-webkit-scrollbar {
  width: 4px;
}

.content-value::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.content-value::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.4);
  border-radius: 2px;
}

.content-value::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.6);
}

/* 用户画像卡片区域 */
.persona-cards-section {
  margin-bottom: 15px;
}

.persona-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.persona-card {
  display: flex;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  height: 240px;
  overflow: hidden;
}

.persona-card:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.persona-card-demo {
  opacity: 0.6;
  cursor: default;
}

.persona-card-demo:hover {
  opacity: 0.8;
  transform: none;
}

.persona-card-avatar {
  width: 33.333%;
  flex-basis: 33.333%;
  flex-shrink: 0;
  height: 220px;
  margin-right: 12px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.persona-card-avatar img {
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
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}

.persona-card-info {
  flex: 1;
  flex-basis: calc(66.667% - 12px);
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.persona-card-name {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  margin: 0 0 12px 0;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.persona-card-basic {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.info-badge {
  font-size: 11px;
  padding: 3px 8px;
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

.persona-card-desc {
  flex: 1;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  margin-top: 8px;
}

.desc-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.persona-card-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 215, 0, 0.05);
  border: 1px dashed rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  height: 240px;
  color: rgba(255, 255, 255, 0.7);
}

.persona-card-more:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.5);
  border-style: solid;
}

.more-icon {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 4px;
}

.more-text {
  font-size: 12px;
  margin-bottom: 4px;
}

.more-count {
  font-size: 11px;
  color: rgba(255, 215, 0, 0.8);
}

.canvas-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 15px;
  margin-top: 15px;
}

.canvas-actions-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.info-items-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.version-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.15) 100%);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 
    0 2px 8px rgba(255, 215, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.version-badge:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.35) 0%, rgba(255, 215, 0, 0.25) 100%);
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 4px 12px rgba(255, 215, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.badge-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.badge-label {
  font-weight: 500;
  letter-spacing: 0.3px;
}

.badge-value {
  font-weight: 700;
  font-size: 13px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.status-normal {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.15) 100%);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.5);
  box-shadow: 
    0 2px 8px rgba(76, 175, 80, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.status-normal:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.35) 0%, rgba(76, 175, 80, 0.25) 100%);
  border-color: rgba(76, 175, 80, 0.7);
  box-shadow: 
    0 4px 12px rgba(76, 175, 80, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.status-normal .badge-icon {
  color: #4caf50;
}

.status-disabled {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.25) 0%, rgba(244, 67, 54, 0.15) 100%);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.5);
  box-shadow: 
    0 2px 8px rgba(244, 67, 54, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.status-disabled:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.25) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  box-shadow: 
    0 4px 12px rgba(244, 67, 54, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.status-disabled .badge-icon {
  color: #f44336;
}

.badge-text {
  font-weight: 600;
  letter-spacing: 0.3px;
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

.btn-persona {
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
}

.btn-persona:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%);
  border-color: rgba(76, 175, 80, 0.7);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-persona .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(76, 175, 80, 0.3));
}

.btn-danger {
  color: #f44336;
  border-color: rgba(244, 67, 54, 0.5);
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
}

.btn-danger:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.btn-danger .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(244, 67, 54, 0.3));
}

.empty-state,
.loading-state {
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

  .canvas-actions {
    align-items: flex-end;
  }

  .canvas-actions-right {
    align-items: flex-end;
  }

  .info-items-row {
    justify-content: flex-end;
    gap: 10px;
  }

  .canvas-header-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .canvas-header-right .btn-action {
    width: 100%;
    min-width: auto;
  }

  .content-row {
    grid-template-columns: 1fr;
  }

  .persona-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .persona-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
