<template>
  <div class="profile-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
      <div class="temple-background"></div>
      <div class="forest-overlay"></div>
    </div>

    <!-- 顶部导航栏 -->
    <TopHeader @toggle-sidebar="toggleSidebar" @go-to-journey="handleGoToJourney" @go-to-deposit="handleGoToDeposit" />

    <!-- 主要内容区域 -->
    <main class="profile-main-content">
      <!-- 两列布局 -->
      <div class="content-wrapper">
        <!-- 左列：招聘信息 -->
        <div class="left-column">
          <!-- 招聘二维码 -->
          <div class="form-group qr-code-group">
            <div class="form-label">{{ t('profile.recruitmentQRCode') }}</div>
            <div class="qr-code-wrapper">
              <div class="qr-code-placeholder">
                <img 
                  v-if="recruitmentQRCodeImage && !isQRCodeLoading" 
                  :src="recruitmentQRCodeImage" 
                  alt="招聘二维码" 
                  class="qr-image"
                  @error="handleQRCodeError('recruitment')"
                />
                <div v-if="isQRCodeLoading" class="qr-code-loading">{{ t('login.captchaLoading') || '加载中...' }}</div>
                <div v-if="!recruitmentQRCodeImage && !isQRCodeLoading" class="qr-code-placeholder-text">
                  {{ t('profile.noQRCode') || '暂无二维码' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 招聘链接 -->
          <div class="form-group">
            <div class="form-label">{{ t('profile.recruitmentLink') }}</div>
            <div class="input-with-copy">
              <input 
                type="text" 
                v-model="formData.recruitmentLink" 
                class="form-input"
                readonly
              />
              <button class="copy-btn" @click="copyToClipboard(formData.recruitmentLink)">
                <span class="copy-icon">📋</span>
              </button>
            </div>
          </div>

          <!-- 当前旅程等级 -->
          <div class="form-group">
            <div class="form-label">{{ t('profile.currentJourneyLevel') }}</div>
            <div class="input-with-copy">
              <input 
                type="text" 
                v-model="formData.currentLevel" 
                class="form-input level-input"
                readonly
              />
              <button class="copy-btn" @click="copyToClipboard(formData.currentLevel)">
                <span class="copy-icon">📋</span>
              </button>
            </div>
          </div>

          <!-- 玩家 ID -->
          <div class="form-group">
            <div class="form-label">{{ t('profile.playerId') }}</div>
            <div class="input-with-copy">
              <input 
                type="text" 
                v-model="formData.playerId" 
                class="form-input"
                readonly
              />
              <button class="copy-btn" @click="copyToClipboard(formData.playerId)">
                <span class="copy-icon">📋</span>
              </button>
            </div>
          </div>

          <!-- BEP20地址 -->
          <div class="form-group">
            <div class="form-label">{{ t('profile.bep20Address') }}</div>
            <div class="input-with-copy">
              <input 
                type="text" 
                v-model="formData.bep20Address" 
                :placeholder="t('profile.enterBep20Address')"
                class="form-input"
              />
              <button class="copy-btn" @click="copyToClipboard(formData.bep20Address)">
                <span class="copy-icon">📋</span>
              </button>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button class="submit-btn" @click="handleSubmit" :disabled="isLoading">
            {{ isLoading ? (t('profile.submitting') || '提交中...') : t('profile.submit') }}
          </button>
        </div>

        <!-- 右列：个人资料部分 -->
        <div class="right-column">
          <div class="personal-info-section">
            <!-- 电子邮箱二维码 -->
            <div class="form-group qr-code-group">
              <div class="form-label">{{ t('profile.emailQRCode') }}</div>
              <div class="qr-code-wrapper">
                <div class="qr-code-placeholder">
                  <img 
                    v-if="emailQRCodeImage && !isQRCodeLoading" 
                    :src="emailQRCodeImage" 
                    alt="电子邮箱二维码" 
                    class="qr-image"
                    @error="handleQRCodeError('email')"
                  />
                  <div v-if="isQRCodeLoading" class="qr-code-loading">{{ t('login.captchaLoading') || '加载中...' }}</div>
                  <div v-if="!emailQRCodeImage && !isQRCodeLoading" class="qr-code-placeholder-text">
                    {{ t('profile.noQRCode') || '暂无二维码' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 电子邮箱 -->
            <div class="form-group">
              <div class="form-label">{{ t('profile.email') }}</div>
              <div class="input-with-icon">
                <span class="input-icon email-icon">✉</span>
                <input 
                  type="email" 
                  v-model="formData.email" 
                  class="form-input"
                  readonly
                />
              </div>
            </div>

            <!-- 登录密码 -->
            <div class="form-group">
              <div class="form-label">{{ t('profile.loginPassword') }}</div>
              <div class="input-with-icon">
                <span class="input-icon password-icon">🔒</span>
                <input 
                  :type="showLoginPassword ? 'text' : 'password'" 
                  v-model="formData.loginPassword" 
                  class="form-input password-input"
                  placeholder="••••••••"
                />
                <button 
                  class="toggle-password" 
                  @click="showLoginPassword = !showLoginPassword"
                >
                  {{ showLoginPassword ? '👁️' : '🚫' }}
                </button>
              </div>
            </div>

            <!-- 新密码 -->
            <div class="form-group">
              <div class="form-label">{{ t('profile.newPassword') }}</div>
              <div class="input-with-icon">
                <span class="input-icon key-icon">🔑</span>
                <input 
                  :type="showNewPassword ? 'text' : 'password'" 
                  v-model="formData.newPassword" 
                  class="form-input"
                  :placeholder="t('profile.newPassword')"
                />
                <button 
                  class="toggle-password" 
                  @click="showNewPassword = !showNewPassword"
                >
                  {{ showNewPassword ? '👁️' : '🚫' }}
                </button>
              </div>
            </div>

            <!-- 确认密码 -->
            <div class="form-group">
              <div class="form-label">{{ t('profile.confirmPassword') }}</div>
              <div class="input-with-icon">
                <span class="input-icon key-icon">🔑</span>
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  v-model="formData.confirmPassword" 
                  class="form-input"
                  :placeholder="t('profile.confirmPassword')"
                />
                <button 
                  class="toggle-password" 
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? '👁️' : '🚫' }}
                </button>
              </div>
            </div>

            <!-- 保存按钮 -->
            <button class="save-btn" @click="handleSave" :disabled="isLoading">
              {{ isLoading ? (t('profile.saving') || '保存中...') : t('profile.save') }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="profile"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'
import { getUserInfo as getLocalUserInfo } from '../../utils/auth.js'
import { getUserExtInfo, updateUserExtInfo, updatePassword, getUserInfo as getApiUserInfo, generateQRCode as generateQRCodeApi } from '../../api/auth.js'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)
const showLoginPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const recruitmentQRCodeImage = ref('')
const emailQRCodeImage = ref('')
const isLoading = ref(false)
const isQRCodeLoading = ref(false)

const characterImage = ref('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=600&fit=crop&q=80&auto=format')

const formData = reactive({
  currentLevel: '',
  recruitmentLink: '',
  playerId: '',
  bep20Address: '',
  email: '',
  loginPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleImageError = () => {
  characterImage.value = 'https://via.placeholder.com/400x600/FFD700/000000?text=孙悟空'
}

// 处理二维码加载错误
const handleQRCodeError = (type) => {
  console.error(`${type} 二维码加载失败`)
  if (type === 'recruitment') {
    recruitmentQRCodeImage.value = ''
  } else if (type === 'email') {
    emailQRCodeImage.value = ''
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 现在直接使用 router，只需要处理关闭事件
const handleSidebarClose = () => {
  toggleSidebar()
}

const handleGoToJourney = () => {
  router.goToJourney()
}

const handleGoToDeposit = () => {
  router.goToDeposit()
}


const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(t('profile.copiedToClipboard'))
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      alert(t('profile.copiedToClipboard'))
    } catch (err) {
      alert(t('profile.copyFailed'))
    }
    document.body.removeChild(textArea)
  }
}

const handleSubmit = async () => {
  if (!formData.bep20Address.trim()) {
    alert(t('profile.pleaseEnterBep20Address'))
    return
  }
  isLoading.value = true
  try {
    const response = await updateUserExtInfo(
      formData.recruitmentLink || '',
      formData.currentLevel || '',
      formData.playerId || '',
      formData.bep20Address
    )
    if (response.code === 200) {
      alert(t('profile.bep20AddressSubmitted') || response.msg || '提交成功')
      // 重新加载扩展信息和二维码
      await loadUserExtInfo()
      await loadRecruitmentQRCode()
    } else {
      alert(response.msg || t('profile.updateFailed') || '提交失败')
    }
  } catch (error) {
    console.error('提交扩展信息错误:', error)
    alert(error.message || t('profile.updateFailed') || '提交失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  if (!formData.loginPassword) {
    alert(t('profile.pleaseEnterLoginPassword') || '请输入当前密码')
    return
  }
  if (!formData.newPassword) {
    alert(t('profile.pleaseEnterNewPassword') || '请输入新密码')
    return
  }
  if (formData.newPassword !== formData.confirmPassword) {
    alert(t('profile.passwordMismatch') || '新密码和确认密码不一致')
    return
  }
  isLoading.value = true
  try {
    const response = await updatePassword(
      formData.loginPassword,
      formData.newPassword,
      formData.confirmPassword
    )
    if (response.code === 200) {
      alert(t('profile.passwordChangedSuccessfully') || response.msg || '密码更新成功')
      // 清空密码字段
      formData.loginPassword = ''
      formData.newPassword = ''
      formData.confirmPassword = ''
    } else {
      alert(response.msg || t('profile.updateFailed') || '密码更新失败')
    }
  } catch (error) {
    console.error('更新密码错误:', error)
    alert(error.message || t('profile.updateFailed') || '密码更新失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 回车键事件处理
const handleKeydown = (event) => {
  // 如果按的是回车键，且不在加载中，触发保存
  if (event.key === 'Enter' && !isLoading.value) {
    // 如果焦点在输入框中，不触发保存（避免与表单提交冲突）
    const target = event.target
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }
    // 其他情况下，回车键触发保存
    event.preventDefault()
    handleSave()
  }
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    // 先从本地获取用户信息（如果有）
    const localUserInfo = getLocalUserInfo()
    if (localUserInfo && localUserInfo.user) {
      formData.email = localUserInfo.user.email || ''
    }
    
    // 从API获取最新用户信息
    const response = await getApiUserInfo()
    if (response.code === 200 && response.data && response.data.user) {
      formData.email = response.data.user.email || ''
      // 更新本地存储的用户信息
      if (localUserInfo) {
        localUserInfo.user = response.data.user
        // 这里可以调用 setUserInfo 更新本地存储
      }
    }
  } catch (error) {
    console.error('加载用户信息错误:', error)
    // 如果API调用失败，使用本地存储的用户信息
    const localUserInfo = getLocalUserInfo()
    if (localUserInfo && localUserInfo.user) {
      formData.email = localUserInfo.user.email || ''
    }
  }
  
  // 生成电子邮箱二维码
  await loadEmailQRCode()
}

// 加载电子邮箱二维码
const loadEmailQRCode = async () => {
  if (!formData.email) {
    emailQRCodeImage.value = ''
    return
  }
  
  isQRCodeLoading.value = true
  try {
    const response = await generateQRCodeApi(formData.email)
    console.log('生成电子邮箱二维码响应:', response)
    if (response.code === 200 && response.data) {
      // 确保 base64 字符串包含 data URI 前缀
      let base64Data = response.data
      if (typeof base64Data === 'string') {
        // 如果返回的字符串已经包含 data URI 前缀，直接使用
        if (!base64Data.startsWith('data:image')) {
          base64Data = 'data:image/png;base64,' + base64Data
        }
        emailQRCodeImage.value = base64Data
        console.log('设置电子邮箱二维码:', base64Data.substring(0, 50) + '...')
      } else {
        console.error('二维码数据格式错误:', typeof base64Data)
        emailQRCodeImage.value = ''
      }
    } else {
      console.error('生成电子邮箱二维码失败:', response.msg)
      emailQRCodeImage.value = ''
    }
  } catch (error) {
    console.error('生成电子邮箱二维码错误:', error)
    emailQRCodeImage.value = ''
  } finally {
    isQRCodeLoading.value = false
  }
}

// 加载用户扩展信息
const loadUserExtInfo = async () => {
  try {
    const response = await getUserExtInfo()
    if (response.code === 200 && response.data) {
      formData.recruitmentLink = response.data.recruitmentLink || ''
      formData.currentLevel = response.data.currentLevel || ''
      formData.playerId = response.data.playerId || ''
      formData.bep20Address = response.data.bep20Address || ''
    }
  } catch (error) {
    console.error('加载用户扩展信息错误:', error)
  }
  
  // 生成招聘二维码
  await loadRecruitmentQRCode()
}

// 加载招聘二维码
const loadRecruitmentQRCode = async () => {
  if (!formData.recruitmentLink) {
    recruitmentQRCodeImage.value = ''
    return
  }
  
  isQRCodeLoading.value = true
  try {
    const response = await generateQRCodeApi(formData.recruitmentLink)
    console.log('生成招聘二维码响应:', response)
    if (response.code === 200 && response.data) {
      // 确保 base64 字符串包含 data URI 前缀
      let base64Data = response.data
      if (typeof base64Data === 'string') {
        // 如果返回的字符串已经包含 data URI 前缀，直接使用
        if (!base64Data.startsWith('data:image')) {
          base64Data = 'data:image/png;base64,' + base64Data
        }
        recruitmentQRCodeImage.value = base64Data
        console.log('设置招聘二维码:', base64Data.substring(0, 50) + '...')
      } else {
        console.error('二维码数据格式错误:', typeof base64Data)
        recruitmentQRCodeImage.value = ''
      }
    } else {
      console.error('生成招聘二维码失败:', response.msg)
      recruitmentQRCodeImage.value = ''
    }
  } catch (error) {
    console.error('生成招聘二维码错误:', error)
    recruitmentQRCodeImage.value = ''
  } finally {
    isQRCodeLoading.value = false
  }
}


onMounted(async () => {
  await loadUserInfo()
  await loadUserExtInfo()
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.profile-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层 - 复用首页样式 */
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
  height: 300px;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 300'%3E%3Cpath d='M0,300 L200,200 L400,250 L600,180 L800,220 L1000,150 L1200,200 L1200,300 Z' fill='rgba(20,15,10,0.4)'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.7;
}

.temple-background {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(20, 15, 10, 0.2) 50%, rgba(10, 5, 0, 0.4) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath d='M100,400 L100,250 L150,230 L200,250 L250,230 L300,250 L350,230 L400,250 L450,230 L500,250 L550,230 L600,250 L650,230 L700,250 L700,400 Z' fill='rgba(20,15,10,0.3)'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.6;
  filter: blur(2px);
}

.forest-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%);
  pointer-events: none;
}


/* 主要内容区域 */
.profile-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  padding-top: 100px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.profile-main-content::-webkit-scrollbar {
  width: 10px;
}

.profile-main-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
}

.profile-main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.5);
  border-radius: 5px;
}

.profile-main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.7);
}

