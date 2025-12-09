<template>
  <div class="sudoku-container">
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
          <div class="badge">数独 · 专注力</div>
          <h1 class="page-title">数独游戏</h1>
          <p class="subtitle">选择难度级别和数独尺寸，生成数独谜题。填入数字使每行、每列、每个宫格都包含 1 到 N 的所有数字且不重复。完成后自动计时并写入 TOP10 榜单。</p>
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
              <h2>{{ gridSize }}×{{ gridSize }} {{ difficultyText }} 最快记录榜</h2>
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
                  {{ formatMs(item.durationMs) }} · {{ item.gridSize }}×{{ item.gridSize }} · {{ getDifficultyText(item.difficulty) }} · {{ formatDate(item.createTime) }}
                </div>
              </div>
              <div class="time">{{ formatMs(item.durationMs) }}</div>
            </div>
          </div>
        </section>

        <div class="game-column">
          <section class="controls">
            <div class="control-item">
              <label for="difficulty">难度级别</label>
              <select
                id="difficulty"
                v-model="difficulty"
                @change="onSettingsChange"
                :disabled="isRunning"
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">复杂</option>
              </select>
              <span class="hint">简单：保留更多数字；复杂：保留更少数字</span>
            </div>
            <div class="control-item">
              <label for="grid-size">数独尺寸</label>
              <select
                id="grid-size"
                v-model.number="gridSize"
                @change="onSettingsChange"
                :disabled="isRunning"
              >
                <option :value="4">4×4</option>
                <option :value="6">6×6</option>
                <option :value="9">9×9</option>
              </select>
              <span class="hint">支持 4×4、6×6、9×9 三种尺寸</span>
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
              <div class="label">已填数量</div>
              <div class="next-number">{{ filledCount }} / {{ totalCells }}</div>
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
                class="sudoku-grid"
                :style="{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }"
              >
                <div
                  v-for="(cell, index) in sudokuGrid"
                  :key="index"
                  class="sudoku-cell"
                  :class="getCellClass(cell, index)"
                  @click="handleCellClick(index)"
                >
                  <!-- 固定数字显示 -->
                  <span v-if="cell.isFixed" class="cell-fixed">{{ cell.value || '' }}</span>
                  <!-- 用户输入的数字 -->
                  <input
                    v-else-if="cell.value"
                    v-model.number="cell.value"
                    type="text"
                    :min="1"
                    :max="gridSize"
                    @input="handleCellInput(index, $event)"
                    @focus="handleCellFocus(index)"
                    class="cell-input"
                    :class="{ 'has-error': cell.hasError }"
                  />
                  <!-- 候选值显示（当没有输入数字时） -->
                  <div v-else class="cell-candidates" :class="`candidates-${gridSize}`">
                    <span
                      v-for="num in gridSize"
                      :key="num"
                      class="candidate-number"
                      :class="{ 'has-candidate': cell.candidates && cell.candidates.includes(num) }"
                    >
                      {{ cell.candidates && cell.candidates.includes(num) ? num : '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="number-selector" v-if="selectedCellIndex !== null">
              <div class="selector-header">
                <div class="selector-label">
                  {{ inputMode === 'number' ? '选择数字' : '标记候选值' }}
                </div>
                <button
                  class="mode-toggle-btn"
                  :class="{ active: inputMode === 'candidate' }"
                  @click="toggleInputMode"
                  :title="inputMode === 'number' ? '切换到候选值模式' : '切换到数字模式'"
                >
                  {{ inputMode === 'number' ? '笔记' : '数字' }}
                </button>
              </div>
              <div class="selector-buttons">
                <button
                  v-for="num in gridSize"
                  :key="num"
                  class="num-btn"
                  :class="{ 'candidate-active': isCandidateActive(num) }"
                  @click="selectNumber(num)"
                >
                  {{ num }}
                </button>
                <button class="num-btn clear-btn" @click="clearCell">清除</button>
              </div>
            </div>

            <div class="tips">
              <p v-if="gridSize === 6">规则：每行、每列、每个 2×3 宫格都必须包含 1 到 {{ gridSize }} 的所有数字且不重复。</p>
              <p v-else>规则：每行、每列、每个 {{ boxSize }}×{{ boxSize }} 宫格都必须包含 1 到 {{ gridSize }} 的所有数字且不重复。</p>
              <p class="secondary">提示：点击空白格子可以输入数字；点击"笔记"按钮切换到候选值模式，可以标记可能的数字；完成所有格子后自动验证并结算成绩。</p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_SUDOKU"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { getUserInfo } from '../../utils/auth.js'
import { getSudokuTopRecords, saveSudokuRecord } from '../../api/attentionSudoku.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { makepuzzle, solvepuzzle, ratepuzzle } from 'sudoku'

const router = useRouter()
const gridSize = ref(9)
const difficulty = ref('medium')
const sudokuGrid = ref([])
const solution = ref([])
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
const selectedCellIndex = ref(null)
const inputMode = ref('number') // 'number' 或 'candidate' - 数字模式或候选值模式

const userInfo = getUserInfo()
const username = computed(() => userInfo?.username || userInfo?.nickName || 'guest')
const userId = computed(() => userInfo?.id || userInfo?.userId || userInfo?.user_id || 'guest')

const totalCells = computed(() => gridSize.value * gridSize.value)
const isRunning = computed(() => timer.isRunning)
const formattedElapsed = computed(() => formatMs(timer.elapsedMs))
const boxSize = computed(() => {
  const size = gridSize.value
  if (size === 4) return 2
  if (size === 6) return 2 // 6×6数独是2×3的宫格，这里返回2用于显示
  if (size === 9) return 3
  return Math.sqrt(size)
})
const filledCount = computed(() => {
  return sudokuGrid.value.filter(cell => cell.value !== null && cell.value !== '').length
})
const progress = computed(() => {
  if (!totalCells.value) return 0
  return (filledCount.value / totalCells.value) * 100
})
const statusText = computed(() => {
  if (gameStatus.value === 'running') return '计时中'
  if (gameStatus.value === 'completed') return '已完成'
  return '待开始'
})
const difficultyText = computed(() => {
  const map = { easy: '简单', medium: '中等', hard: '复杂' }
  return map[difficulty.value] || difficulty.value
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

// 检查难度是否匹配
const matchesDifficulty = (difficulty, difficultyLevel) => {
  if (difficultyLevel === 'easy') {
    return difficulty <= 2
  } else if (difficultyLevel === 'medium') {
    return difficulty >= 2 && difficulty <= 4
  } else if (difficultyLevel === 'hard') {
    return difficulty >= 4
  }
  return true
}

// 使用 sudoku 库生成 9×9 数独
const generateSudokuWithLibrary = (difficultyLevel) => {
  let puzzle = null
  let attempts = 0
  const maxAttempts = 20
  
  // 尝试生成符合难度要求的数独
  // ratepuzzle 返回 1-5 的难度值，1最简单，5最难
  while (attempts < maxAttempts) {
    const rawPuzzle = makepuzzle()
    const difficulty = ratepuzzle(rawPuzzle, 4)
    
    // 检查难度是否匹配
    if (matchesDifficulty(difficulty, difficultyLevel)) {
      puzzle = rawPuzzle
      break
    }
    attempts++
  }
  
  // 如果多次尝试后仍不匹配，使用最后一次生成的
  if (!puzzle) {
    puzzle = makepuzzle()
  }
  
  // 获取完整解
  const solution = solvepuzzle(puzzle)
  
  // 将一维数组转换为二维数组
  // sudoku 库返回的数组：null 表示空格，数字 0-8 表示 1-9
  const puzzle2D = []
  const solution2D = []
  for (let i = 0; i < 9; i++) {
    const puzzleRow = []
    const solutionRow = []
    for (let j = 0; j < 9; j++) {
      const puzzleIdx = i * 9 + j
      const puzzleVal = puzzle[puzzleIdx]
      const solutionVal = solution[puzzleIdx]
      // 转换为 1-9 的数字，null 保持为 null
      puzzleRow.push(puzzleVal !== null ? puzzleVal + 1 : null)
      solutionRow.push(solutionVal !== null ? solutionVal + 1 : null)
    }
    puzzle2D.push(puzzleRow)
    solution2D.push(solutionRow)
  }
  
  return { puzzle: puzzle2D, solution: solution2D }
}

// 数独生成算法
const generateSudoku = () => {
  const size = gridSize.value
  
  // 检查尺寸是否有效（只能是4、6、9）
  const validSizes = [4, 6, 9]
  if (!validSizes.includes(size)) {
    console.warn('数独尺寸必须是 4、6 或 9')
    return
  }
  
  // 对于 9×9，使用 sudoku-core 库生成
  if (size === 9) {
    try {
      const { puzzle, solution: sol } = generateSudokuWithLibrary(difficulty.value)
      solution.value = sol
      
      // 转换为游戏网格
      sudokuGrid.value = puzzle.map((row, rowIndex) => 
        row.map((value, colIndex) => ({
          value: value,
          isFixed: value !== null,
          hasError: false,
          candidates: [], // 候选值数组
          row: rowIndex,
          col: colIndex
        }))
      ).flat()
      return
    } catch (error) {
      console.error('使用 sudoku-core 生成数独失败，回退到自定义算法:', error)
      // 如果库生成失败，回退到自定义算法
    }
  }
  
  // 对于 4×4 和 6×6，使用自定义算法
  let actualBoxSize
  if (size === 4) {
    actualBoxSize = 2
  } else if (size === 6) {
    actualBoxSize = 2 // 6×6数独是2×3的宫格
  } else {
    actualBoxSize = 3
  }

  // 生成完整解
  solution.value = generateCompleteSolution(size, actualBoxSize)
  
  // 根据难度移除数字，确保有唯一解
  const puzzle = removeNumbersWithUniqueSolution(solution.value, difficulty.value, size, actualBoxSize)
  
  // 转换为游戏网格
  sudokuGrid.value = puzzle.map((row, rowIndex) => 
    row.map((value, colIndex) => ({
      value: value,
      isFixed: value !== null,
      hasError: false,
      candidates: [], // 候选值数组
      row: rowIndex,
      col: colIndex
    }))
  ).flat()
}

// 填充种子数字，确保随机分布
const seedGrid = (grid, size, boxSize) => {
  // 对于不同尺寸，使用不同的种子数量
  let seedCount
  if (size === 4) {
    seedCount = 6 // 4×4需要更多种子
  } else if (size === 6) {
    seedCount = 12 // 6×6
  } else {
    seedCount = Math.floor(size * size * 0.3) // 9×9
  }
  
  // 创建所有位置并随机打乱，确保分布均匀
  const positions = []
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      positions.push([i, j])
    }
  }
  
  // 多次打乱以确保更好的随机性
  for (let i = 0; i < 3; i++) {
    shuffleArray(positions)
  }
  
  // 尝试填充种子数字，确保分布在不同区域
  let filled = 0
  const usedPositions = new Set()
  
  for (let attempt = 0; attempt < positions.length * 2 && filled < seedCount; attempt++) {
    const [row, col] = positions[attempt % positions.length]
    const key = `${row},${col}`
    
    if (usedPositions.has(key)) continue
    
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, size)
    shuffleArray(numbers)
    
    for (const num of numbers) {
      if (isValidMove(grid, row, col, num, size, boxSize)) {
        grid[row][col] = num
        usedPositions.add(key)
        filled++
        break
      }
    }
  }
}

// 尝试填充一个空单元格
const tryFillCell = (grid, row, col, size, boxSize) => {
  const numbers = shuffleArray([...Array(size)].map((_, i) => i + 1))
  for (const num of numbers) {
    if (isValidMove(grid, row, col, num, size, boxSize)) {
      grid[row][col] = num
      if (solveSudoku(grid, size, boxSize)) {
        return true
      }
      grid[row][col] = null
    }
  }
  return false
}

// 使用回溯算法求解
const solveSudoku = (grid, size, boxSize) => {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === null) {
        return tryFillCell(grid, row, col, size, boxSize)
      }
    }
  }
  return true
}

