<template>
  <div class="journey-details-container">
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
    <main class="journey-details-main-content">
      <!-- 标题 -->
      <div class="title-section">
        <div class="title-banner">
          <span class="title-icon">💰</span>
          <span class="title-icon">💰</span>
          <span class="title-text">{{ t('journeyDetails.title') }}</span>
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

        <!-- 操作按钮 -->
        <div class="action-section">
          <button class="add-journey-button" @click="handleAddJourney">
            {{ t('journey.addJourney') }}
          </button>
          <button class="vip-card-button" @click="handleVipCardApplication">
            {{ t('journeyDetails.vipCardApplication') }}
          </button>
        </div>
      </div>

      <!-- 升级详情面板 -->
      <div class="upgrade-details-panel">
        <div class="panel-title">{{ t('journeyDetails.upgradeDetails') }}</div>
        <div class="view-button-wrapper">
          <button class="view-button" @click="handleView">
            {{ t('journeyDetails.view') }}
          </button>
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
import { ref, reactive } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)

// 当前数据（示例数据，实际应该从API获取）
const currentData = reactive({
  level: '银',
  remainingDays: 40,
  principal: 5100.000,
  multiplierPool: 7566.519,
  vtBalance: 0.000
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

const formatNumber = (num) => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

const handleAddJourney = () => {
  router.goToJourney()
}

const handleVipCardApplication = () => {
  router.goToVipCardApplication()
}

const handleView = () => {
  router.goToUpgradeBounty()
}
</script>

<style scoped>
.journey-details-container {
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
.journey-details-main-content {
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
  margin-bottom: 30px;
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

/* 操作区域 */
.action-section {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.add-journey-button,
.vip-card-button {
  flex: 1;
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

.add-journey-button:hover,
.vip-card-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

/* 升级详情面板 */
.upgrade-details-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.panel-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.view-button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.view-button {
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

.view-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .journey-details-main-content {
    padding: 30px 20px;
  }

  .financial-row {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .journey-details-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .info-row {
    flex-direction: column;
    gap: 20px;
  }

  .action-section {
    flex-direction: column;
  }
}
</style>

