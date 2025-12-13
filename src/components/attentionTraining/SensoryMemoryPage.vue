<template>
  <div class="sensory-memory-container">
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
          <div class="badge">感官探险记忆法 · 多感官协同训练</div>
          <h1 class="page-title">感官探险记忆法</h1>
          <p class="subtitle">
            通过视觉、听觉、嗅觉、触觉、味觉的协同运用，增强记忆力和联想能力，提升学习效果。
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="goBack">返回训练中心</button>
        </div>
      </header>

      <div class="content-grid">
        <section class="game-column">
          <!-- 加载动画遮罩 -->
          <div class="loading-overlay" v-if="isLoading">
            <div class="loading-container">
              <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
              </div>
              <div class="loading-text">正在生成感官记忆内容...</div>
              <div class="loading-hint">AI 正在为您精心设计多感官体验，请稍候</div>
            </div>
          </div>

          <!-- 控制面板 -->
          <section class="controls" :class="{ 'loading-blur': isLoading }">
            <div class="control-item wide">
              <label for="prompt">主题 / 提示词</label>
              <textarea
                id="prompt"
                v-model="promptInput"
                rows="2"
                placeholder="例如：自然风光 / 美食体验 / 情感表达 / 生活场景"
                :disabled="isLoading || gameStatus !== 'idle'"
              ></textarea>
            </div>
            <div class="control-item wide">
              <label for="keywords">关键词 / 关键句子（可选）</label>
              <textarea
                id="keywords"
                v-model="keywordsInput"
                rows="3"
                placeholder="例如：春天、樱花、温暖 / 或者输入关键句子：春天的樱花盛开，带来温暖的气息"
                :disabled="isLoading || gameStatus !== 'idle'"
              ></textarea>
            </div>
            <div class="control-item">
              <label for="contentType">内容类型</label>
              <select id="contentType" v-model="contentType" :disabled="isLoading || gameStatus !== 'idle'">
                <option value="word">词语</option>
                <option value="sentence">句子</option>
              </select>
            </div>
            <div class="control-item">
              <label for="tags">标签</label>
              <input
                id="tags"
                v-model="tagsInput"
                placeholder="记忆,学习,训练（用逗号分隔）"
                :disabled="isLoading || gameStatus !== 'idle'"
              />
            </div>
            <div class="control-actions">
              <button class="ghost" @click="loadLatestContents" :disabled="isLoading || gameStatus !== 'idle'">
                用最近内容
              </button>
              <button class="primary" @click="generateAndStart" :disabled="isLoading || gameStatus !== 'idle'">
                {{ isLoading ? '生成中...' : '生成并开始训练' }}
              </button>
            </div>
          </section>

          <!-- 生成的内容预览（在控制面板下方显示） -->
          <section class="generated-contents-preview" v-if="gameStatus === 'idle' && contents.length > 0">
            <div class="preview-header">
              <h3>已生成的内容（{{ contents.length }} 个）</h3>
              <button class="btn-start" @click="startMemorize">开始训练</button>
            </div>
            <div class="preview-content-list">
              <div
                v-for="(content, index) in contents"
                :key="index"
                class="preview-content-item"
              >
                <div class="preview-content-header">
                  <span class="preview-number">{{ index + 1 }} / {{ contents.length }}</span>
                  <span class="preview-text">{{ content.content }}</span>
                </div>
                <div class="preview-content-description" v-if="content.description">
                  {{ content.description }}
                </div>
                <div class="preview-sensory-experiences">
                  <div class="preview-sensory-item" v-if="content.visualUrl">
                    <span class="preview-sensory-icon">👁️</span>
                    <span class="preview-sensory-label">视觉：</span>
                    <span class="preview-sensory-value">{{ content.visualUrl }}</span>
                  </div>
                  <div class="preview-sensory-item" v-if="content.audioUrl">
                    <span class="preview-sensory-icon">🔊</span>
                    <span class="preview-sensory-label">听觉：</span>
                    <span class="preview-sensory-value">{{ content.audioUrl }}</span>
                  </div>
                  <div class="preview-sensory-item" v-if="content.scentDescription">
                    <span class="preview-sensory-icon">🌸</span>
                    <span class="preview-sensory-label">嗅觉：</span>
                    <span class="preview-sensory-value">{{ content.scentDescription }}</span>
                  </div>
                  <div class="preview-sensory-item" v-if="content.touchDescription">
                    <span class="preview-sensory-icon">✋</span>
                    <span class="preview-sensory-label">触觉：</span>
                    <span class="preview-sensory-value">{{ content.touchDescription }}</span>
                  </div>
                  <div class="preview-sensory-item" v-if="content.tasteDescription">
                    <span class="preview-sensory-icon">👅</span>
                    <span class="preview-sensory-label">味觉：</span>
                    <span class="preview-sensory-value">{{ content.tasteDescription }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 感官引导阶段 -->
          <section class="game-card" v-if="gameStatus === 'sensory-guide' && contents.length">
            <div class="game-content">
              <div class="exit-button-container">
                <button class="btn-exit" @click="resetGame">重置</button>
              </div>

              <div class="sensory-guide-mode">
                <div class="group-header">
                  <div class="group-number">内容：{{ contents.length }} 个</div>
                  <div class="timer">{{ formatTime(memorizeRemaining) }}</div>
                </div>

                <div class="sensory-content-list">
                  <div
                    v-for="(content, index) in contents"
                    :key="index"
                    class="sensory-content-item"
                    :class="{ active: currentContentIndex === index }"
                  >
                    <div class="content-header">
                      <span class="content-number">{{ index + 1 }} / {{ contents.length }}</span>
                      <span class="content-text">{{ content.content }}</span>
                    </div>
                    <div class="content-description" v-if="content.description">
                      {{ content.description }}
                    </div>
                    <div class="sensory-experiences">
                      <div class="sensory-item" v-if="content.visualUrl">
                        <span class="sensory-icon">👁️</span>
                        <span class="sensory-label">视觉：</span>
                        <span class="sensory-value">{{ content.visualUrl }}</span>
                      </div>
                      <div class="sensory-item" v-if="content.audioUrl">
                        <span class="sensory-icon">🔊</span>
                        <span class="sensory-label">听觉：</span>
                        <span class="sensory-value">{{ content.audioUrl }}</span>
                      </div>
                      <div class="sensory-item" v-if="content.scentDescription">
                        <span class="sensory-icon">🌸</span>
                        <span class="sensory-label">嗅觉：</span>
                        <span class="sensory-value">{{ content.scentDescription }}</span>
                      </div>
                      <div class="sensory-item" v-if="content.touchDescription">
                        <span class="sensory-icon">✋</span>
                        <span class="sensory-label">触觉：</span>
                        <span class="sensory-value">{{ content.touchDescription }}</span>
                      </div>
                      <div class="sensory-item" v-if="content.tasteDescription">
                        <span class="sensory-icon">👅</span>
                        <span class="sensory-label">味觉：</span>
                        <span class="sensory-value">{{ content.tasteDescription }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="hint-text">
                  仔细观察每个内容的感官体验，尝试在脑海中构建多感官联想的画面。记好了可提前进入回忆挑战。
                </div>
                <button class="primary" @click="enterRecall" :disabled="isTransitioning">
                  我记好了，进入回忆挑战
                </button>
              </div>
            </div>
          </section>

          <!-- 回忆挑战阶段 -->
          <section class="game-card" v-if="gameStatus === 'recalling'">
            <div class="game-content">
              <div class="exit-button-container">
                <button class="btn-exit" @click="resetGame">重置</button>
              </div>

              <div class="recall-mode">
                <div class="answer-header">
                  <div class="target-number-display">
                    当前题目：
                    <span class="target-number">{{ currentQuestionIndex + 1 }} / {{ contents.length }}</span>
                  </div>
                  <div class="timer">回放用时：{{ formatTime(recallElapsed) }}</div>
                </div>

                <div class="recall-question">
                  <div class="question-text">
                    请回忆第 {{ currentQuestionIndex + 1 }} 个内容：
                  </div>
                  <div class="sensory-hints">
                    <div class="hint-item" v-if="currentContent.visualUrl">
                      <span class="hint-icon">👁️</span>
                      <span>视觉提示：{{ currentContent.visualUrl }}</span>
                    </div>
                    <div class="hint-item" v-if="currentContent.audioUrl">
                      <span class="hint-icon">🔊</span>
                      <span>听觉提示：{{ currentContent.audioUrl }}</span>
                    </div>
                    <div class="hint-item" v-if="currentContent.scentDescription">
                      <span class="hint-icon">🌸</span>
                      <span>嗅觉提示：{{ currentContent.scentDescription }}</span>
                    </div>
                    <div class="hint-item" v-if="currentContent.touchDescription">
                      <span class="hint-icon">✋</span>
                      <span>触觉提示：{{ currentContent.touchDescription }}</span>
                    </div>
                    <div class="hint-item" v-if="currentContent.tasteDescription">
                      <span class="hint-icon">👅</span>
                      <span>味觉提示：{{ currentContent.tasteDescription }}</span>
                    </div>
                  </div>
                </div>

                <div class="answer-input-section">
                  <label for="user-answer">你的答案：</label>
                  <textarea
                    id="user-answer"
                    v-model="userAnswers[currentQuestionIndex]"
                    rows="3"
                    placeholder="请输入你回忆的内容..."
                    @keyup.enter.ctrl="submitAnswer"
                  ></textarea>
                </div>

                <div class="recall-actions">
                  <button class="ghost" @click="skipQuestion" v-if="currentQuestionIndex < contents.length - 1">
                    跳过
                  </button>
                  <button
                    class="primary"
                    @click="submitAnswer"
                    :disabled="!userAnswers[currentQuestionIndex]?.trim()"
                  >
                    {{ currentQuestionIndex < contents.length - 1 ? '提交并下一题' : '提交并完成' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 结果展示阶段 -->
          <section class="game-card" v-if="gameStatus === 'result'">
            <div class="game-content">
              <div class="result-mode">
                <div class="result-header">
                  <div class="result-title">训练完成！</div>
                </div>

                <div class="result-stats">
                  <div class="stat-item">
                    <div class="stat-label">总内容数</div>
                    <div class="stat-value">{{ contents.length }} 个</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">回忆正确</div>
                    <div class="stat-value success">{{ resultStats.correct }} 个</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">正确率</div>
                    <div class="stat-value" :class="resultStats.accuracy >= 80 ? 'success' : 'error'">
                      {{ resultStats.accuracy }}%
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">记忆用时</div>
                    <div class="stat-value">{{ formatTime(resultStats.memorizeDuration) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">回忆用时</div>
                    <div class="stat-value">{{ formatTime(resultStats.recallDuration) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总用时</div>
                    <div class="stat-value">{{ formatTime(resultStats.totalDuration) }}</div>
                  </div>
                </div>

                <!-- 详细结果 -->
                <div class="result-details">
                  <div class="details-title">详细结果</div>
                  <div class="details-list">
                    <div
                      v-for="(item, index) in recallResults"
                      :key="index"
                      class="detail-item"
                      :class="{ correct: item.isCorrect, incorrect: !item.isCorrect }"
                    >
                      <div class="detail-content">
                        <span class="detail-number">{{ index + 1 }}.</span>
                        <span class="detail-original">{{ item.original }}</span>
                        <span class="detail-arrow">→</span>
                        <span class="detail-answer">{{ item.userAnswer || '(未回答)' }}</span>
                        <span class="detail-status" v-if="item.isCorrect">✓</span>
                        <span class="detail-status error" v-else>✗</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 用户反馈 -->
                <div class="feedback-section">
                  <label for="user-feedback">分享你的感官体验和联想（可选）：</label>
                  <textarea
                    id="user-feedback"
                    v-model="userFeedback"
                    rows="4"
                    placeholder="例如：最深刻的感官体验是什么？哪些联想帮助你记忆？..."
                  ></textarea>
                </div>

                <div class="result-actions">
                  <button class="ghost" @click="startMemorize">再次练习</button>
                  <button class="primary" @click="saveAndFinish">保存并完成</button>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_SENSORY_MEMORY"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { ROUTES, useRouter } from '../../composables/useRouter.js'
import {
  generateSensoryContents,
  getLatestSensoryContents,
  saveSensoryMemoryRecord
} from '../../api/attentionSensoryMemory.js'
import { showSuccess, showError } from '../../utils/alert.js'

const router = useRouter()
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const goBack = () => {
  router.navigate(ROUTES.ATTENTION_TRAINING)
}

// 游戏状态
const gameStatus = ref('idle') // idle, sensory-guide, recalling, result
const isLoading = ref(false)
const isTransitioning = ref(false)

// 控制参数
const promptInput = ref('')
const keywordsInput = ref('')
const contentType = ref('word')
const tagsInput = ref('')
const memorizeSeconds = ref(120) // 固定值，不再由用户选择

// 游戏数据
const contents = ref([])
const currentContentIndex = ref(0)
const userAnswers = ref([])
const recallResults = ref([])
const userFeedback = ref('')

// 计时器
const memorizeRemaining = ref(0)
const memorizeStartTime = ref(0)
const recallElapsed = ref(0)
const recallStartTime = ref(0)
let memorizeTimer = null
let recallTimer = null

// 当前内容
const currentContent = computed(() => {
  return contents.value[currentContentIndex.value] || {}
})

// 结果统计
const resultStats = computed(() => {
  const correct = recallResults.value.filter(r => r.isCorrect).length
  const total = contents.value.length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const memorizeDuration = memorizeSeconds.value - memorizeRemaining.value
  const recallDuration = recallElapsed.value
  const totalDuration = memorizeDuration + recallDuration

  return {
    correct,
    total,
    accuracy,
    memorizeDuration,
    recallDuration,
    totalDuration
  }
})

// 生成并开始
const generateAndStart = async () => {
  if (!promptInput.value.trim()) {
    showError('请输入主题/提示词')
    return
  }

  isLoading.value = true
  try {
    const tags = tagsInput.value
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(t => t)

    // 直接传参数给后端，由后端构造提示词
    const response = await generateSensoryContents({
      prompt: promptInput.value.trim(),
      keywords: keywordsInput.value.trim() || undefined,
      contentType: contentType.value,
      tags: tags.length > 0 ? tags : undefined
    })

    if (response.code === 200 && response.data) {
      contents.value = response.data
      if (contents.value.length > 0) {
        // 生成内容后显示预览，不自动开始训练
        showSuccess('内容生成成功！请查看下方预览，点击"开始训练"按钮开始训练')
      } else {
        showError('生成的内容为空，请重试')
      }
    } else {
      showError(response.msg || '生成内容失败')
    }
  } catch (error) {
    console.error('生成内容失败', error)
    showError('生成内容失败：' + (error.message || '未知错误'))
  } finally {
    isLoading.value = false
  }
}

// 加载最近内容
const loadLatestContents = async () => {
  isLoading.value = true
  try {
    const response = await getLatestSensoryContents(10) // 默认加载10个
    if (response.code === 200 && response.data) {
      contents.value = response.data
      if (contents.value.length > 0) {
        // 加载内容后显示预览，不自动开始训练
        showSuccess('内容加载成功！请查看下方预览，点击"开始训练"按钮开始训练')
      } else {
        showError('没有可用的最近内容')
      }
    } else {
      showError(response.msg || '加载内容失败')
    }
  } catch (error) {
    console.error('加载内容失败', error)
    showError('加载内容失败：' + (error.message || '未知错误'))
  } finally {
    isLoading.value = false
  }
}

// 开始记忆阶段
const startMemorize = () => {
  gameStatus.value = 'sensory-guide'
  memorizeRemaining.value = parseInt(memorizeSeconds.value)
  memorizeStartTime.value = Date.now()
  currentContentIndex.value = 0
  userAnswers.value = new Array(contents.value.length).fill('')
  recallResults.value = []
  userFeedback.value = ''

  // 启动记忆计时器
  if (memorizeTimer) {
    clearInterval(memorizeTimer)
  }
  memorizeTimer = setInterval(() => {
    memorizeRemaining.value = Math.max(0, memorizeRemaining.value - 1)
    if (memorizeRemaining.value <= 0) {
      clearInterval(memorizeTimer)
      // 时间到自动进入回忆
      enterRecall()
    }
  }, 1000)
}

// 进入回忆阶段
const enterRecall = () => {
  if (memorizeTimer) {
    clearInterval(memorizeTimer)
    memorizeTimer = null
  }

  isTransitioning.value = true
  setTimeout(() => {
    gameStatus.value = 'recalling'
    currentContentIndex.value = 0
    recallElapsed.value = 0
    recallStartTime.value = Date.now()

    // 启动回忆计时器
    if (recallTimer) {
      clearInterval(recallTimer)
    }
    recallTimer = setInterval(() => {
      recallElapsed.value = Math.floor((Date.now() - recallStartTime.value) / 1000)
    }, 1000)

    isTransitioning.value = false
  }, 300)
}

// 提交答案
const submitAnswer = () => {
  const answer = userAnswers.value[currentContentIndex.value]?.trim()
  if (!answer) {
    return
  }

  const original = contents.value[currentContentIndex.value].content
  const isCorrect = answer.toLowerCase().trim() === original.toLowerCase().trim()

  recallResults.value.push({
    original,
    userAnswer: answer,
    isCorrect
  })

  if (currentContentIndex.value < contents.value.length - 1) {
    currentContentIndex.value++
  } else {
    // 完成所有题目
    finishRecall()
  }
}

// 跳过题目
const skipQuestion = () => {
  const original = contents.value[currentContentIndex.value].content
  recallResults.value.push({
    original,
    userAnswer: '',
    isCorrect: false
  })

  if (currentContentIndex.value < contents.value.length - 1) {
    currentContentIndex.value++
  } else {
    finishRecall()
  }
}

// 完成回忆
const finishRecall = () => {
  if (recallTimer) {
    clearInterval(recallTimer)
    recallTimer = null
  }

  gameStatus.value = 'result'
}

// 保存并完成
const saveAndFinish = async () => {
  try {
    const stats = resultStats.value
    const contentIds = contents.value.map(c => c.id).filter(id => id).join(',')

    const record = {
      contentIds,
      contentList: JSON.stringify(contents.value),
      contentCount: stats.total,
      memorizeDurationSeconds: stats.memorizeDuration,
      recallDurationSeconds: stats.recallDuration,
      totalDurationSeconds: stats.totalDuration,
      correctCount: stats.correct,
      accuracy: stats.accuracy,
      sensoryExperiences: JSON.stringify(
        contents.value.map(c => ({
          content: c.content,
          visual: c.visualUrl,
          audio: c.audioUrl,
          scent: c.scentDescription,
          touch: c.touchDescription,
          taste: c.tasteDescription
        }))
      ),
      recallResult: JSON.stringify(recallResults.value),
      userFeedback: userFeedback.value || null
    }

    const response = await saveSensoryMemoryRecord(record)
    if (response.code === 200) {
      showSuccess('训练记录已保存')
      setTimeout(() => {
        resetGame()
      }, 1500)
    } else {
      showError(response.msg || '保存记录失败')
    }
  } catch (error) {
    console.error('保存记录失败', error)
    showError('保存记录失败：' + (error.message || '未知错误'))
  }
}

// 重置游戏
const resetGame = () => {
  if (memorizeTimer) {
    clearInterval(memorizeTimer)
    memorizeTimer = null
  }
  if (recallTimer) {
    clearInterval(recallTimer)
    recallTimer = null
  }

  gameStatus.value = 'idle'
  contents.value = []
  currentContentIndex.value = 0
  userAnswers.value = []
  recallResults.value = []
  userFeedback.value = ''
  memorizeRemaining.value = 0
  recallElapsed.value = 0
  isTransitioning.value = false
  keywordsInput.value = ''
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (memorizeTimer) {
    clearInterval(memorizeTimer)
  }
  if (recallTimer) {
    clearInterval(recallTimer)
  }
})
</script>

<style scoped>
.sensory-memory-container {
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

.page-title {
  font-size: 36px;
  color: #ffd700;
  text-shadow: 0 0 18px rgba(255, 215, 0, 0.7);
  margin: 8px 0 6px;
}

.subtitle {
  color: #c5c5c5;
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
  gap: 20px;
}

.game-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.controls {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 12px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-item.wide {
  grid-column: 1 / -1;
}

.control-item label {
  font-size: 13px;
  color: #c5c5c5;
}

.control-item input,
.control-item textarea,
.control-item select {
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 14px;
}

.control-item input:focus,
.control-item textarea:focus,
.control-item select:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.control-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button.primary,
button.ghost {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
}

button.primary {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #0a0a12;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
}

button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.ghost {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

button.ghost:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.5);
}

.game-card {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 12px;
  padding: 24px;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
}

.game-content {
  position: relative;
}

.exit-button-container {
  position: absolute;
  top: 0;
  right: 0;
}

.btn-exit {
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.4);
  color: #ff6b6b;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.25s;
}

.btn-exit:hover {
  background: rgba(255, 0, 0, 0.3);
  border-color: rgba(255, 0, 0, 0.6);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.group-number {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.timer {
  font-size: 16px;
  color: #8fd19e;
  font-weight: 600;
}

.sensory-content-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.sensory-content-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s;
}

.sensory-content-item.active {
  border-color: rgba(255, 215, 0, 0.6);
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.content-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.content-number {
  font-size: 14px;
  color: #ffd700;
  font-weight: 600;
}

.content-text {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.content-description {
  font-size: 14px;
  color: #c5c5c5;
  margin-bottom: 10px;
}

.sensory-experiences {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sensory-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.sensory-icon {
  font-size: 18px;
}

.sensory-label {
  color: #8fd19e;
  font-weight: 600;
}

.sensory-value {
  color: #c5c5c5;
}

.hint-text {
  text-align: center;
  color: #c5c5c5;
  font-size: 14px;
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 8px;
}

.recall-mode {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.target-number-display {
  font-size: 16px;
  color: #c5c5c5;
}

.target-number {
  color: #ffd700;
  font-weight: 700;
  font-size: 20px;
}

.recall-question {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  color: #ffd700;
  margin-bottom: 15px;
}

.sensory-hints {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #c5c5c5;
}

.hint-icon {
  font-size: 18px;
}

.answer-input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answer-input-section label {
  font-size: 14px;
  color: #c5c5c5;
}

.answer-input-section textarea {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
}

.answer-input-section textarea:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.recall-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.result-mode {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-header {
  text-align: center;
}

.result-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 18px rgba(255, 215, 0, 0.7);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: #c5c5c5;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffd700;
}

.stat-value.success {
  color: #8fd19e;
}

.stat-value.error {
  color: #ff6b6b;
}

.result-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
}

.details-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 15px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}

.detail-item.correct {
  border-left: 3px solid #8fd19e;
}

.detail-item.incorrect {
  border-left: 3px solid #ff6b6b;
}

.detail-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.detail-number {
  color: #ffd700;
  font-weight: 600;
}

.detail-original {
  color: #c5c5c5;
}

.detail-arrow {
  color: #8fd19e;
}

.detail-answer {
  color: #ffd700;
}

.detail-status {
  color: #8fd19e;
  font-weight: 700;
}

.detail-status.error {
  color: #ff6b6b;
}

.feedback-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feedback-section label {
  font-size: 14px;
  color: #c5c5c5;
}

.feedback-section textarea {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
}

.feedback-section textarea:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

/* 加载动画遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 16px;
  box-shadow:
    0 0 40px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: 0s;
  border-top-color: #ffd700;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.4s;
  border-top-color: #ffed4e;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.8s;
  border-top-color: #f4d03f;
  width: 50%;
  height: 50%;
  top: 25%;
  left: 25%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 20px;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.loading-hint {
  font-size: 14px;
  color: #c5c5c5;
  text-align: center;
  max-width: 300px;
}

.controls.loading-blur {
  filter: blur(2px);
  pointer-events: none;
  opacity: 0.6;
}

/* 生成内容预览区域 */
.generated-contents-preview {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 12px;
  padding: 24px;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.preview-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #ffd700;
  margin: 0;
}

.btn-start {
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #0a0a12;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.25s;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
}

.preview-content-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 600px;
  overflow-y: auto;
}

.preview-content-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s;
}

.preview-content-item:hover {
  border-color: rgba(255, 215, 0, 0.4);
  background: rgba(255, 215, 0, 0.05);
}

.preview-content-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.preview-number {
  font-size: 14px;
  color: #ffd700;
  font-weight: 600;
}

.preview-text {
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
}

.preview-content-description {
  font-size: 14px;
  color: #c5c5c5;
  margin-bottom: 10px;
}

.preview-sensory-experiences {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-sensory-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.preview-sensory-icon {
  font-size: 18px;
}

.preview-sensory-label {
  color: #8fd19e;
  font-weight: 600;
}

.preview-sensory-value {
  color: #c5c5c5;
}

@media (max-width: 768px) {
  .main-content {
    padding: 100px 20px 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .controls {
    grid-template-columns: 1fr;
  }

  .control-item.wide {
    grid-column: 1;
  }

  .control-actions {
    grid-column: 1;
  }

  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