// 生成完整的数独解（每次生成都不同）
const generateCompleteSolution = (size, boxSize) => {
  const grid = Array(size).fill(null).map(() => Array(size).fill(null))
  
  // 每次生成时都使用不同的随机种子分布
  seedGrid(grid, size, boxSize)
  
  // 使用回溯算法求解
  solveSudoku(grid, size, boxSize)
  
  return grid
}

// 验证移动是否有效
const isValidMove = (grid, row, col, num, size, boxSize) => {
  // 检查行
  for (let c = 0; c < size; c++) {
    if (grid[row][c] === num) return false
  }
  
  // 检查列
  for (let r = 0; r < size; r++) {
    if (grid[r][col] === num) return false
  }
  
  // 检查宫格（处理6×6的特殊情况）
  if (size === 6) {
    // 6×6数独：2行×3列的宫格
    const boxRow = Math.floor(row / 2) * 2
    const boxCol = Math.floor(col / 3) * 3
    for (let r = boxRow; r < boxRow + 2; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (grid[r][c] === num) return false
      }
    }
  } else {
    // 4×4和9×9：标准方形宫格
    const boxRow = Math.floor(row / boxSize) * boxSize
    const boxCol = Math.floor(col / boxSize) * boxSize
    for (let r = boxRow; r < boxRow + boxSize; r++) {
      for (let c = boxCol; c < boxCol + boxSize; c++) {
        if (grid[r][c] === num) return false
      }
    }
  }
  
  return true
}

