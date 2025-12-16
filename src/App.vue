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
    <ScenarioListPage v-if="router.currentRoute.value === ROUTES.SCENARIO_LIST" />
    <RequirementListPage v-if="router.currentRoute.value === ROUTES.REQUIREMENT_LIST" />
    <!-- 支付管理 -->
    <PaymentConfigPage v-if="router.currentRoute.value === ROUTES.PAYMENT_CONFIG" />
    <AlipayWebSitePage v-if="router.currentRoute.value === ROUTES.ALIPAY_WEB_SITE" />
    <AlipayMobileSitePage v-if="router.currentRoute.value === ROUTES.ALIPAY_MOBILE_SITE" />
    <AlipayPreCreatePage v-if="router.currentRoute.value === ROUTES.ALIPAY_PRE_CREATE" />
    <AlipayPayPage v-if="router.currentRoute.value === ROUTES.ALIPAY_PAY" />
    <AlipayQueryPage v-if="router.currentRoute.value === ROUTES.ALIPAY_QUERY" />
    <AlipayRefundPage v-if="router.currentRoute.value === ROUTES.ALIPAY_REFUND" />
    <AlipayCancelPage v-if="router.currentRoute.value === ROUTES.ALIPAY_CANCEL" />
    <WechatUnifiedOrderPage v-if="router.currentRoute.value === ROUTES.WECHAT_UNIFIED_ORDER" />
    <WechatMicroPayPage v-if="router.currentRoute.value === ROUTES.WECHAT_MICRO_PAY" />
    <WechatQueryPage v-if="router.currentRoute.value === ROUTES.WECHAT_QUERY" />
    <WechatRefundPage v-if="router.currentRoute.value === ROUTES.WECHAT_REFUND" />
    <WechatCloseOrderPage v-if="router.currentRoute.value === ROUTES.WECHAT_CLOSE_ORDER" />
    <BestpayBarcodePage v-if="router.currentRoute.value === ROUTES.BESTPAY_BARCODE" />
    <BestpayQueryPage v-if="router.currentRoute.value === ROUTES.BESTPAY_QUERY" />
    <BestpayRefundPage v-if="router.currentRoute.value === ROUTES.BESTPAY_REFUND" />
    <BestpayReversePage v-if="router.currentRoute.value === ROUTES.BESTPAY_REVERSE" />
    <CharacterTestPage v-if="router.currentRoute.value === ROUTES.CHARACTER_TEST" />
    <MathTestPage v-if="router.currentRoute.value === ROUTES.MATH_TEST" />
    <AttentionTrainingHubPage v-if="router.currentRoute.value === ROUTES.ATTENTION_TRAINING" />
    <DigitIntroPage v-if="router.currentRoute.value === ROUTES.ATTENTION_DIGIT_INTRO" />
    <LetterReinforcePage v-if="router.currentRoute.value === ROUTES.ATTENTION_LETTER_REINFORCE" />
    <IdiomAdvancedPage v-if="router.currentRoute.value === ROUTES.ATTENTION_IDIOM_ADVANCED" />
    <PoetryChallengePage v-if="router.currentRoute.value === ROUTES.ATTENTION_POETRY_CHALLENGE" />
    <PoetryReinforcePage v-if="router.currentRoute.value === ROUTES.ATTENTION_POETRY_REINFORCE" />
    <SudokuPage v-if="router.currentRoute.value === ROUTES.ATTENTION_SUDOKU" />
    <NumberSliderPage v-if="router.currentRoute.value === ROUTES.ATTENTION_NUMBER_SLIDER" />
    <PhotoMemoryPage v-if="router.currentRoute.value === ROUTES.ATTENTION_PHOTO_MEMORY" />
    <NumberMemoryCodePage v-if="router.currentRoute.value === ROUTES.ATTENTION_NUMBER_MEMORY_CODE" />
    <NumberFaxPage v-if="router.currentRoute.value === ROUTES.ATTENTION_NUMBER_FAX" />
    <TextFocusPage v-if="router.currentRoute.value === ROUTES.ATTENTION_TEXT_FOCUS" />
    <CardMemoryPage v-if="router.currentRoute.value === ROUTES.ATTENTION_CARD_MEMORY" />
    <SensoryMemoryPage v-if="router.currentRoute.value === ROUTES.ATTENTION_SENSORY_MEMORY" />
    <PegMemoryPage v-if="router.currentRoute.value === ROUTES.ATTENTION_PEG_MEMORY" />
    <WritingTrainingHubPage v-if="router.currentRoute.value === ROUTES.WRITING_TRAINING" />
    <WordExpansionPage v-if="router.currentRoute.value === ROUTES.WRITING_WORD_EXPANSION" />
    <OverviewStructurePage v-if="router.currentRoute.value === ROUTES.WRITING_OVERVIEW_STRUCTURE" />
    <CharacterPage v-if="router.currentRoute.value === ROUTES.WRITING_CHARACTER" />
    <EventPage v-if="router.currentRoute.value === ROUTES.WRITING_EVENT" />
    <SceneryPage v-if="router.currentRoute.value === ROUTES.WRITING_SCENERY" />
    <AnimalPage v-if="router.currentRoute.value === ROUTES.WRITING_ANIMAL" />
    <PlantPage v-if="router.currentRoute.value === ROUTES.WRITING_PLANT" />
    <ObjectPage v-if="router.currentRoute.value === ROUTES.WRITING_OBJECT" />
    <OpeningPage v-if="router.currentRoute.value === ROUTES.WRITING_OPENING" />
    <ClosingPage v-if="router.currentRoute.value === ROUTES.WRITING_CLOSING" />
    <BodyPage v-if="router.currentRoute.value === ROUTES.WRITING_BODY" />
    <FiveSensesPage v-if="router.currentRoute.value === ROUTES.WRITING_FIVE_SENSES" />
    <ExperienceReflectionPage v-if="router.currentRoute.value === ROUTES.WRITING_EXPERIENCE_REFLECTION" />
    <SceneCharacterActionPage v-if="router.currentRoute.value === ROUTES.WRITING_SCENE_CHARACTER_ACTION" />
    <ProblemSolutionResultPage v-if="router.currentRoute.value === ROUTES.WRITING_PROBLEM_SOLUTION_RESULT" />
    <ThinkingModeTrainingHubPage v-if="router.currentRoute.value === ROUTES.THINKING_MODE_TRAINING" />
    <LearningMethodologyPage v-if="router.currentRoute.value === ROUTES.LEARNING_METHODOLOGY" />
    <LearningStepsPage v-if="router.currentRoute.value === ROUTES.LEARNING_STEPS" />
    <LearningRecordListPage v-if="router.currentRoute.value === ROUTES.LEARNING_RECORD_LIST" />
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
import ScenarioListPage from './components/persona/ScenarioListPage.vue'
import RequirementListPage from './components/persona/RequirementListPage.vue'
// 支付管理
import PaymentConfigPage from './components/payment/PaymentConfigPage.vue'
import AlipayWebSitePage from './components/payment/AlipayWebSitePage.vue'
import AlipayMobileSitePage from './components/payment/AlipayMobileSitePage.vue'
import AlipayPreCreatePage from './components/payment/AlipayPreCreatePage.vue'
import AlipayPayPage from './components/payment/AlipayPayPage.vue'
import AlipayQueryPage from './components/payment/AlipayQueryPage.vue'
import AlipayRefundPage from './components/payment/AlipayRefundPage.vue'
import AlipayCancelPage from './components/payment/AlipayCancelPage.vue'
import WechatUnifiedOrderPage from './components/payment/WechatUnifiedOrderPage.vue'
import WechatMicroPayPage from './components/payment/WechatMicroPayPage.vue'
import WechatQueryPage from './components/payment/WechatQueryPage.vue'
import WechatRefundPage from './components/payment/WechatRefundPage.vue'
import WechatCloseOrderPage from './components/payment/WechatCloseOrderPage.vue'
import BestpayBarcodePage from './components/payment/BestpayBarcodePage.vue'
import BestpayQueryPage from './components/payment/BestpayQueryPage.vue'
import BestpayRefundPage from './components/payment/BestpayRefundPage.vue'
import BestpayReversePage from './components/payment/BestpayReversePage.vue'
import CharacterTestPage from './components/characterTest/CharacterTestPage.vue'
import MathTestPage from './components/mathTest/MathTestPage.vue'
import AttentionTrainingHubPage from './components/attentionTraining/AttentionTrainingHubPage.vue'
import DigitIntroPage from './components/attentionTraining/DigitIntroPage.vue'
import LetterReinforcePage from './components/attentionTraining/LetterReinforcePage.vue'
import IdiomAdvancedPage from './components/attentionTraining/IdiomAdvancedPage.vue'
import PoetryChallengePage from './components/attentionTraining/PoetryChallengePage.vue'
import PoetryReinforcePage from './components/attentionTraining/PoetryReinforcePage.vue'
import SudokuPage from './components/attentionTraining/SudokuPage.vue'
import NumberSliderPage from './components/attentionTraining/NumberSliderPage.vue'
import PhotoMemoryPage from './components/attentionTraining/PhotoMemoryPage.vue'
import NumberMemoryCodePage from './components/attentionTraining/NumberMemoryCodePage.vue'
import NumberFaxPage from './components/attentionTraining/NumberFaxPage.vue'
import TextFocusPage from './components/attentionTraining/TextFocusPage.vue'
import CardMemoryPage from './components/attentionTraining/CardMemoryPage.vue'
import SensoryMemoryPage from './components/attentionTraining/SensoryMemoryPage.vue'
import PegMemoryPage from './components/attentionTraining/PegMemoryPage.vue'
import WritingTrainingHubPage from './components/writingTraining/WritingTrainingHubPage.vue'
import WordExpansionPage from './components/writingTraining/WordExpansionPage.vue'
import OverviewStructurePage from './components/writingTraining/OverviewStructurePage.vue'
import CharacterPage from './components/writingTraining/CharacterPage.vue'
import EventPage from './components/writingTraining/EventPage.vue'
import SceneryPage from './components/writingTraining/SceneryPage.vue'
import AnimalPage from './components/writingTraining/AnimalPage.vue'
import PlantPage from './components/writingTraining/PlantPage.vue'
import ObjectPage from './components/writingTraining/ObjectPage.vue'
import OpeningPage from './components/writingTraining/OpeningPage.vue'
import ClosingPage from './components/writingTraining/ClosingPage.vue'
import BodyPage from './components/writingTraining/BodyPage.vue'
import FiveSensesPage from './components/writingTraining/FiveSensesPage.vue'
import ExperienceReflectionPage from './components/writingTraining/ExperienceReflectionPage.vue'
import SceneCharacterActionPage from './components/writingTraining/SceneCharacterActionPage.vue'
import ProblemSolutionResultPage from './components/writingTraining/ProblemSolutionResultPage.vue'
import ThinkingModeTrainingHubPage from './components/thinkingModeTraining/ThinkingModeTrainingHubPage.vue'
import LearningMethodologyPage from './components/learningMethodology/LearningMethodologyPage.vue'
import LearningStepsPage from './components/learningMethodology/LearningStepsPage.vue'
import LearningRecordListPage from './components/learningMethodology/LearningRecordListPage.vue'
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

