<template>
  <div class="text-focus-container">
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
          <div class="badge">文字专注力 · 阅读理解</div>
          <h1 class="page-title">文字专注力训练</h1>
          <p class="subtitle">
            深入阅读一段 100-150 字的日常短文，然后回答 5 个覆盖主旨、细节与情感的提问。开始答题后短文会被隐藏，请在阅读阶段充分理解内容。
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="goBack">返回训练中心</button>
        </div>
      </header>

      <section class="controls">
        <div class="control-panel">
          <div class="control-row">
            <div class="control-item wide">
              <label for="theme-input">主题筛选 / 生成主题</label>
              <div class="combo-input">
                <div class="combo-wrapper" @click.stop>
                  <input
                    id="theme-input"
                    v-model="themeInput"
                    @focus="themeDropdownOpen = true"
                    @blur="closeThemeDropdown"
                    @input="onThemeInput"
                    @keyup.enter="handleThemeChange"
                    :disabled="isGenerating || isLoading"
                    placeholder="输入或选择主题，如：日常生活 / 科技 / 校园"
                  />
                  <div v-if="themeDropdownOpen && filteredThemeOptions.length" class="combo-dropdown">
                    <div
                      v-for="theme in filteredThemeOptions"
                      :key="theme"
                      class="combo-option"
                      @mousedown.prevent="selectTheme(theme)"
                    >
                      {{ theme }}
                    </div>
                  </div>
                </div>
              </div>
              <p class="hint">作为训练素材的下拉检索条件，同时用于 AI 生成主题。</p>
            </div>
            <div class="control-item">
              <label for="content-select">训练素材</label>
              <select id="content-select" v-model="selectedId" @change="handleSelectChange" :disabled="isGenerating || isLoading">
                <option v-for="item in contents" :key="item.id" :value="item.id">
                  {{ item.title || `日常情景 ${item.id}` }}
                </option>
              </select>
              <p class="hint">开始前可预览短文；开始答题后短文将被隐藏。</p>
            </div>
            <div class="control-item">
              <label for="level-select">难度等级</label>
              <select id="level-select" v-model="selectedLevel" :disabled="isGenerating || isLoading">
                <option v-for="level in levelOptions" :key="level.value" :value="level.value">
                  {{ level.label }}
                </option>
              </select>
              <p class="hint">初/中/高/困，对应小学低-高中梯度。</p>
            </div>
            <div class="control-item">
              <label for="generate-count">生成数量</label>
              <input
                id="generate-count"
                type="number"
                min="1"
                max="50"
                v-model.number="generateCount"
                :disabled="isGenerating"
                class="count-input"
                placeholder="数量"
              />
              <p class="hint">范围 1-50，默认 10。</p>
            </div>
          </div>
          <div class="control-actions">
            <button class="primary" @click="startReading" :disabled="!selectedContent || isGenerating || isLoading">
              预览短文
            </button>
            <button class="secondary" @click="startAnswering" :disabled="!selectedContent || gameStatus === 'answering' || isGenerating || isLoading">
              开始答题
            </button>
            <button class="ghost" @click="resetGame" :disabled="isGenerating || isLoading">重置</button>
            <button class="primary" @click="generatePackage" :disabled="isGenerating">
              {{ isGenerating ? '生成中...' : `AI 生成 ${generateCount} 组` }}
            </button>
            <button class="ghost" @click="loadContents" :disabled="isGenerating || isLoading">刷新列表</button>
          </div>
          <p class="hint control-hint">默认从数据库读取训练素材，只有点击生成才会调用 DeepSeek。</p>
        </div>
      </section>

      <section class="content-card" v-if="selectedContent">
        <div class="card-header">
          <div>
            <div class="badge ghost">短文预览</div>
            <h3>{{ selectedContent.title }}</h3>
            <p class="meta">
              主题：{{ selectedContent.theme || themeInput || '日常生活' }} ·
              难度：{{ getLevelLabel(selectedContent.level || selectedLevel) }} ·
              提问数：{{ currentQuestions.length }}
            </p>
          </div>
          <div class="card-header-actions">
            <button class="secondary" @click="playQuestionsTts" :disabled="!selectedContent || isGeneratingTts">
              {{ isGeneratingTts ? '生成中...' : isPlayingTts ? '播放中...' : '题目语音播报' }}
            </button>
            <div class="status-pill" :class="gameStatus">
              {{ statusText }}
            </div>
          </div>
        </div>

        <div v-if="ttsError" class="error-banner slim">
          {{ ttsError }}
        </div>

        <div class="paragraph" v-if="gameStatus !== 'answering'">
          {{ selectedContent.paragraph }}
        </div>
        <div class="paragraph muted" v-else>
          短文已隐藏，请根据记忆回答问题。
        </div>
      </section>

      <section v-else class="empty-state">
        <div class="empty-inner">
          <div class="badge ghost">暂无训练素材</div>
          <h3>请先刷新列表或生成训练包</h3>
          <p>默认从数据库读取素材，若列表为空可点击下方按钮生成新内容。</p>
          <div class="empty-actions">
            <button class="secondary" @click="loadContents" :disabled="isLoading">刷新列表</button>
            <button class="primary" @click="generatePackage" :disabled="isGenerating">
              {{ isGenerating ? '生成中...' : `生成 ${generateCount} 组` }}
            </button>
          </div>
        </div>
      </section>

      <section class="question-card" v-if="selectedContent">
        <div class="card-header">
          <div class="badge ghost">答题区</div>
          <h3>问题列表</h3>
        </div>

        <div class="questions">
          <div v-for="(q, index) in currentQuestions" :key="index" class="question-item">
            <div class="question-title">Q{{ index + 1 }}. {{ q.question }}</div>
            <input
              v-model="userAnswers[index]"
              :disabled="gameStatus === 'review'"
              placeholder="请输入你的回答"
            />
            <div v-if="gameStatus === 'review'" class="answer-feedback" :class="isCorrect(index) ? 'correct' : 'wrong'">
              <span>标准答案：{{ q.answer }}</span>
              <span v-if="userAnswers[index]">你的回答：{{ userAnswers[index] }}</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="primary" @click="submitAnswers" :disabled="gameStatus !== 'answering' || isSaving">
            {{ isSaving ? '保存中...' : '提交并保存' }}
          </button>
        </div>
      </section>

      <section class="summary-card" v-if="gameStatus === 'review'">
        <div class="card-header">
          <div class="badge ghost">结果</div>
          <h3>本次表现</h3>
        </div>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="label">正确题数</div>
            <div class="value highlight">{{ correctCount }} / {{ currentQuestions.length }}</div>
          </div>
          <div class="summary-item">
            <div class="label">正确率</div>
            <div class="value">{{ accuracy }}%</div>
          </div>
          <div class="summary-item">
            <div class="label">耗时</div>
            <div class="value">{{ durationSeconds }} 秒</div>
          </div>
        </div>
      </section>

      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
    </main>

    <Sidebar :is-open="sidebarOpen" :active-route="ROUTES.ATTENTION_TEXT_FOCUS" @close="handleSidebarClose" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { ROUTES, useRouter } from '../../composables/useRouter.js'
