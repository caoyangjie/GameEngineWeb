<template>
  <div class="writing-container">
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
          <div class="badge">作文提升训练</div>
          <h1 class="page-title">写作训练中心</h1>
          <p class="subtitle">
            针对小学到高中常见写作能力拆解成 15 个模块，每个模块独立训练，数据按登录用户隔离。
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleBack">返回首页</button>
        </div>
      </header>

      <section class="card-grid">
        <div
          v-for="module in modules"
          :key="module.route"
          class="card"
          @click="handleEnter(module.route)"
        >
          <div class="card-header">
            <div class="card-icon">{{ module.icon }}</div>
            <div class="card-title">{{ module.title }}</div>
          </div>
          <div class="card-desc">{{ module.desc }}</div>
          <div class="card-footer">
            <span></span>
            <span class="enter">进入 →</span>
          </div>
        </div>
      </section>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.WRITING_TRAINING"
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

const modules = [
  { title: '扩词法', route: ROUTES.WRITING_WORD_EXPANSION, icon: '🧩', desc: '快速联想同义/近义/反义词，丰富表达库' },
  { title: '总分总结构', route: ROUTES.WRITING_OVERVIEW_STRUCTURE, icon: '🧭', desc: '学会起总分总三段式，提升文章框架清晰度' },
  { title: '写人', route: ROUTES.WRITING_CHARACTER, icon: '👤', desc: '人物外貌、动作、语言、心理刻画训练' },
  { title: '写事', route: ROUTES.WRITING_EVENT, icon: '📘', desc: '以时间轴和因果链串联事件，突出起承转合' },
  { title: '写景', route: ROUTES.WRITING_SCENERY, icon: '🌄', desc: '观察顺序与空间层次写景，融入情感' },
  { title: '写动物', route: ROUTES.WRITING_ANIMAL, icon: '🐾', desc: '抓住特征、习性与拟人化描述，增强可读性' },
  { title: '写植物', route: ROUTES.WRITING_PLANT, icon: '🌿', desc: '生长过程、形态细节与比喻，让植物有生命力' },
  { title: '写静物', route: ROUTES.WRITING_OBJECT, icon: '🏺', desc: '结构、质感、用途结合回忆，写出物的意义' },
  { title: '如何开头', route: ROUTES.WRITING_OPENING, icon: '🚪', desc: '金句、设问、画面、对比等多种开头策略练习' },
  { title: '如何结尾', route: ROUTES.WRITING_CLOSING, icon: '🏁', desc: '点题、回环、升华与开放式结尾的写作演练' },
  { title: '如何写中间', route: ROUTES.WRITING_BODY, icon: '🧱', desc: '过渡衔接、段落节奏与细节展开的中段写作' },
  { title: '五感法', route: ROUTES.WRITING_FIVE_SENSES, icon: '👁️', desc: '视觉、听觉、嗅觉、味觉、触觉多感官描写' },
  { title: '感受-经历-反思结构', route: ROUTES.WRITING_EXPERIENCE_REFLECTION, icon: '🔄', desc: '从感受出发，记录经历，再进行反思升华' },
  { title: '场景-人物-动作结构', route: ROUTES.WRITING_SCENE_CHARACTER_ACTION, icon: '🎬', desc: '以镜头语言串联场景、人物与动作，增强画面感' },
  { title: '问题-解决-结果模式', route: ROUTES.WRITING_PROBLEM_SOLUTION_RESULT, icon: '✅', desc: '呈现问题、过程与结果，突出逻辑与收获' }
]

const handleEnter = (route) => {
  router.navigate(route)
}

const handleBack = () => {
  router.goToHome()
}
</script>

<style scoped>
.writing-container {
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


