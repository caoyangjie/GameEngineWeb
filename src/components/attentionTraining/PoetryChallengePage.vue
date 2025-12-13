<template>
  <div class="poetry-challenge-container">
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
          <div class="badge">诗词挑战 · 记忆力训练</div>
          <h1 class="page-title">诗词快速记忆与语义回放</h1>
          <p class="subtitle">
            通过 DeepSeek 智能生成词单，结合创作背景与多维度记忆桩，完成"看卡记忆 → 语义回放"训练。
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
              <label for="prompt">主题 / 提示词</label>
              <textarea
                id="prompt"
                v-model="promptInput"
                rows="2"
                placeholder="例如：思乡怀远 / 山水田园 / 边塞征战 / 送别离愁"
                :disabled="isLoadingPoetries || isRunning"
              ></textarea>
            </div>
            <div class="control-item">
              <label for="domain">场景 / 领域</label>
              <input
                id="domain"
                v-model="domainInput"
                placeholder="学习 / 演讲 / 写作 / 职场"
                :disabled="isLoadingPoetries || isRunning"
              />
            </div>
            <div class="control-item">
              <label for="tags">标签</label>
              <input
                id="tags"
                v-model="tagsInput"
                placeholder="励志,处世,成长（用逗号分隔）"
                :disabled="isLoadingPoetries || isRunning"
              />
            </div>
            <div class="control-item">
              <label for="count">诗词数量</label>
              <select id="count" v-model="poetryCount" :disabled="isLoadingPoetries || isRunning">
                <option value="4">4 首 · 速记</option>
                <option value="6">6 首 · 标准</option>
                <option value="8">8 首 · 进阶</option>
                <option value="12">12 首 · 挑战</option>
              </select>
            </div>
            <div class="control-item">
              <label for="difficulty">难度</label>
              <select id="difficulty" v-model="difficulty" :disabled="isLoadingPoetries || isRunning">
                <option value="入门">入门</option>
                <option value="进阶">进阶</option>
                <option value="挑战">挑战</option>
              </select>
            </div>
            <div class="control-item">
              <label for="memorize-seconds">记忆时长</label>
              <select
                id="memorize-seconds"
                v-model="memorizeSeconds"
                :disabled="isLoadingPoetries || isRunning"
              >
                <option value="45">45 秒 · 极速</option>
                <option value="90">90 秒 · 标准</option>
                <option value="150">150 秒 · 稳妥</option>
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
              <button class="ghost" @click="loadLatestPoetries" :disabled="isLoadingPoetries || isRunning">
                用最近词单
              </button>
              <button class="primary" @click="generateAndStart" :disabled="isLoadingPoetries || isRunning">
                {{ isLoadingPoetries ? '生成中...' : '用 DeepSeek 生成词单' }}
              </button>
              <button class="btn-secondary" @click="openLexiconModal" :disabled="isLoadingPoetries">
                诗词单词卡
              </button>
            </div>
          </section>

          <section class="game-card" v-if="poetries.length">
            <div class="game-content">
              <div class="exit-button-container">
                <button class="btn-exit" @click="resetGame" :disabled="isLoadingPoetries">重置</button>
              </div>

              <div v-if="gameStatus === 'memorizing'" class="memorizing-mode">
                <div class="group-header">
                  <div class="group-number">词单：{{ poetries.length }} 首</div>
                  <div class="timer" v-if="showTimer">{{ formatTime(memorizeRemaining) }}</div>
                </div>
                <div class="card-grid-display">
                  <div v-for="poetry in poetries" :key="poetryKey(poetry)" class="poetry-preview">
                    <div class="poetry-title">
                      <span class="main">{{ poetry.title }}</span>
                      <span class="pinyin">{{ poetry.pinyin }}</span>
                    </div>
                    <div class="poetry-meta">
                      <span>{{ poetry.dynasty || '朝代未详' }}</span>
                      <span v-if="poetry.author"> · {{ poetry.author }}</span>
                    </div>
                    <p class="poetry-content">{{ poetry.content }}</p>
                    <p class="poetry-text light">{{ poetry.meaning || poetry.theme }}</p>
                    <p class="poetry-text tiny">记忆线索：{{ poetry.memoryCues || '善用画面 / 情感联想' }}</p>
                  </div>
                </div>
                <div class="hint-text">
                  先按背景/主题给诗词贴上场景，再在心里回放一遍。记好了可提前进入语义回放。
                </div>
                <button class="primary" @click="enterRecall" :disabled="isTransitioning">我记好了，进入回放</button>
              </div>

              <div v-else-if="gameStatus === 'recalling'" class="recall-mode">
                <div class="answer-header">
                  <div class="target-number-display">
                    当前题目：
                    <span class="target-number">{{ currentQuestionIndex + 1 }} / {{ quiz.length }}</span>
                  </div>
                  <div class="timer" v-if="gameStatus === 'recalling'">
                    回放用时：{{ formatTime(recallElapsed) }}
                  </div>
                </div>

                <div class="recall-progress">
                  <div class="hint-text">
                    根据提示选出对应诗词。建议先回想背景，再确认标题。
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                  </div>
                </div>

                <div v-if="currentQuestion" class="question-card">
                  <div class="question-title">{{ currentQuestion.prompt }}</div>
                  <div class="question-detail">
                    <span v-if="currentQuestion.poetry.dynasty">{{ currentQuestion.poetry.dynasty }}</span>
                    <span v-if="currentQuestion.poetry.author"> · {{ currentQuestion.poetry.author }}</span>
                  </div>
                  <div class="option-grid">
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
                </div>

                <div class="recall-actions">
                  <button class="ghost" @click="prevQuestion" :disabled="currentQuestionIndex === 0">上一题</button>
                  <button class="primary" @click="nextQuestion" :disabled="!currentQuestion?.userAnswer">
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
                    <div class="stat-value">{{ resultStats.total }} 首</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">答对</div>
                    <div class="stat-value success">{{ resultStats.correct }} 首</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">正确率</div>
                    <div class="stat-value" :class="resultStats.accuracy >= 80 ? 'success' : 'error'">
                      {{ resultStats.accuracy }}%
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">回放用时</div>
                    <div class="stat-value">{{ formatTime(resultStats.duration) }}</div>
                  </div>
                </div>
                <div class="result-actions">
                  <button class="ghost" @click="startMemorize">再次练习</button>
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
      :active-route="ROUTES.ATTENTION_POETRY_CHALLENGE"
      @close="handleSidebarClose"
    />

    <div v-if="showLexiconModal" class="lexicon-overlay" @click.self="closeLexiconModal">
      <div class="lexicon-modal" :class="{ maximized: isMaximized }" @click.stop>
        <header class="lexicon-header">
          <div>
            <div class="badge ghost">诗词单词卡</div>
            <h3>按标签查找已有诗词</h3>
          </div>
          <div class="window-controls">
            <button class="btn-window-control" @click="toggleMaximize" title="最大化/还原">
              {{ isMaximized ? '还原' : '最大化' }}
            </button>
            <button class="btn-close" @click="closeLexiconModal" title="关闭">关闭</button>
          </div>
        </header>

        <div class="lexicon-body">
          <aside class="tag-panel">
            <div class="search-section">
              <div class="tag-title">诗词检索</div>
              <div class="search-input-group">
                <input
                  v-model="searchInput"
                  type="text"
                  placeholder="输入诗词标题进行检索"
                  class="search-input"
                  @keyup.enter="handleSearch"
                  :disabled="isSearching"
                />
                <button class="search-btn" @click="handleSearch" :disabled="isSearching || !searchInput.trim()">
                  {{ isSearching ? '检索中...' : '检索' }}
                </button>
              </div>
            </div>
            <div class="tag-section">
              <div class="tag-title">标签归类</div>
              <div class="tag-list" v-if="tagOptions.length">
                <button
                  v-for="tag in tagOptions"
                  :key="tag"
                  class="tag-chip"
                  :class="{ active: tag === selectedTag && !selectedAuthor }"
                  @click="selectTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
              <div class="tag-empty" v-else>暂无标签，请先生成并保存词单</div>
            </div>
            <div class="tag-section">
              <div class="tag-title">作者归类</div>
              <div class="tag-list" v-if="authorOptions.length">
                <button
                  v-for="author in authorOptions"
                  :key="author"
                  class="tag-chip"
                  :class="{ active: author === selectedAuthor && !selectedTag }"
                  @click="selectAuthor(author)"
                >
                  {{ author }}
                </button>
              </div>
              <div class="tag-empty" v-else>暂无作者数据</div>
            </div>
          </aside>

          <section class="lexicon-content">
            <div class="lexicon-list">
              <div class="list-title">
                {{ selectedTag ? `「${selectedTag}」的诗词` : selectedAuthor ? `「${selectedAuthor}」的诗词` : '请选择标签或作者' }}
                <span class="list-count" v-if="tagPoetries.length">{{ tagPoetries.length }} 首</span>
              </div>
              <div class="poetry-list">
                <div
                  v-for="item in tagPoetries"
                  :key="poetryKey(item)"
                  class="poetry-row"
                  :class="{ 
                    active: selectedLexiconPoetry?.title === item.title,
                    'mode-focus': selectedLexiconPoetry?.title === item.title && lexiconMode === 'focus',
                    'mode-video': selectedLexiconPoetry?.title === item.title && lexiconMode === 'video'
                  }"
                >
                  <div class="poetry-row-content" @click="enterFocusMode(item)">
                    <div class="poetry-row-main">
                      <span class="lexicon-poetry-name clickable" @click.stop="showPoetryPinyinModal(item)" title="点击查看中文和拼音">{{ item.title }}</span>
                      <span class="lexicon-poetry-pinyin">{{ item.content }}</span>
                    </div>
                    <div class="poetry-row-meta">
                      {{ item.dynasty || '朝代未详' }} · {{ item.author || '作者未详' }} · {{ item.theme || item.meaning || '待补充' }}
                    </div>
                  </div>
                  <button
                    v-if="item.videoUrl"
                    class="poetry-video-btn"
                    :class="{ active: selectedLexiconPoetry?.title === item.title && lexiconMode === 'video' }"
                    @click.stop="enterVideoMode(item)"
                    title="视频记忆模式"
                  >
                    <span class="video-icon">▶</span>
                  </button>
                </div>
                <div v-if="!lexiconLoading && !tagPoetries.length" class="tag-empty">该标签暂无诗词</div>
                <div v-if="lexiconLoading" class="tag-empty">载入中...</div>
              </div>
            </div>

            <div class="lexicon-detail-wrapper">
              <!-- 视频记忆模式 -->
              <div class="video-mode" v-if="selectedLexiconPoetry && lexiconMode === 'video' && selectedLexiconPoetry.videoUrl">
                <div class="video-mode-header">
                  <div>
                    <div class="lexicon-poetry-name">{{ selectedLexiconPoetry.title }}</div>
                    <div class="lexicon-poetry-pinyin">{{ selectedLexiconPoetry.pinyin }}</div>
                  </div>
                  <button class="mode-switch-btn" @click="enterFocusMode(selectedLexiconPoetry)">
                    切换到专注记忆模式
                  </button>
                </div>
                <div class="video-container-full">
                  <iframe
                    v-if="isVideoUrl(getEmbedVideoUrl(selectedLexiconPoetry.videoUrl))"
                    :src="getEmbedVideoUrl(selectedLexiconPoetry.videoUrl)"
                    :title="`${selectedLexiconPoetry.title} 介绍视频`"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="video-iframe-full"
                  ></iframe>
                  <a
                    v-else
                    :href="selectedLexiconPoetry.videoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="video-link-full"
                  >
                    点击观看视频：{{ selectedLexiconPoetry.videoUrl }}
                  </a>
                </div>
              </div>

              <!-- 专注记忆模式 -->
              <div class="lexicon-detail" v-else-if="selectedLexiconPoetry && lexiconMode === 'focus'">
                <div class="detail-header">
                  <div>
                    <div class="lexicon-poetry-name">{{ selectedLexiconPoetry.title }}</div>
                    <div class="lexicon-poetry-pinyin">{{ selectedLexiconPoetry.content }}</div>
                  </div>
                  <button 
                    v-if="selectedLexiconPoetry.videoUrl"
                    class="mode-switch-btn" 
                    @click="enterVideoMode(selectedLexiconPoetry)"
                  >
                    切换到视频记忆模式
                  </button>
                </div>
                <div class="detail-grid">
                  <div class="detail-block">
                    <div class="detail-label">作者</div>
                    <div class="detail-text">{{ selectedLexiconPoetry.author || '暂无' }}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">朝代</div>
                    <div class="detail-text">{{ selectedLexiconPoetry.dynasty || '暂无' }}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">诗词内容</div>
                    <div class="detail-text">{{ selectedLexiconPoetry.content || '暂无' }}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">释义 / 译文</div>
                    <div class="detail-text">{{ selectedLexiconPoetry.meaning || '暂无' }}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">创作背景</div>
                    <div class="detail-text">{{ selectedLexiconPoetry.background || '暂无背景' }}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">诗词赏析</div>
                    <div class="detail-text">{{ selectedLexiconPoetry.appreciation || '暂无赏析' }}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">主题 / 情感</div>
                    <div class="detail-text">{{ selectedLexiconPoetry.theme || '暂无' }}</div>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">记忆桩提示</div>
                    <ul class="memory-list">
                      <li v-for="tip in memoryAid(selectedLexiconPoetry)" :key="tip">{{ tip }}</li>
                    </ul>
                  </div>
                  <div class="detail-block">
                    <div class="detail-label">使用示例</div>
                    <ul class="usage-examples-list" v-if="getUsageExamples(selectedLexiconPoetry).length">
                      <li v-for="(example, idx) in getUsageExamples(selectedLexiconPoetry)" :key="idx">
                        {{ example }}
                      </li>
                    </ul>
                    <div class="detail-text" v-else>暂无例句</div>
                  </div>
                </div>
              </div>
              <div class="lexicon-placeholder" v-else>
                请选择左侧的诗词，进入专注记忆模式
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 诗词中文和拼音弹窗 -->
    <div v-if="showPinyinModal && selectedPoetryForPinyin" class="pinyin-overlay" @click.self="closePinyinModal">
      <div class="pinyin-modal" @click.stop>
        <header class="pinyin-header">
          <div>
            <div class="badge ghost">诗词详情</div>
            <h3>{{ selectedPoetryForPinyin.title }}</h3>
          </div>
          <button class="btn-close" @click="closePinyinModal" title="关闭">关闭</button>
        </header>
        <div class="pinyin-body">
          <div class="pinyin-content">
            <div class="pinyin-chinese">
              <div class="pinyin-label">中文</div>
              <div class="pinyin-text">{{ selectedPoetryForPinyin.content || '暂无内容' }}</div>
            </div>
            <div class="pinyin-pinyin" v-if="selectedPoetryForPinyin.pinyin">
              <div class="pinyin-label">拼音</div>
              <div class="pinyin-text">{{ selectedPoetryForPinyin.pinyin }}</div>
            </div>
            <div class="pinyin-meta" v-if="selectedPoetryForPinyin.author || selectedPoetryForPinyin.dynasty">
              <span v-if="selectedPoetryForPinyin.dynasty">{{ selectedPoetryForPinyin.dynasty }}</span>
              <span v-if="selectedPoetryForPinyin.author"> · {{ selectedPoetryForPinyin.author }}</span>
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
  generatePoetryList,
  getLatestPoetries,
  savePoetryRecord,
  getPoetryTopRecords,
  getPoetryTags,
  getPoetriesByTag,
  searchPoetry
} from '../../api/attentionPoetryChallenge.js'

