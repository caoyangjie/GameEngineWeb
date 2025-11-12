<template>
  <div class="vt-wallet-container">
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
    <main class="vt-wallet-main-content">
      <!-- VT 钱包面板 -->
      <div class="vt-wallet-panel">
        <div class="wallet-title">{{ t('vtWallet.vtWallet') }}</div>
        <div class="vt-price-section">
          <div class="vt-price-label">{{ t('vtWallet.vtPrice') }}</div>
          <div class="vt-price-value">
            <div class="vt-icon">V</div>
            <span>{{ vtPrice }} USD</span>
          </div>
        </div>
      </div>

      <!-- 赏金库和主金库区域 -->
      <div class="treasury-section">
        <!-- 赏金库 -->
        <div class="treasury-panel bounty-treasury">
          <div class="treasury-title">{{ t('vtWallet.bountyTreasury') }}</div>
          <div class="treasury-content">
            <div class="treasury-icon">V</div>
            <div class="treasury-info">
              <div class="treasury-label">{{ t('vtWallet.bountyTotal') }}</div>
              <div class="treasury-value">{{ bountyTotal }} VT</div>
              <div class="auto-journey-toggle">
                <span class="toggle-label">{{ t('vtWallet.autoAddJourney') }}</span>
                <div class="switch-wrapper">
                  <input type="checkbox" v-model="autoAddJourney" id="auto-add-journey" />
                  <label class="switch slider" for="auto-add-journey" :aria-label="t('vtWallet.autoAddJourney')">
                    <span class="sr-only">{{ t('vtWallet.autoAddJourney') }}</span>
                  </label>
                </div>
                <span class="toggle-status">{{ autoAddJourney ? t('vtWallet.on') : t('vtWallet.off') }}</span>
              </div>
            </div>
          </div>
          <div class="treasury-actions">
            <button class="treasury-button harvest-btn" @click="handleHarvest">{{ t('vtWallet.harvest') }}</button>
            <button class="treasury-button add-btn" @click="handleAdd">{{ t('vtWallet.add') }}</button>
          </div>
        </div>

        <!-- 主金库 -->
        <div class="treasury-panel main-treasury">
          <div class="treasury-title">{{ t('vtWallet.mainTreasury') }}</div>
          <div class="treasury-content">
            <div class="treasury-icon">V</div>
            <div class="treasury-info">
              <div class="treasury-label">{{ t('vtWallet.mainWallet') }}</div>
              <div class="treasury-value">{{ mainWallet }} VT</div>
              <!-- 占位空间，用于对齐按钮高度 -->
              <div class="auto-journey-toggle placeholder-toggle">
                <span class="toggle-label"></span>
                <div class="switch-wrapper"></div>
                <span class="toggle-status"></span>
              </div>
            </div>
          </div>
          <div class="treasury-actions">
            <button class="treasury-button exchange-btn" @click="handleExchange">{{ t('vtWallet.exchange') }}</button>
            <button class="treasury-button add-btn" @click="handleMainTreasuryAdd">{{ t('vtWallet.add') }}</button>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="vt-wallet"
      @close="handleSidebarClose"
    />

    <!-- 收成确认模态框 -->
    <div class="modal-overlay" v-if="showHarvestModal" @click="showHarvestModal = false">
      <div class="modal-content harvest-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ t('vtWallet.harvest') }}</h3>
          <button class="modal-close" @click="showHarvestModal = false">×</button>
        </div>
        <div class="modal-body">
          <!-- 奖励信息 -->
          <div class="reward-section">
            <div class="reward-icon">
              <div class="trophy-icon">🏆</div>
            </div>
            <div class="reward-info">
              <div class="reward-label">{{ t('vtWallet.reward') }}</div>
              <div class="reward-value">{{ bountyTotal }} VT</div>
            </div>
          </div>
          
          <!-- 提示信息 -->
          <div class="harvest-notice">
            <div class="notice-switch-wrapper">
              <input type="checkbox" v-model="harvestAutoAddJourney" id="harvest-auto-add-journey" />
              <label class="notice-switch slider" for="harvest-auto-add-journey" :aria-label="t('vtWallet.autoAddJourney')">
                <span class="sr-only">{{ t('vtWallet.autoAddJourney') }}</span>
              </label>
            </div>
            <div class="notice-text">{{ t('vtWallet.harvestNotice') }}</div>
          </div>
          
          <!-- 确认按钮 -->
          <button class="modal-submit" @click="handleConfirmHarvest">{{ t('vtWallet.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- 追加模态框 -->
    <div class="modal-overlay" v-if="showAddModal" @click="showAddModal = false">
      <div class="modal-content add-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ t('vtWallet.add') }}</h3>
          <button class="modal-close" @click="showAddModal = false">×</button>
        </div>
        <div class="modal-body">
          <!-- 赏金(VT) -->
          <div class="form-field">
            <div class="field-label">{{ t('vtWallet.bountyVT') }}</div>
            <div class="field-value">{{ bountyTotal }}</div>
          </div>

          <!-- VT 价格 -->
          <div class="form-field">
            <div class="field-label">{{ t('vtWallet.vtPrice') }}</div>
            <div class="field-value">{{ vtPrice }}</div>
          </div>

          <!-- VT 金额输入 -->
          <div class="form-field">
            <div class="field-label">{{ t('vtWallet.vtAmount') }}</div>
            <div class="field-input-wrapper">
              <CustomNumberInput
                v-model="addForm.vtAmount"
                :placeholder="t('vtWallet.enterAmount')"
              />
            </div>
          </div>

          <!-- 应获倍增池 -->
          <div class="form-field">
            <div class="field-label">{{ t('vtWallet.expectedMultiplierPool') }}</div>
            <div class="field-value">{{ expectedMultiplierPool }}</div>
          </div>

          <!-- 按钮组 -->
          <div class="modal-buttons">
            <button class="modal-button cancel" @click="showAddModal = false">{{ t('vtWallet.cancel') }}</button>
            <button class="modal-button confirm" @click="handleConfirmAdd">{{ t('vtWallet.confirm') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 兑换模态框 -->
    <div class="modal-overlay" v-if="showExchangeModal" @click="showExchangeModal = false">
      <div class="modal-content exchange-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ t('vtWallet.exchange') }}</h3>
          <button class="modal-close" @click="showExchangeModal = false">×</button>
        </div>
        <div class="modal-body">
          <!-- VT 余额 -->
          <div class="form-field">
            <div class="field-label">{{ t('vtWallet.vtBalance') }}</div>
            <div class="field-value">{{ mainWallet }}</div>
          </div>

          <!-- 兑换金额输入 -->
          <div class="form-field">
            <div class="field-label-wrapper">
              <div class="field-label">{{ t('vtWallet.exchangeAmount') }}</div>
              <button class="max-button" @click="handleSetMaxAmount">{{ t('vtWallet.max') }}</button>
            </div>
            <div class="field-input-wrapper">
              <CustomNumberInput
                v-model="exchangeForm.exchangeAmount"
                :placeholder="t('vtWallet.enterAmount')"
              />
            </div>
          </div>

          <!-- 应收 USD -->
          <div class="form-field">
            <div class="field-label">{{ t('vtWallet.receivableUSD') }}</div>
            <div class="field-value">{{ receivableUSD }}</div>
          </div>

          <!-- 按钮组 -->
          <div class="modal-buttons">
            <button class="modal-button cancel" @click="showExchangeModal = false">{{ t('vtWallet.cancel') }}</button>
            <button class="modal-button confirm" @click="handleConfirmExchange">{{ t('vtWallet.confirm') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomNumberInput from '../common/CustomNumberInput.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)
const showHarvestModal = ref(false)
const showAddModal = ref(false)
const showExchangeModal = ref(false)

// VT 价格
const vtPrice = ref('1.0200')

// 赏金库数据
const bountyTotal = ref('578.204')
const autoAddJourney = ref(false)

// 主金库数据
const mainWallet = ref('0.000')

// 收成弹框中的自动追加旅程开关
const harvestAutoAddJourney = ref(false)

// 追加表单数据
const addForm = reactive({
  vtAmount: ''
})

// 兑换表单数据
const exchangeForm = reactive({
  exchangeAmount: ''
})

// 计算应获倍增池：VT金额 * VT价格
const expectedMultiplierPool = computed(() => {
  if (!addForm.vtAmount || addForm.vtAmount === '') {
    return '0.000'
  }
  const amount = parseFloat(addForm.vtAmount) || 0
  const price = parseFloat(vtPrice.value) || 0
  const result = (amount * price).toFixed(3)
  return result
})

// 计算应收USD：兑换金额 * VT价格
const receivableUSD = computed(() => {
  if (!exchangeForm.exchangeAmount || exchangeForm.exchangeAmount === '') {
    return '0.00000000'
  }
  const amount = parseFloat(exchangeForm.exchangeAmount) || 0
  const price = parseFloat(vtPrice.value) || 0
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

const handleHarvest = () => {
  // 打开弹框时，将 harvestAutoAddJourney 设置为与 autoAddJourney 相同的值
  harvestAutoAddJourney.value = autoAddJourney.value
  showHarvestModal.value = true
}

const handleConfirmHarvest = () => {
  // 执行收成逻辑
  console.log('确认收成', bountyTotal.value, '自动追加旅程:', harvestAutoAddJourney.value)
  
  // 如果开关打开，同步更新主面板的自动追加旅程状态
  if (harvestAutoAddJourney.value) {
    autoAddJourney.value = true
  }
  
  // TODO: 调用API执行收成操作
  // 成功后更新数据
  // mainWallet.value = (parseFloat(mainWallet.value) + parseFloat(bountyTotal.value)).toFixed(3)
  // bountyTotal.value = '0.000'
  
  showHarvestModal.value = false
  // 可以显示成功提示
  alert(t('vtWallet.harvestSuccess') || '收成成功！')
}

const handleAdd = () => {
  // 赏金库的追加按钮：显示追加弹窗
  // 重置表单
  addForm.vtAmount = ''
  showAddModal.value = true
}

const handleMainTreasuryAdd = () => {
  // 主金库的追加按钮：跳转到旅程页面
  router.goToJourney()
}

const handleConfirmAdd = () => {
  if (!addForm.vtAmount || addForm.vtAmount === '' || parseFloat(addForm.vtAmount) <= 0) {
    alert(t('vtWallet.pleaseEnterAmount') || '请输入有效的VT金额')
    return
  }
  
  // 执行追加逻辑
  console.log('确认追加', {
    vtAmount: addForm.vtAmount,
    expectedMultiplierPool: expectedMultiplierPool.value,
    bountyTotal: bountyTotal.value,
    vtPrice: vtPrice.value
  })
  
  // TODO: 调用API执行追加操作
  // 成功后更新数据
  // bountyTotal.value = (parseFloat(bountyTotal.value) + parseFloat(addForm.vtAmount)).toFixed(3)
  
  showAddModal.value = false
  addForm.vtAmount = ''
  // 可以显示成功提示
  alert(t('vtWallet.addSuccess') || '追加成功！')
}

const handleExchange = () => {
  // 重置表单
  exchangeForm.exchangeAmount = ''
  showExchangeModal.value = true
}

const handleSetMaxAmount = () => {
  // 将兑换金额设置为当前主钱包余额
  exchangeForm.exchangeAmount = mainWallet.value
}

const handleConfirmExchange = () => {
  if (!exchangeForm.exchangeAmount || exchangeForm.exchangeAmount === '' || parseFloat(exchangeForm.exchangeAmount) <= 0) {
    alert(t('vtWallet.pleaseEnterAmount') || '请输入有效的兑换金额')
    return
  }
  
  const exchangeAmount = parseFloat(exchangeForm.exchangeAmount)
  const currentBalance = parseFloat(mainWallet.value) || 0
  
  if (exchangeAmount > currentBalance) {
    alert(t('vtWallet.insufficientBalance') || '余额不足')
    return
  }
  
  // 执行兑换逻辑
  console.log('确认兑换', {
    exchangeAmount: exchangeForm.exchangeAmount,
    receivableUSD: receivableUSD.value,
    mainWallet: mainWallet.value,
    vtPrice: vtPrice.value
  })
  
  // TODO: 调用API执行兑换操作
  // 成功后更新数据
  // mainWallet.value = (currentBalance - exchangeAmount).toFixed(3)
  
  showExchangeModal.value = false
  exchangeForm.exchangeAmount = ''
  // 可以显示成功提示
  alert(t('vtWallet.exchangeSuccess') || '兑换成功！')
}
</script>

<style scoped>
.vt-wallet-container {
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
.vt-wallet-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 200px;
  min-height: calc(100vh - 150px);
}

/* VT 钱包面板 */
.vt-wallet-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  max-width: 840px;
  margin-left: auto;
  margin-right: auto;
}

.wallet-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
}

.vt-price-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.vt-price-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.vt-price-value {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.vt-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4a90e2 0%, #ffd700 50%, #9b59b6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
}

/* 赏金库和主金库区域 */
.treasury-section {
  display: flex;
  gap: 40px;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  align-items: stretch;
}

.treasury-panel {
  flex: 1;
  max-width: 500px;
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
  min-height: 0;
}

.treasury-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 25px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.treasury-content {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  flex: 1;
  min-height: 0;
}

.treasury-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4a90e2 0%, #ffd700 50%, #9b59b6 100%);
  border-radius: 16px;
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

.treasury-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.treasury-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.treasury-value {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.auto-journey-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.toggle-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.switch-wrapper {
  position: relative;
  display: inline-block;
}

.switch-wrapper input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  cursor: pointer;
}

.switch.slider {
  position: relative;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.3);
  transition: 0.3s;
  border-radius: 24px;
}

.switch.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch-wrapper input:checked + .switch.slider {
  background-color: rgba(255, 215, 0, 0.8);
}

.switch-wrapper input:checked + .switch.slider:before {
  transform: translateX(26px);
}

.toggle-status {
  font-size: 14px;
  color: #ffd700;
  font-weight: bold;
}

.placeholder-toggle {
  visibility: hidden;
  height: 34px;
  margin-top: 10px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.treasury-actions {
  display: flex;
  gap: 15px;
  margin-top: auto;
  flex-shrink: 0;
}

.treasury-button {
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

.treasury-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .vt-wallet-main-content {
    padding: 30px 20px;
  }

  .treasury-section {
    flex-direction: column;
    align-items: center;
  }

  .treasury-panel {
    width: 100%;
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .vt-wallet-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .vt-price-value {
    font-size: 24px;
  }

  .vt-icon {
    width: 50px;
    height: 50px;
    font-size: 30px;
  }

  .treasury-content {
    flex-direction: column;
    text-align: center;
  }

  .treasury-actions {
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

/* 奖励信息区域 */
.reward-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
}

.reward-icon {
  flex-shrink: 0;
}

.trophy-icon {
  width: 60px;
  height: 60px;
  background: rgba(100, 100, 100, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.reward-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reward-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.reward-value {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

/* 提示信息区域 */
.harvest-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
}

.notice-switch-wrapper {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  margin-top: 2px;
}

.notice-switch-wrapper input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.notice-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  cursor: pointer;
}

.notice-switch.slider {
  position: relative;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.3);
  transition: 0.3s;
  border-radius: 24px;
}

.notice-switch.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.notice-switch-wrapper input:checked + .notice-switch.slider {
  background-color: rgba(255, 215, 0, 0.8);
}

.notice-switch-wrapper input:checked + .notice-switch.slider:before {
  transform: translateX(26px);
}

.notice-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.6;
}

/* 确认按钮 */
.modal-submit {
  width: 100%;
  height: 50px;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.9) 0%,
    rgba(255, 140, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 1);
  border-radius: 10px;
  color: #1a0a2e;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 140, 0, 0.4);
  transition: all 0.3s;
  margin-top: 10px;
}

.modal-submit:hover {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    padding: 20px;
  }

  .reward-section {
    flex-direction: column;
    text-align: center;
  }

  .harvest-notice {
    flex-direction: column;
    gap: 8px;
  }

  .notice-switch-wrapper {
    align-self: flex-start;
  }
}

/* 追加模态框样式 */
.add-modal .modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
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

.form-field::before,
.form-field::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid rgba(255, 215, 0, 0.6);
}

.form-field::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 4px;
}

.form-field::after {
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

.modal-button.confirm {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.9) 0%,
    rgba(255, 140, 0, 0.9) 100%
  );
  border-color: rgba(255, 215, 0, 1);
  color: #1a0a2e;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 140, 0, 0.4);
}

.modal-button.confirm:hover {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .form-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .field-value {
    text-align: left;
    width: 100%;
  }

  .field-input-wrapper {
    width: 100%;
    justify-content: flex-start;
  }

  .modal-buttons {
    flex-direction: column;
  }
}

/* 兑换模态框特殊样式 */
.exchange-modal .modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-label-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.max-button {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(255, 215, 0, 0.6);
  text-underline-offset: 3px;
  transition: all 0.3s;
  padding: 0;
  flex-shrink: 0;
}

.max-button:hover {
  color: #ffed4e;
  text-decoration-color: rgba(255, 215, 0, 0.9);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

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
}
</style>

