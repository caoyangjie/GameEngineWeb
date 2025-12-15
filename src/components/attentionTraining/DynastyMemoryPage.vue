<template>
  <div class="dynasty-memory-container">
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
          <div class="badge">历史朝代 · 记忆力训练</div>
          <h1 class="page-title">历史朝代快速记忆</h1>
          <p class="subtitle">
            通过 DeepSeek 智能生成朝代详细信息，结合多维度记忆桩，完成"看信息记忆 → 语义回放"训练。
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
              <label for="prompt">朝代名称 / 提示词</label>
              <textarea
                id="prompt"
                v-model="promptInput"
                rows="2"
                placeholder="例如：唐朝 / 宋朝 / 秦汉 / 明清"
                :disabled="isLoadingDynasties || isRunning"
              ></textarea>
            </div>
            <div class="control-item">
              <label for="timePeriod">时间范围</label>
              <input
                id="timePeriod"
                v-model="timePeriodInput"
                placeholder="如：先秦、秦汉、唐宋"
                :disabled="isLoadingDynasties || isRunning"
              />
            </div>
            <div class="control-item">
              <label for="tags">标签</label>
              <input
                id="tags"
                v-model="tagsInput"
                placeholder="统一,繁荣,战争（用逗号分隔）"
                :disabled="isLoadingDynasties || isRunning"
              />
            </div>
            <div class="control-item">
              <label for="count">朝代数量</label>
              <select id="count" v-model="dynastyCount" :disabled="isLoadingDynasties || isRunning">
                <option value="3">3 个 · 速记</option>
                <option value="5">5 个 · 标准</option>
                <option value="8">8 个 · 进阶</option>
                <option value="10">10 个 · 挑战</option>
              </select>
            </div>
            <div class="control-item">
              <label for="difficulty">难度</label>
              <select id="difficulty" v-model="difficulty" :disabled="isLoadingDynasties || isRunning">
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
                :disabled="isLoadingDynasties || isRunning"
              >
                <option value="60">60 秒 · 极速</option>
                <option value="120">120 秒 · 标准</option>
                <option value="180">180 秒 · 稳妥</option>
              </select>
            </div>
            <div class="control-item">
              <label for="training-mode">训练模式</label>
              <select id="training-mode" v-model="trainingMode" :disabled="isLoadingDynasties || isRunning">
                <option value="name_to_info">名称→信息</option>
                <option value="info_to_name">信息→名称</option>
                <option value="timeline">时间线排序</option>
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
              <button class="ghost" @click="loadLatestDynasties" :disabled="isLoadingDynasties || isRunning">
                用最近朝代
              </button>
              <button class="primary" @click="generateAndStart" :disabled="isLoadingDynasties || isRunning">
                {{ isLoadingDynasties ? '生成中...' : '用 DeepSeek 生成' }}
              </button>
            </div>
          </section>

          <section class="game-card" v-if="dynasties.length">
            <div class="game-content">
              <div class="exit-button-container">
                <button class="btn-exit" @click="resetGame" :disabled="isLoadingDynasties">重置</button>
              </div>

              <div v-if="gameStatus === 'memorizing'" class="memorizing-mode">
                <div class="group-header">
                  <div class="group-number">朝代：{{ dynasties.length }} 个</div>
                  <div class="timer" v-if="showTimer">{{ formatTime(memorizeRemaining) }}</div>
                </div>
                <div class="card-grid-display">
                  <div v-for="dynasty in dynasties" :key="dynastyKey(dynasty)" class="dynasty-preview">
                    <div class="dynasty-title">
                      <span class="main">{{ dynasty.dynastyName }}</span>
                      <span class="time-range">{{ dynasty.timeRange || '时间未详' }}</span>
                    </div>
                    <div class="dynasty-summary" v-if="dynasty.summary">
                      {{ dynasty.summary }}
                    </div>
                    <div class="dynasty-details">
                      <div class="detail-item" v-if="dynasty.politicalSystem">
                        <span class="detail-label">政治制度：</span>
                        <span class="detail-text">{{ dynasty.politicalSystem }}</span>
                      </div>
                      <div class="detail-item" v-if="dynasty.economicDevelopment">
                        <span class="detail-label">经济发展：</span>
                        <span class="detail-text">{{ dynasty.economicDevelopment }}</span>
                      </div>
                      <div class="detail-item" v-if="dynasty.culturalAchievements">
                        <span class="detail-label">文化成就：</span>
                        <span class="detail-text">{{ dynasty.culturalAchievements }}</span>
                      </div>
                      <div class="detail-item" v-if="dynasty.importantEvents">
                        <span class="detail-label">重要事件：</span>
                        <span class="detail-text">{{ dynasty.importantEvents }}</span>
                      </div>
                      <div class="detail-item" v-if="dynasty.famousFigures">
                        <span class="detail-label">重要人物：</span>
                        <span class="detail-text">{{ dynasty.famousFigures }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="hint-text">
                  先理解每个朝代的核心特征，再在心里回放一遍。记好了可提前进入语义回放。
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

                <div class="quiz-content" v-if="currentQuestion">
                  <div class="question-prompt">{{ currentQuestion.prompt }}</div>
                  <div class="options-grid">
                    <button
                      v-for="(option, idx) in currentQuestion.options"
                      :key="idx"
                      class="option-button"
                      :class="{
                        selected: currentQuestion.userAnswer === option,
                        correct: gameStatus === 'completed' && option === currentQuestion.answer,
                        error: gameStatus === 'completed' && currentQuestion.userAnswer === option && option !== currentQuestion.answer
                      }"
                      @click="selectOption(option)"
                      :disabled="gameStatus === 'completed'"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>

                <div class="recall-actions">
                  <button class="ghost" @click="prevQuestion" :disabled="currentQuestionIndex === 0 || isTransitioning">
                    上一题
                  </button>
                  <button
                    class="primary"
                    @click="nextQuestion"
                    :disabled="!currentQuestion?.userAnswer || isTransitioning"
                  >
                    {{ currentQuestionIndex < quiz.length - 1 ? '下一题' : '完成' }}
                  </button>
                </div>
              </div>

              <div v-else-if="gameStatus === 'completed'" class="result-mode">
                <div class="result-header">
                  <h2>训练完成</h2>
                </div>
                <div class="result-stats">
                  <div class="stat-item">
                    <div class="stat-label">答对数量</div>
                    <div class="stat-value success">{{ resultStats.correct }} 个</div>
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

        <section class="info-column">
          <div class="leaderboard-card">
            <div class="card-header">
              <h3>排行榜</h3>
              <button class="refresh-btn" @click="fetchLeaderboard" :disabled="isLoadingLeaderboard">
                {{ isLoadingLeaderboard ? '刷新中...' : '刷新' }}
              </button>
            </div>
            <div class="leaderboard-list">
              <div
                v-for="(record, idx) in leaderboard"
                :key="record.id || idx"
                class="leaderboard-item"
              >
                <span class="rank">#{{ idx + 1 }}</span>
                <span class="username">{{ record.username || '匿名用户' }}</span>
                <span class="score">{{ record.accuracy }}%</span>
              </div>
              <div v-if="!isLoadingLeaderboard && !leaderboard.length" class="empty-tip">
                暂无排行榜数据
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_DYNASTY_MEMORY"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import {
  generateDynasties,
  getLatestDynasties,
  saveRecord,
  getTopRecords
} from '../../api/attentionDynastyMemory.js'