import { generateTextFocusContents, getLatestTextFocusContents, saveTextFocusRecord } from '../../api/attentionTextFocus.js'
import { synthesizeTts } from '../../api/tts.js'

const router = useRouter()
const sidebarOpen = ref(false)
const contents = ref([])
const selectedId = ref(null)
const themeOptions = ref([])
const gameStatus = ref('idle') // idle | reading | answering | review
const userAnswers = ref([])
const correctCount = ref(0)
const durationSeconds = ref(0)
const startTimestamp = ref(null)
const isGenerating = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const generateCount = ref(10)
const themeInput = ref('日常生活')
const themeDropdownOpen = ref(false)
const selectedLevel = ref('中')
const isGeneratingTts = ref(false)
const isPlayingTts = ref(false)
const ttsAudioUrl = ref('')
const ttsError = ref('')
let ttsObjectUrl = null
let ttsAudio = null

const selectedContent = computed(() => contents.value.find((item) => item.id === selectedId.value))

const currentQuestions = computed(() => {
  if (!selectedContent.value || !selectedContent.value.questionsJson) return []
  try {
    const parsed = JSON.parse(selectedContent.value.questionsJson)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('解析题目失败', e)
    return []
  }
})

const accuracy = computed(() => {
  if (!currentQuestions.value.length) return 0
  return Math.round((correctCount.value * 100) / currentQuestions.value.length)
})

