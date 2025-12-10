<template>
  <div class="photo-memory-container">
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
          <div class="badge">照相记忆 · 专注力</div>
          <h1 class="page-title">照相记忆游戏</h1>
          <p class="subtitle">设置一个数字 N，生成 N×N 方格，随机在格子中显示成对的数字或小写字母。每次点击两个格子，如果字符匹配则配对成功，如果不匹配则重置。需要完成所有配对才能结束游戏。完成后自动结算成绩并写入 TOP10 榜单。</p>
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
              <h2>{{ gridSize }}×{{ gridSize }} 最高准确率榜</h2>
              <p class="subtitle">按准确率降序展示，完成后会自动写入后端并刷新列表。</p>
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
                  {{ item.accuracy?.toFixed(1) || 0 }}% · {{ item.gridSize }}×{{ item.gridSize }} · {{ formatDate(item.createTime) }}
                </div>
              </div>
              <div class="time">{{ item.accuracy?.toFixed(1) || 0 }}%</div>
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
                min="3"
                max="8"
                @change="normalizeGridSize"
                :disabled="isRunning"
              />
              <span class="hint">最小 3，最大 8，默认 4。</span>
            </div>
            <div class="control-item">
              <label for="observe-duration">观察时间 (秒)</label>
              <input
                id="observe-duration"
                v-model.number="observeDuration"
                type="number"
                min="1"
                max="60"
                @change="normalizeObserveDuration"
                :disabled="isRunning"
              />
              <span class="hint">最小 1 秒，最大 60 秒，默认 3 秒。</span>
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
              <div class="label">准确率</div>
              <div class="accuracy">{{ accuracyPercent.toFixed(1) }}%</div>
            </div>
            <div class="control-actions">
              <button 
                class="ghost" 
                @click="toggleObserveMode"
                :disabled="gameStatus === 'completed'"
              >
                {{ gameStatus === 'observing' ? '进入游戏' : '观察' }}
              </button>
              <button 
                v-if="gameStatus === 'playing'" 
                class="ghost" 
                @click="pauseGame"
              >
                暂停
              </button>
              <button 
                v-else-if="gameStatus === 'paused'" 
                class="ghost" 
                @click="resumeGame"
              >
                继续
              </button>
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
                <div class="label">完成度</div>
                <div class="bar">
                  <div class="fill" :style="{ width: completionPercent + '%' }"></div>
                </div>
                <div class="progress-text">{{ completionPercent.toFixed(0) }}%</div>
              </div>
            </div>

            <div v-if="gameStatus === 'observing'" class="phase-indicator">
              <div class="phase-text">观察阶段</div>
              <div class="phase-countdown">{{ observeCountdown }} 秒</div>
              <div class="phase-hint">点击"进入游戏"按钮或等待倒计时结束</div>
            </div>
            <div v-else-if="gameStatus === 'playing'" class="phase-indicator">
              <div class="phase-text">游戏中</div>
              <div class="phase-hint">每次点击两个格子进行配对</div>
            </div>
            <div v-else-if="gameStatus === 'paused'" class="phase-indicator">
              <div class="phase-text">已暂停</div>
              <div class="phase-hint">点击继续按钮恢复游戏</div>
            </div>
            <div v-else-if="gameStatus === 'completed'" class="phase-indicator">
              <div class="phase-text">游戏完成</div>
              <div class="phase-hint">恭喜完成所有配对！</div>
            </div>

            <div class="grid-wrapper">
              <canvas id="photo-memory-canvas"></canvas>
            </div>

            <div class="tips">
              <p>规则：每次点击两个格子，如果两个格子的字符相同则配对成功并保留，如果不匹配则重置为未选中状态。需要完成所有配对才能结束游戏。</p>
              <p class="secondary">提示：每次重置都会生成新的随机字符分布；准确率 = 成功配对数 / 总尝试次数 × 100%。</p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_PHOTO_MEMORY"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { getUserInfo } from '../../utils/auth.js'
import { getPhotoMemoryTopRecords, savePhotoMemoryRecord } from '../../api/attentionPhotoMemory.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { PhotoMemoryGame } from './PhotoMemoryGame.js'

const router = useRouter()
const gridSize = ref(4)
const observeDuration = ref(30)
const gameStatus = ref('idle') // idle | observing | playing | paused | completed
const observeCountdown = ref(0)
const timerElapsedMs = ref(0)
const accuracyPercent = ref(0)
const completionPercent = ref(0)
const boardLoading = ref(false)
const topRecords = ref([])
const sidebarOpen = ref(false)
let gameInstance = null
let isSubmitting = false // 防止重复提交的标志

const userInfo = getUserInfo()
const username = computed(() => userInfo?.username || userInfo?.nickName || 'guest')
const userId = computed(() => userInfo?.id || userInfo?.userId || userInfo?.user_id || 'guest')

const formattedElapsed = computed(() => formatMs(timerElapsedMs.value))
const isRunning = computed(() => {
  return gameStatus.value === 'playing' || gameStatus.value === 'observing'
})

