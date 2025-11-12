<template>
  <div 
    class="custom-time-picker-wrapper" 
    :class="{ 'is-focused': isFocused, 'is-disabled': disabled, 'has-value': hasValue }"
    @click="handleWrapperClick"
  >
    <input
      ref="timeInputRef"
      type="time"
      :value="displayValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @click="handleInputClick"
      :disabled="disabled"
      :placeholder="placeholder"
      class="custom-time-input"
    />
    <svg class="time-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const timeInputRef = ref(null)
const isFocused = ref(false)

// 获取当前时间字符串（HH:mm 格式）
const getCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 显示值：如果 modelValue 为空，使用当前时间作为默认值
const displayValue = computed(() => {
  if (props.modelValue && props.modelValue !== '') {
    return props.modelValue
  }
  return getCurrentTime()
})

const hasValue = computed(() => {
  return displayValue.value && displayValue.value !== ''
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

const handleInputClick = () => {
  // 当点击 input 时，也尝试打开时间选择器
  openTimePicker()
}

const handleWrapperClick = (event) => {
  if (props.disabled) return
  
  // 如果点击的是 input 元素本身，不处理（已经在 handleInputClick 中处理）
  if (event.target === timeInputRef.value) {
    return
  }
  
  // 点击 wrapper 的其他区域时，触发时间选择器
  openTimePicker()
}

const openTimePicker = () => {
  if (!timeInputRef.value) return
  
  // 先让 input 获得焦点
  timeInputRef.value.focus()
  
  // 使用 showPicker() API（现代浏览器支持，Chrome 99+, Edge 99+, Safari 16.4+）
  if (typeof timeInputRef.value.showPicker === 'function') {
    try {
      timeInputRef.value.showPicker()
    } catch (error) {
      // 如果 showPicker() 失败（可能因为用户交互限制），尝试其他方法
      setTimeout(() => {
        try {
          timeInputRef.value.showPicker()
        } catch (e) {
          // 如果还是失败，尝试模拟点击时间图标区域
          simulateTimeClick()
        }
      }, 0)
    }
  } else {
    // 不支持 showPicker() 的浏览器，模拟点击时间图标区域
    simulateTimeClick()
  }
}

const simulateTimeClick = () => {
  // 通过模拟点击时间图标区域来打开时间选择器
  if (timeInputRef.value) {
    const input = timeInputRef.value
    const rect = input.getBoundingClientRect()
    
    // 创建一个点击事件，在时间图标位置（右侧）触发
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: rect.right - 10,
      clientY: rect.top + rect.height / 2
    })
    
    input.dispatchEvent(clickEvent)
  }
}

