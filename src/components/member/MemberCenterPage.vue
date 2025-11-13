<template>
  <div class="member-center-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
      <div class="temple-background"></div>
      <div class="forest-overlay"></div>
    </div>

    <!-- 顶部导航栏 -->
    <TopHeader @toggle-sidebar="toggleSidebar" @go-to-journey="handleGoToJourney" @go-to-deposit="handleGoToDeposit" />

    <!-- 主要内容区域 -->
    <main class="member-center-main-content">
      <!-- 标题 -->
      <div class="title-section">
        <div class="title-banner">
          <span class="title-icon">👑</span>
          <span class="title-text">{{ t('memberCenter.title') }}</span>
        </div>
      </div>

      <!-- 用户等级卡片 -->
      <div class="level-card">
        <div class="level-info">
          <div class="level-icon">{{ memberInfo.levelIcon || '🥉' }}</div>
          <div class="level-details">
            <div class="level-name">{{ memberInfo.levelName || t('memberCenter.bronze') }}</div>
            <div class="level-code">{{ memberInfo.levelCode || 'BRONZE' }}</div>
            <div class="level-progress">
              <div class="progress-label">{{ t('memberCenter.totalDeposit') }}: {{ formatAmount(memberInfo.totalDeposit) }} USD</div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: depositProgress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <button class="upgrade-btn" @click="checkLevel">{{ t('memberCenter.checkLevel') }}</button>
      </div>

      <!-- 钱包余额卡片 -->
      <div class="wallet-cards">
        <div class="wallet-card" v-for="wallet in wallets" :key="wallet.currency">
          <div class="wallet-icon">{{ wallet.icon }}</div>
          <div class="wallet-info">
            <div class="wallet-label">{{ wallet.label }}</div>
            <div class="wallet-value">{{ formatAmount(wallet.balance) }} {{ wallet.currency }}</div>
          </div>
          <div class="wallet-actions">
            <button class="action-btn buy-btn" @click="handleBuy(wallet.currency)" v-if="wallet.currency !== 'USD'">
              {{ t('memberCenter.buy') }}
            </button>
            <button class="action-btn withdraw-btn" @click="handleWithdraw(wallet.currency)" v-if="wallet.currency === 'USD'">
              {{ t('memberCenter.withdraw') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 金库卡片 -->
      <div class="vault-cards">
        <!-- 赏金库 -->
        <div class="vault-card bounty-vault">
          <div class="vault-header">
            <div class="vault-icon">🥣</div>
            <div class="vault-title">{{ t('memberCenter.bountyVault') }}</div>
          </div>
          <div class="vault-balance">{{ formatAmount(memberInfo.bountyTotal) }} VT</div>
          <div class="vault-actions">
            <div class="auto-toggle">
              <span class="toggle-label">{{ t('memberCenter.autoAddJourney') }}</span>
              <div class="switch-wrapper">
                <label class="switch">
                  <input type="checkbox" v-model="memberInfo.autoAddJourney" @change="updateAutoAdd" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <button class="vault-btn harvest-btn" @click="handleHarvest">{{ t('memberCenter.harvest') }}</button>
          </div>
        </div>

        <!-- 主金库 -->
        <div class="vault-card main-vault">
          <div class="vault-header">
            <div class="vault-icon">💎</div>
            <div class="vault-title">{{ t('memberCenter.mainVault') }}</div>
          </div>
          <div class="vault-balance">{{ formatAmount(memberInfo.mainVaultBalance) }} VT</div>
          <div class="vault-actions">
            <button class="vault-btn add-btn" @click="handleAdd">{{ t('memberCenter.add') }}</button>
            <button class="vault-btn exchange-btn" @click="handleExchange">{{ t('memberCenter.exchange') }}</button>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-label">{{ t('memberCenter.totalInvestment') }}</div>
          <div class="stat-value">{{ formatAmount(memberInfo.totalInvestment) }} USD</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('memberCenter.totalWithdrawal') }}</div>
          <div class="stat-value">{{ formatAmount(memberInfo.totalWithdrawal) }} USD</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('memberCenter.totalEarnings') }}</div>
          <div class="stat-value">{{ formatAmount(memberInfo.totalEarnings) }} USD</div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      :active-route="ROUTES.MEMBER_CENTER"
      @close="handleSidebarClose"
    />

    <!-- 购买弹窗 -->
    <PurchaseModal
      v-model="showPurchaseModal"
      :currency="selectedCurrency"
      :balance="getBalance(selectedCurrency)"
      @confirm="handlePurchaseConfirm"
    />

    <!-- 其他弹窗复用现有组件 -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import PurchaseModal from '../common/PurchaseModal.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'
