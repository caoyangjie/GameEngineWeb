<template>
  <div class="deposit-container">
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
    <main class="deposit-main-content">
      <!-- USD 钱包面板 -->
      <div class="wallet-panel">
        <div class="wallet-title">{{ t('deposit.usdWallet') }}</div>
        <div class="wallet-balance">
          <div class="balance-icon">💰</div>
          <div class="balance-icon">💰</div>
          <div class="balance-info">
            <div class="balance-label">{{ t('deposit.usdBalance') }}</div>
            <div class="balance-value">{{ usdBalance }} USD</div>
          </div>
        </div>
        <div class="wallet-actions">
          <button class="action-button withdraw-btn" @click="handleWithdraw">
            {{ t('deposit.withdraw') }}
          </button>
          <button class="action-button buy-vt-btn" @click="handleBuyVT">
            {{ t('deposit.buyVT') }}
          </button>
        </div>
      </div>

      <!-- 二维码区域 -->
      <div class="qr-codes-section">
        <!-- BEP20 地址 -->
        <div class="qr-code-item">
          <div class="qr-label">{{ t('deposit.bep20Address') }}</div>
          <div class="qr-code-wrapper">
            <canvas ref="bep20QrCanvas" class="qr-canvas"></canvas>
          </div>
          <div class="address-wrapper">
            <span class="address-text">{{ bep20Address }}</span>
            <button class="copy-button" @click="copyAddress(bep20Address)">
              <span class="copy-icon">📋</span>
            </button>
          </div>
        </div>

        <!-- TRC20 地址 -->
        <div class="qr-code-item">
          <div class="qr-label">{{ t('deposit.trc20Address') }}</div>
          <div class="qr-code-wrapper">
            <canvas ref="trc20QrCanvas" class="qr-canvas"></canvas>
          </div>
          <div class="address-wrapper">
            <span class="address-text">{{ trc20Address }}</span>
            <button class="copy-button" @click="copyAddress(trc20Address)">
              <span class="copy-icon">📋</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="deposit"
      @close="handleSidebarClose"
    />

    <!-- 购买VT弹窗 -->
    <div class="modal-overlay" v-if="showBuyVTModal" @click="showBuyVTModal = false">
      <div class="modal-content buy-vt-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ t('buyVT.title') }}</h3>
          <button class="modal-close" @click="showBuyVTModal = false">×</button>
        </div>
        <div class="modal-body">
          <!-- USD余额 -->
          <div class="form-row">
            <div class="form-label">{{ t('buyVT.usdBalance') }}</div>
            <div class="form-value">{{ usdBalance }}</div>
          </div>

          <!-- VT价格 -->
          <div class="vt-price-section">
            <div class="vt-price-icon">
              <div class="coin-icon blue">V</div>
              <div class="coin-icon yellow">●</div>
            </div>
            <div class="vt-price-info">
              <span class="vt-price-label">{{ t('buyVT.vtPrice') }}</span>
              <span class="vt-price-value">{{ vtPrice }} USD</span>
            </div>
          </div>

          <!-- 购买金额 -->
          <div class="form-section">
            <div class="form-section-header">
              <span class="section-label">{{ t('buyVT.purchaseAmount') }}</span>
            </div>
            <div class="form-section-content">
              <div class="amount-input-wrapper">
                <CustomNumberInput
                  id="purchase-amount"
                  v-model="buyVTForm.amount"
                  :placeholder="t('buyVT.enterAmount')"
                  @change="calculateVTReceivable"
                />
                <button class="max-button" @click="setMaxAmount">{{ t('buyVT.max') }}</button>
              </div>
            </div>
          </div>

          <!-- 应收VT -->
          <div class="form-section">
            <div class="form-section-header">
              <span class="section-label">{{ t('buyVT.vtReceivable') }}</span>
            </div>
            <div class="form-section-content">
              <div class="vt-receivable-value">{{ vtReceivable }}</div>
            </div>
          </div>

          <!-- 按钮 -->
          <div class="modal-buttons">
            <button class="modal-button cancel" @click="showBuyVTModal = false">{{ t('buyVT.cancel') }}</button>
            <button class="modal-button confirm" @click="handleBuyVTConfirm">{{ t('buyVT.confirm') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提款弹窗 -->
    <div class="modal-overlay" v-if="showWithdrawalModal" @click="showWithdrawalModal = false">
      <div class="modal-content withdrawal-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ t('withdrawal.title') }}</h3>
          <button class="modal-close" @click="showWithdrawalModal = false">×</button>
        </div>
        <div class="modal-body">
          <!-- USD余额 -->
          <div class="form-row">
            <div class="form-label">{{ t('withdrawal.usdBalance') }}</div>
            <div class="form-value">{{ usdBalance }} USD</div>
          </div>

          <!-- 提款金额和提现地址 -->
          <div class="form-section">
            <div class="form-section-header">
              <span class="section-label">{{ t('withdrawal.withdrawalAmount') }}</span>
            </div>
            <div class="form-section-content">
              <CustomNumberInput
                id="withdrawal-amount"
                v-model="withdrawalForm.amount"
                :placeholder="t('withdrawal.amountPlaceholder')"
                @change="calculateExpectedUSDT"
              />
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header">
              <span class="section-label">{{ t('withdrawal.withdrawalAddress') }}</span>
            </div>
            <div class="form-section-content">
              <input
                id="withdrawal-address"
                v-model="withdrawalForm.address"
                type="text"
                class="amount-input"
                :placeholder="t('withdrawal.addressPlaceholder')"
              />
            </div>
          </div>

          <!-- 提现类型和应收 USDT -->
          <div class="form-section">
            <div class="form-section-header">
              <span class="section-label">{{ t('withdrawal.withdrawalType') }}</span>
            </div>
            <div class="form-section-content">
              <CustomSelect
                id="withdrawal-type"
                v-model="withdrawalForm.type"
                :options="withdrawalTypeOptions"
                @change="calculateExpectedUSDT"
              />
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header">
              <span class="section-label">{{ t('withdrawal.expectedUSDT') }}</span>
            </div>
            <div class="form-section-content">
              <div class="vt-receivable-value">{{ expectedUSDT }}</div>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="form-note">
            <p>{{ t('withdrawal.bep20Note') }}</p>
          </div>

          <!-- 按钮 -->
          <div class="modal-buttons">
            <button class="modal-button cancel" @click="showWithdrawalModal = false">{{ t('buyVT.cancel') }}</button>
            <button class="modal-button confirm" @click="handleWithdrawalConfirm">{{ t('withdrawal.withdraw') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomSelect from '../common/CustomSelect.vue'
import CustomNumberInput from '../common/CustomNumberInput.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)
const showBuyVTModal = ref(false)
const showWithdrawalModal = ref(false)

// USD 余额
const usdBalance = ref('8.711')

// VT价格
const vtPrice = ref('1.0200')

// 购买VT表单
const buyVTForm = reactive({
  amount: ''
})

// 提款表单
const withdrawalForm = reactive({
  amount: '',
  address: '',
  type: 'normal'
})

// 提款类型选项
const withdrawalTypeOptions = computed(() => [
  { value: 'normal', label: t('withdrawal.normalType') },
  { value: 'priority', label: t('withdrawal.priorityType') }
])

// 计算应收VT
const vtReceivable = computed(() => {
  const amount = parseFloat(buyVTForm.amount) || 0
  if (amount <= 0) return '0.000'
  const receivable = amount / parseFloat(vtPrice.value)
  return receivable.toFixed(3)
})

// 计算应收 USDT
const expectedUSDT = computed(() => {
  const amount = parseFloat(withdrawalForm.amount) || 0
  if (amount <= 0) return '0.00'
  
  // 普通类型：无手续费
  if (withdrawalForm.type === 'normal') {
    return amount.toFixed(2)
  }
  // 优先类型：2%手续费
  const fee = amount * 0.02
  return (amount - fee).toFixed(2)
})

// 地址
const bep20Address = ref('0xCc3df0Ccdec9D6ADCD3AfD999D1282Bd1939d8cd')
const trc20Address = ref('TQfvBWeQwkvHXaaZZbdfZ6YGxENgyqqwMn')

// 二维码 canvas 引用
const bep20QrCanvas = ref(null)
const trc20QrCanvas = ref(null)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 现在直接使用 router，只需要处理关闭事件
const handleSidebarClose = () => {
  toggleSidebar()
}

const handleGoToJourney = () => {
  router.goToJourney()
}

const handleGoToDeposit = () => {
  // 已经在存款页面，无需跳转
}

const handleWithdraw = () => {
  showWithdrawalModal.value = true
  withdrawalForm.amount = ''
  withdrawalForm.address = ''
  withdrawalForm.type = 'normal'
}

const handleBuyVT = () => {
  showBuyVTModal.value = true
  buyVTForm.amount = ''
}

const calculateVTReceivable = () => {
  // 计算逻辑已在 computed 中处理
}

const setMaxAmount = () => {
  buyVTForm.amount = usdBalance.value
}

const handleBuyVTConfirm = () => {
  // 验证输入
  if (!buyVTForm.amount || parseFloat(buyVTForm.amount) <= 0) {
    alert(t('buyVT.pleaseEnterAmount'))
    return
  }
  
  if (parseFloat(buyVTForm.amount) > parseFloat(usdBalance.value)) {
    alert(t('buyVT.insufficientBalance'))
    return
  }
  
  // 提交购买请求
  console.log('购买VT请求:', {
    amount: buyVTForm.amount,
    vtReceivable: vtReceivable.value,
    vtPrice: vtPrice.value
  })
  
  // TODO: 调用实际的购买 API
  alert(t('buyVT.purchaseSuccess'))
  showBuyVTModal.value = false
  buyVTForm.amount = ''
}

const calculateExpectedUSDT = () => {
  // 计算逻辑已在 computed 中处理
  // 当类型改变时，computed 会自动重新计算
}

const isValidBep20Address = (address) => {
  // 简单验证 BEP20 地址格式
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

const handleWithdrawalConfirm = () => {
  // 验证输入
  if (!withdrawalForm.amount || parseFloat(withdrawalForm.amount) <= 0) {
    alert(t('withdrawal.pleaseEnterAmount'))
    return
  }
  
  if (parseFloat(withdrawalForm.amount) > parseFloat(usdBalance.value)) {
    alert(t('withdrawal.insufficientBalance'))
    return
  }
  
  if (!withdrawalForm.address) {
    alert(t('withdrawal.pleaseEnterAddress'))
    return
  }
  
  if (!isValidBep20Address(withdrawalForm.address)) {
    alert(t('withdrawal.invalidBep20Address'))
    return
  }
  
  // 提交提款请求
  console.log('提款请求:', {
    amount: withdrawalForm.amount,
    address: withdrawalForm.address,
    type: withdrawalForm.type,
    expectedUSDT: expectedUSDT.value
  })
  
  // TODO: 调用实际的提款 API
  alert(t('withdrawal.withdrawalSubmitted'))
  showWithdrawalModal.value = false
  withdrawalForm.amount = ''
  withdrawalForm.address = ''
  withdrawalForm.type = 'normal'
}

const copyAddress = async (address) => {
  try {
    await navigator.clipboard.writeText(address)
    alert(t('deposit.addressCopied'))
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = address
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      alert(t('deposit.addressCopied'))
    } catch (e) {
      alert(t('deposit.copyFailed'))
    }
    document.body.removeChild(textArea)
  }
}

// 生成二维码
const generateQRCode = (canvas, text) => {
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const size = 200
  canvas.width = size
  canvas.height = size
  
  // 简单的二维码生成（使用简单的方块图案模拟）
  // 实际项目中应该使用专业的二维码库，如 qrcode.js
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, size, size)
  
  // 绘制简单的二维码图案
  ctx.fillStyle = '#FFFFFF'
  const blockSize = size / 25
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      // 模拟二维码的随机模式
      if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
        ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize)
      }
    }
  }
  
  // 绘制定位标记（二维码的三个角）
  ctx.fillStyle = '#000000'
  // 左上角
  ctx.fillRect(0, 0, blockSize * 7, blockSize * 7)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(blockSize, blockSize, blockSize * 5, blockSize * 5)
  ctx.fillStyle = '#000000'
  ctx.fillRect(blockSize * 2, blockSize * 2, blockSize * 3, blockSize * 3)
  
  // 右上角
  ctx.fillStyle = '#000000'
  ctx.fillRect(size - blockSize * 7, 0, blockSize * 7, blockSize * 7)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(size - blockSize * 6, blockSize, blockSize * 5, blockSize * 5)
  ctx.fillStyle = '#000000'
  ctx.fillRect(size - blockSize * 5, blockSize * 2, blockSize * 3, blockSize * 3)
  
  // 左下角
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, size - blockSize * 7, blockSize * 7, blockSize * 7)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(blockSize, size - blockSize * 6, blockSize * 5, blockSize * 5)
  ctx.fillStyle = '#000000'
  ctx.fillRect(blockSize * 2, size - blockSize * 5, blockSize * 3, blockSize * 3)
}