// 注入全局样式来优化时间选择器弹框
const injectTimePickerStyles = () => {
  const styleId = 'custom-time-picker-styles'
  if (document.getElementById(styleId)) return
  
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* 完全隐藏所有时间输入框的默认图标 */
    input[type="time"]::-webkit-calendar-picker-indicator {
      opacity: 0 !important;
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      cursor: pointer;
      z-index: -1 !important;
    }
    
    input[type="time"]::-moz-calendar-picker-indicator {
      opacity: 0 !important;
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    
    /* 时间选择器弹框的容器样式优化 */
    input[type="time"]:focus::-webkit-calendar-picker-indicator,
    input[type="time"]:hover::-webkit-calendar-picker-indicator,
    input[type="time"]:active::-webkit-calendar-picker-indicator {
      opacity: 0 !important;
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    /* 隐藏所有时间输入框的旋转按钮 */
    input[type="time"]::-webkit-inner-spin-button,
    input[type="time"]::-webkit-outer-spin-button {
      display: none !important;
      opacity: 0 !important;
      width: 0 !important;
      height: 0 !important;
      visibility: hidden !important;
    }
    
    /* 优化时间输入框的文本显示 */
    input[type="time"]::-webkit-datetime-edit {
      color: inherit;
      font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
    }
    
    input[type="time"]::-webkit-datetime-edit-fields-wrapper {
      color: inherit;
    }
    
    input[type="time"]::-webkit-datetime-edit-text {
      color: rgba(255, 255, 255, 0.6);
      padding: 0 2px;
    }
    
    input[type="time"]::-webkit-datetime-edit-hour-field,
    input[type="time"]::-webkit-datetime-edit-minute-field {
      color: inherit;
      padding: 0 2px;
    }
    
    input[type="time"]::-webkit-datetime-edit-hour-field:focus,
    input[type="time"]::-webkit-datetime-edit-minute-field:focus {
      background-color: rgba(255, 215, 0, 0.2);
      color: #ffd700;
      border-radius: 3px;
    }
  `
  document.head.appendChild(style)
}

onMounted(() => {
  injectTimePickerStyles()
})

onUnmounted(() => {
  const style = document.getElementById('custom-time-picker-styles')
  if (style) {
    style.remove()
  }
})
</script>

<style scoped>
.custom-time-picker-wrapper {
  position: relative;
  width: 100%;
  z-index: 1;
  cursor: pointer;
}

.custom-time-input {
  width: 100%;
  padding: 12px 45px 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  transition: all 0.3s;
  min-height: 44px;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
}

.custom-time-input:hover {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
}

.custom-time-picker-wrapper.is-focused .custom-time-input {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.4),
    inset 0 0 10px rgba(255, 215, 0, 0.1);
  background: rgba(0, 0, 0, 0.7);
}

.custom-time-picker-wrapper.has-value .custom-time-input {
  color: #ffd700;
}

.custom-time-picker-wrapper.is-disabled .custom-time-input {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.3);
}

.custom-time-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.time-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  width: 20px;
  height: 20px;
  color: rgba(255, 215, 0, 0.6);
  transition: all 0.3s;
  opacity: 0.8;
  display: block;
  flex-shrink: 0;
  z-index: 1;
}

.custom-time-picker-wrapper.is-focused .time-icon {
  opacity: 1;
  color: rgba(255, 215, 0, 0.9);
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.5));
}

.custom-time-picker-wrapper:hover .time-icon {
  color: rgba(255, 215, 0, 0.8);
}

/* 完全隐藏浏览器默认的时间选择器图标 */
.custom-time-input::-webkit-calendar-picker-indicator {
  opacity: 0 !important;
  position: absolute;
  right: 0;
  width: 0 !important;
  height: 0 !important;
  cursor: pointer;
  z-index: -1;
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* 确保 hover 时也不显示 */
.custom-time-input::-webkit-calendar-picker-indicator:hover {
  opacity: 0 !important;
  display: none !important;
  visibility: hidden !important;
}

/* Firefox 浏览器隐藏默认图标 */
.custom-time-input::-moz-calendar-picker-indicator {
  opacity: 0 !important;
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* 隐藏时间输入框右侧的所有原生图标和按钮 */
.custom-time-input::-webkit-inner-spin-button,
.custom-time-input::-webkit-outer-spin-button {
  display: none !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  visibility: hidden !important;
}

/* 优化时间输入框的文本显示和样式 */
.custom-time-input::-webkit-datetime-edit {
  color: inherit;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  padding: 0;
}

.custom-time-input::-webkit-datetime-edit-fields-wrapper {
  color: inherit;
  padding: 0;
  display: flex;
  align-items: center;
}

.custom-time-input::-webkit-datetime-edit-text {
  color: rgba(255, 255, 255, 0.6);
  padding: 0 4px;
  font-weight: normal;
  font-size: 16px;
}

.custom-time-input::-webkit-datetime-edit-hour-field,
.custom-time-input::-webkit-datetime-edit-minute-field {
  color: inherit;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-width: 2.5ch;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.custom-time-input::-webkit-datetime-edit-hour-field:focus,
.custom-time-input::-webkit-datetime-edit-minute-field:focus {
  background-color: rgba(255, 215, 0, 0.25);
  color: #ffd700;
  outline: 1px solid rgba(255, 215, 0, 0.6);
  outline-offset: -1px;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
}

.custom-time-picker-wrapper.has-value .custom-time-input::-webkit-datetime-edit-hour-field,
.custom-time-picker-wrapper.has-value .custom-time-input::-webkit-datetime-edit-minute-field {
  color: #ffd700;
  font-weight: 600;
}

.custom-time-picker-wrapper.has-value .custom-time-input::-webkit-datetime-edit-text {
  color: rgba(255, 215, 0, 0.5);
}

/* Firefox 样式 */
.custom-time-input::-moz-placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.custom-time-input:-ms-input-placeholder {
  color: rgba(255, 255, 255, 0.5);
}
</style>

