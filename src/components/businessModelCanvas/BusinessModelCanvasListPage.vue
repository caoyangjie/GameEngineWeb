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
            <div class="header-badges">
              <span v-if="canvas.version" class="version-badge">
                {{ t('businessModelCanvas.detail.version') }}: {{ canvas.version }}
              </span>
              <span :class="['status-badge', canvas.status === '0' ? 'status-normal' : 'status-disabled']">
                {{ canvas.status === '0' ? t('businessModelCanvas.list.statusNormal') : t('businessModelCanvas.list.statusDisabled') }}
              </span>
            </div>
          </div>
          <div class="canvas-info-row" v-if="canvas.valuePropositions || canvas.customerSegments">
            <div class="canvas-info-item" v-if="canvas.valuePropositions">
              <div class="info-label">{{ t('businessModelCanvas.detail.valuePropositions') }}:</div>
              <div class="info-content">{{ canvas.valuePropositions }}</div>
            </div>
            <div class="canvas-info-item" v-if="canvas.customerSegments">
              <div class="info-label">{{ t('businessModelCanvas.detail.customerSegments') }}:</div>
              <div class="info-content">{{ canvas.customerSegments }}</div>
            </div>
          </div>
          <div class="canvas-meta">
            <span class="meta-item">
              {{ t('businessModelCanvas.list.createTime') }}: {{ formatDate(canvas.createTime) }}
            </span>
            <span class="meta-item" v-if="canvas.updateTime">
              {{ t('businessModelCanvas.list.updateTime') }}: {{ formatDate(canvas.updateTime) }}
            </span>
          </div>
          <div class="canvas-actions">
            <button class="btn-action" @click.stop="handleEdit(canvas.canvasId)">
              {{ t('businessModelCanvas.list.edit') }}
            </button>
            <button class="btn-action btn-danger" @click.stop="handleDelete(canvas.canvasId)">
              {{ t('businessModelCanvas.list.delete') }}
            </button>
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
import { showAlert } from '../../utils/alert.js'

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
    } else {
      showAlert(response.msg || '加载失败', 'error')
    }
  } catch (error) {
    showAlert(error.message || '加载失败', 'error')
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
  if (!confirm(t('businessModelCanvas.list.confirmDelete'))) {
    return
  }
  try {
    const response = await deleteCanvas([canvasId])
    if (response.code === 200) {
      showAlert(t('businessModelCanvas.list.deleteSuccess'), 'success')
      loadList()
    } else {
      showAlert(response.msg || '删除失败', 'error')
    }
  } catch (error) {
    showAlert(error.message || '删除失败', 'error')
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

.header-badges {
  display: flex;
  gap: 10px;
  align-items: center;
}

.version-badge {
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  background: rgba(33, 150, 243, 0.3);
  color: #2196f3;
  border: 1px solid rgba(33, 150, 243, 0.5);
}

.canvas-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.status-badge {
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-normal {
  background: rgba(76, 175, 80, 0.3);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.status-disabled {
  background: rgba(244, 67, 54, 0.3);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.canvas-info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.canvas-info-item {
  padding: 12px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
}

.info-label {
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 8px;
}

.info-content {
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

.canvas-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.canvas-actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  padding: 8px 16px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-action:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
}

.btn-danger {
  color: #f44336;
  border-color: rgba(244, 67, 54, 0.5);
}

.btn-danger:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.7);
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

  .canvas-info-row {
    grid-template-columns: 1fr;
  }

  .canvas-actions {
    flex-direction: column;
  }
}
</style>