.profile-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%);
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.banner-avatar {
  font-size: 24px;
}

.banner-text {
  color: #ffd700;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}


/* 两列布局容器 */
.content-wrapper {
  display: flex;
  gap: 30px;
  min-width: 0;
  width: 100%;
  align-items: flex-start;
}

/* 左列：招聘信息 */
.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  align-items: stretch;
}

/* 右列：个人资料 */
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  align-items: stretch;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.qr-code-group {
  margin-bottom: 10px;
}

.qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.qr-code-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.qr-code-loading {
  color: #666;
  font-size: 14px;
  text-align: center;
}

.qr-code-placeholder-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
}

.qr-canvas {
  width: 200px;
  height: 200px;
  border-radius: 4px;
}

.form-label {
  color: #ffd700;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

.input-with-copy {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.form-input {
  flex: 1;
  padding: 14px 18px;
  background: rgba(50, 50, 50, 0.8);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  color: white;
  font-size: 15px;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
  min-height: 48px;
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input.level-input {
  background: rgba(50, 50, 50, 0.8);
  color: #ffd700;
  font-weight: bold;
}

.form-input.password-input {
  background: rgba(255, 255, 200, 0.2);
  color: #000;
}

.input-icon {
  position: absolute;
  left: 12px;
  font-size: 18px;
  z-index: 1;
}

.input-icon.email-icon {
  color: #ff4444;
}

.input-icon.password-icon {
  color: #ff4444;
}

.input-icon.key-icon {
  color: #ffd700;
}

.input-with-icon .form-input {
  padding-left: 40px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  z-index: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-btn {
  padding: 10px 12px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-btn:hover {
  background: rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
}

.copy-icon {
  font-size: 16px;
}

.submit-btn,
.save-btn,
.save-password-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  border: 2px solid rgba(255, 215, 0, 1);
  border-radius: 8px;
  color: #1a0a2e;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 140, 0, 0.4);
  width: 100%;
  margin-top: auto;
}

.submit-btn:hover,
.save-btn:hover,
.save-password-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.8),
    0 6px 20px rgba(255, 140, 0, 0.6);
}

.save-password-btn {
  margin-top: 10px;
}

.personal-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  align-items: stretch;
}

.profile-header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.character-image-wrapper {
  width: 100%;
  max-width: 240px;
  height: 240px;
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.character-profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.section-title {
  color: #ffd700;
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  width: 100%;
}


/* 响应式设计 */
@media (max-width: 1400px) {
  .profile-main-content {
    padding: 30px 20px;
  }

  .content-wrapper {
    gap: 20px;
  }
}

@media (max-width: 1200px) {
  .content-wrapper {
    width: 100%;
    flex-direction: column;
  }

  .left-column,
  .right-column {
    width: 100%;
    max-width: 600px;
  }

  .character-image-wrapper {
    max-width: 250px;
    height: 350px;
  }
}

@media (max-width: 768px) {
  .top-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .header-ticker {
    margin: 0;
    width: 100%;
  }

  .profile-main-content {
    padding: 20px 15px;
    margin-top: 200px;
  }
}
</style>

