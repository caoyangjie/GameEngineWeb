<template>
  <div class="thinking-container">
    <!-- 背景层，与全局页面保持一致 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
      <div class="temple-background"></div>
      <div class="forest-overlay"></div>
    </div>

    <TopHeader @toggle-sidebar="toggleSidebar" />

    <main class="main-content">
      <header class="page-header">
        <div>
          <div class="badge">顶级思维模式训练</div>
          <h1 class="page-title">思维训练中心</h1>
          <p class="subtitle">
            多种经典思维模型训练，提升思维能力和决策水平，数据按当前登录用户隔离。
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleBack">返回首页</button>
        </div>
      </header>

      <section class="card-grid">
        <div
          v-for="mode in thinkingModes"
          :key="mode.route"
          class="card"
          @click="handleEnter(mode.route)"
        >
          <div class="card-header">
            <div class="card-icon">{{ mode.icon }}</div>
            <div class="card-title">{{ mode.title }}</div>
          </div>
          <div class="card-desc">{{ mode.desc }}</div>
          <div class="card-footer">
            <span></span>
            <span class="enter">进入 →</span>
          </div>
        </div>
      </section>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.THINKING_MODE_TRAINING"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { ROUTES, useRouter } from '../../composables/useRouter.js'

const router = useRouter()
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const thinkingModes = [
  { title: '5W2H分析法', route: ROUTES.THINKING_5W2H, icon: '❓', desc: '通过What、Why、Who、When、Where、How、How much七个维度全面分析问题' },
  { title: '笛卡尔思维模型', route: ROUTES.THINKING_DESCARTES, icon: '🧮', desc: '系统化分解复杂问题，通过逻辑推理找到解决方案' },
  { title: '费曼学习法', route: ROUTES.THINKING_FEYNMAN, icon: '📚', desc: '通过教授他人的方式检验和深化理解，提升学习效果' },
  { title: '刻意练习思维模型', route: ROUTES.THINKING_DELIBERATE_PRACTICE, icon: '🎯', desc: '有目的、有反馈的持续练习，突破能力边界' },
  { title: 'SMART目标模式', route: ROUTES.THINKING_SMART, icon: '🎪', desc: '制定具体、可衡量、可达成、相关、有时限的目标' },
  { title: '四象限法则', route: ROUTES.THINKING_QUADRANT, icon: '📊', desc: '按重要性和紧急性划分任务，优化时间管理' },
  { title: 'GROW模型', route: ROUTES.THINKING_GROW, icon: '🌱', desc: '通过目标、现状、选项、意愿四个维度进行结构化思考' },
  { title: '六顶思考帽', route: ROUTES.THINKING_SIX_HATS, icon: '🎩', desc: '从不同角度全面思考问题，避免思维局限' },
  { title: '头脑风暴法', route: ROUTES.THINKING_BRAINSTORMING, icon: '💡', desc: '自由联想，激发创意，产生大量创新想法' }
]

const handleEnter = (route) => {
  router.navigate(route)
}

const handleBack = () => {
  router.goToHome()
}
</script>

<style scoped>
.thinking-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  color: #f7f7f7;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.sky,
.stars,
.galaxy,
.mountains,
.temple-background,
.forest-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-size: cover;
}

.sky {
  background: linear-gradient(180deg, #0b1226 0%, #0a0a12 100%);
}

.stars {
  background: radial-gradient(white, rgba(255, 255, 255, 0) 35%);
  opacity: 0.25;
}

.galaxy {
  background: radial-gradient(ellipse at 40% 20%, rgba(86, 122, 255, 0.15), transparent 35%),
    radial-gradient(ellipse at 80% 10%, rgba(244, 208, 63, 0.14), transparent 35%);
  opacity: 0.6;
}

.mountains {
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.6) 100%);
}

.temple-background {
  background: radial-gradient(ellipse at 20% 60%, rgba(255, 255, 255, 0.04), transparent 40%);
}

.forest-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(6, 9, 16, 0.95) 85%);
}

.main-content {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 40px 40px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.72) 0%,
    rgba(0, 0, 0, 0.82) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.35);
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.18),
    inset 0 0 30px rgba(255, 215, 0, 0.05),
    0 12px 40px rgba(0, 0, 0, 0.45);
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 215, 0, 0.18);
  color: #f4d03f;
  font-size: 12px;
}

.page-title {
  font-size: 36px;
  color: #ffd700;
  text-shadow: 0 0 18px rgba(255, 215, 0, 0.7);
  margin: 8px 0 6px;
}

.subtitle {
  color: #c5c5c5;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  padding: 12px 22px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.35);
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.25s;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.btn-secondary:hover {
  background: rgba(255, 215, 0, 0.18);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.35);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.card {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.15s ease, border 0.15s ease, box-shadow 0.15s ease;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
}

.card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow:
    0 0 40px rgba(255, 215, 0, 0.22),
    inset 0 0 30px rgba(255, 215, 0, 0.08),
    0 14px 40px rgba(0, 0, 0, 0.5);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  font-size: 26px;
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
}

.card-title {
  font-weight: 700;
  font-size: 20px;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
}

.card-desc {
  color: #c5c5c5;
  font-size: 14px;
  min-height: 38px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  color: #8fd19e;
  font-size: 13px;
}

.card-footer .enter {
  color: #ffd700;
}

@media (max-width: 768px) {
  .main-content {
    padding: 100px 20px 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .card-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>

