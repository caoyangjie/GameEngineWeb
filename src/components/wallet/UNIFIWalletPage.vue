<template>
  <div class="unifi-wallet-container">
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
    <main class="unifi-wallet-main-content">
      <div class="content-layout">
        <!-- 左侧区域 -->
        <div class="left-section">
          <!-- 价格卡片 -->
          <div class="price-card">
            <div class="price-icon">U</div>
            <div class="price-info">
              <div class="price-item">
                <span class="price-label">{{ t('unifiWallet.platformPrice') }}</span>
                <span class="price-value">{{ platformPrice }} USD</span>
              </div>
              <div class="price-item">
                <span class="price-label">{{ t('unifiWallet.marketPrice') }}</span>
                <span class="price-value">{{ marketPrice }} USD</span>
              </div>
            </div>
          </div>

          <!-- 锁仓钱包 -->
          <div class="wallet-panel locked-wallet">
            <div class="panel-title">{{ t('unifiWallet.lockedWallet') }}</div>
            <div class="wallet-content">
              <div class="wallet-icon">U</div>
              <div class="wallet-info">
                <div class="info-row">
                  <span class="info-label">{{ t('unifiWallet.balance') }}</span>
                  <span class="info-value">{{ lockedBalance }} UNIFI</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ t('unifiWallet.platformValue') }}</span>
                  <span class="info-value">{{ lockedPlatformValue }} USD</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ t('unifiWallet.marketValue') }}</span>
                  <span class="info-value">{{ lockedMarketValue }} USD</span>
                </div>
              </div>
            </div>
            <div class="issuance-bar">
              <span>{{ t('unifiWallet.currentLockedIssuanceValue') }}: {{ lockedIssuanceValue }}%</span>
            </div>
          </div>
        </div>

        <!-- 右侧区域 - UNIFI 钱包 -->
        <div class="right-section">
          <div class="wallet-panel unifi-wallet-panel">
            <div class="panel-title">{{ t('unifiWallet.unifiWallet') }}</div>
            <div class="wallet-content">
              <div class="wallet-icon">U</div>
              <div class="wallet-info">
                <div class="info-row">
                  <span class="info-label">{{ t('unifiWallet.balance') }}</span>
                  <span class="info-value">{{ unifiBalance }} UNIFI</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ t('unifiWallet.platformValue') }}</span>
                  <span class="info-value">{{ unifiPlatformValue }} USD</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ t('unifiWallet.marketValue') }}</span>
                  <span class="info-value">{{ unifiMarketValue }} USD</span>
                </div>
              </div>
            </div>
            <div class="release-bar">
              <span>{{ t('unifiWallet.releaseValue') }}: {{ releaseValue }}%</span>
            </div>
            <div class="wallet-actions">
              <button class="action-button exchange-btn" @click="handleExchange">{{ t('unifiWallet.exchange') }}</button>
              <button class="action-button withdraw-btn" @click="handleWithdraw">{{ t('unifiWallet.withdraw') }}</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="unifi-wallet"
      @close="handleSidebarClose"
    />

    <!-- 兑换模态框 -->
    <div class="modal-overlay" v-if="showExchangeModal" @click="showExchangeModal = false">
      <div class="modal-content exchange-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ t('unifiWallet.exchange') }}</h3>
          <button class="modal-close" @click="showExchangeModal = false">×</button>
        </div>
        <div class="modal-body">
          <!-- UNIFI 余额 -->
          <div class="form-field">
            <div class="field-label">{{ t('unifiWallet.unifiBalance') }}</div>
            <div class="field-value">{{ unifiBalance }}</div>
          </div>

          <!-- 兑换金额输入 -->
          <div class="form-field">
            <div class="field-label-wrapper">
              <div class="field-label">{{ t('unifiWallet.exchangeAmount') }}</div>
              <button class="max-button" @click="handleSetMaxAmount">{{ t('unifiWallet.max') }}</button>
            </div>
            <div class="field-input-wrapper">
              <CustomNumberInput
                v-model="exchangeForm.exchangeAmount"
                :placeholder="t('unifiWallet.enterAmount')"
              />
            </div>
          </div>

          <!-- 应收 USD -->
          <div class="form-field">
            <div class="field-label">{{ t('unifiWallet.receivableUSD') }}</div>
            <div class="field-value">{{ receivableUSD }}</div>
          </div>

          <!-- 按钮组 -->
          <div class="modal-buttons">
            <button class="modal-button cancel" @click="showExchangeModal = false">{{ t('unifiWallet.cancel') }}</button>
            <button class="modal-button exchange-action" @click="handleConfirmExchange">{{ t('unifiWallet.exchange') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提款弹窗 -->
    <WithdrawalModal
      v-model="showWithdrawalModal"
      :balance="unifiBalance"
      :balance-label="t('unifiWallet.unifiBalance')"
      balance-unit="UNIFI"
      @confirm="handleWithdrawalConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomNumberInput from '../common/CustomNumberInput.vue'
import WithdrawalModal from '../common/WithdrawalModal.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)
const showExchangeModal = ref(false)
const showWithdrawalModal = ref(false)

// 价格数据
const platformPrice = ref('0.3000')
const marketPrice = ref('9.2374')

// 锁仓钱包数据
const lockedBalance = ref('594.541')
const lockedPlatformValue = ref('178.362')
const lockedMarketValue = ref('5,492.013')
const lockedIssuanceValue = ref('0.050')

// UNIFI 钱包数据
const unifiBalance = ref('926.779')
const unifiPlatformValue = ref('274.466')
const unifiMarketValue = ref('8,451.190')
const releaseValue = ref('2.000')

// 兑换表单数据
const exchangeForm = reactive({
  exchangeAmount: ''
})

// 计算应收USD：兑换金额 * 平台价格
const receivableUSD = computed(() => {
  if (!exchangeForm.exchangeAmount || exchangeForm.exchangeAmount === '') {
    return '0.00000000'
  }
  const amount = parseFloat(exchangeForm.exchangeAmount) || 0
  const price = parseFloat(platformPrice.value) || 0
  const result = (amount * price).toFixed(8)
  return result
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

const handleExchange = () => {
  // 重置表单
  exchangeForm.exchangeAmount = ''
  showExchangeModal.value = true
}

const handleSetMaxAmount = () => {
  // 将兑换金额设置为当前UNIFI余额
  exchangeForm.exchangeAmount = unifiBalance.value
}

const handleConfirmExchange = () => {
  if (!exchangeForm.exchangeAmount || exchangeForm.exchangeAmount === '' || parseFloat(exchangeForm.exchangeAmount) <= 0) {
    alert(t('unifiWallet.pleaseEnterAmount') || '请输入有效的兑换金额')
    return
  }
  
  const exchangeAmount = parseFloat(exchangeForm.exchangeAmount)
  const currentBalance = parseFloat(unifiBalance.value) || 0
  
  if (exchangeAmount > currentBalance) {
    alert(t('unifiWallet.insufficientBalance') || '余额不足')
    return
  }
  
  // 执行兑换逻辑
  console.log('确认兑换', {
    exchangeAmount: exchangeForm.exchangeAmount,
    receivableUSD: receivableUSD.value,
    unifiBalance: unifiBalance.value,
    platformPrice: platformPrice.value
  })
  
  // TODO: 调用API执行兑换操作
  // 成功后更新数据
  // unifiBalance.value = (currentBalance - exchangeAmount).toFixed(3)
  
  showExchangeModal.value = false
  exchangeForm.exchangeAmount = ''
  // 可以显示成功提示
  alert(t('unifiWallet.exchangeSuccess') || '兑换成功！')
}

const handleWithdraw = () => {
  showWithdrawalModal.value = true
}

const handleWithdrawalConfirm = (formData) => {
  // 提交提款请求
  console.log('提款请求:', formData)
  
  // TODO: 调用实际的提款 API
  alert(t('withdrawal.withdrawalSubmitted') || '提款申请已提交，请等待处理')
  showWithdrawalModal.value = false
}
</script>

<style scoped>
.unifi-wallet-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层 */
.background {
  position: absolute;
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
.unifi-wallet-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 200px;
  min-height: calc(100vh - 150px);
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: stretch;
}

/* 左侧区域 */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
  height: 100%;
}

/* 价格卡片 */
.price-card {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
}

.price-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4a90e2 0%, #ffd700 50%, #9b59b6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
  flex-shrink: 0;
}

.price-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.price-value {
  font-size: 16px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 钱包面板 */
.wallet-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.locked-wallet {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.unifi-wallet-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 25px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.wallet-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 25px;
}

.wallet-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4a90e2 0%, #ffd700 50%, #9b59b6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 25px rgba(74, 144, 226, 0.5);
  flex-shrink: 0;
}

.wallet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.info-value {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 发行值/释放值条 */
.issuance-bar,
.release-bar {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 6px;
  padding: 12px 20px;
  text-align: center;
  margin-bottom: 20px;
  color: #ffd700;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

.release-bar {
  margin-bottom: 25px;
}

/* 钱包操作按钮 */
.wallet-actions {
  display: flex;
  gap: 15px;
}

.action-button {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 8px;
  color: #ffd700;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
}

.action-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .unifi-wallet-main-content {
    padding: 30px 20px;
  }

  .content-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .left-section {
    order: 2;
  }

  .right-section {
    order: 1;
  }
}

@media (max-width: 768px) {
  .unifi-wallet-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .price-card {
    flex-direction: column;
    text-align: center;
  }

  .wallet-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .wallet-actions {
    flex-direction: column;
  }
}

/* 模态框样式 - 参照 MidoxPage.vue */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(20, 10, 0, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 0 50px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
}

.modal-title {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.6);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 32px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  line-height: 1;
}

.modal-close:hover {
  background: rgba(255, 215, 0, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 兑换模态框表单字段样式 */
.exchange-modal .form-field {
  position: relative;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.exchange-modal .form-field::before,
.exchange-modal .form-field::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid rgba(255, 215, 0, 0.6);
}

.exchange-modal .form-field::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 4px;
}

.exchange-modal .form-field::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 4px;
}

.field-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  flex-shrink: 0;
}

.field-label-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
  flex-shrink: 0;
}

