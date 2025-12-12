<template>
  <div class="number-memory-code-container">
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
          <div class="badge">数字记忆编码 · 专注力</div>
          <h1 class="page-title">数字记忆编码训练</h1>
          <p class="subtitle">通过图片与数字的关联训练，快速记忆 00-99 的数字编码。选择学习模式熟悉编码，或选择测试模式检验记忆效果。</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="goBack">返回训练中心</button>
        </div>
      </header>

      <div class="content-grid">
        <section class="game-column">
          <section class="controls">
            <div class="control-item">
              <label for="game-mode">游戏模式</label>
              <select id="game-mode" v-model="gameMode" :disabled="isRunning">
                <option value="learn">学习模式</option>
                <option value="test">测试模式</option>
                <option value="random">随机练习</option>
              </select>
            </div>
            <div class="control-item">
              <label for="difficulty">难度级别</label>
              <select id="difficulty" v-model="difficulty" :disabled="isRunning">
                <option value="easy">简单 (20题)</option>
                <option value="medium">中等 (50题)</option>
                <option value="hard">困难 (110题)</option>
              </select>
            </div>
            <div class="control-item compact">
              <div class="label">当前状态</div>
              <div class="status" :class="gameStatus">
                {{ statusText }}
              </div>
            </div>
            <div class="control-item compact">
              <div class="label">进度</div>
              <div class="progress-info">
                {{ currentQuestion }} / {{ totalQuestions }}
              </div>
            </div>
            <div class="control-item compact">
              <div class="label">正确率</div>
              <div class="accuracy">
                {{ accuracyText }}
              </div>
            </div>
            <div class="control-actions">
              <button class="ghost" @click="resetGame" v-if="!isRunning">重置</button>
              <button class="primary" @click="startGame" v-if="!isRunning">开始</button>
            </div>
          </section>

          <section class="game-card" v-if="gameStatus !== 'idle'">
            <div class="game-content">
              <!-- 学习模式 -->
              <div v-if="gameMode === 'learn'" class="learn-mode">
                <div class="number-display">{{ currentNumber }}</div>
                <div class="image-display">
                  <img 
                    :src="getImageUrl(currentNumber)" 
                    :alt="`数字 ${currentNumber} 的编码图片`"
                    @error="handleImageError"
                  />
                </div>
                <div class="hint-text">记住这个数字与图片的关联</div>
                <button class="primary" @click="nextQuestion" :disabled="isTransitioning">
                  {{ isLastQuestion ? '完成学习' : '下一个' }}
                </button>
              </div>

              <!-- 测试模式 -->
              <div v-if="gameMode === 'test'" class="test-mode">
                <div class="question-header">
                  <div class="question-number">第 {{ currentQuestion }} 题</div>
                  <div class="timer" v-if="showTimer">{{ formatTime(remainingTime) }}</div>
                </div>
                <div class="image-display">
                  <img 
                    :src="getImageUrl(currentNumber)" 
                    :alt="`这是哪个数字的编码？`"
                    @error="handleImageError"
                  />
                </div>
                <div class="answer-section">
                  <div class="hint-text">这是哪个数字的编码？</div>
                  <div class="answer-input-group">
                    <input
                      type="text"
                      v-model="userAnswer"
                      placeholder="输入数字 (00-99)"
                      maxlength="2"
                      @keyup.enter="submitAnswer"
                      :disabled="isTransitioning"
                      ref="answerInput"
                    />
                    <button class="primary" @click="submitAnswer" :disabled="isTransitioning || !userAnswer">
                      提交
                    </button>
                  </div>
                  <div v-if="showFeedback" class="feedback" :class="feedbackType">
                    {{ feedbackMessage }}
                  </div>
                </div>
              </div>

              <!-- 随机练习模式 -->
              <div v-if="gameMode === 'random'" class="random-mode">
                <div class="question-header">
                  <div class="question-number">第 {{ currentQuestion }} 题</div>
                </div>
                <div class="image-display">
                  <img 
                    :src="getImageUrl(currentNumber)" 
                    :alt="`数字 ${currentNumber} 的编码图片`"
                    @error="handleImageError"
                  />
                </div>
                <div class="answer-section">
                  <div class="hint-text">
                    这个图片对应的数字是什么？
                  </div>
                  <div class="answer-input-group">
                    <input
                      type="text"
                      v-model="userAnswer"
                      placeholder="输入数字 (00-99)"
                      maxlength="2"
                      @keyup.enter="submitAnswer"
                      :disabled="isTransitioning"
                      ref="answerInput"
                    />
                    <button class="primary" @click="submitAnswer" :disabled="isTransitioning || !userAnswer">
                      提交
                    </button>
                  </div>
                  <div v-if="showFeedback" class="feedback" :class="feedbackType">
                    {{ feedbackMessage }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 结果展示 -->
          <section class="result-card" v-if="gameStatus === 'completed'">
            <div class="result-header">
              <div class="badge ghost">训练完成</div>
              <h2>训练结果</h2>
            </div>
            <div class="result-stats">
              <div class="stat-item">
                <div class="stat-label">总题数</div>
                <div class="stat-value">{{ totalQuestions }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">正确数</div>
                <div class="stat-value success">{{ correctCount }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">错误数</div>
                <div class="stat-value error">{{ wrongCount }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">正确率</div>
                <div class="stat-value" :class="accuracyClass">{{ accuracyText }}</div>
              </div>
            </div>
            <div class="result-actions">
              <button class="ghost" @click="resetGame">再来一次</button>
              <button class="primary" @click="goBack">返回训练中心</button>
            </div>
          </section>
        </section>

        <section class="info-column">
          <div class="info-card">
            <div class="info-header">
              <div class="badge ghost">编码说明</div>
              <h3>数字编码系统</h3>
            </div>
            <div class="info-content">
              <p>本训练使用 00-99 共 100 个数字编码，每个数字对应一个独特的图片编码。</p>
              <p class="hint">通过反复练习，建立数字与图片之间的快速联想，提升记忆效率。</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <div class="badge ghost">游戏模式</div>
              <h3>模式说明</h3>
            </div>
            <div class="info-content">
              <div class="mode-item">
                <strong>学习模式：</strong>依次展示数字和对应图片，帮助熟悉编码。
              </div>
              <div class="mode-item">
                <strong>测试模式：</strong>显示图片，输入对应数字，检验记忆效果。
              </div>
              <div class="mode-item">
                <strong>随机练习：</strong>随机显示数字或图片，双向训练记忆关联。
              </div>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <div class="badge ghost">技巧提示</div>
              <h3>记忆技巧</h3>
            </div>
            <div class="info-content">
              <ul class="tips-list">
                <li>观察图片的特征，寻找与数字的关联</li>
                <li>建立自己的记忆故事或联想</li>
                <li>反复练习，形成条件反射</li>
                <li>从简单模式开始，逐步提升难度</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_NUMBER_MEMORY_CODE"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'

// 预加载所有图片 (00-99)
const imageModules = import.meta.glob('../../images/icons/*.png', { eager: true })
const imageMap = {}
for (const path in imageModules) {
  const match = path.match(/(\d{2})\.png$/)
  if (match) {
    imageMap[match[1]] = imageModules[path].default || imageModules[path]
  }
}

const router = useRouter()
const sidebarOpen = ref(false)
const gameMode = ref('learn')
const difficulty = ref('medium')
const gameStatus = ref('idle') // idle | running | completed
const isRunning = computed(() => gameStatus.value === 'running')
const isTransitioning = ref(false)

const currentQuestion = ref(0)
const totalQuestions = computed(() => {
  if (difficulty.value === 'easy') return 20
  if (difficulty.value === 'medium') return 50
  return 110
})

const questionNumbers = ref([])
const currentNumber = ref('00')
const userAnswer = ref('')
const showFeedback = ref(false)
const feedbackType = ref('')
const feedbackMessage = ref('')

const correctCount = ref(0)
const wrongCount = ref(0)

// 随机练习模式（现在只显示图片）
const showTimer = ref(false)
const remainingTime = ref(0)
let timerInterval = null

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const statusText = computed(() => {
  if (gameStatus.value === 'running') return '进行中'
  if (gameStatus.value === 'completed') return '已完成'
  return '待开始'
})

const accuracyText = computed(() => {
  const total = correctCount.value + wrongCount.value
  if (total === 0) return '0%'
  const accuracy = (correctCount.value / total) * 100
  return `${accuracy.toFixed(0)}%`
})

const accuracyClass = computed(() => {
  const total = correctCount.value + wrongCount.value
  if (total === 0) return ''
  const accuracy = correctCount.value / total
  if (accuracy >= 0.8) return 'success'
  if (accuracy >= 0.6) return 'warning'
  return 'error'
})

const isLastQuestion = computed(() => {
  return currentQuestion.value >= totalQuestions.value
})

const getImageUrl = (number) => {
  const numStr = String(number).padStart(2, '0')
  return imageMap[numStr] || ''
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent) {
    parent.innerHTML = `<div class="image-placeholder">图片 ${currentNumber.value}</div>`
  }
}

const generateQuestionNumbers = () => {
  const numbers = []
  const used = new Set()
  while (numbers.length < totalQuestions.value) {
    const num = Math.floor(Math.random() * 110)
    // 大于100的数字去掉，只保留00-99
    // const numStr = num > 99 ? String("0"+(num - 100)) : String(num).padStart(2, '0')
    const numStr = num > 99 && num < 110 ? String(num - 100).padStart(2,'0') : String(num);
    if (!used.has(numStr)) {
      used.add(numStr)
      numbers.push(numStr)
    }
  }
  return numbers
}

const startGame = () => {
  gameStatus.value = 'running'
  currentQuestion.value = 0
  correctCount.value = 0
  wrongCount.value = 0
  userAnswer.value = ''
  showFeedback.value = false
  
  questionNumbers.value = generateQuestionNumbers()
  
  if (gameMode.value === 'learn') {
    currentQuestion.value = 1
    currentNumber.value = questionNumbers.value[0]
  } else {
    nextQuestion()
  }
}

const nextQuestion = () => {
  if (currentQuestion.value >= totalQuestions.value) {
    if (gameMode.value === 'learn') {
      completeGame()
    }
    return
  }
  
  currentQuestion.value++
  currentNumber.value = questionNumbers.value[currentQuestion.value - 1]
  
  // 聚焦输入框
  nextTick(() => {
    const input = document.querySelector('input[type="text"]')
    if (input) {
      input.focus()
    }
  })
}

const submitAnswer = async () => {
  if (!userAnswer.value.trim()) return
  
  isTransitioning.value = true
  const answer = userAnswer.value.trim().padStart(2, '0')
  const isCorrect = answer === currentNumber.value
  
  if (isCorrect) {
    correctCount.value++
    feedbackType.value = 'success'
    feedbackMessage.value = '✓ 回答正确！'
  } else {
    wrongCount.value++
    feedbackType.value = 'error'
    feedbackMessage.value = `✗ 回答错误！正确答案是 ${currentNumber.value}`
  }
  
  showFeedback.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  showFeedback.value = false
  userAnswer.value = ''
  isTransitioning.value = false
  
  if (currentQuestion.value >= totalQuestions.value) {
    completeGame()
  } else {
    nextQuestion()
  }
}

const completeGame = () => {
  gameStatus.value = 'completed'
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetGame = () => {
  gameStatus.value = 'idle'
  currentQuestion.value = 0
  correctCount.value = 0
  wrongCount.value = 0
  userAnswer.value = ''
  showFeedback.value = false
  currentNumber.value = '00'
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const goBack = () => {
  router.navigate(ROUTES.ATTENTION_TRAINING)
}

watch(() => gameMode.value, () => {
  if (gameStatus.value === 'running') {
    resetGame()
  }
})

watch(() => difficulty.value, () => {
  if (gameStatus.value === 'running') {
    resetGame()
  }
})
</script>

<style scoped>
.number-memory-code-container {
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
  grid-template-columns: 1.5fr 1fr;
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
  grid-template-columns: repeat(3, 1fr) 1.2fr;
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

.control-item label {
  color: #c5c5c5;
  font-size: 12px;
}

.control-item select {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px;
  color: #f7f7f7;
  cursor: pointer;
}

.control-item select:disabled {
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

.status.running {
  color: #f4d03f;
}

.status.completed {
  color: #1dd1a1;
}

.progress-info {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.accuracy {
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
  min-height: 400px;
}

.game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.learn-mode,
.test-mode,
.random-mode {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.question-number {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.timer {
  font-size: 18px;
  font-weight: 700;
  color: #f4d03f;
}

.number-display {
  font-size: 72px;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  margin: 20px 0;
}

.image-display {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 10px;
  margin: 20px 0;
}

.image-display img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-placeholder {
  font-size: 24px;
  color: #c5c5c5;
  text-align: center;
}

.hint-text {
  color: #c5c5c5;
  font-size: 16px;
  text-align: center;
}

.answer-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.answer-input-group {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 300px;
}

.answer-input-group input {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 12px 16px;
  color: #f7f7f7;
  font-size: 18px;
  text-align: center;
  font-weight: 700;
}

.answer-input-group input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.feedback {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

.feedback.success {
  background: rgba(29, 209, 161, 0.2);
  color: #1dd1a1;
  border: 1px solid rgba(29, 209, 161, 0.4);
}

.feedback.error {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.4);
}

.result-card {
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
}

.result-header {
  margin-bottom: 20px;
}

.result-header h2 {
  font-size: 24px;
  color: #ffd700;
  margin-top: 10px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  background: rgba(0, 0, 0, 0.4);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  text-align: center;
}

.stat-label {
  color: #c5c5c5;
  font-size: 12px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffd700;
}

.stat-value.success {
  color: #1dd1a1;
}

.stat-value.error {
  color: #e74c3c;
}

.stat-value.warning {
  color: #f39c12;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-card {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 14px;
  padding: 16px;
  position: relative;
  z-index: 5;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
}

.info-header {
  margin-bottom: 12px;
}

.info-header h3 {
  font-size: 18px;
  color: #ffd700;
  margin-top: 8px;
}

.info-content {
  color: #c5c5c5;
  font-size: 14px;
  line-height: 1.6;
}

.info-content p {
  margin-bottom: 8px;
}

.info-content .hint {
  color: #8aa0c2;
  font-size: 12px;
}

.mode-item {
  margin-bottom: 10px;
  padding-left: 8px;
}

.mode-item strong {
  color: #ffd700;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #f4d03f;
  font-weight: 700;
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

  .result-stats {
    grid-template-columns: 1fr;
  }
}
</style>