// 检查数独是否有唯一解（简化版本，用于生成时验证）
const hasUniqueSolution = (puzzle, size, boxSize) => {
  const grid = puzzle.map(row => [...row])
  let solutionCount = 0
  const maxSolutions = 2 // 只检查是否有多个解
  
  const solve = (grid) => {
    if (solutionCount >= maxSolutions) return // 如果已经找到多个解，停止搜索
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === null) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, size)
          for (const num of numbers) {
            if (isValidMove(grid, row, col, num, size, boxSize)) {
              grid[row][col] = num
              solve(grid)
              if (solutionCount >= maxSolutions) return
              grid[row][col] = null
            }
          }
          return
        }
      }
    }
    // 找到完整解
    solutionCount++
  }
  
  solve(grid)
  return solutionCount === 1
}

// 根据难度移除数字，确保有唯一解且随机分布
const removeNumbersWithUniqueSolution = (solution, difficulty, size, boxSize) => {
  const puzzle = solution.map(row => [...row])
  const totalCells = size * size
  
  // 根据难度确定保留的数字比例
  const keepRatios = {
    easy: 0.55,    // 保留55%
    medium: 0.40,  // 保留40%
    hard: 0.30     // 保留30%
  }
  
  const keepCount = Math.floor(totalCells * keepRatios[difficulty] || 0.40)
  const removeCount = totalCells - keepCount
  
  // 创建所有位置并多次打乱，确保随机分布
  const positions = []
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      positions.push([i, j])
    }
  }
  
  // 多次打乱以确保更好的随机性
  for (let i = 0; i < 5; i++) {
    shuffleArray(positions)
  }
  
  // 移除数字，确保有唯一解且分布均匀
  let removed = 0
  let attempts = 0
  const maxAttempts = positions.length * 3
  const removedPositions = new Set()
  
  // 使用轮询方式从不同区域移除，确保分布均匀
  for (let i = 0; i < maxAttempts && removed < removeCount; i++) {
    const [row, col] = positions[i % positions.length]
    const key = `${row},${col}`
    
    // 跳过已经移除的位置
    if (removedPositions.has(key)) continue
    
    const original = puzzle[row][col]
    if (original === null) continue
    
    puzzle[row][col] = null
    
    // 检查是否还有唯一解
    if (hasUniqueSolution(puzzle, size, boxSize)) {
      removed++
      removedPositions.add(key)
    } else {
      // 如果没有唯一解，恢复这个数字
      puzzle[row][col] = original
    }
    attempts++
  }
  
  return puzzle
}