const router = useRouter()
const sidebarOpen = ref(false)
const promptInput = ref('唐朝、宋朝、明朝')
const timePeriodInput = ref('')
const tagsInput = ref('统一,繁荣,战争')
const dynastyCount = ref('5')
const difficulty = ref('进阶')
const memorizeSeconds = ref('120')
const trainingMode = ref('name_to_info')

const isLoadingDynasties = ref(false)
const isTransitioning = ref(false)
const isSaving = ref(false)
const isLoadingLeaderboard = ref(false)

const gameStatus = ref('idle') // idle | memorizing | recalling | completed
const dynasties = ref([])
const quiz = ref([])
const currentQuestionIndex = ref(0)
const memorizeRemaining = ref(0)
const recallStartAt = ref(0)
const recallElapsed = ref(0)
const resultStats = ref({ correct: 0, total: 0, duration: 0, accuracy: 0 })
const leaderboard = ref([])

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

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const dynastyKey = (dynasty) => dynasty.id || dynasty.dynastyName || Math.random().toString(36).slice(2)

const shuffle = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const normalizeDynasties = (list = []) =>
  list.map((item, idx) => ({
    id: item.id || idx + 1,
    dynastyName: item.dynastyName || `朝代${idx + 1}`,
    timeRange: item.timeRange || '',
    startYear: item.startYear || null,
    endYear: item.endYear || null,
    politicalSystem: item.politicalSystem || '',
    economicDevelopment: item.economicDevelopment || '',
    socialStructure: item.socialStructure || '',
    culturalAchievements: item.culturalAchievements || '',
    foreignRelations: item.foreignRelations || '',
    importantEvents: item.importantEvents || '',
    famousFigures: item.famousFigures || '',
    legalSystem: item.legalSystem || '',
    localGovernance: item.localGovernance || '',
    legacyAndInfluence: item.legacyAndInfluence || '',
    summary: item.summary || '',
    tags: item.tags || ''
  }))

