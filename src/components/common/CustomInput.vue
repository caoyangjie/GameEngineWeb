<template>
  <div class="custom-input-wrapper" :class="{ 'is-focused': isFocused, 'is-disabled': disabled, 'has-value': hasValue }">
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :disabled="disabled"
      :placeholder="placeholder"
      class="custom-input"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputRef = ref(null)
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
.custom-input-wrapper {
  position: relative;
  width: 100%;
  z-index: 1;
}

.custom-input {
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
  box-sizing: border-box;
}

.custom-input:hover {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
}

.custom-input-wrapper.is-focused .custom-input {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.4),
    inset 0 0 10px rgba(255, 215, 0, 0.1);
  background: rgba(0, 0, 0, 0.7);
}

.custom-input-wrapper.has-value .custom-input {
  color: #ffd700;
}

.custom-input-wrapper.is-disabled .custom-input {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.3);
}

.custom-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Firefox 样式 */
.custom-input::-moz-placeholder {
  color: rgba(255, 255, 255, 0.5);
  opacity: 1;
}

.custom-input:-ms-input-placeholder {
  color: rgba(255, 255, 255, 0.5);
}
</style>

