<template>
  <div>
    <!-- 右侧边栏菜单 -->
    <aside class="sidebar" :class="{ open: isOpen }">
      <div class="sidebar-content">
        <div class="sidebar-item" :class="{ active: activeRoute === ROUTES.HOME || activeRoute === 'home' }" @click="handleNavigate(ROUTES.HOME)">
          <span class="sidebar-icon">🏯</span>
          <span class="sidebar-text">{{ t('sidebar.backToHome') }}</span>
        </div>
        <div class="sidebar-item" :class="{ active: activeRoute === ROUTES.PROFILE || activeRoute === 'profile' }" @click="handleNavigate(ROUTES.PROFILE)">
          <span class="sidebar-icon">👤</span>
          <span class="sidebar-text">{{ t('sidebar.profile') }}</span>
        </div>
        <div v-if="menuConfig.showTaskLog" class="sidebar-item" :class="{ active: activeRoute === ROUTES.TASKS || activeRoute === 'tasks' }" @click="handleNavigate(ROUTES.TASKS)">
          <span class="sidebar-icon">📜</span>
          <span class="sidebar-text">{{ t('sidebar.taskLog') }}</span>
        </div>
        <div v-if="menuConfig.showJourneyDetails" class="sidebar-item" @click="toggleJourneySubmenu">
          <span class="sidebar-icon">💰</span>
          <span class="sidebar-text">{{ t('sidebar.journeyDetails') }}</span>
          <span class="sidebar-arrow" :class="{ rotated: showJourneySubmenu }">→</span>
        </div>
        <!-- 旅程详情二级菜单 -->
        <div v-if="menuConfig.showJourneyDetails && showJourneySubmenu" class="submenu">
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === 'journey' }" 
            @click="handleNavigate('journey')"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">{{ t('sidebar.journey') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === 'upgrade-bounty' }" 
            @click="handleNavigate('upgrade-bounty')"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">{{ t('sidebar.upgradeBounty') }}</span>
          </div>
        </div>
        <div v-if="menuConfig.showTokenVault" class="sidebar-item" @click="toggleVaultSubmenu">
          <span class="sidebar-icon">💰</span>
          <span class="sidebar-text">{{ t('sidebar.tokenVault') }}</span>
          <span class="sidebar-arrow" :class="{ rotated: showVaultSubmenu }">→</span>
        </div>
        <!-- 代币库二级菜单 -->
        <div v-if="menuConfig.showTokenVault && showVaultSubmenu" class="submenu">
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.DEPOSIT }" 
            @click="handleNavigate(ROUTES.DEPOSIT)"
          >
            <span class="submenu-icon">💵</span>
            <span class="submenu-text">{{ t('sidebar.usdWallet') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.VT_WALLET }" 
            @click="handleNavigate(ROUTES.VT_WALLET)"
          >
            <span class="submenu-icon">💎</span>
            <span class="submenu-text">{{ t('sidebar.vtWallet') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.UNIFI_WALLET }" 
            @click="handleNavigate(ROUTES.UNIFI_WALLET)"
          >
            <span class="submenu-icon">🔷</span>
            <span class="submenu-text">{{ t('sidebar.unifiWallet') }}</span>
          </div>
        </div>
        <div v-if="menuConfig.showVaultHistory" class="sidebar-item" @click="toggleVaultHistorySubmenu">
          <span class="sidebar-icon">📦</span>
          <span class="sidebar-text">{{ t('sidebar.vaultHistory') }}</span>
          <span class="sidebar-arrow" :class="{ rotated: showVaultHistorySubmenu }">→</span>
        </div>
        <!-- 金库历史二级菜单 -->
        <div v-if="menuConfig.showVaultHistory && showVaultHistorySubmenu" class="submenu">
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.WALLET_HISTORY }" 
            @click="handleNavigate(ROUTES.WALLET_HISTORY)"
          >
            <span class="submenu-icon">💳</span>
            <span class="submenu-text">{{ t('sidebar.walletHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.DEPOSIT_HISTORY }" 
            @click="handleNavigate(ROUTES.DEPOSIT_HISTORY)"
          >
            <span class="submenu-icon">💳</span>
            <span class="submenu-text">{{ t('sidebar.depositHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.WITHDRAWAL_HISTORY }" 
            @click="handleNavigate(ROUTES.WITHDRAWAL_HISTORY)"
          >
            <span class="submenu-icon">💳</span>
            <span class="submenu-text">{{ t('sidebar.withdrawalHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.UNIFI_WITHDRAWAL_HISTORY }" 
            @click="handleNavigate(ROUTES.UNIFI_WITHDRAWAL_HISTORY)"
          >
            <span class="submenu-icon">💳</span>
            <span class="submenu-text">{{ t('sidebar.unifiWithdrawalHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.JOURNEY_HISTORY }" 
            @click="handleNavigate(ROUTES.JOURNEY_HISTORY)"
          >
            <span class="submenu-icon">💳</span>
            <span class="submenu-text">{{ t('sidebar.journeyHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.MDX_HISTORY }" 
            @click="handleNavigate(ROUTES.MDX_HISTORY)"
          >
            <span class="submenu-icon">💳</span>
            <span class="submenu-text">{{ t('sidebar.mdxPurchaseHistory') }}</span>
          </div>
        </div>
        <div v-if="menuConfig.showIncomeHistory" class="sidebar-item" @click="toggleIncomeHistorySubmenu">
          <span class="sidebar-icon">🎒</span>
          <span class="sidebar-text">{{ t('sidebar.incomeHistory') }}</span>
          <span class="sidebar-arrow" :class="{ rotated: showIncomeHistorySubmenu }">→</span>
        </div>
        <!-- 收入历史二级菜单 -->
        <div v-if="menuConfig.showIncomeHistory && showIncomeHistorySubmenu" class="submenu">
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.DAILY_BOUNTY_HISTORY }" 
            @click="handleNavigate(ROUTES.DAILY_BOUNTY_HISTORY)"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">{{ t('sidebar.dailyBountyHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.TEAM_BOUNTY_HISTORY }" 
            @click="handleNavigate(ROUTES.TEAM_BOUNTY_HISTORY)"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">{{ t('sidebar.teamBountyHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.RECRUITMENT_BOUNTY_HISTORY }" 
            @click="handleNavigate(ROUTES.RECRUITMENT_BOUNTY_HISTORY)"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">{{ t('sidebar.recruitmentBountyHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.UPGRADE_BOUNTY_HISTORY }" 
            @click="handleNavigate(ROUTES.UPGRADE_BOUNTY_HISTORY)"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">{{ t('sidebar.upgradeBountyHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.UNIFI_RELEASE_HISTORY }" 
            @click="handleNavigate(ROUTES.UNIFI_RELEASE_HISTORY)"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">{{ t('sidebar.unifiReleaseHistory') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.UNIFI_LOCK_HISTORY }" 
            @click="handleNavigate(ROUTES.UNIFI_LOCK_HISTORY)"
          >
            <span class="submenu-icon">💰</span>
            <span class="submenu-text">{{ t('sidebar.unifiLockHistory') }}</span>
          </div>
        </div>
        <div v-if="menuConfig.showTeamOverview"
          class="sidebar-item" 
          :class="{ active: activeRoute === ROUTES.TEAM_OVERVIEW }" 
          @click="handleNavigate(ROUTES.TEAM_OVERVIEW)"
        >
          <span class="sidebar-icon">👥</span>
          <span class="sidebar-text">{{ t('sidebar.teamOverview') }}</span>
          <span class="sidebar-arrow">→</span>
        </div>
        <div v-if="menuConfig.showPassCardManagement"
          class="sidebar-item" 
          :class="{ active: activeRoute === ROUTES.PASS_CARD_MANAGEMENT }" 
          @click="handleNavigate(ROUTES.PASS_CARD_MANAGEMENT)"
        >
          <span class="sidebar-icon">🎒</span>
          <span class="sidebar-text">{{ t('sidebar.passCardManagement') }}</span>
        </div>
        <div v-if="menuConfig.showMidox"
          class="sidebar-item" 
          :class="{ active: activeRoute === ROUTES.MIDOX }"
          @click="handleNavigate(ROUTES.MIDOX)"
        >
          <span class="sidebar-icon midox-icon">M</span>
          <span class="sidebar-text">MIDOX</span>
        </div>
        <div v-if="menuConfig.showMemberCenter"
          class="sidebar-item" 
          :class="{ active: activeRoute === ROUTES.MEMBER_CENTER }" 
          @click="handleNavigate(ROUTES.MEMBER_CENTER)"
        >
          <span class="sidebar-icon">👑</span>
          <span class="sidebar-text">{{ t('sidebar.memberCenter') }}</span>
        </div>
        <div class="sidebar-item" @click="toggleMonthlyReportSubmenu">
          <span class="sidebar-icon">📊</span>
          <span class="sidebar-text">{{ t('sidebar.monthlyReport') }}</span>
          <span class="sidebar-arrow" :class="{ rotated: showMonthlyReportSubmenu }">→</span>
        </div>
        <!-- 月报二级菜单 -->
        <div v-if="showMonthlyReportSubmenu" class="submenu">
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.MONTHLY_REPORT_START }" 
            @click="handleNavigate(ROUTES.MONTHLY_REPORT_START)"
          >
            <span class="submenu-icon">📅</span>
            <span class="submenu-text">{{ t('sidebar.monthlyReportStart') }}</span>
          </div>
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.MONTHLY_REPORT_END }" 
            @click="handleNavigate(ROUTES.MONTHLY_REPORT_END)"
          >
            <span class="submenu-icon">📈</span>
            <span class="submenu-text">{{ t('sidebar.monthlyReportEnd') }}</span>
          </div>
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: activeRoute === ROUTES.BUSINESS_MODEL_CANVAS_LIST || activeRoute === ROUTES.BUSINESS_MODEL_CANVAS_DETAIL }" 
          @click="handleNavigate(ROUTES.BUSINESS_MODEL_CANVAS_LIST)"
        >
          <span class="sidebar-icon">📋</span>
          <span class="sidebar-text">{{ t('sidebar.businessModelCanvas') }}</span>
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: activeRoute === ROUTES.PAYMENT_CONFIG }" 
          @click="handleNavigate(ROUTES.PAYMENT_CONFIG)"
        >
          <span class="sidebar-icon">💳</span>
          <span class="sidebar-text">支付配置</span>
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: activeRoute === ROUTES.CHARACTER_TEST }" 
          @click="handleNavigate(ROUTES.CHARACTER_TEST)"
        >
          <span class="sidebar-icon">📚</span>
          <span class="sidebar-text">{{ t('sidebar.characterTest') }}</span>
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: activeRoute === ROUTES.MATH_TEST }" 
          @click="handleNavigate(ROUTES.MATH_TEST)"
        >
          <span class="sidebar-icon">🔢</span>
          <span class="sidebar-text">数学测试</span>
        </div>
        <div
          v-if="menuConfig.showAttentionTraining"
          class="sidebar-item"
          :class="{ active: attentionActive }"
          @click="toggleAttentionSubmenu"
        >
          <span class="sidebar-icon">🎯</span>
          <span class="sidebar-text">专注力训练</span>
          <span class="sidebar-arrow" :class="{ rotated: showAttentionSubmenu }">→</span>
        </div>
        <div v-if="menuConfig.showAttentionTraining && showAttentionSubmenu" class="submenu">
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.ATTENTION_TRAINING }"
            @click="handleNavigate(ROUTES.ATTENTION_TRAINING)"
          >
            <span class="submenu-icon">📑</span>
            <span class="submenu-text">训练概览</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.ATTENTION_DIGIT_INTRO }"
            @click="handleNavigate(ROUTES.ATTENTION_DIGIT_INTRO)"
          >
            <span class="submenu-icon">🔢</span>
            <span class="submenu-text">数字入门</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.ATTENTION_LETTER_REINFORCE }"
            @click="handleNavigate(ROUTES.ATTENTION_LETTER_REINFORCE)"
          >
            <span class="submenu-icon">🔠</span>
            <span class="submenu-text">字母巩固</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.ATTENTION_IDIOM_ADVANCED }"
            @click="handleNavigate(ROUTES.ATTENTION_IDIOM_ADVANCED)"
          >
            <span class="submenu-icon">📜</span>
            <span class="submenu-text">成语进阶</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.ATTENTION_POETRY_CHALLENGE }"
            @click="handleNavigate(ROUTES.ATTENTION_POETRY_CHALLENGE)"
          >
            <span class="submenu-icon">🖋️</span>
            <span class="submenu-text">诗词挑战</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.ATTENTION_SUDOKU }"
            @click="handleNavigate(ROUTES.ATTENTION_SUDOKU)"
          >
            <span class="submenu-icon">🧩</span>
            <span class="submenu-text">数独</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.ATTENTION_NUMBER_SLIDER }"
            @click="handleNavigate(ROUTES.ATTENTION_NUMBER_SLIDER)"
          >
            <span class="submenu-icon">🎛️</span>
            <span class="submenu-text">数字华容道</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.ATTENTION_PHOTO_MEMORY }"
            @click="handleNavigate(ROUTES.ATTENTION_PHOTO_MEMORY)"
          >
            <span class="submenu-icon">📸</span>
            <span class="submenu-text">照相记忆</span>
          </div>
        </div>
        <div
          v-if="menuConfig.showThinkingModeTraining"
          class="sidebar-item"
          :class="{ active: thinkingActive }"
          @click="toggleThinkingSubmenu"
        >
          <span class="sidebar-icon">🧠</span>
          <span class="sidebar-text">顶级思维模式训练</span>
          <span class="sidebar-arrow" :class="{ rotated: showThinkingSubmenu }">→</span>
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: learningActive }"
          @click="toggleLearningSubmenu"
        >
          <span class="sidebar-icon">📖</span>
          <span class="sidebar-text">学习</span>
          <span class="sidebar-arrow" :class="{ rotated: showLearningSubmenu }">→</span>
        </div>
        <!-- 学习二级菜单 -->
        <div v-if="showLearningSubmenu" class="submenu">
          <div 
            class="submenu-item" 
            :class="{ active: activeRoute === ROUTES.LEARNING_RECORD_LIST }" 
            @click="handleNavigate(ROUTES.LEARNING_RECORD_LIST)"
          >
            <span class="submenu-icon">📝</span>
            <span class="submenu-text">学习记录管理</span>
          </div>
        </div>
        <div v-if="menuConfig.showThinkingModeTraining && showThinkingSubmenu" class="submenu">
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_MODE_TRAINING }"
            @click="handleNavigate(ROUTES.THINKING_MODE_TRAINING)"
          >
            <span class="submenu-icon">📑</span>
            <span class="submenu-text">训练概览</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_5W2H }"
            @click="handleNavigate(ROUTES.THINKING_5W2H)"
          >
            <span class="submenu-icon">❓</span>
            <span class="submenu-text">5W2H分析法</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_DESCARTES }"
            @click="handleNavigate(ROUTES.THINKING_DESCARTES)"
          >
            <span class="submenu-icon">🧮</span>
            <span class="submenu-text">笛卡尔思维模型</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_FEYNMAN }"
            @click="handleNavigate(ROUTES.THINKING_FEYNMAN)"
          >
            <span class="submenu-icon">📚</span>
            <span class="submenu-text">费曼学习法</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_DELIBERATE_PRACTICE }"
            @click="handleNavigate(ROUTES.THINKING_DELIBERATE_PRACTICE)"
          >
            <span class="submenu-icon">🎯</span>
            <span class="submenu-text">刻意练习思维模型</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_SMART }"
            @click="handleNavigate(ROUTES.THINKING_SMART)"
          >
            <span class="submenu-icon">🎪</span>
            <span class="submenu-text">SMART目标模式</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_QUADRANT }"
            @click="handleNavigate(ROUTES.THINKING_QUADRANT)"
          >
            <span class="submenu-icon">📊</span>
            <span class="submenu-text">四象限法则</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_GROW }"
            @click="handleNavigate(ROUTES.THINKING_GROW)"
          >
            <span class="submenu-icon">🌱</span>
            <span class="submenu-text">GROW模型</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_SIX_HATS }"
            @click="handleNavigate(ROUTES.THINKING_SIX_HATS)"
          >
            <span class="submenu-icon">🎩</span>
            <span class="submenu-text">六顶思考帽</span>
          </div>
          <div
            class="submenu-item"
            :class="{ active: activeRoute === ROUTES.THINKING_BRAINSTORMING }"
            @click="handleNavigate(ROUTES.THINKING_BRAINSTORMING)"
          >
            <span class="submenu-icon">💡</span>
            <span class="submenu-text">头脑风暴法</span>
          </div>
        </div>
        <div class="sidebar-item logout" @click="handleLogout">
          <span class="sidebar-icon">🚪</span>
          <span class="sidebar-text">{{ t('sidebar.logout') }}</span>
        </div>
      </div>
    </aside>

    <!-- 侧边栏遮罩 -->
    <div class="sidebar-overlay" v-if="isOpen" @click="handleClose"></div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'
