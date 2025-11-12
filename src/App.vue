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