const router = useRouter()
const sidebarOpen = ref(false)
const promptInput = ref('思乡怀远、山水田园')
const domainInput = ref('学习 / 演讲 / 写作')
const tagsInput = ref('思乡,山水,送别')
const poetryCount = ref('8')
const difficulty = ref('进阶')
const memorizeSeconds = ref('90')

const isLoadingPoetries = ref(false)
const isTransitioning = ref(false)
const isSaving = ref(false)

const gameStatus = ref('idle') // idle | memorizing | recalling | completed
const poetries = ref([])
const quiz = ref([])
const currentQuestionIndex = ref(0)
const memorizeRemaining = ref(0)
const recallStartAt = ref(0)
const recallElapsed = ref(0)
const resultStats = ref({ correct: 0, total: 0, duration: 0, accuracy: 0 })
const leaderboard = ref([])

const showLexiconModal = ref(false)
const tagOptions = ref([])
const selectedTag = ref('')
const authorOptions = ref([])
const selectedAuthor = ref('')
const tagPoetries = ref([])
const selectedLexiconPoetry = ref(null)
const lexiconLoading = ref(false)
const searchInput = ref('')
const isSearching = ref(false)
const isMaximized = ref(false)
const lexiconMode = ref('focus') // 'focus' 专注记忆模式 | 'video' 视频记忆模式
const showPinyinModal = ref(false)
const selectedPoetryForPinyin = ref(null)

