<template>
  <div ref="selectWrapper" class="custom-select-wrapper" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <div 
      class="custom-select" 
      @click.stop="toggleDropdown"
      :class="{ 'is-focused': isOpen, 'has-value': modelValue !== '' && modelValue !== null && modelValue !== undefined }"
    >
      <span class="select-value" :class="{ 'placeholder': !modelValue || modelValue === '' }">
        {{ displayText }}
      </span>
      <span class="select-arrow" :class="{ 'is-open': isOpen }">▼</span>
    </div>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="select-dropdown" @click.stop>
        <div class="dropdown-content">
          <div
            v-for="option in options"
            :key="option.value"
            class="select-option"
            :class="{ 'is-selected': option.value === modelValue, 'is-disabled': option.disabled }"
            @click="selectOption(option)"
          >
            <span class="option-text">{{ option.label }}</span>
            <span v-if="option.value === modelValue" class="option-check">✓</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const selectWrapper = ref(null)

const displayText = computed(() => {
  if (!props.modelValue && props.modelValue !== 0) {
    return props.placeholder
  }
  const selectedOption = props.options.find(opt => opt.value === props.modelValue)
  return selectedOption ? selectedOption.label : props.placeholder
})

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const selectOption = (option) => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  // 如果下拉框未打开，不需要处理
  if (!isOpen.value) return
  
  // 检查点击是否在组件外部
  if (selectWrapper.value && !selectWrapper.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  // 使用 nextTick 确保 DOM 已渲染
  nextTick(() => {
    document.addEventListener('click', handleClickOutside, true)
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<style scoped>
.custom-select-wrapper {
  position: relative;
  width: 100%;
  z-index: 1;
}

.custom-select-wrapper.is-open {
  z-index: 10001;
}

.custom-select {
  width: 100%;
  padding: 12px 40px 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-height: 44px;
  display: flex;
  align-items: center;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
}

.custom-select:hover {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
}

.custom-select.is-focused {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.4),
    inset 0 0 10px rgba(255, 215, 0, 0.1);
  background: rgba(0, 0, 0, 0.7);
}

.custom-select.has-value {
  color: #ffd700;
}

.custom-select-wrapper.is-disabled .custom-select {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.3);
}

.select-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-value.placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 215, 0, 0.8);
  font-size: 12px;
  transition: transform 0.3s;
  pointer-events: none;
}

.select-arrow.is-open {
  transform: translateY(-50%) rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 8px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(10px);
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  isolation: isolate;
  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 215, 0, 0.6) rgba(0, 0, 0, 0.3);
}

.select-dropdown::-webkit-scrollbar {
  width: 8px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  margin: 4px 0;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.6);
  border-radius: 4px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  min-height: 30px;
}

.select-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.8);
  border-color: rgba(255, 215, 0, 0.5);
}

.select-dropdown::-webkit-scrollbar-thumb:active {
  background: rgba(255, 215, 0, 0.9);
}

.dropdown-content {
  padding: 5px 0;
}

.select-option {
  padding: 12px 15px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.select-option:hover {
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
}

.select-option.is-selected {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  font-weight: bold;
}

.select-option.is-selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, rgba(255, 215, 0, 0.8), rgba(255, 140, 0, 0.8));
}

.select-option.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-option.is-disabled:hover {
  background: transparent;
  color: white;
}

.option-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-check {
  color: #ffd700;
  font-weight: bold;
  margin-left: 10px;
  font-size: 18px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

