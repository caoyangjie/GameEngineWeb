<template>
  <div class="modal-overlay" v-if="modelValue" @click="handleClose">
    <div class="modal-content purchase-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ t('purchase.title') }}</h3>
        <button class="modal-close" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <!-- 余额显示 -->
        <div class="form-row">
          <div class="form-label">{{ t('purchase.balance') }}</div>
          <div class="form-value">{{ balance }} {{ currency }}</div>
        </div>

        <!-- 货币选择 -->
        <div class="form-section">
          <div class="form-section-header">
            <span class="section-label">{{ t('purchase.fromCurrency') }}</span>
          </div>
          <div class="form-section-content">
            <CustomSelect
              v-model="form.fromCurrency"
              :options="currencyOptions"
              :placeholder="t('purchase.selectCurrency')"
            />
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-header">
            <span class="section-label">{{ t('purchase.toCurrency') }}</span>
          </div>
          <div class="form-section-content">
            <CustomSelect
              v-model="form.toCurrency"
              :options="targetCurrencyOptions"
              :placeholder="t('purchase.selectCurrency')"
            />
          </div>
        </div>

        <!-- 购买金额 -->
        <div class="form-section">
          <div class="form-section-header">
            <span class="section-label">{{ t('purchase.amount') }}</span>
          </div>
          <div class="form-section-content">
            <div class="amount-input-wrapper">
              <CustomNumberInput
                id="purchase-amount"
                v-model="form.amount"
                :placeholder="t('purchase.enterAmount')"
                @change="calculateReceivable"
              />
              <button class="max-button" @click="setMaxAmount">{{ t('purchase.max') }}</button>
            </div>
          </div>
        </div>

        <!-- 应收金额 -->
        <div class="form-section" v-if="receivable > 0">
          <div class="form-section-header">
            <span class="section-label">{{ t('purchase.receivable') }}</span>
          </div>
          <div class="form-section-content">
            <div class="receivable-value">{{ receivable }} {{ form.toCurrency }}</div>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="modal-buttons">
          <button class="modal-button cancel" @click="handleClose">{{ t('purchase.cancel') }}</button>
          <button class="modal-button confirm" @click="handleConfirm">{{ t('purchase.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomSelect from './CustomSelect.vue'
import CustomNumberInput from './CustomNumberInput.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    default: 'USD'
  },
  balance: {
    type: [Number, String],
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const { t } = useI18n()

const form = reactive({
  fromCurrency: props.currency,
  toCurrency: '',
  amount: ''
})

const receivable = ref(0)

// 货币选项
const currencyOptions = computed(() => [
  { value: 'USD', label: 'USD' },
  { value: 'VT', label: 'VT' },
  { value: 'UNIFI', label: 'UNIFI' }
])

// 目标货币选项（排除源货币）
const targetCurrencyOptions = computed(() => {
  return currencyOptions.value.filter(opt => opt.value !== form.fromCurrency)
})

// 监听源货币变化
watch(() => form.fromCurrency, () => {
  form.toCurrency = ''
  form.amount = ''
  receivable.value = 0
})

// 监听目标货币变化
watch(() => form.toCurrency, () => {
  calculateReceivable()
})

const calculateReceivable = () => {
  if (!form.amount || !form.toCurrency) {
    receivable.value = 0
    return
  }
  
  const amount = parseFloat(form.amount) || 0
  if (amount <= 0) {
    receivable.value = 0
    return
  }
  
  // 简化计算，实际应该从API获取汇率
  // 这里假设VT价格为1.02，UNIFI价格需要从API获取
  const exchangeRates = {
    'USD': { 'VT': 1 / 1.02, 'UNIFI': 1 },
    'VT': { 'USD': 1.02, 'UNIFI': 1.02 },
    'UNIFI': { 'USD': 1, 'VT': 1 / 1.02 }
  }
  
  const rate = exchangeRates[form.fromCurrency]?.[form.toCurrency] || 1
  receivable.value = (amount * rate).toFixed(8)
}

const setMaxAmount = () => {
  form.amount = props.balance.toString()
  calculateReceivable()
}

const handleClose = () => {
  emit('update:modelValue', false)
  form.fromCurrency = props.currency
  form.toCurrency = ''
  form.amount = ''
  receivable.value = 0
}

const handleConfirm = () => {
  if (!form.fromCurrency || !form.toCurrency) {
    alert(t('purchase.pleaseSelectCurrency'))
    return
  }
  
  if (!form.amount || parseFloat(form.amount) <= 0) {
    alert(t('purchase.pleaseEnterAmount'))
    return
  }
  
  if (parseFloat(form.amount) > parseFloat(props.balance)) {
    alert(t('purchase.insufficientBalance'))
    return
  }
  
  emit('confirm', {
    fromCurrency: form.fromCurrency,
    toCurrency: form.toCurrency,
    amount: parseFloat(form.amount)
  })
}
</script>

<style scoped>
/* 复用现有的弹窗样式 */
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

.purchase-modal {
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
}

.max-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  transform: translateY(-1px);
}

.receivable-value {
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
}

.modal-button.confirm {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.9) 0%,
    rgba(255, 140, 0, 0.9) 100%
  );
  border-color: rgba(255, 215, 0, 1);
  color: #1a0a2e;
}

.modal-button.confirm:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 1) 0%,
    rgba(255, 165, 0, 1) 100%
  );
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
}

.modal-button.cancel:hover {
  background: linear-gradient(
    135deg,
    rgba(120, 120, 120, 1) 0%,
    rgba(90, 90, 90, 1) 100%
  );
  transform: translateY(-2px);
}
</style>

