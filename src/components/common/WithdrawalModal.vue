<template>
  <div class="modal-overlay" v-if="modelValue" @click="handleClose">
    <div class="modal-content withdrawal-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ t('withdrawal.title') }}</h3>
        <button class="modal-close" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <!-- 余额显示 -->
        <div class="form-row">
          <div class="form-label">{{ balanceLabel }}</div>
          <div class="form-value">{{ balance }} {{ balanceUnit }}</div>
        </div>

        <!-- 提款金额 -->
        <div class="form-section">
          <div class="form-section-header">
            <span class="section-label">{{ t('withdrawal.withdrawalAmount') }}</span>
          </div>
          <div class="form-section-content">
            <CustomNumberInput
              id="withdrawal-amount"
              v-model="localForm.amount"
              :placeholder="t('withdrawal.amountPlaceholder')"
              @change="handleAmountChange"
            />
          </div>
        </div>

        <!-- 提现地址 -->
        <div class="form-section">
          <div class="form-section-header">
            <span class="section-label">{{ t('withdrawal.withdrawalAddress') }}</span>
          </div>
          <div class="form-section-content">
            <input
              id="withdrawal-address"
              v-model="localForm.address"
              type="text"
              class="amount-input"
              :placeholder="t('withdrawal.addressPlaceholder')"
            />
          </div>
        </div>

        <!-- 提现类型 -->
        <div class="form-section">
          <div class="form-section-header">
            <span class="section-label">{{ t('withdrawal.withdrawalType') }}</span>
          </div>
          <div class="form-section-content">
            <CustomSelect
              id="withdrawal-type"
              v-model="localForm.type"
              :options="withdrawalTypeOptions"
              @change="handleTypeChange"
            />
          </div>
        </div>

        <!-- 应收 USDT -->
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
          <button class="modal-button cancel" @click="handleClose">{{ t('buyVT.cancel') }}</button>
          <button class="modal-button confirm" @click="handleConfirm">{{ t('withdrawal.withdraw') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomNumberInput from './CustomNumberInput.vue'
import CustomSelect from './CustomSelect.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  balance: {
    type: [String, Number],
    default: '0.00'
  },
  balanceLabel: {
    type: String,
    default: 'USD余额'
  },
  balanceUnit: {
    type: String,
    default: 'USD'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const { t } = useI18n()

// 本地表单数据
const localForm = reactive({
  amount: '',
  address: '',
  type: 'normal'
})

// 提款类型选项
const withdrawalTypeOptions = computed(() => [
  { value: 'normal', label: t('withdrawal.normalType') },
  { value: 'priority', label: t('withdrawal.priorityType') }
])

// 计算应收 USDT
const expectedUSDT = computed(() => {
  const amount = parseFloat(localForm.amount) || 0
  if (amount <= 0) return '0.00'
  
  // 普通类型：无手续费
  if (localForm.type === 'normal') {
    return amount.toFixed(2)
  }
  // 优先类型：2%手续费
  const fee = amount * 0.02
  return (amount - fee).toFixed(2)
})

// 监听 modelValue 变化，重置表单
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 打开时重置表单
    localForm.amount = ''
    localForm.address = ''
    localForm.type = 'normal'
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleAmountChange = () => {
  // 计算逻辑已在 computed 中处理
}

const handleTypeChange = () => {
  // 计算逻辑已在 computed 中处理
}

const isValidBep20Address = (address) => {
  // 简单验证 BEP20 地址格式
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

const handleConfirm = () => {
  // 验证输入
  if (!localForm.amount || parseFloat(localForm.amount) <= 0) {
    alert(t('withdrawal.pleaseEnterAmount'))
    return
  }
  
  const balanceNum = parseFloat(props.balance) || 0
  const amountNum = parseFloat(localForm.amount) || 0
  
  if (amountNum > balanceNum) {
    alert(t('withdrawal.insufficientBalance'))
    return
  }
  
  if (!localForm.address) {
    alert(t('withdrawal.pleaseEnterAddress'))
    return
  }
  
  if (!isValidBep20Address(localForm.address)) {
    alert(t('withdrawal.invalidBep20Address'))
    return
  }
  
  // 触发确认事件，传递表单数据
  emit('confirm', {
    amount: localForm.amount,
    address: localForm.address,
    type: localForm.type,
    expectedUSDT: expectedUSDT.value
  })
}
</script>

<style scoped>
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
  width: 100%;
}

.amount-input:focus {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.amount-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    padding: 20px;
    width: 95%;
  }

  .modal-buttons {
    flex-direction: column;
  }
}
</style>

