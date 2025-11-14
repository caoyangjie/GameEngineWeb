<template>
  <div class="custom-textarea-wrapper" :class="{ 'is-focused': isFocused, 'is-disabled': disabled, 'has-value': hasValue }">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :disabled="disabled"
      :placeholder="placeholder"
      :rows="rows"
      class="custom-textarea"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
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
  rows: {
    type: Number,
    default: 4
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const textareaRef = ref(null)
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
.custom-textarea-wrapper {
  position: relative;
  width: 100%;
  z-index: 1;
}

.custom-textarea {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  transition: all 0.3s;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  min-height: 100px;
}

.custom-textarea:hover {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
}

.custom-textarea-wrapper.is-focused .custom-textarea {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.4),
    inset 0 0 10px rgba(255, 215, 0, 0.1);
  background: rgba(0, 0, 0, 0.7);
}

.custom-textarea-wrapper.has-value .custom-textarea {
  color: #ffd700;
}

.custom-textarea-wrapper.is-disabled .custom-textarea {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.3);
}

.custom-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Firefox 样式 */
.custom-textarea::-moz-placeholder {
  color: rgba(255, 255, 255, 0.5);
  opacity: 1;
}

.custom-textarea:-ms-input-placeholder {
  color: rgba(255, 255, 255, 0.5);
}
</style>