// 打乱数组（使用更好的随机算法）
const shuffleArray = (arr) => {
  const clone = [...arr]
  // 使用 Fisher-Yates 洗牌算法
  for (let i = clone.length - 1; i > 0; i--) {
    // 使用更高质量的随机数生成
    const j = Math.floor(Math.random() * (i + 1))
    ;[clone[i], clone[j]] = [clone[j], clone[i]]
  }
  return clone
}

// 检查行是否有效
const validateRow = (grid, row, size) => {
  const rowSet = new Set()
  for (let j = 0; j < size; j++) {
    const num = grid[row][j]
    if (num === null || num === '' || rowSet.has(num)) {
      return false
    }
    rowSet.add(num)
  }
  return true
}

// 检查列是否有效
const validateColumn = (grid, col, size) => {
  const colSet = new Set()
  for (let j = 0; j < size; j++) {
    const num = grid[j][col]
    if (num === null || num === '' || colSet.has(num)) {
      return false
    }
    colSet.add(num)
  }
  return true
}

// 检查宫格是否有效
const validateBox = (grid, boxRow, boxCol, boxSize, size) => {
  const boxSet = new Set()
  
  if (size === 6) {
    // 6×6数独：2行×3列的宫格
    const startRow = boxRow * 2
    const startCol = boxCol * 3
    for (let r = startRow; r < startRow + 2; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        const num = grid[r][c]
        if (num === null || num === '' || boxSet.has(num)) {
          return false
        }
        boxSet.add(num)
      }
    }
  } else {
    // 4×4和9×9：标准方形宫格
    const startRow = boxRow * boxSize
    const startCol = boxCol * boxSize
    for (let r = startRow; r < startRow + boxSize; r++) {
      for (let c = startCol; c < startCol + boxSize; c++) {
        const num = grid[r][c]
        if (num === null || num === '' || boxSet.has(num)) {
          return false
        }
        boxSet.add(num)
      }
    }
  }
  return true
}

