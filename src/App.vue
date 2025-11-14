<template>
  <div id="app">
    <LoginPage v-if="router.currentRoute.value === ROUTES.LOGIN" />
    <ForgotPasswordPage v-if="router.currentRoute.value === ROUTES.FORGOT" />
    <RegisterPage v-if="router.currentRoute.value === ROUTES.REGISTER" />
    <HomePage v-if="router.currentRoute.value === ROUTES.HOME" />
    <ProfilePage v-if="router.currentRoute.value === ROUTES.PROFILE" />
    <TaskLogPage v-if="router.currentRoute.value === ROUTES.TASKS" />
    <JourneyPage v-if="router.currentRoute.value === ROUTES.JOURNEY" />
    <JourneyDetailsPage v-if="router.currentRoute.value === ROUTES.JOURNEY_DETAILS" />
    <UpgradeBountyPage v-if="router.currentRoute.value === ROUTES.UPGRADE_BOUNTY" />
    <DepositPage v-if="router.currentRoute.value === ROUTES.DEPOSIT" />
    <VTWalletPage v-if="router.currentRoute.value === ROUTES.VT_WALLET" />
    <UNIFIWalletPage v-if="router.currentRoute.value === ROUTES.UNIFI_WALLET" />
    <WalletHistoryPage v-if="router.currentRoute.value === ROUTES.WALLET_HISTORY" />
    <DepositHistoryPage v-if="router.currentRoute.value === ROUTES.DEPOSIT_HISTORY" />
    <WithdrawalHistoryPage v-if="router.currentRoute.value === ROUTES.WITHDRAWAL_HISTORY" />
    <UNIFIWithdrawalHistoryPage v-if="router.currentRoute.value === ROUTES.UNIFI_WITHDRAWAL_HISTORY" />
    <JourneyHistoryPage v-if="router.currentRoute.value === ROUTES.JOURNEY_HISTORY" />
    <MdxHistoryPage v-if="router.currentRoute.value === ROUTES.MDX_HISTORY" />
    <DailyBountyHistoryPage v-if="router.currentRoute.value === ROUTES.DAILY_BOUNTY_HISTORY" />
    <TeamBountyHistoryPage v-if="router.currentRoute.value === ROUTES.TEAM_BOUNTY_HISTORY" />
    <RecruitmentBountyHistoryPage v-if="router.currentRoute.value === ROUTES.RECRUITMENT_BOUNTY_HISTORY" />
    <UpgradeBountyHistoryPage v-if="router.currentRoute.value === ROUTES.UPGRADE_BOUNTY_HISTORY" />
    <UnifiReleaseHistoryPage v-if="router.currentRoute.value === ROUTES.UNIFI_RELEASE_HISTORY" />
    <UnifiLockHistoryPage v-if="router.currentRoute.value === ROUTES.UNIFI_LOCK_HISTORY" />
    <TeamOverviewPage v-if="router.currentRoute.value === ROUTES.TEAM_OVERVIEW" />
    <PassCardManagementPage v-if="router.currentRoute.value === ROUTES.PASS_CARD_MANAGEMENT" />
    <MidoxPage v-if="router.currentRoute.value === ROUTES.MIDOX" />
    <VipCardApplicationPage v-if="router.currentRoute.value === ROUTES.VIP_CARD_APPLICATION" />
    <MemberCenterPage v-if="router.currentRoute.value === ROUTES.MEMBER_CENTER" />
    <MonthlyReportStartPage v-if="router.currentRoute.value === ROUTES.MONTHLY_REPORT_START" />
    <MonthlyReportEndPage v-if="router.currentRoute.value === ROUTES.MONTHLY_REPORT_END" />
    <BusinessModelCanvasListPage v-if="router.currentRoute.value === ROUTES.BUSINESS_MODEL_CANVAS_LIST" />
    <BusinessModelCanvasDetailPage v-if="router.currentRoute.value === ROUTES.BUSINESS_MODEL_CANVAS_DETAIL" />
    <PersonaListPage v-if="router.currentRoute.value === ROUTES.PERSONA_LIST" />
    <PersonaDetailPage v-if="router.currentRoute.value === ROUTES.PERSONA_DETAIL" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import LoginPage from './components/auth/LoginPage.vue'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage.vue'
import RegisterPage from './components/auth/RegisterPage.vue'
import HomePage from './components/home/HomePage.vue'
import ProfilePage from './components/profile/ProfilePage.vue'
import TaskLogPage from './components/task/TaskLogPage.vue'
import JourneyPage from './components/journey/JourneyPage.vue'
import JourneyDetailsPage from './components/journey/JourneyDetailsPage.vue'
import UpgradeBountyPage from './components/journey/UpgradeBountyPage.vue'
import DepositPage from './components/wallet/DepositPage.vue'
import VTWalletPage from './components/wallet/VTWalletPage.vue'
import UNIFIWalletPage from './components/wallet/UNIFIWalletPage.vue'
import WalletHistoryPage from './components/vaultHistory/WalletHistoryPage.vue'
import DepositHistoryPage from './components/vaultHistory/DepositHistoryPage.vue'
import WithdrawalHistoryPage from './components/vaultHistory/WithdrawalHistoryPage.vue'
import UNIFIWithdrawalHistoryPage from './components/vaultHistory/UNIFIWithdrawalHistoryPage.vue'
import JourneyHistoryPage from './components/vaultHistory/JourneyHistoryPage.vue'
import MdxHistoryPage from './components/vaultHistory/MdxHistoryPage.vue'
import DailyBountyHistoryPage from './components/incomeHistory/DailyBountyHistoryPage.vue'
import TeamBountyHistoryPage from './components/incomeHistory/TeamBountyHistoryPage.vue'
import RecruitmentBountyHistoryPage from './components/incomeHistory/RecruitmentBountyHistoryPage.vue'
import UpgradeBountyHistoryPage from './components/incomeHistory/UpgradeBountyHistoryPage.vue'
import UnifiReleaseHistoryPage from './components/incomeHistory/UnifiReleaseHistoryPage.vue'
import UnifiLockHistoryPage from './components/incomeHistory/UnifiLockHistoryPage.vue'
import TeamOverviewPage from './components/team/TeamOverviewPage.vue'
import PassCardManagementPage from './components/passCard/PassCardManagementPage.vue'
import MidoxPage from './components/midox/MidoxPage.vue'
import VipCardApplicationPage from './components/vipCard/VipCardApplicationPage.vue'
import MemberCenterPage from './components/member/MemberCenterPage.vue'
import MonthlyReportStartPage from './components/monthlyReport/MonthlyReportStartPage.vue'
import MonthlyReportEndPage from './components/monthlyReport/MonthlyReportEndPage.vue'
import BusinessModelCanvasListPage from './components/businessModelCanvas/BusinessModelCanvasListPage.vue'
import BusinessModelCanvasDetailPage from './components/businessModelCanvas/BusinessModelCanvasDetailPage.vue'
import PersonaListPage from './components/persona/PersonaListPage.vue'
import PersonaDetailPage from './components/persona/PersonaDetailPage.vue'
import { createRouter, ROUTES } from './composables/useRouter.js'
import { isAuthenticated } from './utils/auth.js'

// 创建路由实例
const router = createRouter()

// 初始化路由：根据登录状态决定初始路由
onMounted(() => {
  // 将 router 挂载到 window，供 request.js 使用
  window.router = router
  
  // 如果已登录，跳转到首页；否则跳转到登录页
  if (isAuthenticated()) {
    router.goToHome()
  } else {
    router.goToLogin()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