const buildQuiz = () => {
  if (trainingMode.value === 'name_to_info') {
    // 名称→信息：给出朝代名称，选择对应的信息
    const optionsPool = dynasties.value.flatMap((d) => [
      d.politicalSystem,
      d.economicDevelopment,
      d.culturalAchievements,
      d.importantEvents
    ]).filter(Boolean)
    
    quiz.value = dynasties.value.map((dynasty) => {
      const prompt = `朝代：${dynasty.dynastyName}（${dynasty.timeRange || '时间未详'}）`
      const answer = dynasty.summary || dynasty.politicalSystem || dynasty.culturalAchievements || '暂无信息'
      const others = optionsPool.filter((opt) => opt !== answer)
      const distractors = shuffle(others).slice(0, Math.min(3, others.length))
      const options = shuffle([...distractors, answer])
      return {
        dynasty,
        prompt,
        options,
        answer,
        userAnswer: ''
      }
    })
  } else if (trainingMode.value === 'info_to_name') {
    // 信息→名称：给出信息，选择对应的朝代名称
    const optionsPool = dynasties.value.map((d) => d.dynastyName)
    
    quiz.value = dynasties.value.map((dynasty) => {
      const info = dynasty.summary || dynasty.politicalSystem || dynasty.culturalAchievements || dynasty.importantEvents || '暂无信息'
      const prompt = `信息：${info.slice(0, 100)}${info.length > 100 ? '...' : ''}`
      const answer = dynasty.dynastyName
      const others = optionsPool.filter((opt) => opt !== answer)
      const distractors = shuffle(others).slice(0, Math.min(3, others.length))
      const options = shuffle([...distractors, answer])
      return {
        dynasty,
        prompt,
        options,
        answer,
        userAnswer: ''
      }
    })
  } else if (trainingMode.value === 'timeline') {
    // 时间线排序：给出朝代，选择正确的时间范围
    quiz.value = dynasties.value.map((dynasty) => {
      const prompt = `朝代：${dynasty.dynastyName}`
      const answer = dynasty.timeRange || '时间未详'
      // 生成其他朝代的时间范围作为干扰项
      const others = dynasties.value
        .filter((d) => d.dynastyName !== dynasty.dynastyName && d.timeRange)
        .map((d) => d.timeRange)
      const distractors = shuffle(others).slice(0, Math.min(3, others.length))
      const options = shuffle([...distractors, answer])
      return {
        dynasty,
        prompt,
        options,
        answer,
        userAnswer: ''
      }
    })
  }
  currentQuestionIndex.value = 0
}

const startTimer = () => {
  clearTimer()
  memorizeRemaining.value = parseInt(memorizeSeconds.value, 10) || 120
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
  if (!dynasties.value.length) return
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
  if (!dynasties.value.length) return
  clearTimer()
  gameStatus.value = 'recalling'
  recallStartAt.value = performance.now()
  recallElapsed.value = 0
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

  await saveRecordData(correct, total, accuracy, duration)
  fetchLeaderboard()
}

