<template>
  <header class="top-header">
    <!-- 左侧Logo -->
    <div class="header-logo">
      <h1 class="logo-text">{{ t('common.appName') }}</h1>
      <p class="logo-subtitle">{{ t('common.appSubtitle') }}</p>
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
          <span class="ticker-item" @click="handleTickerClick(t('common.welcome'))">{{ t('common.welcome') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('UNIFI $9.2119 -5.13%')">UNIFI $9.2119 -5.13%</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.newUserBonus'))">{{ t('common.newUserBonus') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.dailyCheckIn'))">{{ t('common.dailyCheckIn') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.mainQuest'))">{{ t('common.mainQuest') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.limitedEvent'))">{{ t('common.limitedEvent') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.vipPrivileges'))">{{ t('common.vipPrivileges') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.teamDungeon'))">{{ t('common.teamDungeon') }}</span>
          <span class="ticker-separator">|</span>
          <!-- 第二组内容（重复，用于无缝循环） -->
          <span class="ticker-item" @click="handleTickerClick(t('common.welcome'))">{{ t('common.welcome') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('UNIFI $9.2119 -5.13%')">UNIFI $9.2119 -5.13%</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.newUserBonus'))">{{ t('common.newUserBonus') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.dailyCheckIn'))">{{ t('common.dailyCheckIn') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.mainQuest'))">{{ t('common.mainQuest') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.limitedEvent'))">{{ t('common.limitedEvent') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.vipPrivileges'))">{{ t('common.vipPrivileges') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.teamDungeon'))">{{ t('common.teamDungeon') }}</span>
          <span class="ticker-separator">|</span>
          <!-- 第三组内容（再次重复，确保无缝循环） -->
          <span class="ticker-item" @click="handleTickerClick(t('common.welcome'))">{{ t('common.welcome') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick('UNIFI $9.2119 -5.13%')">UNIFI $9.2119 -5.13%</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.newUserBonus'))">{{ t('common.newUserBonus') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.dailyCheckIn'))">{{ t('common.dailyCheckIn') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.mainQuest'))">{{ t('common.mainQuest') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.limitedEvent'))">{{ t('common.limitedEvent') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.vipPrivileges'))">{{ t('common.vipPrivileges') }}</span>
          <span class="ticker-separator">|</span>
          <span class="ticker-item" @click="handleTickerClick(t('common.teamDungeon'))">{{ t('common.teamDungeon') }}</span>
          <span class="ticker-separator">|</span>
        </div>
      </div>
    </div>

    <!-- 右侧按钮组 -->
    <div class="header-actions">
      <!-- 语言选择器 -->
      <div class="language-selector-wrapper" @click.stop="toggleLanguageMenu">
        <button class="action-btn language-btn">
          <span class="btn-icon">{{ currentLanguage.flag }}</span>
          <span class="btn-text">{{ currentLanguage.name }}</span>
          <span class="language-arrow" :class="{ open: isLanguageMenuOpen }">▼</span>
        </button>
        <!-- 语言下拉菜单 -->
        <div class="language-menu" v-if="isLanguageMenuOpen" @click.stop>
          <div 
            v-for="lang in languages" 
            :key="lang.code"
            class="language-option"
            :class="{ active: currentLocale === lang.code }"
            @click="changeLanguage(lang.code)"
          >
            <span class="language-flag">{{ lang.flag }}</span>
            <span class="language-name">{{ lang.name }}</span>
            <span class="language-check" v-if="currentLocale === lang.code">✓</span>
          </div>
        </div>
      </div>
      <button class="action-btn deposit-btn" @click="handleDepositClick">
        <span class="btn-icon">💰</span>
        <span class="btn-text">{{ t('common.deposit') }}</span>
      </button>
      <button class="action-btn journey-btn" @click="handleJourneyClick">
        <span class="btn-icon">📜</span>
        <span class="btn-text">{{ t('common.journey') }}</span>
      </button>
      <button class="action-btn menu-toggle" @click="handleMenuToggle">
        <span class="btn-icon">☰</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from '../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const { locale, t } = useI18n()

const isTickerPaused = ref(false)
const isLanguageMenuOpen = ref(false)
const currentLocale = computed(() => locale.value)

// 语言列表
const languages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
]

// 当前语言信息
const currentLanguage = computed(() => {
  return languages.find(lang => lang.code === currentLocale.value) || languages[1]
})

// 切换语言菜单
const toggleLanguageMenu = () => {
  isLanguageMenuOpen.value = !isLanguageMenuOpen.value
}

// 切换语言
const changeLanguage = (langCode) => {
  locale.value = langCode
  localStorage.setItem('locale', langCode)
  isLanguageMenuOpen.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.language-selector-wrapper')) {
    isLanguageMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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

/* 语言选择器 */
.language-selector-wrapper {
  position: relative;
}

.language-btn {
  position: relative;
}

.language-arrow {
  font-size: 10px;
  margin-left: 4px;
  transition: transform 0.3s;
}

.language-arrow.open {
  transform: rotate(180deg);
}

.language-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.language-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: #ffd700;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
}

.language-option:last-child {
  border-bottom: none;
}

.language-option:hover {
  background: rgba(255, 215, 0, 0.15);
  padding-left: 18px;
}

.language-option.active {
  background: rgba(255, 215, 0, 0.2);
  border-left: 3px solid #ffd700;
}

.language-flag {
  font-size: 20px;
  flex-shrink: 0;
}

.language-name {
  flex: 1;
  font-size: 14px;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

.language-check {
  color: #ffd700;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
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

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .language-menu {
    right: auto;
    left: 50%;
    transform: translateX(-50%) translateY(0);
  }
}
</style>

