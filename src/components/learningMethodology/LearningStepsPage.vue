<template>
  <div class="learning-steps-container">
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
    <TopHeader @toggle-sidebar="toggleSidebar" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <header class="page-header">
        <div>
          <div class="badge">教育学习方法论</div>
          <h1 class="page-title">{{ learningTopic }}</h1>
          <p class="subtitle">
            根据模板拆分为多个学习步骤，系统化学习。
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleBack">返回学习列表</button>
        </div>
      </header>

      <!-- 步骤条和学习内容区域 -->
      <section v-if="steps.length > 0" class="steps-section">
        <div class="section-card">
          <h2 class="section-title">学习步骤</h2>
          
          <!-- 步骤条 -->
          <div class="steps-progress">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="step-item"
              :class="{ active: currentStepIndex === index, completed: currentStepIndex > index }"
              @click="goToStep(index)"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-title">{{ step.title }}</div>
            </div>
          </div>

          <!-- 当前步骤内容 -->
          <div v-if="currentStep" class="step-content">
            <div class="step-content-header">
              <h3 class="step-content-title">{{ currentStep.title }}</h3>
              <div class="step-navigation">
                <button
                  class="btn-nav"
                  @click="previousStep"
                  :disabled="currentStepIndex === 0"
                >
                  ← 上一步
                </button>
                <span class="step-counter">
                  步骤 {{ currentStepIndex + 1 }} / {{ steps.length }}
                </span>
                <button
                  class="btn-nav"
                  @click="nextStep"
                  :disabled="currentStepIndex === steps.length - 1"
                >
                  下一步 →
                </button>
              </div>
            </div>
            
            <div class="step-content-body">
              <div v-if="currentStep.description" class="step-description">
                <h4>步骤说明</h4>
                <p>{{ currentStep.description }}</p>
              </div>
              
              <div v-if="currentStep.content" class="step-main-content">
                <h4>学习内容</h4>
                <div class="content-text" v-html="formatContent(currentStep.content)"></div>
              </div>
              
              <div v-if="currentStep.tasks && currentStep.tasks.length > 0" class="step-tasks">
                <h4>任务清单</h4>
                <ul class="task-list">
                  <li v-for="(task, taskIndex) in currentStep.tasks" :key="taskIndex" class="task-item">
                    <div 
                      class="task-main"
                      @click="toggleTaskRecord(currentStepIndex, taskIndex)"
                      :title="getTaskRecordExpanded(currentStepIndex, taskIndex) ? '点击收起记录' : '点击展开记录'"
                    >
                      <span class="task-label">{{ task.text }}</span>
                      <span class="task-expand-icon" :class="{ expanded: getTaskRecordExpanded(currentStepIndex, taskIndex) }">
                        ▼
                      </span>
                    </div>
                    <!-- 任务记录编辑器 -->
                    <div
                      v-if="getTaskRecordExpanded(currentStepIndex, taskIndex)"
                      class="task-record-editor"
                      @click.stop
                    >
                      <div class="record-tabs">
                        <button
                          class="tab-btn"
                          :class="{ active: getTaskRecordMode(currentStepIndex, taskIndex) === 'preview' }"
                          @click="setTaskRecordMode(currentStepIndex, taskIndex, 'preview')"
                        >
                          预览
                        </button>
                        <button
                          class="tab-btn"
                          :class="{ active: getTaskRecordMode(currentStepIndex, taskIndex) === 'edit' }"
                          @click="setTaskRecordMode(currentStepIndex, taskIndex, 'edit')"
                        >
                          编辑
                        </button>
                      </div>
                      <div v-if="getTaskRecordMode(currentStepIndex, taskIndex) === 'edit'" class="record-edit">
                        <textarea
                          v-model="task.record"
                          placeholder="使用 Markdown 格式记录任务相关信息..."
                          class="record-textarea"
                          rows="6"
                        ></textarea>
                      </div>
                      <div v-else class="record-preview">
                        <div
                          class="record-preview-content"
                          v-html="renderMarkdown(task.record || '')"
                        ></div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div class="step-notes">
                <h4>学习笔记</h4>
                <textarea
                  v-model="currentStep.notes"
                  placeholder="在这里记录您的学习笔记..."
                  class="notes-textarea"
                  rows="5"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn-secondary" @click="handleBack">返回模板列表</button>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar
      :is-open="sidebarOpen"
      :active-route="ROUTES.LEARNING_STEPS"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { ROUTES, useRouter } from '../../composables/useRouter.js'
import { getTemplateById, getLearningRecordByTopic, updateLearningRecordStepsData, createLearningRecord } from '../../api/learningMethodology.js'
import { marked } from 'marked'

