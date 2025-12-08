<template>
  <div class="character-test-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
      <div class="temple-background"></div>
      <div class="forest-overlay"></div>
    </div>

    <!-- 顶部导航栏 -->
    <TopHeader @toggle-sidebar="toggleSidebar" @go-to-journey="handleGoToJourney" @go-to-deposit="handleGoToDeposit" />

    <!-- 主要内容区域 -->
    <main class="test-main-content">
      <!-- 测试列表页面 -->
      <div v-if="currentView === 'list'" class="list-panel">
        <div class="panel-header">
          <h2 class="panel-title">{{ t('characterTest.testList') }}</h2>
          <button class="new-test-btn" @click="showSettings">
            {{ t('characterTest.newTest') }}
          </button>
        </div>

        <!-- 筛选区域 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-field">
              <label class="filter-label" for="filter-student-name">{{ t('characterTest.studentName') }}</label>
              <input 
                id="filter-student-name"
                type="text" 
                v-model="filters.studentName" 
                class="filter-input"
                :placeholder="t('characterTest.enterStudentName')"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label" for="filter-start-date">{{ t('characterTest.startDate') }}</label>
              <input 
                id="filter-start-date"
                type="date" 
                v-model="filters.startDate" 
                class="filter-input"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label" for="filter-end-date">{{ t('characterTest.endDate') }}</label>
              <input 
                id="filter-end-date"
                type="date" 
                v-model="filters.endDate" 
                class="filter-input"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label" for="filter-min-mastery">{{ t('characterTest.minMasteryRate') }}</label>
              <input 
                id="filter-min-mastery"
                type="number" 
                v-model.number="filters.minMasteryRate" 
                class="filter-input"
                min="0"
                max="100"
                placeholder="0"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label" for="filter-max-mastery">{{ t('characterTest.maxMasteryRate') }}</label>
              <input 
                id="filter-max-mastery"
                type="number" 
                v-model.number="filters.maxMasteryRate" 
                class="filter-input"
                min="0"
                max="100"
                placeholder="100"
              />
            </div>
          </div>
          <div class="filter-actions">
            <button class="filter-btn search-btn" @click="applyFilters">
              {{ t('characterTest.search') }}
            </button>
            <button class="filter-btn reset-btn" @click="resetFilters">
              {{ t('characterTest.reset') }}
            </button>
          </div>
        </div>

        <div class="test-list">
          <div 
            v-for="(test, index) in testList" 
            :key="test.id"
            class="test-item"
          >
            <div class="test-item-header">
              <div class="test-item-name">{{ test.studentName }}</div>
              <div class="test-item-date">{{ formatTestDate(test.testDate) }}</div>
            </div>
            <div class="test-item-info">
              <span class="test-item-level">{{ getEducationLevelName(test.educationLevel) }}</span>
              <span class="test-item-count">{{ test.testCount }}{{ t('characterTest.characters') }}</span>
              <span class="test-item-mastery">{{ test.masteryRate }}%</span>
            </div>
            <!-- 测试统计数据 -->
            <!-- 测试统计数据 -->
            <div class="test-item-statistics">
              <div class="stat-row">
                <span class="stat-label">{{ t('characterTest.total') }}:</span>
                <span class="stat-value">{{ test.testCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">{{ t('characterTest.correct') }}:</span>
                <span class="stat-value correct">{{ test.correctCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">{{ t('characterTest.incorrect') }}:</span>
                <span class="stat-value incorrect">{{ test.incorrectCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">{{ t('characterTest.mastered') }}:</span>
                <span class="stat-value mastered">{{ test.masteredCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">{{ t('characterTest.masteryRate') }}:</span>
                <span class="stat-value">{{ test.masteryRate || 0 }}%</span>
              </div>
            </div>
            <div class="test-item-actions">
              <button class="item-action-btn view-btn" @click.stop="viewTest(test)">
                {{ t('characterTest.view') }}
              </button>
              <button class="item-action-btn edit-btn" @click.stop="loadTest(test)">
                {{ t('characterTest.edit') }}
              </button>
              <button class="item-action-btn delete-btn" @click.stop="deleteTest(test.id)">
                {{ t('characterTest.delete') }}
              </button>
            </div>
          </div>
          <div v-if="testList.length === 0 && !loading" class="empty-list">
            <p>{{ t('characterTest.noTestRecords') }}</p>
            <button class="new-test-btn" @click="showSettings">
              {{ t('characterTest.createFirstTest') }}
            </button>
          </div>
          <div v-if="loading" class="loading-state">
            <p>{{ t('characterTest.loading') }}</p>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-section">
          <div class="pagination-info">
            {{ t('characterTest.paginationInfo', { current: pageNum, total: totalPages, count: total }) }}
          </div>
          <div class="pagination-controls">
            <button 
              class="pagination-btn" 
              :disabled="pageNum <= 1"
              @click="goToPage(pageNum - 1)"
            >
              {{ t('characterTest.prevPage') }}
            </button>
            <div class="page-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="page-number-btn"
                :class="{ active: page === pageNum }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button 
              class="pagination-btn" 
              :disabled="pageNum >= totalPages"
              @click="goToPage(pageNum + 1)"
            >
              {{ t('characterTest.nextPage') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 设置页面 -->
      <div v-else-if="currentView === 'settings'" class="settings-panel">
        <div class="panel-header">
          <h2 class="panel-title">{{ t('characterTest.title') }}</h2>
          <p class="panel-subtitle">{{ t('characterTest.subtitle') }}</p>
        </div>

        <div class="settings-form">
          <!-- 姓名 -->
          <div class="form-group">
            <label class="form-label" for="studentName">{{ t('characterTest.studentName') }}</label>
            <input 
              id="studentName"
              type="text" 
              v-model="settings.studentName" 
              class="form-input"
              :placeholder="t('characterTest.enterStudentName')"
            />
          </div>

          <!-- 测试日期 -->
          <div class="form-group">
            <label class="form-label" for="testDate">{{ t('characterTest.testDate') }}</label>
            <input 
              id="testDate"
              type="date" 
              v-model="settings.testDate" 
              class="form-input"
            />
          </div>

          <!-- 教育阶段选择 -->
          <div class="form-group">
            <label class="form-label" for="educationLevel">{{ t('characterTest.educationLevel') }}</label>
            <div class="radio-group">
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="settings.educationLevel" 
                  value="primary"
                  class="radio-input"
                />
                <span class="radio-text">{{ t('characterTest.primarySchool') }}</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="settings.educationLevel" 
                  value="middle"
                  class="radio-input"
                />
                <span class="radio-text">{{ t('characterTest.middleSchool') }}</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="settings.educationLevel" 
                  value="high"
                  class="radio-input"
                />
                <span class="radio-text">{{ t('characterTest.highSchool') }}</span>
              </label>
            </div>
          </div>

          <!-- 年级选择 -->
          <div class="form-group" v-if="availableGrades.length">
            <label class="form-label" for="grade">年级</label>
            <select
              id="grade"
              v-model="settings.grade"
              class="form-input"
            >
              <option
                v-for="gradeOption in availableGrades"
                :key="gradeOption.value"
                :value="gradeOption.value"
              >
                {{ gradeOption.label }}
              </option>
            </select>
          </div>

          <!-- 测试字数 -->
          <div class="form-group">
            <label class="form-label" for="testCount">{{ t('characterTest.testCount') }}</label>
            <input 
              id="testCount"
              type="number" 
              v-model.number="settings.testCount" 
              class="form-input"
              :placeholder="t('characterTest.enterTestCount')"
              min="1"
              max="500"
            />
            <p class="form-hint">{{ t('characterTest.testCountHint') }}</p>
          </div>

          <!-- 显示拼音选项 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="settings.showPinyin" 
                class="checkbox-input"
              />
              <span class="checkbox-text">{{ t('characterTest.showPinyin') }}</span>
            </label>
          </div>

          <!-- 开始测试按钮 -->
          <div class="form-actions">
            <button class="cancel-btn" @click="backToList">
              {{ t('characterTest.cancel') }}
            </button>
            <button class="start-btn" @click="startTest" :disabled="!canStartTest">
              {{ t('characterTest.startTest') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 测试页面 -->
      <div v-else-if="currentView === 'test'" class="test-panel">
        <!-- 测试表头部 -->
        <div class="test-header">
          <h2 class="test-title">{{ t('characterTest.testFormTitle') }}</h2>
          <div class="test-info">
            <div class="info-item">
              <span class="info-label" id="test-student-name">{{ t('characterTest.studentName') }}:</span>
              <span class="info-value">{{ settings.studentName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('characterTest.mastered') }}:</span>
              <span class="info-value">{{ masteredCount }}{{ t('characterTest.characters') }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('characterTest.testDate') }}:</span>
              <span class="info-value">{{ formattedDate }}</span>
            </div>
          </div>
          <div class="test-actions">
            <button class="action-btn toggle-pinyin-btn" @click="togglePinyin" :disabled="isReadOnly">
              {{ settings.showPinyin ? t('characterTest.hidePinyin') : t('characterTest.showPinyin') }}
            </button>
          <button class="action-btn export-btn" @click="exportToPDF">
            导出PDF
          </button>
            <button v-if="!isReadOnly" class="action-btn save-btn" @click="saveTest">
              {{ t('characterTest.save') }}
            </button>
            <button class="action-btn back-btn" @click="backToTestList">
              {{ t('characterTest.back') }}
            </button>
            <button v-if="!isReadOnly" class="action-btn reset-btn" @click="resetTest">
              {{ t('characterTest.resetTest') }}
            </button>
            <div v-if="isReadOnly" class="read-only-badge">
              {{ t('characterTest.readOnlyMode') }}
            </div>
          </div>
        </div>

        <!-- 测试表内容 -->
        <div class="test-content">
          <div class="characters-grid">
            <div 
              v-for="(char, index) in testCharacters" 
              :key="index"
              class="character-item"
              :class="{ 
                'correct': char.status === 'correct',
                'incorrect': char.status === 'incorrect'
              }"
            >
              <div class="character-wrapper">
                <div v-if="settings.showPinyin" class="character-pinyin">
                  {{ char.pinyin }}
                </div>
                <div 
                  class="character-text" 
                  :class="{ 'read-only': isReadOnly }"
                  @click="!isReadOnly && toggleCharacterStatus(char)"
                >
                  {{ char.character }}
                </div>
                <div class="character-status">
                  <span 
                    v-if="char.status === 'correct'" 
                    class="status-icon correct-icon"
                    :class="{ 'read-only': isReadOnly }"
                    @click.stop="!isReadOnly && toggleCharacterStatus(char)"
                  >✓</span>
                  <span 
                    v-if="char.status === 'incorrect'" 
                    class="status-icon incorrect-icon"
                    :class="{ 'read-only': isReadOnly }"
                    @click.stop="!isReadOnly && toggleCharacterStatus(char)"
                  >✗</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 测试统计 -->
        <div class="test-statistics-wrapper">
          <div class="test-statistics">
            <div class="stat-item">
              <span class="stat-label">{{ t('characterTest.total') }}:</span>
              <span class="stat-value">{{ testCharacters.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('characterTest.correct') }}:</span>
              <span class="stat-value correct">{{ correctCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('characterTest.incorrect') }}:</span>
              <span class="stat-value incorrect">{{ incorrectCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('characterTest.mastered') }}:</span>
              <span class="stat-value mastered">{{ masteredCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('characterTest.masteryRate') }}:</span>
              <span class="stat-value">{{ masteryRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="character-test"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { useRouter } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'
import { getTestCharacters, saveTestRecord, getAllTestRecords, deleteTestRecord, getTestRecordsPage } from '../../api/characterTest.js'
import { showError, showSuccess, showConfirm } from '../../utils/alert.js'
import html2pdf from 'html2pdf.js'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)
const currentView = ref('list') // 'list' | 'settings' | 'test'
const testCharacters = ref([])
const testList = ref([])
const currentTestId = ref(null)
const isReadOnly = ref(false) // 只读模式标志

// 分页相关
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const loading = ref(false)

// 筛选条件
const filters = reactive({
  studentName: '',
  startDate: '',
  endDate: '',
  minMasteryRate: null,
  maxMasteryRate: null
})

const settings = reactive({
  studentName: '',
  testDate: new Date().toISOString().split('T')[0],
  educationLevel: 'primary',
  grade: 'primary-1',
  testCount: 50,
  showPinyin: false
})

const gradeOptions = [
  { value: 'primary-1', label: '小学一年级' },
  { value: 'primary-2', label: '小学二年级' },
  { value: 'primary-3', label: '小学三年级' },
  { value: 'primary-4', label: '小学四年级' },
  { value: 'primary-5', label: '小学五年级' },
  { value: 'primary-6', label: '小学六年级' }
]

const availableGrades = computed(() => {
  return settings.educationLevel === 'primary' ? gradeOptions : []
})

// 计算属性
const canStartTest = computed(() => {
  return settings.studentName.trim() && 
         settings.testCount > 0 && 
         settings.testCount <= 500 &&
         settings.educationLevel &&
         (availableGrades.value.length === 0 || !!settings.grade)
})

watch(() => settings.educationLevel, (level) => {
  if (level !== 'primary') {
    settings.grade = ''
  } else if (!settings.grade) {
    settings.grade = 'primary-1'
  }
})

const formattedDate = computed(() => {
  if (!settings.testDate) return ''
  const date = new Date(settings.testDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
})

const correctCount = computed(() => {
  return testCharacters.value.filter(c => c.status === 'correct').length
})

const incorrectCount = computed(() => {
  return testCharacters.value.filter(c => c.status === 'incorrect').length
})

const masteredCount = computed(() => {
  return correctCount.value
})

const masteryRate = computed(() => {
  if (testCharacters.value.length === 0) return 0
  return Math.round((masteredCount.value / testCharacters.value.length) * 100)
})

// 方法
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  toggleSidebar()
}

const handleGoToJourney = () => {
  router.goToJourney()
}

const handleGoToDeposit = () => {
  router.goToDeposit()
}

// 计算可见页码
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pageNum.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 加载测试列表（分页）
const loadTestList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    
    // 添加筛选条件
    if (filters.studentName) {
      params.studentName = filters.studentName
    }
    if (filters.startDate) {
      params.startDate = filters.startDate
    }
    if (filters.endDate) {
      params.endDate = filters.endDate
    }
    if (filters.minMasteryRate !== null && filters.minMasteryRate !== '') {
      params.minMasteryRate = filters.minMasteryRate
    }
    if (filters.maxMasteryRate !== null && filters.maxMasteryRate !== '') {
      params.maxMasteryRate = filters.maxMasteryRate
    }
    
    const response = await getTestRecordsPage(params)
    if (response.code === 200 && response.data) {
      const data = response.data
      // 处理分页数据
      if (data.records) {
        testList.value = data.records.map(record => ({
          id: record.id,
          studentName: record.studentName,
          testDate: record.testDate ? new Date(record.testDate).toISOString().split('T')[0] : '',
          educationLevel: record.educationLevel,
          testCount: record.testCount,
          showPinyin: record.showPinyin || false,
          characters: record.characters || [],
          correctCount: record.correctCount || 0,
          incorrectCount: record.incorrectCount || 0,
          masteredCount: record.masteredCount || 0,
          masteryRate: record.masteryRate || 0,
          createdAt: record.createTime,
          updatedAt: record.updateTime
        }))
        total.value = data.total || 0
        totalPages.value = data.pages || Math.ceil(total.value / pageSize.value)
      } else {
        // 兼容旧格式（无分页）
        testList.value = Array.isArray(data) ? data.map(record => ({
          id: record.id,
          studentName: record.studentName,
          testDate: record.testDate ? new Date(record.testDate).toISOString().split('T')[0] : '',
          educationLevel: record.educationLevel,
          testCount: record.testCount,
          showPinyin: record.showPinyin || false,
          characters: record.characters || [],
          correctCount: record.correctCount || 0,
          incorrectCount: record.incorrectCount || 0,
          masteredCount: record.masteredCount || 0,
          masteryRate: record.masteryRate || 0,
          createdAt: record.createTime,
          updatedAt: record.updateTime
        })) : []
        total.value = testList.value.length
        totalPages.value = 1
      }
    } else {
      testList.value = []
      total.value = 0
      totalPages.value = 0
    }
  } catch (error) {
    console.error('加载测试列表失败:', error)
    // 如果分页API失败，尝试使用旧API
    try {
      const response = await getAllTestRecords()
      if (response.code === 200 && response.data) {
        testList.value = response.data.map(record => ({
          id: record.id,
          studentName: record.studentName,
          testDate: record.testDate ? new Date(record.testDate).toISOString().split('T')[0] : '',
          educationLevel: record.educationLevel,
          testCount: record.testCount,
          showPinyin: record.showPinyin || false,
          characters: record.characters || [],
          correctCount: record.correctCount || 0,
          incorrectCount: record.incorrectCount || 0,
          masteredCount: record.masteredCount || 0,
          masteryRate: record.masteryRate || 0,
          createdAt: record.createTime,
          updatedAt: record.updateTime
        }))
        total.value = testList.value.length
        totalPages.value = 1
      } else {
        testList.value = []
        total.value = 0
        totalPages.value = 0
      }
    } catch (fallbackError) {
      console.error('使用旧API也失败:', fallbackError)
      testList.value = []
      total.value = 0
      totalPages.value = 0
    }
  } finally {
    loading.value = false
  }
}

// 应用筛选
const applyFilters = () => {
  pageNum.value = 1 // 重置到第一页
  loadTestList()
}

// 重置筛选
const resetFilters = () => {
  filters.studentName = ''
  filters.startDate = ''
  filters.endDate = ''
  filters.minMasteryRate = null
  filters.maxMasteryRate = null
  pageNum.value = 1
  loadTestList()
}

// 跳转到指定页
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    pageNum.value = page
    loadTestList()
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 显示设置页面
const showSettings = () => {
  currentView.value = 'settings'
  // 重置设置
  settings.studentName = ''
  settings.testDate = new Date().toISOString().split('T')[0]
  settings.educationLevel = 'primary'
  settings.grade = 'primary-1'
  settings.testCount = 50
  settings.showPinyin = false
  currentTestId.value = null
  isReadOnly.value = false
}

// 返回列表
const backToList = () => {
  currentView.value = 'list'
  testCharacters.value = []
  currentTestId.value = null
  isReadOnly.value = false
}

// 返回测试列表（从测试页面）
const backToTestList = () => {
  backToList()
}

// 获取教育阶段名称
const getEducationLevelName = (level) => {
  const names = {
    'primary': t('characterTest.primarySchool'),
    'middle': t('characterTest.middleSchool'),
    'high': t('characterTest.highSchool')
  }
  return names[level] || level
}

// 格式化测试日期
const formatTestDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startTest = async () => {
  try {
    // 调用 API 获取测试汉字
    const response = await getTestCharacters(
      settings.educationLevel,
      settings.grade,
      settings.testCount
    )
    
    if (response.code === 200 && response.data) {
      // 初始化测试字符，添加状态字段
      testCharacters.value = response.data.map(char => ({
        ...char,
        grade: char.grade || settings.grade,
        status: null // null: 未标记, 'correct': 正确, 'incorrect': 错误
      }))
      currentView.value = 'test'
      currentTestId.value = null // 新测试
      isReadOnly.value = false // 新测试不是只读模式
    } else {
      await showError(response.msg || t('characterTest.loadFailed'))
    }
  } catch (error) {
    console.error('加载测试字符失败:', error)
    await showError(error.message || t('characterTest.loadFailed'))
  }
}

// 保存测试
const saveTest = async () => {
  if (!settings.studentName.trim()) {
    await showError(t('characterTest.pleaseEnterStudentName'))
    return
  }

  try {
    const testRecord = {
      id: currentTestId.value || null,
      studentName: settings.studentName,
      testDate: settings.testDate,
      educationLevel: settings.educationLevel,
      testCount: testCharacters.value.length,
      showPinyin: settings.showPinyin,
      characters: testCharacters.value.map(char => ({
        character: char.character,
        pinyin: char.pinyin,
        grade: char.grade,
        status: char.status
      })),
      correctCount: correctCount.value,
      incorrectCount: incorrectCount.value,
      masteredCount: masteredCount.value,
      masteryRate: masteryRate.value
    }

    const response = await saveTestRecord(testRecord)
    if (response.code === 200) {
      await showSuccess(t('characterTest.saveSuccess'))
      await loadTestList() // 重新加载列表
      // 不自动返回，让用户选择
    } else {
      await showError(response.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存测试记录失败:', error)
    await showError(error.message || '保存失败')
  }
}

// 加载测试
const loadTest = (test, readOnly = false) => {
  currentTestId.value = test.id
  settings.studentName = test.studentName
  settings.testDate = test.testDate
  settings.educationLevel = test.educationLevel
  const existingGrade = (test.characters || []).find(item => item.grade)?.grade
  settings.grade = test.grade || existingGrade || (test.educationLevel === 'primary' ? 'primary-1' : '')
  settings.testCount = test.testCount
  settings.showPinyin = test.showPinyin || false
  isReadOnly.value = readOnly
  
  // 转换字符数据格式
  testCharacters.value = (test.characters || []).map(char => ({
    character: char.character,
    pinyin: char.pinyin,
    grade: char.grade || existingGrade || settings.grade,
    status: char.status || null
  }))
  
  currentView.value = 'test'
}

// 查看测试（只读模式）
const viewTest = (test) => {
  loadTest(test, true) // 设置为只读模式
}

// 删除测试
const deleteTest = async (id) => {
  const confirmed = await showConfirm(t('characterTest.confirmDelete'))
  if (confirmed) {
    try {
      const response = await deleteTestRecord(id)
      if (response.code === 200) {
        await loadTestList() // 重新加载列表
      } else {
        await showError(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除测试记录失败:', error)
      await showError(error.message || '删除失败')
    }
  }
}

const toggleCharacterStatus = (char) => {
  if (!char.status) {
    char.status = 'correct'
  } else if (char.status === 'correct') {
    char.status = 'incorrect'
  } else {
    char.status = null
  }
}

const togglePinyin = () => {
  settings.showPinyin = !settings.showPinyin
}

const exportToPDF = async () => {
  if (!testCharacters.value.length) {
    await showError('没有可导出的测试内容')
    return
  }

  try {
    const exportContainer = document.createElement('div')
    exportContainer.style.width = '210mm'
    exportContainer.style.padding = '12mm 14mm'
    exportContainer.style.backgroundColor = '#ffffff'
    exportContainer.style.color = '#000000'
    exportContainer.style.fontFamily = 'Microsoft YaHei, SimHei, Arial, sans-serif'

    const title = document.createElement('div')
    title.style.fontSize = '22px'
    title.style.fontWeight = '700'
    title.style.marginBottom = '10px'
    title.textContent = `汉字测试 - ${settings.studentName || ''} ${formatTestDate(settings.testDate)}`
    exportContainer.appendChild(title)

    const grid = document.createElement('div')
    grid.style.display = 'grid'
    grid.style.gridTemplateColumns = 'repeat(6, 1fr)'
    grid.style.gap = '10px'

    testCharacters.value.forEach((charItem) => {
      const cell = document.createElement('div')
      cell.style.border = '1px solid #999'
      cell.style.borderRadius = '6px'
      cell.style.padding = '8px'
      cell.style.textAlign = 'center'
      cell.style.height = '70px'
      cell.style.display = 'flex'
      cell.style.flexDirection = 'column'
      cell.style.justifyContent = 'center'
      cell.style.gap = '6px'

      const pinyinEl = document.createElement('div')
      pinyinEl.style.fontSize = '14px'
      pinyinEl.style.color = '#333'
      pinyinEl.textContent = charItem.pinyin || ''

      const charEl = document.createElement('div')
      charEl.style.fontSize = '28px'
      charEl.style.fontWeight = '700'
      charEl.style.color = '#000'
      charEl.textContent = charItem.character

      cell.appendChild(pinyinEl)
      cell.appendChild(charEl)
      grid.appendChild(cell)
    })

    exportContainer.appendChild(grid)

    const wrapper = document.createElement('div')
    wrapper.style.position = 'fixed'
    wrapper.style.left = '0'
    wrapper.style.top = '0'
    wrapper.style.opacity = '0'
    wrapper.style.pointerEvents = 'none'
    wrapper.style.zIndex = '-1'
    wrapper.style.visibility = 'visible'
    wrapper.appendChild(exportContainer)
    document.body.appendChild(wrapper)

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `汉字测试_${settings.studentName || '未命名'}_${settings.testDate || '未设定'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: exportContainer.scrollWidth || 794,
        height: exportContainer.scrollHeight || 1123,
        windowWidth: exportContainer.scrollWidth || 794
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    }

    await html2pdf().set(opt).from(exportContainer).save()
    document.body.removeChild(wrapper)
  } catch (error) {
    console.error('导出PDF失败:', error)
    await showError('导出PDF失败: ' + (error.message || '未知错误'))
  }
}

const resetTest = async () => {
  const confirmed = await showConfirm(t('characterTest.confirmReset'))
  if (confirmed) {
    testCharacters.value = []
    currentView.value = 'list'
    currentTestId.value = null
  }
}

// 监听测试字符变化，自动保存（可选）
watch(() => testCharacters.value, () => {
  // 可以在这里实现自动保存功能
}, { deep: true })

onMounted(() => {
  loadTestList()
})
</script>

<style scoped>
.character-test-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层 - 复用首页样式 */
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
  height: 300px;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 300'%3E%3Cpath d='M0,300 L200,200 L400,250 L600,180 L800,220 L1000,150 L1200,200 L1200,300 Z' fill='rgba(20,15,10,0.4)'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.7;
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

/* 主要内容区域 */
.test-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  padding-top: 100px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 设置面板 */
.settings-panel {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.panel-header {
  text-align: center;
  margin-bottom: 30px;
}

.panel-title {
  font-size: 28px;
  color: #ffd700;
  margin: 0 0 10px 0;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.panel-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #ffd700;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

.form-input {
  padding: 14px 18px;
  background: rgba(50, 50, 50, 0.8);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  color: white;
  font-size: 15px;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.radio-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.radio-text {
  color: white;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  color: white;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.cancel-btn {
  flex: 1;
  padding: 16px 32px;
  background: rgba(100, 100, 100, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: rgba(100, 100, 100, 0.7);
  border-color: rgba(255, 255, 255, 0.5);
}

.start-btn {
  flex: 1;
  padding: 16px 32px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  border: 2px solid rgba(255, 215, 0, 1);
  border-radius: 8px;
  color: #1a0a2e;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 140, 0, 0.4);
  margin-top: 10px;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.8),
    0 6px 20px rgba(255, 140, 0, 0.6);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 测试列表面板 */
.list-panel {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.list-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.filter-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 150px;
}

.filter-label {
  color: #ffd700;
  font-size: 12px;
  font-weight: bold;
}

.filter-input {
  padding: 10px 12px;
  background: rgba(50, 50, 50, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  transition: all 0.3s;
}

.filter-input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.filter-btn {
  padding: 10px 20px;
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
}

.search-btn:hover {
  background: rgba(255, 215, 0, 0.4);
}

.filter-btn.reset-btn {
  background: rgba(100, 100, 100, 0.3);
  color: white;
}

.filter-btn.reset-btn:hover {
  background: rgba(100, 100, 100, 0.5);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
}

.new-test-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  border: 2px solid rgba(255, 215, 0, 1);
  border-radius: 8px;
  color: #1a0a2e;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 140, 0, 0.4);
}

.new-test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.8),
    0 6px 20px rgba(255, 140, 0, 0.6);
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
}

.test-item {
  background: rgba(50, 50, 50, 0.6);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
  cursor: pointer;
}

.test-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.6);
  transform: translateX(5px);
}

.test-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.test-item-name {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
}

.test-item-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.test-item-info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.test-item-statistics {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-size: 13px;
}

.stat-row {
  display: flex;
  gap: 5px;
  align-items: center;
}

.stat-row .stat-label {
  color: rgba(255, 255, 255, 0.7);
}

.stat-row .stat-value {
  color: #ffd700;
  font-weight: bold;
}

.stat-row .stat-value.correct {
  color: #4caf50;
}

.stat-row .stat-value.incorrect {
  color: #f44336;
}

.stat-row .stat-value.mastered {
  color: #ffd700;
}

.test-item-level {
  color: #ffd700;
}

.test-item-count {
  color: rgba(255, 255, 255, 0.7);
}

.test-item-mastery {
  color: #4caf50;
  font-weight: bold;
}

.test-item-actions {
  display: flex;
  gap: 10px;
}

.item-action-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
  color: #4caf50;
}

.view-btn:hover {
  background: rgba(76, 175, 80, 0.4);
}

.delete-btn {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.5);
  color: #f44336;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.4);
}

.edit-btn {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
  color: #ffd700;
}

.edit-btn:hover {
  background: rgba(255, 215, 0, 0.4);
}

.read-only-badge {
  padding: 8px 16px;
  background: rgba(100, 100, 100, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: bold;
}

.empty-list {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-list p {
  margin-bottom: 20px;
  font-size: 16px;
}

.action-btn.save-btn {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
  color: #4caf50;
}

.action-btn.save-btn:hover {
  background: rgba(76, 175, 80, 0.4);
}

.action-btn.back-btn {
  background: rgba(100, 100, 100, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.action-btn.export-btn {
  background: rgba(33, 150, 243, 0.2);
  border-color: rgba(33, 150, 243, 0.5);
  color: #2196f3;
}

.action-btn.export-btn:hover {
  background: rgba(33, 150, 243, 0.4);
}

.action-btn.back-btn:hover {
  background: rgba(100, 100, 100, 0.4);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 测试面板 */
.test-panel {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.test-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
}

.test-title {
  font-size: 24px;
  color: #ffd700;
  margin: 0 0 20px 0;
  text-align: center;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.test-info {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.info-value {
  color: #ffd700;
  font-size: 14px;
  font-weight: bold;
}

.test-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 10px 20px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
}

.test-content {
  margin-bottom: 30px;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.character-item {
  background: rgba(50, 50, 50, 0.6);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s;
  cursor: pointer;
}

.character-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.character-item.read-only:hover {
  transform: none;
  cursor: default;
}

.character-item.correct {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.6);
}

.character-item.incorrect {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.6);
}

.character-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.character-text {
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  user-select: none;
  transition: all 0.3s;
}

.character-text.read-only {
  cursor: default;
  opacity: 0.8;
}

.character-text:not(.read-only):hover {
  transform: scale(1.1);
}

.character-pinyin {
  font-size: 14px;
  color: rgba(255, 215, 0, 0.8);
  font-style: italic;
}

.character-status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

.status-icon {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
}

.status-icon.read-only {
  cursor: default;
  opacity: 0.8;
}

.status-icon:not(.read-only):hover {
  transform: scale(1.2);
}

.correct-icon {
  color: #4caf50;
}

.incorrect-icon {
  color: #f44336;
}

.status-placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.test-statistics-wrapper {
  margin-top: 30px;
  padding-bottom: 20px;
}

.test-statistics {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  min-height: 80px;
  align-items: center;
}

.stat-item {
  display: flex;
  gap: 8px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.stat-value {
  color: #ffd700;
  font-size: 16px;
  font-weight: bold;
}

.stat-value.correct {
  color: #4caf50;
}

.stat-value.incorrect {
  color: #f44336;
}

.stat-value.mastered {
  color: #ffd700;
}

/* 自定义滚动条 */
.characters-grid::-webkit-scrollbar {
  width: 10px;
}

.characters-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
}

.characters-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.5);
  border-radius: 5px;
}

.characters-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.7);
}

/* 分页样式 */
.pagination-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.pagination-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-btn {
  padding: 8px 16px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.4);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number-btn {
  padding: 8px 12px;
  background: rgba(50, 50, 50, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 36px;
}

.page-number-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
}

.page-number-btn.active {
  background: rgba(255, 215, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.8);
  color: #ffd700;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-main-content {
    padding: 20px 15px;
    padding-top: 100px;
  }

  .settings-panel {
    padding: 20px;
  }

  .characters-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
  }

  .character-text {
    font-size: 24px;
  }

  .test-info {
    flex-direction: column;
    gap: 10px;
  }

  .test-statistics {
    flex-direction: column;
    gap: 15px;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-field {
    min-width: 100%;
  }

  .test-item-statistics {
    flex-direction: column;
    gap: 8px;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .page-numbers {
    flex-wrap: wrap;
  }
}
</style>

