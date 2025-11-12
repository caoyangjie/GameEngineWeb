<template>
  <div class="upgrade-bounty-container">
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
    <main class="upgrade-bounty-main-content">
      <!-- 标题 -->
      <div class="title-section">
        <div class="title-banner">
          <span class="title-text">{{ t('upgradeBounty.title') }}</span>
        </div>
      </div>

      <!-- 升级赏金详情面板 -->
      <div class="upgrade-bounty-panel">
        <!-- 主要内容区域：左右两列 -->
        <div class="content-row">
          <!-- 左侧：升级等级 -->
          <div class="content-column">
            <div class="section-label">{{ t('upgradeBounty.upgradeLevel') }}</div>
            <div class="input-group">
              <input 
                type="text" 
                v-model="upgradeData.level" 
                class="level-input"
                placeholder="-"
                readonly
              />
            </div>
            <div class="input-group">
              <label for="team-a-current" class="field-label">{{ t('upgradeBounty.teamACurrentMultiplierPool') }}</label>
              <input 
                id="team-a-current"
                type="text" 
                v-model="upgradeData.teamACurrent" 
                class="pool-input"
                placeholder="0.000"
                readonly
              />
            </div>
            <div class="input-group">
              <label for="team-a-max" class="field-label">{{ t('upgradeBounty.teamAMaxMultiplierPool') }}</label>
              <input 
                id="team-a-max"
                type="text" 
                v-model="upgradeData.teamAMax" 
                class="pool-input"
                placeholder="0.000"
                readonly
              />
            </div>
          </div>

          <!-- 右侧：升级赏金 -->
          <div class="content-column">
            <div class="section-label">{{ t('upgradeBounty.upgradeBounty') }}</div>
            <div class="input-group">
              <input 
                type="text" 
                v-model="upgradeData.bounty" 
                class="bounty-input"
                placeholder="- %"
                readonly
              />
            </div>
            <div class="input-group">
              <label for="team-b-current" class="field-label">{{ t('upgradeBounty.teamBCurrentMultiplierPool') }}</label>
              <input 
                id="team-b-current"
                type="text" 
                v-model="upgradeData.teamBCurrent" 
                class="pool-input"
                placeholder="0.000"
                readonly
              />
            </div>
            <div class="input-group">
              <label for="team-b-max" class="field-label">{{ t('upgradeBounty.teamBMaxMultiplierPool') }}</label>
              <input 
                id="team-b-max"
                type="text" 
                v-model="upgradeData.teamBMax" 
                class="pool-input"
                placeholder="0.000"
                readonly
              />
            </div>
          </div>
        </div>

        <!-- 底部：沉淀倍增池值 -->
        <div class="bottom-section">
          <div class="field-label">{{ t('upgradeBounty.sedimentMultiplierPoolValue') }}</div>
          <div class="sediment-pool-display">
            {{ upgradeData.sedimentPool || '0.000' }}
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="upgrade-bounty"
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

// 升级赏金数据
const upgradeData = reactive({
  level: '-',
  bounty: '- %',
  teamACurrent: '0.000',
  teamAMax: '0.000',
  teamBCurrent: '0.000',
  teamBMax: '0.000',
  sedimentPool: '0.000'
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 现在直接使用 router，只需要处理关闭事件
const handleSidebarClose = () => {
  toggleSidebar()
}

const handleGoToJourney = () => {
  router.goToJourney()
}

const handleGoToDeposit = () => {
  router.goToDeposit()
}
</script>

<style scoped>
.upgrade-bounty-container {
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
.upgrade-bounty-main-content {
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
  justify-content: center;
  padding: 12px 30px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 8px;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(5px);
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

/* 升级赏金详情面板 */
.upgrade-bounty-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

/* 内容行 */
.content-row {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.content-column {
  flex: 1;
}

.section-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
}

.level-input,
.bounty-input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  text-align: center;
  outline: none;
  transition: all 0.3s;
}

.level-input:focus,
.bounty-input:focus {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.pool-input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.pool-input:focus {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.pool-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* 底部沉淀池值 */
.bottom-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
}

.bottom-section .field-label {
  text-align: center;
  margin-bottom: 15px;
}

.sediment-pool-display {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 8px;
  color: #ffd700;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .upgrade-bounty-main-content {
    padding: 30px 20px;
  }

  .content-row {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .upgrade-bounty-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }
}
</style>

