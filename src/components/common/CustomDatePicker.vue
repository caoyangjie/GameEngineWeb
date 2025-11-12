<template>
  <div 
    class="custom-date-picker-wrapper" 
    :class="{ 'is-focused': isFocused, 'is-disabled': disabled, 'has-value': hasValue }"
    @click="handleWrapperClick"
  >
    <input
      ref="dateInputRef"
      type="date"
      :value="displayValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @click="handleInputClick"
      :disabled="disabled"
      :placeholder="placeholder"
      class="custom-date-input"
    />
    <svg class="date-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M4 9h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M8 5V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M16 5V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="9" cy="13" r="1" fill="currentColor"/>
      <circle cx="12" cy="13" r="1" fill="currentColor"/>
      <circle cx="15" cy="13" r="1" fill="currentColor"/>
      <circle cx="9" cy="16" r="1" fill="currentColor"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
      <circle cx="15" cy="16" r="1" fill="currentColor"/>
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

const dateInputRef = ref(null)
const isFocused = ref(false)

// 获取当前日期字符串（YYYY-MM-DD 格式）
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 显示值：如果 modelValue 为空，使用当前日期作为默认值
const displayValue = computed(() => {
  if (props.modelValue && props.modelValue !== '') {
    return props.modelValue
  }
  return getCurrentDate()
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
  // 当点击 input 时，也尝试打开日期选择器
  openDatePicker()
}

const handleWrapperClick = (event) => {
  if (props.disabled) return
  
  // 如果点击的是 input 元素本身，不处理（已经在 handleInputClick 中处理）
  if (event.target === dateInputRef.value) {
    return
  }
  
  // 点击 wrapper 的其他区域时，触发日期选择器
  openDatePicker()
}

const openDatePicker = () => {
  if (!dateInputRef.value) return
  
  // 先让 input 获得焦点
  dateInputRef.value.focus()
  
  // 使用 showPicker() API（现代浏览器支持，Chrome 99+, Edge 99+, Safari 16.4+）
  if (typeof dateInputRef.value.showPicker === 'function') {
    try {
      dateInputRef.value.showPicker()
    } catch (error) {
      // 如果 showPicker() 失败（可能因为用户交互限制），尝试其他方法
      // 在某些浏览器中，showPicker() 必须在用户交互事件中调用
      setTimeout(() => {
        try {
          dateInputRef.value.showPicker()
        } catch (e) {
          // 如果还是失败，尝试模拟点击日历图标区域
          simulateCalendarClick()
        }
      }, 0)
    }
  } else {
    // 不支持 showPicker() 的浏览器，模拟点击日历图标区域
    simulateCalendarClick()
  }
}

const simulateCalendarClick = () => {
  // 通过模拟点击日历图标区域来打开日期选择器
  if (dateInputRef.value) {
    const input = dateInputRef.value
    const rect = input.getBoundingClientRect()
    
    // 创建一个点击事件，在日历图标位置（右侧）触发
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

// 注入全局样式来优化日期选择器弹框
const injectDatePickerStyles = () => {
  const styleId = 'custom-date-picker-styles'
  if (document.getElementById(styleId)) return
  
  const style = document.createElement('style')
  style.id = styleId

  document.head.appendChild(style)
}

onMounted(() => {
  injectDatePickerStyles()
})

onUnmounted(() => {
  const style = document.getElementById('custom-date-picker-styles')
  if (style) {
    style.remove()
  }
})
</script>

<style scoped>
.custom-date-picker-wrapper {
  position: relative;
  width: 100%;
  z-index: 1;
  cursor: pointer;
}

.custom-date-input {
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

.custom-date-input:hover {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
}

.custom-date-picker-wrapper.is-focused .custom-date-input {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.4),
    inset 0 0 10px rgba(255, 215, 0, 0.1);
  background: rgba(0, 0, 0, 0.7);
}

.custom-date-picker-wrapper.has-value .custom-date-input {
  color: #ffd700;
}

.custom-date-picker-wrapper.is-disabled .custom-date-input {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.3);
}

.custom-date-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.date-icon {
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

.custom-date-picker-wrapper.is-focused .date-icon {
  opacity: 1;
  color: rgba(255, 215, 0, 0.9);
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.5));
}

.custom-date-picker-wrapper:hover .date-icon {
  color: rgba(255, 215, 0, 0.8);
}

/* 完全隐藏浏览器默认的日期选择器图标 */
.custom-date-input::-webkit-calendar-picker-indicator {
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
.custom-date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 0 !important;
  display: none !important;
  visibility: hidden !important;
}

/* Firefox 浏览器隐藏默认图标 */
.custom-date-input::-moz-calendar-picker-indicator {
  opacity: 0 !important;
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* 隐藏日期输入框右侧的所有原生图标和按钮 */
.custom-date-input::-webkit-inner-spin-button,
.custom-date-input::-webkit-outer-spin-button {
  display: none !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  visibility: hidden !important;
}

/* 日期选择器弹框的样式优化（通过全局样式注入） */
@keyframes datePickerFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 优化日期输入框的文本显示和样式 */
.custom-date-input::-webkit-datetime-edit {
  color: inherit;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  padding: 0;
}

.custom-date-input::-webkit-datetime-edit-fields-wrapper {
  color: inherit;
  padding: 0;
  display: flex;
  align-items: center;
}

.custom-date-input::-webkit-datetime-edit-text {
  color: rgba(255, 255, 255, 0.6);
  padding: 0 4px;
  font-weight: normal;
  font-size: 16px;
}

.custom-date-input::-webkit-datetime-edit-month-field,
.custom-date-input::-webkit-datetime-edit-day-field,
.custom-date-input::-webkit-datetime-edit-year-field {
  color: inherit;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-width: 2.5ch;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.custom-date-input::-webkit-datetime-edit-month-field:focus,
.custom-date-input::-webkit-datetime-edit-day-field:focus,
.custom-date-input::-webkit-datetime-edit-year-field:focus {
  background-color: rgba(255, 215, 0, 0.25);
  color: #ffd700;
  outline: 1px solid rgba(255, 215, 0, 0.6);
  outline-offset: -1px;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
}

.custom-date-picker-wrapper.has-value .custom-date-input::-webkit-datetime-edit-month-field,
.custom-date-picker-wrapper.has-value .custom-date-input::-webkit-datetime-edit-day-field,
.custom-date-picker-wrapper.has-value .custom-date-input::-webkit-datetime-edit-year-field {
  color: #ffd700;
  font-weight: 600;
}

.custom-date-picker-wrapper.has-value .custom-date-input::-webkit-datetime-edit-text {
  color: rgba(255, 215, 0, 0.5);
}

.custom-date-input::-webkit-inner-spin-button,
.custom-date-input::-webkit-outer-spin-button {
  display: none;
}

/* Firefox 样式 */
.custom-date-input::-moz-placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.custom-date-input:-ms-input-placeholder {
  color: rgba(255, 255, 255, 0.5);
}
</style>