const saveRecordData = async (correct, total, accuracy, duration) => {
  try {
    isSaving.value = true
    const detail = quiz.value.map((q) => ({
      dynasty: q.dynasty.dynastyName,
      prompt: q.prompt,
      userAnswer: q.userAnswer,
      answer: q.answer,
      correct: q.userAnswer === q.answer
    }))
    
    const dynastyIds = dynasties.value.map((d) => d.id).filter(Boolean).join(',')
    const dynastyList = JSON.stringify(dynasties.value.map((d) => ({
      dynastyName: d.dynastyName,
      timeRange: d.timeRange
    })))
    
    const record = {
      dynastyIds,
      dynastyList,
      trainingMode: trainingMode.value,
      correctCount: correct,
      totalCount: total,
      accuracy,
      durationSeconds: duration,
      detail: JSON.stringify(detail),
      difficulty: difficulty.value
    }
    
    const res = await saveRecord(record)
    if (res?.code === 200 || res?.data) {
      console.log('记录保存成功')
    }
  } catch (error) {
    console.error('保存记录失败', error)
  } finally {
    isSaving.value = false
  }
}

const generateAndStart = async () => {
  if (isLoadingDynasties.value) return
  
  const promptText = promptInput.value.trim()
  if (!promptText) {
    alert('请输入朝代名称或提示词')
    return
  }
  
  isLoadingDynasties.value = true
  try {
    const tags = tagsInput.value.trim() ? tagsInput.value.split(/[,，]/).map((t) => t.trim()).filter(Boolean) : []
    const requestData = {
      prompt: promptText,
      count: parseInt(dynastyCount.value, 10),
      difficulty: difficulty.value,
      timePeriod: timePeriodInput.value.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined
    }
    
    const res = await generateDynasties(requestData)
    const data = res?.data || res || []
    dynasties.value = normalizeDynasties(data)
    
    if (dynasties.value.length > 0) {
      buildQuiz()
      startMemorize()
    } else {
      alert('未能生成朝代信息，请重试')
    }
  } catch (error) {
    console.error('生成朝代信息失败', error)
    alert('生成朝代信息失败：' + (error.message || '未知错误'))
  } finally {
    isLoadingDynasties.value = false
  }
}

const loadLatestDynasties = async () => {
  if (isLoadingDynasties.value) return
  
  isLoadingDynasties.value = true
  try {
    const limit = parseInt(dynastyCount.value, 10)
    const res = await getLatestDynasties(limit)
    const data = res?.data || res || []
    dynasties.value = normalizeDynasties(data)
    
    if (dynasties.value.length > 0) {
      buildQuiz()
      startMemorize()
    } else {
      alert('暂无最近的朝代信息，请先生成')
    }
  } catch (error) {
    console.error('获取最近朝代信息失败', error)
    alert('获取最近朝代信息失败：' + (error.message || '未知错误'))
  } finally {
    isLoadingDynasties.value = false
  }
}

const fetchLeaderboard = async () => {
  isLoadingLeaderboard.value = true
  try {
    const res = await getTopRecords(10)
    const data = res?.data || res || []
    leaderboard.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取排行榜失败', error)
    leaderboard.value = []
  } finally {
    isLoadingLeaderboard.value = false
  }
}

const resetGame = () => {
  clearTimer()
  clearRecallTimer()
  gameStatus.value = 'idle'
  dynasties.value = []
  quiz.value = []
  currentQuestionIndex.value = 0
  memorizeRemaining.value = 0
  recallStartAt.value = 0
  recallElapsed.value = 0
  resultStats.value = { correct: 0, total: 0, duration: 0, accuracy: 0 }
}

const goBack = () => {
  router.push(ROUTES.ATTENTION_TRAINING)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  fetchLeaderboard()
})

onBeforeUnmount(() => {
  clearTimer()
  clearRecallTimer()
})
</script>

<style scoped>
.dynasty-memory-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.main-content {
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 999px;
  color: #ffd700;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: #ffd700;
  margin: 0 0 8px;
}

