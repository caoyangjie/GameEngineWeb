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
  MEMBER_CENTER: 'member-center',
  MONTHLY_REPORT_START: 'monthly-report-start',
  MONTHLY_REPORT_END: 'monthly-report-end',
  BUSINESS_MODEL_CANVAS_LIST: 'business-model-canvas-list',
  BUSINESS_MODEL_CANVAS_DETAIL: 'business-model-canvas-detail',
  PERSONA_LIST: 'persona-list',
  PERSONA_DETAIL: 'persona-detail',
  SCENARIO_LIST: 'scenario-list',
  REQUIREMENT_LIST: 'requirement-list',
  // 支付管理
  PAYMENT_CONFIG: 'payment-config',
  ALIPAY_WEB_SITE: 'alipay-web-site',
  ALIPAY_MOBILE_SITE: 'alipay-mobile-site',
  ALIPAY_PRE_CREATE: 'alipay-pre-create',
  ALIPAY_PAY: 'alipay-pay',
  ALIPAY_QUERY: 'alipay-query',
  ALIPAY_REFUND: 'alipay-refund',
  ALIPAY_CANCEL: 'alipay-cancel',
  WECHAT_UNIFIED_ORDER: 'wechat-unified-order',
  WECHAT_MICRO_PAY: 'wechat-micro-pay',
  WECHAT_QUERY: 'wechat-query',
  WECHAT_REFUND: 'wechat-refund',
  WECHAT_CLOSE_ORDER: 'wechat-close-order',
  BESTPAY_BARCODE: 'bestpay-barcode',
  BESTPAY_QUERY: 'bestpay-query',
  BESTPAY_REFUND: 'bestpay-refund',
  BESTPAY_REVERSE: 'bestpay-reverse',
  CHARACTER_TEST: 'character-test',
  MATH_TEST: 'math-test',
  // 专注力训练
  ATTENTION_TRAINING: 'attention-training',
  ATTENTION_DIGIT_INTRO: 'attention-digit-intro',
  ATTENTION_LETTER_REINFORCE: 'attention-letter-reinforce',
  ATTENTION_IDIOM_ADVANCED: 'attention-idiom-advanced',
  ATTENTION_POETRY_CHALLENGE: 'attention-poetry-challenge',
  ATTENTION_SUDOKU: 'attention-sudoku',
  ATTENTION_NUMBER_SLIDER: 'attention-number-slider',
  ATTENTION_PHOTO_MEMORY: 'attention-photo-memory',
  ATTENTION_NUMBER_MEMORY_CODE: 'attention-number-memory-code',
  ATTENTION_NUMBER_FAX: 'attention-number-fax'
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
    goToMonthlyReportStart() {
      this.navigate(ROUTES.MONTHLY_REPORT_START)
    },
    goToMonthlyReportEnd() {
      this.navigate(ROUTES.MONTHLY_REPORT_END)
    },
    goToBusinessModelCanvasList() {
      this.navigate(ROUTES.BUSINESS_MODEL_CANVAS_LIST)
    },
    goToBusinessModelCanvasDetail() {
      this.navigate(ROUTES.BUSINESS_MODEL_CANVAS_DETAIL)
    },
    goToPersonaList() {
      this.navigate(ROUTES.PERSONA_LIST)
    },
    goToPersonaDetail() {
      this.navigate(ROUTES.PERSONA_DETAIL)
    },
    goToScenarioList() {
      this.navigate(ROUTES.SCENARIO_LIST)
    },
    goToRequirementList() {
      this.navigate(ROUTES.REQUIREMENT_LIST)
    },
    // 支付管理
    goToPaymentConfig() {
      this.navigate(ROUTES.PAYMENT_CONFIG)
    },
    goToAlipayWebSite() {
      this.navigate(ROUTES.ALIPAY_WEB_SITE)
    },
    goToAlipayMobileSite() {
      this.navigate(ROUTES.ALIPAY_MOBILE_SITE)
    },
    goToAlipayPreCreate() {
      this.navigate(ROUTES.ALIPAY_PRE_CREATE)
    },
    goToAlipayPay() {
      this.navigate(ROUTES.ALIPAY_PAY)
    },
    goToAlipayQuery() {
      this.navigate(ROUTES.ALIPAY_QUERY)
    },
    goToAlipayRefund() {
      this.navigate(ROUTES.ALIPAY_REFUND)
    },
    goToAlipayCancel() {
      this.navigate(ROUTES.ALIPAY_CANCEL)
    },
    goToWechatUnifiedOrder() {
      this.navigate(ROUTES.WECHAT_UNIFIED_ORDER)
    },
    goToWechatMicroPay() {
      this.navigate(ROUTES.WECHAT_MICRO_PAY)
    },
    goToWechatQuery() {
      this.navigate(ROUTES.WECHAT_QUERY)
    },
    goToWechatRefund() {
      this.navigate(ROUTES.WECHAT_REFUND)
    },
    goToWechatCloseOrder() {
      this.navigate(ROUTES.WECHAT_CLOSE_ORDER)
    },
    goToBestpayBarcode() {
      this.navigate(ROUTES.BESTPAY_BARCODE)
    },
    goToBestpayQuery() {
      this.navigate(ROUTES.BESTPAY_QUERY)
    },
    goToBestpayRefund() {
      this.navigate(ROUTES.BESTPAY_REFUND)
    },
    goToBestpayReverse() {
      this.navigate(ROUTES.BESTPAY_REVERSE)
    },
    goToCharacterTest() {
      this.navigate(ROUTES.CHARACTER_TEST)
    },
    goToMathTest() {
      this.navigate(ROUTES.MATH_TEST)
    },
    // 专注力训练
    goToAttentionTraining() {
      this.navigate(ROUTES.ATTENTION_TRAINING)
    },
    goToAttentionDigitIntro() {
      this.navigate(ROUTES.ATTENTION_DIGIT_INTRO)
    },
    goToAttentionLetterReinforce() {
      this.navigate(ROUTES.ATTENTION_LETTER_REINFORCE)
    },
    goToAttentionIdiomAdvanced() {
      this.navigate(ROUTES.ATTENTION_IDIOM_ADVANCED)
    },
    goToAttentionPoetryChallenge() {
      this.navigate(ROUTES.ATTENTION_POETRY_CHALLENGE)
    },
    goToAttentionSudoku() {
      this.navigate(ROUTES.ATTENTION_SUDOKU)
    },
    goToAttentionNumberSlider() {
      this.navigate(ROUTES.ATTENTION_NUMBER_SLIDER)
    },
    goToAttentionPhotoMemory() {
      this.navigate(ROUTES.ATTENTION_PHOTO_MEMORY)
    },
    goToAttentionNumberMemoryCode() {
      this.navigate(ROUTES.ATTENTION_NUMBER_MEMORY_CODE)
    },
    goToAttentionNumberFax() {
      this.navigate(ROUTES.ATTENTION_NUMBER_FAX)
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