// 验证数独是否完成
const validateSudoku = () => {
  const size = gridSize.value
  const boxSize = Math.sqrt(size)
  const grid = Array(size).fill(null).map(() => Array(size).fill(null))
  
  // 将一维数组转换为二维数组
  sudokuGrid.value.forEach(cell => {
    grid[cell.row][cell.col] = cell.value
  })
  
  // 检查所有格子是否已填满
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === null || grid[row][col] === '') {
        return false
      }
    }
  }
  
  // 验证每行、每列
  for (let i = 0; i < size; i++) {
    if (!validateRow(grid, i, size) || !validateColumn(grid, i, size)) {
      return false
    }
  }
  
  // 检查每个宫格
  const actualBoxSize = size === 6 ? 2 : boxSize
  const boxCols = size === 6 ? 2 : boxSize // 6×6有2列宫格，其他有boxSize列
  for (let boxRow = 0; boxRow < actualBoxSize; boxRow++) {
    for (let boxCol = 0; boxCol < boxCols; boxCol++) {
      if (!validateBox(grid, boxRow, boxCol, boxSize, size)) {
        return false
      }
    }
  }
  
  return true
}

// 实时验证并标记错误
const validateCell = (index) => {
  const cell = sudokuGrid.value[index]
  if (cell.isFixed || !cell.value) {
    cell.hasError = false
    return
  }
  
  const size = gridSize.value
  const boxSize = Math.sqrt(size)
  const num = cell.value
  
  // 检查行
  for (let i = 0; i < totalCells.value; i++) {
    const other = sudokuGrid.value[i]
    if (i !== index && other.row === cell.row && other.value === num) {
      cell.hasError = true
      return
    }
  }
  
  // 检查列
  for (let i = 0; i < totalCells.value; i++) {
    const other = sudokuGrid.value[i]
    if (i !== index && other.col === cell.col && other.value === num) {
      cell.hasError = true
      return
    }
  }
  
  // 检查宫格
  let boxRow, boxCol
  if (size === 6) {
    // 6×6数独：2行×3列的宫格
    boxRow = Math.floor(cell.row / 2)
    boxCol = Math.floor(cell.col / 3)
    for (let i = 0; i < totalCells.value; i++) {
      const other = sudokuGrid.value[i]
      if (i !== index && 
          Math.floor(other.row / 2) === boxRow &&
          Math.floor(other.col / 3) === boxCol &&
          other.value === num) {
        cell.hasError = true
        return
      }
    }
  } else {
    // 4×4和9×9：标准方形宫格
    boxRow = Math.floor(cell.row / boxSize)
    boxCol = Math.floor(cell.col / boxSize)
    for (let i = 0; i < totalCells.value; i++) {
      const other = sudokuGrid.value[i]
      if (i !== index && 
          Math.floor(other.row / boxSize) === boxRow &&
          Math.floor(other.col / boxSize) === boxCol &&
          other.value === num) {
        cell.hasError = true
        return
      }
    }
  }
  
  cell.hasError = false
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
  if (!timer.isRunning) {
    startTimer()
    gameStatus.value = 'running'
  }
}

