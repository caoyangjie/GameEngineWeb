<template>
  <div id="app">
    <LoginPage v-if="router.currentRoute.value === ROUTES.LOGIN" />
    <ForgotPasswordPage v-if="router.currentRoute.value === ROUTES.FORGOT" />
    <RegisterPage v-if="router.currentRoute.value === ROUTES.REGISTER" />
    <HomePage v-if="router.currentRoute.value === ROUTES.HOME" />
    <ProfilePage v-if="router.currentRoute.value === ROUTES.PROFILE" />
    <TaskLogPage v-if="router.currentRoute.value === ROUTES.TASKS" />
    <JourneyPage v-if="router.currentRoute.value === ROUTES.JOURNEY" />
    <UpgradeBountyPage v-if="router.currentRoute.value === ROUTES.UPGRADE_BOUNTY" />
    <DepositPage v-if="router.currentRoute.value === ROUTES.DEPOSIT" />
    <VTWalletPage v-if="router.currentRoute.value === ROUTES.VT_WALLET" />
    <UNIFIWalletPage v-if="router.currentRoute.value === ROUTES.UNIFI_WALLET" />
    <WalletHistoryPage v-if="router.currentRoute.value === ROUTES.WALLET_HISTORY" />
    <DepositHistoryPage v-if="router.currentRoute.value === ROUTES.DEPOSIT_HISTORY" />
    <WithdrawalHistoryPage v-if="router.currentRoute.value === ROUTES.WITHDRAWAL_HISTORY" />
    <UNIFIWithdrawalHistoryPage v-if="router.currentRoute.value === ROUTES.UNIFI_WITHDRAWAL_HISTORY" />
    <JourneyHistoryPage v-if="router.currentRoute.value === ROUTES.JOURNEY_HISTORY" />
  </div>
</template>

<script setup>
import LoginPage from './components/LoginPage.vue'
import ForgotPasswordPage from './components/ForgotPasswordPage.vue'
import RegisterPage from './components/RegisterPage.vue'
import HomePage from './components/HomePage.vue'
import ProfilePage from './components/ProfilePage.vue'
import TaskLogPage from './components/TaskLogPage.vue'
import JourneyPage from './components/JourneyPage.vue'
import UpgradeBountyPage from './components/UpgradeBountyPage.vue'
import DepositPage from './components/DepositPage.vue'
import VTWalletPage from './components/VTWalletPage.vue'
import UNIFIWalletPage from './components/UNIFIWalletPage.vue'
import WalletHistoryPage from './components/WalletHistoryPage.vue'
import DepositHistoryPage from './components/DepositHistoryPage.vue'
import WithdrawalHistoryPage from './components/WithdrawalHistoryPage.vue'
import UNIFIWithdrawalHistoryPage from './components/UNIFIWithdrawalHistoryPage.vue'
import JourneyHistoryPage from './components/JourneyHistoryPage.vue'
import { createRouter, ROUTES } from './composables/useRouter.js'

// 创建路由实例
const router = createRouter(ROUTES.LOGIN)
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