onMounted(() => {
  generateQRCode(bep20QrCanvas.value, bep20Address.value)
  generateQRCode(trc20QrCanvas.value, trc20Address.value)
})
</script>

<style scoped>
.deposit-container {
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
.deposit-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 100px;
  min-height: calc(100vh - 150px);
}

/* USD 钱包面板 */
.wallet-panel {
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

.wallet-balance {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.balance-icon {
  font-size: 48px;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.balance-value {
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.wallet-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-button {
  flex: 1;
  max-width: 200px;
  padding: 15px 30px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 8px;
  color: #ffd700;
  font-size: 18px;
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

/* 二维码区域 */
.qr-codes-section {
  display: flex;
  gap: 40px;
  justify-content: center;
  max-width: 840px;
  margin-left: auto;
  margin-right: auto;
}

.qr-code-item {
  flex: 1;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.qr-label {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.qr-code-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
}

.qr-canvas {
  width: 200px;
  height: 200px;
  display: block;
}

.address-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 12px 15px;
}

.address-text {
  flex: 1;
  color: white;
  font-size: 14px;
  word-break: break-all;
  font-family: 'Courier New', monospace;
}

.copy-button {
  flex-shrink: 0;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.copy-button:hover {
  background: rgba(255, 215, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.8);
  transform: scale(1.1);
}

.copy-icon {
  font-size: 16px;
  display: block;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .deposit-main-content {
    padding: 30px 20px;
  }

  .qr-codes-section {
    flex-direction: column;
    align-items: center;
  }

  .qr-code-item {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .deposit-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .wallet-balance {
    flex-direction: column;
    gap: 10px;
  }

  .balance-icon {
    font-size: 36px;
  }

  .balance-value {
    font-size: 24px;
  }

  .wallet-actions {
    flex-direction: column;
  }

  .action-button {
    max-width: 100%;
  }
}

/* 购买VT弹窗样式 - 参考MidoxPage.vue */
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

.buy-vt-modal {
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
  position: relative;
}

/* 装饰性边框角 */
.buy-vt-modal::before,
.buy-vt-modal::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 215, 0, 0.6);
}

.buy-vt-modal::before {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 5px;
}

.buy-vt-modal::after {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 5px;
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
  font-weight: bold;
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

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.form-label {
  font-size: 16px;
  color: rgba(255, 215, 0, 0.9);
  font-weight: 500;
}

.form-value {
  font-size: 18px;
  color: #ffd700;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

/* VT价格区域 */
.vt-price-section {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  margin: 10px 0;
}

.vt-price-icon {
  display: flex;
  gap: 5px;
  align-items: center;
}

.coin-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.coin-icon.blue {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  color: white;
  z-index: 2;
  margin-right: -8px;
}

.coin-icon.yellow {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #1a0a2e;
  z-index: 1;
}

.vt-price-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.vt-price-label {
  font-size: 14px;
  color: rgba(255, 215, 0, 0.8);
}

.vt-price-value {
  font-size: 20px;
  color: #ffa500;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 165, 0, 0.6);
}

/* 表单区域（带金色边框） */
.form-section {
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  padding: 15px;
  background: rgba(255, 215, 0, 0.05);
  margin: 10px 0;
}

.form-section-header {
  margin-bottom: 10px;
}

.section-label {
  font-size: 16px;
  color: rgba(255, 215, 0, 0.9);
  font-weight: 500;
}

.form-section-content {
  display: flex;
  align-items: center;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.amount-input {
  flex: 1;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  outline: none;
  transition: all 0.3s;
}

.amount-input:focus {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.amount-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.max-button {
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 6px;
  color: #ffd700;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
  box-shadow: 
    0 0 10px rgba(255, 215, 0, 0.2),
    inset 0 0 10px rgba(255, 215, 0, 0.1);
}

.max-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.4),
    inset 0 0 15px rgba(255, 215, 0, 0.2);
  transform: translateY(-1px);
}

.vt-receivable-value {
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: #ffa500;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 165, 0, 0.6);
  width: 100%;
}

/* 按钮区域 */
.modal-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.modal-button {
  flex: 1;
  padding: 15px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
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
    0 0 15px rgba(255, 215, 0, 0.4),
    0 2px 10px rgba(255, 140, 0, 0.3);
}

.modal-button.confirm:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 1) 0%,
    rgba(255, 165, 0, 1) 100%
  );
  box-shadow: 
    0 0 25px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 140, 0, 0.4);
  transform: translateY(-2px);
}

.modal-button.cancel {
  background: linear-gradient(
    135deg,
    rgba(100, 100, 100, 0.9) 0%,
    rgba(70, 70, 70, 0.9) 100%
  );
  border-color: rgba(150, 150, 150, 1);
  color: white;
  box-shadow: 
    0 0 10px rgba(100, 100, 100, 0.3),
    0 2px 8px rgba(70, 70, 70, 0.2);
}

.modal-button.cancel:hover {
  background: linear-gradient(
    135deg,
    rgba(120, 120, 120, 1) 0%,
    rgba(90, 90, 90, 1) 100%
  );
  box-shadow: 
    0 0 15px rgba(120, 120, 120, 0.4),
    0 4px 12px rgba(90, 90, 90, 0.3);
  transform: translateY(-2px);
}

/* 提款弹窗样式 - 复用购买VT弹窗样式 */
.withdrawal-modal {
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
  position: relative;
}

/* 装饰性边框角 */
.withdrawal-modal::before,
.withdrawal-modal::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 215, 0, 0.6);
}

.withdrawal-modal::before {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 5px;
}

.withdrawal-modal::after {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 5px;
}

/* 下拉选择框样式 */
.field-select {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  outline: none;
  transition: all 0.3s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffd700' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  padding-right: 40px;
}

.field-select:focus {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.field-select option {
  background: #1a0a2e;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .buy-vt-modal,
  .withdrawal-modal {
    padding: 20px;
    width: 95%;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .amount-input-wrapper {
    flex-direction: column;
  }

  .max-button {
    width: 100%;
  }
}
</style>