import { menuConfig } from '../../config/menu.js'

const { t } = useI18n()

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
const showVaultHistorySubmenu = ref(false)
const showIncomeHistorySubmenu = ref(false)
const showMonthlyReportSubmenu = ref(false)
const showAttentionSubmenu = ref(false)
const showThinkingSubmenu = ref(false)
const showLearningSubmenu = ref(false)

const attentionRoutes = [
  ROUTES.ATTENTION_TRAINING,
  ROUTES.ATTENTION_DIGIT_INTRO,
  ROUTES.ATTENTION_LETTER_REINFORCE,
  ROUTES.ATTENTION_IDIOM_ADVANCED,
  ROUTES.ATTENTION_POETRY_CHALLENGE,
  ROUTES.ATTENTION_SUDOKU,
  ROUTES.ATTENTION_NUMBER_SLIDER,
  ROUTES.ATTENTION_PHOTO_MEMORY
]

const attentionActive = computed(() => attentionRoutes.includes(props.activeRoute))

const thinkingRoutes = [
  ROUTES.THINKING_MODE_TRAINING,
  ROUTES.THINKING_5W2H,
  ROUTES.THINKING_DESCARTES,
  ROUTES.THINKING_FEYNMAN,
  ROUTES.THINKING_DELIBERATE_PRACTICE,
  ROUTES.THINKING_SMART,
  ROUTES.THINKING_QUADRANT,
  ROUTES.THINKING_GROW,
  ROUTES.THINKING_SIX_HATS,
  ROUTES.THINKING_BRAINSTORMING
]

