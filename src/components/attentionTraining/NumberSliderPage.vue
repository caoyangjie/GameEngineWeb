<template>
  <div class="number-slider-container">
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
          <div class="badge">数字华容道 · 专注力</div>
          <h1 class="page-title">数字华容道游戏</h1>
          <p class="subtitle">设置一个数字 N，生成 N×N 方格，包含 1 到 N²-1 的数字和一个空格。通过移动数字块，使数字按顺序排列（1, 2, 3, ..., N²-1, 空格）。进入后自动计时，完成后自动结算成绩并写入 TOP10 榜单。</p>
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
                min="3"
                max="8"
                @change="normalizeGridSize"
                :disabled="isRunning"
              />
              <span class="hint">最小 3，最大 8，默认 4。</span>
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
              <div class="label">移动次数</div>
              <div class="move-count">{{ moveCount }}</div>
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
                <div class="label">完成度</div>
                <div class="bar">
                  <div class="fill" :style="{ width: completionPercent + '%' }"></div>
                </div>
                <div class="progress-text">{{ completionPercent.toFixed(0) }}%</div>
              </div>
            </div>

            <div class="grid-wrapper">
              <div
                class="grid"
                :style="{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }"
              >
                <button
                  v-for="(cell, index) in gridCells"
                  :key="`${cell}-${index}`"
                  class="cell"
                  :class="getCellClass(cell, index)"
                  @click="handleCellClick(index)"
                  :disabled="gameStatus === 'completed'"
                >
                  <span v-if="cell !== 0">{{ cell }}</span>
                  <span v-else class="empty-cell"></span>
                </button>
              </div>
            </div>

            <div class="tips">
              <p>规则：点击与空格相邻的数字块可以移动。目标是将数字按顺序排列（1, 2, 3, ..., N²-1, 空格）。</p>
              <p class="secondary">提示：每次重置都会生成新的可解谜题；刷新不清空已存的排行榜数据。</p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_NUMBER_SLIDER"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { getUserInfo } from '../../utils/auth.js'
import { getNumberSliderTopRecords, saveNumberSliderRecord } from '../../api/attentionNumberSlider.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'

const router = useRouter()
const gridSize = ref(4)
const gridCells = ref([])
const emptyIndex = ref(0)
const gameStatus = ref('idle') // idle | running | completed
const moveCount = ref(0)
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
const completionPercent = computed(() => {
  if (!totalCells.value) return 0
  let correctCount = 0
  for (let i = 0; i < gridCells.value.length; i++) {
    const expected = i === gridCells.value.length - 1 ? 0 : i + 1
    if (gridCells.value[i] === expected) {
      correctCount++
    }
  }
  return (correctCount / totalCells.value) * 100
})
const statusText = computed(() => {
  if (gameStatus.value === 'running') return '游戏中'
  if (gameStatus.value === 'completed') return '已完成'
  return '待开始'
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

// 计算逆序数（不包括空格）
const countInversions = (arr) => {
  let inversions = 0
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 0) continue // 跳过空格
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] === 0) continue // 跳过空格
      if (arr[i] > arr[j]) {
        inversions++
      }
    }
  }
  return inversions
}

// 检查拼图是否可解
const isSolvable = (puzzle, emptyIndex) => {
  const inversions = countInversions(puzzle)
  const emptyRow = Math.floor(emptyIndex / gridSize.value) // 从0开始的行号
  const emptyRowFromBottom = gridSize.value - emptyRow // 从下往上数，从1开始
  
  if (gridSize.value % 2 === 1) {
    // 奇数：逆序数必须是偶数
    return inversions % 2 === 0
  } else {
    // 偶数：逆序数 + 空格行数（从下往上）必须是偶数
    return (inversions + emptyRowFromBottom) % 2 === 0
  }
}

// 强制使拼图可解（通过交换两个非零元素）
const makeSolvable = (puzzle, emptyIndex) => {
  // 找到前两个非零元素的位置
  let firstNonZero = -1
  let secondNonZero = -1
  for (let i = 0; i < puzzle.length; i++) {
    if (puzzle[i] !== 0) {
      if (firstNonZero === -1) {
        firstNonZero = i
      } else if (secondNonZero === -1) {
        secondNonZero = i
        break
      }
    }
  }
  
  if (firstNonZero !== -1 && secondNonZero !== -1) {
    // 交换这两个元素（这会改变逆序数的奇偶性）
    ;[puzzle[firstNonZero], puzzle[secondNonZero]] = [
      puzzle[secondNonZero],
      puzzle[firstNonZero]
    ]
  }
  return puzzle
}