let timerInterval = null
let recallTimerInterval = null

const showTimer = computed(() => gameStatus.value === 'memorizing')
const isRunning = computed(() => gameStatus.value !== 'idle')
const answeredCount = computed(() => quiz.value.filter((q) => q.userAnswer).length)
const statusText = computed(() => {
  if (gameStatus.value === 'memorizing') return '记忆中'
  if (gameStatus.value === 'recalling') return '回放中'
  if (gameStatus.value === 'completed') return '已完成'
  return '待开始'
})
const currentQuestion = computed(() => quiz.value[currentQuestionIndex.value] || null)
const progressPercent = computed(() => {
  if (!quiz.value.length) return 0
  return Math.round((answeredCount.value / quiz.value.length) * 100)
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const poetryKey = (poetry) => poetry.id || poetry.title || Math.random().toString(36).slice(2)

const shuffle = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const normalizePoetries = (list = []) =>
  list.map((item, idx) => ({
    id: item.id || idx + 1,
    title: item.title || `诗词${idx + 1}`,
    author: item.author || '',
    dynasty: item.dynasty || '',
    content: item.content || '',
    pinyin: item.pinyin || '',
    poetryType: item.poetryType || '',
    meaning: item.meaning || '',
    background: item.background || '',
    appreciation: item.appreciation || '',
    theme: item.theme || '',
    keywords: item.keywords || '',
    memoryCues: item.memoryCues || '',
    usageText: item.usageText || '',
    videoUrl: item.videoUrl || '',
    tags: item.tags || ''
  }))

const buildQuiz = () => {
  const optionsPool = poetries.value.map((p) => p.title)
  quiz.value = poetries.value.map((poetry) => {
    const prompt =
      poetry.theme ||
      poetry.meaning ||
      poetry.background ||
      poetry.appreciation?.slice(0, 40) ||
      '根据提示选择诗词'
    const others = optionsPool.filter((opt) => opt !== poetry.title)
    const distractors = shuffle(others).slice(0, Math.min(3, others.length))
    const options = shuffle([...distractors, poetry.title])
    return {
      poetry,
      prompt,
      options,
      answer: poetry.title,
      userAnswer: ''
    }
  })
  currentQuestionIndex.value = 0
}

const startTimer = () => {
  clearTimer()
  memorizeRemaining.value = parseInt(memorizeSeconds.value, 10) || 90
  timerInterval = setInterval(() => {
    if (memorizeRemaining.value <= 0) {
      enterRecall()
    } else {
      memorizeRemaining.value -= 1
    }
  }, 1000)
}

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const clearRecallTimer = () => {
  if (recallTimerInterval) {
    clearInterval(recallTimerInterval)
    recallTimerInterval = null
  }
}

const startMemorize = () => {
  if (!poetries.value.length) return
  isTransitioning.value = true
  gameStatus.value = 'memorizing'
  resultStats.value = { correct: 0, total: 0, duration: 0, accuracy: 0 }
  quiz.value = quiz.value.map((q) => ({ ...q, userAnswer: '' }))
  currentQuestionIndex.value = 0
  startTimer()
  setTimeout(() => {
    isTransitioning.value = false
  }, 180)
}

const enterRecall = () => {
  if (!poetries.value.length) return
  clearTimer()
  gameStatus.value = 'recalling'
  recallStartAt.value = performance.now()
  recallElapsed.value = 0
  // 启动回放计时器
  clearRecallTimer()
  recallTimerInterval = setInterval(() => {
    if (recallStartAt.value) {
      recallElapsed.value = Math.round((performance.now() - recallStartAt.value) / 1000)
    }
  }, 1000)
}

const selectOption = (option) => {
  if (!currentQuestion.value) return
  currentQuestion.value.userAnswer = option
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1
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
  clearRecallTimer()
  const total = quiz.value.length
  const correct = quiz.value.reduce((acc, q) => acc + (q.userAnswer === q.answer ? 1 : 0), 0)
  const duration = recallStartAt.value ? Math.round((performance.now() - recallStartAt.value) / 1000) : 0
  const accuracy = total ? Math.round((correct * 100) / total) : 0

  resultStats.value = { correct, total, duration, accuracy }
  recallElapsed.value = duration
  gameStatus.value = 'completed'

  await saveRecord(correct, total, accuracy, duration)
  fetchLeaderboard()
}

const saveRecord = async (correct, total, accuracy, duration) => {
  try {
    isSaving.value = true
    const detail = quiz.value.map((q) => ({
      poetry: q.answer,
      userAnswer: q.userAnswer,
      correct: q.userAnswer === q.answer,
      prompt: q.prompt
    }))
    await savePoetryRecord({
      prompt: promptInput.value,
      poetryIds: poetries.value.map((p) => p.id).join(','),
      poetryList: JSON.stringify(poetries.value),
      correctCount: correct,
      totalCount: total,
      accuracy,
      durationSeconds: duration,
      detail: JSON.stringify(detail)
    })
  } catch (error) {
    console.warn('保存记录失败：', error?.message || error)
  } finally {
    isSaving.value = false
  }
}

const generateAndStart = async () => {
  isLoadingPoetries.value = true
  try {
    const tags = tagsInput.value
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean)
    const payload = {
      prompt: promptInput.value,
      domain: domainInput.value,
      tags,
      count: parseInt(poetryCount.value, 10) || 6,
      difficulty: difficulty.value
    }
    const res = await generatePoetryList(payload)
    const data = res?.data || res || []
    poetries.value = normalizePoetries(data)
    buildQuiz()
    startMemorize()
    fetchLeaderboard()
  } catch (error) {
    console.warn('生成诗词失败：', error?.message || error)
  } finally {
    isLoadingPoetries.value = false
  }
}

const loadLatestPoetries = async () => {
  isLoadingPoetries.value = true
  try {
    const res = await getLatestPoetries(parseInt(poetryCount.value, 10) || 8)
    const data = res?.data || res || []
    poetries.value = normalizePoetries(data)
    buildQuiz()
    startMemorize()
  } catch (error) {
    console.warn('获取最近词单失败：', error?.message || error)
  } finally {
    isLoadingPoetries.value = false
  }
}

const fetchLeaderboard = async () => {
  try {
    const res = await getPoetryTopRecords(10)
    leaderboard.value = res?.data || res?.records || res || []
  } catch (error) {
    leaderboard.value = []
  }
}

const openLexiconModal = async () => {
  showLexiconModal.value = true
  if (!tagOptions.value.length) {
    await fetchTagsAndPoetries()
  }
}

const closeLexiconModal = () => {
  showLexiconModal.value = false
  selectedLexiconPoetry.value = null
  searchInput.value = ''
  isMaximized.value = false
  lexiconMode.value = 'focus'
  selectedTag.value = ''
  selectedAuthor.value = ''
}

const showPoetryPinyinModal = (poetry) => {
  selectedPoetryForPinyin.value = poetry
  showPinyinModal.value = true
}

const closePinyinModal = () => {
  showPinyinModal.value = false
  selectedPoetryForPinyin.value = null
}

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

const fetchTagsAndPoetries = async () => {
  lexiconLoading.value = true
  try {
    const tagRes = await getPoetryTags()
    const tags = tagRes?.data || tagRes || []
    tagOptions.value = tags
    
    // 获取诗词以提取作者列表
    let allPoetries = []
    if (tags.length > 0) {
      // 从多个标签获取数据以提取作者
      const promises = tags.slice(0, 10).map(tag => getPoetriesByTag(tag, 100))
      const results = await Promise.all(promises)
      allPoetries = results.flatMap(res => normalizePoetries(res?.data || res || []))
    } else {
      // 如果没有标签，获取最近的数据
      const latestRes = await getLatestPoetries(500)
      allPoetries = normalizePoetries(latestRes?.data || latestRes || [])
    }
    // 去重并提取作者
    const uniquePoetries = Array.from(new Map(allPoetries.map(p => [p.title, p])).values())
    const authors = [...new Set(uniquePoetries.map(p => p.author).filter(Boolean))].sort()
    authorOptions.value = authors
    
    if (tags.length) {
      selectedTag.value = selectedTag.value || tags[0]
      await fetchPoetriesBySelectedTag()
    } else if (authors.length) {
      selectedAuthor.value = selectedAuthor.value || authors[0]
      await fetchPoetriesBySelectedAuthor()
    } else {
      tagPoetries.value = []
    }
  } catch (error) {
    console.warn('获取标签失败', error)
    tagOptions.value = []
    authorOptions.value = []
    tagPoetries.value = []
  } finally {
    lexiconLoading.value = false
  }
}

const fetchPoetriesBySelectedTag = async () => {
  if (!selectedTag.value) {
    tagPoetries.value = []
    return
  }
  lexiconLoading.value = true
  try {
    const res = await getPoetriesByTag(selectedTag.value, 30)
    const data = res?.data || res || []
    tagPoetries.value = normalizePoetries(data)
    selectedLexiconPoetry.value = tagPoetries.value[0] || null
  } catch (error) {
    console.warn('按标签获取诗词失败', error)
    tagPoetries.value = []
    selectedLexiconPoetry.value = null
  } finally {
    lexiconLoading.value = false
  }
}

const selectTag = (tag) => {
  if (tag === selectedTag.value) return
  selectedTag.value = tag
  selectedAuthor.value = '' // 清除作者选择
  fetchPoetriesBySelectedTag()
}

const selectAuthor = (author) => {
  if (author === selectedAuthor.value) return
  selectedAuthor.value = author
  selectedTag.value = '' // 清除标签选择
  fetchPoetriesBySelectedAuthor()
}

const fetchPoetriesBySelectedAuthor = async () => {
  if (!selectedAuthor.value) {
    tagPoetries.value = []
    return
  }
  lexiconLoading.value = true
  try {
    // 尝试从所有标签获取数据，然后按作者过滤
    let allPoetries = []
    if (tagOptions.value.length > 0) {
      // 从所有标签获取数据
      const promises = tagOptions.value.slice(0, 10).map(tag => getPoetriesByTag(tag, 100))
      const results = await Promise.all(promises)
      allPoetries = results.flatMap(res => normalizePoetries(res?.data || res || []))
    } else {
      // 如果没有标签，尝试获取最近的数据
      const latestRes = await getLatestPoetries(500)
      allPoetries = normalizePoetries(latestRes?.data || latestRes || [])
    }
    // 去重并过滤
    const uniquePoetries = Array.from(new Map(allPoetries.map(p => [p.title, p])).values())
    tagPoetries.value = uniquePoetries.filter(p => p.author === selectedAuthor.value)
    selectedLexiconPoetry.value = tagPoetries.value[0] || null
  } catch (error) {
    console.warn('按作者获取诗词失败', error)
    tagPoetries.value = []
    selectedLexiconPoetry.value = null
  } finally {
    lexiconLoading.value = false
  }
}

const selectLexiconPoetry = (poetry) => {
  selectedLexiconPoetry.value = poetry
  lexiconMode.value = 'focus' // 默认进入专注记忆模式
}

const enterFocusMode = (poetry) => {
  selectedLexiconPoetry.value = poetry
  lexiconMode.value = 'focus'
}

const enterVideoMode = (poetry) => {
  if (!poetry.videoUrl) {
    console.warn('该诗词没有视频')
    return
  }
  selectedLexiconPoetry.value = poetry
  lexiconMode.value = 'video'
}

const addPoetryToList = (poetry) => {
  const exists = tagPoetries.value.some(item => item.title === poetry.title)
  if (!exists) {
    tagPoetries.value = [poetry, ...tagPoetries.value]
  }
}

const handleSearch = async () => {
  const titleText = searchInput.value.trim()
  if (!titleText) {
    return
  }
  
  isSearching.value = true
  try {
    const res = await searchPoetry(titleText)
    const data = res?.data || res
    if (!data) {
      console.warn('检索结果为空')
      return
    }
    
    const normalized = normalizePoetries([data])[0]
    
    // 如果检索到的诗词有标签，尝试选中对应的标签并获取该标签下的诗词列表
    if (normalized.tags) {
      const tags = normalized.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
      const firstTag = tags[0]
      if (firstTag && tagOptions.value.includes(firstTag)) {
        selectedTag.value = firstTag
        await fetchPoetriesBySelectedTag()
      }
    }
    
    // 确保检索到的诗词在列表中
    addPoetryToList(normalized)
    
    // 更新选中的诗词，默认进入专注记忆模式
    selectedLexiconPoetry.value = normalized
    lexiconMode.value = 'focus'
  } catch (error) {
    console.error('检索诗词失败：', error)
    alert('检索失败：' + (error?.message || '未知错误'))
  } finally {
    isSearching.value = false
  }
}

const getUsageExamples = (poetry) => {
  if (!poetry) return []
  const usageText = poetry.usageText || ''
  if (!usageText) return []
  // 如果是以换行符分隔的多个示例，拆分成数组
  if (usageText.includes('\n')) {
    return usageText.split('\n').filter(line => line.trim())
  }
  // 如果是单个示例，返回数组
  return [usageText]
}

const isVideoUrl = (url) => {
  if (!url) return false
  // 检查是否是iframe可嵌入的视频URL（如B站、YouTube等）
  return url.includes('player.bilibili.com') || 
         url.includes('youtube.com/embed') || 
         url.includes('youtu.be') ||
         url.includes('v.qq.com') ||
         url.includes('youku.com') ||
         url.includes('iqiyi.com')
}

const getEmbedVideoUrl = (url) => {
  if (!url) return ''
  // 如果已经是嵌入URL，直接返回
  if (isVideoUrl(url)) {
    return url
  }
  // 尝试转换B站普通链接为嵌入链接
  // 例如: https://www.bilibili.com/video/BV1xx411c7mu?p=2
  // 转换为: https://player.bilibili.com/player.html?bvid=BV1xx411c7mu&page=2
  const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/)
  if (bilibiliMatch) {
    const bvid = bilibiliMatch[1]
    // 提取页码参数：优先查找 ?p=数字，其次查找 #page=数字，最后默认为1
    let page = 1
    const pMatch = url.match(/[?&]p=(\d+)/)
    if (pMatch) {
      page = parseInt(pMatch[1], 10) || 1
    } else {
      const pageMatch = url.match(/#page=(\d+)/)
      if (pageMatch) {
        page = parseInt(pageMatch[1], 10) || 1
      }
    }
    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}`
  }
  // 如果无法转换，返回原URL（将显示为链接）
  return url
}

const memoryAid = (poetry) => {
  const tips = []
  if (poetry.memoryCues) tips.push(poetry.memoryCues)
  if (poetry.background) tips.push(`背景画面：${poetry.background.slice(0, 60)}...`)
  if (poetry.theme) tips.push(`主题锚点：${poetry.theme}`)
  if (poetry.keywords) tips.push(`关键词：${poetry.keywords}`)
  if (!tips.length) tips.push('尝试画面、情感、韵律三步法来记忆。')
  return tips.slice(0, 4)
}


const resetGame = () => {
  clearTimer()
  clearRecallTimer()
  gameStatus.value = 'idle'
  quiz.value = []
  memorizeRemaining.value = 0
  recallElapsed.value = 0
  resultStats.value = { correct: 0, total: 0, duration: 0, accuracy: 0 }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const goBack = () => {
  router.navigate(ROUTES.ATTENTION_TRAINING)
}


const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (showPinyinModal.value) {
      closePinyinModal()
    } else if (showLexiconModal.value) {
      closeLexiconModal()
    }
  }
}

onMounted(() => {
  loadLatestPoetries()
  fetchLeaderboard()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  clearTimer()
  clearRecallTimer()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.poetry-challenge-container {
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
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.72) 0%,
    rgba(0, 0, 0, 0.82) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.35);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.18),
    inset 0 0 30px rgba(255, 215, 0, 0.05),
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
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.35);
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
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  padding: 12px;
  border-radius: 12px;
  position: relative;
  z-index: 5;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
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

.control-item textarea {
  resize: vertical;
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

.status.memorizing {
  color: #f4d03f;
}

.status.recalling {
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
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 14px;
  padding: 24px;
  position: relative;
  z-index: 5;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
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

.memorizing-mode,
.recall-mode {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.group-header,
.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.group-number {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.timer {
  font-size: 18px;
  font-weight: 700;
  color: #f4d03f;
}

.card-grid-display {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.poetry-preview {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 215, 0, 0.18);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.poetry-title {
  display: flex;
  gap: 6px;
  align-items: baseline;
  color: #ffd700;
  font-weight: 800;
}

.poetry-title .pinyin {
  color: #c5c5c5;
  font-weight: 500;
  font-size: 12px;
}

.poetry-meta {
  color: #8fd19e;
  font-size: 12px;
}

.poetry-content {
  color: #f7f7f7;
  font-size: 14px;
  line-height: 1.6;
}

.poetry-text {
  color: #f7f7f7;
  font-size: 14px;
}

.poetry-text.light {
  color: #c5c5c5;
}

.poetry-text.tiny {
  color: #a9c8ff;
  font-size: 12px;
}

.hint-text {
  color: #c5c5c5;
  font-size: 16px;
  text-align: center;
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

.question-detail {
  color: #c5c5c5;
  font-size: 13px;
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

@media (max-width: 960px) {
  .main-content {
    padding: 100px 20px 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

.lexicon-overlay {
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

.lexicon-modal {
  width: min(1200px, 94vw);
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

.lexicon-modal.maximized {
  width: 98vw;
  max-height: calc(100vh - 120px);
}

.lexicon-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.window-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-window-control {
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(52, 152, 219, 0.18);
  border: 1px solid rgba(52, 152, 219, 0.5);
  color: #3498db;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-window-control:hover {
  background: rgba(52, 152, 219, 0.3);
  border-color: rgba(52, 152, 219, 0.7);
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

.lexicon-body {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 14px;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  overflow-x: hidden;
}

.tag-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tag-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.search-section {
  margin-bottom: 16px;
}

.search-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.search-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px 12px;
  color: #f7f7f7;
  font-size: 14px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.5);
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f4d03f, #f39c12);
  color: #0c0c0f;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 208, 63, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tag-title {
  color: #ffd700;
  font-weight: 700;
  margin-bottom: 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.tag-chip {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px 12px;
  font-size: 12px;
}

.tag-chip.active {
  border-color: rgba(255, 215, 0, 0.8);
  color: #ffd700;
  background: rgba(255, 215, 0, 0.12);
}

.tag-empty {
  color: #c5c5c5;
  font-size: 13px;
  text-align: center;
  padding: 16px 6px;
}

.lexicon-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 12px;
  overflow: hidden;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
}

.lexicon-detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  min-height: 0;
}

.lexicon-list {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  overflow-x: hidden;
  min-height: 0;
}

.list-title {
  color: #ffd700;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.list-count {
  font-size: 12px;
  color: #c5c5c5;
}

.poetry-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.poetry-row {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px;
  transition: all 0.2s;
}

.poetry-row.active {
  border-color: rgba(255, 215, 0, 0.8);
  background: rgba(255, 215, 0, 0.08);
}

.poetry-row.mode-focus {
  border-color: rgba(52, 152, 219, 0.6);
  background: rgba(52, 152, 219, 0.1);
}

.poetry-row.mode-video {
  border-color: rgba(231, 76, 60, 0.6);
  background: rgba(231, 76, 60, 0.1);
}

.poetry-row-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.poetry-row-content:hover {
  opacity: 0.9;
}

.poetry-video-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(231, 76, 60, 0.15);
  border: 1px solid rgba(231, 76, 60, 0.4);
  color: #e74c3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.poetry-video-btn:hover {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.6);
  transform: scale(1.1);
}

.poetry-video-btn.active {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.8);
  color: #ff6b6b;
  box-shadow: 0 0 12px rgba(231, 76, 60, 0.4);
}

.video-icon {
  font-size: 14px;
  margin-left: 2px;
}

.poetry-row-main {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  color: #ffd700;
}

.poetry-row-meta {
  color: #c5c5c5;
  font-size: 12px;
  margin-top: 4px;
}

.lexicon-detail {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
}

.lexicon-placeholder {
  display: grid;
  place-items: center;
  color: #c5c5c5;
  min-height: 400px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.mode-switch-btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(52, 152, 219, 0.15);
  border: 1px solid rgba(52, 152, 219, 0.4);
  color: #3498db;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}

.mode-switch-btn:hover {
  background: rgba(52, 152, 219, 0.25);
  border-color: rgba(52, 152, 219, 0.6);
}

.video-mode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
}

.video-mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.video-container-full {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-iframe-full {
  width: 100%;
  height: 100%;
  min-height: 500px;
  max-height: calc(100vh - 300px);
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  border: none;
}

.video-link-full {
  color: #3498db;
  text-decoration: none;
  word-break: break-all;
  display: block;
  padding: 24px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(52, 152, 219, 0.3);
  transition: all 0.2s;
  text-align: center;
  font-size: 16px;
}

.video-link-full:hover {
  background: rgba(52, 152, 219, 0.2);
  border-color: rgba(52, 152, 219, 0.5);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}

.detail-block {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 10px;
}

.detail-label {
  color: #8fd19e;
  font-size: 12px;
  margin-bottom: 6px;
}

.detail-text {
  color: #f7f7f7;
  line-height: 1.5;
  font-size: 14px;
}

.memory-list {
  list-style: disc;
  padding-left: 18px;
  color: #f7f7f7;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.usage-examples-list {
  list-style: decimal;
  padding-left: 20px;
  color: #f7f7f7;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.usage-examples-list li {
  padding-left: 4px;
}


.lexicon-poetry-name {
  color: #ffd700;
  font-weight: 800;
  font-size: 20px;
}

.lexicon-poetry-name.clickable {
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: underline;
  text-decoration-color: transparent;
}

.lexicon-poetry-name.clickable:hover {
  color: #f4d03f;
  text-decoration-color: #f4d03f;
}

.lexicon-poetry-pinyin {
  color: #c5c5c5;
  font-size: 12px;
}

.pinyin-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.pinyin-modal {
  width: min(600px, 90vw);
  max-height: 80vh;
  background: #0d0f1a;
  border: 1px solid rgba(255, 215, 0, 0.35);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

.pinyin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pinyin-header h3 {
  color: #ffd700;
  font-size: 20px;
  margin: 8px 0 0;
}

.pinyin-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.pinyin-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pinyin-chinese,
.pinyin-pinyin {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 16px;
}

.pinyin-label {
  color: #8fd19e;
  font-size: 12px;
  margin-bottom: 8px;
  font-weight: 700;
}

.pinyin-text {
  color: #f7f7f7;
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.pinyin-meta {
  color: #c5c5c5;
  font-size: 14px;
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}
</style>