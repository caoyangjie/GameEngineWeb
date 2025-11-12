<template>
	<div class="journey-history-container">
	  <!-- 背景层 -->
	  <div class="background">
		<div class="sky"></div>
		<div class="stars"></div>
		<div class="galaxy"></div>
		<div class="mountains"></div>
		<div class="temple-background"></div>
		<div class="forest-overlay"></div>
	  </div>
  
	  <!-- 顶部导航栏 -->
	  <TopHeader @toggle-sidebar="toggleSidebar" @go-to-journey="handleGoToJourney" @go-to-deposit="handleGoToDeposit" />
  
	  <!-- 主要内容区域 -->
	  <main class="journey-history-main-content">
		<!-- 标题 -->
		<div class="title-section">
		  <div class="title-banner">
			<span class="title-icon">💰</span>
			<span class="title-text">{{ t('journeyHistory.title') }}</span>
		  </div>
		</div>
  
		<!-- 筛选区域 -->
		<div class="filter-section">
		  <div class="filter-row">
			<div class="filter-field">
			  <label class="filter-label">{{ t('journeyHistory.startDate') }}</label>
			  <CustomDatePicker
				v-model="filters.startDate"
			  />
			</div>
			<div class="filter-field">
			  <label class="filter-label">{{ t('journeyHistory.endDate') }}</label>
			  <CustomDatePicker
				v-model="filters.endDate"
			  />
			</div>
			<div class="filter-field">
			  <label class="filter-label">{{ t('journeyHistory.journeyType') }}</label>
			  <CustomSelect
				v-model="filters.journeyType"
				:options="journeyTypeOptions"
				:placeholder="t('journeyHistory.all')"
			  />
			</div>
		  </div>
		  <button class="filter-button" @click="applyFilter">
			{{ t('journeyHistory.applyFilter') }}
		  </button>
		</div>
  
		<!-- 旅程历史表格 -->
		<div class="history-table-section">
		  <!-- 表头 -->
		  <div class="table-header">
			<div class="header-cell">{{ t('journeyHistory.date') }}</div>
			<div class="header-cell">{{ t('journeyHistory.journey') }}</div>
			<div class="header-cell">{{ t('journeyHistory.amount') }}</div>
			<div class="header-cell">{{ t('journeyHistory.journeyValue') }}</div>
			<div class="header-cell">{{ t('journeyHistory.journeyTypeLabel') }}</div>
			<div class="header-cell">{{ t('journeyHistory.duration') }}</div>
		  </div>
  
		  <!-- 分隔线 -->
		  <div class="header-divider"></div>
  
		  <!-- 表格内容 -->
		  <div class="table-content">
			<div v-if="paginatedJourneys.length === 0" class="empty-state">
			  <div class="empty-icon">🌳</div>
			  <div class="empty-text">{{ t('commonStatus.noData') }}</div>
			</div>
			<div v-else class="table-rows">
			  <div 
				v-for="journey in paginatedJourneys" 
				:key="journey.id" 
				class="table-row"
			  >
				<div class="table-cell">{{ formatDateTime(journey.date) }}</div>
				<div class="table-cell">{{ journey.journey }}</div>
				<div class="table-cell">{{ formatAmount(journey.amount) }}</div>
				<div class="table-cell">{{ formatAmount(journey.journeyValue) }}</div>
				<div class="table-cell">{{ getJourneyTypeText(journey.journeyType) }}</div>
				<div class="table-cell">{{ journey.duration }}</div>
			  </div>
			</div>
		  </div>
		</div>
  
		<!-- 分页 -->
		<div class="pagination-section" v-if="totalItems > 0">
		  <div class="pagination-info">
			{{ t('pagination.totalRecords', { count: totalItems, current: currentPage, total: totalPages }) }}
		  </div>
		  <div class="pagination-controls">
			<button 
			  class="pagination-btn" 
			  :disabled="currentPage === 1"
			  @click="goToPage(currentPage - 1)"
			>
			  {{ t('pagination.previousPage') }}
			</button>
			<div class="pagination-numbers">
			  <button
				v-for="page in visiblePages"
				:key="page"
				class="pagination-number"
				:class="{ active: page === currentPage }"
				@click="goToPage(page)"
			  >
				{{ page }}
			  </button>
			</div>
			<button 
			  class="pagination-btn" 
			  :disabled="currentPage === totalPages"
			  @click="goToPage(currentPage + 1)"
			>
			  {{ t('pagination.nextPage') }}
			</button>
		  </div>
		</div>
	  </main>
  
	  <!-- 右侧边栏菜单 -->
	  <Sidebar 
		:is-open="sidebarOpen" 
		active-route="journey-history"
		@close="handleSidebarClose"
	  />
	</div>
  </template>
  
  <script setup>
  import { ref, reactive, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import TopHeader from '../common/TopHeader.vue'
  import Sidebar from '../common/Sidebar.vue'
  import CustomSelect from '../common/CustomSelect.vue'
  import CustomDatePicker from '../common/CustomDatePicker.vue'
  import { useRouter, ROUTES } from '../../composables/useRouter.js'
  
  const { t } = useI18n()
  const router = useRouter()
  
  const sidebarOpen = ref(false)
  
  // 筛选条件
  const filters = reactive({
	startDate: '',
	endDate: '',
	journeyType: ''
  })

  // 旅程类型选项
  const journeyTypeOptions = computed(() => [
	{ value: '', label: t('journeyHistory.all') },
	{ value: 'new', label: t('journeyHistory.new') },
	{ value: 'upgrade', label: t('journeyHistory.upgrade') },
	{ value: 'renewal', label: t('journeyHistory.renewal') }
  ])
  
  // 每页显示数量
  const itemsPerPage = ref(10)
  
  // 当前页码
  const currentPage = ref(1)
  
  // 旅程数据（示例数据，实际应该从API获取）
  const journeys = ref([
	{
	  id: 1,
	  date: '2025-07-25 15:24:31',
	  journey: '银',
	  amount: '5000.000',
	  journeyValue: '5000.000',
	  journeyType: 'new',
	  duration: '150'
	},
	{
	  id: 2,
	  date: '2025-07-24 10:15:22',
	  journey: '金',
	  amount: '10000.000',
	  journeyValue: '10000.000',
	  journeyType: 'new',
	  duration: '180'
	},
	{
	  id: 3,
	  date: '2025-07-23 14:30:45',
	  journey: '银',
	  amount: '5000.000',
	  journeyValue: '5000.000',
	  journeyType: 'upgrade',
	  duration: '150'
	},
	{
	  id: 4,
	  date: '2025-07-22 09:20:18',
	  journey: '铂金',
	  amount: '20000.000',
	  journeyValue: '20000.000',
	  journeyType: 'new',
	  duration: '200'
	},
	{
	  id: 5,
	  date: '2025-07-21 16:45:33',
	  journey: '金',
	  amount: '10000.000',
	  journeyValue: '10000.000',
	  journeyType: 'renewal',
	  duration: '180'
	},
	{
	  id: 6,
	  date: '2025-07-20 11:30:55',
	  journey: '银',
	  amount: '5000.000',
	  journeyValue: '5000.000',
	  journeyType: 'new',
	  duration: '150'
	},
	{
	  id: 7,
	  date: '2025-07-19 13:15:42',
	  journey: '钻石',
	  amount: '50000.000',
	  journeyValue: '50000.000',
	  journeyType: 'upgrade',
	  duration: '300'
	},
	{
	  id: 8,
	  date: '2025-07-18 08:25:10',
	  journey: '金',
	  amount: '10000.000',
	  journeyValue: '10000.000',
	  journeyType: 'new',
	  duration: '180'
	},
	{
	  id: 9,
	  date: '2025-07-17 17:40:28',
	  journey: '银',
	  amount: '5000.000',
	  journeyValue: '5000.000',
	  journeyType: 'renewal',
	  duration: '150'
	},
	{
	  id: 10,
	  date: '2025-07-16 12:50:15',
	  journey: '铂金',
	  amount: '20000.000',
	  journeyValue: '20000.000',
	  journeyType: 'upgrade',
	  duration: '200'
	},
	{
	  id: 11,
	  date: '2025-07-15 10:35:20',
	  journey: '金',
	  amount: '10000.000',
	  journeyValue: '10000.000',
	  journeyType: 'new',
	  duration: '180'
	}
  ])
  
  // 应用筛选后的旅程列表
  const filteredJourneys = computed(() => {
	let result = journeys.value
  
	if (filters.startDate) {
	  result = result.filter(j => j.date >= filters.startDate)
	}
	if (filters.endDate) {
	  result = result.filter(j => j.date <= filters.endDate)
	}
	if (filters.journeyType) {
	  result = result.filter(j => j.journeyType === filters.journeyType)
	}
  
	return result
  })
  
  // 分页计算
  const totalItems = computed(() => filteredJourneys.value.length)
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  
  // 当前页显示的旅程
  const paginatedJourneys = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value
	const end = start + itemsPerPage.value
	return filteredJourneys.value.slice(start, end)
  })
  
  // 可见的页码
  const visiblePages = computed(() => {
	const pages = []
	const maxVisible = 5
	let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
	let end = Math.min(totalPages.value, start + maxVisible - 1)
	
	if (end - start < maxVisible - 1) {
	  start = Math.max(1, end - maxVisible + 1)
	}
	
	for (let i = start; i <= end; i++) {
	  pages.push(i)
	}
	
	return pages
  })
  
  const toggleSidebar = () => {
	sidebarOpen.value = !sidebarOpen.value
  }
  
  const handleSidebarClose = () => {
	toggleSidebar()
  }
  
  const handleGoToJourney = () => {
	router.goToJourney()
  }
  
  const handleGoToDeposit = () => {
	router.goToDeposit()
  }
  
  const applyFilter = () => {
	currentPage.value = 1 // 重置到第一页
	console.log('应用筛选', filters)
  }
  
  const goToPage = (page) => {
	if (page >= 1 && page <= totalPages.value) {
	  currentPage.value = page
	  // 滚动到顶部
	  window.scrollTo({ top: 0, behavior: 'smooth' })
	}
  }
  
  const formatDateTime = (dateString) => {
	if (!dateString) return ''
	// 如果已经是格式化好的字符串，直接返回
	if (dateString.includes(' ')) {
	  return dateString
	}
	// 否则格式化日期
	const date = new Date(dateString)
	return date.toLocaleString('zh-CN', {
	  year: 'numeric',
	  month: '2-digit',
	  day: '2-digit',
	  hour: '2-digit',
	  minute: '2-digit',
	  second: '2-digit',
	  hour12: true
	})
  }
  
  const formatAmount = (amount) => {
	if (!amount) return ''
	// 格式化金额，添加千位分隔符
	const num = parseFloat(amount)
	if (isNaN(num)) return amount
	return num.toLocaleString('zh-CN', {
	  minimumFractionDigits: 3,
	  maximumFractionDigits: 3
	})
  }
  
  const getJourneyTypeText = (type) => {
	const typeMap = {
	  'new': t('journeyHistory.new'),
	  'upgrade': t('journeyHistory.upgrade'),
	  'renewal': t('journeyHistory.renewal')
	}
	return typeMap[type] || type
  }
  </script>
  
  <style scoped>
  .journey-history-container {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow-y: auto;
	overflow-x: hidden;
	font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
	color: white;
  }
  
  /* 背景层 */
  .background {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
  }
  
  .sky {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(
	  to bottom,
	  #0a0e27 0%,
	  #1a1f3a 20%,
	  #2d3a5a 40%,
	  #1a2332 60%,
	  #0f1419 100%
	);
  }
  
  .stars {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: 
	  radial-gradient(2px 2px at 20% 30%, #ffd700, transparent),
	  radial-gradient(1px 1px at 60% 70%, #fff, transparent),
	  radial-gradient(2px 2px at 50% 50%, #ff6b9d, transparent),
	  radial-gradient(1px 1px at 80% 10%, #fff, transparent),
	  radial-gradient(2px 2px at 90% 40%, #ffd700, transparent);
	background-repeat: repeat;
	background-size: 200% 200%;
	animation: twinkle 3s ease-in-out infinite alternate;
  }
  
  @keyframes twinkle {
	0% { opacity: 0.6; }
	100% { opacity: 1; }
  }
  
  .galaxy {
	position: absolute;
	top: 10%;
	right: 10%;
	width: 300px;
	height: 300px;
	background: radial-gradient(
	  ellipse at center,
	  rgba(255, 215, 0, 0.2) 0%,
	  rgba(138, 43, 226, 0.2) 40%,
	  transparent 70%
	);
	border-radius: 50%;
	filter: blur(40px);
	animation: rotate 20s linear infinite;
  }
  
  @keyframes rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
  }
  
  .mountains {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 40%;
	background: 
	  linear-gradient(to top, #0a0a0a 0%, transparent 100%),
	  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cpath d='M0,400 L200,300 L400,350 L600,250 L800,320 L1000,280 L1200,300 L1200,400 Z' fill='%231a1a1a'/%3E%3C/svg%3E") no-repeat bottom;
	background-size: 100% 100%;
	opacity: 0.8;
  }
  
  .temple-background {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 800px;
	height: 400px;
	background: 
	  linear-gradient(to bottom, transparent 0%, rgba(20, 15, 10, 0.2) 50%, rgba(10, 5, 0, 0.4) 100%),
	  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath d='M100,400 L100,250 L150,230 L200,250 L250,230 L300,250 L350,230 L400,250 L450,230 L500,250 L550,230 L600,250 L650,230 L700,250 L700,400 Z' fill='rgba(20,15,10,0.3)'/%3E%3C/svg%3E") no-repeat bottom;
	background-size: 100% 100%;
	opacity: 0.6;
	filter: blur(2px);
  }
  
  .forest-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 50%;
	background: 
	  radial-gradient(ellipse at 20% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%),
	  radial-gradient(ellipse at 80% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%);
	pointer-events: none;
  }
  
  /* 主要内容区域 */
  .journey-history-main-content {
	position: relative;
	z-index: 5;
	padding: 40px;
	max-width: 1400px;
	margin: 0 auto;
	padding-top: 100px;
	min-height: calc(100vh - 150px);
  }
  
  /* 标题区域 */
  .title-section {
	margin-bottom: 30px;
  }
  
  .title-banner {
	background: rgba(0, 0, 0, 0.7);
	border: 2px solid rgba(255, 215, 0, 0.4);
	border-radius: 12px;
	padding: 20px 30px;
	display: inline-flex;
	align-items: center;
	gap: 15px;
	backdrop-filter: blur(10px);
	box-shadow: 
	  0 0 30px rgba(255, 215, 0, 0.3),
	  inset 0 0 30px rgba(255, 215, 0, 0.05);
  }
  
  .title-icon {
	font-size: 32px;
  }
  
  .title-text {
	font-size: 24px;
	font-weight: bold;
	color: #ffd700;
	text-shadow: 
	  0 0 10px rgba(255, 215, 0, 0.8),
	  2px 2px 4px rgba(0, 0, 0, 0.8);
	letter-spacing: 2px;
  }
  
  /* 筛选区域 */
  .filter-section {
	background: rgba(0, 0, 0, 0.7);
	border: 2px solid rgba(255, 215, 0, 0.4);
	border-radius: 12px;
	padding: 25px;
	margin-bottom: 30px;
	backdrop-filter: blur(10px);
	box-shadow: 
	  0 0 30px rgba(255, 215, 0, 0.3),
	  inset 0 0 30px rgba(255, 215, 0, 0.05);
  }
  
  .filter-row {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	margin-bottom: 20px;
  }
  
  .filter-field {
	display: flex;
	flex-direction: column;
	gap: 8px;
  }
  
  .filter-label {
	font-size: 14px;
	color: rgba(255, 255, 255, 0.9);
  }
  
  .filter-input-wrapper {
	position: relative;
  }
  
  .filter-input {
	width: 100%;
	padding: 10px 35px 10px 15px;
	background: rgba(0, 0, 0, 0.5);
	border: 1px solid rgba(255, 215, 0, 0.5);
	border-radius: 6px;
	color: white;
	font-size: 14px;
	outline: none;
	transition: all 0.3s;
  }
  
  .filter-input:focus {
	border-color: rgba(255, 215, 0, 0.8);
	box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
  
  .filter-select {
	appearance: none;
	cursor: pointer;
  }
  
  .filter-arrow {
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: #ffd700;
	pointer-events: none;
	font-size: 12px;
  }
  
  .filter-button {
	width: 100%;
	padding: 12px;
	background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
	border: 2px solid rgba(255, 215, 0, 0.8);
	border-radius: 8px;
	color: #ffd700;
	font-size: 16px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.3s;
	text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
	box-shadow: 
	  0 0 20px rgba(255, 215, 0, 0.3),
	  inset 0 0 20px rgba(255, 215, 0, 0.1);
  }
  
  .filter-button:hover {
	background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
	box-shadow: 
	  0 0 30px rgba(255, 215, 0, 0.5),
	  inset 0 0 20px rgba(255, 215, 0, 0.2);
	transform: translateY(-2px);
  }
  
  /* 表格区域 */
  .history-table-section {
	background: rgba(0, 0, 0, 0.7);
	border: 2px solid rgba(255, 215, 0, 0.4);
	border-radius: 12px;
	padding: 0;
	backdrop-filter: blur(10px);
	box-shadow: 
	  0 0 30px rgba(255, 215, 0, 0.3),
	  inset 0 0 30px rgba(255, 215, 0, 0.05);
	overflow: hidden;
	margin-bottom: 30px;
  }
  
  .table-header {
	display: grid;
	grid-template-columns: 1.5fr 0.8fr 1.2fr 1.2fr 1fr 1fr;
	gap: 10px;
	padding: 20px;
	background: rgba(255, 215, 0, 0.1);
  }
  
  .header-cell {
	font-size: 14px;
	font-weight: bold;
	color: #ffd700;
	text-align: center;
	text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  }
  
  .header-divider {
	height: 2px;
	background: linear-gradient(to right, transparent, rgba(255, 215, 0, 0.5), transparent);
	margin: 0 20px;
  }
  
  .table-content {
	padding: 0 20px 20px;
  }
  
  .empty-state {
	padding: 60px 20px;
	text-align: center;
  }
  
  .empty-icon {
	font-size: 48px;
	margin-bottom: 20px;
	opacity: 0.6;
  }
  .empty-text {
	font-size: 18px;
	color: rgba(255, 255, 255, 0.6);
  }
  
  .table-rows {
	display: flex;
	flex-direction: column;
	gap: 1px;
	margin-top: 10px;
  }
  
  .table-row {
	display: grid;
	grid-template-columns: 1.5fr 0.8fr 1.2fr 1.2fr 1fr 1fr;
	gap: 10px;
	padding: 15px 0;
	background: rgba(255, 255, 255, 0.02);
	border-bottom: 1px solid rgba(255, 215, 0, 0.1);
	transition: background 0.3s;
  }
  
  .table-row:hover {
	background: rgba(255, 215, 0, 0.05);
  }
  
  .table-cell {
	font-size: 13px;
	color: rgba(255, 255, 255, 0.9);
	text-align: center;
	word-break: break-word;
	display: flex;
	align-items: center;
	justify-content: center;
  }
  
  /* 分页区域 */
  .pagination-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20px;
	background: rgba(0, 0, 0, 0.7);
	border: 2px solid rgba(255, 215, 0, 0.4);
	border-radius: 12px;
	backdrop-filter: blur(10px);
	box-shadow: 
	  0 0 30px rgba(255, 215, 0, 0.3),
	  inset 0 0 30px rgba(255, 215, 0, 0.05);
  }
  
  .pagination-info {
	font-size: 14px;
	color: rgba(255, 255, 255, 0.8);
  }
  
  .pagination-controls {
	display: flex;
	align-items: center;
	gap: 10px;
  }
  
  .pagination-btn {
	padding: 8px 16px;
	background: rgba(255, 215, 0, 0.2);
	border: 1px solid rgba(255, 215, 0, 0.5);
	border-radius: 6px;
	color: #ffd700;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.3s;
  }
  
  .pagination-btn:hover:not(:disabled) {
	background: rgba(255, 215, 0, 0.4);
	border-color: rgba(255, 215, 0, 0.8);
  }
  
  .pagination-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
  }
  
  .pagination-numbers {
	display: flex;
	gap: 5px;
  }
  
  .pagination-number {
	min-width: 36px;
	height: 36px;
	padding: 0 12px;
	background: rgba(255, 215, 0, 0.2);
	border: 1px solid rgba(255, 215, 0, 0.5);
	border-radius: 6px;
	color: #ffd700;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
  }
  
  .pagination-number:hover {
	background: rgba(255, 215, 0, 0.4);
	border-color: rgba(255, 215, 0, 0.8);
  }
  
  .pagination-number.active {
	background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
	border-color: rgba(255, 215, 0, 0.8);
	box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }
  
  /* 响应式设计 */
  @media (max-width: 1200px) {
	.journey-history-main-content {
	  padding: 30px 20px;
	}
  
	.filter-row {
	  grid-template-columns: repeat(2, 1fr);
	}
  
	.table-header,
	.table-row {
	  grid-template-columns: 1.2fr 0.7fr 1fr 1fr 0.9fr 0.9fr;
	  font-size: 12px;
	}
  
	.pagination-section {
	  flex-direction: column;
	  gap: 15px;
	}
  }
  
  @media (max-width: 768px) {
	.journey-history-main-content {
	  padding: 20px 15px;
	  margin-top: 100px;
	}
  
	.filter-row {
	  grid-template-columns: 1fr;
	}
  
	.table-header,
	.table-row {
	  grid-template-columns: 1fr;
	  gap: 5px;
	}
  
	.header-cell,
	.table-cell {
	  text-align: left;
	  padding: 5px 0;
	}
  
	.header-cell::before {
	  content: attr(data-label) ': ';
	  font-weight: bold;
	}
  }
  </style>

