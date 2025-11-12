<template>
  <div class="journey-container">
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
    <main class="journey-main-content">
      <!-- 标题 -->
      <div class="title-section">
        <div class="title-banner">
          <span class="title-icon">💰</span>
          <span class="title-icon">💰</span>
          <span class="title-text">{{ t('journey.title') }}</span>
        </div>
      </div>

      <!-- 旅程详情面板 -->
      <div class="journey-panel">
        <!-- 第一行：当前旅程等级和剩余天数 -->
        <div class="info-row">
          <div class="info-item">
            <div class="info-label">{{ t('journey.currentJourneyLevel') }}</div>
            <div class="info-value-box">
              <span class="level-text">{{ currentData.level }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ t('journey.currentRemainingDays') }}</div>
            <div class="info-value-box">
              <span class="days-text">{{ currentData.remainingDays }}{{ t('journey.days') }}</span>
            </div>
          </div>
        </div>

        <!-- 第二行：本金、倍增池、VT余额 -->
        <div class="financial-row">
          <div class="financial-item">
            <div class="financial-icon">👑</div>
            <div class="financial-label">{{ t('journey.principal') }}</div>
            <div class="financial-value">{{ formatNumber(currentData.principal) }} USDT</div>
          </div>
          <div class="financial-item">
            <div class="financial-icon">💰</div>
            <div class="financial-label">{{ t('journey.currentMultiplierPool') }}</div>
            <div class="financial-value">{{ formatNumber(currentData.multiplierPool) }} USDT</div>
          </div>
          <div class="financial-item">
            <div class="financial-icon vt-icon">VT</div>
            <div class="financial-label">{{ t('journey.vtBalance') }}</div>
            <div class="financial-value">{{ formatNumber(currentData.vtBalance) }} VT</div>
          </div>
        </div>

        <!-- 第三行：金额输入和天数选择 -->
        <div class="input-row">
          <div class="input-group">
            <label for="amount-input" class="input-label">{{ t('journey.amount') }}</label>
            <div class="input-wrapper">
              <input 
                id="amount-input"
                type="number" 
                v-model="journeyData.amount" 
                class="amount-input"
                :placeholder="t('journey.pleaseEnterAmount')"
              />
              <button class="max-button" @click="setMaxAmount">{{ t('journey.max') }}</button>
            </div>
          </div>
          <div class="input-group">
            <div class="input-label">{{ t('journey.days') }}</div>
            <div class="days-buttons">
              <button 
                v-for="day in daysOptions" 
                :key="day"
                class="day-button"
                :class="{ active: journeyData.selectedDays === day }"
                @click="journeyData.selectedDays = day"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </div>

        <!-- 第四行：新倍增池值 -->
        <div class="input-row">
          <div class="input-group full-width">
            <label for="multiplier-input" class="input-label">{{ t('journey.newMultiplierPoolValue') }}</label>
            <input 
              id="multiplier-input"
              type="text" 
              v-model="journeyData.newMultiplierPool" 
              class="multiplier-input"
              :placeholder="t('journey.newMultiplierPoolValue')"
              readonly
            />
          </div>
        </div>

        <!-- 追加旅程按钮 -->
        <div class="action-section">
          <button class="add-journey-button" @click="handleAddJourney">
            {{ t('journey.addJourney') }}
          </button>
          <a href="#" class="details-link" @click.prevent="handleViewDetails">
            {{ t('journey.journeyDetailsPage') }} >
          </a>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="journey"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import TopHeader from './TopHeader.vue'
import Sidebar from './Sidebar.vue'
import { useRouter, ROUTES } from '../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)

// 旅程数据
const journeyData = reactive({
  amount: '',
  selectedDays: 150,
  newMultiplierPool: ''
})

// 天数选项
const daysOptions = [30, 60, 90, 120, 150]

// 当前数据（示例数据，实际应该从API获取）
const currentData = reactive({
  level: '银',
  remainingDays: 40,
  principal: 5100.000,
  multiplierPool: 7566.519,
  vtBalance: 0.000
})