const router = useRouter()
const sidebarOpen = ref(false)

const templateId = ref(null)
const learningTopic = ref('')
const studentName = ref('')
const recordId = ref(null) // 学习记录ID
const steps = ref([])
const currentStepIndex = ref(0)
const loading = ref(false)
const error = ref('')
const saving = ref(false) // 保存状态
const saveTimer = ref(null) // 自动保存定时器

// 任务记录展开状态和编辑模式
const taskRecordExpanded = ref({}) // { 'stepIndex-taskIndex': true/false }
const taskRecordMode = ref({}) // { 'stepIndex-taskIndex': 'edit'/'preview' }

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

const currentStep = computed(() => {
  if (steps.value.length > 0 && currentStepIndex.value >= 0 && currentStepIndex.value < steps.value.length) {
    return steps.value[currentStepIndex.value]
  }
  return null
})

onMounted(() => {
  // 从路由参数或window对象获取模板ID、学习主题和学生姓名
  const params = window.learningStepsParams || {}
  templateId.value = params.templateId
  learningTopic.value = params.learningTopic || ''
  studentName.value = params.studentName || ''
  
  if (templateId.value) {
    loadTemplateAndRecord()
  } else {
    error.value = '缺少模板ID参数'
  }
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const handleBack = () => {
  // 返回学习记录管理页面
  router.goToLearningRecordList(null)
}

// 加载模板和学习记录
const loadTemplateAndRecord = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 1. 加载模板
    const templateResponse = await getTemplateById(templateId.value)
    if (templateResponse.code !== 200 || !templateResponse.data) {
      error.value = '加载模板失败: ' + (templateResponse.msg || '未知错误')
      return
    }
    
    const template = templateResponse.data
    if (!template.stepsJson) {
      error.value = '模板数据不完整'
      return
    }
    
    // 2. 查询或创建学习记录
    let record = null
    if (studentName.value && learningTopic.value) {
      try {
        const recordResponse = await getLearningRecordByTopic({
          templateId: templateId.value,
          learningTopic: learningTopic.value,
          studentName: studentName.value
        })
        
        if (recordResponse.code === 200 && recordResponse.data && recordResponse.data.length > 0) {
          // 找到匹配的记录
          record = recordResponse.data.find(r => 
            r.templateId === templateId.value &&
            r.learningTopic === learningTopic.value &&
            r.studentName === studentName.value
          )
          if (record) {
            recordId.value = record.recordId
          }
        }
      } catch (err) {
        console.warn('查询学习记录失败:', err)
        // 继续执行，不阻止加载模板
      }
    }
    
    // 3. 解析模板步骤配置
    try {
      const stepsConfig = JSON.parse(template.stepsJson)
      
      // 验证步骤配置格式
      if (!Array.isArray(stepsConfig) || stepsConfig.length === 0) {
        error.value = '模板步骤配置格式错误'
        return
      }
      
      // 4. 加载已保存的步骤数据
      let savedStepsData = null
      if (record && record.stepsData) {
        try {
          savedStepsData = JSON.parse(record.stepsData)
        } catch (parseErr) {
          console.warn('解析已保存的步骤数据失败:', parseErr)
        }
      }
      
      // 5. 生成步骤，合并模板和已保存的数据
      steps.value = stepsConfig.map((stepConfig, index) => {
        const savedStep = savedStepsData && savedStepsData[index] ? savedStepsData[index] : null
        
        const step = {
          title: stepConfig.title ? stepConfig.title.replace(/\{topic\}/g, learningTopic.value) : `步骤 ${index + 1}`,
          description: stepConfig.description ? stepConfig.description.replace(/\{topic\}/g, learningTopic.value) : '',
          content: stepConfig.content ? stepConfig.content.replace(/\{topic\}/g, learningTopic.value) : '',
          tasks: stepConfig.tasks ? stepConfig.tasks.map((task, taskIndex) => {
            const taskText = typeof task === 'string' ? task : task.text
            const savedTask = savedStep && savedStep.tasks && savedStep.tasks[taskIndex] ? savedStep.tasks[taskIndex] : null
            
            return {
              text: taskText.replace(/\{topic\}/g, learningTopic.value),
              completed: savedTask ? savedTask.completed : false,
              record: savedTask ? (savedTask.record || '') : ''
            }
          }) : [],
          notes: savedStep ? (savedStep.notes || '') : ''
        }
        return step
      })
      
      currentStepIndex.value = 0
      
      // 6. 如果没有记录，创建新记录
      if (!recordId.value && studentName.value && learningTopic.value) {
        try {
          const createResponse = await createLearningRecord({
            templateId: templateId.value,
            studentName: studentName.value,
            learningTopic: learningTopic.value
          })
          if (createResponse.code === 200 && createResponse.data) {
            recordId.value = createResponse.data.recordId
          }
        } catch (createErr) {
          console.warn('创建学习记录失败:', createErr)
          // 继续执行，不影响使用
        }
      }
      
      // 7. 自动保存功能已通过 watch 实现，无需额外启动
    } catch (parseError) {
      error.value = '解析模板步骤失败: ' + parseError.message
      console.error('Steps JSON parse error:', parseError)
    }
  } catch (err) {
    error.value = '加载模板失败: ' + err.message
    console.error('Load template error:', err)
  } finally {
    loading.value = false
  }
}

