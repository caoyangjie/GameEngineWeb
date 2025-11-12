<template>
  <div class="vt-wallet-container">
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
    <main class="vt-wallet-main-content">
      <!-- VT 钱包面板 -->
      <div class="vt-wallet-panel">
        <div class="wallet-title">{{ t('vtWallet.vtWallet') }}</div>
        <div class="vt-price-section">
          <div class="vt-price-label">{{ t('vtWallet.vtPrice') }}</div>
          <div class="vt-price-value">
            <div class="vt-icon">V</div>
            <span>{{ vtPrice }} USD</span>
          </div>
        </div>
      </div>

      <!-- 赏金库和主金库区域 -->
      <div class="treasury-section">
        <!-- 赏金库 -->
        <div class="treasury-panel bounty-treasury">
          <div class="treasury-title">{{ t('vtWallet.bountyTreasury') }}</div>
          <div class="treasury-content">
            <div class="treasury-icon">V</div>
            <div class="treasury-info">
              <div class="treasury-label">{{ t('vtWallet.bountyTotal') }}</div>
              <div class="treasury-value">{{ bountyTotal }} VT</div>
              <div class="auto-journey-toggle">
                <span class="toggle-label">{{ t('vtWallet.autoAddJourney') }}</span>
                <label class="switch">
                  <input type="checkbox" v-model="autoAddJourney" />
                  <span class="slider"></span>
                </label>
                <span class="toggle-status">{{ autoAddJourney ? t('vtWallet.on') : t('vtWallet.off') }}</span>
              </div>
            </div>
          </div>
          <div class="treasury-actions">
            <button class="treasury-button harvest-btn" @click="handleHarvest">{{ t('vtWallet.harvest') }}</button>
            <button class="treasury-button add-btn" @click="handleAdd">{{ t('vtWallet.add') }}</button>
          </div>
        </div>

        <!-- 主金库 -->
        <div class="treasury-panel main-treasury">
          <div class="treasury-title">{{ t('vtWallet.mainTreasury') }}</div>
          <div class="treasury-content">
            <div class="treasury-icon">V</div>
            <div class="treasury-info">
              <div class="treasury-label">{{ t('vtWallet.mainWallet') }}</div>
              <div class="treasury-value">{{ mainWallet }} VT</div>
              <div class="auto-journey-toggle">
                <label class="switch">
                </label>
              </div>
            </div>
          </div>
          <div class="treasury-actions">
            <button class="treasury-button exchange-btn" @click="handleExchange">{{ t('vtWallet.exchange') }}</button>
            <button class="treasury-button add-btn" @click="handleAdd">{{ t('vtWallet.add') }}</button>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="vt-wallet"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TopHeader from './TopHeader.vue'
import Sidebar from './Sidebar.vue'
import { useRouter, ROUTES } from '../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)

// VT 价格
const vtPrice = ref('1.0200')

// 赏金库数据
const bountyTotal = ref('578.204')
const autoAddJourney = ref(false)

// 主金库数据
const mainWallet = ref('0.000')

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

const handleHarvest = () => {
  console.log('收成')
  alert(t('vtWallet.harvestInDevelopment'))
}

const handleAdd = () => {
  console.log('追加')
  alert(t('vtWallet.addInDevelopment'))
}

const handleExchange = () => {
  console.log('兑换')
  alert(t('vtWallet.exchangeInDevelopment'))
}
</script>

<style scoped>
.vt-wallet-container {
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
.vt-wallet-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 200px;
  min-height: calc(100vh - 150px);
}

/* VT 钱包面板 */
.vt-wallet-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  max-width: 840px;
  margin-left: auto;
  margin-right: auto;
}

.wallet-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
}

.vt-price-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.vt-price-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.vt-price-value {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.vt-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4a90e2 0%, #ffd700 50%, #9b59b6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
}

/* 赏金库和主金库区域 */
.treasury-section {
  display: flex;
  gap: 40px;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.treasury-panel {
  flex: 1;
  max-width: 500px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.treasury-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 25px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.treasury-content {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.treasury-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4a90e2 0%, #ffd700 50%, #9b59b6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 25px rgba(74, 144, 226, 0.5);
  flex-shrink: 0;
}

.treasury-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.treasury-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.treasury-value {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.auto-journey-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.toggle-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.3);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: rgba(255, 215, 0, 0.8);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.toggle-status {
  font-size: 14px;
  color: #ffd700;
  font-weight: bold;
}

.treasury-actions {
  display: flex;
  gap: 15px;
}

.treasury-button {
  flex: 1;
  padding: 12px 24px;
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

.treasury-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .vt-wallet-main-content {
    padding: 30px 20px;
  }

  .treasury-section {
    flex-direction: column;
    align-items: center;
  }

  .treasury-panel {
    width: 100%;
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .vt-wallet-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .vt-price-value {
    font-size: 24px;
  }

  .vt-icon {
    width: 50px;
    height: 50px;
    font-size: 30px;
  }

  .treasury-content {
    flex-direction: column;
    text-align: center;
  }

  .treasury-actions {
    flex-direction: column;
  }
}
</style>