const resetGame = () => {
  stopTimer()
  gameStatus.value = 'idle'
  timer.elapsedMs = 0
  selectedCellIndex.value = null
  inputMode.value = 'number' // 重置为数字模式
  generateSudoku()
}

const onSettingsChange = () => {
  // 验证尺寸是否有效（只能是4、6、9）
  const validSizes = [4, 6, 9]
  if (!validSizes.includes(gridSize.value)) {
    alert('数独尺寸只能是 4、6 或 9，已自动调整为 9')
    gridSize.value = 9
  }
  if (gameStatus.value !== 'running') {
    resetGame()
    fetchLeaderboard()
  }
}

const handleCellClick = (index) => {
  const cell = sudokuGrid.value[index]
  if (cell.isFixed) return
  
  selectedCellIndex.value = index
  startGame()
}

const handleCellFocus = (index) => {
  selectedCellIndex.value = index
  startGame()
}

const handleCellInput = (index, event) => {
  const cell = sudokuGrid.value[index]
  let value = parseInt(event.target.value)
  
  if (isNaN(value) || value < 1 || value > gridSize.value) {
    cell.value = null
    event.target.value = ''
    // 清除数字时不清除候选值，保留辅助分析
  } else {
    cell.value = value
    // 填入数字时清除候选值
    if (cell.candidates) {
      cell.candidates = []
    }
  }
  
  validateCell(index)
  
  // 检查是否完成
  if (validateSudoku()) {
    finalizeGame()
  }
}

const toggleInputMode = () => {
  inputMode.value = inputMode.value === 'number' ? 'candidate' : 'number'
}

const isCandidateActive = (num) => {
  if (selectedCellIndex.value === null || inputMode.value !== 'candidate') return false
  const cell = sudokuGrid.value[selectedCellIndex.value]
  return cell.candidates && cell.candidates.includes(num)
}

const selectNumber = (num) => {
  if (selectedCellIndex.value === null) return
  
  const cell = sudokuGrid.value[selectedCellIndex.value]
  if (cell.isFixed) return
  
  if (inputMode.value === 'candidate') {
    // 候选值模式：添加或移除候选值
    if (!cell.candidates) {
      cell.candidates = []
    }
    const index = cell.candidates.indexOf(num)
    if (index > -1) {
      // 如果已存在，移除
      cell.candidates.splice(index, 1)
    } else {
      // 如果不存在，添加
      cell.candidates.push(num)
      cell.candidates.sort((a, b) => a - b) // 保持排序
    }
  } else {
    // 数字模式：直接填入数字
    cell.value = num
    // 填入数字时清除候选值
    if (cell.candidates) {
      cell.candidates = []
    }
    validateCell(selectedCellIndex.value)
    
    // 检查是否完成
    if (validateSudoku()) {
      finalizeGame()
    }
  }
}

const clearCell = () => {
  if (selectedCellIndex.value === null) return
  
  const cell = sudokuGrid.value[selectedCellIndex.value]
  if (cell.isFixed) return
  
  if (inputMode.value === 'candidate') {
    // 候选值模式：清除所有候选值
    if (cell.candidates) {
      cell.candidates = []
    }
  } else {
    // 数字模式：清除数字和候选值
    cell.value = null
    cell.hasError = false
    if (cell.candidates) {
      cell.candidates = []
    }
  }
}

const getCellClass = (cell, index) => {
  const classes = []
  if (cell.isFixed) classes.push('fixed')
  if (cell.hasError) classes.push('error')
  if (selectedCellIndex.value === index) classes.push('selected')
  if (cell.value && !cell.isFixed && !cell.hasError) classes.push('filled')
  return classes
}

