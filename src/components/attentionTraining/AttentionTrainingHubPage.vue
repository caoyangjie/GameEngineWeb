<template>
  <div class="attention-container">
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
          <div class="badge">专注力训练</div>
          <h1 class="page-title">训练中心</h1>
          <p class="subtitle">
            八大训练模块，数据按当前登录用户隔离，进入后均有分页检索。
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleBack">返回首页</button>
        </div>
      </header>

      <section class="card-grid">
        <div
          v-for="game in games"
          :key="game.route"
          class="card"
          @click="handleEnter(game.route)"
        >
          <div class="card-header">
            <div class="card-icon">{{ game.icon }}</div>
            <div class="card-title">{{ game.title }}</div>
          </div>
          <div class="card-desc">{{ game.desc }}</div>
          <div class="card-footer">
            <span></span>
            <span class="enter">进入 →</span>
          </div>
        </div>
      </section>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.ATTENTION_TRAINING"
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

const games = [
  { title: '数字入门', route: ROUTES.ATTENTION_DIGIT_INTRO, icon: '🔢', desc: '基础数字识别与反应练习' },
  { title: '字母巩固', route: ROUTES.ATTENTION_LETTER_REINFORCE, icon: '🔠', desc: '字母顺序与反射巩固训练' },
  { title: '成语进阶', route: ROUTES.ATTENTION_IDIOM_ADVANCED, icon: '📜', desc: '语义匹配与专注力结合' },
  { title: '诗词挑战', route: ROUTES.ATTENTION_POETRY_CHALLENGE, icon: '🖋️', desc: '诗句补全与记忆跨度训练' },
  { title: '诗词巩固', route: ROUTES.ATTENTION_POETRY_REINFORCE, icon: '📝', desc: '诗词字格记忆游戏，按顺序点击完成' },
  { title: '数独', route: ROUTES.ATTENTION_SUDOKU, icon: '🧩', desc: '逻辑与专注融合的数独关卡' },
  { title: '数字华容道', route: ROUTES.ATTENTION_NUMBER_SLIDER, icon: '🎛️', desc: '滑块拼数与路径规划' },
  { title: '照相记忆', route: ROUTES.ATTENTION_PHOTO_MEMORY, icon: '📸', desc: '瞬时视觉记忆与回忆训练' },
  { title: '数字记忆编码', route: ROUTES.ATTENTION_NUMBER_MEMORY_CODE, icon: '🔑', desc: '00-99 数字编码图片记忆训练' },
  { title: '数字传真', route: ROUTES.ATTENTION_NUMBER_FAX, icon: '📠', desc: '选择目标数字，统计在多组数字中的出现次数' },
  { title: '扑克牌快速记忆', route: ROUTES.ATTENTION_CARD_MEMORY, icon: '🃏', desc: '参考记忆大师顺背技巧的整副牌速记练习' },
  { title: '感官探险记忆法', route: ROUTES.ATTENTION_SENSORY_MEMORY, icon: '🧠', desc: '通过视觉、听觉、嗅觉、触觉、味觉的协同运用，增强记忆力和联想能力' },
  { title: '定桩记忆法', route: ROUTES.ATTENTION_PEG_MEMORY, icon: '📍', desc: '自定义定桩模板，强化数字与记忆目标的对应关系' }
]

const handleEnter = (route) => {
  router.navigate(route)
}

const handleBack = () => {
  router.goToHome()
}
</script>

<style scoped>
.attention-container {
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

