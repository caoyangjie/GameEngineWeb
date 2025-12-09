<template>
  <div class="attention-game-page">
    <header class="page-header">
      <div class="title-block">
        <div class="badge">专注力训练</div>
        <h1>{{ gameTitle }}</h1>
        <p class="subtitle">{{ description }}</p>
      </div>
      <div class="user-block">
        <div class="user-label">当前用户</div>
        <div class="user-value">{{ currentUserId }}</div>
        <div class="user-tip">数据隔离：仅展示该用户的数据</div>
      </div>
    </header>

    <section class="filters">
      <div class="input-group">
        <label :for="keywordId">关键词</label>
        <input
          :id="keywordId"
          v-model.trim="filters.keyword"
          placeholder="支持按名称、标签检索"
        />
      </div>
      <div class="input-group">
        <label :for="difficultyId">难度</label>
        <select :id="difficultyId" v-model="filters.difficulty">
          <option value="all">全部</option>
          <option v-for="level in difficultyOptions" :key="level" :value="level">
            {{ level }}
          </option>
        </select>
      </div>
      <div class="input-group">
        <label :for="timeRangeId">更新时间</label>
        <select :id="timeRangeId" v-model="filters.timeRange">
          <option value="all">全部</option>
          <option value="week">近 7 天</option>
          <option value="month">近 30 天</option>
        </select>
      </div>
      <div class="actions">
        <button class="primary" @click="loadData">查询</button>
        <button class="ghost" @click="resetFilters">重置</button>
      </div>
    </section>

    <section class="summary">
      <div class="summary-item">
        <div class="label">数据条数</div>
        <div class="value">{{ pagination.total }}</div>
      </div>
      <div class="summary-item">
        <div class="label">当前页</div>
        <div class="value">{{ pagination.page }} / {{ totalPages }}</div>
      </div>
      <div class="summary-item">
        <div class="label">分页大小</div>
        <div class="value">{{ pagination.pageSize }}</div>
      </div>
      <div class="summary-item">
        <div class="label">数据隔离策略</div>
        <div class="value">按 userId 分区</div>
      </div>
    </section>

    <section class="table">
      <div class="table-header">
        <span>关卡/主题</span>
        <span>难度</span>
        <span>最高得分</span>
        <span>今日状态</span>
        <span>最近更新</span>
        <span>数据归属</span>
      </div>
      <div v-if="loading" class="table-empty">正在加载...</div>
      <div v-else-if="!records.length" class="table-empty">
        暂无数据，当前用户 {{ currentUserId }} 尚未产生记录。
      </div>
      <div
        v-else
        v-for="item in records"
        :key="item.id"
        class="table-row"
      >
        <div class="cell primary">
          <div class="name">{{ item.title }}</div>
          <div class="tags">
            <span class="tag">{{ gameTitle }}</span>
            <span class="tag ghost">{{ item.label }}</span>
          </div>
        </div>
        <div class="cell">{{ item.difficulty }}</div>
        <div class="cell highlight">{{ item.score }}</div>
        <div class="cell status" :class="item.status">{{ item.statusText }}</div>
        <div class="cell">{{ item.updatedAt }}</div>
        <div class="cell">{{ item.userId }}</div>
      </div>
    </section>

    <section class="pagination">
      <button :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)">
        上一页
      </button>
      <span class="page-info">第 {{ pagination.page }} / {{ totalPages }} 页</span>
      <button :disabled="pagination.page === totalPages" @click="changePage(pagination.page + 1)">
        下一页
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { getUserInfo } from '../../utils/auth.js'

const props = defineProps({
  gameKey: {
    type: String,
    required: true
  },
  gameTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})

const difficultyOptions = ['入门', '巩固', '进阶', '挑战']
const filters = reactive({
  keyword: '',
  difficulty: 'all',
  timeRange: 'all'
})
const pagination = reactive({
  page: 1,
  pageSize: 8,
  total: 0
})
const loading = ref(false)
const records = ref([])
const userInfo = getUserInfo()
const currentUserId = computed(() => userInfo?.id || userInfo?.userId || 'guest')
const keywordId = computed(() => `${props.gameKey}-keyword`)
const difficultyId = computed(() => `${props.gameKey}-difficulty`)
const timeRangeId = computed(() => `${props.gameKey}-time`)

const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.pageSize)))

