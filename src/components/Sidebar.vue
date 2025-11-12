<template>
  <div>
    <!-- 右侧边栏菜单 -->
    <aside class="sidebar" :class="{ open: isOpen }">
      <div class="sidebar-content">
        <div class="sidebar-item" :class="{ active: activeRoute === 'home' }" @click="handleNavigate('home')">
          <span class="sidebar-icon">🏯</span>
          <span class="sidebar-text">返回首页</span>
        </div>
        <div class="sidebar-item" :class="{ active: activeRoute === 'profile' }" @click="handleNavigate('profile')">
          <span class="sidebar-icon">👤</span>
          <span class="sidebar-text">个人资料</span>
        </div>
        <div class="sidebar-item" :class="{ active: activeRoute === 'tasks' }" @click="handleNavigate('tasks')">
          <span class="sidebar-icon">📜</span>
          <span class="sidebar-text">任务日志</span>
        </div>
        <div class="sidebar-item" @click="toggleJourneySubmenu">
          <span class="sidebar-icon">💰</span>
          <span class="sidebar-text">旅程详情</span>
          <span class="sidebar-arrow" :class="{ rotated: showJourneySubmenu }">→</span>
        </div>
        <!-- 旅程详情二级菜单 -->
        <div v-if="showJourneySubmenu" class="submenu">
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === 'journey' }" 
            @click="handleNavigate('journey')"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">旅程</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === 'upgrade-bounty' }" 
            @click="handleNavigate('upgrade-bounty')"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">升级赏金</span>
          </div>
        </div>
        <div class="sidebar-item" @click="toggleVaultSubmenu">
          <span class="sidebar-icon">💰</span>
          <span class="sidebar-text">代币库</span>
          <span class="sidebar-arrow" :class="{ rotated: showVaultSubmenu }">→</span>
        </div>
        <!-- 代币库二级菜单 -->
        <div v-if="showVaultSubmenu" class="submenu">
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.DEPOSIT }" 
            @click="handleNavigate(ROUTES.DEPOSIT)"
          >
            <span class="submenu-icon">💵</span>
            <span class="submenu-text">USD 钱包</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.VT_WALLET }" 
            @click="handleNavigate(ROUTES.VT_WALLET)"
          >
            <span class="submenu-icon">💎</span>
            <span class="submenu-text">VT 钱包</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.UNIFI_WALLET }" 
            @click="handleNavigate(ROUTES.UNIFI_WALLET)"
          >
            <span class="submenu-icon">🔷</span>
            <span class="submenu-text">UNIFI 钱包</span>
          </div>
        </div>
        <div class="sidebar-item" @click="handleNavigate('vault-history')">
          <span class="sidebar-icon">📦</span>
          <span class="sidebar-text">金库历史</span>
          <span class="sidebar-arrow">→</span>
        </div>
        <div class="sidebar-item" @click="handleNavigate('income-history')">
          <span class="sidebar-icon">🎒</span>
          <span class="sidebar-text">收入历史</span>
          <span class="sidebar-arrow">→</span>
        </div>
        <div class="sidebar-item" @click="handleNavigate('team')">
          <span class="sidebar-icon">👥</span>
          <span class="sidebar-text">团队详情</span>
          <span class="sidebar-arrow">→</span>
        </div>
        <div class="sidebar-item" @click="handleNavigate('pass')">
          <span class="sidebar-icon">%</span>
          <span class="sidebar-text">PASS卡/优惠卷管理</span>
        </div>
        <div class="sidebar-item" @click="handleNavigate('midox')">
          <span class="sidebar-icon midox-icon">M</span>
          <span class="sidebar-text">MIDOX</span>
        </div>
        <div class="sidebar-item" @click="handleNavigate('language')">
          <span class="sidebar-icon">🇨🇳</span>
          <span class="sidebar-text">简体中文</span>
          <span class="sidebar-arrow">→</span>
        </div>
        <div class="sidebar-item logout" @click="handleLogout">
          <span class="sidebar-icon">🚪</span>
          <span class="sidebar-text">登出</span>
        </div>
      </div>
    </aside>

    <!-- 侧边栏遮罩 -->
    <div class="sidebar-overlay" v-if="isOpen" @click="handleClose"></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, ROUTES } from '../composables/useRouter.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  activeRoute: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const router = useRouter()