import { 
  getMemberCenter, 
  purchaseCurrency, 
  withdraw, 
  harvest, 
  addToMultiplierPool, 
  exchange, 
  updateAutoAddJourney,
  checkAndUpgradeLevel
} from '../../api/member.js'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)
const showPurchaseModal = ref(false)
const selectedCurrency = ref('')

// 会员信息
const memberInfo = reactive({
  userId: null,
  currentLevelId: null,
  levelName: '',
  levelCode: '',
  levelIcon: '',
  levelColor: '',
  totalDeposit: 0,
  totalInvestment: 0,
  totalWithdrawal: 0,
  totalEarnings: 0,
  usdBalance: 0,
  vtBalance: 0,
  unifiBalance: 0,
  bountyTotal: 0,
  mainVaultBalance: 0,
  autoAddJourney: false,
  vtPrice: 1.02,
  unifiPrice: 0
})

// 钱包列表
const wallets = computed(() => [
  {
    currency: 'USD',
    label: t('memberCenter.usdWallet'),
    balance: memberInfo.usdBalance,
    icon: '💰'
  },
  {
    currency: 'VT',
    label: t('memberCenter.vtWallet'),
    balance: memberInfo.vtBalance,
    icon: 'V'
  },
  {
    currency: 'UNIFI',
    label: t('memberCenter.unifiWallet'),
    balance: memberInfo.unifiBalance,
    icon: 'U'
  }
])

