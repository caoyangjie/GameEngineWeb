import { ref, provide, inject } from 'vue'

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
  UPGRADE_BOUNTY: 'upgrade-bounty',
  DEPOSIT: 'deposit',
  VT_WALLET: 'vt-wallet',
  UNIFI_WALLET: 'unifi-wallet',
  WALLET_HISTORY: 'wallet-history',
  DEPOSIT_HISTORY: 'deposit-history',
  WITHDRAWAL_HISTORY: 'withdrawal-history',
  UNIFI_WITHDRAWAL_HISTORY: 'unifi-withdrawal-history',
  JOURNEY_HISTORY: 'journey-history',
  MDX_PURCHASE_RECORD: 'mdx-purchase-record'
}

/**
 * 创建路由实例（在 App.vue 中使用）
 */
export function createRouter(initialRoute = ROUTES.LOGIN) {
  const currentRoute = ref(initialRoute)

  const router = {
    // 当前路由
    currentRoute,
    
    // 导航到指定路由
    navigate(route) {
      if (Object.values(ROUTES).includes(route)) {
        currentRoute.value = route
      } else {
        console.warn(`Unknown route: ${route}`)
      }
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
    goToUpgradeBounty() {
      this.navigate(ROUTES.UPGRADE_BOUNTY)
    },
    goToDeposit() {
      this.navigate(ROUTES.DEPOSIT)
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
    goToMdxPurchaseRecord() {
      this.navigate(ROUTES.MDX_PURCHASE_RECORD)
    },
    
    // 登出（跳转到登录页）
    logout() {
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