const showJourneySubmenu = ref(false)
const showVaultSubmenu = ref(false)

// 监听 activeRoute，如果当前路由是 journey 或 upgrade-bounty，自动展开二级菜单
watch(() => props.activeRoute, (newRoute) => {
  if (newRoute === ROUTES.JOURNEY || newRoute === ROUTES.UPGRADE_BOUNTY) {
    showJourneySubmenu.value = true
  }
  if (newRoute === ROUTES.DEPOSIT || newRoute === ROUTES.VT_WALLET || newRoute === ROUTES.UNIFI_WALLET) {
    showVaultSubmenu.value = true
  }
}, { immediate: true })

const toggleJourneySubmenu = () => {
  showJourneySubmenu.value = !showJourneySubmenu.value
}

const toggleVaultSubmenu = () => {
  showVaultSubmenu.value = !showVaultSubmenu.value
}

const handleNavigate = (route) => {
  if (route === ROUTES.JOURNEY || route === ROUTES.UPGRADE_BOUNTY) {
    showJourneySubmenu.value = false
  }
  if (route === ROUTES.DEPOSIT || route === ROUTES.VT_WALLET || route === ROUTES.UNIFI_WALLET) {
    showVaultSubmenu.value = false
  }
  
  // 直接使用 router 进行导航
  if (route === ROUTES.HOME) {
    router.goToHome()
  } else if (route === ROUTES.PROFILE) {
    router.goToProfile()
  } else if (route === ROUTES.TASKS) {
    router.goToTasks()
  } else if (route === ROUTES.JOURNEY) {
    router.goToJourney()
  } else if (route === ROUTES.UPGRADE_BOUNTY) {
    router.goToUpgradeBounty()
  } else if (route === ROUTES.DEPOSIT) {
    router.goToDeposit()
  } else if (route === ROUTES.VT_WALLET) {
    router.goToVTWallet()
  } else if (route === ROUTES.UNIFI_WALLET) {
    router.goToUnifiWallet()
  }
  
  // 通知父组件关闭侧边栏
  emit('close')
}

const handleClose = () => {
  emit('close')
}

const handleLogout = () => {
  router.logout()
  emit('close')
}
</script>

<style scoped>
/* 侧边栏 */
.sidebar {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(20, 10, 0, 0.95) 100%
  );
  border-left: 2px solid rgba(255, 215, 0, 0.4);
  z-index: 100;
  transition: right 0.3s ease;
  overflow-y: auto;
}

.sidebar.open {
  right: 0;
}

.sidebar-content {
  padding: 20px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.sidebar-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-left-color: rgba(255, 215, 0, 0.6);
  padding-left: 25px;
}

.sidebar-item.active {
  background: rgba(255, 215, 0, 0.15);
  border-left-color: rgba(255, 215, 0, 0.8);
}

.sidebar-item.logout {
  margin-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  padding-top: 20px;
}

.sidebar-item.logout:hover {
  background: rgba(255, 68, 68, 0.2);
  border-left-color: rgba(255, 68, 68, 0.8);
}

.sidebar-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-icon.midox-icon {
  background: #4caf50;
  color: white;
  border-radius: 4px;
  font-weight: bold;
  padding: 2px 6px;
}

.sidebar-text {
  flex: 1;
  font-size: 14px;
}

.sidebar-arrow {
  color: rgba(255, 215, 0, 0.6);
  font-size: 16px;
  transition: transform 0.3s;
}

.sidebar-arrow.rotated {
  transform: rotate(90deg);
}

/* 二级菜单 */
.submenu {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid rgba(255, 215, 0, 0.4);
  margin-left: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
  border-radius: 0 8px 8px 0;
  overflow: hidden;
}

.submenu-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: rgba(255, 215, 0, 0.8);
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.submenu-back:hover {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
}

.submenu-back-icon {
  font-size: 14px;
}

.submenu-back-text {
  font-size: 14px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  padding-left: 40px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.submenu-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-left-color: rgba(255, 215, 0, 0.6);
  padding-left: 45px;
}

.submenu-item.active {
  background: rgba(255, 215, 0, 0.15);
  border-left-color: rgba(255, 215, 0, 0.8);
}

.submenu-icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.submenu-text {
  flex: 1;
  font-size: 14px;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  backdrop-filter: blur(2px);
}
</style>

