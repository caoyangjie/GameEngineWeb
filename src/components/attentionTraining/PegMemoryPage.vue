<template>
  <div class="peg-memory-container">
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
      <div class="temple-background"></div>
      <div class="forest-overlay"></div>
    </div>

    <TopHeader @toggle-sidebar="toggleSidebar" />

    <main class="main-content">
      <header class="page-header">
        <div>
          <div class="badge">定桩记忆法 · 记忆力训练</div>
          <h1 class="page-title">定桩记忆强化训练</h1>
          <p class="subtitle">
            通过自定义定桩模板，强化数字与记忆目标的对应关系，提升定桩记忆能力。
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="goBack">返回训练中心</button>
        </div>
      </header>

      <div class="content-grid">
        <section class="game-column">
          <section class="controls">
            <div class="control-item wide">
              <label for="template">选择模板</label>
              <div class="autocomplete-wrapper">
                <input
                  id="template"
                  type="text"
                  v-model="templateSearchText"
                  @input="onTemplateSearch"
                  @focus="showTemplateDropdown = true"
                  @blur="handleTemplateBlur"
                  :disabled="isLoadingTemplates || gameStatus === 'training'"
                  placeholder="输入模板名称搜索..."
                  class="autocomplete-input"
                />
                <div v-if="showTemplateDropdown && filteredTemplates.length > 0" class="autocomplete-dropdown">
                  <div
                    v-for="t in filteredTemplates"
                    :key="t.id"
                    class="autocomplete-option"
                    :class="{ active: t.id === selectedTemplateId }"
                    @mousedown.prevent="selectTemplateFromAutocomplete(t)"
                  >
                    <div class="option-name">{{ t.templateName }}</div>
                    <div class="option-meta">{{ t.totalPegs }}个定桩 · {{ t.category || '未分类' }}</div>
                  </div>
                </div>
                <div v-if="showTemplateDropdown && filteredTemplates.length === 0 && templateSearchText" class="autocomplete-dropdown">
                  <div class="autocomplete-empty">未找到匹配的模板</div>
                </div>
              </div>
            </div>
            <div class="control-item">
              <label for="training-mode">训练模式</label>
              <select
                id="training-mode"
                v-model="trainingMode"
                :disabled="isLoadingTemplates || gameStatus === 'training'"
              >
                <option value="number_to_target">数字 → 目标</option>
                <option value="target_to_number">目标 → 数字</option>
              </select>
            </div>
            <div class="control-item">
              <label for="peg-count">训练数量</label>
              <select
                id="peg-count"
                v-model="pegCount"
                :disabled="isLoadingTemplates || gameStatus === 'training'"
              >
                <option value="12">12 个 · 入门</option>
                <option value="24">24 个 · 标准</option>
                <option value="64">64 个 · 进阶</option>
                <option value="110">110 个 · 挑战</option>
              </select>
            </div>
            <div class="control-item">
              <label for="difficulty">难度</label>
              <select
                id="difficulty"
                v-model="difficulty"
                :disabled="isLoadingTemplates || gameStatus === 'training'"
              >
                <option value="入门">入门</option>
                <option value="进阶">进阶</option>
                <option value="挑战">挑战</option>
              </select>
            </div>
            <div class="control-item compact">
              <div class="label">当前状态</div>
              <div class="status" :class="gameStatus">{{ statusText }}</div>
            </div>
            <div class="control-item compact">
              <div class="label">答题进度</div>
              <div class="progress-info">{{ answeredCount }} / {{ quiz.length || 0 }}</div>
            </div>
            <div class="control-actions">
              <button class="ghost" @click="openTemplateModal" :disabled="isLoadingTemplates">
                管理模板
              </button>
              <button
                class="primary"
                @click="startTraining"
                :disabled="!selectedTemplate || isLoadingTemplates || gameStatus === 'training'"
              >
                {{ isLoadingTemplates ? '加载中...' : '开始训练' }}
              </button>
            </div>
          </section>

          <section class="game-card" v-if="selectedTemplate && quiz.length">
            <div class="game-content">
              <div class="exit-button-container">
                <button class="btn-exit" @click="resetGame" :disabled="isLoadingTemplates">重置</button>
              </div>

              <div v-if="gameStatus === 'training'" class="training-mode">
                <div class="answer-header">
                  <div class="target-number-display">
                    当前题目：
                    <span class="target-number">{{ currentQuestionIndex + 1 }} / {{ quiz.length }}</span>
                  </div>
                  <div class="timer" v-if="gameStatus === 'training'">
                    训练用时：{{ formatTime(trainingElapsed) }}
                  </div>
                </div>

                <div class="recall-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                  </div>
                </div>

                <div v-if="currentQuestion" class="question-card">
                  <div class="question-title">
                    {{ trainingMode === 'number_to_target' ? `数字 ${currentQuestion.number} 对应的记忆目标是什么？` : `记忆目标 "${currentQuestion.target}" 对应的数字是什么？` }}
                  </div>
                  <div v-if="trainingMode === 'number_to_target'" class="option-grid">
                    <button
                      v-for="option in currentQuestion.options"
                      :key="option"
                      class="option-btn"
                      :class="{ selected: currentQuestion.userAnswer === option }"
                      @click="selectOption(option)"
                    >
                      {{ option }}
                    </button>
                  </div>
                  <div v-else class="number-input-group">
                    <input
                      type="text"
                      v-model="currentQuestion.userAnswer"
                      placeholder="请输入对应的数字或汉字"
                      class="number-input"
                      @keyup.enter="handleEnterKey"
                    />
                  </div>
                </div>

                <div class="recall-actions">
                  <button class="ghost" @click="prevQuestion" :disabled="currentQuestionIndex === 0">上一题</button>
                  <button
                    class="primary"
                    @click="nextQuestion"
                    :disabled="!currentQuestion?.userAnswer && trainingMode === 'number_to_target'"
                  >
                    {{ currentQuestionIndex === quiz.length - 1 ? '提交结果' : '下一题' }}
                  </button>
                </div>
              </div>

              <div v-else-if="gameStatus === 'completed'" class="result-card inline">
                <div class="result-header">
                  <div class="badge ghost">训练完成</div>
                  <h2>成绩单</h2>
                </div>
                <div class="result-stats">
                  <div class="stat-item">
                    <div class="stat-label">数量</div>
                    <div class="stat-value">{{ resultStats.total }} 题</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">答对</div>
                    <div class="stat-value success">{{ resultStats.correct }} 题</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">正确率</div>
                    <div class="stat-value" :class="resultStats.accuracy >= 80 ? 'success' : 'error'">
                      {{ resultStats.accuracy }}%
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">训练用时</div>
                    <div class="stat-value">{{ formatTime(resultStats.duration) }}</div>
                  </div>
                </div>
                <div v-if="resultStats.quizDetails && resultStats.quizDetails.length" class="result-details">
                  <div class="details-title">详细比对结果</div>
                  <div class="details-list">
                    <div
                      v-for="(item, index) in resultStats.quizDetails"
                      :key="index"
                      class="detail-item"
                      :class="{ correct: item.isCorrect, incorrect: !item.isCorrect }"
                    >
                      <div class="detail-number">第 {{ index + 1 }} 题</div>
                      <div class="detail-content">
                        <div class="detail-row">
                          <span class="detail-label">
                            {{ trainingMode === 'number_to_target' ? '数字' : '目标' }}：
                          </span>
                          <span class="detail-value">
                            {{ trainingMode === 'number_to_target' ? item.number : item.target }}
                          </span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">正确答案：</span>
                          <span class="detail-value correct-answer">
                            {{ trainingMode === 'number_to_target' ? item.answer : item.answer }}
                          </span>
                        </div>
                        <div class="detail-row">
                          <span class="detail-label">您的答案：</span>
                          <span class="detail-value" :class="item.isCorrect ? 'correct-answer' : 'wrong-answer'">
                            {{ item.userAnswer || '未作答' }}
                          </span>
                        </div>
                      </div>
                      <div class="detail-status" :class="item.isCorrect ? 'status-correct' : 'status-incorrect'">
                        {{ item.isCorrect ? '✓ 正确' : '✗ 错误' }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="result-actions">
                  <button class="ghost" @click="startTraining">再次练习</button>
                  <button class="primary" @click="goBack">返回训练中心</button>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_PEG_MEMORY"
      @close="handleSidebarClose"
    />

    <!-- 模板管理弹窗 -->
    <div v-if="showTemplateModal" class="template-overlay" @click.self="closeTemplateModal">
      <div class="template-modal" :class="{ maximized: isModalMaximized }" @click.stop>
        <header class="template-header">
          <div>
            <div class="badge ghost">定桩模板管理</div>
            <h3>{{ modalMode === 'view' ? '查看模板' : modalMode === 'edit' ? '编辑模板' : '创建模板' }}</h3>
          </div>
          <div class="header-actions">
            <button class="btn-icon" @click="toggleModalMaximize" :title="isModalMaximized ? '还原' : '最大化'">
              {{ isModalMaximized ? '⤓' : '⤢' }}
            </button>
            <button class="btn-close" @click="closeTemplateModal" title="关闭">关闭</button>
          </div>
        </header>

        <div class="template-body">
          <div class="template-list-section">
            <div class="list-header">
              <div class="list-title">模板列表</div>
              <button class="btn-primary-small" @click="openCreateModal">新增模板</button>
            </div>
            <div class="template-list">
              <div
                v-for="t in paginatedTemplates"
                :key="t.id"
                class="template-item"
                :class="{ active: t.id === selectedTemplateId }"
              >
                <div class="template-item-content" @click="viewTemplate(t)">
                  <div class="template-item-name">{{ t.templateName }}</div>
                  <div class="template-item-meta">
                    {{ t.totalPegs }}个定桩 · {{ t.category || '未分类' }}
                    <span v-if="t.description" class="template-item-desc">{{ t.description }}</span>
                  </div>
                </div>
                <div class="template-item-actions">
                  <button class="btn-small" @click.stop="viewTemplate(t)">查看</button>
                  <button class="btn-small" @click.stop="editTemplate(t)">编辑</button>
                  <button class="btn-small danger" @click.stop="deleteTemplate(t.id)">删除</button>
                </div>
              </div>
              <div v-if="!templates.length" class="template-empty">暂无模板，请创建</div>
            </div>
            <!-- 分页 -->
            <div class="pagination-section" v-if="totalPages > 1">
              <div class="pagination-info">
                共 {{ templates.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
              </div>
              <div class="pagination-controls">
                <button 
                  class="pagination-btn" 
                  :disabled="currentPage === 1"
                  @click="goToPage(currentPage - 1)"
                >
                  上一页
                </button>
                <div class="pagination-numbers">
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    class="pagination-number"
                    :class="{ active: page === currentPage }"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                </div>
                <button 
                  class="pagination-btn" 
                  :disabled="currentPage === totalPages"
                  @click="goToPage(currentPage + 1)"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板详情/编辑弹窗 -->
    <div v-if="showTemplateDetailModal" class="template-overlay" @click.self="closeTemplateDetailModal">
      <div class="template-detail-modal" :class="{ maximized: isDetailModalMaximized }" @click.stop>
        <header class="template-header">
          <div>
            <div class="badge ghost">定桩模板{{ modalMode === 'view' ? '详情' : modalMode === 'edit' ? '编辑' : '创建' }}</div>
            <h3>{{ editingTemplate.templateName || '新模板' }}</h3>
          </div>
          <div class="header-actions">
            <button class="btn-icon" @click="toggleDetailModalMaximize" :title="isDetailModalMaximized ? '还原' : '最大化'">
              {{ isDetailModalMaximized ? '⤓' : '⤢' }}
            </button>
            <button class="btn-close" @click="closeTemplateDetailModal" title="关闭">关闭</button>
          </div>
        </header>

        <div class="template-detail-body">
          <div class="template-form">
            <div class="form-item">
              <label for="edit-template-name">模板名称</label>
              <input 
                id="edit-template-name"
                v-model="editingTemplate.templateName" 
                placeholder="例如：数字桩1-50"
                :readonly="modalMode === 'view'"
              />
            </div>
            <div class="form-item">
              <label for="edit-template-desc">模板描述</label>
              <textarea
                id="edit-template-desc"
                v-model="editingTemplate.description"
                rows="2"
                placeholder="描述这个模板的用途和特点"
                :readonly="modalMode === 'view'"
              ></textarea>
            </div>
            <div class="form-item">
              <label for="edit-template-category">分类</label>
              <input 
                id="edit-template-category"
                v-model="editingTemplate.category" 
                placeholder="例如：数字桩、地点桩、身体桩"
                :readonly="modalMode === 'view'"
              />
            </div>
            <div class="form-item">
              <label for="edit-template-tags">标签</label>
              <input 
                id="edit-template-tags"
                v-model="editingTemplate.tags" 
                placeholder="用逗号分隔，例如：基础,常用"
                :readonly="modalMode === 'view'"
              />
            </div>
            <div class="form-item">
              <label for="edit-template-items">定桩项（JSON格式）</label>
              <textarea
                id="edit-template-items"
                v-model="editingTemplate.pegItems"
                rows="10"
                placeholder='[{"number": 1, "target": "记忆目标1"}, {"number": 2, "target": "记忆目标2"}, ...]'
                :readonly="modalMode === 'view'"
              ></textarea>
              <div class="form-hint">
                格式：JSON数组，每个对象包含 number（数字）和 target（记忆目标），可选 imageUrl（图片URL）
              </div>
            </div>
            <div class="form-actions" v-if="modalMode !== 'view'">
              <button class="ghost" @click="resetEditingTemplate">重置</button>
              <button class="primary" @click="saveTemplate">保存模板</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import {
  savePegMemoryRecord,
  getAllPegMemoryTemplates,
  createPegMemoryTemplate,
  updatePegMemoryTemplate,
  deletePegMemoryTemplate
} from '../../api/attentionPegMemory.js'

const router = useRouter()
const sidebarOpen = ref(false)
const selectedTemplateId = ref('')
const trainingMode = ref('number_to_target')
const pegCount = ref('12')
const difficulty = ref('进阶')

const isLoadingTemplates = ref(false)
const templates = ref([])
const selectedTemplate = ref(null)
const quiz = ref([])
const currentQuestionIndex = ref(0)
const gameStatus = ref('idle') // idle | training | completed
const trainingStartAt = ref(0)
const trainingElapsed = ref(0)
const resultStats = ref({ correct: 0, total: 0, duration: 0, accuracy: 0, quizDetails: [] })

// 模板搜索相关
const templateSearchText = ref('')
const showTemplateDropdown = ref(false)
const filteredTemplates = ref([])

// 模板管理相关
const showTemplateModal = ref(false)
const showTemplateDetailModal = ref(false)
const modalMode = ref('view') // view | edit | create
const isModalMaximized = ref(false)
const isDetailModalMaximized = ref(false)
const editingTemplate = ref({
  id: null,
  templateName: '',
  description: '',
  category: '',
  tags: '',
  pegItems: ''
})

// 分页相关
const currentPage = ref(1)
const itemsPerPage = ref(10)

let trainingTimerInterval = null

const isRunning = computed(() => gameStatus.value !== 'idle')
const answeredCount = computed(() => quiz.value.filter((q) => q.userAnswer !== null && q.userAnswer !== '').length)
const statusText = computed(() => {
  if (gameStatus.value === 'training') return '训练中'
  if (gameStatus.value === 'completed') return '已完成'
  return '待开始'
})
const currentQuestion = computed(() => quiz.value[currentQuestionIndex.value] || null)
const progressPercent = computed(() => {
  if (!quiz.value.length) return 0
  return Math.round((answeredCount.value / quiz.value.length) * 100)
})

// 分页计算属性
const totalPages = computed(() => {
  return Math.ceil(templates.value.length / itemsPerPage.value)
})

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return templates.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const shuffle = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const loadTemplates = async () => {
  isLoadingTemplates.value = true
  try {
    const res = await getAllPegMemoryTemplates()
    const data = res?.data || res || []
    templates.value = data
    updateFilteredTemplates()
    if (data.length > 0 && !selectedTemplateId.value) {
      selectedTemplateId.value = data[0].id
      onTemplateChange()
      updateTemplateSearchText()
    }
  } catch (error) {
    console.warn('获取模板列表失败：', error?.message || error)
  } finally {
    isLoadingTemplates.value = false
  }
}

const updateTemplateSearchText = () => {
  if (selectedTemplate.value) {
    templateSearchText.value = `${selectedTemplate.value.templateName} (${selectedTemplate.value.totalPegs}个定桩)`
  } else {
    templateSearchText.value = ''
  }
}

const updateFilteredTemplates = () => {
  if (!templateSearchText.value.trim()) {
    filteredTemplates.value = templates.value
    return
  }
  const searchLower = templateSearchText.value.toLowerCase()
  filteredTemplates.value = templates.value.filter(t => 
    t.templateName.toLowerCase().includes(searchLower) ||
    (t.category && t.category.toLowerCase().includes(searchLower)) ||
    (t.description && t.description.toLowerCase().includes(searchLower))
  )
}

const onTemplateSearch = () => {
  updateFilteredTemplates()
  showTemplateDropdown.value = true
}

const handleTemplateBlur = () => {
  // 延迟关闭，以便点击选项时能触发
  setTimeout(() => {
    showTemplateDropdown.value = false
  }, 200)
}

const selectTemplateFromAutocomplete = (template) => {
  selectedTemplateId.value = template.id
  templateSearchText.value = `${template.templateName} (${template.totalPegs}个定桩)`
  showTemplateDropdown.value = false
  onTemplateChange()
}

const onTemplateChange = () => {
  if (!selectedTemplateId.value) {
    selectedTemplate.value = null
    templateSearchText.value = ''
    // 如果游戏已完成，切换模板时自动重置
    if (gameStatus.value === 'completed') {
      resetGame()
    }
    return
  }
  selectedTemplate.value = templates.value.find((t) => t.id === selectedTemplateId.value) || null
  updateTemplateSearchText()
  // 如果游戏已完成，切换模板时自动重置
  if (gameStatus.value === 'completed') {
    resetGame()
  }
}

const buildQuiz = () => {
  if (!selectedTemplate.value) return

  try {
    const pegItems = JSON.parse(selectedTemplate.value.pegItems || '[]')
    if (!Array.isArray(pegItems) || pegItems.length === 0) {
      console.warn('模板定桩项为空或格式错误')
      return
    }

    const count = Math.min(parseInt(pegCount.value, 10) || 10, pegItems.length)
    const selectedPegs = shuffle([...pegItems]).slice(0, count)

    if (trainingMode.value === 'number_to_target') {
      // 数字 → 目标：显示数字，选择目标
      quiz.value = selectedPegs.map((peg) => {
        const otherTargets = pegItems
          .filter((p) => p.target !== peg.target)
          .map((p) => p.target)
        const distractors = shuffle(otherTargets).slice(0, Math.min(3, otherTargets.length))
        const options = shuffle([...distractors, peg.target])
        return {
          number: peg.number,
          target: peg.target,
          options,
          answer: peg.target,
          userAnswer: ''
        }
      })
    } else {
      // 目标 → 数字：显示目标，输入数字
      quiz.value = selectedPegs.map((peg) => ({
        number: peg.number,
        target: peg.target,
        answer: peg.number,
        userAnswer: null
      }))
    }
    currentQuestionIndex.value = 0
  } catch (error) {
    console.error('构建题目失败：', error)
    alert('构建题目失败：' + error.message)
  }
}

const startTraining = () => {
  if (!selectedTemplate.value) {
    alert('请先选择模板')
    return
  }
  buildQuiz()
  if (quiz.value.length === 0) {
    alert('无法构建题目，请检查模板数据')
    return
  }
  gameStatus.value = 'training'
  trainingStartAt.value = performance.now()
  trainingElapsed.value = 0
  clearTrainingTimer()
  trainingTimerInterval = setInterval(() => {
    if (trainingStartAt.value) {
      trainingElapsed.value = Math.round((performance.now() - trainingStartAt.value) / 1000)
    }
  }, 1000)
}

const clearTrainingTimer = () => {
  if (trainingTimerInterval) {
    clearInterval(trainingTimerInterval)
    trainingTimerInterval = null
  }
}

const selectOption = (option) => {
  if (!currentQuestion.value) return
  currentQuestion.value.userAnswer = option
  // 数字转目标模式：选择后自动进入下一题
  if (trainingMode.value === 'number_to_target') {
    // 延迟一下，让用户看到选择效果
    setTimeout(() => {
      nextQuestion()
    }, 300)
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1
  }
}

const handleEnterKey = () => {
  // 目标转数字模式：回车键触发下一题
  if (trainingMode.value === 'target_to_number' && currentQuestion.value?.userAnswer) {
    nextQuestion()
  }
}

const nextQuestion = () => {
  if (!quiz.value.length) return
  if (currentQuestionIndex.value < quiz.value.length - 1) {
    currentQuestionIndex.value += 1
    return
  }
  finalizeGame()
}

const finalizeGame = async () => {
  clearTrainingTimer()
  const total = quiz.value.length
  // 计算每题的正确答案状态
  const quizWithResult = quiz.value.map((q) => {
    let isCorrect = false
    if (trainingMode.value === 'number_to_target') {
      isCorrect = q.userAnswer === q.answer
    } else {
      // 支持数字和汉字，使用字符串比较
      isCorrect = String(q.userAnswer || '').trim() === String(q.answer || '').trim()
    }
    return {
      ...q,
      isCorrect
    }
  })
  const correct = quizWithResult.filter((q) => q.isCorrect).length
  const duration = trainingStartAt.value ? Math.round((performance.now() - trainingStartAt.value) / 1000) : 0
  const accuracy = total ? Math.round((correct * 100) / total) : 0

  resultStats.value = { correct, total, duration, accuracy, quizDetails: quizWithResult }
  trainingElapsed.value = duration
  gameStatus.value = 'completed'

  await saveRecord(correct, total, accuracy, duration)
}

const saveRecord = async (correct, total, accuracy, duration) => {
  try {
    const detail = quiz.value.map((q) => ({
      number: q.number,
      target: q.target,
      answer: q.answer,
      userAnswer: q.userAnswer,
      correct:
        trainingMode.value === 'number_to_target'
          ? q.userAnswer === q.answer
          : String(q.userAnswer || '').trim() === String(q.answer || '').trim()
    }))
    await savePegMemoryRecord({
      templateId: selectedTemplate.value.id,
      templateName: selectedTemplate.value.templateName,
      trainingMode: trainingMode.value,
      pegCount: total,
      correctCount: correct,
      totalCount: total,
      accuracy,
      durationSeconds: duration,
      detail: JSON.stringify(detail),
      difficulty: difficulty.value
    })
  } catch (error) {
    console.warn('保存记录失败：', error?.message || error)
  }
}

const openTemplateModal = () => {
  showTemplateModal.value = true
  showTemplateDetailModal.value = false
  isModalMaximized.value = false
  currentPage.value = 1
  resetEditingTemplate()
}

const closeTemplateModal = () => {
  showTemplateModal.value = false
  isModalMaximized.value = false
  resetEditingTemplate()
}

const toggleModalMaximize = () => {
  isModalMaximized.value = !isModalMaximized.value
}

const toggleDetailModalMaximize = () => {
  isDetailModalMaximized.value = !isDetailModalMaximized.value
}

const openCreateModal = () => {
  modalMode.value = 'create'
  resetEditingTemplate()
  showTemplateDetailModal.value = true
  isDetailModalMaximized.value = false
}

const viewTemplate = (template) => {
  modalMode.value = 'view'
  editingTemplate.value = {
    id: template.id,
    templateName: template.templateName || '',
    description: template.description || '',
    category: template.category || '',
    tags: template.tags || '',
    pegItems: template.pegItems || ''
  }
  showTemplateDetailModal.value = true
  isDetailModalMaximized.value = false
}

const closeTemplateDetailModal = () => {
  showTemplateDetailModal.value = false
  isDetailModalMaximized.value = false
  resetEditingTemplate()
}

const resetEditingTemplate = () => {
  editingTemplate.value = {
    id: null,
    templateName: '',
    description: '',
    category: '',
    tags: '',
    pegItems: ''
  }
}

const editTemplate = (template) => {
  modalMode.value = 'edit'
  editingTemplate.value = {
    id: template.id,
    templateName: template.templateName || '',
    description: template.description || '',
    category: template.category || '',
    tags: template.tags || '',
    pegItems: template.pegItems || ''
  }
  showTemplateDetailModal.value = true
  isDetailModalMaximized.value = false
}

const goToPage = (page) => {
  if (page === '...' || page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const saveTemplate = async () => {
  if (!editingTemplate.value.templateName) {
    alert('请输入模板名称')
    return
  }
  if (!editingTemplate.value.pegItems) {
    alert('请输入定桩项数据')
    return
  }
  try {
    // 验证JSON格式
    JSON.parse(editingTemplate.value.pegItems)
  } catch (error) {
    alert('定桩项数据格式错误，请检查JSON格式')
    return
  }

  try {
    if (editingTemplate.value.id) {
      await updatePegMemoryTemplate(editingTemplate.value.id, editingTemplate.value)
    } else {
      await createPegMemoryTemplate(editingTemplate.value)
    }
    await loadTemplates()
    closeTemplateDetailModal()
    alert('保存成功')
  } catch (error) {
    console.error('保存模板失败：', error)
    alert('保存失败：' + (error?.message || '未知错误'))
  }
}

const deleteTemplate = async (id) => {
  if (!confirm('确定要删除这个模板吗？')) {
    return
  }
  try {
    await deletePegMemoryTemplate(id)
    await loadTemplates()
    if (selectedTemplateId.value === id) {
      selectedTemplateId.value = ''
      selectedTemplate.value = null
    }
    alert('删除成功')
  } catch (error) {
    console.error('删除模板失败：', error)
    alert('删除失败：' + (error?.message || '未知错误'))
  }
}

const resetGame = () => {
  clearTrainingTimer()
  gameStatus.value = 'idle'
  quiz.value = []
  trainingElapsed.value = 0
  resultStats.value = { correct: 0, total: 0, duration: 0, accuracy: 0, quizDetails: [] }
  currentQuestionIndex.value = 0
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const goBack = () => {
  router.navigate(ROUTES.ATTENTION_TRAINING)
}

onMounted(() => {
  loadTemplates()
})

onBeforeUnmount(() => {
  clearTrainingTimer()
})
</script>

<style scoped>
.peg-memory-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  color: #f7f7f7;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.sky,
.stars,
.galaxy,
.mountains,
.temple-background,
.forest-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-size: cover;
}

.sky {
  background: linear-gradient(180deg, #0b1226 0%, #0a0a12 100%);
}

.stars {
  background: radial-gradient(white, rgba(255, 255, 255, 0) 35%);
  opacity: 0.25;
}

.galaxy {
  background: radial-gradient(ellipse at 40% 20%, rgba(86, 122, 255, 0.15), transparent 35%),
    radial-gradient(ellipse at 80% 10%, rgba(244, 208, 63, 0.14), transparent 35%);
  opacity: 0.6;
}

.mountains {
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.6) 100%);
}

.temple-background {
  background: radial-gradient(ellipse at 20% 60%, rgba(255, 255, 255, 0.04), transparent 40%);
}

.forest-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(6, 9, 16, 0.95) 85%);
}

.main-content {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 40px 40px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.82) 100%);
  border: 2px solid rgba(255, 215, 0, 0.35);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.18), inset 0 0 30px rgba(255, 215, 0, 0.05),
    0 12px 40px rgba(0, 0, 0, 0.45);
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 215, 0, 0.18);
  color: #f4d03f;
  font-size: 12px;
}

