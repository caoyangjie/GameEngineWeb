<template>
  <header class="top-header">
    <!-- 左侧Logo -->
    <div class="header-logo">
      <h1 class="logo-text">西域旅</h1>
      <p class="logo-subtitle">挑战边界 • 超越极限</p>
    </div>

    <!-- 中间滚动条 -->
    <div 
      class="header-ticker" 
      @mouseenter="pauseTicker"
      @mouseleave="resumeTicker"
    >
      <div class="ticker-wrapper">
        <div class="ticker-content" :class="{ paused: isTickerPaused }">
          <!-- 第一组内容 -->
          <span class="ticker-item" @click="handleTickerClick('欢迎来到《西域之旅》!')">欢迎来到《西域之旅》!</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('UNIFI $9.2119 -5.13%')">UNIFI $9.2119 -5.13%</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('新用户注册即送100金币')">新用户注册即送100金币</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('每日签到可获得丰厚奖励')">每日签到可获得丰厚奖励</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('完成主线任务解锁新角色')">完成主线任务解锁新角色</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('限时活动：双倍经验加成中')">限时活动：双倍经验加成中</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('VIP会员享受专属特权')">VIP会员享受专属特权</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('团队副本即将开启')">团队副本即将开启</span>
          <span class="ticker-separator">|</span>
          <!-- 第二组内容（重复，用于无缝循环） -->
          <span class="ticker-item" @click="handleTickerClick('欢迎来到《西域之旅》!')">欢迎来到《西域之旅》!</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('UNIFI $9.2119 -5.13%')">UNIFI $9.2119 -5.13%</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('新用户注册即送100金币')">新用户注册即送100金币</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('每日签到可获得丰厚奖励')">每日签到可获得丰厚奖励</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('完成主线任务解锁新角色')">完成主线任务解锁新角色</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('限时活动：双倍经验加成中')">限时活动：双倍经验加成中</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('VIP会员享受专属特权')">VIP会员享受专属特权</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('团队副本即将开启')">团队副本即将开启</span>
          <span class="ticker-separator">|</span>
          <!-- 第三组内容（再次重复，确保无缝循环） -->
          <span class="ticker-item" @click="handleTickerClick('欢迎来到《西域之旅》!')">欢迎来到《西域之旅》!</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('UNIFI $9.2119 -5.13%')">UNIFI $9.2119 -5.13%</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('新用户注册即送100金币')">新用户注册即送100金币</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('每日签到可获得丰厚奖励')">每日签到可获得丰厚奖励</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('完成主线任务解锁新角色')">完成主线任务解锁新角色</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('限时活动：双倍经验加成中')">限时活动：双倍经验加成中</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('VIP会员享受专属特权')">VIP会员享受专属特权</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('团队副本即将开启')">团队副本即将开启</span>
          <span class="ticker-separator">|</span>
        </div>
      </div>
    </div>

    <!-- 右侧按钮组 -->
    <div class="header-actions">
      <button class="action-btn deposit-btn" @click="handleDepositClick">
        <span class="btn-icon">💰</span>
        <span class="btn-text">存款</span>
      </button>
      <button class="action-btn journey-btn" @click="handleJourneyClick">
        <span class="btn-icon">📜</span>
        <span class="btn-text">旅程</span>
      </button>
      <button class="action-btn menu-toggle" @click="handleMenuToggle">
        <span class="btn-icon">☰</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from '../composables/useRouter.js'

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()

const isTickerPaused = ref(false)

const pauseTicker = () => {
  isTickerPaused.value = true
}

const resumeTicker = () => {
  isTickerPaused.value = false
}

const handleTickerClick = (text) => {
  console.log(text)
}

const handleMenuToggle = () => {
  emit('toggle-sidebar')
}

const handleJourneyClick = () => {
  router.goToJourney()
}

const handleDepositClick = () => {
  router.goToDeposit()
}
</script>

<style scoped>
/* 顶部导航栏 */
.top-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    transparent 100%
  );
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
}

.header-logo {
  flex-shrink: 0;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    0 0 20px rgba(255, 215, 0, 0.5);
  margin: 0;
  letter-spacing: 3px;
}

.logo-subtitle {
  font-size: 11px;
  color: rgba(255, 215, 0, 0.8);
  margin: 2px 0 0 0;
  letter-spacing: 1px;
}

.header-ticker {
  flex: 1;
  margin: 0 30px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.ticker-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.ticker-content {
  display: inline-flex;
  align-items: center;
  height: 100%;
  gap: 20px;
  white-space: nowrap;
  animation: ticker-scroll 30s linear infinite;
  will-change: transform;
}

.ticker-content.paused {
  animation-play-state: paused;
}

.ticker-item {
  color: #ffd700;
  font-size: 14px;
  text-shadow: 
    0 0 5px rgba(255, 215, 0, 0.6),
    0 0 10px rgba(255, 215, 0, 0.4);
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s;
  padding: 2px 4px;
  border-radius: 4px;
}

.ticker-item:hover {
  background: rgba(255, 215, 0, 0.2);
  text-shadow: 
    0 0 8px rgba(255, 215, 0, 0.9),
    0 0 15px rgba(255, 215, 0, 0.6);
  transform: scale(1.05);
}

.ticker-separator {
  color: rgba(255, 215, 0, 0.5);
  font-size: 14px;
  flex-shrink: 0;
}

@keyframes ticker-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-100% / 3));
  }
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  color: #ffd700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

.action-btn:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 16px;
}

.menu-toggle {
  padding: 8px 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .header-ticker {
    margin: 0;
    width: 100%;
  }
}
</style>

