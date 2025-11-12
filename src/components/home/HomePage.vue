<template>
  <div class="home-container">
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
    <main class="main-content">
      <!-- 左侧角色区域 -->
      <div class="characters-section">
        <!-- 猪八戒 -->
        <div class="character-card">
          <div class="character-avatar piggy">
            <img 
              :src="characterImages.piggy" 
              alt="猪八戒" 
              class="character-image"
              @error="handleImageError('piggy')"
            />
            <div class="character-status-text waiting">{{ t('home.waitingForTeammate') }}</div>
          </div>
        </div>

        <!-- 孙悟空 -->
        <div class="character-card main-character">
          <div class="character-avatar monkey-king">
            <img 
              :src="characterImages.monkey" 
              alt="孙悟空" 
              class="character-image"
              @error="handleImageError('monkey')"
            />
            <div class="character-status-text active">
              <span class="status-icon">🥈</span>
              <span class="status-text">{{ t('home.silver') }} - 150{{ t('home.days') }}</span>
            </div>
          </div>
        </div>

        <!-- 唐僧 -->
        <div class="character-card">
          <div class="character-avatar monk">
            <img 
              :src="characterImages.monk" 
              alt="唐僧" 
              class="character-image"
              @error="handleImageError('monk')"
            />
            <div class="character-status-text waiting">{{ t('home.waitingForTeammate') }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧用户信息面板 -->
      <div class="user-info-panel">
        <div class="panel-header">
          <h2 class="panel-title">长赐变天</h2>
          <div class="panel-email">
            <span class="email-icon">📜</span>
            <span class="email-text">155155@163.COM</span>
          </div>
        </div>

        <div class="balance-list">
          <!-- 赏金库余额 -->
          <div class="balance-item" @click="handleGoToVTWallet">
            <div class="balance-icon">🥣</div>
            <div class="balance-info">
              <div class="balance-label">{{ t('home.bountyVaultBalance') }}</div>
              <div class="balance-value">567.060</div>
            </div>
            <div class="balance-arrow">→</div>
          </div>

          <!-- VT 余额 -->
          <div class="balance-item" @click="handleGoToVTWallet">
            <div class="balance-icon">💰</div>
            <div class="balance-info">
              <div class="balance-label">{{ t('home.vtBalance') }}</div>
              <div class="balance-value">0.000</div>
            </div>
            <div class="balance-arrow">→</div>
          </div>

          <!-- 终生社群赏金 -->
          <div class="balance-item">
            <div class="balance-icon">🏆</div>
            <div class="balance-info">
              <div class="balance-label">{{ t('home.lifetimeCommunityBounty') }}</div>
              <div class="balance-value">0.000</div>
            </div>
            <div class="balance-arrow">→</div>
          </div>

          <!-- 倍增池 -->
          <div class="balance-item highlight">
            <div class="balance-icon">🎒</div>
            <div class="balance-info">
              <div class="balance-label">{{ t('home.multiplierPool') }}</div>
              <div class="balance-value">7,566.519</div>
            </div>
            <div class="balance-arrow">→</div>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="home"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()

const sidebarOpen = ref(false)

// 角色图片URL - 使用公开的图片资源
// 注意：这些是示例URL，您可以根据需要替换为实际的西游记角色图片
// 建议：将图片保存到项目的 public/images 目录，然后使用 /images/文件名.jpg 的方式引用
const characterImages = reactive({
  piggy: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&q=80&auto=format',
  monkey: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=600&fit=crop&q=80&auto=format',
  monk: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop&q=80&auto=format'
})

// 备用图片URL（如果主图片加载失败，使用占位符）
const fallbackImages = {
  piggy: 'https://via.placeholder.com/400x600/FFB6C1/FFFFFF?text=猪八戒',
  monkey: 'https://via.placeholder.com/400x600/FFD700/000000?text=孙悟空',
  monk: 'https://via.placeholder.com/400x600/90EE90/000000?text=唐僧'
}

const handleImageError = (character) => {
  // 如果图片加载失败，使用备用图片
  characterImages[character] = fallbackImages[character]
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

const handleGoToVTWallet = () => {
  router.goToVTWallet()
}

</script>

<style scoped>
.home-container {
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
.main-content {
  position: relative;
  z-index: 5;
  display: flex;
  gap: 40px;
  padding: 40px;
  max-width: 1600px;
  margin: 0 auto;
  padding-top: 100px;
  min-height: calc(100vh - 80px);
  align-items: center;
}

/* 角色区域 */
.characters-section {
  flex: 1.5;
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 350px;
}

.character-card.main-character {
  transform: scale(1.15);
  z-index: 2;
}

.character-avatar {
  width: 100%;
  max-width: 320px;
  height: 480px;
  background: linear-gradient(
    to bottom,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 140, 0, 0.15) 50%,
    rgba(255, 215, 0, 0.1) 100%
  );
  border: 3px solid rgba(255, 215, 0, 0.4);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.character-avatar:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.6),
    inset 0 0 30px rgba(255, 215, 0, 0.2);
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
}

.character-avatar.piggy {
  background: linear-gradient(
    to bottom,
    rgba(255, 182, 193, 0.2) 0%,
    rgba(255, 140, 160, 0.25) 50%,
    rgba(255, 182, 193, 0.2) 100%
  );
  border-color: rgba(255, 182, 193, 0.6);
  box-shadow: 
    0 0 30px rgba(255, 182, 193, 0.4),
    inset 0 0 30px rgba(255, 182, 193, 0.1);
}

.character-avatar.piggy:hover {
  box-shadow: 
    0 0 40px rgba(255, 182, 193, 0.6),
    inset 0 0 30px rgba(255, 182, 193, 0.2);
}

.character-avatar.monkey-king {
  background: linear-gradient(
    to bottom,
    rgba(255, 215, 0, 0.2) 0%,
    rgba(255, 140, 0, 0.3) 50%,
    rgba(255, 215, 0, 0.2) 100%
  );
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.6),
    inset 0 0 40px rgba(255, 215, 0, 0.2);
}