.badge.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #d5d5d5;
}

.page-title {
  font-size: 32px;
  color: #ffd700;
  text-shadow: 0 0 18px rgba(255, 215, 0, 0.7);
  margin: 8px 0 6px;
}

.subtitle {
  color: #c5c5c5;
  font-size: 14px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  padding: 12px 22px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.35);
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.25s;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.btn-secondary:hover {
  background: rgba(255, 215, 0, 0.18);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.35), 0 8px 24px rgba(0, 0, 0, 0.35);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}

.game-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.9) 100%);
  border: 2px solid rgba(255, 215, 0, 0.32);
  padding: 12px;
  border-radius: 12px;
  position: relative;
  z-index: 5;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.12), inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-item.wide {
  grid-column: 1 / -1;
}

.control-item.compact {
  background: rgba(0, 0, 0, 0.4);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.control-item label {
  color: #c5c5c5;
  font-size: 12px;
}

.control-item input,
.control-item select,
.control-item textarea {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px;
  color: #f7f7f7;
}

.autocomplete-wrapper {
  position: relative;
}

.autocomplete-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px;
  color: #f7f7f7;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: rgba(13, 15, 26, 0.98);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.autocomplete-option {
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.autocomplete-option:last-child {
  border-bottom: none;
}

.autocomplete-option:hover {
  background: rgba(255, 215, 0, 0.1);
}

.autocomplete-option.active {
  background: rgba(255, 215, 0, 0.15);
  border-left: 3px solid #ffd700;
}

.option-name {
  color: #ffd700;
  font-weight: 600;
  margin-bottom: 4px;
}

.option-meta {
  color: #c5c5c5;
  font-size: 12px;
}

.autocomplete-empty {
  padding: 12px;
  text-align: center;
  color: #c5c5c5;
  font-size: 13px;
}

.control-item select:disabled,
.control-item input:disabled,
.control-item textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.label {
  color: #c5c5c5;
  font-size: 12px;
}

.status {
  font-weight: 700;
  font-size: 18px;
}

.status.training {
  color: #3498db;
}

.status.completed {
  color: #1dd1a1;
}

.progress-info {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.control-actions {
  display: flex;
  gap: 8px;
}

button {
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.5);
  color: #f7f7f7;
  transition: all 0.2s;
  font-weight: 600;
}

button.primary {
  background: linear-gradient(90deg, #f4d03f, #f39c12);
  color: #0c0c0f;
  font-weight: 700;
  border-color: rgba(255, 215, 0, 0.4);
}

button.ghost {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.game-card {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.9) 100%);
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 14px;
  padding: 24px;
  position: relative;
  z-index: 5;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.12), inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
  min-height: 320px;
}

