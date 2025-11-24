<template>
  <div class="payment-config-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
    </div>

    <TopHeader @toggle-sidebar="toggleSidebar" />

    <main class="config-main-content">
      <div class="page-header">
        <h1 class="page-title">{{ t('payment.config.title') }}</h1>
        <button class="btn-primary" @click="handleAdd">
          + {{ t('payment.config.addConfig') }}
        </button>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="filter-row">
          <div class="filter-field">
            <div class="filter-label">{{ t('payment.config.search.paymentType') }}</div>
            <CustomSelect
              v-model="paymentTypeFilter"
              :options="paymentTypeFilterOptions"
              :placeholder="t('payment.config.search.all')"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">{{ t('payment.config.search.configName') }}</div>
            <CustomInput
              v-model="configNameFilter"
              :placeholder="t('payment.config.search.configNamePlaceholder')"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">{{ t('payment.config.search.enabledStatus') }}</div>
            <CustomSelect
              v-model="enabledFilter"
              :options="enabledFilterOptions"
              :placeholder="t('payment.config.search.all')"
            />
          </div>
          <div class="filter-field filter-field-button">
            <div class="filter-label">&nbsp;</div>
            <button class="btn-reset" @click="handleReset">
              {{ t('payment.config.search.reset') }}
            </button>
          </div>
        </div>
        <button class="btn-search" @click="handleSearch">
          {{ t('payment.config.search.search') }}
        </button>
      </div>

      <div class="config-panel">
        <div class="config-list">
          <div v-for="config in configList" :key="config.id" class="config-item">
            <div class="config-item-header">
              <div class="config-item-title">
                <span class="config-name">{{ config.configName }}</span>
                <span :class="['config-type', getTypeClass(config.paymentType)]">
                  {{ getTypeName(config.paymentType) }}
                </span>
                <span :class="['config-status', config.enabled === 1 ? 'status-enabled' : 'status-disabled']">
                  {{ config.enabled === 1 ? t('payment.config.list.enabled') : t('payment.config.list.disabled') }}
                </span>
              </div>
              <div class="config-item-actions">
                <button class="action-button edit" @click="handleEdit(config)">{{ t('payment.config.list.edit') }}</button>
                <button class="action-button delete" @click="handleDelete(config.id)">{{ t('payment.config.list.delete') }}</button>
              </div>
            </div>
            <div class="config-item-body">
              <div class="config-info-row">
                <span class="info-label">{{ t('payment.config.list.appId') }}</span>
                <span class="info-value">{{ config.appId || '-' }}</span>
              </div>
              <div class="config-info-row">
                <span class="info-label">{{ t('payment.config.list.mchId') }}</span>
                <span class="info-value">{{ config.mchId || '-' }}</span>
              </div>
              <div v-if="config.remark" class="config-info-row">
                <span class="info-label">{{ t('payment.config.list.remark') }}</span>
                <span class="info-value">{{ config.remark }}</span>
              </div>
              
              <!-- 功能按钮区域 -->
              <div v-if="config.enabled === 1" class="config-functions">
                <div class="functions-title">{{ t('payment.config.list.functions') }}</div>
                <div class="functions-buttons">
                  <!-- 支付宝功能按钮 -->
                  <template v-if="config.paymentType === 'ALIPAY'">
                    <button class="function-btn" @click="openPaymentModal(config, 'ALIPAY', 'web-site')">
                      {{ t('payment.config.functions.alipay.webSite') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'ALIPAY', 'mobile-site')">
                      {{ t('payment.config.functions.alipay.mobileSite') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'ALIPAY', 'pre-create')">
                      {{ t('payment.config.functions.alipay.preCreate') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'ALIPAY', 'pay')">
                      {{ t('payment.config.functions.alipay.pay') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'ALIPAY', 'query')">
                      {{ t('payment.config.functions.alipay.query') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'ALIPAY', 'refund')">
                      {{ t('payment.config.functions.alipay.refund') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'ALIPAY', 'cancel')">
                      {{ t('payment.config.functions.alipay.cancel') }}
                    </button>
                  </template>
                  
                  <!-- 微信功能按钮 -->
                  <template v-else-if="config.paymentType === 'WECHAT'">
                    <button class="function-btn" @click="openPaymentModal(config, 'WECHAT', 'unified-order')">
                      {{ t('payment.config.functions.wechat.unifiedOrder') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'WECHAT', 'micro-pay')">
                      {{ t('payment.config.functions.wechat.microPay') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'WECHAT', 'query')">
                      {{ t('payment.config.functions.wechat.query') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'WECHAT', 'refund')">
                      {{ t('payment.config.functions.wechat.refund') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'WECHAT', 'close-order')">
                      {{ t('payment.config.functions.wechat.closeOrder') }}
                    </button>
                  </template>
                  
                  <!-- 翼支付功能按钮 -->
                  <template v-else-if="config.paymentType === 'BESTPAY'">
                    <button class="function-btn" @click="openPaymentModal(config, 'BESTPAY', 'barcode')">
                      {{ t('payment.config.functions.bestpay.barcode') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'BESTPAY', 'query')">
                      {{ t('payment.config.functions.bestpay.query') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'BESTPAY', 'refund')">
                      {{ t('payment.config.functions.bestpay.refund') }}
                    </button>
                    <button class="function-btn" @click="openPaymentModal(config, 'BESTPAY', 'reverse')">
                      {{ t('payment.config.functions.bestpay.reverse') }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="configList.length === 0" class="empty-state">
			      <div class="empty-icon">🌳</div>
            <p>{{ t('payment.config.list.empty') }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 配置表单模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ editingConfig ? t('payment.config.editConfig') : t('payment.config.addConfig') }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSave" class="config-form">
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.paymentType') }} <span class="required">*</span></label>
              <CustomSelect
                v-model="formData.paymentType"
                :options="paymentTypeOptions"
                :placeholder="t('payment.config.form.paymentTypePlaceholder')"
                required
                :disabled="!!editingConfig"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.configName') }} <span class="required">*</span></label>
              <CustomInput
                v-model="formData.configName"
                :placeholder="t('payment.config.form.configNamePlaceholder')"
                required
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t('payment.config.form.appId') }}</label>
                <CustomInput
                  v-model="formData.appId"
                  :placeholder="t('payment.config.form.appIdPlaceholder')"
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('payment.config.form.mchId') }}</label>
                <CustomInput
                  v-model="formData.mchId"
                  :placeholder="t('payment.config.form.mchIdPlaceholder')"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.apiKey') }}</label>
              <CustomInput
                v-model="formData.apiKey"
                type="password"
                :placeholder="t('payment.config.form.apiKeyPlaceholder')"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.privateKey') }}</label>
              <CustomTextarea
                v-model="formData.privateKey"
                rows="4"
                :placeholder="t('payment.config.form.privateKeyPlaceholder')"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.alipayPublicKey') }}</label>
              <CustomTextarea
                v-model="formData.alipayPublicKey"
                rows="4"
                :placeholder="t('payment.config.form.alipayPublicKeyPlaceholder')"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t('payment.config.form.signType') }}</label>
                <CustomSelect
                  v-model="formData.signType"
                  :options="signTypeOptions"
                  :placeholder="t('payment.config.form.signTypePlaceholder')"
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('payment.config.form.enabled') }}</label>
                <CustomSelect
                  v-model="formData.enabled"
                  :options="enabledOptions"
                  :placeholder="t('payment.config.form.enabledPlaceholder')"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.notifyUrl') }}</label>
              <CustomInput
                v-model="formData.notifyUrl"
                :placeholder="t('payment.config.form.notifyUrlPlaceholder')"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.returnUrl') }}</label>
              <CustomInput
                v-model="formData.returnUrl"
                :placeholder="t('payment.config.form.returnUrlPlaceholder')"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.p12FilePath') }}</label>
              <CustomInput
                v-model="formData.p12FilePath"
                :placeholder="t('payment.config.form.p12FilePathPlaceholder')"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('payment.config.form.remark') }}</label>
              <CustomTextarea
                v-model="formData.remark"
                rows="2"
                :placeholder="t('payment.config.form.remarkPlaceholder')"
              />
            </div>
            
            <div class="modal-buttons">
              <button type="button" class="modal-button cancel" @click="showModal = false">{{ t('payment.config.form.cancel') }}</button>
              <button type="submit" class="modal-button confirm">{{ t('payment.config.form.save') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 支付功能弹窗 -->
    <PaymentFunctionModal
      v-model="showPaymentModal"
      :payment-type="currentPaymentType"
      :function-type="currentFunctionType"
      :config-id="currentConfigId"
      @close="handlePaymentModalClose"
    />

    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="payment-config"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomInput from '../common/CustomInput.vue'
import CustomSelect from '../common/CustomSelect.vue'
import CustomTextarea from '../common/CustomTextarea.vue'
import PaymentFunctionModal from './PaymentFunctionModal.vue'
import { getPaymentConfigList, savePaymentConfig, deletePaymentConfig } from '../../api/payment.js'
import { showAlert, showConfirm } from '../../utils/alert.js'

const { t } = useI18n()

const sidebarOpen = ref(false)
const configList = ref([])
const allConfigList = ref([]) // 保存所有配置数据，用于过滤
const showModal = ref(false)
const editingConfig = ref(null)

// 支付功能弹窗相关
const showPaymentModal = ref(false)
const currentPaymentType = ref('')
const currentFunctionType = ref('')
const currentConfigId = ref(null)

// 搜索过滤条件
const paymentTypeFilter = ref('')
const configNameFilter = ref('')
const enabledFilter = ref('')

const formData = reactive({
  paymentType: '',
  configName: '',
  appId: '',
  mchId: '',
  apiKey: '',
  privateKey: '',
  alipayPublicKey: '',
  signType: 'RSA2',
  enabled: 1,
  notifyUrl: '',
  returnUrl: '',
  p12FilePath: '',
  remark: ''
})

const paymentTypeOptions = computed(() => [
  { value: 'ALIPAY', label: t('payment.config.form.paymentTypeAlipay') },
  { value: 'WECHAT', label: t('payment.config.form.paymentTypeWechat') },
  { value: 'BESTPAY', label: t('payment.config.form.paymentTypeBestpay') }
])

const signTypeOptions = ref([
  { value: 'RSA', label: 'RSA' },
  { value: 'RSA2', label: 'RSA2' }
])

const enabledOptions = computed(() => [
  { value: 1, label: t('payment.config.list.enabled') },
  { value: 0, label: t('payment.config.list.disabled') }
])

const paymentTypeFilterOptions = computed(() => [
  { value: '', label: t('payment.config.search.all') },
  { value: 'ALIPAY', label: t('payment.config.form.paymentTypeAlipay') },
  { value: 'WECHAT', label: t('payment.config.form.paymentTypeWechat') },
  { value: 'BESTPAY', label: t('payment.config.form.paymentTypeBestpay') }
])

const enabledFilterOptions = computed(() => [
  { value: '', label: t('payment.config.search.all') },
  { value: 1, label: t('payment.config.list.enabled') },
  { value: 0, label: t('payment.config.list.disabled') }
])

const getTypeName = (type) => {
  const map = {
    'ALIPAY': t('payment.config.form.paymentTypeAlipay'),
    'WECHAT': t('payment.config.form.paymentTypeWechat'),
    'BESTPAY': t('payment.config.form.paymentTypeBestpay')
  }
  return map[type] || type
}

const getTypeClass = (type) => {
  const map = {
    'ALIPAY': 'type-alipay',
    'WECHAT': 'type-wechat',
    'BESTPAY': 'type-bestpay'
  }
  return map[type] || ''
}

onMounted(() => {
  loadConfigs()
})

const loadConfigs = async () => {
  try {
    const response = await getPaymentConfigList()
    if (response.code === 200 && response.data) {
      allConfigList.value = response.data
      applyFilters()
    }
  } catch (error) {
    console.error('加载配置列表失败:', error)
    showAlert(t('payment.config.messages.loadFailed') + ': ' + error.message)
  }
}

// 应用过滤条件
const applyFilters = () => {
  let filtered = [...allConfigList.value]
  
  // 按支付类型过滤
  if (paymentTypeFilter.value) {
    filtered = filtered.filter(config => config.paymentType === paymentTypeFilter.value)
  }
  
  // 按配置名称过滤（模糊匹配）
  if (configNameFilter.value) {
    const keyword = configNameFilter.value.toLowerCase()
    filtered = filtered.filter(config => 
      config.configName && config.configName.toLowerCase().includes(keyword)
    )
  }
  
  // 按启用状态过滤
  if (enabledFilter.value !== '') {
    const enabledValue = parseInt(enabledFilter.value)
    filtered = filtered.filter(config => config.enabled === enabledValue)
  }
  
  configList.value = filtered
}

// 搜索
const handleSearch = () => {
  applyFilters()
}

// 重置
const handleReset = () => {
  paymentTypeFilter.value = ''
  configNameFilter.value = ''
  enabledFilter.value = ''
  applyFilters()
}

const handleAdd = () => {
  editingConfig.value = null
  resetForm()
  showModal.value = true
}

const handleEdit = (config) => {
  editingConfig.value = config
  Object.assign(formData, {
    paymentType: config.paymentType,
    configName: config.configName,
    appId: config.appId || '',
    mchId: config.mchId || '',
    apiKey: config.apiKey || '',
    privateKey: config.privateKey || '',
    alipayPublicKey: config.alipayPublicKey || '',
    signType: config.signType || 'RSA2',
    enabled: config.enabled !== undefined ? config.enabled : 1,
    notifyUrl: config.notifyUrl || '',
    returnUrl: config.returnUrl || '',
    p12FilePath: config.p12FilePath || '',
    remark: config.remark || ''
  })
  showModal.value = true
}

const handleDelete = async (id) => {
  const confirmed = await showConfirm(t('payment.config.messages.deleteConfirm'))
  if (!confirmed) return
  
  try {
    const response = await deletePaymentConfig(id)
    if (response.code === 200) {
      showAlert(t('payment.config.messages.deleteSuccess'), { type: 'success' })
      await loadConfigs()
    } else {
      showAlert(response.msg || t('payment.config.messages.deleteFailed'))
    }
  } catch (error) {
    console.error('删除配置失败:', error)
    showAlert(t('payment.config.messages.deleteFailed') + ': ' + error.message)
  }
}

const handleSave = async () => {
  try {
    const data = { ...formData }
    if (editingConfig.value) {
      data.id = editingConfig.value.id
    }
    
    const response = await savePaymentConfig(data)
    if (response.code === 200) {
      showAlert(t('payment.config.messages.saveSuccess'), { type: 'success' })
      showModal.value = false
      await loadConfigs()
    } else {
      showAlert(response.msg || t('payment.config.messages.saveFailed'))
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    showAlert(t('payment.config.messages.saveFailed') + ': ' + error.message)
  }
}

const resetForm = () => {
  Object.assign(formData, {
    paymentType: '',
    configName: '',
    appId: '',
    mchId: '',
    apiKey: '',
    privateKey: '',
    alipayPublicKey: '',
    signType: 'RSA2',
    enabled: 1,
    notifyUrl: '',
    returnUrl: '',
    p12FilePath: '',
    remark: ''
  })
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  toggleSidebar()
}

// 打开支付功能弹窗
const openPaymentModal = (config, paymentType, functionType) => {
  currentPaymentType.value = paymentType
  currentFunctionType.value = functionType
  currentConfigId.value = config.id
  showPaymentModal.value = true
}

// 关闭支付功能弹窗
const handlePaymentModalClose = () => {
  showPaymentModal.value = false
  currentPaymentType.value = ''
  currentFunctionType.value = ''
  currentConfigId.value = null
}
</script>

<style scoped>
.payment-config-container {
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

.config-main-content {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 40px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 36px;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

/* 搜索区域 */
.search-section {
  margin-bottom: 30px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.filter-field-button {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-search {
  width: 100%;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
}

.btn-search:hover {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.btn-reset {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.config-panel {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.config-item {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.config-item:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.config-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.config-item-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.config-name {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
}

.config-type {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.type-alipay {
  background: rgba(0, 122, 255, 0.3);
  color: #007aff;
  border: 1px solid rgba(0, 122, 255, 0.5);
}

.type-wechat {
  background: rgba(7, 193, 96, 0.3);
  color: #07c160;
  border: 1px solid rgba(7, 193, 96, 0.5);
}

.type-bestpay {
  background: rgba(255, 140, 0, 0.3);
  color: #ff8c00;
  border: 1px solid rgba(255, 140, 0, 0.5);
}

.config-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-enabled {
  background: rgba(16, 185, 129, 0.3);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.status-disabled {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.config-item-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-button.edit {
  background: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.action-button.edit:hover {
  background: rgba(59, 130, 246, 0.5);
}

.action-button.delete {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.action-button.delete:hover {
  background: rgba(239, 68, 68, 0.5);
}

.config-item-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-functions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.functions-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 215, 0, 0.9);
  margin-bottom: 10px;
}

.functions-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.function-btn {
  padding: 6px 12px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.function-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.config-info-row {
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  min-width: 80px;
}

.info-value {
  color: rgba(255, 255, 255, 0.9);
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state p {
  margin: 0;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.modal-close:hover {
  color: #ffd700;
  transform: rotate(90deg);
}

.modal-body {
  padding: 20px;
}

.config-form {
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

.form-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.form-label .required {
  color: #ff4444;
  margin-left: 4px;
}

.modal-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-button {
  padding: 10px 30px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-button.cancel {
  background: rgba(107, 114, 128, 0.3);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(107, 114, 128, 0.5);
}

.modal-button.cancel:hover {
  background: rgba(107, 114, 128, 0.5);
}

.modal-button.confirm {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
}

.modal-button.confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .config-main-content {
    padding: 100px 20px 20px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .filter-field-button {
    grid-column: 1;
  }
  
  .btn-search {
    width: 100%;
  }
  
  .btn-reset {
    width: 100%;
  }
  
  .config-item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

