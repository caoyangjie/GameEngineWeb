<template>
  <div class="payment-container">
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
    </div>

    <TopHeader @toggle-sidebar="toggleSidebar" />

    <main class="payment-main-content">
      <div class="payment-panel">
        <div class="payment-title">{{ t('payment.alipay.cancel.title') }}</div>
        
        <form @submit.prevent="handleSubmit" class="payment-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ t('payment.common.paymentConfig') }} <span class="required">*</span></label>
              <CustomSelect
                v-model="formData.configId"
                :options="configOptions"
                :placeholder="t('payment.common.paymentConfigPlaceholder')"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('payment.common.outTradeNo') }} <span class="required">*</span></label>
              <CustomInput
                v-model="formData.outTradeNo"
                :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                required
              />
            </div>
          </div>
          
          <button type="submit" class="submit-button cancel">
            <span>{{ t('payment.common.cancelOrder') }}</span>
          </button>
          
          <div v-if="result" :class="['result-container', result.success ? 'result-success' : 'result-error']">
            <div class="result-title">{{ result.success ? t('payment.common.success') : t('payment.common.failed') }}</div>
            <div class="result-message">{{ result.message }}</div>
            <pre v-if="result.data" class="result-data">{{ JSON.stringify(result.data, null, 2) }}</pre>
          </div>
        </form>
      </div>
    </main>

    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="payment"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomInput from '../common/CustomInput.vue'
import CustomSelect from '../common/CustomSelect.vue'
import { getPaymentConfigList, alipayCancel } from '../../api/payment.js'

const { t } = useI18n()
const sidebarOpen = ref(false)

const formData = reactive({
  configId: null,
  outTradeNo: ''
})

const configOptions = ref([])
const result = ref(null)

onMounted(() => {
  loadConfigs()
})

const loadConfigs = async () => {
  try {
    const response = await getPaymentConfigList('ALIPAY')
    if (response.code === 200 && response.data) {
      configOptions.value = response.data
        .filter(config => config.enabled === 1)
        .map(config => ({
          value: config.id,
          label: `${config.configName} (${config.appId})`
        }))
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

const handleSubmit = async () => {
  try {
    const response = await alipayCancel({
      configId: formData.configId,
      outTradeNo: formData.outTradeNo
    })
    
    if (response.code === 200 && response.data) {
      result.value = {
        success: response.data.success,
        message: response.data.message || (response.data.success ? t('payment.common.cancelSuccess') : t('payment.common.cancelFailed')),
        data: response.data
      }
    } else {
      result.value = {
        success: false,
        message: response.msg || t('payment.common.cancelFailed')
      }
    }
  } catch (error) {
    result.value = {
      success: false,
      message: error.message || t('payment.common.requestFailed')
    }
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  toggleSidebar()
}
</script>

<style scoped>
.payment-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

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

.payment-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 200px;
  min-height: calc(100vh - 150px);
}

.payment-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  max-width: 840px;
  margin: 0 auto;
}

.payment-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.form-label .required {
  color: #ff4444;
  margin-left: 4px;
}

.submit-button {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
  border: none;
  border-radius: 8px;
  padding: 12px 40px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.submit-button.cancel {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%);
  color: white;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
}

.submit-button.cancel:hover {
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.result-container {
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
  animation: slideDown 0.3s ease;
}

.result-success {
  background: rgba(16, 185, 129, 0.2);
  border: 2px solid rgba(16, 185, 129, 0.5);
  color: #10b981;
}

.result-error {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.result-message {
  margin-bottom: 10px;
}

.result-data {
  background: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .payment-main-content {
    padding: 20px;
    padding-top: 150px;
  }
}
</style>

