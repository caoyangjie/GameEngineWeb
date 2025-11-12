<template>
  <div class="custom-number-input-wrapper" :class="{ 'is-focused': isFocused, 'is-disabled': disabled, 'has-value': hasValue }">
    <input
      ref="numberInputRef"
      type="number"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :disabled="disabled"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :step="step"
      class="custom-number-input"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  min: {
    type: [Number, String],
    default: undefined
  },
  max: {
    type: [Number, String],
    default: undefined
  },
  step: {
    type: [Number, String],
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const numberInputRef = ref(null)
const isFocused = ref(false)

const hasValue = computed(() => {
  return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
})

const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('change', value)
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}
</script>

<style scoped>
.custom-number-input-wrapper {
  position: relative;
  width: 100%;
  z-index: 1;
}

.custom-number-input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  transition: all 0.3s;
  min-height: 44px;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  outline: none;
}

.custom-number-input:hover {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
}

.custom-number-input-wrapper.is-focused .custom-number-input {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.4),
    inset 0 0 10px rgba(255, 215, 0, 0.1);
  background: rgba(0, 0, 0, 0.7);
}

.custom-number-input-wrapper.has-value .custom-number-input {
  color: #ffd700;
}

.custom-number-input-wrapper.is-disabled .custom-number-input {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.3);
}

.custom-number-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* 隐藏数字输入框的上下箭头（Chrome, Safari, Edge） */
.custom-number-input::-webkit-outer-spin-button,
.custom-number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox 隐藏数字输入框的上下箭头 */
.custom-number-input[type=number] {
  -moz-appearance: textfield;
}

/* Firefox 样式 */
.custom-number-input::-moz-placeholder {
  color: rgba(255, 255, 255, 0.5);
  opacity: 1;
}

.custom-number-input:-ms-input-placeholder {
  color: rgba(255, 255, 255, 0.5);
}
</style>