.subtitle {
  color: #c5c5c5;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f7f7f7;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
}

.game-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.controls {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item.wide {
  grid-column: 1 / -1;
}

.control-item label {
  color: #ffd700;
  font-size: 13px;
  font-weight: 600;
}

.control-item input,
.control-item select,
.control-item textarea {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f7f7f7;
  font-size: 14px;
  transition: all 0.2s;
}

.control-item input:focus,
.control-item select:focus,
.control-item textarea:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.control-item textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.control-item.compact {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.control-item.compact .label {
  color: #c5c5c5;
  font-size: 13px;
}

.status {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status.idle {
  background: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

.status.memorizing {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.status.recalling {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
}

.status.completed {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.progress-info {
  color: #ffd700;
  font-weight: 700;
  font-size: 14px;
}

.control-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

button.ghost {
  padding: 10px 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f7f7f7;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

button.ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

button.primary {
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(244, 208, 63, 0.3));
  border: 1px solid rgba(255, 215, 0, 0.5);
  color: #ffd700;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
  flex: 1;
}

button.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(244, 208, 63, 0.4));
  border-color: rgba(255, 215, 0, 0.7);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-card {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  min-height: 500px;
}

.game-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exit-button-container {
  display: flex;
  justify-content: flex-end;
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
.recall-mode,
.result-mode {
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.dynasty-preview {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 215, 0, 0.18);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dynasty-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dynasty-title .main {
  color: #ffd700;
  font-weight: 800;
  font-size: 20px;
}

.dynasty-title .time-range {
  color: #8fd19e;
  font-size: 13px;
}

.dynasty-summary {
  color: #f7f7f7;
  font-size: 14px;
  line-height: 1.6;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.dynasty-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.detail-label {
  color: #8fd19e;
  font-weight: 600;
}

.detail-text {
  color: #c5c5c5;
  line-height: 1.5;
}

.hint-text {
  color: #a9c8ff;
  font-size: 13px;
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.quiz-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-prompt {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.option-button {
  padding: 16px 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #f7f7f7;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
  text-align: left;
}

.option-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
  transform: translateY(-2px);
}

.option-button.selected {
  background: rgba(52, 152, 219, 0.2);
  border-color: rgba(52, 152, 219, 0.6);
  color: #3498db;
}

.option-button.correct {
  background: rgba(46, 204, 113, 0.2);
  border-color: rgba(46, 204, 113, 0.6);
  color: #2ecc71;
}

.option-button.error {
  background: rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.6);
  color: #e74c3c;
}

.recall-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.recall-actions button {
  flex: 1;
}

.result-header h2 {
  color: #ffd700;
  font-size: 28px;
  margin: 0;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
}

.stat-label {
  color: #c5c5c5;
  font-size: 13px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #ffd700;
}

.stat-value.success {
  color: #2ecc71;
}

.stat-value.error {
  color: #e74c3c;
}

.target-number-display {
  font-size: 16px;
  color: #c5c5c5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-number {
  color: #ffd700;
  font-weight: 700;
  font-size: 18px;
}

.leaderboard-card {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  color: #ffd700;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.refresh-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f7f7f7;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.2s;
}

.leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 215, 0, 0.2);
}

.leaderboard-item .rank {
  color: #ffd700;
  font-weight: 700;
  font-size: 14px;
  min-width: 30px;
}

.leaderboard-item .username {
  flex: 1;
  color: #f7f7f7;
  font-size: 14px;
}

.leaderboard-item .score {
  color: #2ecc71;
  font-weight: 700;
  font-size: 14px;
}

.empty-tip {
  color: #c5c5c5;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* 背景样式 */
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
  animation: twinkle 3s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.galaxy {
  background: radial-gradient(ellipse at 40% 20%, rgba(86, 122, 255, 0.15), transparent 35%),
    radial-gradient(ellipse at 80% 10%, rgba(244, 208, 63, 0.14), transparent 35%);
  opacity: 0.6;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

/* 响应式样式 */
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

  .card-grid-display {
    grid-template-columns: 1fr;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .result-stats {
    grid-template-columns: 1fr;
  }
}
</style>