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
            <div class="form-label">招聘二维码</div>
            <div class="qr-code-wrapper">
              <div class="qr-code-placeholder">
                <canvas ref="qrCanvas" class="qr-canvas"></canvas>
              </div>
            </div>
          </div>

          <!-- 招聘链接 -->
          <div class="form-group">
            <div class="form-label">招聘链接</div>
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
            <div class="form-label">当前旅程等级</div>
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
            <div class="form-label">玩家 ID</div>
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
            <div class="form-label">BEP20地址</div>
            <div class="input-with-copy">
              <input 
                type="text" 
                v-model="formData.bep20Address" 
                placeholder="Enter BEP20 Address"
                class="form-input"
              />
              <button class="copy-btn" @click="copyToClipboard(formData.bep20Address)">
                <span class="copy-icon">📋</span>
              </button>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button class="submit-btn" @click="handleSubmit">提交</button>
        </div>

        <!-- 右列：个人资料部分 -->
        <div class="right-column">
          <div class="personal-info-section">

            <!-- <div class="form-label">个人资料</div>
            <div class="profile-header-section">
              <div class="character-image-wrapper">
                <img 
                  :src="characterImage" 
                  alt="孙悟空" 
                  class="character-profile-image"
                  @error="handleImageError"
                />
              </div>
            </div> -->
          <div class="form-group qr-code-group">
            <div class="form-label">招聘二维码</div>
            <div class="qr-code-wrapper">
              <div class="qr-code-placeholder">
                <canvas ref="qrCanvas" class="qr-canvas"></canvas>
              </div>
            </div>
          </div>

            <!-- 电子邮箱 -->
            <div class="form-group">
              <div class="form-label">电子邮箱</div>
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
              <div class="form-label">登录密码</div>
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
              <div class="form-label">新密码</div>
              <div class="input-with-icon">
                <span class="input-icon key-icon">🔑</span>
                <input 
                  :type="showNewPassword ? 'text' : 'password'" 
                  v-model="formData.newPassword" 
                  class="form-input"
                  placeholder="新密码"
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
              <div class="form-label">确认密码</div>
              <div class="input-with-icon">
                <span class="input-icon key-icon">🔑</span>
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  v-model="formData.confirmPassword" 
                  class="form-input"
                  placeholder="确认密码"
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
            <button class="save-btn" @click="handleSave">保存</button>
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
import { ref, reactive, onMounted } from 'vue'
import TopHeader from './TopHeader.vue'
import Sidebar from './Sidebar.vue'
import { useRouter, ROUTES } from '../composables/useRouter.js'

const router = useRouter()

const sidebarOpen = ref(false)
const showLoginPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const qrCanvas = ref(null)

const characterImage = ref('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=600&fit=crop&q=80&auto=format')

const formData = reactive({
  currentLevel: '银',
  recruitmentLink: 'https://voyagewest.game/register?refid=11898525444',
  playerId: '11898525444',
  bep20Address: '',
  email: '155155@163.COM',
  loginPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleImageError = () => {
  characterImage.value = 'https://via.placeholder.com/400x600/FFD700/000000?text=孙悟空'
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
    alert('已复制到剪贴板！')
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
      alert('已复制到剪贴板！')
    } catch (err) {
      alert('复制失败，请手动复制')
    }
    document.body.removeChild(textArea)
  }
}

const handleSubmit = () => {
  if (!formData.bep20Address.trim()) {
    alert('请输入BEP20地址')
    return
  }
  console.log('提交BEP20地址:', formData.bep20Address)
  alert('BEP20地址已提交！')
}

const handleSavePassword = () => {
  if (!formData.loginPassword) {
    alert('请输入登录密码')
    return
  }
  if (!formData.newPassword) {
    alert('请输入新密码')
    return
  }
  if (formData.newPassword !== formData.confirmPassword) {
    alert('新密码和确认密码不匹配！')
    return
  }
  console.log('保存修改密码:', {
    loginPassword: formData.loginPassword,
    newPassword: formData.newPassword
  })
  alert('密码修改成功！')
  // 清空密码字段
  formData.loginPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
}

const handleSave = () => {
  console.log('保存个人资料:', formData)
  alert('个人资料已保存！')
}

// 生成二维码
const generateQRCode = () => {
  if (!qrCanvas.value) return
  
  const canvas = qrCanvas.value
  const ctx = canvas.getContext('2d')
  const size = 200
  canvas.width = size
  canvas.height = size
  
  // 简单的二维码生成（使用简单的方块图案模拟）
  // 实际项目中可以使用 qrcode 库
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, size, size)
  
  // 绘制白色背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(10, 10, size - 20, size - 20)
  
  // 绘制简单的二维码图案（模拟）
  ctx.fillStyle = '#000000'
  const moduleSize = 8
  const padding = 20
  
  // 绘制定位图案（左上、右上、左下）
  const drawFinderPattern = (x, y) => {
    ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5)
    ctx.fillStyle = '#000000'
    ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3)
  }
  
  drawFinderPattern(padding, padding)
  drawFinderPattern(size - padding - moduleSize * 7, padding)
  drawFinderPattern(padding, size - padding - moduleSize * 7)
  
  // 绘制数据模块（随机图案模拟）
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      if (Math.random() > 0.5) {
        ctx.fillRect(
          padding + moduleSize * 9 + i * moduleSize,
          padding + moduleSize * 9 + j * moduleSize,
          moduleSize - 1,
          moduleSize - 1
        )
      }
    }
  }
}

onMounted(() => {
  generateQRCode()
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
  padding-top: 0px;
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
    margin-top: 100px;
  }
}
</style>

