<template>
  <div class="midox-container">
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
    <main class="midox-main-content">
      <!-- 标题 -->
      <div class="title-section">
        <div class="title-banner">
          <span class="title-icon">🔮</span>
          <span class="title-text">MIDOX</span>
        </div>
      </div>

      <!-- 功能卡片区域 -->
      <div class="features-section">
        <!-- Transfer Voyager Token 卡片 -->
        <div class="feature-card" @click="showTransferModal = true">
          <div class="feature-icon">💸</div>
          <h3 class="feature-title">{{ t('midox.transfer') }}</h3>
          <p class="feature-subtitle">{{ t('midox.voyagerToken') }}</p>
        </div>

        <!-- Harvest Vault 卡片 -->
        <div class="feature-card" @click="showHarvestModal = true">
          <div class="feature-icon">🌾</div>
          <h3 class="feature-title">{{ t('midox.harvestVault') }}</h3>
          <p class="feature-subtitle">{{ t('midox.spiritPower') }}</p>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.MIDOX"
      @close="handleSidebarClose"
    />

    <!-- Transfer Voyager Token 模态框 -->
    <div class="modal-overlay" v-if="showTransferModal" @click="showTransferModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ t('midox.transfer') }}</h3>
          <button class="modal-close" @click="showTransferModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <div class="balance-display">
              <span class="balance-label">{{ t('midox.voyagerToken') }} - {{ t('midox.voyagerTokenBalance') }}</span>
              <span class="balance-value">{{ voyagerTokenBalance }}</span>
            </div>
          </div>
          <div class="form-group">
            <label for="transfer-amount">{{ t('midox.amount') }}</label>
            <input
              id="transfer-amount"
              type="number"
              v-model="transferForm.amount"
              :placeholder="t('midox.amount')"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="transfer-username">{{ t('midox.username') }}</label>
            <input
              id="transfer-username"
              type="text"
              v-model="transferForm.username"
              :placeholder="t('midox.username')"
              class="form-input"
              required
            />
          </div>
          <div class="form-note">
            <p>{{ t('midox.transferNote') }}</p>
          </div>
          <button class="modal-submit" @click="handleTransfer">{{ t('midox.submit') }}</button>
        </div>
      </div>
    </div>

    <!-- Harvest Vault 模态框 -->
    <div class="modal-overlay" v-if="showHarvestModal" @click="showHarvestModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ t('midox.harvestVault') }}</h3>
          <button class="modal-close" @click="showHarvestModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="harvest-spirit-power">{{ t('midox.spiritPower') }}</label>
            <div class="spirit-power-display">
              <input
                id="harvest-spirit-power"
                type="number"
                v-model="harvestForm.spiritPower"
                class="form-input"
                :placeholder="t('midox.spiritPower')"
              />
            </div>
          </div>
          <div class="form-note">
            <p>{{ t('midox.harvestNote') }}</p>
          </div>
          <button class="modal-submit" @click="handleHarvest">{{ t('midox.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- Success 对话框 -->
    <div class="modal-overlay" v-if="showSuccessModal" @click="showSuccessModal = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-icon success">✓</div>
        <h3 class="dialog-title">{{ t('midox.success') }}</h3>
        <p class="dialog-message" v-if="successMessage">{{ successMessage }}</p>
        <button class="dialog-button" @click="handleSuccessClose">{{ t('midox.okay') }}</button>
      </div>
    </div>

    <!-- Failed 对话框 -->
    <div class="modal-overlay" v-if="showFailedModal" @click="showFailedModal = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-icon failed">✗</div>
        <h3 class="dialog-title">{{ t('midox.failed') }}</h3>
        <p class="dialog-message" v-if="failedMessage">{{ failedMessage }}</p>
        <button class="dialog-button" @click="showFailedModal = false">{{ t('midox.okay') }}</button>
      </div>
    </div>

    <!-- Confirm 对话框 -->
    <div class="modal-overlay" v-if="showConfirmModal" @click="showConfirmModal = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-icon confirm">?</div>
        <h3 class="dialog-title">{{ t('midox.confirm') }}</h3>
        <p class="dialog-message" v-if="confirmMessage">{{ confirmMessage }}</p>
        <div class="dialog-buttons">
          <button class="dialog-button cancel" @click="showConfirmModal = false">{{ t('midox.cancel') }}</button>
          <button class="dialog-button confirm" @click="handleConfirm">{{ t('midox.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- 2FA Key 对话框 -->
    <div class="modal-overlay" v-if="show2FAModal" @click="show2FAModal = false">
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">{{ t('midox.twoFAKey') }}</h3>
        <div class="form-group">
          <input
            type="text"
            v-model="twoFAForm.code"
            :placeholder="t('midox.enter2FA')"
            class="form-input"
            required
          />
        </div>
        <button class="dialog-button" @click="handle2FA">{{ t('midox.submit') }}</button>
      </div>
    </div>

    <!-- Coming Soon 对话框 -->
    <div class="modal-overlay" v-if="showComingSoonModal" @click="showComingSoonModal = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-icon coming-soon">🚧</div>
        <h3 class="dialog-title">{{ t('midox.comingSoon') }}</h3>
        <button class="dialog-button" @click="showComingSoonModal = false">{{ t('midox.okay') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TopHeader from './TopHeader.vue'
import Sidebar from './Sidebar.vue'
import { useRouter, ROUTES } from '../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)
const showTransferModal = ref(false)
const showHarvestModal = ref(false)
const showSuccessModal = ref(false)
const showFailedModal = ref(false)
const showConfirmModal = ref(false)
const show2FAModal = ref(false)
const showComingSoonModal = ref(false)

const successMessage = ref('')
const failedMessage = ref('')
const confirmMessage = ref('')
const confirmCallback = ref(null)

const voyagerTokenBalance = ref('10000.00')

const transferForm = reactive({
  amount: '',
  username: ''
})

const harvestForm = reactive({
  spiritPower: '10000'
})

const twoFAForm = reactive({
  code: ''
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const handleGoToJourney = () => {
  router.goToJourney()
}

const handleGoToDeposit = () => {
  router.goToDeposit()
}

const handleTransfer = () => {
  if (!transferForm.amount || !transferForm.username) {
    showFailedModal.value = true
    failedMessage.value = t('midox.fillAllFields')
    return
  }
  showTransferModal.value = false
  showSuccessModal.value = true
  successMessage.value = t('midox.transferSuccess')
  // 重置表单
  transferForm.amount = ''
  transferForm.username = ''
}

const handleHarvest = () => {
  showHarvestModal.value = false
  showSuccessModal.value = true
  successMessage.value = t('midox.harvestSuccess')
}

const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
  showConfirmModal.value = false
}

const handle2FA = () => {
  if (!twoFAForm.code) {
    showFailedModal.value = true
    failedMessage.value = t('midox.enter2FA')
    return
  }
  show2FAModal.value = false
  showSuccessModal.value = true
  successMessage.value = t('midox.twoFASuccess')
  twoFAForm.code = ''
}

const handleSuccessClose = () => {
  showSuccessModal.value = false
  // 如果成功消息包含重定向提示，可以在这里处理
  if (successMessage.value.includes('redirect')) {
    router.goToHome()
  }
}
</script>

<style scoped>
.midox-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
}

/* 背景层样式 - 复用 HomePage 的背景 */
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
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
    #1a0a2e 0%,
    #2d1b4e 15%,
    #4a2c6a 30%,
    #6b3d8a 45%,
    #8b4ca8 60%,
    #5a2d5a 75%,
    #3d1f3d 90%,
    #1a0a1a 100%
  );
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(3px 3px at 20% 30%, #ffd700, transparent),
    radial-gradient(2px 2px at 60% 70%, #fff, transparent),
    radial-gradient(2px 2px at 50% 50%, #ff6b9d, transparent),
    radial-gradient(1px 1px at 80% 10%, #fff, transparent),
    radial-gradient(3px 3px at 90% 40%, #ffd700, transparent);
  background-repeat: repeat;
  background-size: 200% 200%;
  animation: twinkle 2s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.galaxy {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 500px;
  background: 
    radial-gradient(
      ellipse at center,
      rgba(255, 215, 0, 0.4) 0%,
      rgba(255, 107, 157, 0.3) 20%,
      rgba(138, 43, 226, 0.3) 40%,
      rgba(75, 0, 130, 0.2) 60%,
      transparent 80%
    );
  border-radius: 50%;
  filter: blur(50px);
  animation: rotate 25s linear infinite;
  z-index: 2;
}

@keyframes rotate {
  from { transform: translateX(-50%) rotate(0deg); }
  to { transform: translateX(-50%) rotate(360deg); }
}

.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: 
    linear-gradient(to top, #1a0a0a 0%, rgba(139, 0, 0, 0.3) 30%, transparent 100%);
  opacity: 0.9;
  z-index: 2;
}

.temple-background {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: 
    radial-gradient(
      ellipse at center bottom,
      rgba(255, 215, 0, 0.1) 0%,
      rgba(255, 140, 0, 0.08) 30%,
      transparent 70%
    );
  z-index: 2;
}

.forest-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: 
    linear-gradient(to top, rgba(0, 50, 0, 0.3) 0%, transparent 100%);
  z-index: 2;
}

/* 主要内容区域 */
.midox-main-content {
  position: relative;
  z-index: 5;
  padding: 100px 40px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.title-section {
  margin-bottom: 50px;
  text-align: center;
}

.title-banner {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  padding: 20px 40px;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.15) 0%,
    rgba(255, 140, 0, 0.2) 50%,
    rgba(255, 215, 0, 0.15) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 15px;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(5px);
}

.title-icon {
  font-size: 40px;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
}

.title-text {
  font-size: 36px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 20px rgba(255, 215, 0, 0.8),
    0 0 40px rgba(255, 215, 0, 0.6),
    0 0 60px rgba(255, 215, 0, 0.4);
}

/* 功能卡片区域 */
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.feature-card {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 140, 0, 0.15) 50%,
    rgba(255, 215, 0, 0.1) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.2),
    inset 0 0 20px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(5px);
}

.feature-card:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.2) 0%,
    rgba(255, 140, 0, 0.25) 50%,
    rgba(255, 215, 0, 0.2) 100%
  );
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 64px;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  display: block;
}

.feature-title {
  font-size: 24px;
  color: #ffd700;
  margin-bottom: 10px;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.6);
}

.feature-subtitle {
  font-size: 16px;
  color: rgba(255, 215, 0, 0.8);
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

/* 模态框样式 */
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  color: #ffd700;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

.form-input {
  width: 100%;
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  color: #ffd700;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.form-input::placeholder {
  color: rgba(255, 215, 0, 0.5);
}

.balance-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
}

.balance-label {
  color: rgba(255, 215, 0, 0.8);
  font-size: 14px;
}

.balance-value {
  color: #ffd700;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

.spirit-power-display {
  display: flex;
  align-items: center;
}

.spirit-power-display .form-input {
  width: 100%;
}

.form-note {
  padding: 15px;
  background: rgba(255, 215, 0, 0.05);
  border-left: 3px solid rgba(255, 215, 0, 0.5);
  border-radius: 5px;
}

.form-note p {
  color: rgba(255, 215, 0, 0.8);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

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

/* 对话框样式 */
.dialog-content {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(20, 10, 0, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 15px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 
    0 0 50px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  animation: slideUp 0.3s ease;
}

.dialog-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 20px;
  font-weight: bold;
}

.dialog-icon.success {
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.3), rgba(0, 200, 0, 0.3));
  color: #00ff00;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
}

.dialog-icon.failed {
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(200, 0, 0, 0.3));
  color: #ff0000;
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
}

.dialog-icon.confirm {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.3));
  color: #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.dialog-icon.coming-soon {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.3));
  color: #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.dialog-title {
  font-size: 24px;
  color: #ffd700;
  margin-bottom: 15px;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.6);
}

.dialog-message {
  color: rgba(255, 215, 0, 0.9);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 25px;
}

.dialog-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.dialog-button {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.9) 0%,
    rgba(255, 140, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 1);
  border-radius: 8px;
  color: #1a0a2e;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.4),
    0 2px 10px rgba(255, 140, 0, 0.3);
}

.dialog-button:hover {
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

.dialog-button.cancel {
  background: linear-gradient(
    135deg,
    rgba(100, 100, 100, 0.9) 0%,
    rgba(70, 70, 70, 0.9) 100%
  );
  border-color: rgba(150, 150, 150, 1);
  color: white;
}

.dialog-button.cancel:hover {
  background: linear-gradient(
    135deg,
    rgba(120, 120, 120, 1) 0%,
    rgba(90, 90, 90, 1) 100%
  );
}

/* 响应式设计 */
@media (max-width: 768px) {
  .midox-main-content {
    padding: 100px 20px 20px;
  }

  .features-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal-content,
  .dialog-content {
    padding: 20px;
  }
}
</style>