.game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.exit-button-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.btn-exit {
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.4);
  color: #e74c3c;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.training-mode {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.target-number-display {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.target-number {
  color: #f4d03f;
}

.timer {
  font-size: 18px;
  font-weight: 700;
  color: #f4d03f;
}

.recall-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f4d03f, #f39c12);
  transition: width 0.2s ease;
}

.question-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 215, 0, 0.18);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.option-btn {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.option-btn.selected {
  border-color: rgba(255, 215, 0, 0.8);
  background: rgba(255, 215, 0, 0.12);
  color: #ffd700;
}

.number-input-group {
  display: flex;
  justify-content: center;
}

.number-input {
  width: 200px;
  padding: 12px;
  font-size: 24px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  color: #ffd700;
  font-weight: 700;
}

.number-input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.recall-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: flex-end;
}

.result-card.inline {
  width: 100%;
}

.result-header {
  margin-bottom: 12px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  background: rgba(0, 0, 0, 0.4);
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}

.stat-label {
  color: #c5c5c5;
  font-size: 12px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #ffd700;
}

.stat-value.success {
  color: #1dd1a1;
}

.stat-value.error {
  color: #e74c3c;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.result-details {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.details-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 16px;
  text-align: center;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.detail-item {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s;
}

.detail-item.correct {
  border-color: rgba(29, 209, 161, 0.4);
  background: rgba(29, 209, 161, 0.08);
}

.detail-item.incorrect {
  border-color: rgba(231, 76, 60, 0.4);
  background: rgba(231, 76, 60, 0.08);
}

.detail-number {
  font-size: 14px;
  font-weight: 700;
  color: #c5c5c5;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  color: #c5c5c5;
  min-width: 80px;
}

.detail-value {
  color: #f7f7f7;
  font-weight: 600;
}

.detail-value.correct-answer {
  color: #1dd1a1;
}

.detail-value.wrong-answer {
  color: #e74c3c;
}

.detail-status {
  align-self: flex-end;
  font-size: 14px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
}

.detail-status.status-correct {
  color: #1dd1a1;
  background: rgba(29, 209, 161, 0.15);
}

.detail-status.status-incorrect {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.15);
}

