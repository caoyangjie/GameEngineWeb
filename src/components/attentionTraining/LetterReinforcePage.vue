<template>
  <div class="letter-reinforce-container">
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
          <div class="badge">字母巩固 · 专注力</div>
          <h1 class="page-title">字母巩固方格游戏</h1>
          <p class="subtitle">设置一个数字 N，生成 N×N 方格，填入字母 A-Z 和数字 1-N²（字母不足时用数字补全）。进入后自动计时，按字母顺序（A-Z）然后数字顺序（1-N²）点击完成即可结算成绩并写入 TOP10 榜单。</p>
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
              <h2>{{ gridSize }}×{{ gridSize }} 最快记录榜</h2>
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
            >
              <div class="rank">#{{ index + 1 }}</div>
              <div class="meta">
                <div class="name">{{ item.username || '匿名玩家' }}</div>
                <div class="meta-line">
                  {{ formatMs(item.durationMs) }} · {{ item.gridSize }}×{{ item.gridSize }} · {{ formatDate(item.createTime) }}
                </div>
              </div>
              <div class="time">{{ formatMs(item.durationMs) }}</div>
            </div>
          </div>
        </section>

        <div class="game-column">
          <section class="controls">
            <div class="control-item">
              <label for="grid-size">方格尺寸 (N)</label>
              <input
                id="grid-size"
                v-model.number="gridSize"
                type="number"
                min="2"
                max="10"
                @change="normalizeGridSize"
                :disabled="isRunning"
              />
              <span class="hint">最小 2，最大 10，默认 5。</span>
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
              <div class="next-number">{{ expectedItem }}</div>
            </div>
            <div class="control-actions">
              <button class="ghost" @click="resetGame">重置</button>
            </div>
          </section>

          <section class="grid-card">
            <div class="grid-header">
              <div>
                <div class="label">当前尺寸</div>
                <div class="value">{{ gridSize }} × {{ gridSize }}</div>
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
                  v-for="item in gridItems"
                  :key="item"
                  class="cell"
                  :class="cellClass(item)"
                  @click="handleCellClick(item)"
                >
                  <span>{{ item }}</span>
                </button>
              </div>
            </div>

            <div class="tips">
              <p>规则：点击字母 A 开始，按字母顺序（A-Z）然后数字顺序（1-{{ totalCells }}）点击完成。计时在开始后持续，直到所有字符点击完毕。</p>
              <p class="secondary">提示：每次开始都会打乱字符；刷新不清空已存的排行榜数据。</p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_LETTER_REINFORCE"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { getUserInfo } from '../../utils/auth.js'
import { getLetterReinforceTopRecords, saveLetterReinforceRecord } from '../../api/attentionLetterReinforce.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'

const router = useRouter()
const gridSize = ref(5)
const gridItems = ref([])
const expectedItem = ref('A')
const clickedSet = ref(new Set())
const gameStatus = ref('idle') // idle | running | completed
const timer = reactive({
  startAt: 0,
  elapsedMs: 0,
  rafId: null,
  isRunning: false
})
const boardLoading = ref(false)
const topRecords = ref([])
const sidebarOpen = ref(false)

const userInfo = getUserInfo()
const username = computed(() => userInfo?.username || userInfo?.nickName || 'guest')
const userId = computed(() => userInfo?.id || userInfo?.userId || userInfo?.user_id || 'guest')

const totalCells = computed(() => gridSize.value * gridSize.value)
const isRunning = computed(() => timer.isRunning)
const formattedElapsed = computed(() => formatMs(timer.elapsedMs))
const progress = computed(() => {
  if (!totalCells.value) return 0
  const currentIndex = getExpectedIndex()
  return (currentIndex / totalCells.value) * 100
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

// 生成字母和数字序列
const generateSequence = () => {
  const total = totalCells.value
  const sequence = []
  
  // 先添加字母 A-Z（最多26个）
  const letterCount = Math.min(26, total)
  for (let i = 0; i < letterCount; i++) {
    sequence.push(String.fromCharCode(97 + i)) // 97 是 'a' 的 ASCII 码
  }
  
  // 如果还需要更多，用数字补全
  if (total > 26) {
    const numberCount = total - 26
    for (let i = 1; i <= numberCount; i++) {
      sequence.push(String(i))
    }
  }
  
  return sequence
}

// 获取当前期望项的索引（用于计算进度）
const getExpectedIndex = () => {
  const sequence = generateSequence()
  const index = sequence.indexOf(expectedItem.value)
  return index >= 0 ? index : 0
}

// 获取下一个期望项
const getNextExpectedItem = (current) => {
  const sequence = generateSequence()
  const currentIndex = sequence.indexOf(current)
  if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
    return sequence[currentIndex + 1]
  }
  return null
}

const shuffle = (arr) => {
  const clone = arr.slice()
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[clone[i], clone[j]] = [clone[j], clone[i]]
  }
  return clone
}

