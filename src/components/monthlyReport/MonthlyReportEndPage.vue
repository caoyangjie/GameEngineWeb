<template>
  <div class="monthly-report-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
    </div>

    <!-- 顶部导航栏 -->
    <TopHeader @toggle-sidebar="toggleSidebar" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="report-header">
        <h1 class="report-title">{{ t('monthlyReport.end.title') }}</h1>
        <div class="report-date">{{ currentDate }}</div>
      </div>

      <div class="report-content">
        <!-- 收益目标 -->
        <section class="report-section revenue-goals">
          <h2 class="section-title">{{ t('monthlyReport.end.revenueGoals.title') }}</h2>
          <div class="goals-grid">
            <div class="goal-item">
              <label class="goal-label">{{ t('monthlyReport.end.revenueGoals.targetMRR') }}</label>
              <div class="goal-description">{{ t('monthlyReport.end.revenueGoals.targetMRRDesc') }}</div>
              <input 
                v-model.number="reportData.revenueGoals.targetMRR" 
                type="number" 
                class="goal-input"
                placeholder="0"
              />
              <span class="unit">K</span>
            </div>
            <div class="goal-item">
              <label class="goal-label">{{ t('monthlyReport.end.revenueGoals.currentMRR') }}</label>
              <div class="goal-description">{{ t('monthlyReport.end.revenueGoals.currentMRRDesc') }}</div>
              <input 
                v-model.number="reportData.revenueGoals.currentMRR" 
                type="number" 
                class="goal-input"
                placeholder="0"
              />
              <span class="unit">K</span>
            </div>
            <div class="goal-item">
              <label class="goal-label">{{ t('monthlyReport.end.revenueGoals.mvpProfit') }}</label>
              <div class="goal-description">{{ t('monthlyReport.end.revenueGoals.mvpProfitDesc') }}</div>
              <input 
                v-model.number="reportData.revenueGoals.mvpProfit" 
                type="number" 
                class="goal-input"
                placeholder="0"
              />
              <span class="unit">K</span>
            </div>
            <div class="goal-item">
              <label class="goal-label">{{ t('monthlyReport.end.revenueGoals.workFreedom') }}</label>
              <div class="goal-description">{{ t('monthlyReport.end.revenueGoals.workFreedomDesc') }}</div>
              <input 
                v-model.number="reportData.revenueGoals.workFreedom" 
                type="number" 
                class="goal-input"
                placeholder="0"
              />
              <span class="unit">K</span>
            </div>
          </div>
        </section>

        <!-- 资产构成 -->
        <section class="report-section asset-composition">
          <h2 class="section-title">{{ t('monthlyReport.end.assetComposition.title') }}</h2>
          <div class="asset-composition-grid">
            <!-- 首要资产 -->
            <div class="asset-category">
              <h3 class="category-title">{{ t('monthlyReport.end.assetComposition.primaryAssets') }}</h3>
              <div 
                v-for="(asset, index) in reportData.assetComposition.primaryAssets" 
                :key="'primary-' + index"
                class="asset-item"
              >
                <div class="asset-row">
                  <span class="asset-label">MRR ±</span>
                  <input 
                    v-model.number="asset.mrr" 
                    type="number" 
                    class="asset-input small"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                  <span class="asset-label">{{ t('monthlyReport.end.assetComposition.score') }}</span>
                  <input 
                    v-model.number="asset.score" 
                    type="number" 
                    min="0"
                    max="5"
                    class="asset-input tiny"
                    placeholder="0"
                  />
                  <span class="unit">/5</span>
                </div>
                <textarea 
                  v-model="asset.notes" 
                  class="asset-notes"
                  :placeholder="t('monthlyReport.end.assetComposition.notes')"
                ></textarea>
              </div>
              <button @click="addPrimaryAsset" class="add-asset-btn">+ {{ t('monthlyReport.end.assetComposition.addAsset') }}</button>
            </div>

            <!-- 次要资产 -->
            <div class="asset-category">
              <h3 class="category-title">{{ t('monthlyReport.end.assetComposition.secondaryAssets') }}</h3>
              <div 
                v-for="(asset, index) in reportData.assetComposition.secondaryAssets" 
                :key="'secondary-' + index"
                class="asset-item"
              >
                <div class="asset-row">
                  <span class="asset-label">MRR ±</span>
                  <input 
                    v-model.number="asset.mrr" 
                    type="number" 
                    class="asset-input small"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                  <span class="asset-label">{{ t('monthlyReport.end.assetComposition.score') }}</span>
                  <input 
                    v-model.number="asset.score" 
                    type="number" 
                    min="0"
                    max="5"
                    class="asset-input tiny"
                    placeholder="0"
                  />
                  <span class="unit">/5</span>
                </div>
                <textarea 
                  v-model="asset.notes" 
                  class="asset-notes"
                  :placeholder="t('monthlyReport.end.assetComposition.notes')"
                ></textarea>
              </div>
              <button @click="addSecondaryAsset" class="add-asset-btn">+ {{ t('monthlyReport.end.assetComposition.addAsset') }}</button>
            </div>

            <!-- 其他资产（合计） -->
            <div class="asset-category">
              <h3 class="category-title">{{ t('monthlyReport.end.assetComposition.otherAssets') }}</h3>
              <div class="other-assets-section">
                <div class="other-asset-item">
                  <label class="asset-label">MRR ±</label>
                  <input 
                    v-model.number="reportData.assetComposition.otherAssets.totalMRR" 
                    type="number" 
                    class="asset-input small"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                </div>
                <div class="other-asset-subsection">
                  <div class="other-asset-item">
                    <label class="asset-label">{{ t('monthlyReport.end.assetComposition.positiveAssets') }}</label>
                    <input 
                      v-model.number="reportData.assetComposition.otherAssets.positiveMRR" 
                      type="number" 
                      class="asset-input small"
                      placeholder="0"
                    />
                    <span class="unit">K</span>
                  </div>
                  <div class="other-asset-item">
                    <label class="asset-label">{{ t('monthlyReport.end.assetComposition.negativeAssets') }}</label>
                    <input 
                      v-model.number="reportData.assetComposition.otherAssets.negativeMRR" 
                      type="number" 
                      class="asset-input small"
                      placeholder="0"
                    />
                    <span class="unit">K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 用户池 -->
        <section class="report-section user-pool">
          <h2 class="section-title">{{ t('monthlyReport.end.userPool.title') }}</h2>
          <div class="section-description">{{ t('monthlyReport.end.userPool.description') }}</div>
          <div class="user-pool-grid">
            <!-- 原生用户 -->
            <div class="user-pool-item">
              <label class="pool-label">{{ t('monthlyReport.end.userPool.nativeUsers') }}</label>
              <div class="pool-description">{{ t('monthlyReport.end.userPool.nativeUsersDesc') }}</div>
              <div class="user-metrics">
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.total') }}</span>
                  <input 
                    v-model.number="reportData.userPool.nativeUsers.total" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.monthlyActive') }}</span>
                  <input 
                    v-model.number="reportData.userPool.nativeUsers.monthlyActive" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.monthlyChange') }}</span>
                  <input 
                    v-model.number="reportData.userPool.nativeUsers.monthlyChange" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                </div>
              </div>
            </div>

            <!-- 第三方平台用户 -->
            <div class="user-pool-item">
              <label class="pool-label">{{ t('monthlyReport.end.userPool.thirdPartyUsers') }}</label>
              <div class="pool-description">{{ t('monthlyReport.end.userPool.thirdPartyUsersDesc') }}</div>
              <div class="user-metrics">
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.total') }}</span>
                  <input 
                    v-model.number="reportData.userPool.thirdPartyUsers.total" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.monthlyActive') }}</span>
                  <input 
                    v-model.number="reportData.userPool.thirdPartyUsers.monthlyActive" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.monthlyChange') }}</span>
                  <input 
                    v-model.number="reportData.userPool.thirdPartyUsers.monthlyChange" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                  <span class="unit">K</span>
                </div>
              </div>
            </div>

            <!-- 传播用户 -->
            <div class="user-pool-item">
              <label class="pool-label">{{ t('monthlyReport.end.userPool.spreadingUsers') }}</label>
              <div class="pool-description">{{ t('monthlyReport.end.userPool.spreadingUsersDesc') }}</div>
              <div class="user-metrics">
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.quantity') }}</span>
                  <input 
                    v-model.number="reportData.userPool.spreadingUsers.quantity" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                </div>
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.monthlyChange') }}</span>
                  <input 
                    v-model.number="reportData.userPool.spreadingUsers.monthlyChange" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <!-- 付费用户 -->
            <div class="user-pool-item">
              <label class="pool-label">{{ t('monthlyReport.end.userPool.payingUsers') }}</label>
              <div class="pool-description">{{ t('monthlyReport.end.userPool.payingUsersDesc') }}</div>
              <div class="user-metrics">
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.total') }}</span>
                  <input 
                    v-model.number="reportData.userPool.payingUsers.total" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                </div>
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.thisMonth') }}</span>
                  <input 
                    v-model.number="reportData.userPool.payingUsers.thisMonth" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                </div>
                <div class="metric-row">
                  <span class="metric-label">{{ t('monthlyReport.end.userPool.monthlyChange') }}</span>
                  <input 
                    v-model.number="reportData.userPool.payingUsers.monthlyChange" 
                    type="number" 
                    class="metric-input"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 内容池 -->
        <section class="report-section content-pool">
          <h2 class="section-title">{{ t('monthlyReport.end.contentPool.title') }}</h2>
          <div class="section-description">{{ t('monthlyReport.end.contentPool.description') }}</div>
          <textarea 
            v-model="reportData.contentPool" 
            class="content-textarea"
            :placeholder="t('monthlyReport.end.contentPool.placeholder')"
          ></textarea>
        </section>

        <!-- 基础设施 -->
        <section class="report-section infrastructure">
          <h2 class="section-title">{{ t('monthlyReport.end.infrastructure.title') }}</h2>
          <div class="section-description">{{ t('monthlyReport.end.infrastructure.description') }}</div>
          <textarea 
            v-model="reportData.infrastructure" 
            class="content-textarea"
            :placeholder="t('monthlyReport.end.infrastructure.placeholder')"
          ></textarea>
        </section>

        <!-- 保存按钮 -->
        <div class="action-buttons">
          <button @click="saveReport" class="save-btn">{{ t('monthlyReport.end.save') }}</button>
          <button @click="resetReport" class="reset-btn">{{ t('monthlyReport.end.reset') }}</button>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      :active-route="ROUTES.MONTHLY_REPORT_END"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'
