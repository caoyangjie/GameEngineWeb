<template>
  <div class="learning-record-list-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
    </div>

    <!-- 顶部导航栏 -->
    <TopHeader @toggle-sidebar="toggleSidebar" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">学习记录管理</h1>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleGoHome">
            返回首页
          </button>
          <button v-if="activeTab === 'records'" class="btn-primary" @click="handleCreate">
            创建记录
          </button>
          <button v-if="activeTab === 'templates'" class="btn-primary" @click="handleTemplateCreate">
            新建模板
          </button>
        </div>
      </div>

      <!-- 标签页切换 -->
      <div class="tabs-container">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'records' }"
          @click="activeTab = 'records'"
        >
          学习记录
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'templates' }"
          @click="activeTab = 'templates'"
        >
          模板管理
        </button>
      </div>

      <!-- 学习记录列表界面 -->
      <div v-if="activeTab === 'records'">
        <!-- 搜索栏 -->
        <div class="search-section">
          <div class="filter-row">
            <div class="filter-field">
              <div class="filter-label">学生姓名</div>
              <CustomInput
                v-model="studentNameFilter"
                placeholder="请输入学生姓名"
                @keyup.enter="handleSearch"
              />
            </div>
            <div class="filter-field">
              <div class="filter-label">学习主题</div>
              <CustomInput
                v-model="learningTopicFilter"
                placeholder="请输入学习主题"
                @keyup.enter="handleSearch"
              />
            </div>
            <div class="filter-field filter-field-button">
              <div class="filter-label">&nbsp;</div>
              <button class="btn-reset" @click="handleReset">
                重置
              </button>
            </div>
            <div class="filter-field filter-field-button">
              <div class="filter-label">&nbsp;</div>
              <button class="btn-search" @click="handleSearch">
                搜索
              </button>
            </div>
          </div>
        </div>

        <!-- 列表 -->
      <div class="student-list-section">
        <div
          v-for="student in studentList"
          :key="student.studentName"
          class="student-item"
        >
          <div class="student-header">
            <div class="student-avatar">
              <div class="avatar-placeholder">{{ getAvatarInitial(student.studentName) }}</div>
            </div>
            <div class="student-info">
              <h3 class="student-name">{{ student.studentName }}</h3>
              <div class="student-basic">
                <span class="info-badge">{{ student.recordCount }} 个学习主题</span>
              </div>
            </div>
          </div>
          
          <div class="student-content">
            <div class="learning-topics-list">
              <div
                v-for="record in student.records"
                :key="record.recordId"
                class="topic-item"
                @click="handleTopicClick(record)"
              >
                <button class="topic-delete-btn" @click.stop="handleDeleteRecord(record.recordId)" title="删除">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div class="topic-header">
                  <h4 class="topic-title">{{ record.learningTopic || '未命名主题' }}</h4>
                </div>
                <div class="topic-content">
                  <div class="topic-field">
                    <span class="field-label">模板:</span>
                    <span class="field-value">{{ record.templateTitle || '未知模板' }}</span>
                  </div>
                  <div class="topic-field">
                    <span class="field-label">创建时间:</span>
                    <span class="field-value">{{ formatDate(record.createTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="student-meta">
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="meta-label">最后学习:</span>
              <span class="meta-value">{{ formatDate(student.lastLearnTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="studentList.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📚</div>
          <p>暂无学习记录</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <p>加载中...</p>
        </div>
      </div>
      </div>

      <!-- 模板管理界面 -->
      <div v-if="activeTab === 'templates'">
        <!-- 搜索栏 -->
        <div class="search-section">
          <div class="filter-row">
            <div class="filter-field">
              <div class="filter-label">模板标题</div>
              <CustomInput
                v-model="templateTitleFilter"
                placeholder="请输入模板标题"
                @keyup.enter="handleTemplateSearch"
              />
            </div>
            <div class="filter-field">
              <div class="filter-label">模板描述</div>
              <CustomInput
                v-model="templateDescriptionFilter"
                placeholder="请输入模板描述"
                @keyup.enter="handleTemplateSearch"
              />
            </div>
            <div class="filter-field">
              <div class="filter-label">状态</div>
              <CustomSelect
                v-model="templateStatusFilter"
                :options="statusOptions"
                placeholder="全部状态"
              />
            </div>
            <div class="filter-field filter-field-button">
              <div class="filter-label">&nbsp;</div>
              <button class="btn-reset" @click="handleTemplateReset">
                重置
              </button>
            </div>
            <div class="filter-field filter-field-button">
              <div class="filter-label">&nbsp;</div>
              <button class="btn-search" @click="handleTemplateSearch">
                搜索
              </button>
            </div>
          </div>
        </div>

        <!-- 模板列表 -->
        <div class="template-list-section">
          <div
            v-for="template in filteredTemplates"
            :key="template.templateId"
            class="template-item"
          >
            <div class="template-header">
              <h3 class="template-title">{{ template.title || '未命名模板' }}</h3>
              <div :class="['status-badge', template.status === '0' ? 'status-normal' : 'status-disabled']">
                <span class="badge-text">
                  {{ template.status === '0' ? '正常' : '停用' }}
                </span>
              </div>
            </div>
            
            <div class="template-content">
              <div class="template-field" v-if="template.description">
                <div class="field-label">描述:</div>
                <div class="field-content">{{ template.description }}</div>
              </div>
            </div>
            
            <div class="template-actions">
              <div class="template-action-buttons">
                <button 
                  class="btn-secondary"
                  @click.stop="handleTemplateEdit(template)"
                >
                  编辑
                </button>
                <button 
                  class="btn-danger"
                  @click.stop="handleTemplateDelete(template.templateId)"
                >
                  删除
                </button>
              </div>
              <button 
                class="btn-start" 
                @click="handleStartLearning(template)"
                :disabled="template.status !== '0'"
              >
                开始学习
              </button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredTemplates.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">📚</div>
            <p>暂无学习模板</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <p>加载中...</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      :active-route="ROUTES.LEARNING_RECORD_LIST"
      @close="handleSidebarClose"
    />

    <!-- 模板新增/编辑弹窗 -->
    <div v-if="showTemplateModal" class="modal-overlay" @click="closeTemplateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ templateModalMode === 'create' ? '新增学习模板' : '编辑学习模板' }}</h3>
          <button class="modal-close" @click="closeTemplateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label for="template-title-input" class="input-label">模板标题</label>
            <input
              id="template-title-input"
              v-model="templateForm.title"
              type="text"
              placeholder="请输入模板标题"
              class="topic-input"
              @keyup.enter="confirmTemplateSave"
            />
          </div>
          <div class="input-group">
            <label for="template-desc-input" class="input-label">模板描述</label>
            <textarea
              id="template-desc-input"
              v-model="templateForm.description"
              placeholder="请输入模板描述"
              class="textarea-input"
              rows="3"
            ></textarea>
          </div>
          <div class="input-group">
            <div class="input-label">状态</div>
            <CustomSelect
              v-model="templateForm.status"
              :options="templateStatusOptions"
              placeholder="请选择状态"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeTemplateModal">取消</button>
          <button 
            class="btn-confirm" 
            @click="confirmTemplateSave" 
            :disabled="templateSaving || !templateForm.title.trim()"
          >
            {{ templateModalMode === 'create' ? '创建' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 开始学习弹窗 -->
    <div v-if="showTopicModal" class="modal-overlay" @click="closeTopicModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">开始学习</h3>
          <button class="modal-close" @click="closeTopicModal">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label for="student-name-input" class="input-label">学生姓名</label>
            <input
              id="student-name-input"
              v-model="studentName"
              type="text"
              placeholder="请输入学生姓名"
              class="topic-input"
              @keyup.enter="confirmStartLearning"
              ref="studentNameInputRef"
            />
          </div>
          <div class="input-group">
            <label for="learning-topic-input" class="input-label">学习主题</label>
            <input
              id="learning-topic-input"
              v-model="learningTopic"
              type="text"
              placeholder="请输入您要学习的主题，例如：Python编程基础、微积分、世界历史等"
              class="topic-input"
              @keyup.enter="confirmStartLearning"
              ref="topicInputRef"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeTopicModal">取消</button>
          <button class="btn-confirm" @click="confirmStartLearning" :disabled="!studentName.trim() || !learningTopic.trim()">
            确认
          </button>
        </div>
      </div>
    </div>

    <!-- 创建记录弹窗 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">创建学习记录</h3>
          <button class="modal-close" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label for="create-template-select" class="input-label">学习模板</label>
            <CustomSelect
              id="create-template-select"
              v-model="createForm.templateId"
              :options="templateOptions"
              placeholder="请选择学习模板"
            />
          </div>
          <div class="input-group">
            <label for="create-student-name-input" class="input-label">学生姓名</label>
            <input
              id="create-student-name-input"
              v-model="createForm.studentName"
              type="text"
              placeholder="请输入学生姓名"
              class="topic-input"
              @keyup.enter="confirmCreate"
              ref="createStudentNameInputRef"
            />
          </div>
          <div class="input-group">
            <label for="create-learning-topic-input" class="input-label">学习主题</label>
            <input
              id="create-learning-topic-input"
              v-model="createForm.learningTopic"
              type="text"
              placeholder="请输入学习主题"
              class="topic-input"
              @keyup.enter="confirmCreate"
              ref="createLearningTopicInputRef"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeCreateModal">取消</button>
          <button class="btn-confirm" @click="confirmCreate" :disabled="!createForm.templateId || !createForm.studentName.trim() || !createForm.learningTopic.trim()">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomInput from '../common/CustomInput.vue'
import CustomSelect from '../common/CustomSelect.vue'
import { getLearningRecordList, deleteLearningRecord, createLearningRecord, getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../api/learningMethodology.js'
import { showAlert, showConfirm } from '../../utils/alert.js'

const router = useRouter()
const sidebarOpen = ref(false)

// 标签页切换
const activeTab = ref('records') // 'records' 或 'templates'

// 数据
const templates = ref([]) // 模板列表
const recordList = ref([]) // 学习记录列表
const loading = ref(false)
const studentNameFilter = ref('')
const learningTopicFilter = ref('')

// 模板管理相关
const templateTitleFilter = ref('')
const templateDescriptionFilter = ref('')
const templateStatusFilter = ref('')
const templateStatusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' }
]
const showTopicModal = ref(false)
const studentName = ref('')
const learningTopic = ref('')
const selectedTemplate = ref(null)
const studentNameInputRef = ref(null)
const topicInputRef = ref(null)
const showTemplateModal = ref(false)
const templateModalMode = ref('create')
const templateForm = ref({
  templateId: null,
  title: '',
  description: '',
  status: '0'
})
const templateSaving = ref(false)

// 状态选项
const statusOptions = [
  { value: '', label: '全部状态' },
  { value: '0', label: '正常' },
  { value: '1', label: '停用' }
]

// 创建记录弹窗
const showCreateModal = ref(false)
const createForm = ref({
  templateId: null,
  studentName: '',
  learningTopic: ''
})
const createStudentNameInputRef = ref(null)
const createLearningTopicInputRef = ref(null)

// 模板选项（用于下拉选择）
const templateOptions = computed(() => {
  return templates.value
    .filter(t => t.status === '0') // 只显示正常状态的模板
    .map(t => ({
      value: t.templateId,
      label: t.title || '未命名模板'
    }))
})

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  let result = templates.value

  // 标题筛选
  if (templateTitleFilter.value) {
    result = result.filter(t => 
      t.title && t.title.includes(templateTitleFilter.value)
    )
  }

  // 描述筛选
  if (templateDescriptionFilter.value) {
    result = result.filter(t => 
      t.description && t.description.includes(templateDescriptionFilter.value)
    )
  }

  // 状态筛选
  if (templateStatusFilter.value !== '') {
    result = result.filter(t => t.status === templateStatusFilter.value)
  }

  return result
})

// 按学生姓名分组的数据
const studentList = computed(() => {
  let records = recordList.value

  // 应用筛选
  if (studentNameFilter.value) {
    records = records.filter(r => 
      r.studentName && r.studentName.includes(studentNameFilter.value)
    )
  }

  if (learningTopicFilter.value) {
    records = records.filter(r => 
      r.learningTopic && r.learningTopic.includes(learningTopicFilter.value)
    )
  }

  // 按学生姓名分组
  const grouped = {}
  records.forEach(record => {
    const name = record.studentName || '未知学生'
    if (!grouped[name]) {
      grouped[name] = {
        studentName: name,
        records: [],
        recordCount: 0,
        lastLearnTime: null
      }
    }
    grouped[name].records.push(record)
    grouped[name].recordCount++
    
    // 更新最后学习时间
    if (record.createTime) {
      const recordTime = new Date(record.createTime)
      if (!grouped[name].lastLearnTime || recordTime > new Date(grouped[name].lastLearnTime)) {
        grouped[name].lastLearnTime = record.createTime
      }
    }
  })

  // 转换为数组并按最后学习时间排序
  return Object.values(grouped).sort((a, b) => {
    if (!a.lastLearnTime) return 1
    if (!b.lastLearnTime) return -1
    return new Date(b.lastLearnTime) - new Date(a.lastLearnTime)
  })
})

// 加载列表
const loadList = async () => {
  loading.value = true
  try {
    const params = {}
    // 查询所有记录
    const response = await getLearningRecordList(params)
    if (response.code === 200) {
      recordList.value = response.data || []
    } else {
      showAlert(response.msg || '加载学习记录失败', { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || '加载学习记录失败', { type: 'error' })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 使用 computed 自动过滤
}

// 重置
const handleReset = () => {
  studentNameFilter.value = ''
  learningTopicFilter.value = ''
}

// 返回首页
const handleGoHome = () => {
  router.goToHome()
}

// 模板管理搜索
const handleTemplateSearch = () => {
  // 使用 computed 自动过滤
}

// 模板管理重置
const handleTemplateReset = () => {
  templateTitleFilter.value = ''
  templateDescriptionFilter.value = ''
  templateStatusFilter.value = ''
}

// 新建模板
const handleTemplateCreate = () => {
  templateModalMode.value = 'create'
  templateForm.value = {
    templateId: null,
    title: '',
    description: '',
    status: '0'
  }
  showTemplateModal.value = true
}

// 编辑模板
const handleTemplateEdit = (template) => {
  templateModalMode.value = 'edit'
  templateForm.value = {
    templateId: template.templateId,
    title: template.title || '',
    description: template.description || '',
    status: template.status || '0'
  }
  showTemplateModal.value = true
}

// 关闭模板弹窗
const closeTemplateModal = () => {
  showTemplateModal.value = false
  templateSaving.value = false
}

// 保存模板（新增或编辑）
const confirmTemplateSave = async () => {
  if (!templateForm.value.title.trim()) {
    showAlert('请输入模板标题', 'warning')
    return
  }

  templateSaving.value = true
  const payload = {
    templateId: templateForm.value.templateId,
    title: templateForm.value.title.trim(),
    description: templateForm.value.description.trim(),
    status: templateForm.value.status
  }

  try {
    const isCreate = templateModalMode.value === 'create'
    const response = isCreate ? await createTemplate(payload) : await updateTemplate(payload)
    if (response.code === 200) {
      showAlert(isCreate ? '模板创建成功' : '模板更新成功', { type: 'success' })
      closeTemplateModal()
      loadTemplates()
    } else {
      showAlert(response.msg || (isCreate ? '创建模板失败' : '更新模板失败'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || (templateModalMode.value === 'create' ? '创建模板失败' : '更新模板失败'), { type: 'error' })
  } finally {
    templateSaving.value = false
  }
}

// 删除模板
const handleTemplateDelete = async (templateId) => {
  const confirmed = await showConfirm('确定要删除这个模板吗？', { type: 'error' })
  if (!confirmed) return

  try {
    const response = await deleteTemplate([templateId])
    if (response.code === 200) {
      showAlert('删除成功', { type: 'success' })
      loadTemplates()
    } else {
      showAlert(response.msg || '删除失败', { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || '删除失败', { type: 'error' })
  }
}

// 开始学习
const handleStartLearning = (template) => {
  if (template.status !== '0') {
    showAlert('该模板已停用，无法使用', 'warning')
    return
  }
  
  selectedTemplate.value = template
  studentName.value = ''
  learningTopic.value = ''
  showTopicModal.value = true
  
  // 聚焦输入框
  nextTick(() => {
    if (studentNameInputRef.value) {
      studentNameInputRef.value.focus()
    }
  })
}

// 关闭开始学习弹窗
const closeTopicModal = () => {
  showTopicModal.value = false
  studentName.value = ''
  learningTopic.value = ''
  selectedTemplate.value = null
}

// 确认开始学习
const confirmStartLearning = async () => {
  if (!studentName.value.trim()) {
    showAlert('请输入学生姓名', 'warning')
    return
  }
  
  if (!learningTopic.value.trim()) {
    showAlert('请输入学习主题', 'warning')
    return
  }
  
  if (!selectedTemplate.value) {
    showAlert('请选择模板', 'warning')
    return
  }
  
  try {
    // 自动创建学习记录
    const recordData = {
      templateId: selectedTemplate.value.templateId,
      studentName: studentName.value.trim(),
      learningTopic: learningTopic.value.trim()
    }
    
    const response = await createLearningRecord(recordData)
    if (response.code === 200) {
      // 跳转到步骤页面，传递模板ID、学生姓名和学习主题
      router.goToLearningSteps(
        selectedTemplate.value.templateId, 
        learningTopic.value.trim(),
        studentName.value.trim()
      )
      closeTopicModal()
    } else {
      showAlert(response.msg || '创建学习记录失败', 'error')
    }
  } catch (error) {
    showAlert(error.message || '创建学习记录失败', 'error')
  }
}

// 创建记录
const handleCreate = () => {
  // 如果模板列表为空，先加载模板
  if (templates.value.length === 0) {
    loadTemplates().then(() => {
      openCreateModal()
    })
  } else {
    openCreateModal()
  }
}

// 打开创建弹窗
const openCreateModal = () => {
  createForm.value = {
    templateId: null,
    studentName: '',
    learningTopic: ''
  }
  showCreateModal.value = true
  
  // 聚焦输入框
  nextTick(() => {
    if (createStudentNameInputRef.value) {
      createStudentNameInputRef.value.focus()
    }
  })
}

// 关闭创建弹窗
const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.value = {
    templateId: null,
    studentName: '',
    learningTopic: ''
  }
}

// 确认创建
const confirmCreate = async () => {
  if (!createForm.value.templateId) {
    showAlert('请选择学习模板', 'warning')
    return
  }
  
  if (!createForm.value.studentName.trim()) {
    showAlert('请输入学生姓名', 'warning')
    return
  }
  
  if (!createForm.value.learningTopic.trim()) {
    showAlert('请输入学习主题', 'warning')
    return
  }
  
  try {
    const recordData = {
      templateId: createForm.value.templateId,
      studentName: createForm.value.studentName.trim(),
      learningTopic: createForm.value.learningTopic.trim()
    }
    
    const response = await createLearningRecord(recordData)
    if (response.code === 200) {
      showAlert('创建成功', { type: 'success' })
      closeCreateModal()
      loadList()
    } else {
      showAlert(response.msg || '创建失败', { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || '创建失败', { type: 'error' })
  }
}

// 点击学习主题跳转到步骤页面
const handleTopicClick = (record) => {
  router.goToLearningSteps(
    record.templateId,
    record.learningTopic,
    record.studentName
  )
}

// 删除记录
const handleDeleteRecord = async (recordId) => {
  const confirmed = await showConfirm('确定要删除这条学习记录吗？', { type: 'error' })
  if (!confirmed) {
    return
  }
  try {
    const response = await deleteLearningRecord([recordId])
    if (response.code === 200) {
      showAlert('删除成功', { type: 'success' })
      loadList()
    } else {
      showAlert(response.msg || '删除失败', { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || '删除失败', { type: 'error' })
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取头像首字母
const getAvatarInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// 侧边栏切换
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Sidebar 关闭事件
const handleSidebarClose = () => {
  sidebarOpen.value = false
}

// 加载模板列表
const loadTemplates = async () => {
  loading.value = true
  try {
    const response = await getAllTemplates()
    if (response.code === 200 && response.data) {
      templates.value = response.data
    } else {
      showAlert('加载模板失败: ' + (response.msg || '未知错误'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || '加载模板失败', { type: 'error' })
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载学习记录列表
  loadList()
  // 加载模板列表（用于创建记录时的下拉选择和模板管理）
  loadTemplates()
})
</script>

<style scoped>
.learning-record-list-container {
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

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 36px;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

/* 标签页样式 */
.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
}

.tab-button {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  top: 2px;
}

.tab-button:hover {
  color: rgba(255, 215, 0, 0.8);
}

.tab-button.active {
  color: #ffd700;
  border-bottom-color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
}

/* 搜索区域 */
.search-section {
  margin-bottom: 30px;
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

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 20px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 240px;
}

.filter-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.filter-field-button {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 0 0 auto;
}

.btn-search {
  width: auto;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
}

.btn-search:hover {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.btn-reset {
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 列表区域 */
.student-list-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}

.student-item {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.student-item:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.student-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
}

.student-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 215, 0, 0.5);
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  color: #ffd700;
  font-size: 24px;
  font-weight: bold;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin: 0 0 8px 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.student-basic {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.student-content {
  flex: 1;
  margin-bottom: 15px;
}

.learning-topics-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topic-item {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.topic-item:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.4);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
}

.topic-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%);
  color: #f44336;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 2px 8px rgba(244, 67, 54, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 10;
  padding: 0;
}

.topic-delete-btn:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.25) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  box-shadow: 
    0 4px 12px rgba(244, 67, 54, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.1) rotate(90deg);
}

.topic-delete-btn:active {
  transform: scale(0.95);
}

.topic-delete-btn svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 1px 2px rgba(244, 67, 54, 0.3));
}

.topic-header {
  margin-bottom: 8px;
  padding-right: 30px;
}

.topic-title {
  font-size: 16px;
  font-weight: bold;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.topic-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topic-field {
  font-size: 13px;
  line-height: 1.5;
}

.topic-field .field-label {
  color: rgba(255, 215, 0, 0.8);
  font-weight: 600;
  margin-right: 6px;
}

.topic-field .field-value {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
}

.student-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%);
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.meta-item:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  transform: translateY(-1px);
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 215, 0, 0.9);
  flex-shrink: 0;
}

.meta-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

.empty-state,
.loading-state {
  grid-column: 1 / -1;
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

.btn-primary {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  color: #1a0a2e;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 0;
  min-width: 500px;
  max-width: 90%;
  box-shadow:
    0 0 40px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.modal-title {
  font-size: 20px;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.25s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-body {
  padding: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-label {
  font-size: 14px;
  color: #c5c5c5;
  font-weight: 500;
}

.topic-input {
  width: 100%;
  padding: 14px 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 16px;
  transition: all 0.25s;
}

.topic-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.topic-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.textarea-input {
  width: 100%;
  padding: 14px 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 16px;
  transition: all 0.25s;
  resize: vertical;
  min-height: 100px;
}

.textarea-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.textarea-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-confirm {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  border: none;
  color: #1a0a2e;
}

.btn-confirm:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模板管理样式 */
.template-list-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}

.template-item {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.template-item:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.template-header {
  margin-bottom: 15px;
  padding-right: 40px;
}

.template-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-content {
  flex: 1;
  margin-bottom: 15px;
}

.template-field {
  margin-bottom: 12px;
}

.field-label {
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 5px;
}

.field-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.template-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  flex-wrap: wrap;
}

.template-action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-start {
  padding: 10px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
  border: none;
  color: #1a0a2e;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: translateY(-2px);
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.btn-danger {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(244, 67, 54, 0.5);
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%);
  color: #f44336;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-danger:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.2) 100%);
  border-color: rgba(244, 67, 54, 0.8);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  transform: translateY(-1px);
}

.btn-danger:active {
  transform: translateY(0);
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.status-normal {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.15) 100%);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.status-disabled {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.25) 0%, rgba(244, 67, 54, 0.15) 100%);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.badge-text {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .template-list-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .template-list-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 100px 20px 20px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-field,
  .filter-field-button {
    flex: 1 1 100%;
    width: 100%;
  }
  
  .btn-search,
  .btn-reset {
    width: 100%;
  }

  .student-list-section {
    grid-template-columns: 1fr;
  }

  .student-header {
    flex-wrap: wrap;
  }

  .template-list-section {
    grid-template-columns: 1fr;
  }

  .template-header {
    padding-right: 40px;
  }
}
</style>

