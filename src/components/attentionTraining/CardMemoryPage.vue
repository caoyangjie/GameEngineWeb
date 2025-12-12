<template>
  <div class="card-memory-container">
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
          <div class="badge">扑克牌 · 记忆力训练</div>
          <h1 class="page-title">扑克牌快速记忆</h1>
          <p class="subtitle">
            模拟记忆大师的整副牌顺背训练：在限定时间内记住随机洗好的牌序，然后按顺序快速复现。
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="goBack">返回训练中心</button>
        </div>
      </header>

      <div class="content-grid">
        <section class="game-column">
          <section class="controls">
            <div class="control-item">
              <label for="deck-size">牌量</label>
              <select id="deck-size" v-model="selectedDeckSize" :disabled="isRunning">
                <option value="13">13 张 · 单花色</option>
                <option value="26">26 张 · 半副牌</option>
                <option value="52">52 张 · 全副牌</option>
              </select>
            </div>
            <div class="control-item">
              <label for="memorize-seconds">基础记忆时长</label>
              <select id="memorize-seconds" v-model="memorizeSeconds" :disabled="isRunning">
                <option value="30">30 秒 · 极速</option>
                <option value="60">60 秒 · 经典</option>
                <option value="120">120 秒 · 稳妥</option>
              </select>
            </div>
            <div class="control-item">
              <label for="pace-multiplier">分组倍速</label>
              <select id="pace-multiplier" v-model="paceMultiplier" :disabled="isRunning">
                <option value="0.75">0.75x · 慢速巩固</option>
                <option value="1">1.0x · 标准</option>
                <option value="1.25">1.25x · 进阶提速</option>
                <option value="1.5">1.5x · 冲刺</option>
              </select>
            </div>
            <div class="control-item">
              <label for="chunk-size">分组大小</label>
              <select id="chunk-size" v-model="chunkSize" :disabled="isRunning">
                <option value="2">2 张</option>
                <option value="3">3 张 · PAO 推荐</option>
                <option value="4">4 张</option>
              </select>
            </div>
            <div class="control-item">
              <label for="memory-method">记忆法</label>
              <select id="memory-method" v-model="memoryMethod" :disabled="isRunning">
                <option value="classic">顺背 · 直接卡面</option>
                <option value="pao">PAO · 人物动作物品</option>
                <option value="loci">地点桩 · 路线法</option>
              </select>
            </div>
            <div class="control-item">
              <label for="template-key">模板</label>
              <select id="template-key" v-model="templateKey" :disabled="isRunning">
                <option v-for="tpl in memoryTemplates" :key="tpl.key" :value="tpl.key">
                  {{ tpl.name }} · {{ tpl.note }}
                </option>
              </select>
            </div>
            <div class="control-item">
              <label for="reveal-mode">展示方式</label>
              <select id="reveal-mode" v-model="revealMode" :disabled="isRunning">
                <option value="grid">平铺展示</option>
                <option value="stream">序号提示</option>
              </select>
            </div>
            <div class="control-item compact">
              <div class="label">当前状态</div>
              <div class="status" :class="gameStatus">{{ statusText }}</div>
            </div>
            <div class="control-item compact">
              <div class="label">复现进度</div>
              <div class="progress-info">{{ userSequence.length }} / {{ totalCards }}</div>
            </div>
            <div class="control-actions">
              <button class="ghost" @click="resetGame" v-if="!isRunning">重置</button>
              <button class="primary" @click="startGame" v-if="!isRunning">开始</button>
              <button class="ghost" @click="exitGame" v-else>退出</button>
            </div>
          </section>

          <section class="game-card" v-if="gameStatus !== 'idle'">
            <div class="game-content">
              <div class="exit-button-container">
                <button class="btn-exit" @click="exitGame">退出模式</button>
              </div>

              <div v-if="gameStatus === 'memorizing'" class="memorizing-mode">
                <div class="group-header">
                  <div class="group-number">牌量：{{ totalCards }} 张</div>
                  <div class="timer" v-if="showTimer">{{ formatTime(memorizeRemaining) }}</div>
                </div>
                <div class="card-grid-display" :class="revealMode">
                  <div
                    v-for="(chunk, gIndex) in chunkedCards"
                    :key="`chunk-${gIndex}`"
                    class="card-chunk"
                  >
                    <div class="chunk-header">
                      <span class="chunk-label">第 {{ gIndex + 1 }} 组</span>
                      <span class="chunk-hint">分组 {{ chunkSize }} 张 · {{ memoryMethodLabel }}</span>
                    </div>
                    <div class="chunk-cards">
                      <div
                        v-for="(card, index) in chunk"
                        :key="card.id"
                        class="card-preview"
                      >
                        <div class="card-index" v-if="revealMode === 'stream'">
                          #{{ gIndex * chunkSizeNum + index + 1 }}
                        </div>
                        <img :src="card.image" :alt="card.label" />
                        <div class="card-label">{{ card.label }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="hint-text">
                  记忆策略：{{ methodDescription }}；当前总时长 {{ formatTime(actualMemorizeSeconds) }}。
                  记好了可提前进入复现阶段。
                </div>
                <button class="primary" @click="enterRecall(true)" :disabled="isTransitioning">
                  我记好了，进入复现
                </button>
              </div>

              <div v-if="gameStatus === 'recalling'" class="recall-mode">
                <div class="answer-header">
                  <div class="target-number-display">
                    目标长度：
                    <span class="target-number">{{ totalCards }} 张</span>
                  </div>
                  <div class="timer" v-if="recallElapsed">
                    回忆用时：{{ formatTime(recallElapsed) }}
                  </div>
                </div>

                <div class="recall-progress">
                  <div class="hint-text">
                    按记忆的顺序点击牌面。当前填第
                    <strong>{{ currentPosition }}</strong>
                    张。建议每 {{ chunkSize }} 张为一小组，先回放故事再点牌。
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: recallProgress + '%' }"></div>
                  </div>
                </div>

                <div class="selected-sequence">
                  <div
                    v-for="(card, index) in userSequence"
                    :key="card.id"
                    class="selected-card"
                    :class="{ correct: isCardCorrect(index), error: !isCardCorrect(index) && gameStatus === 'completed' }"
                  >
                    <span class="pos">#{{ index + 1 }}</span>
                    <span class="label">{{ card.label }}</span>
                  </div>
                  <div v-if="!userSequence.length" class="empty-tip">尚未选择任何牌</div>
                </div>

                <div class="available-grid">
                  <button
                    v-for="card in availableCards"
                    :key="card.id"
                    class="card-button"
                    @click="selectCard(card)"
                    :disabled="isTransitioning || isRecallFull"
                  >
                    <img :src="card.image" :alt="card.label" />
                    <div class="card-label">{{ card.label }}</div>
                  </button>
                </div>

                <div class="recall-actions">
                  <button class="ghost" @click="undoSelect" :disabled="!userSequence.length || isTransitioning">
                    撤销一步
                  </button>
                  <button
                    class="primary"
                    @click="submitAnswer"
                    :disabled="!userSequence.length || isTransitioning"
                  >
                    提交答案
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="result-card" v-if="gameStatus === 'completed'">
            <div class="result-header">
              <div class="badge ghost">训练完成</div>
              <h2>训练结果</h2>
            </div>
            <div class="result-stats">
              <div class="stat-item">
                <div class="stat-label">牌量</div>
                <div class="stat-value">{{ totalCards }} 张</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">记忆用时</div>
                <div class="stat-value">{{ formatTime(memorizeUsedSeconds) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">回忆用时</div>
                <div class="stat-value">{{ formatTime(recallElapsed) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">顺序正确</div>
                <div class="stat-value success">{{ correctCount }} 张</div>
              </div>
              <div class="stat-item full-width">
                <div class="stat-label">准确率</div>
                <div class="stat-value" :class="accuracy >= 80 ? 'success' : 'error'">
                  {{ accuracy }}%
                </div>
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
              <div class="badge ghost">游戏说明</div>
              <h3>快速记忆规则</h3>
            </div>
            <div class="info-content">
              <p>1. 选择牌量（13/26/52）与记忆时长，点击开始</p>
              <p>2. 系统会将随机洗好的牌顺序一次性展示</p>
              <p>3. 在时限内用桩子/谐音/编码等方法快速记忆</p>
              <p>4. 记好后点击“进入复现”，按顺序点选完整牌序</p>
              <p>5. 提交后可看到正确率与完整牌序对照</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <div class="badge ghost">训练技巧</div>
              <h3>记忆大师套路</h3>
            </div>
            <div class="info-content">
              <ul class="tips-list">
                <li>使用 PAO / 形象编码：每张牌对应人物-动作-物品</li>
                <li>每三张组合成一个故事，连成路线，减少节点数</li>
                <li>配合 loci（地点桩），把故事放在熟悉的房间顺序</li>
                <li>记忆时先锁定花色与序位，再确认人物或意象</li>
                <li>复现时先心中回放故事，再按序点击牌面</li>
              </ul>
            </div>
          </div>

          <div class="info-card">
            <div class="info-header">
              <div class="badge ghost">模板与倍速</div>
              <h3>常用配置</h3>
            </div>
            <div class="info-content">
              <ul class="tips-list">
                <li v-for="tpl in memoryTemplates" :key="tpl.key">
                  {{ tpl.name }}：{{ tpl.note }}（记忆法 {{ tpl.method }}，分组 {{ tpl.chunk }}，倍速 {{ tpl.pace }}x）
                </li>
              </ul>
              <p>选择模板可一键切换记忆法、分组大小与倍速；记忆时长 = 基础时长 × 倍速。</p>
            </div>
          </div>

          <div class="info-card" v-if="gameStatus === 'completed'">
            <div class="info-header">
              <div class="badge ghost">答案回顾</div>
              <h3>正确顺序 vs 你的顺序</h3>
            </div>
            <div class="info-content">
              <div class="review-list">
                <div class="review-column">
                  <div class="review-title">正确牌序</div>
                  <div class="review-grid">
                    <div
                      v-for="(card, index) in cardSequence"
                      :key="`truth-${card.id}`"
                      class="review-card"
                    >
                      <img :src="card.image" :alt="card.label" />
                      <div class="review-label">#{{ index + 1 }} · {{ card.label }}</div>
                    </div>
                  </div>
                </div>
                <div class="review-column">
                  <div class="review-title">你的牌序</div>
                  <div class="review-grid">
                    <div
                      v-for="(card, index) in userSequence"
                      :key="`user-${card.id}-${index}`"
                      class="review-card"
                      :class="{ correct: isCardCorrect(index), error: !isCardCorrect(index) }"
                    >
                      <img :src="card.image" :alt="card.label" />
                      <div class="review-label">#{{ index + 1 }} · {{ card.label }}</div>
                    </div>
                    <div v-if="!userSequence.length" class="empty-tip">尚未提交牌序</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_CARD_MEMORY"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { showConfirm } from '../../utils/alert.js'

const router = useRouter()
const sidebarOpen = ref(false)
const selectedDeckSize = ref('26')
const memorizeSeconds = ref('60')
const revealMode = ref('grid')
const gameStatus = ref('idle') // idle | memorizing | recalling | completed
const isTransitioning = ref(false)
const cardSequence = ref([])
const userSequence = ref([])
const memorizeRemaining = ref(0)
const recallElapsed = ref(0)
const correctCount = ref(0)
const memoryMethod = ref('classic')
const chunkSize = ref('3')
const paceMultiplier = ref('1')
const templateKey = ref('pao-3')
let timerInterval = null
let recallStartAt = 0

const suits = [
  { key: 'spade', symbol: '♠', name: '黑桃' },
  { key: 'heart', symbol: '♥', name: '红桃' },
  { key: 'club', symbol: '♣', name: '梅花' },
  { key: 'diamond', symbol: '♦', name: '方块' }
]
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const CARD_POOL = suits.flatMap((suit, suitIndex) =>
  ranks.map((rank, rankIndex) => {
    const index = suitIndex * ranks.length + rankIndex
    return {
      id: index,
      rank,
      suit: suit.symbol,
      suitName: suit.name,
      label: `${suit.symbol}${rank}`,
      image: new URL(`../../images/cards/card_${suit.name}_${rank}.png`, import.meta.url).href
    }
  })
)

const memoryTemplates = [
  { key: 'pao-3', name: 'PAO x3', method: 'pao', chunk: '3', pace: '1', note: '三张一组，标准 PAO' },
  { key: 'pao-3-fast', name: 'PAO x3 进阶', method: 'pao', chunk: '3', pace: '1.25', note: '三张一组，1.25x' },
  { key: 'loci-4', name: '地点桩 x4', method: 'loci', chunk: '4', pace: '1', note: '四张一组，放置地点桩' },
  { key: 'classic-2', name: '顺背 x2', method: 'classic', chunk: '2', pace: '0.75', note: '两张一组，慢速巩固' }
]

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const totalCards = computed(() => parseInt(selectedDeckSize.value))
const showTimer = computed(() => gameStatus.value === 'memorizing')
const statusText = computed(() => {
  if (gameStatus.value === 'memorizing') return '记忆中'
  if (gameStatus.value === 'recalling') return '复现中'
  if (gameStatus.value === 'completed') return '已完成'
  return '待开始'
})
const isRunning = computed(() => gameStatus.value !== 'idle')
const currentPosition = computed(() => Math.min(userSequence.value.length + 1, totalCards.value))
const availableCards = computed(() =>
  cardSequence.value.filter((card) => !userSequence.value.some((sel) => sel.id === card.id))
)
const recallProgress = computed(() => {
  if (!totalCards.value) return 0
  return Math.round((userSequence.value.length / totalCards.value) * 100)
})
const chunkSizeNum = computed(() => parseInt(chunkSize.value) || 3)
const actualMemorizeSeconds = computed(() =>
  Math.max(10, Math.round(parseInt(memorizeSeconds.value) * parseFloat(paceMultiplier.value)))
)
const chunkedCards = computed(() => {
  const size = chunkSizeNum.value || 3
  const groups = []
  for (let i = 0; i < cardSequence.value.length; i += size) {
    groups.push(cardSequence.value.slice(i, i + size))
  }
  return groups
})
const memorizeUsedSeconds = computed(() => {
  return Math.max(0, actualMemorizeSeconds.value - memorizeRemaining.value)
})
const accuracy = computed(() => {
  if (!totalCards.value) return 0
  return Math.round((correctCount.value / totalCards.value) * 100)
})
const isRecallFull = computed(() => userSequence.value.length >= totalCards.value)
const memoryMethodLabel = computed(() => {
  if (memoryMethod.value === 'pao') return 'PAO'
  if (memoryMethod.value === 'loci') return '地点桩'
  return '顺背'
})
const methodDescription = computed(() => {
  if (memoryMethod.value === 'pao') return '三张成一个人物-动作-物品故事，放入路线'
  if (memoryMethod.value === 'loci') return '按路线依次放置，每组一个场景，突出位置关系'
  return '直接按牌面顺背，留意花色序位，分组辅助'
})

const shuffle = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const startTimer = () => {
  clearTimer()
  memorizeRemaining.value = actualMemorizeSeconds.value
  timerInterval = setInterval(() => {
    if (memorizeRemaining.value <= 0) {
      clearTimer()
      enterRecall(false)
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

const startGame = () => {
  isTransitioning.value = true
  cardSequence.value = shuffle(CARD_POOL).slice(0, totalCards.value)
  userSequence.value = []
  correctCount.value = 0
  recallElapsed.value = 0
  recallStartAt = 0
  gameStatus.value = 'memorizing'
  startTimer()
  setTimeout(() => {
    isTransitioning.value = false
  }, 200)
}

const enterRecall = (manual = false) => {
  if (gameStatus.value !== 'memorizing') return
  isTransitioning.value = true
  clearTimer()
  if (manual) {
    memorizeRemaining.value = Math.max(0, memorizeRemaining.value)
  } else {
    memorizeRemaining.value = 0
  }
  gameStatus.value = 'recalling'
  recallStartAt = performance.now()
  setTimeout(() => {
    isTransitioning.value = false
  }, 200)
}

const selectCard = (card) => {
  if (gameStatus.value !== 'recalling' || isTransitioning.value) return
  if (userSequence.value.some((c) => c.id === card.id)) return
  if (isRecallFull.value) return
  userSequence.value.push(card)
}

const undoSelect = () => {
  if (!userSequence.value.length) return
  userSequence.value.pop()
}

const isCardCorrect = (index) => {
  const target = cardSequence.value[index]
  const userCard = userSequence.value[index]
  if (!target || !userCard) return false
  return target.id === userCard.id
}

const submitAnswer = () => {
  if (!userSequence.value.length) return
  isTransitioning.value = true
  correctCount.value = userSequence.value.reduce((acc, card, index) => {
    return acc + (cardSequence.value[index]?.id === card.id ? 1 : 0)
  }, 0)
  recallElapsed.value = recallStartAt ? Math.round((performance.now() - recallStartAt) / 1000) : 0
  gameStatus.value = 'completed'
  setTimeout(() => {
    isTransitioning.value = false
  }, 200)
}

const resetGame = () => {
  clearTimer()
  gameStatus.value = 'idle'
  cardSequence.value = []
  userSequence.value = []
  memorizeRemaining.value = 0
  recallElapsed.value = 0
  correctCount.value = 0
  recallStartAt = 0
}

const exitGame = () => {
  showConfirm('确定要退出当前模式吗？退出后当前进度将不会保存。', {
    confirmText: '确定',
    cancelText: '取消'
  }).then((confirmed) => {
    if (confirmed) {
      resetGame()
    }
  })
}

const goBack = () => {
  router.navigate(ROUTES.ATTENTION_TRAINING)
}

watch(
  () => selectedDeckSize.value,
  () => {
    if (gameStatus.value !== 'idle') resetGame()
  }
)

watch(
  () => memorizeSeconds.value,
  () => {
    if (gameStatus.value !== 'idle') resetGame()
  }
)

onUnmounted(() => {
  clearTimer()
})

watch(
  () => templateKey.value,
  (key) => {
    const tpl = memoryTemplates.find((t) => t.key === key)
    if (!tpl) return
    memoryMethod.value = tpl.method
    chunkSize.value = tpl.chunk
    paceMultiplier.value = tpl.pace
  }
)

watch(
  () => [memoryMethod.value, chunkSize.value, paceMultiplier.value],
  () => {
    if (gameStatus.value !== 'idle') resetGame()
  }
)
</script>

<style scoped>
.card-memory-container {
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  min-height: 400px;
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
  transition: all 0.25s;
}

.btn-exit:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.6);
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.3);
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
  grid-template-columns: 1fr;
  gap: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.card-chunk {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #c5c5c5;
  font-size: 13px;
}

.chunk-label {
  color: #ffd700;
  font-weight: 700;
}

.chunk-hint {
  color: #8fd19e;
}

.chunk-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.card-grid-display.stream .card-preview {
  align-items: flex-start;
}

.card-preview {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 215, 0, 0.28);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.card-preview img {
  width: 100%;
  max-width: 90px;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
}

.card-label {
  color: #ffd700;
  font-weight: 700;
  text-align: center;
}

.card-index {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #f7f7f7;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.hint-text {
  color: #c5c5c5;
  font-size: 16px;
  text-align: center;
}

.hint-text strong {
  color: #ffd700;
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

.selected-sequence {
  width: 100%;
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}

.selected-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f7f7f7;
  font-weight: 600;
}

.selected-card.correct {
  border-color: rgba(29, 209, 161, 0.6);
  background: rgba(29, 209, 161, 0.16);
}

.selected-card.error {
  border-color: rgba(231, 76, 60, 0.6);
  background: rgba(231, 76, 60, 0.16);
}

.selected-card .pos {
  color: #ffd700;
  font-weight: 800;
}

.empty-tip {
  color: #c5c5c5;
  font-size: 14px;
}

.available-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.card-button {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.card-button img {
  width: 100%;
  max-width: 90px;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
}

.recall-actions {
  display: flex;
  gap: 10px;
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

.stat-item.full-width {
  grid-column: 1 / -1;
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

.review-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.review-title {
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 8px;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.review-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.review-card.correct {
  border-color: rgba(29, 209, 161, 0.6);
}

.review-card.error {
  border-color: rgba(231, 76, 60, 0.6);
}

.review-card img {
  width: 100%;
  max-width: 90px;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
}

.review-label {
  color: #f7f7f7;
  font-weight: 600;
  text-align: center;
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

  .available-grid,
  .card-grid-display {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>