const statusText = computed(() => {
  if (gameStatus.value === 'observing') return '观察中'
  if (gameStatus.value === 'playing') return '游戏中'
  if (gameStatus.value === 'paused') return '已暂停'
  if (gameStatus.value === 'completed') return '已完成'
  return '待开始'
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const normalizeGridSize = () => {
  if (!gridSize.value || Number.isNaN(gridSize.value)) gridSize.value = 4
  gridSize.value = Math.min(8, Math.max(3, Math.floor(gridSize.value)))
  if (gameInstance) {
    gameInstance.setGridSize(gridSize.value)
  }
  fetchLeaderboard()
}

const normalizeObserveDuration = () => {
  if (!observeDuration.value || Number.isNaN(observeDuration.value)) observeDuration.value = 3
  observeDuration.value = Math.min(60, Math.max(1, Math.floor(observeDuration.value)))
  if (gameInstance) {
    gameInstance.setObserveDuration(observeDuration.value)
  }
}

const resetGame = () => {
  if (gameInstance) {
    gameInstance.resetGame()
  }
}

const pauseGame = () => {
  if (gameInstance) {
    gameInstance.pauseGame()
  }
}

const resumeGame = () => {
  if (gameInstance) {
    gameInstance.resumeGame()
  }
}

const toggleObserveMode = () => {
  if (gameInstance) {
    gameInstance.toggleObserveMode()
  }
}

const finalizeGame = async (gameData) => {
  // 防止重复提交
  if (isSubmitting) {
    console.warn('数据正在提交中，跳过重复提交')
    return
  }
  
  // 验证必要数据
  if (!gameData || typeof gameData !== 'object') {
    console.warn('游戏数据无效，无法提交')
    return
  }
  
  // 验证关键字段
  if (gameData.gridSize == null || gameData.durationMs == null || gameData.accuracy == null) {
    console.warn('游戏数据不完整，无法提交', gameData)
    return
  }
  
  // 确保准确率是有效数字
  const accuracy = Number(gameData.accuracy)
  if (isNaN(accuracy) || accuracy < 0 || accuracy > 100) {
    console.warn('准确率无效，无法提交', accuracy)
    return
  }
  
  isSubmitting = true
  
  const payload = {
    gridSize: gameData.gridSize,
    durationMs: Math.round(gameData.durationMs),
    accuracy: accuracy,
    totalPairs: gameData.totalPairs || null,
    successfulMatches: gameData.successfulMatches || null,
    totalAttempts: gameData.totalAttempts || null,
    totalCells: gameData.totalCells || (gameData.totalPairs ? gameData.totalPairs * 2 : null),
    correctCells: gameData.correctCells || (gameData.successfulMatches ? gameData.successfulMatches * 2 : null),
    username: username.value
  }

  try {
    await savePhotoMemoryRecord(payload)
    console.log('游戏记录已成功提交到后端', payload)
  } catch (error) {
    console.error('保存记录失败：', error?.message || error)
    // 即使失败也刷新排行榜，因为可能其他用户有新的记录
  } finally {
    isSubmitting = false
    fetchLeaderboard()
  }
}

const fetchLeaderboard = async () => {
  if (!gridSize.value || gridSize.value <= 0) {
    topRecords.value = []
    return
  }
  
  boardLoading.value = true
  try {
    const res = await getPhotoMemoryTopRecords(gridSize.value, 10)
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

// 监听 gridSize 变化，自动更新排行榜
watch(() => gridSize.value, () => {
  fetchLeaderboard()
})

onMounted(() => {
  // 创建游戏实例
  gameInstance = new PhotoMemoryGame('photo-memory-canvas', {
    gridSize: gridSize.value,
    observeDuration: observeDuration.value,
    onStatusChange: (status) => {
      gameStatus.value = status
    },
    onObserveCountdownChange: (countdown) => {
      observeCountdown.value = countdown
    },
    onTimerUpdate: (elapsedMs) => {
      timerElapsedMs.value = elapsedMs
    },
    onAccuracyUpdate: (accuracy) => {
      accuracyPercent.value = accuracy
    },
    onCompletionUpdate: (completion) => {
      completionPercent.value = completion
    },
    onGameComplete: (gameData) => {
      finalizeGame(gameData)
    }
  })
  
  fetchLeaderboard()
})

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy()
    gameInstance = null
  }
})
</script>

<style scoped>
.photo-memory-container {
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
  grid-template-columns: 2fr 2fr repeat(3, 1fr) 1.5fr;
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

.status.observing {
  color: #ffd700;
}

.status.playing {
  color: #f4d03f;
}

.status.paused {
  color: #ff9800;
}

.status.completed {
  color: #1dd1a1;
}

.timer {
  font-size: 22px;
  font-weight: 700;
}

.accuracy {
  font-size: 22px;
  font-weight: 700;
  color: #1dd1a1;
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

.phase-indicator {
  text-align: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.phase-text {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 4px;
}

.phase-countdown {
  font-size: 24px;
  font-weight: 800;
  color: #f4d03f;
  text-shadow: 0 0 12px rgba(244, 208, 63, 0.8);
}

.phase-hint {
  font-size: 14px;
  color: #c5c5c5;
}

.grid-wrapper {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

#photo-memory-canvas {
  display: block;
  max-width: 100%;
  height: auto;
  cursor: pointer;
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