const finalizeGame = async () => {
  if (gameStatus.value === 'completed') return
  stopTimer()
  gameStatus.value = 'completed'

  const payload = {
    gridSize: gridSize.value,
    difficulty: difficulty.value,
    durationMs: Math.round(timer.elapsedMs),
    username: username.value
  }

  try {
    await saveSudokuRecord(payload)
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
    const res = await getSudokuTopRecords(gridSize.value, difficulty.value, 10)
    const data = res?.data || res?.records || res || []
    topRecords.value = Array.isArray(data) ? data.slice(0, 10) : []
  } catch (error) {
    console.warn('获取排行榜失败：', error?.message || error)
    topRecords.value = []
  } finally {
    boardLoading.value = false
  }
}

const getDifficultyText = (diff) => {
  const map = { easy: '简单', medium: '中等', hard: '复杂' }
  return map[diff] || diff
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

// 监听设置变化，自动更新排行榜
watch(() => [gridSize.value, difficulty.value], () => {
  fetchLeaderboard()
})

onMounted(() => {
  resetGame()
  fetchLeaderboard()
})
</script>

<style scoped>
.sudoku-container {
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
  grid-template-columns: 1fr 1fr repeat(3, 1fr) 1.2fr;
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

.control-item input,
.control-item select {
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
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}

.sudoku-grid {
  display: grid;
  gap: 2px;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.sudoku-cell {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  cursor: pointer;
}

.sudoku-cell.fixed {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
}

.sudoku-cell.selected {
  background: rgba(29, 209, 161, 0.2);
  border-color: rgba(29, 209, 161, 0.5);
  box-shadow: 0 0 10px rgba(29, 209, 161, 0.3);
}

.sudoku-cell.filled {
  background: rgba(16, 37, 27, 0.4);
  border-color: rgba(29, 209, 161, 0.3);
}

.sudoku-cell.error {
  background: rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.5);
}

.cell-fixed {
  font-weight: 700;
  font-size: 18px;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #1dd1a1;
  outline: none;
  padding: 0;
}

.cell-input.has-error {
  color: #e74c3c;
}

.cell-input::-webkit-inner-spin-button,
.cell-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 候选值显示 */
.cell-candidates {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 1px;
  padding: 2px;
  font-size: 10px;
  align-items: center;
  justify-items: center;
}

/* 4×4 数独：2×2 网格 */
.cell-candidates.candidates-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  font-size: 12px;
}

/* 6×6 数独：3×2 网格 */
.cell-candidates.candidates-6 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  font-size: 11px;
}

/* 9×9 数独：3×3 网格 */
.cell-candidates.candidates-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  font-size: 10px;
}

.candidate-number {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  transition: all 0.2s;
  user-select: none;
}

.candidate-number.has-candidate {
  color: #8aa0c2;
  font-weight: 600;
  text-shadow: 0 0 4px rgba(138, 160, 194, 0.5);
}

.number-selector {
  background: rgba(0, 0, 0, 0.4);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.selector-label {
  color: #c5c5c5;
  font-size: 12px;
}

.mode-toggle-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #c5c5c5;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.mode-toggle-btn.active {
  background: rgba(29, 209, 161, 0.2);
  border-color: rgba(29, 209, 161, 0.4);
  color: #1dd1a1;
}

.selector-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.num-btn {
  flex: 1;
  min-width: 40px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f7f7f7;
  font-weight: 700;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.num-btn:hover {
  background: rgba(29, 209, 161, 0.2);
  border-color: rgba(29, 209, 161, 0.4);
  transform: translateY(-1px);
}

.num-btn.candidate-active {
  background: rgba(29, 209, 161, 0.3);
  border-color: rgba(29, 209, 161, 0.5);
  color: #1dd1a1;
  box-shadow: 0 0 8px rgba(29, 209, 161, 0.3);
}

.num-btn.clear-btn {
  background: rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.4);
}

.num-btn.clear-btn:hover {
  background: rgba(231, 76, 60, 0.3);
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
