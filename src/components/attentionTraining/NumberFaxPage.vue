<template>
	<div class="number-fax-container">
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
			<div class="badge">数字传真 · 记忆力训练</div>
			<h1 class="page-title">数字传真训练</h1>
			<p class="subtitle">选择0-9中的一个数字，系统会生成10-20组数字（每组4-8个数字）。认真记住每组数字，然后统计你选择的数字在所有组中出现的总次数。</p>
		  </div>
		  <div class="header-actions">
			<button class="btn-secondary" @click="goBack">返回训练中心</button>
		  </div>
		</header>
  
		<div class="content-grid">
		  <section class="game-column">
			<section class="controls">
			  <div class="control-item">
				<label for="target-number">选择目标数字</label>
				<select id="target-number" v-model="selectedNumber" :disabled="isRunning">
				  <option value="">请选择</option>
				  <option v-for="n in 10" :key="n - 1" :value="n - 1">{{ n - 1 }}</option>
				</select>
			  </div>
			  <div class="control-item">
				<label for="group-count">数字组数</label>
				<select id="group-count" v-model="groupCount" :disabled="isRunning">
				  <option value="10">10组</option>
				  <option value="15">15组</option>
				  <option value="20">20组</option>
				</select>
			  </div>
			  <div class="control-item compact">
				<div class="label">当前状态</div>
				<div class="status" :class="gameStatus">
				  {{ statusText }}
				</div>
			  </div>
			  <div class="control-item compact">
				<div class="label">当前组</div>
				<div class="progress-info">
				  {{ currentGroupIndex }} / {{ totalGroups }}
				</div>
			  </div>
			  <div class="control-actions">
				<button class="ghost" @click="resetGame" v-if="!isRunning">重置</button>
				<button class="primary" @click="startGame" v-if="!isRunning" :disabled="!selectedNumber">开始</button>
			  </div>
			</section>
  
			<section class="game-card" v-if="gameStatus !== 'idle'">
			  <div class="game-content">
				<!-- 退出按钮 -->
				<div class="exit-button-container">
				  <button class="btn-exit" @click="exitGame">退出模式</button>
				</div>
  
				<!-- 数字展示阶段 -->
				<div v-if="gameStatus === 'showing'" class="showing-mode">
				  <div class="group-header">
					<div class="group-number">第 {{ currentGroupIndex }} 组</div>
					<div class="timer" v-if="showTimer">{{ formatTime(remainingTime) }}</div>
				  </div>
				  <div class="number-group-display">
					<div
					  v-for="(num, index) in currentGroup"
					  :key="index"
					  class="number-item"
					>
					  {{ num }}
					</div>
				  </div>
				  <div class="hint-text">记住这些数字，准备进入下一组</div>
				  <button class="primary" @click="nextGroup" :disabled="isTransitioning">
					{{ isLastGroup ? '完成记忆' : '下一组' }}
				  </button>
				</div>
  
				<!-- 答题阶段 -->
				<div v-if="gameStatus === 'answering'" class="answering-mode">
				  <div class="answer-header">
					<div class="target-number-display">目标数字：<span class="target-number">{{ selectedNumber }}</span></div>
				  </div>
				  <div class="answer-section">
					<div class="hint-text">统计数字 <strong>{{ selectedNumber }}</strong> 在所有 {{ totalGroups }} 组数字中出现的总次数</div>
					<div class="answer-input-group">
					  <input
						type="number"
						v-model="userAnswer"
						placeholder="输入总次数"
						min="0"
						@keyup.enter="submitAnswer"
						:disabled="isTransitioning"
						ref="answerInput"
					  />
					  <button class="primary" @click="submitAnswer" :disabled="isTransitioning || !userAnswer">
						提交答案
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
				  <div class="stat-label">目标数字</div>
				  <div class="stat-value">{{ selectedNumber }}</div>
				</div>
				<div class="stat-item">
				  <div class="stat-label">总组数</div>
				  <div class="stat-value">{{ totalGroups }}</div>
				</div>
				<div class="stat-item">
				  <div class="stat-label">正确答案</div>
				  <div class="stat-value success">{{ correctAnswer }}</div>
				</div>
				<div class="stat-item">
				  <div class="stat-label">你的答案</div>
				  <div class="stat-value" :class="userAnswer === correctAnswer ? 'success' : 'error'">
					{{ userAnswer }}
				  </div>
				</div>
				<div class="stat-item full-width">
				  <div class="stat-label">结果</div>
				  <div class="stat-value" :class="userAnswer === correctAnswer ? 'success' : 'error'">
					{{ userAnswer === correctAnswer ? '✓ 回答正确！' : '✗ 回答错误' }}
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
				<h3>数字传真规则</h3>
			  </div>
			  <div class="info-content">
				<p>1. 首先选择0-9中的一个目标数字</p>
				<p>2. 系统会生成多组数字（每组4-8个数字）</p>
				<p>3. 认真观察并记住每组数字</p>
				<p>4. 所有组展示完毕后，统计你选择的目标数字在所有组中出现的总次数</p>
				<p>5. 输入统计结果并提交答案</p>
			  </div>
			</div>
  
			<div class="info-card">
			  <div class="info-header">
				<div class="badge ghost">训练技巧</div>
				<h3>记忆技巧</h3>
			  </div>
			  <div class="info-content">
				<ul class="tips-list">
				  <li>专注于目标数字的出现，忽略其他数字</li>
				  <li>可以边看边在心里默数目标数字的出现次数</li>
				  <li>保持注意力集中，不要被其他数字干扰</li>
				  <li>从简单的10组开始练习，逐步增加难度</li>
				  <li>建议先在纸上记录每组的出现次数，最后汇总</li>
				</ul>
			  </div>
			</div>
  
			<div class="info-card" v-if="gameStatus === 'completed' && allGroups.length > 0">
			  <div class="info-header">
				<div class="badge ghost">答案回顾</div>
				<h3>所有数字组</h3>
			  </div>
			  <div class="info-content">
				<div class="groups-review">
				  <div
					v-for="(group, index) in allGroups"
					:key="index"
					class="group-review-item"
				  >
					<span class="group-review-label">第{{ index + 1 }}组：</span>
					<span class="group-review-numbers">
					  <span
						v-for="(num, numIndex) in group"
						:key="numIndex"
						class="group-review-number"
						:class="{ highlight: String(num) === String(selectedNumber) }"
					  >
						{{ num }}
					  </span>
					</span>
					<span class="group-review-count">
					  ({{ countInGroup(group, selectedNumber) }}次)
					</span>
				  </div>
				</div>
			  </div>
			</div>
		  </section>
		</div>
	  </main>
  
	  <Sidebar
		:is-open="sidebarOpen"
		:active-route="ROUTES.ATTENTION_NUMBER_FAX"
		@close="handleSidebarClose"
	  />
	</div>
  </template>
  
  <script setup>
  import { computed, ref, watch, nextTick } from 'vue'
  import { useRouter, ROUTES } from '../../composables/useRouter.js'
  import TopHeader from '../common/TopHeader.vue'
  import Sidebar from '../common/Sidebar.vue'
  import { showConfirm } from '../../utils/alert.js'
  
  const router = useRouter()
  const sidebarOpen = ref(false)
  const selectedNumber = ref('')
  const groupCount = ref('15')
  const gameStatus = ref('idle') // idle | showing | answering | completed
  const isRunning = computed(() => gameStatus.value !== 'idle')
  const isTransitioning = ref(false)
  
  const allGroups = ref([])
  const currentGroupIndex = ref(0)
  const totalGroups = computed(() => parseInt(groupCount.value))
  const currentGroup = computed(() => {
	if (allGroups.value.length === 0 || currentGroupIndex.value === 0) return []
	return allGroups.value[currentGroupIndex.value - 1]
  })
  
  const isLastGroup = computed(() => {
	return currentGroupIndex.value >= totalGroups.value
  })
  
  const userAnswer = ref('')
  const showFeedback = ref(false)
  const feedbackType = ref('')
  const feedbackMessage = ref('')
  const correctAnswer = ref(0)
  
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
	if (gameStatus.value === 'showing') return '展示中'
	if (gameStatus.value === 'answering') return '答题中'
	if (gameStatus.value === 'completed') return '已完成'
	return '待开始'
  })
  
  // 生成随机数字组
  const generateGroups = () => {
	const groups = []
	for (let i = 0; i < totalGroups.value; i++) {
	//   const groupSize = Math.floor(Math.random() * 5) + 5 // 4-8个数字
	  const groupSize = 6;
	  const group = []
	  for (let j = 0; j < groupSize; j++) {
		group.push(Math.floor(Math.random() * 10)) // 0-9
	  }
	  groups.push(group)
	}
	return groups
  }
  
  // 统计目标数字在所有组中出现的总次数
  const countTargetNumber = (groups, target) => {
	let count = 0
	for (const group of groups) {
	  for (const num of group) {
		if (String(num) === String(target)) {
		  count++
		}
	  }
	}
	return count
  }
  
  // 统计目标数字在单组中出现的次数
  const countInGroup = (group, target) => {
	return group.filter(num => String(num) === String(target)).length
  }
  
  const startGame = () => {
	if (!selectedNumber.value) return
	
	gameStatus.value = 'showing'
	currentGroupIndex.value = 0
	userAnswer.value = ''
	showFeedback.value = false
	allGroups.value = generateGroups()
	
	// 计算正确答案
	correctAnswer.value = countTargetNumber(allGroups.value, selectedNumber.value)
	
	// 显示第一组
	nextGroup()
  }
  
  const nextGroup = () => {
	if (currentGroupIndex.value >= totalGroups.value) {
	  // 所有组展示完毕，进入答题阶段
	  gameStatus.value = 'answering'
	  nextTick(() => {
		const input = document.querySelector('input[type="number"]')
		if (input) {
		  input.focus()
		}
	  })
	  return
	}
	
	currentGroupIndex.value++
	isTransitioning.value = true
	
	// 短暂延迟后允许切换
	setTimeout(() => {
	  isTransitioning.value = false
	}, 300)
  }
  
  const submitAnswer = async () => {
	if (!userAnswer.value || userAnswer.value === '') return
	
	isTransitioning.value = true
	const answer = parseInt(userAnswer.value)
	const isCorrect = answer === correctAnswer.value
	
	if (isCorrect) {
	  feedbackType.value = 'success'
	  feedbackMessage.value = `✓ 回答正确！数字 ${selectedNumber.value} 确实出现了 ${correctAnswer.value} 次`
	} else {
	  feedbackType.value = 'error'
	  feedbackMessage.value = `✗ 回答错误！正确答案是 ${correctAnswer.value} 次，你选择了 ${answer} 次`
	}
	
	showFeedback.value = true
	
	await new Promise(resolve => setTimeout(resolve, 2000))
	
	showFeedback.value = false
	isTransitioning.value = false
	gameStatus.value = 'completed'
  }
  
  const resetGame = () => {
	gameStatus.value = 'idle'
	currentGroupIndex.value = 0
	userAnswer.value = ''
	showFeedback.value = false
	allGroups.value = []
	correctAnswer.value = 0
	if (timerInterval) {
	  clearInterval(timerInterval)
	  timerInterval = null
	}
  }
  
  const exitGame = () => {
	showConfirm('确定要退出当前模式吗？退出后当前进度将不会保存。', { confirmText: '确定', cancelText: '取消' })
	  .then((confirmed) => {
		if (confirmed) {
		  resetGame()
		}
	  })
  }
  
  const formatTime = (seconds) => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  
  const goBack = () => {
	router.navigate(ROUTES.ATTENTION_TRAINING)
  }
  
  watch(() => selectedNumber.value, () => {
	if (gameStatus.value !== 'idle') {
	  resetGame()
	}
  })
  
  watch(() => groupCount.value, () => {
	if (gameStatus.value !== 'idle') {
	  resetGame()
	}
  })
  </script>
  
  <style scoped>
  .number-fax-container {
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
  
  .status.showing {
	color: #f4d03f;
  }
  
  .status.answering {
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
  
  .showing-mode,
  .answering-mode {
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
  
  .target-number-display {
	font-size: 18px;
	font-weight: 700;
	color: #c5c5c5;
  }
  
  .target-number {
	font-size: 24px;
	color: #ffd700;
	text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  }
  
  .timer {
	font-size: 18px;
	font-weight: 700;
	color: #f4d03f;
  }
  
  .number-group-display {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 16px;
	padding: 30px;
	background: rgba(0, 0, 0, 0.4);
	border: 2px solid rgba(255, 215, 0, 0.3);
	border-radius: 12px;
	min-height: 150px;
	align-items: center;
  }
  
  .number-item {
	font-size: 48px;
	font-weight: 800;
	color: #ffd700;
	text-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
	padding: 12px 20px;
	background: rgba(255, 215, 0, 0.1);
	border: 2px solid rgba(255, 215, 0, 0.3);
	border-radius: 10px;
	min-width: 60px;
	text-align: center;
  }
  
  .hint-text {
	color: #c5c5c5;
	font-size: 16px;
	text-align: center;
  }
  
  .hint-text strong {
	color: #ffd700;
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
  
  .groups-review {
	max-height: 400px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 8px;
  }
  
  .group-review-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 8px;
	font-size: 14px;
  }
  
  .group-review-label {
	color: #c5c5c5;
	font-weight: 600;
	min-width: 70px;
  }
  
  .group-review-numbers {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
	flex: 1;
  }
  
  .group-review-number {
	padding: 4px 8px;
	border-radius: 4px;
	background: rgba(255, 255, 255, 0.1);
	color: #c5c5c5;
	font-weight: 600;
  }
  
  .group-review-number.highlight {
	background: rgba(255, 215, 0, 0.3);
	color: #ffd700;
	border: 1px solid rgba(255, 215, 0, 0.5);
  }
  
  .group-review-count {
	color: #f4d03f;
	font-weight: 700;
	min-width: 50px;
	text-align: right;
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
  
	.number-group-display {
	  padding: 20px;
	}
  
	.number-item {
	  font-size: 36px;
	  padding: 10px 16px;
	  min-width: 50px;
	}
  }
  </style>
  