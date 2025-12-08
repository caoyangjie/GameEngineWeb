<template>
  <div class="math-test-container">
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
          <h2 class="panel-title">数学测试列表</h2>
          <button class="new-test-btn" @click="showSettings">
            新建测试
          </button>
        </div>

        <!-- 筛选区域 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-field">
              <label class="filter-label" for="filter-student-name">学生姓名</label>
              <input 
                id="filter-student-name"
                type="text" 
                v-model="filters.studentName" 
                class="filter-input"
                placeholder="请输入学生姓名"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label" for="filter-start-date">开始日期</label>
              <input 
                id="filter-start-date"
                type="date" 
                v-model="filters.startDate" 
                class="filter-input"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label" for="filter-end-date">结束日期</label>
              <input 
                id="filter-end-date"
                type="date" 
                v-model="filters.endDate" 
                class="filter-input"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label" for="filter-min-accuracy">最小正确率</label>
              <input 
                id="filter-min-accuracy"
                type="number" 
                v-model.number="filters.minAccuracyRate" 
                class="filter-input"
                min="0"
                max="100"
                placeholder="0"
              />
            </div>
            <div class="filter-field">
              <label class="filter-label" for="filter-max-accuracy">最大正确率</label>
              <input 
                id="filter-max-accuracy"
                type="number" 
                v-model.number="filters.maxAccuracyRate" 
                class="filter-input"
                min="0"
                max="100"
                placeholder="100"
              />
            </div>
          </div>
          <div class="filter-actions">
            <button class="filter-btn search-btn" @click="applyFilters">
              搜索
            </button>
            <button class="filter-btn reset-btn" @click="resetFilters">
              重置
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
              <span class="test-item-count">{{ test.testCount }}题</span>
              <span class="test-item-accuracy">{{ test.accuracyRate }}%</span>
            </div>
            <!-- 测试统计数据 -->
            <div class="test-item-statistics">
              <div class="stat-row">
                <span class="stat-label">总数:</span>
                <span class="stat-value">{{ test.testCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">正确:</span>
                <span class="stat-value correct">{{ test.correctCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">错误:</span>
                <span class="stat-value incorrect">{{ test.incorrectCount || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">正确率:</span>
                <span class="stat-value">{{ test.accuracyRate || 0 }}%</span>
              </div>
            </div>
            <div class="test-item-actions">
              <button class="item-action-btn view-btn" @click.stop="viewTest(test)">
                查看
              </button>
              <button class="item-action-btn edit-btn" @click.stop="loadTest(test)">
                编辑
              </button>
              <button class="item-action-btn delete-btn" @click.stop="deleteTest(test.id)">
                删除
              </button>
            </div>
          </div>
          <div v-if="testList.length === 0 && !loading" class="empty-list">
            <p>暂无测试记录</p>
            <button class="new-test-btn" @click="showSettings">
              创建第一个测试
            </button>
          </div>
          <div v-if="loading" class="loading-state">
            <p>加载中...</p>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-section">
          <div class="pagination-info">
            第 {{ pageNum }} 页，共 {{ totalPages }} 页，共 {{ total }} 条记录
          </div>
          <div class="pagination-controls">
            <button 
              class="pagination-btn" 
              :disabled="pageNum <= 1"
              @click="goToPage(pageNum - 1)"
            >
              上一页
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
              下一页
            </button>
          </div>
        </div>
      </div>

      <!-- 设置页面 -->
      <div v-else-if="currentView === 'settings'" class="settings-panel">
        <div class="panel-header">
          <h2 class="panel-title">数学测试设置</h2>
          <p class="panel-subtitle">请选择测试参数</p>
        </div>

        <div class="settings-form">
          <!-- 姓名 -->
          <div class="form-group">
            <label class="form-label" for="studentName">学生姓名</label>
            <input 
              id="studentName"
              type="text" 
              v-model="settings.studentName" 
              class="form-input"
              placeholder="请输入学生姓名"
            />
          </div>

          <!-- 测试日期 -->
          <div class="form-group">
            <label class="form-label" for="testDate">测试日期</label>
            <input 
              id="testDate"
              type="date" 
              v-model="settings.testDate" 
              class="form-input"
            />
          </div>

          <!-- 计算类型选择 -->
          <div class="form-group">
            <label class="form-label">计算类型</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="settings.operationTypes" 
                  value="+"
                  class="checkbox-input"
                />
                <span class="checkbox-text">加法 (+)</span>
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="settings.operationTypes" 
                  value="-"
                  class="checkbox-input"
                />
                <span class="checkbox-text">减法 (-)</span>
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="settings.operationTypes" 
                  value="*"
                  class="checkbox-input"
                />
                <span class="checkbox-text">乘法 (×)</span>
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="settings.operationTypes" 
                  value="/"
                  class="checkbox-input"
                />
                <span class="checkbox-text">除法 (÷)</span>
              </label>
            </div>
            <p class="form-hint">至少选择一种计算类型</p>
          </div>

          <!-- 题目数量 -->
          <div class="form-group">
            <label class="form-label" for="testCount">题目数量</label>
            <input 
              id="testCount"
              type="number" 
              v-model.number="settings.testCount" 
              class="form-input"
              placeholder="请输入题目数量"
              min="1"
              max="100"
            />
            <p class="form-hint">建议10-50题</p>
          </div>

          <!-- 测试时长（分钟） -->
          <div class="form-group">
            <label class="form-label" for="durationMinutes">测试时长（分钟）</label>
            <input 
              id="durationMinutes"
              type="number" 
              v-model.number="settings.durationMinutes" 
              class="form-input"
              placeholder="请输入测试时长"
              min="1"
              max="180"
            />
            <p class="form-hint">时间到将自动提交当前测试</p>
          </div>

          <!-- 数字范围 -->
          <div class="form-group">
            <label class="form-label">数字范围</label>
            <div class="number-range-group">
              <input 
                type="number" 
                v-model.number="settings.minNumber" 
                class="form-input range-input"
                placeholder="最小值"
                min="0"
              />
              <span class="range-separator">至</span>
              <input 
                type="number" 
                v-model.number="settings.maxNumber" 
                class="form-input range-input"
                placeholder="最大值"
                min="1"
              />
            </div>
            <p class="form-hint">例如：0 至 100</p>
          </div>

          <!-- 开始测试按钮 -->
          <div class="form-actions">
            <button class="cancel-btn" @click="backToList">
              取消
            </button>
            <button class="start-btn" @click="startTest" :disabled="!canStartTest">
              开始测试
            </button>
          </div>
        </div>
      </div>

      <!-- 测试页面 -->
      <div v-else-if="currentView === 'test'" class="test-panel">
        <!-- 测试表头部 -->
        <div class="test-header">
          <div class="test-header-top">
            <h2 class="test-title">数学测试</h2>
            <div class="countdown-badge" v-if="isTimerActive">
              <span class="countdown-icon">⏳</span>
              <span class="countdown-label">倒计时</span>
              <span class="countdown-time">{{ countdownDisplay }}</span>
            </div>
          </div>
          <div class="test-info">
            <div class="info-item">
              <span class="info-label">学生姓名:</span>
              <span class="info-value">{{ settings.studentName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">测试日期:</span>
              <span class="info-value">{{ formattedDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">正确率:</span>
              <span class="info-value">{{ accuracyRate }}%</span>
            </div>
          </div>
          <div class="test-actions">
            <button v-if="!isReadOnly" class="action-btn save-btn" @click="saveTest">
              提交
            </button>
            <button class="action-btn export-btn" @click="exportToPDF">
              导出PDF
            </button>
            <button class="action-btn back-btn" @click="backToTestList">
              返回
            </button>
            <div v-if="isReadOnly" class="read-only-badge">
              只读模式
            </div>
          </div>
        </div>

        <!-- 测试表内容 -->
        <div class="test-content">
          <div class="questions-grid">
            <div 
              v-for="(question, index) in testQuestions" 
              :key="index"
              class="question-item"
              :class="{ 
                'correct': question.isCorrect === true,
                'incorrect': question.isCorrect === false
              }"
            >
              <div class="question-wrapper">
                <div class="question-number">第 {{ index + 1 }} 题</div>
                <div class="question-formula-row">
                  <div class="question-formula">
                    {{ question.num1 }} {{ getOperatorSymbol(question.operator) }} {{ question.num2 }} = 
                  </div>
                  <input 
                    type="input" 
                    v-model.number="question.studentAnswer" 
                    class="answer-input"
                    :disabled="isReadOnly"
                    :placeholder="isReadOnly ? question.correctAnswer : '输入答案'"
                  />
                </div>
                <div v-if="isReadOnly && question.isCorrect !== null" class="answer-status">
                  <span v-if="question.isCorrect" class="status-icon correct-icon">✓</span>
                  <span v-else class="status-icon incorrect-icon">✗ (正确答案: {{ question.correctAnswer }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 测试统计 -->
        <div class="test-statistics-wrapper">
          <div class="test-statistics">
            <div class="stat-item">
              <span class="stat-label">总数:</span>
              <span class="stat-value">{{ testQuestions.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">正确:</span>
              <span class="stat-value correct">{{ correctCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">错误:</span>
              <span class="stat-value incorrect">{{ incorrectCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">正确率:</span>
              <span class="stat-value">{{ accuracyRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="math-test"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { useRouter } from '../../composables/useRouter.js'
import { generateQuestions, saveTestRecord, deleteTestRecord, getTestRecordsPage } from '../../api/mathTest.js'
import { showError, showSuccess, showConfirm } from '../../utils/alert.js'
import html2pdf from 'html2pdf.js'

const router = useRouter()

const sidebarOpen = ref(false)
const currentView = ref('list') // 'list' | 'settings' | 'test'
const testQuestions = ref([])
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
  minAccuracyRate: null,
  maxAccuracyRate: null
})

const settings = reactive({
  studentName: '',
  testDate: new Date().toISOString().split('T')[0],
  operationTypes: ['+'], // 默认选择加法
  testCount: 20,
  minNumber: 0,
  maxNumber: 100,
  durationMinutes: 10
})

const countdownSeconds = ref(0)
const countdownTimer = ref(null)
const isTimerActive = ref(false)

// 计算属性
const canStartTest = computed(() => {
  return settings.studentName.trim() && 
         settings.testCount > 0 && 
         settings.testCount <= 100 &&
         settings.operationTypes.length > 0 &&
         settings.minNumber >= 0 &&
         settings.maxNumber > settings.minNumber &&
         settings.durationMinutes > 0
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
  if (!testQuestions.value || testQuestions.value.length === 0) return 0
  return testQuestions.value.filter(q => {
    if (q.studentAnswer === null || q.studentAnswer === undefined) return false
    return q.studentAnswer === q.correctAnswer
  }).length
})

const incorrectCount = computed(() => {
  if (!testQuestions.value || testQuestions.value.length === 0) return 0
  return testQuestions.value.filter(q => {
    if (q.studentAnswer === null || q.studentAnswer === undefined) return false
    return q.studentAnswer !== q.correctAnswer
  }).length
})

const accuracyRate = computed(() => {
  if (testQuestions.value.length === 0) return 0
  const answeredCount = testQuestions.value.filter(q => 
    q.studentAnswer !== null && q.studentAnswer !== undefined
  ).length
  if (answeredCount === 0) return 0
  return Math.round((correctCount.value / answeredCount) * 100)
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
    if (filters.minAccuracyRate !== null && filters.minAccuracyRate !== '') {
      params.minAccuracyRate = filters.minAccuracyRate
    }
    if (filters.maxAccuracyRate !== null && filters.maxAccuracyRate !== '') {
      params.maxAccuracyRate = filters.maxAccuracyRate
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
          testCount: record.testCount,
          operationTypes: record.operationTypes || [],
          minNumber: record.minNumber,
          maxNumber: record.maxNumber,
          durationMinutes: record.durationMinutes || record.testDuration || 10,
          questions: record.questions || [],
          correctCount: record.correctCount || 0,
          incorrectCount: record.incorrectCount || 0,
          accuracyRate: record.accuracyRate || 0,
          createdAt: record.createTime,
          updatedAt: record.updateTime
        }))
        total.value = data.total || 0
        totalPages.value = data.pages || Math.ceil(total.value / pageSize.value)
      } else {
        testList.value = []
        total.value = 0
        totalPages.value = 0
      }
    } else {
      testList.value = []
      total.value = 0
      totalPages.value = 0
    }
  } catch (error) {
    console.error('加载测试列表失败:', error)
    testList.value = []
    total.value = 0
    totalPages.value = 0
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
  filters.minAccuracyRate = null
  filters.maxAccuracyRate = null
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
  settings.operationTypes = ['+']
  settings.testCount = 20
  settings.minNumber = 0
  settings.maxNumber = 100
  currentTestId.value = null
  isReadOnly.value = false
  settings.durationMinutes = 10
  clearCountdown()
}

// 返回列表
const backToList = () => {
  currentView.value = 'list'
  testQuestions.value = []
  currentTestId.value = null
  isReadOnly.value = false
  clearCountdown()
}

// 返回测试列表（从测试页面）
const backToTestList = () => {
  backToList()
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

// 获取运算符符号
const getOperatorSymbol = (operator) => {
  const symbols = {
    '+': '+',
    '-': '-',
    '*': '×',
    '/': '÷'
  }
  return symbols[operator] || operator
}

const startTest = async () => {
  try {
    // 调用 API 生成测试题目
    const operationTypesStr = settings.operationTypes.join(',')
    const response = await generateQuestions(
      operationTypesStr,
      settings.testCount,
      settings.minNumber,
      settings.maxNumber
    )
    
    if (response.code === 200 && response.data) {
      // 初始化测试题目
      testQuestions.value = response.data.map(q => ({
        ...q,
        studentAnswer: null
      }))
      currentView.value = 'test'
      currentTestId.value = null // 新测试
      isReadOnly.value = false // 新测试不是只读模式
      startCountdown()
    } else {
      await showError(response.msg || '生成题目失败')
    }
  } catch (error) {
    console.error('生成题目失败:', error)
    await showError(error.message || '生成题目失败')
  }
}

// 保存测试
const saveTest = async (skipConfirm = false) => {
  if (!settings.studentName.trim()) {
    await showError('请输入学生姓名')
    return
  }

  // 检查是否所有题目都已作答
  if (!skipConfirm) {
    const unansweredCount = testQuestions.value.filter(q => 
      q.studentAnswer === null || q.studentAnswer === undefined
    ).length
    
    if (unansweredCount > 0) {
      const confirmed = await showConfirm(`还有 ${unansweredCount} 题未作答，确定要提交吗？`)
      if (!confirmed) {
        return
      }
    }
  }

  try {
    const testRecord = {
      id: currentTestId.value || null,
      studentName: settings.studentName,
      testDate: settings.testDate,
      testCount: testQuestions.value.length,
      operationTypes: settings.operationTypes,
      minNumber: settings.minNumber,
      maxNumber: settings.maxNumber,
      durationMinutes: settings.durationMinutes,
      questions: testQuestions.value.map(q => ({
        num1: q.num1,
        operator: q.operator,
        num2: q.num2,
        correctAnswer: q.correctAnswer,
        studentAnswer: q.studentAnswer
      }))
    }

    const response = await saveTestRecord(testRecord)
    if (response.code === 200) {
      await showSuccess('保存成功！正确率: ' + response.data.accuracyRate + '%')
      clearCountdown()
      await loadTestList() // 重新加载列表
      backToList() // 返回列表
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
  settings.testCount = test.testCount
  settings.operationTypes = test.operationTypes || ['+']
  settings.minNumber = test.minNumber || 0
  settings.maxNumber = test.maxNumber || 100
  settings.durationMinutes = test.durationMinutes || 10
  isReadOnly.value = readOnly
  clearCountdown()
  if (!readOnly) {
    startCountdown()
  }
  
  // 转换题目数据格式
  testQuestions.value = (test.questions || []).map(q => ({
    num1: q.num1,
    operator: q.operator,
    num2: q.num2,
    correctAnswer: q.correctAnswer,
    studentAnswer: q.studentAnswer,
    isCorrect: q.isCorrect
  }))
  
  currentView.value = 'test'
}

// 查看测试（只读模式）
const viewTest = (test) => {
  loadTest(test, true) // 设置为只读模式
}

// 删除测试
const deleteTest = async (id) => {
  const confirmed = await showConfirm('确定要删除这条测试记录吗？')
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

// 导出PDF
const exportToPDF = async () => {
  if (testQuestions.value.length === 0) {
    await showError('没有可导出的测试内容')
    return
  }

  try {
    // 自定义导出排版：4 列表格，类似示例图片
    const exportContainer = document.createElement('div')
    exportContainer.style.width = '210mm' // A4宽度
    exportContainer.style.padding = '10mm 12mm'
    exportContainer.style.backgroundColor = '#ffffff'
    exportContainer.style.color = '#000000'
    exportContainer.style.fontFamily = 'Microsoft YaHei, SimHei, Arial, sans-serif'

    const table = document.createElement('table')
    table.style.width = '100%'
    table.style.borderCollapse = 'collapse'
    table.style.tableLayout = 'fixed'
    table.style.fontSize = '22px'
    table.style.color = '#000'

    const colsPerRow = 4
    testQuestions.value.forEach((q, idx) => {
      if (idx % colsPerRow === 0) {
        table.appendChild(document.createElement('tr'))
      }
      const row = table.lastElementChild
      const cell = document.createElement('td')
      cell.style.padding = '12px 10px'
      cell.style.border = '1px solid #999'
      cell.style.verticalAlign = 'middle'
      cell.style.height = '38px'
      cell.style.whiteSpace = 'nowrap'
      cell.style.textAlign = 'left'
      cell.style.fontWeight = '500'
      const operator = getOperatorSymbol(q.operator)
      const blank = '_______'
      cell.textContent = `${q.num1} ${operator} ${q.num2} = ${blank}`
      row.appendChild(cell)
    })

    // 补足最后一行的空单元格，确保表格均匀
    const lastRow = table.lastElementChild
    if (lastRow && lastRow.children.length < colsPerRow) {
      const missing = colsPerRow - lastRow.children.length
      for (let i = 0; i < missing; i++) {
        const emptyCell = document.createElement('td')
        emptyCell.style.padding = '12px 10px'
        emptyCell.style.border = '1px solid #999'
        emptyCell.style.height = '38px'
        lastRow.appendChild(emptyCell)
      }
    }

    exportContainer.appendChild(table)

    // 包一层隐藏容器，确保 html2canvas 能正确计算尺寸
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

    // 配置PDF选项
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `数学测试_${settings.studentName}_${formattedDate.value.replace(/\//g, '-')}.pdf`,
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

    // 清理临时元素
    document.body.removeChild(wrapper)
  } catch (error) {
    console.error('导出PDF失败:', error)
    await showError('导出PDF失败: ' + (error.message || '未知错误'))
  }
}

const startCountdown = () => {
  clearCountdown()
  countdownSeconds.value = Math.max(0, Math.round(settings.durationMinutes * 60))
  if (countdownSeconds.value === 0) return
  isTimerActive.value = true
  countdownTimer.value = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value -= 1
    }
    if (countdownSeconds.value <= 0) {
      clearCountdown()
      handleTimeUp()
    }
  }, 1000)
}

const clearCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  isTimerActive.value = false
  countdownSeconds.value = 0
}

const countdownDisplay = computed(() => {
  const minutes = String(Math.floor(countdownSeconds.value / 60)).padStart(2, '0')
  const seconds = String(countdownSeconds.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

const handleTimeUp = async () => {
  if (isReadOnly.value || currentView.value !== 'test') return
  await showError('时间到，已自动提交')
  await saveTest(true)
}

onMounted(() => {
  loadTestList()
})

onUnmounted(() => {
  clearCountdown()
})
</script>

<style scoped>
.math-test-container {
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

.checkbox-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
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

.number-range-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-input {
  flex: 1;
}

.range-separator {
  color: rgba(255, 255, 255, 0.7);
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

.test-item-count {
  color: rgba(255, 255, 255, 0.7);
}

.test-item-accuracy {
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

.action-btn.back-btn:hover {
  background: rgba(100, 100, 100, 0.4);
}

.action-btn.export-btn {
  background: rgba(33, 150, 243, 0.2);
  border-color: rgba(33, 150, 243, 0.5);
  color: #2196f3;
}

.action-btn.export-btn:hover {
  background: rgba(33, 150, 243, 0.4);
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
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.25);
}

.test-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 99, 71, 0.6);
  border-radius: 10px;
  background: rgba(255, 99, 71, 0.12);
  box-shadow: 0 0 12px rgba(255, 99, 71, 0.25);
  font-weight: 600;
}

.countdown-icon {
  color: #ff8a65;
  font-size: 14px;
}

.countdown-label {
  color: #ff8a65;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.countdown-time {
  color: #ff7043;
  font-size: 18px;
  letter-spacing: 1px;
}

.test-title {
  font-size: 24px;
  color: #ffd700;
  margin: 0;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.test-info {
  display: flex;
  gap: 18px;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin: 12px 0 18px 0;
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

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.question-item {
  background: rgba(50, 50, 50, 0.6);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.question-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.6);
}

.question-item.correct {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.6);
}

.question-item.incorrect {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.6);
}

.question-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-formula-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: nowrap;
}

.question-number {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.question-formula {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  white-space: nowrap;
  flex: 1;
}

.answer-input {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 6px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s;
  width: 120px;
  flex-shrink: 0;
  text-align: right;
}

.answer-input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.answer-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.answer-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-icon {
  font-size: 18px;
  font-weight: bold;
}

.correct-icon {
  color: #4caf50;
}

.incorrect-icon {
  color: #f44336;
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

/* 自定义滚动条 */
.questions-grid::-webkit-scrollbar {
  width: 10px;
}

.questions-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
}

.questions-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.5);
  border-radius: 5px;
}

.questions-grid::-webkit-scrollbar-thumb:hover {
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

  .questions-grid {
    grid-template-columns: 1fr;
    gap: 15px;
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

