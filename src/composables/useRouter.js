import { ref, provide, inject } from 'vue'
import { isAuthenticated, removeToken } from '../utils/auth.js'

// 路由键，用于 provide/inject
const ROUTER_KEY = Symbol('router')

// 定义所有可用的路由
export const ROUTES = {
  LOGIN: 'login',
  FORGOT: 'forgot',
  REGISTER: 'register',
  HOME: 'home',
  PROFILE: 'profile',
  TASKS: 'tasks',
  JOURNEY: 'journey',
  JOURNEY_DETAILS: 'journey-details',
  UPGRADE_BOUNTY: 'upgrade-bounty',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  VT_WALLET: 'vt-wallet',
  UNIFI_WALLET: 'unifi-wallet',
  WALLET_HISTORY: 'wallet-history',
  DEPOSIT_HISTORY: 'deposit-history',
  WITHDRAWAL_HISTORY: 'withdrawal-history',
  UNIFI_WITHDRAWAL_HISTORY: 'unifi-withdrawal-history',
  JOURNEY_HISTORY: 'journey-history',
  MDX_HISTORY: 'mdx-history',
  DAILY_BOUNTY_HISTORY: 'daily-bounty-history',
  TEAM_BOUNTY_HISTORY: 'team-bounty-history',
  RECRUITMENT_BOUNTY_HISTORY: 'recruitment-bounty-history',
  UPGRADE_BOUNTY_HISTORY: 'upgrade-bounty-history',
  UNIFI_RELEASE_HISTORY: 'unifi-release-history',
  UNIFI_LOCK_HISTORY: 'unifi-lock-history',
  TEAM_OVERVIEW: 'team-overview',
  PASS_CARD_MANAGEMENT: 'pass-card-management',
  MIDOX: 'midox',
  VIP_CARD_APPLICATION: 'vip-card-application',
  MEMBER_CENTER: 'member-center'
}

// 不需要登录的路由
const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.FORGOT, ROUTES.REGISTER]

/**
 * 创建路由实例（在 App.vue 中使用）
 */
export function createRouter(initialRoute = ROUTES.LOGIN) {
  const currentRoute = ref(initialRoute)

  const router = {
    // 当前路由
    currentRoute,
    
    // 导航到指定路由（带路由守卫）
    navigate(route) {
      if (!Object.values(ROUTES).includes(route)) {
        console.warn(`Unknown route: ${route}`)
        return false
      }
      
      // 路由守卫：检查是否需要登录
      if (!PUBLIC_ROUTES.includes(route) && !isAuthenticated()) {
        // 未登录，跳转到登录页
        console.warn('未登录，跳转到登录页')
        currentRoute.value = ROUTES.LOGIN
        return false
      }
      
      // 如果已登录，访问登录页则跳转到首页
      if (route === ROUTES.LOGIN && isAuthenticated()) {
        currentRoute.value = ROUTES.HOME
        return true
      }
      
      currentRoute.value = route
      return true
    },
    
    // 便捷导航方法
    goToLogin() {
      this.navigate(ROUTES.LOGIN)
    },
    goToForgot() {
      this.navigate(ROUTES.FORGOT)
    },
    goToRegister() {
      this.navigate(ROUTES.REGISTER)
    },
    goToHome() {
      this.navigate(ROUTES.HOME)
    },
    goToProfile() {
      this.navigate(ROUTES.PROFILE)
    },
    goToTasks() {
      this.navigate(ROUTES.TASKS)
    },
    goToJourney() {
      this.navigate(ROUTES.JOURNEY)
    },
    goToJourneyDetails() {
      this.navigate(ROUTES.JOURNEY_DETAILS)
    },
    goToUpgradeBounty() {
      this.navigate(ROUTES.UPGRADE_BOUNTY)
    },
    goToDeposit() {
      this.navigate(ROUTES.DEPOSIT)
    },
    goToWithdrawal() {
      this.navigate(ROUTES.WITHDRAWAL)
    },
    goToVTWallet() {
      this.navigate(ROUTES.VT_WALLET)
    },
    goToUnifiWallet() {
      this.navigate(ROUTES.UNIFI_WALLET)
    },
    goToWalletHistory() {
      this.navigate(ROUTES.WALLET_HISTORY)
    },
    goToDepositHistory() {
      this.navigate(ROUTES.DEPOSIT_HISTORY)
    },
    goToWithdrawalHistory() {
      this.navigate(ROUTES.WITHDRAWAL_HISTORY)
    },
    goToUnifiWithdrawalHistory() {
      this.navigate(ROUTES.UNIFI_WITHDRAWAL_HISTORY)
    },
    goToJourneyHistory() {
      this.navigate(ROUTES.JOURNEY_HISTORY)
    },
    goToMdxHistory() {
      this.navigate(ROUTES.MDX_HISTORY)
    },
    goToDailyBountyHistory() {
      this.navigate(ROUTES.DAILY_BOUNTY_HISTORY)
    },
    goToTeamBountyHistory() {
      this.navigate(ROUTES.TEAM_BOUNTY_HISTORY)
    },
    goToRecruitmentBountyHistory() {
      this.navigate(ROUTES.RECRUITMENT_BOUNTY_HISTORY)
    },
    goToUpgradeBountyHistory() {
      this.navigate(ROUTES.UPGRADE_BOUNTY_HISTORY)
    },
    goToUnifiReleaseHistory() {
      this.navigate(ROUTES.UNIFI_RELEASE_HISTORY)
    },
    goToUnifiLockHistory() {
      this.navigate(ROUTES.UNIFI_LOCK_HISTORY)
    },
    goToTeamOverview() {
      this.navigate(ROUTES.TEAM_OVERVIEW)
    },
    goToPassCardManagement() {
      this.navigate(ROUTES.PASS_CARD_MANAGEMENT)
    },
    goToMidox() {
      this.navigate(ROUTES.MIDOX)
    },
    goToVipCardApplication() {
      this.navigate(ROUTES.VIP_CARD_APPLICATION)
    },
    
    goToMemberCenter() {
      this.navigate(ROUTES.MEMBER_CENTER)
    },
    
    // 登出（跳转到登录页）
    logout() {
      // 清除 token 和用户信息
      removeToken()
      this.navigate(ROUTES.LOGIN)
    },
    
    // 检查当前路由
    isRoute(route) {
      return currentRoute.value === route
    }
  }

  // 提供路由实例给子组件
  provide(ROUTER_KEY, router)

  return router
}

/**
 * 使用路由（在子组件中使用）
 */
export function useRouter() {
  const router = inject(ROUTER_KEY)
  
  if (!router) {
    throw new Error('useRouter must be used within a component that has access to router. Make sure createRouter is called in App.vue')
  }
  
  return router
}

