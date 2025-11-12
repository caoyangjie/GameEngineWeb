<template>
  <div class="deposit-container">
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
    <main class="deposit-main-content">
      <!-- USD 钱包面板 -->
      <div class="wallet-panel">
        <div class="wallet-title">USD 钱包</div>
        <div class="wallet-balance">
          <div class="balance-icon">💰</div>
          <div class="balance-icon">💰</div>
          <div class="balance-info">
            <div class="balance-label">USD 余额</div>
            <div class="balance-value">{{ usdBalance }} USD</div>
          </div>
        </div>
        <div class="wallet-actions">
          <button class="action-button withdraw-btn" @click="handleWithdraw">
            提款
          </button>
          <button class="action-button buy-vt-btn" @click="handleBuyVT">
            购买VT
          </button>
        </div>
      </div>

      <!-- 二维码区域 -->
      <div class="qr-codes-section">
        <!-- BEP20 地址 -->
        <div class="qr-code-item">
          <div class="qr-label">BEP20地址</div>
          <div class="qr-code-wrapper">
            <canvas ref="bep20QrCanvas" class="qr-canvas"></canvas>
          </div>
          <div class="address-wrapper">
            <span class="address-text">{{ bep20Address }}</span>
            <button class="copy-button" @click="copyAddress(bep20Address)">
              <span class="copy-icon">📋</span>
            </button>
          </div>
        </div>

        <!-- TRC20 地址 -->
        <div class="qr-code-item">
          <div class="qr-label">TRC20地址</div>
          <div class="qr-code-wrapper">
            <canvas ref="trc20QrCanvas" class="qr-canvas"></canvas>
          </div>
          <div class="address-wrapper">
            <span class="address-text">{{ trc20Address }}</span>
            <button class="copy-button" @click="copyAddress(trc20Address)">
              <span class="copy-icon">📋</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="deposit"
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

// USD 余额
const usdBalance = ref('8.711')

// 地址
const bep20Address = ref('0xCc3df0Ccdec9D6ADCD3AfD999D1282Bd1939d8cd')
const trc20Address = ref('TQfvBWeQwkvHXaaZZbdfZ6YGxENgyqqwMn')

// 二维码 canvas 引用
const bep20QrCanvas = ref(null)
const trc20QrCanvas = ref(null)

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
  // 已经在存款页面，无需跳转
}

const handleWithdraw = () => {
  console.log('提款')
  alert('提款功能开发中...')
}

const handleBuyVT = () => {
  console.log('购买VT')
  alert('购买VT功能开发中...')
}

const copyAddress = async (address) => {
  try {
    await navigator.clipboard.writeText(address)
    alert('地址已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = address
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      alert('地址已复制到剪贴板！')
    } catch (e) {
      alert('复制失败，请手动复制')
    }
    document.body.removeChild(textArea)
  }
}

// 生成二维码
const generateQRCode = (canvas, text) => {
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const size = 200
  canvas.width = size
  canvas.height = size
  
  // 简单的二维码生成（使用简单的方块图案模拟）
  // 实际项目中应该使用专业的二维码库，如 qrcode.js
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, size, size)
  
  // 绘制简单的二维码图案
  ctx.fillStyle = '#FFFFFF'
  const blockSize = size / 25
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      // 模拟二维码的随机模式
      if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
        ctx.fillRect(i * blockSize, j * blockSize, blockSize, blockSize)
      }
    }
  }
  
  // 绘制定位标记（二维码的三个角）
  ctx.fillStyle = '#000000'
  // 左上角
  ctx.fillRect(0, 0, blockSize * 7, blockSize * 7)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(blockSize, blockSize, blockSize * 5, blockSize * 5)
  ctx.fillStyle = '#000000'
  ctx.fillRect(blockSize * 2, blockSize * 2, blockSize * 3, blockSize * 3)
  
  // 右上角
  ctx.fillStyle = '#000000'
  ctx.fillRect(size - blockSize * 7, 0, blockSize * 7, blockSize * 7)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(size - blockSize * 6, blockSize, blockSize * 5, blockSize * 5)
  ctx.fillStyle = '#000000'
  ctx.fillRect(size - blockSize * 5, blockSize * 2, blockSize * 3, blockSize * 3)
  
  // 左下角
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, size - blockSize * 7, blockSize * 7, blockSize * 7)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(blockSize, size - blockSize * 6, blockSize * 5, blockSize * 5)
  ctx.fillStyle = '#000000'
  ctx.fillRect(blockSize * 2, size - blockSize * 5, blockSize * 3, blockSize * 3)
}

onMounted(() => {
  generateQRCode(bep20QrCanvas.value, bep20Address.value)
  generateQRCode(trc20QrCanvas.value, trc20Address.value)
})
</script>

<style scoped>
.deposit-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层 */
.background {
  position: absolute;
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
  height: 40%;
  background: 
    linear-gradient(to top, #0a0a0a 0%, transparent 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cpath d='M0,400 L200,300 L400,350 L600,250 L800,320 L1000,280 L1200,300 L1200,400 Z' fill='%231a1a1a'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.8;
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
.deposit-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 60px;
  min-height: calc(100vh - 150px);
}

/* USD 钱包面板 */
.wallet-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  max-width: 840px;
  margin-left: auto;
  margin-right: auto;
}

.wallet-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
}

.wallet-balance {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.balance-icon {
  font-size: 48px;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.balance-value {
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.wallet-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-button {
  flex: 1;
  max-width: 200px;
  padding: 15px 30px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 8px;
  color: #ffd700;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
}

.action-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

/* 二维码区域 */
.qr-codes-section {
  display: flex;
  gap: 40px;
  justify-content: center;
  max-width: 840px;
  margin-left: auto;
  margin-right: auto;
}

.qr-code-item {
  flex: 1;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.qr-label {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.qr-code-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
}

.qr-canvas {
  width: 200px;
  height: 200px;
  display: block;
}

.address-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 12px 15px;
}

.address-text {
  flex: 1;
  color: white;
  font-size: 14px;
  word-break: break-all;
  font-family: 'Courier New', monospace;
}

.copy-button {
  flex-shrink: 0;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.copy-button:hover {
  background: rgba(255, 215, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.8);
  transform: scale(1.1);
}

.copy-icon {
  font-size: 16px;
  display: block;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .deposit-main-content {
    padding: 30px 20px;
  }

  .qr-codes-section {
    flex-direction: column;
    align-items: center;
  }

  .qr-code-item {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .deposit-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .wallet-balance {
    flex-direction: column;
    gap: 10px;
  }

  .balance-icon {
    font-size: 36px;
  }

  .balance-value {
    font-size: 24px;
  }

  .wallet-actions {
    flex-direction: column;
  }

  .action-button {
    max-width: 100%;
  }
}
</style>