// 充值进度
const depositProgress = computed(() => {
  // 根据当前等级计算进度（简化版）
  const levels = [
    { min: 0, max: 100 },
    { min: 100, max: 500 },
    { min: 500, max: 2000 },
    { min: 2000, max: 10000 },
    { min: 10000, max: Infinity }
  ]
  
  const currentDeposit = parseFloat(memberInfo.totalDeposit) || 0
  for (let level of levels) {
    if (currentDeposit >= level.min && currentDeposit < level.max) {
      const range = level.max - level.min
      const progress = ((currentDeposit - level.min) / range) * 100
      return Math.min(100, Math.max(0, progress))
    }
  }
  return 100
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  toggleSidebar()
}

const handleGoToJourney = () => {
  router.goToJourney()
}

const handleGoToDeposit = () => {
  router.goToDeposit()
}

const handleBuy = (currency) => {
  selectedCurrency.value = currency
  showPurchaseModal.value = true
}

const handleWithdraw = (currency) => {
  // 使用现有的提款功能
  router.goToDeposit()
}

const handleHarvest = async () => {
  try {
    const response = await harvest(memberInfo.autoAddJourney)
    if (response.code === 200) {
      alert(t('memberCenter.harvestSuccess'))
      loadMemberCenter()
    } else {
      alert(response.msg || t('memberCenter.harvestFailed'))
    }
  } catch (error) {
    console.error('收成失败:', error)
    alert(error.message || t('memberCenter.harvestFailed'))
  }
}

const handleAdd = () => {
  // 跳转到VT钱包页面
  router.goToVTWallet()
}

const handleExchange = () => {
  // 跳转到VT钱包页面
  router.goToVTWallet()
}

const handlePurchaseConfirm = async (formData) => {
  try {
    const response = await purchaseCurrency(
      formData.fromCurrency,
      formData.toCurrency,
      formData.amount
    )
    if (response.code === 200) {
      alert(t('memberCenter.purchaseSuccess'))
      showPurchaseModal.value = false
      loadMemberCenter()
    } else {
      alert(response.msg || t('memberCenter.purchaseFailed'))
    }
  } catch (error) {
    console.error('购买失败:', error)
    alert(error.message || t('memberCenter.purchaseFailed'))
  }
}

const updateAutoAdd = async () => {
  // 由于v-model已经更新了值，我们需要使用新值
  const newValue = memberInfo.autoAddJourney
  const oldValue = !newValue // 旧值是当前值的相反值
  try {
    const response = await updateAutoAddJourney(newValue)
    if (response.code === 200) {
      // 更新成功，不需要额外操作
    } else {
      alert(response.msg || t('memberCenter.updateFailed'))
      memberInfo.autoAddJourney = oldValue // 回滚到旧值
    }
  } catch (error) {
    console.error('更新失败:', error)
    memberInfo.autoAddJourney = oldValue // 回滚到旧值
    alert(error.message || t('memberCenter.updateFailed'))
  }
}

const checkLevel = async () => {
  try {
    const response = await checkAndUpgradeLevel()
    if (response.code === 200 && response.data) {
      alert(t('memberCenter.levelUpgraded'))
      loadMemberCenter()
    } else {
      alert(t('memberCenter.noLevelUpgrade'))
    }
  } catch (error) {
    console.error('检查等级失败:', error)
    alert(error.message || t('memberCenter.checkLevelFailed'))
  }
}

const getBalance = (currency) => {
  switch (currency) {
    case 'USD':
      return memberInfo.usdBalance
    case 'VT':
      return memberInfo.vtBalance
    case 'UNIFI':
      return memberInfo.unifiBalance
    default:
      return 0
  }
}

const formatAmount = (amount) => {
  if (!amount) return '0.00'
  const num = parseFloat(amount)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

const loadMemberCenter = async () => {
  try {
    const response = await getMemberCenter()
    if (response.code === 200 && response.data) {
      Object.assign(memberInfo, response.data)
      // 确保autoAddJourney是布尔值
      memberInfo.autoAddJourney = Boolean(response.data.autoAddJourney)
    } else {
      console.error('获取会员中心信息失败:', response.msg)
    }
  } catch (error) {
    console.error('获取会员中心信息错误:', error)
  }
}

onMounted(() => {
  loadMemberCenter()
})
</script>

<style scoped>
/* 样式参考现有的DepositPage.vue和VTWalletPage.vue */
.member-center-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层样式（复用现有样式） */
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #0a0e27 0%,
    #1a1f3a 20%,
    #2d3a5a 40%,
    #1a2332 60%,
    #0f1419 100%
  );
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, #ffd700, transparent),
    radial-gradient(1px 1px at 60% 70%, #fff, transparent),
    radial-gradient(2px 2px at 50% 50%, #ff6b9d, transparent),
    radial-gradient(1px 1px at 80% 10%, #fff, transparent),
    radial-gradient(2px 2px at 90% 40%, #ffd700, transparent);
  background-repeat: repeat;
  background-size: 200% 200%;
  animation: twinkle 3s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.galaxy {
  position: absolute;
  top: 10%;
  right: 10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 215, 0, 0.2) 0%,
    rgba(138, 43, 226, 0.2) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(40px);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: 
    linear-gradient(to top, #0a0a0a 0%, transparent 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cpath d='M0,400 L200,300 L400,350 L600,250 L800,320 L1000,280 L1200,300 L1200,400 Z' fill='%231a1a1a'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.8;
}

.temple-background {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(20, 15, 10, 0.2) 50%, rgba(10, 5, 0, 0.4) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath d='M100,400 L100,250 L150,230 L200,250 L250,230 L300,250 L350,230 L400,250 L450,230 L500,250 L550,230 L600,250 L650,230 L700,250 L700,400 Z' fill='rgba(20,15,10,0.3)'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.6;
  filter: blur(2px);
}

.forest-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

/* 主要内容区域 */
.member-center-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 100px;
  min-height: calc(100vh - 150px);
}

/* 标题区域 */
.title-section {
  margin-bottom: 30px;
}

.title-banner {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 20px 30px;
  display: inline-flex;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.title-icon {
  font-size: 32px;
}

.title-text {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
}

/* 等级卡片 */
.level-card {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.level-icon {
  font-size: 64px;
}

.level-details {
  flex: 1;
}

.level-name {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 5px;
}

.level-code {
  font-size: 16px;
  color: rgba(255, 215, 0, 0.8);
  margin-bottom: 15px;
}

.level-progress {
  margin-top: 15px;
}

.progress-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffa500);
  transition: width 0.3s;
}

.upgrade-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 8px;
  color: #ffd700;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.upgrade-btn:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  transform: translateY(-2px);
}

/* 钱包卡片 */
.wallet-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.wallet-card {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.wallet-icon {
  font-size: 48px;
  text-align: center;
}

.wallet-info {
  text-align: center;
}

.wallet-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.wallet-value {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
}

.wallet-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 6px;
  color: #ffd700;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  transform: translateY(-2px);
}

/* 金库卡片 */
.vault-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.vault-card {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.vault-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.vault-icon {
  font-size: 40px;
}

.vault-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
}

.vault-balance {
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 20px;
}

.vault-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auto-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 6px;
}

.toggle-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.switch-wrapper {
  position: relative;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.3);
  transition: 0.4s;
  border-radius: 24px;
}

.switch .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: #ffd700;
}

.switch input:checked + .slider:before {
  transform: translateX(26px);
}

.vault-btn {
  padding: 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 6px;
  color: #ffd700;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.vault-btn:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  transform: translateY(-2px);
}

/* 统计信息 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .member-center-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .level-card {
    flex-direction: column;
    gap: 20px;
  }

  .wallet-cards,
  .vault-cards {
    grid-template-columns: 1fr;
  }
}
</style>

