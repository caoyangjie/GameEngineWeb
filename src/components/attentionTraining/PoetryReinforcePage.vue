<template>
  <div class="poetry-reinforce-container">
    <!-- 背景层，与全局页面保持一致 -->
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
          <div class="badge">诗词巩固 · 专注力</div>
          <h1 class="page-title">诗词字格记忆游戏</h1>
          <p class="subtitle">选择一首诗词，将诗词的每个字打乱放入格子中。按照诗词的原始顺序依次点击完成，用于记忆诗词句子。点击第一个字开始计时。</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="goBack">返回训练中心</button>
        </div>
      </header>

      <div class="content-grid">
        <section class="leaderboard">
          <div class="leaderboard-header">
            <div>
              <div class="badge ghost">TOP 10</div>
              <h2>最快记录榜</h2>
              <p class="subtitle">按用时升序展示，完成后会自动写入后端并刷新列表。</p>
            </div>
            <button class="ghost" @click="fetchLeaderboard" :disabled="boardLoading">
              {{ boardLoading ? '刷新中...' : '手动刷新' }}
            </button>
          </div>

          <div v-if="boardLoading" class="board-empty">正在加载排行榜...</div>
          <div v-else-if="!topRecords.length" class="board-empty">暂无记录，赶紧创建第一条成绩吧！</div>
          <div v-else class="board-list">
            <div
              v-for="(item, index) in topRecords"
              :key="item.id || index"
              class="board-row"
              :class="{ active: selectedRecord?.id === item.id }"
              @click="selectRecord(item)"
            >
              <div class="rank">#{{ index + 1 }}</div>
              <div class="meta">
                <div class="name">{{ item.username || '匿名玩家' }}</div>
                <div class="meta-line">
                  {{ formatMs(item.durationMs) }} · {{ item.poetryTitle || '未知诗词' }} · {{ formatDate(item.createTime) }}
                </div>
              </div>
              <div class="time">{{ formatMs(item.durationMs) }}</div>
            </div>
          </div>

          <!-- 诗词详情展示 -->
          <div v-if="selectedRecordPoetry || currentPoetry" class="poetry-detail-section">
            <div class="detail-header">
              <div class="badge ghost">诗词详情</div>
              <h3>{{ displayPoetry.title }}</h3>
            </div>
            <div class="detail-grid">
              <div class="detail-block">
                <div class="detail-label">作者</div>
                <div class="detail-text">{{ displayPoetry.author || '暂无' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">朝代</div>
                <div class="detail-text">{{ displayPoetry.dynasty || '暂无' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">诗词内容</div>
                <div class="detail-text">{{ displayPoetry.content || '暂无' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">释义 / 译文</div>
                <div class="detail-text">{{ displayPoetry.meaning || '暂无' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">创作背景</div>
                <div class="detail-text">{{ displayPoetry.background || '暂无背景' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">诗词赏析</div>
                <div class="detail-text">{{ displayPoetry.appreciation || '暂无赏析' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">主题 / 情感</div>
                <div class="detail-text">{{ displayPoetry.theme || '暂无' }}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">记忆桩提示</div>
                <ul class="memory-list">
                  <li v-for="tip in memoryAid(displayPoetry)" :key="tip">{{ tip }}</li>
                </ul>
              </div>
              <div class="detail-block">
                <div class="detail-label">使用示例</div>
                <ul class="usage-examples-list" v-if="getUsageExamples(displayPoetry).length">
                  <li v-for="(example, idx) in getUsageExamples(displayPoetry)" :key="idx">
                    {{ example }}
                  </li>
                </ul>
                <div class="detail-text" v-else>暂无例句</div>
              </div>
            </div>
          </div>
        </section>

        <div class="game-column">
          <section class="controls">
            <div class="control-item wide">
              <label for="poetry-search">检索诗词</label>
              <div class="search-input-group">
                <input
                  id="poetry-search"
                  v-model="searchInput"
                  type="text"
                  placeholder="输入诗词标题进行检索，例如：静夜思、春晓"
                  class="search-input"
                  @keyup.enter="handleSearch"
                  :disabled="isSearching || isRunning"
                />
                <button class="search-btn" @click="handleSearch" :disabled="isSearching || isRunning || !searchInput.trim()">
                  {{ isSearching ? '检索中...' : '检索' }}
                </button>
              </div>
            </div>
            <div class="control-item" v-if="currentPoetry">
              <div class="label">诗词信息</div>
              <div class="poetry-info">
                <div class="poetry-title-display">{{ currentPoetry.title }}</div>
                <div class="poetry-author">{{ currentPoetry.author || '未知' }} · {{ currentPoetry.dynasty || '未知朝代' }}</div>
                <div class="poetry-content-preview">{{ currentPoetry.content }}</div>
              </div>
            </div>
            <div class="control-item compact">
              <div class="label">当前状态</div>
              <div class="status" :class="gameStatus">
                {{ statusText }}
              </div>
            </div>
            <div class="control-item compact">
              <div class="label">计时</div>
              <div class="timer">
                {{ formattedElapsed }}
              </div>
            </div>
            <div class="control-item compact">
              <div class="label">目标字符</div>
              <div class="next-number">{{ expectedChar || '等待开始' }}</div>
            </div>
            <div class="control-item compact">
              <div class="label">进度</div>
              <div class="progress-text">{{ progress.toFixed(0) }}%</div>
            </div>
            <div class="control-actions">
              <button class="ghost" @click="resetGame">重置</button>
            </div>
          </section>

          <section class="grid-card" v-if="currentPoetry && gridItems.length">
            <div class="grid-header">
              <div>
                <div class="label">诗词标题</div>
                <div class="value">{{ currentPoetry.title }}</div>
              </div>
              <div class="progress">
                <div class="label">进度</div>
                <div class="bar">
                  <div class="fill" :style="{ width: progress + '%' }"></div>
                </div>
                <div class="progress-text">{{ progress.toFixed(0) }}%</div>
              </div>
            </div>

            <div class="grid-wrapper">
              <div
                class="grid"
                :style="{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }"
              >
                <button
                  v-for="(item, index) in gridItems"
                  :key="`${item}-${index}`"
                  class="cell"
                  :class="cellClass(item, index)"
                  @click="handleCellClick(item, index)"
                >
                  <span>{{ item }}</span>
                </button>
              </div>
            </div>

            <div class="tips">
              <p>规则：按照诗词的原始顺序依次点击字符完成。点击第一个字开始计时，直到所有字符点击完毕。</p>
              <p class="secondary">提示：每次开始都会打乱字符顺序；刷新不清空已存的排行榜数据。</p>
            </div>
          </section>

          <section v-else-if="!currentPoetry" class="grid-card empty-state">
            <div class="empty-message">
              <p>请输入诗词标题进行检索，开始游戏</p>
              <p class="hint">例如：静夜思、春晓、登鹳雀楼等</p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_POETRY_REINFORCE"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { getUserInfo } from '../../utils/auth.js'
import { searchPoetry } from '../../api/attentionPoetryChallenge.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'

const router = useRouter()
const searchInput = ref('')
const isSearching = ref(false)
const currentPoetry = ref(null)
const gridItems = ref([])
const expectedChar = ref('')
const expectedIndex = ref(0)
const clickedIndices = ref(new Set())
const gameStatus = ref('idle') // idle | running | completed
const timer = reactive({
  startAt: 0,
  elapsedMs: 0,
  rafId: null,
  isRunning: false
})
const boardLoading = ref(false)
const topRecords = ref([])
const selectedRecord = ref(null)
const selectedRecordPoetry = ref(null)
const sidebarOpen = ref(false)

const userInfo = getUserInfo()
const username = computed(() => userInfo?.username || userInfo?.nickName || 'guest')
const userId = computed(() => userInfo?.id || userInfo?.userId || userInfo?.user_id || 'guest')

// 用于详情展示的诗词（优先显示选中的记录，否则显示当前诗词）
const displayPoetry = computed(() => {
  return selectedRecordPoetry.value || currentPoetry.value
})

// 提取诗词中的字符（去除标点符号和空格）
const extractChars = (content) => {
  if (!content) return []
  // 去除标点符号、空格、换行等，只保留中文字符
  return content.replace(/[^\u4e00-\u9fa5]/g, '').split('')
}

// 计算合适的网格大小
const calculateGridSize = (charCount) => {
  if (charCount <= 0) return 3
  // 找到最小的平方数，使得 gridSize^2 >= charCount
  const gridSize = Math.ceil(Math.sqrt(charCount))
  return Math.max(3, Math.min(10, gridSize)) // 最小3，最大10
}

const totalCells = computed(() => {
  if (!currentPoetry.value) return 0
  const chars = extractChars(currentPoetry.value.content)
  const gridSize = calculateGridSize(chars.length)
  return gridSize * gridSize
})

const gridSize = computed(() => {
  if (!currentPoetry.value) return 3
  const chars = extractChars(currentPoetry.value.content)
  return calculateGridSize(chars.length)
})

const isRunning = computed(() => timer.isRunning)
const formattedElapsed = computed(() => formatMs(timer.elapsedMs))
const progress = computed(() => {
  if (!currentPoetry.value || !expectedChar.value) return 0
  const chars = extractChars(currentPoetry.value.content)
  return (expectedIndex.value / chars.length) * 100
})
const statusText = computed(() => {
  if (gameStatus.value === 'running') return '计时中'
  if (gameStatus.value === 'completed') return '已完成'
  return '待开始'
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const shuffle = (arr) => {
  const clone = arr.slice()
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[clone[i], clone[j]] = [clone[j], clone[i]]
  }
  return clone
}

const generateGrid = () => {
  if (!currentPoetry.value) return
  
  const chars = extractChars(currentPoetry.value.content)
  if (chars.length === 0) {
    console.warn('诗词内容为空，无法生成网格')
    return
  }
  
  // 计算需要的格子数
  const neededCells = gridSize.value * gridSize.value
  
  // 如果字符数少于格子数，用随机字符填充（这里用重复字符）
  let items = [...chars]
  while (items.length < neededCells) {
    // 随机选择已有字符填充
    const randomChar = chars[Math.floor(Math.random() * chars.length)]
    items.push(randomChar)
  }
  
  // 打乱顺序
  gridItems.value = shuffle(items)
  
  // 重置游戏状态
  expectedIndex.value = 0
  expectedChar.value = chars[0] || ''
  clickedIndices.value = new Set()
}

const startTimer = () => {
  stopTimer()
  timer.startAt = performance.now()
  timer.elapsedMs = 0
  timer.isRunning = true
  const tick = (now) => {
    if (!timer.isRunning) return
    timer.elapsedMs = now - timer.startAt
    timer.rafId = requestAnimationFrame(tick)
  }
  timer.rafId = requestAnimationFrame(tick)
}

const stopTimer = () => {
  if (timer.rafId) {
    cancelAnimationFrame(timer.rafId)
    timer.rafId = null
  }
  timer.isRunning = false
}

const startGame = () => {
  startTimer()
  gameStatus.value = 'running'
}

const resetGame = () => {
  stopTimer()
  gameStatus.value = 'idle'
  timer.elapsedMs = 0
  if (currentPoetry.value) {
    generateGrid()
  }
}

const handleCellClick = (char, index) => {
  if (!currentPoetry.value) return
  
  const chars = extractChars(currentPoetry.value.content)
  const currentExpectedChar = chars[expectedIndex.value]
  
  // 如果点击的不是期望的字符，或者已经点击过，则忽略
  if (char !== currentExpectedChar || clickedIndices.value.has(index)) {
    return
  }
  
  // 如果是第一个字符，开始计时
  if (expectedIndex.value === 0 && !timer.isRunning) {
    startGame()
  }
  
  // 标记为已点击
  clickedIndices.value.add(index)
  
  // 更新期望的字符
  expectedIndex.value += 1
  if (expectedIndex.value < chars.length) {
    expectedChar.value = chars[expectedIndex.value]
  } else {
    // 已完成
    finalizeGame()
  }
}

const finalizeGame = async () => {
  if (gameStatus.value === 'completed') return
  stopTimer()
  gameStatus.value = 'completed'

  const payload = {
    poetryTitle: currentPoetry.value?.title || '',
    poetryId: currentPoetry.value?.id || '',
    durationMs: Math.round(timer.elapsedMs),
    username: username.value
  }

  try {
    // 保存记录到后端（需要后端API支持）
    console.log('游戏完成，记录：', payload)
  } catch (error) {
    console.warn('保存记录失败，将不会影响本地体验：', error?.message || error)
  }

  fetchLeaderboard()
}

// 规范化诗词数据格式
const normalizePoetry = (poetry) => {
  if (!poetry) return null
  return {
    id: poetry.id || null,
    title: poetry.title || '',
    author: poetry.author || '',
    dynasty: poetry.dynasty || '',
    content: poetry.content || '',
    pinyin: poetry.pinyin || '',
    meaning: poetry.meaning || '',
    theme: poetry.theme || '',
    background: poetry.background || '',
    appreciation: poetry.appreciation || '',
    keywords: poetry.keywords || '',
    memoryCues: poetry.memoryCues || '',
    usageText: poetry.usageText || '',
    tags: poetry.tags || ''
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
      alert('检索结果为空，请检查诗词标题是否正确')
      return
    }
    
    const normalized = normalizePoetry(data)
    if (!normalized || !normalized.content) {
      alert('检索到的诗词内容为空，无法开始游戏')
      return
    }
    
    // 设置当前诗词并重置游戏
    currentPoetry.value = normalized
    // 同时设置详情展示的诗词
    selectedRecordPoetry.value = normalized
    // 清除选中的排行榜记录
    selectedRecord.value = null
    resetGame()
  } catch (error) {
    console.error('检索诗词失败：', error)
    alert('检索失败：' + (error?.message || '未知错误，请稍后重试'))
  } finally {
    isSearching.value = false
  }
}

const fetchLeaderboard = async () => {
  boardLoading.value = true
  try {
    // 获取排行榜（需要后端API支持）
    topRecords.value = []
  } catch (error) {
    console.warn('获取排行榜失败：', error?.message || error)
    topRecords.value = []
  } finally {
    boardLoading.value = false
  }
}

const selectRecord = async (record) => {
  selectedRecord.value = record
  // 如果记录中有诗词标题，尝试获取诗词详情
  if (record.poetryTitle) {
    try {
      const res = await searchPoetry(record.poetryTitle)
      const data = res?.data || res
      if (data) {
        selectedRecordPoetry.value = normalizePoetry(data)
      } else {
        selectedRecordPoetry.value = null
      }
    } catch (error) {
      console.warn('获取诗词详情失败：', error?.message || error)
      selectedRecordPoetry.value = null
    }
  } else {
    selectedRecordPoetry.value = null
  }
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

const goBack = () => {
  router.navigate(ROUTES.ATTENTION_TRAINING)
}

const cellClass = (char, index) => {
  if (clickedIndices.value.has(index)) return 'clicked'
  return ''
}

const formatMs = (ms) => {
  const totalMs = Math.max(0, Math.round(ms))
  const minutes = Math.floor(totalMs / 60000)
  const seconds = Math.floor((totalMs % 60000) / 1000)
  const centiseconds = Math.floor((totalMs % 1000) / 10)
  const pad = (n, len = 2) => String(n).padStart(len, '0')
  return `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '刚刚'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days}天前`
    } else if (hours > 0) {
      return `${hours}小时前`
    } else if (minutes > 0) {
      return `${minutes}分钟前`
    } else if (seconds > 0) {
      return `${seconds}秒前`
    } else {
      return '刚刚'
    }
  } catch (e) {
    return dateStr
  }
}

onMounted(() => {
  fetchLeaderboard()
})
</script>

<style scoped>
.poetry-reinforce-container {
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
  font-size: 36px;
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
  grid-template-columns: 1fr 1.3fr;
  gap: 16px;
  align-items: stretch;
}

.leaderboard {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 5;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
  height: 100%;
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leaderboard h2 {
  margin: 6px 0;
  font-size: 22px;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
}

.board-empty {
  text-align: center;
  padding: 20px;
  color: #c5c5c5;
}

.board-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.board-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.board-row:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.board-row.active {
  border-color: rgba(255, 215, 0, 0.6);
  background: rgba(255, 215, 0, 0.1);
}

.rank {
  width: 48px;
  text-align: center;
  font-weight: 800;
  color: #f4d03f;
}

.meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: 700;
}

.meta-line {
  color: #8aa0c2;
  font-size: 12px;
}

.time {
  font-weight: 700;
  color: #1dd1a1;
}

.game-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  align-items: start;
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
.control-item select {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px;
  color: #f7f7f7;
}

.search-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.search-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px 12px;
  color: #f7f7f7;
  font-size: 14px;
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
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 208, 63, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.poetry-info {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.poetry-title-display {
  font-size: 16px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 4px;
}

.poetry-author {
  font-size: 12px;
  color: #8aa0c2;
  margin-bottom: 6px;
}

.poetry-content-preview {
  font-size: 14px;
  color: #c5c5c5;
  line-height: 1.6;
  white-space: pre-wrap;
}

.label {
  color: #c5c5c5;
  font-size: 12px;
}

.status {
  font-weight: 700;
  font-size: 18px;
}

.status.running {
  color: #f4d03f;
}

.status.completed {
  color: #1dd1a1;
}

.timer {
  font-size: 22px;
  font-weight: 700;
  color: #f4d03f;
}

.next-number {
  font-size: 22px;
  font-weight: 700;
  color: #ffd166;
}

.progress-text {
  font-size: 18px;
  font-weight: 700;
  color: #1dd1a1;
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

.grid-card {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 5;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
}

.grid-card.empty-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-message {
  text-align: center;
  color: #c5c5c5;
}

.empty-message p {
  margin-bottom: 8px;
  font-size: 16px;
}

.empty-message .hint {
  font-size: 14px;
  color: #8aa0c2;
  margin-top: 8px;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.value {
  font-size: 20px;
  font-weight: 700;
  color: #ffd700;
}

.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress .bar {
  width: 160px;
  height: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.progress .fill {
  height: 100%;
  background: linear-gradient(90deg, #f4d03f, #1dd1a1);
  transition: width 0.2s ease;
}

.progress .progress-text {
  color: #c5c5c5;
  font-size: 12px;
}

.grid-wrapper {
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}

.grid {
  display: grid;
  gap: 6px;
  width: 100%;
  height: 100%;
  align-items: stretch;
  justify-items: stretch;
}

.cell {
  position: relative;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 700;
  font-size: 18px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f7f7f7;
}

.cell.clicked {
  background: rgba(16, 37, 27, 0.6);
  border-color: rgba(29, 209, 161, 0.5);
  color: #1dd1a1;
}

.cell:hover:not(.clicked) {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.2);
}

.tips {
  background: rgba(0, 0, 0, 0.4);
  padding: 10px 12px;
  border-radius: 10px;
  color: #c5c5c5;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.tips .secondary {
  color: #8aa0c2;
  margin-top: 4px;
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

  .controls {
    grid-template-columns: 1fr;
  }

  .grid-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.poetry-detail-section {
  margin-top: 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px;
  max-height: 60vh;
  overflow-y: auto;
}

.poetry-detail-section .detail-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.poetry-detail-section .detail-header h3 {
  color: #ffd700;
  font-size: 18px;
  margin: 8px 0 0;
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
  font-weight: 700;
}

.detail-text {
  color: #f7f7f7;
  line-height: 1.5;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
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
</style>