const thinkingActive = computed(() => thinkingRoutes.includes(props.activeRoute))

const learningRoutes = [
  ROUTES.LEARNING_STEPS,
  ROUTES.LEARNING_RECORD_LIST
]

const learningActive = computed(() => learningRoutes.includes(props.activeRoute))

// 监听 activeRoute，如果当前路由是 journey 或 upgrade-bounty，自动展开二级菜单
watch(() => props.activeRoute, (newRoute) => {
  if (newRoute === ROUTES.JOURNEY || newRoute === ROUTES.UPGRADE_BOUNTY) {
    showJourneySubmenu.value = true
  }
  if (newRoute === ROUTES.DEPOSIT || newRoute === ROUTES.VT_WALLET || newRoute === ROUTES.UNIFI_WALLET) {
    showVaultSubmenu.value = true
  }
  if (newRoute === ROUTES.WALLET_HISTORY || newRoute === ROUTES.DEPOSIT_HISTORY || 
      newRoute === ROUTES.WITHDRAWAL_HISTORY || newRoute === ROUTES.UNIFI_WITHDRAWAL_HISTORY ||
      newRoute === ROUTES.JOURNEY_HISTORY || newRoute === ROUTES.MDX_HISTORY) {
    showVaultHistorySubmenu.value = true
  }
  if (newRoute === ROUTES.DAILY_BOUNTY_HISTORY || newRoute === ROUTES.TEAM_BOUNTY_HISTORY ||
      newRoute === ROUTES.RECRUITMENT_BOUNTY_HISTORY || newRoute === ROUTES.UPGRADE_BOUNTY_HISTORY ||
      newRoute === ROUTES.UNIFI_RELEASE_HISTORY || newRoute === ROUTES.UNIFI_LOCK_HISTORY) {
    showIncomeHistorySubmenu.value = true
  }
  if (newRoute === ROUTES.MONTHLY_REPORT_START || newRoute === ROUTES.MONTHLY_REPORT_END) {
    showMonthlyReportSubmenu.value = true
  }
  if (attentionRoutes.includes(newRoute)) {
    showAttentionSubmenu.value = true
  }
  if (thinkingRoutes.includes(newRoute)) {
    showThinkingSubmenu.value = true
  }
  if (learningRoutes.includes(newRoute)) {
    showLearningSubmenu.value = true
  }
}, { immediate: true })