const filteredThemeOptions = computed(() => {
  const keyword = (themeInput.value || '').trim().toLowerCase()
  if (!keyword) return themeOptions.value
  return themeOptions.value.filter((item) => item.toLowerCase().includes(keyword))
})

const levelOptions = [
  { value: '初', label: '初级（小学 1-3 年级）' },
  { value: '中', label: '中级（小学 3-6 年级）' },
  { value: '高', label: '高级（初中 1-3 年级）' },
  { value: '困', label: '困难（高中 1-3 年级）' }
]

const statusText = computed(() => {
  if (gameStatus.value === 'reading') return '阅读中'
  if (gameStatus.value === 'answering') return '答题中'
  if (gameStatus.value === 'review') return '已完成'
  return '待开始'
})

const getLevelLabel = (level) => {
  const map = {
    初: '初级（小学 1-3 年级）',
    中: '中级（小学 3-6 年级）',
    高: '高级（初中 1-3 年级）',
    困: '困难（高中 1-3 年级）'
  }
  return map[level] || '未标记'
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const goBack = () => {
  router.navigate(ROUTES.ATTENTION_TRAINING)
}

const handleSelectChange = () => {
  prepareAnswers()
  gameStatus.value = 'idle'
}

const handleThemeChange = () => {
  if (isGenerating.value || isLoading.value) return
  themeInput.value = (themeInput.value || '').trim()
  themeDropdownOpen.value = false
  loadContents()
}

const prepareAnswers = () => {
  userAnswers.value = currentQuestions.value.map(() => '')
  correctCount.value = 0
  durationSeconds.value = 0
  startTimestamp.value = null
}

const updateThemeOptions = (list = []) => {
  const themes = Array.from(
    new Set(
      list
        .map((item) => item.theme)
        .filter((t) => !!t)
    )
  )
  // 保证当前输入的主题也在联想列表中
  if (themeInput.value && !themes.includes(themeInput.value)) {
    themes.unshift(themeInput.value)
  }
  themeOptions.value = themes.slice(0, 20)
}

const onThemeInput = () => {
  themeDropdownOpen.value = true
}

const closeThemeDropdown = () => {
  setTimeout(() => {
    themeDropdownOpen.value = false
  }, 120)
}

const selectTheme = (theme) => {
  themeInput.value = theme
  handleThemeChange()
}

const loadContents = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await getLatestTextFocusContents(10, themeInput.value?.trim() || undefined)
    const list = res?.data || res || []
    contents.value = list
    updateThemeOptions(list)
    if (list.length) {
      selectedId.value = list[0].id
      prepareAnswers()
    } else {
      selectedId.value = null
      prepareAnswers()
    }
  } catch (e) {
    console.error(e)
    errorMessage.value = e?.message || '获取训练内容失败'
  } finally {
    isLoading.value = false
  }
}