const baseDataset = computed(() => {
  const difficultyPool = ['入门', '巩固', '进阶', '挑战']
  const statusPool = [
    { key: 'ready', text: '待练习' },
    { key: 'running', text: '训练中' },
    { key: 'completed', text: '已完成' }
  ]

  return Array.from({ length: 36 }).map((_, index) => {
    const diff = difficultyPool[index % difficultyPool.length]
    const status = statusPool[index % statusPool.length]
    return {
      id: `${props.gameKey}-${currentUserId.value}-${index}`,
      userId: currentUserId.value,
      title: `${gameTitle} - 第 ${index + 1} 关`,
      label: index % 2 === 0 ? '专注时长' : '记忆跨度',
      difficulty: diff,
      score: 800 + index * 7,
      status: status.key,
      statusText: status.text,
      updatedAt: mockDate(index),
      timestamp: Date.now() - index * 24 * 60 * 60 * 1000
    }
  })
})

const mockDate = (index) => {
  const date = new Date()
  date.setDate(date.getDate() - index)
  return date.toISOString().slice(0, 10)
}

const applyFilters = () => {
  let data = baseDataset.value.slice()

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    data = data.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.label.toLowerCase().includes(keyword)
    )
  }

  if (filters.difficulty !== 'all') {
    data = data.filter((item) => item.difficulty === filters.difficulty)
  }

  if (filters.timeRange === 'week') {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    data = data.filter((item) => item.timestamp >= weekAgo)
  } else if (filters.timeRange === 'month') {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    data = data.filter((item) => item.timestamp >= monthAgo)
  }

  return data
}

const loadData = () => {
  loading.value = true
  const filtered = applyFilters()
  pagination.total = filtered.length
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  records.value = filtered.slice(start, end)
  loading.value = false
}

const resetFilters = () => {
  filters.keyword = ''
  filters.difficulty = 'all'
  filters.timeRange = 'all'
  pagination.page = 1
  loadData()
}

const changePage = (page) => {
  pagination.page = page
  loadData()
}

watch(
  () => [filters.keyword, filters.difficulty, filters.timeRange, currentUserId.value],
  () => {
    pagination.page = 1
    loadData()
  }
)

loadData()
</script>

<style scoped>
.attention-game-page {
  padding: 24px;
  background: #0c0c0f;
  color: #f7f7f7;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 215, 0, 0.18);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 18px;
}

.title-block h1 {
  font-size: 22px;
  margin-bottom: 6px;
}

.subtitle {
  color: #c5c5c5;
  font-size: 14px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  margin-bottom: 6px;
  border-radius: 999px;
  background: rgba(255, 215, 0, 0.18);
  color: #f4d03f;
  font-size: 12px;
}

.user-block {
  min-width: 220px;
  text-align: right;
}

.user-label {
  color: #c5c5c5;
  font-size: 12px;
}

.user-value {
  font-size: 18px;
  font-weight: 600;
}

.user-tip {
  color: #8fd19e;
  font-size: 12px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.input-group {
  background: #14141a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 13px;
  color: #c5c5c5;
}

.input-group input,
.input-group select {
  background: #0f0f14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f7f7f7;
  padding: 8px;
  border-radius: 8px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions button {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  color: #f7f7f7;
  background: #1b1b22;
  transition: all 0.2s;
}

.actions button.primary {
  background: linear-gradient(90deg, #f4d03f, #f39c12);
  color: #0c0c0f;
  font-weight: 700;
}

.actions button.ghost:hover,
.actions button.primary:hover {
  transform: translateY(-1px);
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.summary-item {
  background: #14141a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 12px;
}

.summary-item .label {
  color: #c5c5c5;
  font-size: 12px;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 700;
}

.table {
  background: #0f0f14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: 12px 14px;
  align-items: center;
}

.table-header {
  background: rgba(255, 255, 255, 0.04);
  color: #c5c5c5;
  font-size: 13px;
  font-weight: 600;
}

.table-row {
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.cell {
  color: #f7f7f7;
  font-size: 14px;
}

.cell.primary .name {
  font-weight: 700;
  margin-bottom: 4px;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(244, 208, 63, 0.16);
  color: #f4d03f;
  font-size: 12px;
}

.tag.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #c5c5c5;
}

.highlight {
  color: #8fd19e;
  font-weight: 700;
}

.status.ready {
  color: #f39c12;
}

.status.running {
  color: #4aa3ff;
}

.status.completed {
  color: #8fd19e;
}

.table-empty {
  padding: 18px;
  text-align: center;
  color: #c5c5c5;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.pagination button {
  padding: 8px 14px;
  border-radius: 8px;
  background: #1b1b22;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f7f7f7;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: #c5c5c5;
}

@media (max-width: 960px) {
  .table-header,
  .table-row {
    grid-template-columns: 2fr 1fr 1fr;
    grid-row-gap: 8px;
  }

  .table-row .cell:nth-child(n + 4),
  .table-header span:nth-child(n + 4) {
    display: none;
  }
}
</style>

