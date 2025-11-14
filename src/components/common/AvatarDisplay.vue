<template>
  <div class="avatar-display-wrapper">
    <div class="avatar-container" :class="{ 'has-avatar': avatarUrl }">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="alt || t('persona.detail.avatar')"
        class="avatar-image"
        @error="handleImageError"
      />
      <div v-else class="avatar-placeholder">
        <span class="placeholder-icon">👤</span>
        <span class="placeholder-text">{{ placeholder || t('persona.detail.avatarPlaceholder') }}</span>
      </div>
    </div>
    <div v-if="!isViewMode" class="avatar-input-wrapper">
      <CustomInput
        v-model="avatarInput"
        :disabled="disabled"
        :placeholder="placeholder || t('persona.detail.avatarPlaceholder')"
        @update:modelValue="handleInputChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomInput from './CustomInput.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  isViewMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const avatarInput = ref(props.modelValue)
const imageError = ref(false)
const currentAvatarUrl = ref(props.modelValue || '')

const avatarUrl = computed(() => {
  if (imageError.value) return null
  const url = props.modelValue || avatarInput.value || currentAvatarUrl.value
  return url && url.trim() ? url : null
})

watch(() => props.modelValue, (newVal) => {
  avatarInput.value = newVal
  currentAvatarUrl.value = newVal || ''
  imageError.value = false
})

const handleInputChange = (value) => {
  avatarInput.value = value
  currentAvatarUrl.value = value || ''
  imageError.value = false
  emit('update:modelValue', value)
}

const handleImageError = () => {
  imageError.value = true
}
</script>

<style scoped>
.avatar-display-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-container {
  width: 100%;
  aspect-ratio: 1;
  max-width: 150px;
  min-height: 150px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.2),
    inset 0 0 20px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(5px);
  transition: all 0.3s;
}

.avatar-container:hover {
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
}

.avatar-container.has-avatar {
  border-color: rgba(255, 215, 0, 0.5);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px;
}

.placeholder-icon {
  font-size: 48px;
  opacity: 0.6;
}

.placeholder-text {
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
}

.avatar-input-wrapper {
  width: 100%;
}

@media (max-width: 768px) {
  .avatar-container {
    max-width: 150px;
  }
  
  .placeholder-icon {
    font-size: 36px;
  }
}
</style>