import { showConfirm } from '../../utils/alert.js'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)
const currentDate = computed(() => {
  const now = new Date()
  return t('monthlyReport.end.dateFormat', {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  })
})

// 报告数据
const reportData = reactive({
  revenueGoals: {
    targetMRR: null,
    currentMRR: null,
    mvpProfit: null,
    workFreedom: null
  },
  assetComposition: {
    primaryAssets: [],
    secondaryAssets: [],
    otherAssets: {
      totalMRR: null,
      positiveMRR: null,
      negativeMRR: null
    }
  },
  userPool: {
    nativeUsers: {
      total: null,
      monthlyActive: null,
      monthlyChange: null
    },
    thirdPartyUsers: {
      total: null,
      monthlyActive: null,
      monthlyChange: null
    },
    spreadingUsers: {
      quantity: null,
      monthlyChange: null
    },
    payingUsers: {
      total: null,
      thisMonth: null,
      monthlyChange: null
    }
  },
  contentPool: '',
  infrastructure: ''
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const addPrimaryAsset = () => {
  reportData.assetComposition.primaryAssets.push({
    mrr: null,
    score: null,
    notes: ''
  })
}

const addSecondaryAsset = () => {
  reportData.assetComposition.secondaryAssets.push({
    mrr: null,
    score: null,
    notes: ''
  })
}

const saveReport = () => {
  // TODO: 实现保存逻辑
  console.log('保存报告:', reportData)
  alert(t('monthlyReport.end.saveSuccess'))
}

// 回车键事件处理
const handleKeydown = (event) => {
  // 如果按的是回车键，触发保存
  if (event.key === 'Enter') {
    // 如果焦点在输入框或文本框中，不触发保存（避免与表单提交冲突）
    const target = event.target
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // 对于 textarea，Ctrl+Enter 或 Cmd+Enter 触发保存
      if (target.tagName === 'TEXTAREA' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        saveReport()
      }
      return
    }
    // 其他情况下，回车键触发保存
    event.preventDefault()
    saveReport()
  }
}

const resetReport = async () => {
  const confirmed = await showConfirm(t('monthlyReport.end.resetConfirm'), { type: 'info' })
  if (confirmed) {
    reportData.revenueGoals = {
      targetMRR: null,
      currentMRR: null,
      mvpProfit: null,
      workFreedom: null
    }
    reportData.assetComposition = {
      primaryAssets: [],
      secondaryAssets: [],
      otherAssets: {
        totalMRR: null,
        positiveMRR: null,
        negativeMRR: null
      }
    }
    reportData.userPool = {
      nativeUsers: {
        total: null,
        monthlyActive: null,
        monthlyChange: null
      },
      thirdPartyUsers: {
        total: null,
        monthlyActive: null,
        monthlyChange: null
      },
      spreadingUsers: {
        quantity: null,
        monthlyChange: null
      },
      payingUsers: {
        total: null,
        thisMonth: null,
        monthlyChange: null
      }
    }
    reportData.contentPool = ''
    reportData.infrastructure = ''
  }
}

// 加载保存的报告数据
onMounted(() => {
  // TODO: 从服务器或本地存储加载数据
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.monthly-report-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
}

/* 背景层 */
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

/* 主要内容区域 */
.main-content {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 40px 40px;
}

.report-header {
  text-align: center;
  margin-bottom: 40px;
}

.report-title {
  font-size: 36px;
  color: #ffd700;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}

.report-date {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.report-section {
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

.section-title {
  font-size: 24px;
  color: #ffd700;
  margin-bottom: 15px;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  padding-bottom: 10px;
}

.section-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
}

/* 收益目标 */
.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.goal-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.goal-label {
  font-size: 16px;
  font-weight: bold;
  color: #ffd700;
}

.goal-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 5px;
}

.goal-input {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
}

.goal-input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.unit {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* 资产构成 */
.asset-composition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.asset-category {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
}

.category-title {
  font-size: 18px;
  color: #ffd700;
  margin-bottom: 15px;
  text-align: center;
}

.asset-item {
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.asset-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  position: relative;
}

.asset-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.asset-input {
  padding: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 4px;
  color: white;
  font-size: 14px;
}

.asset-input.small {
  width: 80px;
}

.asset-input.tiny {
  width: 50px;
}

.asset-notes {
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 4px;
  color: white;
  font-size: 12px;
  resize: vertical;
  min-height: 60px;
}

.add-asset-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px dashed rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  color: #ffd700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.add-asset-btn:hover {
  background: rgba(255, 215, 0, 0.3);
  border-color: rgba(255, 215, 0, 0.7);
}

.other-assets-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.other-asset-item {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.other-asset-subsection {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 20px;
  padding-left: 15px;
  border-left: 2px solid rgba(255, 215, 0, 0.3);
}

/* 用户池 */
.user-pool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.user-pool-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pool-label {
  font-size: 16px;
  font-weight: bold;
  color: #ffd700;
}

.pool-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 5px;
}

.user-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.metric-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  min-width: 80px;
}

.metric-input {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
}

.metric-input:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* 内容池和基础设施 */
.content-textarea {
  width: 100%;
  min-height: 150px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.content-textarea:focus {
  outline: none;
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.save-btn,
.reset-btn {
  padding: 12px 40px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
}

.save-btn:hover {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 100px 20px 20px;
  }

  .goals-grid,
  .user-pool-grid {
    grid-template-columns: 1fr;
  }

  .asset-composition-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .save-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>