const goToStep = (index) => {
  if (index >= 0 && index < steps.value.length) {
    currentStepIndex.value = index
  }
}

const nextStep = () => {
  if (currentStepIndex.value < steps.value.length - 1) {
    currentStepIndex.value++
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

const formatContent = (content) => {
  if (!content) return ''
  // 简单的格式化：将换行符转换为<br>
  return content.replace(/\n/g, '<br>')
}

// 获取任务记录展开状态
const getTaskRecordExpanded = (stepIndex, taskIndex) => {
  const key = `${stepIndex}-${taskIndex}`
  return taskRecordExpanded.value[key] || false
}

// 切换任务记录展开状态
const toggleTaskRecord = (stepIndex, taskIndex) => {
  const key = `${stepIndex}-${taskIndex}`
  taskRecordExpanded.value[key] = !taskRecordExpanded.value[key]
  // 如果展开且没有设置模式，默认设置为编辑模式
  if (taskRecordExpanded.value[key] && !taskRecordMode.value[key]) {
    taskRecordMode.value[key] = 'preview'
  }
}

// 获取任务记录编辑模式
const getTaskRecordMode = (stepIndex, taskIndex) => {
  const key = `${stepIndex}-${taskIndex}`
  return taskRecordMode.value[key] || 'preview'
}

// 设置任务记录编辑模式
const setTaskRecordMode = (stepIndex, taskIndex, mode) => {
  const key = `${stepIndex}-${taskIndex}`
  taskRecordMode.value[key] = mode
}

// 渲染 markdown
const renderMarkdown = (content) => {
  if (!content || !content.trim()) {
    return '<p class="empty-record">暂无记录内容</p>'
  }
  try {
    return marked.parse(content)
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return '<p class="error-record">Markdown 解析错误</p>'
  }
}

// 保存步骤数据到后端
const saveStepsData = async () => {
  if (!recordId.value) {
    // 如果没有记录ID，尝试创建记录
    if (!studentName.value || !learningTopic.value || !templateId.value) {
      return
    }
    
    try {
      const createResponse = await createLearningRecord({
        templateId: templateId.value,
        studentName: studentName.value,
        learningTopic: learningTopic.value
      })
      if (createResponse.code === 200 && createResponse.data) {
        recordId.value = createResponse.data.recordId
      } else {
        console.warn('创建学习记录失败:', createResponse.msg)
        return
      }
    } catch (err) {
      console.warn('创建学习记录失败:', err)
      return
    }
  }
  
  if (!recordId.value) {
    return
  }
  
  saving.value = true
  try {
    // 构建步骤数据
    const stepsData = steps.value.map(step => ({
      title: step.title,
      description: step.description,
      content: step.content,
      notes: step.notes || '',
      tasks: step.tasks ? step.tasks.map(task => ({
        text: task.text,
        completed: task.completed,
        record: task.record || ''
      })) : []
    }))
    
    const response = await updateLearningRecordStepsData(recordId.value, stepsData)
    if (response.code === 200) {
      // 保存成功，不显示提示（避免频繁提示）
      console.log('步骤数据保存成功')
    } else {
      console.warn('保存步骤数据失败:', response.msg)
    }
  } catch (err) {
    console.error('保存步骤数据失败:', err)
  } finally {
    saving.value = false
  }
}

// 在组件卸载时清理定时器
onUnmounted(() => {
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
  }
  // 组件卸载前保存一次
  if (recordId.value && steps.value.length > 0) {
    saveStepsData()
  }
})

// 监听步骤数据变化，自动保存
watch(() => steps.value, () => {
  if (recordId.value && steps.value.length > 0) {
    if (saveTimer.value) {
      clearTimeout(saveTimer.value)
    }
    saveTimer.value = setTimeout(() => {
      saveStepsData()
    }, 2000) // 2秒后保存
  }
}, { deep: true })
</script>

<style scoped>
.learning-steps-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  color: #f7f7f7;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
}

/* 自定义滚动条样式 */
.learning-steps-container::-webkit-scrollbar {
  width: 10px;
}

.learning-steps-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
}