// 计算新倍增池值
watch([() => journeyData.amount, () => journeyData.selectedDays], () => {
  if (journeyData.amount && journeyData.selectedDays) {
    // 简单的计算逻辑，实际应该根据业务规则计算
    const amount = parseFloat(journeyData.amount) || 0
    const multiplier = currentData.multiplierPool + amount
    journeyData.newMultiplierPool = multiplier.toFixed(3) + ' USDT'
  } else {
    journeyData.newMultiplierPool = ''
  }
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 现在直接使用 router，只需要处理关闭事件
const handleSidebarClose = () => {
  toggleSidebar()
}

const handleGoToJourney = () => {
  // 已经在旅程详情页面，无需跳转
}

const handleGoToDeposit = () => {
  router.goToDeposit()
}

const setMaxAmount = () => {
  // 设置最大金额（示例：使用VT余额或本金）
  journeyData.amount = currentData.vtBalance > 0 ? currentData.vtBalance.toString() : currentData.principal.toString()
}

const formatNumber = (num) => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

const handleAddJourney = () => {
  if (!journeyData.amount || parseFloat(journeyData.amount) <= 0) {
    alert(t('journey.pleaseEnterValidAmount'))
    return
  }
  if (!journeyData.selectedDays) {
    alert(t('journey.pleaseSelectDays'))
    return
  }
  console.log('追加旅程:', {
    amount: journeyData.amount,
    days: journeyData.selectedDays,
    newMultiplierPool: journeyData.newMultiplierPool
  })
  alert(t('journey.journeyAddedSuccessfully'))
  // 重置表单
  journeyData.amount = ''
  journeyData.newMultiplierPool = ''
}

const handleViewDetails = () => {
  console.log('查看旅程详情页面')
  // 这里可以导航到更详细的页面
}
</script>

<style scoped>
.journey-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层 */
.background {
  position: absolute;
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
.journey-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 100px;
  min-height: calc(100vh - 150px);
}

/* 标题区域 */
.title-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.title-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 8px;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(5px);
}

.title-icon {
  font-size: 20px;
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

/* 旅程详情面板 */
.journey-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

/* 第一行：旅程等级和剩余天数 */
.info-row {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.info-item {
  flex: 1;
}

.info-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 10px;
}

.info-value-box {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%);
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.3),
    inset 0 0 15px rgba(255, 215, 0, 0.1);
}

.level-text,
.days-text {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 第二行：财务信息 */
.financial-row {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.financial-item {
  flex: 1;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}

.financial-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.5);
  transform: translateY(-2px);
}

.financial-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.financial-icon.vt-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  background: linear-gradient(135deg, #4a90e2 0%, #50c878 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.financial-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
}

.financial-value {
  color: #ffd700;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 第三行：输入和天数选择 */
.input-row {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
}

.input-group {
  flex: 1;
}

.input-group.full-width {
  flex: 1;
}

.input-label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 10px;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.amount-input,
.multiplier-input {
  flex: 1;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.amount-input:focus,
.multiplier-input:focus {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.amount-input::placeholder,
.multiplier-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.max-button {
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  color: #ffd700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.max-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.5) 0%, rgba(255, 140, 0, 0.5) 100%);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.days-buttons {
  display: flex;
  gap: 10px;
}

.day-button {
  flex: 1;
  padding: 12px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.day-button:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.5);
}

.day-button.active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  color: #ffd700;
  font-weight: bold;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

/* 操作区域 */
.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.add-journey-button {
  width: 100%;
  max-width: 400px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 8px;
  color: #ffd700;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
}

.add-journey-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

.details-link {
  color: rgba(255, 215, 0, 0.8);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s;
}

.details-link:hover {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .journey-main-content {
    padding: 30px 20px;
  }

  .financial-row {
    flex-direction: column;
  }

  .input-row {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .journey-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .info-row {
    flex-direction: column;
    gap: 20px;
  }

  .days-buttons {
    flex-wrap: wrap;
  }

  .day-button {
    min-width: calc(50% - 5px);
  }
}
</style>