.field-value {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  text-align: right;
  flex: 1;
}

.field-input-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.max-button {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.6);
  text-underline-offset: 3px;
  transition: all 0.3s;
  padding: 0;
  flex-shrink: 0;
}

.max-button:hover {
  color: #ffd700;
  text-decoration-color: rgba(255, 215, 0, 0.9);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.modal-buttons {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.modal-button {
  flex: 1;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid;
}

.modal-button.exchange-action {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.9) 0%,
    rgba(255, 140, 0, 0.9) 100%
  );
  border-color: rgba(255, 215, 0, 1);
  color: #ffffff;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 140, 0, 0.4);
}

.modal-button.exchange-action:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 1) 0%,
    rgba(255, 165, 0, 1) 100%
  );
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.9),
    0 6px 25px rgba(255, 140, 0, 0.6);
  transform: translateY(-2px);
}

.modal-button.cancel {
  background: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 215, 0, 0.5);
  color: #ffd700;
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.3),
    inset 0 0 10px rgba(255, 215, 0, 0.05);
}

.modal-button.cancel:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 25px rgba(255, 215, 0, 0.5),
    inset 0 0 15px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

/* 兑换模态框特殊布局 */
.exchange-modal .form-field {
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.exchange-modal .field-label-wrapper {
  width: 100%;
}

.exchange-modal .field-input-wrapper {
  width: 100%;
  justify-content: flex-start;
}

.exchange-modal .field-value {
  text-align: left;
  width: 100%;
}

/* 响应式设计 - 兑换弹窗 */
@media (max-width: 768px) {
  .modal-content {
    padding: 20px;
  }

  .exchange-modal .form-field {
    gap: 8px;
  }

  .field-label-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .max-button {
    align-self: flex-end;
  }

  .modal-buttons {
    flex-direction: column;
  }
}
</style>

