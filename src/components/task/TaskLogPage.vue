<template>
  <div class="task-log-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
      <div class="temple-background"></div>
      <div class="forest-overlay"></div>
      <!-- 装饰性元素：宝塔和树 -->
      <div class="decorative-pagoda"></div>
      <div class="decorative-tree"></div>
    </div>

    <!-- 顶部导航栏 -->
    <TopHeader @toggle-sidebar="toggleSidebar" @go-to-journey="handleGoToJourney" @go-to-deposit="handleGoToDeposit" />

    <!-- 主要内容区域 -->
    <main class="task-log-main-content">
      <!-- 标题 -->
      <div class="title-section">
        <div class="title-banner">
          <span class="title-icon">📜</span>
          <span class="title-text">{{ t('taskLog.title') }}</span>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-field">
            <label class="filter-label">{{ t('taskLog.startDate') }}</label>
            <CustomDatePicker
              v-model="filters.startDate"
            />
          </div>
          <div class="filter-field">
            <label class="filter-label">{{ t('taskLog.endDate') }}</label>
            <CustomDatePicker
              v-model="filters.endDate"
            />
          </div>
          <div class="filter-field">
            <label class="filter-label">{{ t('taskLog.status') }}</label>
            <CustomSelect
              v-model="filters.status"
              :options="statusOptions"
              :placeholder="t('taskLog.all')"
            />
          </div>
        </div>
        <button class="filter-button" @click="applyFilter">
          {{ t('taskLog.applyFilter') }}
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="task-list-section">
        <!-- 表头 -->
        <div class="task-list-header">
          <div class="header-cell">{{ t('taskLog.startDate') }}</div>
          <div class="header-cell">{{ t('taskLog.taskTitle') }}</div>
          <div class="header-cell">{{ t('taskLog.taskDays') }}</div>
          <div class="header-cell">{{ t('taskLog.progress') }}</div>
          <div class="header-cell">{{ t('taskLog.status') }}</div>
          <div class="header-cell">{{ t('taskLog.reward') }}</div>
        </div>

        <!-- 分隔线 -->
        <div class="header-divider"></div>

        <!-- 任务列表内容 -->
        <div class="task-list-content">
          <div v-if="filteredTasks.length === 0" class="empty-state">
			  <div class="empty-icon">🌳</div>
            <div class="empty-text">{{ t('commonStatus.noData') }}</div>
          </div>
          <div v-else class="task-items">
            <div 
              v-for="task in filteredTasks" 
              :key="task.id" 
              class="task-item"
            >
              <div class="task-cell">{{ formatDate(task.startDate) }}</div>
              <div class="task-cell">{{ task.title }}</div>
              <div class="task-cell">{{ task.days }}{{ t('taskLog.days') }}</div>
              <div class="task-cell">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: task.progress + '%' }"
                  ></div>
                  <span class="progress-text">{{ task.progress }}%</span>
                </div>
              </div>
              <div class="task-cell">
                <span class="status-badge" :class="task.status">
                  {{ getStatusText(task.status) }}
                </span>
              </div>
              <div class="task-cell reward-cell">{{ task.reward }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="tasks"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomSelect from '../common/CustomSelect.vue'
import CustomDatePicker from '../common/CustomDatePicker.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)

// 筛选条件
const filters = reactive({
  startDate: '',
  endDate: '',
  status: ''
})

// 状态选项
const statusOptions = computed(() => [
  { value: '', label: t('taskLog.all') },
  { value: 'pending', label: t('taskLog.newTask') },
  { value: 'completed', label: t('taskLog.completed') },
  { value: 'cancelled', label: t('taskLog.expired') },
  { value: 'dismissed', label: t('taskLog.dismissed') }
])

// 任务数据（示例数据，实际应该从API获取）
const tasks = ref([])

// 应用筛选后的任务列表
const filteredTasks = computed(() => {
  let result = tasks.value

  if (filters.startDate) {
    result = result.filter(task => task.startDate >= filters.startDate)
  }
  if (filters.endDate) {
    result = result.filter(task => task.startDate <= filters.endDate)
  }
  if (filters.status) {
    result = result.filter(task => task.status === filters.status)
  }

  return result
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 现在直接使用 router，只需要处理关闭事件
const handleSidebarClose = () => {
  toggleSidebar()
}

const handleGoToJourney = () => {
  router.goToJourney()
}

const handleGoToDeposit = () => {
  router.goToDeposit()
}


const applyFilter = () => {
  // 筛选逻辑已在 computed 中实现
  console.log('应用筛选', filters)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: t('taskLog.inProgress'),
    completed: t('taskLog.completed'),
    cancelled: t('taskLog.cancelled')
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.task-log-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层 */
.background {
  position: absolute;
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

.galaxy {
  position: absolute;
  top: 10%;
  right: 10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 215, 0, 0.2) 0%,
    rgba(138, 43, 226, 0.2) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(40px);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: 
    linear-gradient(to top, #0a0a0a 0%, transparent 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cpath d='M0,400 L200,300 L400,350 L600,250 L800,320 L1000,280 L1200,300 L1200,400 Z' fill='%231a1a1a'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.8;
}

.temple-background {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(20, 15, 10, 0.2) 50%, rgba(10, 5, 0, 0.4) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath d='M100,400 L100,250 L150,230 L200,250 L250,230 L300,250 L350,230 L400,250 L450,230 L500,250 L550,230 L600,250 L650,230 L700,250 L700,400 Z' fill='rgba(20,15,10,0.3)'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.6;
  filter: blur(2px);
}

.forest-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

/* 装饰性元素 */
.decorative-pagoda {
  position: absolute;
  bottom: 10%;
  left: 5%;
  width: 120px;
  height: 180px;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(20, 15, 10, 0.4) 50%, rgba(10, 5, 0, 0.6) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 180'%3E%3Cpath d='M30,180 L30,120 L40,110 L50,120 L60,110 L70,120 L80,110 L90,120 L90,180 Z' fill='rgba(30,20,15,0.5)'/%3E%3Cpath d='M35,120 L35,80 L42,75 L50,80 L58,75 L65,80 L65,120 Z' fill='rgba(40,30,20,0.5)'/%3E%3Cpath d='M40,80 L40,50 L45,47 L50,50 L55,47 L60,50 L60,80 Z' fill='rgba(50,40,30,0.5)'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.4;
  filter: blur(1px);
  z-index: 2;
}

.decorative-tree {
  position: absolute;
  bottom: 15%;
  right: 15%;
  width: 80px;
  height: 150px;
  background: 
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 150'%3E%3Cpath d='M40,150 L40,100 M30,100 Q40,80 50,100 M20,90 Q40,70 60,90 M15,80 Q40,60 65,80' stroke='rgba(200,200,200,0.3)' stroke-width='2' fill='none'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.3;
  filter: blur(0.5px);
  z-index: 2;
}


/* 主要内容区域 */
.task-log-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 100px;
  min-height: calc(100vh - 150px);
}

/* 标题区域 */
.title-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.title-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 30px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 8px;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(5px);
}

.title-icon {
  font-size: 24px;
}

.title-text {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
}

/* 筛选区域 */
.filter-section {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.filter-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.filter-field {
  flex: 1;
}

.filter-label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 8px;
}

.filter-input-wrapper {
  position: relative;
}

.filter-input {
  width: 100%;
  padding: 10px 35px 10px 12px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.filter-input:focus {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.filter-select {
  appearance: none;
  cursor: pointer;
}

.filter-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  pointer-events: none;
}

.filter-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 6px;
  color: #ffd700;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

.filter-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.5) 0%, rgba(255, 140, 0, 0.5) 100%);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  transform: translateY(-2px);
}

/* 任务列表区域 */
.task-list-section {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
  min-height: 400px;
}

.task-list-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1.5fr 1fr 1fr;
  gap: 15px;
  padding: 15px;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.header-cell {
  text-align: center;
}

.header-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  margin: 10px 0;
}

.task-list-content {
  min-height: 300px;
  position: relative;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
}

.empty-icon {
	font-size: 48px;
	margin-bottom: 20px;
	opacity: 0.6;
}

.empty-text {
  text-align: center;
}

.task-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1.5fr 1fr 1fr;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
}

.task-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
}

.task-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 140, 0, 0.8) 100%);
  transition: width 0.3s;
}

.progress-text {
  position: relative;
  z-index: 1;
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.pending {
  background: rgba(255, 215, 0, 0.3);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.5);
}

.status-badge.completed {
  background: rgba(76, 175, 80, 0.3);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.status-badge.cancelled {
  background: rgba(158, 158, 158, 0.3);
  color: #9e9e9e;
  border: 1px solid rgba(158, 158, 158, 0.5);
}

.reward-cell {
  color: #ffd700;
  font-weight: bold;
}


/* 响应式设计 */
@media (max-width: 1200px) {
  .task-log-main-content {
    padding: 30px 20px;
  }

  .filter-row {
    flex-direction: column;
  }

  .task-list-header,
  .task-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .header-cell,
  .task-cell {
    text-align: left;
    padding: 5px 0;
  }
}
</style>