// 生成可解的打乱状态
// 使用从已解决状态开始，通过合法移动来打乱的方法，保证生成的状态一定是可解的
const generateSolvablePuzzle = () => {
  const total = totalCells.value
  const size = gridSize.value
  
  // 从已解决状态开始：[1, 2, 3, ..., N²-1, 0]
  const solvedState = Array.from({ length: total - 1 }, (_, idx) => idx + 1)
  solvedState.push(0)
  
  let puzzle = [...solvedState]
  let emptyIndex = total - 1 // 空格在最后
  
  // 通过随机移动来打乱，移动次数根据网格大小调整
  const shuffleMoves = Math.max(100, size * size * 20) // 确保充分打乱
  
  for (let i = 0; i < shuffleMoves; i++) {
    // 获取空格周围可以移动的位置
    const emptyRow = Math.floor(emptyIndex / size)
    const emptyCol = emptyIndex % size
    const possibleMoves = []
    
    // 检查上下左右四个方向
    const directions = [
      { row: -1, col: 0 }, // 上
      { row: 1, col: 0 },  // 下
      { row: 0, col: -1 }, // 左
      { row: 0, col: 1 }   // 右
    ]
    
    for (const dir of directions) {
      const newRow = emptyRow + dir.row
      const newCol = emptyCol + dir.col
      
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        const newIndex = newRow * size + newCol
        possibleMoves.push(newIndex)
      }
    }
    
    // 随机选择一个方向移动
    if (possibleMoves.length > 0) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
      
      // 交换空格和目标位置
      puzzle[emptyIndex] = puzzle[randomMove]
      puzzle[randomMove] = 0
      emptyIndex = randomMove
    }
  }
  
  // 验证生成的状态是可解的（理论上应该总是可解的，因为是从已解决状态通过合法移动得到的）
  if (!isSolvable(puzzle, emptyIndex)) {
    console.warn('生成的状态不可解，使用备用方案')
    // 如果不可解（理论上不应该发生），使用备用方案
    puzzle = [...solvedState]
    emptyIndex = total - 1
    
    // 进行少量合法移动
    for (let i = 0; i < 50; i++) {
      const emptyRow = Math.floor(emptyIndex / size)
      const emptyCol = emptyIndex % size
      const possibleMoves = []
      
      const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
      ]
      
      for (const dir of directions) {
        const newRow = emptyRow + dir.row
        const newCol = emptyCol + dir.col
        if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
          possibleMoves.push(newRow * size + newCol)
        }
      }
      
      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
        puzzle[emptyIndex] = puzzle[randomMove]
        puzzle[randomMove] = 0
        emptyIndex = randomMove
      }
    }
  }
  
  return { puzzle, emptyIndex }
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
  if (!gridSize.value || Number.isNaN(gridSize.value)) gridSize.value = 4
  gridSize.value = Math.min(8, Math.max(3, Math.floor(gridSize.value)))
  resetGame()
  fetchLeaderboard()
}

const generateGrid = () => {
  const result = generateSolvablePuzzle()
  gridCells.value = result.puzzle
  emptyIndex.value = result.emptyIndex
  moveCount.value = 0
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
  // generateGrid()
  startTimer()
  gameStatus.value = 'running'
}

const resetGame = () => {
  stopTimer()
  gameStatus.value = 'idle'
  timer.elapsedMs = 0
  moveCount.value = 0
  generateGrid()
}

const isAdjacent = (index1, index2) => {
  const row1 = Math.floor(index1 / gridSize.value)
  const col1 = index1 % gridSize.value
  const row2 = Math.floor(index2 / gridSize.value)
  const col2 = index2 % gridSize.value
  
  // 检查是否在同一行或同一列，且距离为1
  return (
    (row1 === row2 && Math.abs(col1 - col2) === 1) ||
    (col1 === col2 && Math.abs(row1 - row2) === 1)
  )
}

// 检查两个位置是否在同一行或同一列
const isInSameLine = (index1, index2) => {
  const row1 = Math.floor(index1 / gridSize.value)
  const col1 = index1 % gridSize.value
  const row2 = Math.floor(index2 / gridSize.value)
  const col2 = index2 % gridSize.value
  return row1 === row2 || col1 === col2
}