.learning-steps-container::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.5);
  border-radius: 5px;
}

.learning-steps-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.7);
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
  font-size: 14px;
  line-height: 1.6;
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

.section-card {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.32);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
}

.section-title {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  margin-bottom: 20px;
}

.steps-progress {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.step-item {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 215, 0, 0.2);
  cursor: pointer;
  transition: all 0.25s;
}

.step-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.4);
  transform: translateY(-2px);
}

.step-item.active {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.step-item.completed {
  background: rgba(143, 209, 158, 0.1);
  border-color: rgba(143, 209, 158, 0.4);
}

.step-item.completed .step-number {
  background: rgba(143, 209, 158, 0.3);
  color: #8fd19e;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  border: 2px solid rgba(255, 215, 0, 0.4);
}

.step-item.active .step-number {
  background: rgba(255, 215, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.step-title {
  font-size: 14px;
  color: #c5c5c5;
  text-align: center;
  line-height: 1.4;
}

.step-item.active .step-title {
  color: #ffd700;
  font-weight: 700;
}

.step-content {
  margin-top: 20px;
}

.step-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
}

.step-content-title {
  font-size: 28px;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
}

.step-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-nav {
  padding: 10px 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-nav:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.6);
}

.btn-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.step-counter {
  color: #c5c5c5;
  font-size: 14px;
}

.step-content-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-description,
.step-main-content,
.step-tasks,
.step-notes {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid rgba(255, 215, 0, 0.3);
}

.step-description h4,
.step-main-content h4,
.step-tasks h4,
.step-notes h4 {
  color: #ffd700;
  font-size: 18px;
  margin-bottom: 12px;
}

.step-description p,
.content-text {
  color: #c5c5c5;
  font-size: 16px;
  line-height: 1.8;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  transition: all 0.25s;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.task-main {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.25s;
}

.task-main:hover {
  background: rgba(255, 215, 0, 0.05);
}

.task-label {
  color: #c5c5c5;
  font-size: 15px;
  flex: 1;
  user-select: none;
}

.task-expand-icon {
  color: rgba(255, 215, 0, 0.6);
  font-size: 12px;
  transition: transform 0.25s;
  user-select: none;
}

.task-expand-icon.expanded {
  transform: rotate(180deg);
}

.task-record-editor {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.record-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.tab-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.tab-btn.active {
  color: #ffd700;
  border-bottom-color: #ffd700;
}

.record-edit {
  width: 100%;
}

.record-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  resize: vertical;
  transition: all 0.25s;
  line-height: 1.6;
}

.record-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.record-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.2);
}

.record-preview {
  width: 100%;
  min-height: 100px;
}

.record-preview-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.8;
  word-wrap: break-word;
}

.record-preview-content :deep(h1),
.record-preview-content :deep(h2),
.record-preview-content :deep(h3),
.record-preview-content :deep(h4),
.record-preview-content :deep(h5),
.record-preview-content :deep(h6) {
  color: #ffd700;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.record-preview-content :deep(h1) {
  font-size: 1.5em;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  padding-bottom: 0.3em;
}

.record-preview-content :deep(h2) {
  font-size: 1.3em;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding-bottom: 0.3em;
}

.record-preview-content :deep(h3) {
  font-size: 1.1em;
}

.record-preview-content :deep(p) {
  margin: 0.8em 0;
}

.record-preview-content :deep(ul),
.record-preview-content :deep(ol) {
  margin: 0.8em 0;
  padding-left: 2em;
}

.record-preview-content :deep(li) {
  margin: 0.4em 0;
}

.record-preview-content :deep(blockquote) {
  border-left: 4px solid rgba(255, 215, 0, 0.5);
  margin: 1em 0;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 215, 0, 0.05);
  padding: 0.5em 1em;
}

.record-preview-content :deep(code) {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.record-preview-content :deep(pre) {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
}

.record-preview-content :deep(pre code) {
  background: none;
  padding: 0;
}

.record-preview-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.record-preview-content :deep(th),
.record-preview-content :deep(td) {
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 0.5em;
  text-align: left;
}

.record-preview-content :deep(th) {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  font-weight: bold;
}

.record-preview-content :deep(a) {
  color: #ffd700;
  text-decoration: none;
}

.record-preview-content :deep(a:hover) {
  text-decoration: underline;
}

.record-preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.empty-record,
.error-record {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  padding: 1em;
  text-align: center;
}

.error-record {
  color: #f44336;
}

.notes-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.25s;
}

.notes-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.notes-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
}

.error-state {
  color: #f44336;
}

.error-state button {
  margin-top: 20px;
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

  .steps-progress {
    flex-direction: column;
  }

  .step-item {
    min-width: 100%;
  }

  .step-content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