const normalizeGridSize = () => {
  if (!gridSize.value || Number.isNaN(gridSize.value)) gridSize.value = 5
  gridSize.value = Math.min(10, Math.max(2, Math.floor(gridSize.value)))
  resetGame()
  // 方格尺寸变化时更新排行榜
  fetchLeaderboard()
}

const generateGrid = () => {
  const sequence = generateSequence()
  gridItems.value = shuffle(sequence)
  expectedItem.value = 'a'
  clickedSet.value = new Set()
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
  expectedItem.value = 'a'
  clickedSet.value = new Set()
  generateGrid()
  // 重置后计时归0并停止，等待点击字母A开始计时
}

const handleCellClick = (item) => {
  // 只有在点击字母A时才开始计时
  if (item === 'a' && !timer.isRunning && expectedItem.value === 'a' && !clickedSet.value.has('a')) {
    startGame()
  }

  if (item !== expectedItem.value) {
    return
  }

  const nextSet = new Set(clickedSet.value)
  nextSet.add(item)
  clickedSet.value = nextSet
  
  const nextItem = getNextExpectedItem(item)
  if (nextItem) {
    expectedItem.value = nextItem
  } else {
    // 已经点击了最后一个字符，完成游戏
    finalizeGame()
  }
}

const handleComplete = () => {
  const sequence = generateSequence()
  const lastItem = sequence[sequence.length - 1]
  if (expectedItem.value !== lastItem || !clickedSet.value.has(lastItem)) {
    finalizeGame()
  }
}

const finalizeGame = async () => {
  if (gameStatus.value === 'completed') return
  stopTimer()
  gameStatus.value = 'completed'

  const payload = {
    gridSize: gridSize.value,
    durationMs: Math.round(timer.elapsedMs),
    username: username.value
    // userId 由后端从token中获取，不需要前端传递
  }

  try {
    await saveLetterReinforceRecord(payload)
  } catch (error) {
    console.warn('保存记录失败，将不会影响本地体验：', error?.message || error)
  }

  fetchLeaderboard()
}

const fetchLeaderboard = async () => {
  if (!gridSize.value || gridSize.value <= 0) {
    topRecords.value = []
    return
  }
  
  boardLoading.value = true
  try {
    const res = await getLetterReinforceTopRecords(gridSize.value, 10)
    const data = res?.data || res?.records || res || []
    topRecords.value = Array.isArray(data) ? data.slice(0, 10) : []
  } catch (error) {
    console.warn('获取排行榜失败：', error?.message || error)
    topRecords.value = []
  } finally {
    boardLoading.value = false
  }
}

const goBack = () => {
  router.navigate(ROUTES.ATTENTION_TRAINING)
}

const cellClass = (item) => {
  if (clickedSet.value.has(item)) return 'clicked'
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

// 监听gridSize变化，自动更新排行榜
watch(() => gridSize.value, () => {
  fetchLeaderboard()
})

onMounted(() => {
  resetGame()
  fetchLeaderboard()
})
</script>

<style scoped>
.letter-reinforce-container {
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
  grid-template-columns: 2fr repeat(3, 1fr) 1.2fr;
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

.control-item.compact {
  background: rgba(0, 0, 0, 0.4);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.control-item input {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px;
  color: #f7f7f7;
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
}

.next-number {
  font-size: 22px;
  font-weight: 700;
  color: #ffd166;
}

.control-actions {
  display: flex;
  gap: 8px;
}

.hint {
  color: #8aa0c2;
  font-size: 12px;
}

button {
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.5);
  color: #f7f7f7;
  transition: all 0.2s;
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

button.success {
  background: linear-gradient(90deg, #1dd1a1, #10ac84);
  color: #0c0c0f;
  font-weight: 700;
  border-color: rgba(29, 209, 161, 0.4);
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

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.value {
  font-size: 20px;
  font-weight: 700;
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

.progress-text {
  color: #c5c5c5;
  font-size: 12px;
}

.grid-wrapper {
  width: 100%;
  max-width: 500px;
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
  font-size: 16px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell.clicked {
  background: rgba(16, 37, 27, 0.6);
  border-color: rgba(29, 209, 161, 0.5);
  color: #1dd1a1;
}

.cell:hover {
  transform: translateY(-1px);
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
</style>