.details-list::-webkit-scrollbar {
  width: 6px;
}

.details-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.details-list::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 3px;
}

.details-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

.template-overlay {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.72);
  z-index: 999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  backdrop-filter: blur(4px);
}

.template-modal {
  width: min(1000px, 94vw);
  max-height: calc(100vh - 120px);
  background: #0d0f1a;
  border: 1px solid rgba(255, 215, 0, 0.35);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.template-modal.maximized {
  width: 98vw;
  height: 98vh;
  max-height: 98vh;
  border-radius: 8px;
}

.template-detail-modal {
  width: min(800px, 90vw);
  max-height: calc(100vh - 120px);
  background: #0d0f1a;
  border: 1px solid rgba(255, 215, 0, 0.35);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.template-detail-modal.maximized {
  width: 98vw;
  height: 98vh;
  max-height: 98vh;
  border-radius: 8px;
}

.template-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-icon {
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(52, 152, 219, 0.18);
  border: 1px solid rgba(52, 152, 219, 0.4);
  color: #3498db;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: rgba(52, 152, 219, 0.3);
  border-color: rgba(52, 152, 219, 0.6);
}

.btn-close {
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(231, 76, 60, 0.18);
  border: 1px solid rgba(231, 76, 60, 0.5);
  color: #e74c3c;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.7);
}

.template-body {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.template-detail-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.template-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  color: #c5c5c5;
  font-size: 12px;
}

.form-item input,
.form-item textarea {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px;
  color: #f7f7f7;
}

.form-item input[readonly],
.form-item textarea[readonly] {
  background: rgba(0, 0, 0, 0.3);
  opacity: 0.7;
  cursor: default;
}

.form-item textarea {
  resize: vertical;
  font-family: monospace;
  font-size: 12px;
}

.form-hint {
  color: #8fd19e;
  font-size: 11px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.template-list-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  min-height: 0;
  flex: 1;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.list-title {
  color: #ffd700;
  font-weight: 700;
}

.btn-primary-small {
  padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f4d03f, #f39c12);
  color: #0c0c0f;
  font-weight: 700;
  border: 1px solid rgba(255, 215, 0, 0.4);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-primary-small:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.template-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.template-item-content {
  flex: 1;
  cursor: pointer;
}

.template-item-desc {
  display: block;
  color: #8a8a8a;
  font-size: 11px;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-item:hover {
  border-color: rgba(255, 215, 0, 0.3);
  background: rgba(255, 215, 0, 0.05);
}

.template-item.active {
  border-color: rgba(255, 215, 0, 0.8);
  background: rgba(255, 215, 0, 0.12);
}

.template-item-name {
  color: #ffd700;
  font-weight: 700;
  margin-bottom: 4px;
}

.template-item-meta {
  color: #c5c5c5;
  font-size: 12px;
  margin-bottom: 8px;
}

.template-item-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(52, 152, 219, 0.15);
  border: 1px solid rgba(52, 152, 219, 0.4);
  color: #3498db;
  cursor: pointer;
  font-weight: 600;
  font-size: 11px;
}

.btn-small.danger {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.4);
  color: #e74c3c;
}

.template-empty {
  color: #c5c5c5;
  font-size: 13px;
  text-align: center;
  padding: 16px;
}

.pagination-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.pagination-info {
  color: #c5c5c5;
  font-size: 13px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f7f7f7;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.4);
  color: #ffd700;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
}

.pagination-number {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f7f7f7;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-number:hover:not(.active) {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
}

.pagination-number.active {
  background: linear-gradient(90deg, #f4d03f, #f39c12);
  border-color: rgba(255, 215, 0, 0.6);
  color: #0c0c0f;
}

.pagination-number:disabled {
  cursor: default;
  background: transparent;
  border: none;
  color: #c5c5c5;
}

@media (max-width: 960px) {
  .main-content {
    padding: 100px 20px 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .template-body {
    grid-template-columns: 1fr;
  }
}
</style>