const generatePackage = async () => {
  const sanitized = Math.max(1, Math.min(50, Number(generateCount.value) || 10))
  generateCount.value = sanitized
  isGenerating.value = true
  errorMessage.value = ''
  try {
    const res = await generateTextFocusContents({
      count: sanitized,
      theme: themeInput.value || '日常生活',
      level: selectedLevel.value
    })
    const list = res?.data || res || []
    contents.value = list
    updateThemeOptions(list)
    if (list.length) {
      selectedId.value = list[0].id
      prepareAnswers()
      gameStatus.value = 'idle'
    }
  } catch (e) {
    console.error(e)
    errorMessage.value = e?.message || '生成训练包失败'
  } finally {
    isGenerating.value = false
  }
}

const startReading = () => {
  if (!selectedContent.value) return
  gameStatus.value = 'reading'
}

const startAnswering = () => {
  if (!selectedContent.value) return
  prepareAnswers()
  gameStatus.value = 'answering'
  startTimestamp.value = Date.now()
}

const isCorrect = (index) => {
  const q = currentQuestions.value[index]
  if (!q) return false
  const user = (userAnswers.value[index] || '').trim()
  const answer = (q.answer || '').trim()
  return user && answer && user.toLowerCase() === answer.toLowerCase()
}

const submitAnswers = async () => {
  if (!selectedContent.value) return
  if (isSaving.value) return
  correctCount.value = currentQuestions.value.reduce((acc, _, idx) => acc + (isCorrect(idx) ? 1 : 0), 0)
  durationSeconds.value = startTimestamp.value ? Math.round((Date.now() - startTimestamp.value) / 1000) : 0
  const detail = currentQuestions.value.map((q, idx) => ({
    question: q.question,
    answer: q.answer,
    userAnswer: userAnswers.value[idx] || '',
    isCorrect: isCorrect(idx)
  }))

  try {
    isSaving.value = true
    await saveTextFocusRecord({
      contentId: selectedContent.value.id,
      contentTitle: selectedContent.value.title,
      totalQuestions: currentQuestions.value.length,
      correctCount: correctCount.value,
      accuracy: accuracy.value,
      durationSeconds: durationSeconds.value,
      answersJson: JSON.stringify(detail)
    })
  } catch (e) {
    console.error(e)
    errorMessage.value = e?.message || '保存记录失败'
  }
  gameStatus.value = 'review'
  isSaving.value = false
}

const resetGame = () => {
  prepareAnswers()
  gameStatus.value = 'idle'
}

const disposeTtsAudio = () => {
  if (ttsAudio) {
    ttsAudio.pause()
    ttsAudio = null
  }
  if (ttsObjectUrl) {
    URL.revokeObjectURL(ttsObjectUrl)
    ttsObjectUrl = null
  }
}

const buildTtsText = () => {
  if (!selectedContent.value) return ''
  const title = selectedContent.value.title || '文字专注力训练'
  const paragraph = selectedContent.value.paragraph || ''
  const questions = currentQuestions.value
    .map((q, idx) => `第${idx + 1}题：${q.question}`)
    .join('。')
  return `${title}。短文：${paragraph}。问题列表：${questions}`
}

const playQuestionsTts = async () => {
  if (!selectedContent.value || isGeneratingTts.value) return
  const text = buildTtsText()
  if (!text) return
  isGeneratingTts.value = true
  ttsError.value = ''
  isPlayingTts.value = false
  disposeTtsAudio()

  try {
    const audioData = await synthesizeTts({ text, voice: 'Cherry' })
    let url = ''
    if (typeof audioData === 'string' && (audioData.startsWith('http://') || audioData.startsWith('https://'))) {
      url = audioData
    } else if (typeof audioData === 'string') {
      const binary = atob(audioData)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' })
      url = URL.createObjectURL(blob)
      ttsObjectUrl = url
    } else {
      throw new Error('无法识别的音频数据')
    }
    ttsAudioUrl.value = url
    ttsAudio = new Audio(url)
    isPlayingTts.value = true
    await ttsAudio.play()
    ttsAudio.onended = () => {
      isPlayingTts.value = false
    }
    ttsAudio.onerror = () => {
      isPlayingTts.value = false
      ttsError.value = '音频播放失败'
    }
  } catch (e) {
    console.error(e)
    ttsError.value = e?.message || '语音生成失败'
  } finally {
    isGeneratingTts.value = false
  }
}