// 获取从点击位置到空格位置之间的所有块索引（同一行或同一列）
const getBlocksToMove = (clickIndex, emptyIdx) => {
  const row1 = Math.floor(clickIndex / gridSize.value)
  const col1 = clickIndex % gridSize.value
  const row2 = Math.floor(emptyIdx / gridSize.value)
  const col2 = emptyIdx % gridSize.value
  
  const blocks = []
  
  // 同一行
  if (row1 === row2) {
    const start = Math.min(col1, col2)
    const end = Math.max(col1, col2)
    for (let col = start; col <= end; col++) {
      const idx = row1 * gridSize.value + col
      if (idx !== emptyIdx) {
        blocks.push(idx)
      }
    }
    // 按移动方向排序（从点击位置到空格位置）
    if (col1 > col2) {
      blocks.reverse()
    }
  }
  // 同一列
  else if (col1 === col2) {
    const start = Math.min(row1, row2)
    const end = Math.max(row1, row2)
    for (let row = start; row <= end; row++) {
      const idx = row * gridSize.value + col1
      if (idx !== emptyIdx) {
        blocks.push(idx)
      }
    }
    // 按移动方向排序（从点击位置到空格位置）
    if (row1 > row2) {
      blocks.reverse()
    }
  }
  
  return blocks
}

const handleCellClick = (index) => {
  if (gameStatus.value === 'completed') return
  
  // 如果点击的是空格，不做任何操作
  if (gridCells.value[index] === 0) return
  
  // 检查是否与空格在同一行或同一列
  if (!isInSameLine(index, emptyIndex.value)) return
  
  // 开始游戏（如果还没开始）
  if (gameStatus.value === 'idle') {
    startGame()
  }
  
  // 获取需要移动的所有块（从点击位置到空格位置）
  const blocksToMove = getBlocksToMove(index, emptyIndex.value)
  
  if (blocksToMove.length === 0) return
  
  // 执行多块移动：将所有块向空格方向移动，空格移动到点击位置
  const newCells = [...gridCells.value]
  
  // 保存空格位置的值（应该是0）
  const emptyValue = 0
  
  // 从最后一个块（最靠近空格的块）开始，依次向前移动
  // 最后一个块移动到空格位置
  newCells[emptyIndex.value] = newCells[blocksToMove[blocksToMove.length - 1]]
  
  // 其他块依次向前移动（从后往前）
  for (let i = blocksToMove.length - 1; i > 0; i--) {
    newCells[blocksToMove[i]] = newCells[blocksToMove[i - 1]]
  }
  
  // 第一个块（点击的块）的位置变成空格
  newCells[blocksToMove[0]] = emptyValue
  
  // 更新状态
  gridCells.value = newCells
  emptyIndex.value = blocksToMove[0]
  moveCount.value++
  
  // 检查是否完成
  if (checkCompletion()) {
    finalizeGame()
  }
}

const checkCompletion = () => {
  // 检查是否按顺序排列（1, 2, 3, ..., N²-1, 0）
  for (let i = 0; i < gridCells.value.length; i++) {
    const expected = i === gridCells.value.length - 1 ? 0 : i + 1
    if (gridCells.value[i] !== expected) {
      return false
    }
  }
  return true
}

const finalizeGame = async () => {
  if (gameStatus.value === 'completed') return
  stopTimer()
  gameStatus.value = 'completed'

  const payload = {
    gridSize: gridSize.value,
    durationMs: Math.round(timer.elapsedMs),
    moveCount: moveCount.value,
    username: username.value
  }

  try {
    await saveNumberSliderRecord(payload)
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
    const res = await getNumberSliderTopRecords(gridSize.value, 10)
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

const getCellClass = (cell, index) => {
  if (cell === 0) return 'empty'
  const expected = index === gridCells.value.length - 1 ? 0 : index + 1
  if (cell === expected) return 'correct'
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

// 监听 gridSize 变化，自动更新排行榜
watch(() => gridSize.value, () => {
  fetchLeaderboard()
})

onMounted(() => {
  resetGame()
  fetchLeaderboard()
})
</script>

<style scoped>
.number-slider-container {
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

.move-count {
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
  min-height: 60px;
}

.cell.empty {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.04);
}

.cell.correct {
  background: rgba(16, 37, 27, 0.6);
  border-color: rgba(29, 209, 161, 0.5);
  color: #1dd1a1;
}

.cell:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.empty-cell {
  display: block;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
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