const toggleJourneySubmenu = () => {
  showJourneySubmenu.value = !showJourneySubmenu.value
}

const toggleVaultSubmenu = () => {
  showVaultSubmenu.value = !showVaultSubmenu.value
}

const toggleVaultHistorySubmenu = () => {
  showVaultHistorySubmenu.value = !showVaultHistorySubmenu.value
}

const toggleIncomeHistorySubmenu = () => {
  showIncomeHistorySubmenu.value = !showIncomeHistorySubmenu.value
}

const toggleMonthlyReportSubmenu = () => {
  showMonthlyReportSubmenu.value = !showMonthlyReportSubmenu.value
}

const toggleAttentionSubmenu = () => {
  showAttentionSubmenu.value = !showAttentionSubmenu.value
}

const toggleThinkingSubmenu = () => {
  showThinkingSubmenu.value = !showThinkingSubmenu.value
}

const toggleLearningSubmenu = () => {
  showLearningSubmenu.value = !showLearningSubmenu.value
}

const handleNavigate = (route) => {
  if (route === ROUTES.JOURNEY || route === ROUTES.UPGRADE_BOUNTY) {
    showJourneySubmenu.value = false
  }
  if (route === ROUTES.DEPOSIT || route === ROUTES.VT_WALLET || route === ROUTES.UNIFI_WALLET) {
    showVaultSubmenu.value = false
  }
  if (route === ROUTES.WALLET_HISTORY || route === ROUTES.DEPOSIT_HISTORY || 
      route === ROUTES.WITHDRAWAL_HISTORY || route === ROUTES.UNIFI_WITHDRAWAL_HISTORY ||
      route === ROUTES.JOURNEY_HISTORY || route === ROUTES.MDX_HISTORY) {
    showVaultHistorySubmenu.value = false
  }
  if (route === ROUTES.DAILY_BOUNTY_HISTORY || route === ROUTES.TEAM_BOUNTY_HISTORY ||
      route === ROUTES.RECRUITMENT_BOUNTY_HISTORY || route === ROUTES.UPGRADE_BOUNTY_HISTORY ||
      route === ROUTES.UNIFI_RELEASE_HISTORY || route === ROUTES.UNIFI_LOCK_HISTORY) {
    showIncomeHistorySubmenu.value = false
  }
  if (route === ROUTES.MONTHLY_REPORT_START || route === ROUTES.MONTHLY_REPORT_END) {
    showMonthlyReportSubmenu.value = false
  }
  if (attentionRoutes.includes(route)) {
    showAttentionSubmenu.value = false
  }
  if (thinkingRoutes.includes(route)) {
    showThinkingSubmenu.value = false
  }
  if (learningRoutes.includes(route)) {
    showLearningSubmenu.value = false
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
  } else if (route === ROUTES.WALLET_HISTORY) {
    router.goToWalletHistory()
  } else if (route === ROUTES.DEPOSIT_HISTORY) {
    router.goToDepositHistory()
  } else if (route === ROUTES.WITHDRAWAL_HISTORY) {
    router.goToWithdrawalHistory()
  } else if (route === ROUTES.UNIFI_WITHDRAWAL_HISTORY) {
    router.goToUnifiWithdrawalHistory()
  } else if (route === ROUTES.JOURNEY_HISTORY) {
    router.goToJourneyHistory()
  } else if (route === ROUTES.MDX_HISTORY) {
    router.goToMdxHistory()
  } else if (route === ROUTES.DAILY_BOUNTY_HISTORY) {
    router.goToDailyBountyHistory()
  } else if (route === ROUTES.TEAM_BOUNTY_HISTORY) {
    router.goToTeamBountyHistory()
  } else if (route === ROUTES.RECRUITMENT_BOUNTY_HISTORY) {
    router.goToRecruitmentBountyHistory()
  } else if (route === ROUTES.UPGRADE_BOUNTY_HISTORY) {
    router.goToUpgradeBountyHistory()
  } else if (route === ROUTES.UNIFI_RELEASE_HISTORY) {
    router.goToUnifiReleaseHistory()
  } else if (route === ROUTES.UNIFI_LOCK_HISTORY) {
    router.goToUnifiLockHistory()
  } else if (route === ROUTES.TEAM_OVERVIEW) {
    router.goToTeamOverview()
  } else if (route === ROUTES.PASS_CARD_MANAGEMENT) {
    router.goToPassCardManagement()
  } else if (route === ROUTES.MIDOX || route === 'midox') {
    router.goToMidox()
  } else if (route === ROUTES.MEMBER_CENTER) {
    router.goToMemberCenter()
  } else if (route === ROUTES.MONTHLY_REPORT_START) {
    router.goToMonthlyReportStart()
  } else if (route === ROUTES.MONTHLY_REPORT_END) {
    router.goToMonthlyReportEnd()
  } else if (route === ROUTES.BUSINESS_MODEL_CANVAS_LIST) {
    router.goToBusinessModelCanvasList()
  } else if (route === ROUTES.BUSINESS_MODEL_CANVAS_DETAIL) {
    router.goToBusinessModelCanvasDetail()
  } else if (route === ROUTES.PAYMENT_CONFIG) {
    router.goToPaymentConfig()
  } else if (route === ROUTES.ALIPAY_WEB_SITE) {
    router.goToAlipayWebSite()
  } else if (route === ROUTES.ALIPAY_MOBILE_SITE) {
    router.goToAlipayMobileSite()
  } else if (route === ROUTES.ALIPAY_PRE_CREATE) {
    router.goToAlipayPreCreate()
  } else if (route === ROUTES.ALIPAY_PAY) {
    router.goToAlipayPay()
  } else if (route === ROUTES.ALIPAY_QUERY) {
    router.goToAlipayQuery()
  } else if (route === ROUTES.ALIPAY_REFUND) {
    router.goToAlipayRefund()
  } else if (route === ROUTES.ALIPAY_CANCEL) {
    router.goToAlipayCancel()
  } else if (route === ROUTES.WECHAT_UNIFIED_ORDER) {
    router.goToWechatUnifiedOrder()
  } else if (route === ROUTES.WECHAT_MICRO_PAY) {
    router.goToWechatMicroPay()
  } else if (route === ROUTES.WECHAT_QUERY) {
    router.goToWechatQuery()
  } else if (route === ROUTES.WECHAT_REFUND) {
    router.goToWechatRefund()
  } else if (route === ROUTES.WECHAT_CLOSE_ORDER) {
    router.goToWechatCloseOrder()
  } else if (route === ROUTES.BESTPAY_BARCODE) {
    router.goToBestpayBarcode()
  } else if (route === ROUTES.BESTPAY_QUERY) {
    router.goToBestpayQuery()
  } else if (route === ROUTES.BESTPAY_REFUND) {
    router.goToBestpayRefund()
  } else if (route === ROUTES.BESTPAY_REVERSE) {
    router.goToBestpayReverse()
  } else if (route === ROUTES.CHARACTER_TEST) {
    router.goToCharacterTest()
  } else if (route === ROUTES.MATH_TEST) {
    router.goToMathTest()
  } else if (route === ROUTES.ATTENTION_TRAINING) {
    router.goToAttentionTraining()
  } else if (route === ROUTES.ATTENTION_DIGIT_INTRO) {
    router.goToAttentionDigitIntro()
  } else if (route === ROUTES.ATTENTION_LETTER_REINFORCE) {
    router.goToAttentionLetterReinforce()
  } else if (route === ROUTES.ATTENTION_IDIOM_ADVANCED) {
    router.goToAttentionIdiomAdvanced()
  } else if (route === ROUTES.ATTENTION_POETRY_CHALLENGE) {
    router.goToAttentionPoetryChallenge()
  } else if (route === ROUTES.ATTENTION_SUDOKU) {
    router.goToAttentionSudoku()
  } else if (route === ROUTES.ATTENTION_NUMBER_SLIDER) {
    router.goToAttentionNumberSlider()
  } else if (route === ROUTES.ATTENTION_PHOTO_MEMORY) {
    router.goToAttentionPhotoMemory()
  } else if (route === ROUTES.THINKING_MODE_TRAINING) {
    router.goToThinkingModeTraining()
  } else if (route === ROUTES.THINKING_5W2H) {
    router.goToThinking5W2H()
  } else if (route === ROUTES.THINKING_DESCARTES) {
    router.goToThinkingDescartes()
  } else if (route === ROUTES.THINKING_FEYNMAN) {
    router.goToThinkingFeynman()
  } else if (route === ROUTES.THINKING_DELIBERATE_PRACTICE) {
    router.goToThinkingDeliberatePractice()
  } else if (route === ROUTES.THINKING_SMART) {
    router.goToThinkingSmart()
  } else if (route === ROUTES.THINKING_QUADRANT) {
    router.goToThinkingQuadrant()
  } else if (route === ROUTES.THINKING_GROW) {
    router.goToThinkingGrow()
  } else if (route === ROUTES.THINKING_SIX_HATS) {
    router.goToThinkingSixHats()
  } else if (route === ROUTES.THINKING_BRAINSTORMING) {
    router.goToThinkingBrainstorming()
  } else if (route === ROUTES.LEARNING_RECORD_LIST) {
    // 学习记录管理：不传 templateId，显示模板选择界面
    // router.goToLearningRecordList(null)
    router.goToLearningMethodology()
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

.submenu-divider {
  height: 1px;
  background: rgba(255, 215, 0, 0.2);
  margin: 8px 20px;
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