onUnmounted(() => {
  disposeTtsAudio()
})

onMounted(async () => {
  await loadContents()
})
</script>

<style scoped>
.text-focus-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  color: #f7f7f7;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 40px 60px;
  backdrop-filter: blur(6px);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  margin: 8px 0;
}

.subtitle {
  color: #cdd5ff;
  font-size: 14px;
  line-height: 1.6;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
  font-size: 12px;
  letter-spacing: 0.4px;
}

.badge.ghost {
  background: rgba(255, 255, 255, 0.06);
  color: #d6dcff;
}

.header-actions .btn-secondary {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.4);
  background: transparent;
  color: #ffd700;
}

.controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  background: linear-gradient(135deg, rgba(14, 18, 30, 0.85), rgba(23, 34, 65, 0.72));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-row {
  display: grid;
  grid-template-columns: 1.2fr 1.1fr 1fr 0.7fr;
  gap: 12px;
}

.control-item {
  display: flex;
  flex-direction: column;
}

.control-item.wide {
  grid-column: span 1;
}

.control-item label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

.combo-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.combo-wrapper {
  position: relative;
}

.combo-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(14, 18, 30, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

.combo-option {
  padding: 10px 12px;
  cursor: pointer;
}

.combo-option:hover {
  background: rgba(255, 255, 255, 0.06);
}

select,
input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f7f7f7;
}

.hint {
  color: #aeb5d6;
  font-size: 12px;
  margin-top: 6px;
}

.control-hint {
  margin-top: 4px;
}

.control-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.count-input {
  width: 100%;
}

.primary,
.secondary,
.ghost {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  color: #0b0c12;
  font-weight: 600;
}

.primary {
  background: linear-gradient(135deg, #ffd700, #fcb045);
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  color: #f7f7f7;
}

.ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.16);
  color: #f7f7f7;
}

.content-card,
.question-card,
.summary-card {
  background: rgba(14, 18, 30, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.meta {
  color: #cdd5ff;
  font-size: 13px;
}

.status-pill {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f7f7f7;
}

.status-pill.reading {
  border-color: #61dafb;
  color: #61dafb;
}

.status-pill.answering {
  border-color: #ffd700;
  color: #ffd700;
}

.status-pill.review {
  border-color: #66e094;
  color: #66e094;
}

.paragraph {
  line-height: 1.8;
  color: #f7f7f7;
  background: rgba(255, 255, 255, 0.03);
  padding: 14px;
  border-radius: 10px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.paragraph.muted {
  color: #aeb5d6;
  font-style: italic;
}

.questions {
  display: grid;
  gap: 12px;
}

.question-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.question-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.answer-feedback {
  margin-top: 6px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.answer-feedback.correct {
  color: #66e094;
}

.answer-feedback.wrong {
  color: #ff9b73;
}

.actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.summary-item {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.summary-item .label {
  color: #cdd5ff;
  font-size: 13px;
  margin-bottom: 6px;
}

.summary-item .value {
  font-size: 20px;
  font-weight: 700;
}

.summary-item .value.highlight {
  color: #ffd700;
}

.empty-state {
  background: rgba(14, 18, 30, 0.82);
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  color: #cdd5ff;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
}

.empty-inner h3 {
  margin: 12px 0 8px;
  color: #f7f7f7;
}

.empty-inner p {
  margin-bottom: 16px;
  color: #aeb5d6;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-banner {
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 87, 87, 0.12);
  border: 1px solid rgba(255, 87, 87, 0.3);
  color: #ffc5c5;
}

.error-banner.slim {
  margin-top: 0;
  padding: 10px;
}

@media (max-width: 960px) {
  .controls {
    grid-template-columns: 1fr;
  }

  .control-row {
    grid-template-columns: 1fr;
  }

  .control-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .card-header-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}
</style>