.character-avatar.monkey-king:hover {
  box-shadow: 
    0 0 50px rgba(255, 215, 0, 0.8),
    inset 0 0 40px rgba(255, 215, 0, 0.3);
}

.character-avatar.monk {
  background: linear-gradient(
    to bottom,
    rgba(144, 238, 144, 0.2) 0%,
    rgba(100, 200, 100, 0.25) 50%,
    rgba(144, 238, 144, 0.2) 100%
  );
  border-color: rgba(144, 238, 144, 0.6);
  box-shadow: 
    0 0 30px rgba(144, 238, 144, 0.4),
    inset 0 0 30px rgba(144, 238, 144, 0.1);
}

.character-avatar.monk:hover {
  box-shadow: 
    0 0 40px rgba(144, 238, 144, 0.6),
    inset 0 0 30px rgba(144, 238, 144, 0.2);
}


.character-status-text {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: bold;
  z-index: 10;
  padding: 10px 24px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.character-status-text.waiting {
  background: rgba(100, 100, 100, 0.7);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 0 15px rgba(255, 255, 255, 0.2),
    inset 0 0 10px rgba(0, 0, 0, 0.3);
}

.character-status-text.active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.95) 0%, rgba(255, 140, 0, 0.95) 100%);
  color: #1a0a2e;
  border: 2px solid rgba(255, 215, 0, 1);
  box-shadow: 
    0 0 25px rgba(255, 215, 0, 0.7),
    0 4px 15px rgba(255, 140, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.status-icon {
  font-size: 20px;
}

.status-text {
  font-size: 18px;
}

/* 用户信息面板 */
.user-info-panel {
  width: 400px;
  flex-shrink: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.panel-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
}

.panel-title {
  font-size: 24px;
  color: #ffd700;
  margin: 0 0 10px 0;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.panel-email {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.email-icon {
  font-size: 16px;
}

.balance-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.balance-item:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
  transform: translateX(5px);
}

.balance-item.highlight {
  background: rgba(255, 68, 68, 0.1);
  border-color: rgba(255, 68, 68, 0.3);
}

.balance-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.balance-info {
  flex: 1;
}

.balance-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.balance-value {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.balance-item.highlight .balance-value {
  color: #ff6b6b;
}

.balance-arrow {
  color: rgba(255, 215, 0, 0.6);
  font-size: 18px;
}


/* 响应式设计 */
@media (max-width: 1400px) {
  .main-content {
    gap: 30px;
    padding: 30px 20px;
  }

  .character-avatar {
    max-width: 280px;
    height: 420px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
    align-items: center;
  }

  .characters-section {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .character-card {
    max-width: 300px;
  }

  .character-avatar {
    max-width: 260px;
    height: 390px;
  }

  .user-info-panel {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
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

  .main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .characters-section {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .character-card {
    width: 100%;
    max-width: 280px;
  }

  .character-card.main-character {
    transform: scale(1);
  }

  .character-avatar {
    width: 100%;
    max-width: 240px;
    height: 360px;
  }

  .character-status-text {
    font-size: 14px;
    padding: 8px 16px;
  }

  .status-text {
    font-size: 14px;
  }
}
</style>

