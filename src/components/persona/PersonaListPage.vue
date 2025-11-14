<template>
  <div class="persona-list-container">
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
        <h1 class="page-title">{{ t('persona.list.title') }}</h1>
        <div class="header-actions">
          <button class="btn-secondary" @click="handleBack">
            {{ t('persona.list.back') }}
          </button>
          <button class="btn-primary" @click="handleCreate">
            {{ t('persona.list.create') }}
          </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="filter-row">
          <div class="filter-field">
            <div class="filter-label">{{ t('persona.scenarioList.personaName') }}</div>
            <CustomInput
              v-model="nameFilter"
              :placeholder="t('persona.scenarioList.personaNamePlaceholder')"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="filter-field">
            <div class="filter-label">{{ t('persona.detail.gender') }}</div>
            <CustomSelect
              v-model="genderFilter"
              :options="genderOptions"
              :placeholder="t('persona.list.allGender')"
            />
          </div>
          <div class="filter-field filter-field-button">
            <div class="filter-label">&nbsp;</div>
            <button class="btn-reset" @click="handleReset">
              {{ t('persona.list.reset') }}
            </button>
          </div>
        </div>
        <button class="btn-search" @click="handleSearch">
          {{ t('persona.list.search') }}
        </button>
      </div>

      <!-- 列表 -->
      <div class="persona-list-section">
        <div
          v-for="persona in personaList"
          :key="persona.personaId"
          class="persona-item"
          @click="handleView(persona.personaId)"
        >
          <button class="persona-delete-btn" @click.stop="handleDelete(persona.personaId)" :title="t('persona.list.delete')">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="persona-header">
            <div class="persona-avatar">
              <img v-if="persona.avatar" :src="persona.avatar" :alt="persona.name" />
              <div v-else class="avatar-placeholder">{{ getAvatarInitial(persona.name) }}</div>
            </div>
            <div class="persona-info">
              <h3 class="persona-name">{{ persona.name }}</h3>
              <div class="persona-basic">
                <span v-if="persona.age" class="info-badge">{{ persona.age }}{{ t('persona.list.ageUnit') }}</span>
                <span v-if="persona.gender" class="info-badge">{{ getGenderLabel(persona.gender) }}</span>
                <span v-if="persona.identity" class="info-badge">{{ persona.identity }}</span>
              </div>
            </div>
          </div>
          <div class="persona-content" v-if="persona.hobbies || persona.usageScenario">
            <div class="persona-field" v-if="persona.hobbies">
              <div class="field-label">{{ t('persona.detail.hobbies') }}:</div>
              <div class="field-content">{{ persona.hobbies }}</div>
            </div>
            <div class="persona-field" v-if="persona.usageScenario">
              <div class="field-label">{{ t('persona.detail.usageScenario') }}:</div>
              <div class="field-content">{{ persona.usageScenario }}</div>
            </div>
          </div>
          <div class="persona-meta">
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="meta-label">{{ t('persona.list.createTime') }}:</span>
              <span class="meta-value">{{ formatDate(persona.createTime) }}</span>
            </div>
            <div class="persona-actions">
              <button class="btn-action btn-scenario" @click.stop="handleScenarioAnalysis(persona.personaId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18 17l-5-5-5 5-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 11l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ t('persona.list.scenarioAnalysis') }}</span>
              </button>
              <button class="btn-action btn-create-scenario" @click.stop="handleCreateScenario(persona.personaId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ t('persona.list.createScenario') }}</span>
              </button>
              <button class="btn-action btn-toggle-scenarios" @click.stop="toggleScenarioList(persona.personaId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'rotated': expandedScenarios[persona.personaId] }">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ expandedScenarios[persona.personaId] ? t('persona.list.hideScenarios') : t('persona.list.showScenarios') }}</span>
              </button>
              <button class="btn-action btn-requirement" @click.stop="handleRequirementAnalysis(persona.personaId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18 17l-5-5-5 5-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 11l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ t('persona.list.requirementAnalysis') }}</span>
              </button>
              <button class="btn-action btn-create-requirement" @click.stop="handleCreateRequirement(persona.personaId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ t('persona.list.createRequirement') }}</span>
              </button>
              <button class="btn-action btn-toggle-requirements" @click.stop="toggleRequirementList(persona.personaId)">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{ 'rotated': expandedRequirements[persona.personaId] }">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ expandedRequirements[persona.personaId] ? t('persona.list.hideRequirements') : t('persona.list.showRequirements') }}</span>
              </button>
            </div>
          </div>
          
          <!-- 场景列表 -->
          <div v-if="expandedScenarios[persona.personaId]" class="scenario-list-wrapper">
            <div v-if="scenarioLoading[persona.personaId]" class="scenario-loading">
              {{ t('persona.list.loading') }}
            </div>
            <div v-else-if="personaScenarios[persona.personaId] && personaScenarios[persona.personaId].length > 0" class="scenario-list">
              <div
                v-for="scenario in personaScenarios[persona.personaId].slice(0, 5)"
                :key="scenario.scenarioId"
                class="scenario-item-mini"
                @click.stop="handleScenarioClick(persona.personaId, scenario.scenarioId)"
              >
                <button class="scenario-item-close-btn" @click.stop="handleDeleteScenario(persona.personaId, scenario.scenarioId)" :title="t('persona.scenarioList.delete')">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div class="scenario-item-header">
                  <h4 class="scenario-item-title">{{ scenario.title || t('persona.scenarioList.noTitle') }}</h4>
                </div>
                <div class="scenario-item-content">
                  <div class="scenario-item-field">
                    <span class="field-label">{{ t('persona.scenarioManagement.goal') }}:</span>
                    <span class="field-value">{{ scenario.goal || t('persona.scenarioList.noData') }}</span>
                  </div>
                  <div class="scenario-item-field">
                    <span class="field-label">{{ t('persona.scenarioManagement.resultExpectation') }}:</span>
                    <span class="field-value">{{ scenario.resultExpectation || t('persona.scenarioList.noData') }}</span>
                  </div>
                </div>
              </div>
              <div v-if="personaScenarios[persona.personaId].length > 5" class="scenario-more">
                <button class="btn-more" @click.stop="handleViewMoreScenarios(persona.personaId)">
                  {{ t('persona.list.viewMoreScenarios') }}
                </button>
              </div>
            </div>
            <div v-else class="scenario-empty">
              {{ t('persona.list.noScenarios') }}
            </div>
          </div>
          
          <!-- 需求列表 -->
          <div v-if="expandedRequirements[persona.personaId]" class="requirement-list-wrapper">
            <div v-if="requirementLoading[persona.personaId]" class="requirement-loading">
              {{ t('persona.list.loading') }}
            </div>
            <div v-else-if="personaRequirements[persona.personaId] && personaRequirements[persona.personaId].length > 0" class="requirement-list">
              <div
                v-for="requirement in personaRequirements[persona.personaId].slice(0, 5)"
                :key="requirement.requirementId"
                class="requirement-item-mini"
                @click.stop="handleRequirementClick(persona.personaId, requirement.requirementId)"
              >
                <button class="requirement-item-close-btn" @click.stop="handleDeleteRequirement(persona.personaId, requirement.requirementId)" :title="t('persona.list.delete')">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div class="requirement-item-header">
                  <h4 class="requirement-item-title">{{ requirement.title || t('persona.requirementManagement.noTitle') }}</h4>
                </div>
                <div class="requirement-item-content">
                  <div class="requirement-item-field" v-if="requirement.priority">
                    <span class="field-label">{{ t('persona.requirementManagement.priority') }}:</span>
                    <span class="field-value">{{ getPriorityLabel(requirement.priority) }}</span>
                  </div>
                  <div class="requirement-item-field" v-if="requirement.explicitRequirement">
                    <span class="field-label">{{ t('persona.requirementManagement.explicitRequirement') }}:</span>
                    <span class="field-value">{{ requirement.explicitRequirement }}</span>
                  </div>
                </div>
              </div>
              <div v-if="personaRequirements[persona.personaId].length > 5" class="requirement-more">
                <button class="btn-more" @click.stop="handleViewMoreRequirements(persona.personaId)">
                  {{ t('persona.list.viewMoreRequirements') }}
                </button>
              </div>
            </div>
            <div v-else class="requirement-empty">
              {{ t('persona.list.noRequirements') }}
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="personaList.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">👤</div>
          <p>{{ t('persona.list.empty') }}</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <p>{{ t('persona.list.loading') }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination">
        <button
          class="btn-page"
          :disabled="pageNum <= 1"
          @click="handlePageChange(pageNum - 1)"
        >
          {{ t('persona.list.prevPage') }}
        </button>
        <span class="page-info">
          {{ t('persona.list.pageInfo', { current: pageNum, total: totalPages }) }}
        </span>
        <button
          class="btn-page"
          :disabled="pageNum >= totalPages"
          @click="handlePageChange(pageNum + 1)"
        >
          {{ t('persona.list.nextPage') }}
        </button>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      :active-route="router.currentRoute.value"
      @close="handleSidebarClose"
    />

    <!-- 场景分析弹窗 -->
    <ScenarioAnalysisModal
      v-model="showScenarioModal"
      :persona-id="currentPersonaId"
      :initial-content="scenarioContent"
      @save="handleScenarioSave"
      @close="handleScenarioModalClose"
    />

    <!-- 场景管理弹窗 -->
    <ScenarioManagementModal
      v-model="showScenarioManagementModal"
      :persona-id="currentPersonaId"
      :canvas-id="canvasId"
      :scenario-id="currentScenarioId"
      :initial-data="scenarioData"
      @save="handleScenarioManagementSave"
      @close="handleScenarioManagementClose"
    />

    <!-- 需求分析弹窗 -->
    <RequirementAnalysisModal
      v-model="showRequirementModal"
      :persona-id="currentPersonaId"
      :initial-content="requirementContent"
      @save="handleRequirementSave"
      @close="handleRequirementModalClose"
    />

    <!-- 需求管理弹窗 -->
    <RequirementManagementModal
      v-model="showRequirementManagementModal"
      :persona-id="currentPersonaId"
      :canvas-id="canvasId"
      :requirement-id="currentRequirementId"
      :initial-data="requirementData"
      @save="handleRequirementManagementSave"
      @close="handleRequirementManagementClose"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomSelect from '../common/CustomSelect.vue'
import CustomInput from '../common/CustomInput.vue'
import ScenarioAnalysisModal from './ScenarioAnalysisModal.vue'
import ScenarioManagementModal from './ScenarioManagementModal.vue'
import RequirementAnalysisModal from './RequirementAnalysisModal.vue'
import RequirementManagementModal from './RequirementManagementModal.vue'
import { getPersonaList, getPersonaById, updatePersona, deletePersona } from '../../api/persona.js'
import { getScenarioById, createScenario, updateScenario, getScenarioList, deleteScenario } from '../../api/scenario.js'
import { getRequirementById, createRequirement, updateRequirement, getRequirementList, deleteRequirement } from '../../api/requirement.js'
import { showAlert, showConfirm } from '../../utils/alert.js'

const { t } = useI18n()
const router = useRouter()

const sidebarOpen = ref(false)

// 从window获取canvasId
const canvasId = ref(window.canvasId ? Number(window.canvasId) : null)

// 场景分析弹窗
const showScenarioModal = ref(false)
const currentPersonaId = ref(null)
const scenarioContent = ref('')

// 场景管理弹窗
const showScenarioManagementModal = ref(false)
const currentScenarioId = ref(null)
const scenarioData = ref({})

// 场景列表相关
const expandedScenarios = ref({}) // 记录哪些用户画像的场景列表已展开
const personaScenarios = ref({}) // 存储每个用户画像的场景列表
const scenarioLoading = ref({}) // 记录场景列表加载状态

// 需求列表相关
const expandedRequirements = ref({}) // 记录哪些用户画像的需求列表已展开
const personaRequirements = ref({}) // 存储每个用户画像的需求列表
const requirementLoading = ref({}) // 记录需求列表加载状态

// 需求分析弹窗
const showRequirementModal = ref(false)
const requirementContent = ref('')

// 需求管理弹窗
const showRequirementManagementModal = ref(false)
const currentRequirementId = ref(null)
const requirementData = ref({})

// 数据
const personaList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const nameFilter = ref('')
const genderFilter = ref('')

// 性别选项
const genderOptions = computed(() => [
  { value: '', label: t('persona.list.allGender') },
  { value: 'male', label: t('persona.detail.genderMale') },
  { value: 'female', label: t('persona.detail.genderFemale') },
  { value: 'other', label: t('persona.detail.genderOther') }
])

// 加载列表
const loadList = async () => {
  if (!canvasId.value) {
    showAlert(t('persona.list.canvasIdRequired'), { type: 'error' })
    return
  }
  
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      canvasId: canvasId.value,
      name: nameFilter.value || undefined,
      gender: genderFilter.value || undefined
    }
    const response = await getPersonaList(params)
    if (response.code === 200) {
      personaList.value = response.data.records || []
      total.value = response.data.total || 0
      totalPages.value = response.data.pages || 0
    } else {
      showAlert(response.msg || t('persona.list.loadFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.list.loadFailed'), { type: 'error' })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  loadList()
}

// 重置
const handleReset = () => {
  nameFilter.value = ''
  genderFilter.value = ''
  pageNum.value = 1
  loadList()
}

// 分页
const handlePageChange = (page) => {
  pageNum.value = page
  loadList()
}

// 返回
const handleBack = () => {
  router.goToBusinessModelCanvasList()
}

// 创建
const handleCreate = () => {
  router.goToPersonaDetail()
  window.personaEditMode = 'create'
  window.canvasId = canvasId.value
}

// 查看
const handleView = (personaId) => {
  router.goToPersonaDetail()
  window.personaId = personaId
  window.personaEditMode = 'view'
  window.canvasId = canvasId.value
}

// 编辑
const handleEdit = (personaId) => {
  router.goToPersonaDetail()
  window.personaId = personaId
  window.personaEditMode = 'edit'
  window.canvasId = canvasId.value
}

// 场景分析
const handleScenarioAnalysis = async (personaId) => {
  currentPersonaId.value = personaId
  
  try {
    // 从列表中查找对应的 persona，获取 usageScenario
    const persona = personaList.value.find(p => p.personaId === personaId)
    if (persona && persona.usageScenario) {
      scenarioContent.value = persona.usageScenario
    } else {
      // 如果列表中没有，则从服务器加载完整数据
      const response = await getPersonaById(personaId)
      if (response.code === 200 && response.data) {
        scenarioContent.value = response.data.usageScenario || ''
      } else {
        scenarioContent.value = ''
      }
    }
    showScenarioModal.value = true
  } catch (error) {
    console.error('加载场景分析内容失败:', error)
    scenarioContent.value = ''
    showScenarioModal.value = true
  }
}

// 保存场景分析
const handleScenarioSave = async (data) => {
  try {
    // 先从列表或服务器获取完整的 persona 数据
    let persona = personaList.value.find(p => p.personaId === data.personaId)
    
    // 如果列表中没有完整数据，则从服务器加载
    if (!persona || !persona.name) {
      const getResponse = await getPersonaById(data.personaId)
      if (getResponse.code === 200 && getResponse.data) {
        persona = getResponse.data
      } else {
        showAlert(t('persona.scenarioAnalysis.saveFailed') + ': ' + (getResponse.msg || '获取用户画像数据失败'), { type: 'error' })
        return
      }
    }
    
    // 构建更新数据，保留所有原有字段，只更新 usageScenario
    const updateData = {
      personaId: persona.personaId,
      canvasId: persona.canvasId,
      name: persona.name,
      age: persona.age,
      gender: persona.gender,
      identity: persona.identity,
      hobbies: persona.hobbies,
      usageScenario: data.content, // 更新场景分析内容
      avatar: persona.avatar
    }
    
    // 调用API更新用户画像
    const response = await updatePersona(updateData)
    
    if (response.code === 200) {
      showAlert(t('persona.scenarioAnalysis.saveSuccess'), { type: 'success' })
      // 更新列表中的对应数据
      const listPersona = personaList.value.find(p => p.personaId === data.personaId)
      if (listPersona) {
        listPersona.usageScenario = data.content
      }
    } else {
      showAlert(response.msg || t('persona.scenarioAnalysis.saveFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.scenarioAnalysis.saveFailed'), { type: 'error' })
  }
}

// 场景分析弹窗关闭
const handleScenarioModalClose = () => {
  // 清空场景内容，避免下次打开时显示旧数据
  scenarioContent.value = ''
  currentPersonaId.value = null
}

// 创建场景
const handleCreateScenario = (personaId) => {
  currentPersonaId.value = personaId
  currentScenarioId.value = null
  scenarioData.value = {}
  showScenarioManagementModal.value = true
}

// 保存场景管理
const handleScenarioManagementSave = async (data) => {
  try {
    let response
    if (data.scenarioId) {
      // 更新场景
      response = await updateScenario(data)
    } else {
      // 创建场景
      response = await createScenario(data)
    }
    
    if (response.code === 200) {
      showAlert(t('persona.scenarioManagement.saveSuccess'), { type: 'success' })
      // 刷新对应用户画像的场景列表
      if (data.personaId && expandedScenarios.value[data.personaId]) {
        await loadScenariosForPersona(data.personaId)
      }
    } else {
      showAlert(response.msg || t('persona.scenarioManagement.saveFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.scenarioManagement.saveFailed'), { type: 'error' })
  }
}

// 场景管理弹窗关闭
const handleScenarioManagementClose = () => {
  scenarioData.value = {}
  currentPersonaId.value = null
  currentScenarioId.value = null
}

// 切换场景列表显示
const toggleScenarioList = async (personaId) => {
  const isExpanded = expandedScenarios.value[personaId]
  expandedScenarios.value[personaId] = !isExpanded
  
  // 如果展开且还没有加载过场景列表，则加载
  if (!isExpanded && !personaScenarios.value[personaId]) {
    await loadScenariosForPersona(personaId)
  }
}

// 加载指定用户画像的场景列表
const loadScenariosForPersona = async (personaId) => {
  if (!canvasId.value) {
    return
  }
  
  scenarioLoading.value[personaId] = true
  try {
    const params = {
      pageNum: 1,
      pageSize: 10, // 加载更多，但只显示前5条
      personaId: personaId,
      canvasId: canvasId.value
    }
    const response = await getScenarioList(params)
    if (response.code === 200) {
      personaScenarios.value[personaId] = response.data.records || []
    } else {
      personaScenarios.value[personaId] = []
    }
  } catch (error) {
    console.error('加载场景列表失败:', error)
    personaScenarios.value[personaId] = []
  } finally {
    scenarioLoading.value[personaId] = false
  }
}

// 查看更多场景
const handleViewMoreScenarios = (personaId) => {
  router.goToScenarioList()
  window.personaId = personaId
  window.canvasId = canvasId.value
}

// 点击场景项跳转
const handleScenarioClick = (personaId, scenarioId) => {
  router.goToScenarioList()
  window.personaId = personaId
  window.canvasId = canvasId.value
  // 可选：如果需要定位到特定场景，可以传递 scenarioId
  // window.scenarioId = scenarioId
}

// 删除场景
const handleDeleteScenario = async (personaId, scenarioId) => {
  const confirmed = await showConfirm(t('persona.scenarioList.confirmDelete'), { type: 'error' })
  if (!confirmed) {
    return
  }
  try {
    const response = await deleteScenario([scenarioId])
    if (response.code === 200) {
      showAlert(t('persona.scenarioList.deleteSuccess'), { type: 'success' })
      // 刷新场景列表
      await loadScenariosForPersona(personaId)
    } else {
      showAlert(response.msg || t('persona.scenarioList.deleteFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.scenarioList.deleteFailed'), { type: 'error' })
  }
}

// 删除
const handleDelete = async (personaId) => {
  const confirmed = await showConfirm(t('persona.list.confirmDelete'), { type: 'error' })
  if (!confirmed) {
    return
  }
  try {
    const response = await deletePersona([personaId])
    if (response.code === 200) {
      showAlert(t('persona.list.deleteSuccess'), { type: 'success' })
      loadList()
    } else {
      showAlert(response.msg || t('persona.list.deleteFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.list.deleteFailed'), { type: 'error' })
  }
}

// 需求分析
const handleRequirementAnalysis = async (personaId) => {
  currentPersonaId.value = personaId
  
  try {
    // 从列表中查找对应的 persona，获取需求分析内容
    const persona = personaList.value.find(p => p.personaId === personaId)
    if (persona && persona.requirementAnalysis) {
      requirementContent.value = persona.requirementAnalysis
    } else {
      // 如果列表中没有，则从服务器加载完整数据
      const response = await getPersonaById(personaId)
      if (response.code === 200 && response.data) {
        requirementContent.value = response.data.requirementAnalysis || ''
      } else {
        requirementContent.value = ''
      }
    }
    // 确保内容设置后再打开弹窗
    await nextTick()
    showRequirementModal.value = true
  } catch (error) {
    console.error('加载需求分析内容失败:', error)
    requirementContent.value = ''
    await nextTick()
    showRequirementModal.value = true
  }
}

// 保存需求分析
const handleRequirementSave = async (data) => {
  try {
    // 先从列表或服务器获取完整的 persona 数据
    let persona = personaList.value.find(p => p.personaId === data.personaId)
    
    // 如果列表中没有完整数据，则从服务器加载
    if (!persona || !persona.name) {
      const getResponse = await getPersonaById(data.personaId)
      if (getResponse.code === 200 && getResponse.data) {
        persona = getResponse.data
      } else {
        showAlert(t('persona.requirementAnalysis.saveFailed') + ': ' + (getResponse.msg || '获取用户画像数据失败'), { type: 'error' })
        return
      }
    }
    
    // 构建更新数据，保留所有原有字段，只更新 requirementAnalysis
    const updateData = {
      personaId: persona.personaId,
      canvasId: persona.canvasId,
      name: persona.name,
      age: persona.age,
      gender: persona.gender,
      identity: persona.identity,
      hobbies: persona.hobbies,
      usageScenario: persona.usageScenario,
      requirementAnalysis: data.content, // 更新需求分析内容
      avatar: persona.avatar
    }
    
    // 调用API更新用户画像
    const response = await updatePersona(updateData)
    
    if (response.code === 200) {
      showAlert(t('persona.requirementAnalysis.saveSuccess'), { type: 'success' })
      // 更新列表中的对应数据
      const listPersona = personaList.value.find(p => p.personaId === data.personaId)
      if (listPersona) {
        listPersona.requirementAnalysis = data.content
      }
    } else {
      showAlert(response.msg || t('persona.requirementAnalysis.saveFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.requirementAnalysis.saveFailed'), { type: 'error' })
  }
}

// 需求分析弹窗关闭
const handleRequirementModalClose = () => {
  requirementContent.value = ''
  currentPersonaId.value = null
}

// 创建需求
const handleCreateRequirement = (personaId) => {
  currentPersonaId.value = personaId
  currentRequirementId.value = null
  requirementData.value = {}
  showRequirementManagementModal.value = true
}

// 保存需求管理
const handleRequirementManagementSave = async (data) => {
  try {
    let response
    if (data.requirementId) {
      // 更新需求
      response = await updateRequirement(data)
    } else {
      // 创建需求
      response = await createRequirement(data)
    }
    
    if (response.code === 200) {
      showAlert(t('persona.requirementManagement.saveSuccess'), { type: 'success' })
      // 刷新对应用户画像的需求列表
      if (data.personaId && expandedRequirements.value[data.personaId]) {
        await loadRequirementsForPersona(data.personaId)
      }
    } else {
      showAlert(response.msg || t('persona.requirementManagement.saveFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.requirementManagement.saveFailed'), { type: 'error' })
  }
}

// 需求管理弹窗关闭
const handleRequirementManagementClose = () => {
  requirementData.value = {}
  currentPersonaId.value = null
  currentRequirementId.value = null
}

// 切换需求列表显示
const toggleRequirementList = async (personaId) => {
  const isExpanded = expandedRequirements.value[personaId]
  expandedRequirements.value[personaId] = !isExpanded
  
  // 如果展开且还没有加载过需求列表，则加载
  if (!isExpanded && !personaRequirements.value[personaId]) {
    await loadRequirementsForPersona(personaId)
  }
}

// 加载指定用户画像的需求列表
const loadRequirementsForPersona = async (personaId) => {
  if (!canvasId.value) {
    return
  }
  
  requirementLoading.value[personaId] = true
  try {
    const params = {
      pageNum: 1,
      pageSize: 10, // 加载更多，但只显示前5条
      personaId: personaId,
      canvasId: canvasId.value
    }
    const response = await getRequirementList(params)
    if (response.code === 200) {
      personaRequirements.value[personaId] = response.data.records || []
    } else {
      personaRequirements.value[personaId] = []
    }
  } catch (error) {
    console.error('加载需求列表失败:', error)
    personaRequirements.value[personaId] = []
  } finally {
    requirementLoading.value[personaId] = false
  }
}

// 点击需求项
const handleRequirementClick = (personaId, requirementId) => {
  // 可以打开需求详情或编辑
  currentPersonaId.value = personaId
  currentRequirementId.value = requirementId
  // 加载需求详情
  getRequirementById(requirementId).then(response => {
    if (response.code === 200 && response.data) {
      requirementData.value = response.data
      showRequirementManagementModal.value = true
    }
  })
}

// 删除需求
const handleDeleteRequirement = async (personaId, requirementId) => {
  const confirmed = await showConfirm(t('persona.list.confirmDelete'), { type: 'error' })
  if (!confirmed) {
    return
  }
  try {
    const response = await deleteRequirement([requirementId])
    if (response.code === 200) {
      showAlert(t('persona.list.deleteSuccess'), { type: 'success' })
      // 刷新需求列表
      await loadRequirementsForPersona(personaId)
    } else {
      showAlert(response.msg || t('persona.list.deleteFailed'), { type: 'error' })
    }
  } catch (error) {
    showAlert(error.message || t('persona.list.deleteFailed'), { type: 'error' })
  }
}

// 查看更多需求
const handleViewMoreRequirements = (personaId) => {
  // TODO: 跳转到需求列表页面
  showAlert(t('persona.list.requirementFeatureComingSoon'), { type: 'info' })
}

// 获取优先级标签
const getPriorityLabel = (priority) => {
  const map = {
    'Must': t('persona.requirementManagement.priorityMust'),
    'Should': t('persona.requirementManagement.priorityShould'),
    'Could': t('persona.requirementManagement.priorityCould'),
    'Wont': t('persona.requirementManagement.priorityWont')
  }
  return map[priority] || priority
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

// 获取性别标签
const getGenderLabel = (gender) => {
  const map = {
    'male': t('persona.detail.genderMale'),
    'female': t('persona.detail.genderFemale'),
    'other': t('persona.detail.genderOther')
  }
  return map[gender] || gender
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

// 初始化
onMounted(() => {
  if (!canvasId.value) {
    showAlert(t('persona.list.canvasIdRequired'), { type: 'error' })
    router.goToBusinessModelCanvasList()
    return
  }
  loadList()
})
</script>

<style scoped>
.persona-list-container {
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
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.filter-field-button {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-search {
  width: 100%;
  padding: 12px 30px;
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
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 列表区域 */
.persona-list-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;
}

.persona-item {
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
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.2),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  backdrop-filter: blur(10px);
}

.persona-delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
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

.persona-delete-btn:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.25) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  box-shadow: 
    0 4px 12px rgba(244, 67, 54, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.1) rotate(90deg);
}

.persona-delete-btn:active {
  transform: scale(0.95);
}

.persona-delete-btn svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(244, 67, 54, 0.3));
}

.persona-item:hover {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 
    0 0 40px rgba(255, 215, 0, 0.4),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  transform: translateY(-2px);
}

.persona-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
  justify-content: space-between;
}

.persona-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.persona-header .btn-scenario,
.persona-header .btn-create-scenario {
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-create-scenario {
  color: #2196f3;
  border-color: rgba(33, 150, 243, 0.5);
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
}

.btn-create-scenario:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.1) 100%);
  border-color: rgba(33, 150, 243, 0.7);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-create-scenario .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(33, 150, 243, 0.3));
}

.persona-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 215, 0, 0.5);
  flex-shrink: 0;
}

.persona-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.persona-info {
  flex: 1;
}

.persona-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin: 0 0 8px 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.persona-basic {
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

.persona-content {
  flex: 1;
  margin-bottom: 0;
}

.persona-field {
  margin-bottom: 10px;
}

.field-label {
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 5px;
}

.field-content {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.persona-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: auto;
  padding-top: 15px;
  min-height: 50px;
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

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.btn-action:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
}

.btn-action:active {
  transform: translateY(0);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.btn-scenario {
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
}

.btn-scenario:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%);
  border-color: rgba(76, 175, 80, 0.7);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-scenario .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(76, 175, 80, 0.3));
}

.btn-toggle-scenarios {
  color: #9c27b0;
  border-color: rgba(156, 39, 176, 0.5);
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%);
}

.btn-toggle-scenarios:hover {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-color: rgba(156, 39, 176, 0.7);
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
}

.btn-toggle-scenarios .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(156, 39, 176, 0.3));
  transition: transform 0.3s ease;
}

.btn-toggle-scenarios .btn-icon.rotated {
  transform: rotate(180deg);
}

.btn-requirement {
  color: #ff9800;
  border-color: rgba(255, 152, 0, 0.5);
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);
}

.btn-requirement:hover {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%);
  border-color: rgba(255, 152, 0, 0.7);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.btn-requirement .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(255, 152, 0, 0.3));
}

.btn-create-requirement {
  color: #00bcd4;
  border-color: rgba(0, 188, 212, 0.5);
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(0, 188, 212, 0.05) 100%);
}

.btn-create-requirement:hover {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.2) 0%, rgba(0, 188, 212, 0.1) 100%);
  border-color: rgba(0, 188, 212, 0.7);
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}

.btn-create-requirement .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 188, 212, 0.3));
}

.btn-toggle-requirements {
  color: #e91e63;
  border-color: rgba(233, 30, 99, 0.5);
  background: linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(233, 30, 99, 0.05) 100%);
}

.btn-toggle-requirements:hover {
  background: linear-gradient(135deg, rgba(233, 30, 99, 0.2) 0%, rgba(233, 30, 99, 0.1) 100%);
  border-color: rgba(233, 30, 99, 0.7);
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
}

.btn-toggle-requirements .btn-icon {
  filter: drop-shadow(0 1px 2px rgba(233, 30, 99, 0.3));
  transition: transform 0.3s ease;
}

.btn-toggle-requirements .btn-icon.rotated {
  transform: rotate(180deg);
}

/* 场景列表区域 */
.scenario-list-wrapper {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

/* 需求列表区域 */
.requirement-list-wrapper {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 152, 0, 0.2);
}

.requirement-loading,
.requirement-empty {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.requirement-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.requirement-item-mini {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 152, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.requirement-item-mini:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 152, 0, 0.4);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
}

.requirement-item-close-btn {
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

.requirement-item-close-btn:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.25) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  box-shadow: 
    0 4px 12px rgba(244, 67, 54, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.1) rotate(90deg);
}

.requirement-item-close-btn:active {
  transform: scale(0.95);
}

.requirement-item-close-btn svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 1px 2px rgba(244, 67, 54, 0.3));
}

.requirement-item-header {
  margin-bottom: 8px;
  padding-right: 30px;
}

.requirement-item-title {
  font-size: 16px;
  font-weight: bold;
  color: #ff9800;
  margin: 0;
  text-shadow: 0 0 8px rgba(255, 152, 0, 0.5);
}

.requirement-item-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.requirement-item-field {
  font-size: 13px;
  line-height: 1.5;
}

.requirement-item-field .field-label {
  color: rgba(255, 152, 0, 0.8);
  font-weight: 600;
  margin-right: 6px;
}

.requirement-item-field .field-value {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.requirement-more {
  margin-top: 8px;
  text-align: center;
}

.scenario-loading,
.scenario-empty {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.scenario-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.scenario-item-mini {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.scenario-item-mini:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.4);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
}

.scenario-item-close-btn {
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

.scenario-item-close-btn:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.35) 0%, rgba(244, 67, 54, 0.25) 100%);
  border-color: rgba(244, 67, 54, 0.7);
  box-shadow: 
    0 4px 12px rgba(244, 67, 54, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.1) rotate(90deg);
}

.scenario-item-close-btn:active {
  transform: scale(0.95);
}

.scenario-item-close-btn svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 1px 2px rgba(244, 67, 54, 0.3));
}

.scenario-item-header {
  margin-bottom: 8px;
  padding-right: 30px;
}

.scenario-item-title {
  font-size: 16px;
  font-weight: bold;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.scenario-item-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scenario-item-field {
  font-size: 13px;
  line-height: 1.5;
}

.scenario-item-field .field-label {
  color: rgba(255, 215, 0, 0.8);
  font-weight: 600;
  margin-right: 6px;
}

.scenario-item-field .field-value {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scenario-more {
  margin-top: 8px;
  text-align: center;
}

.btn-more {
  padding: 8px 20px;
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 6px;
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-more:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  transform: translateY(-1px);
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

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.btn-page {
  padding: 10px 20px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 响应式设计 */
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
    grid-template-columns: 1fr;
  }
  
  .filter-field-button {
    grid-column: 1;
  }
  
  .btn-search {
    width: 100%;
  }
  
  .btn-reset {
    width: 100%;
  }

  .persona-list-section {
    grid-template-columns: 1fr;
  }

  .persona-header {
    flex-wrap: wrap;
  }

  .persona-actions {
    width: 100%;
    margin-top: 10px;
  }

  .persona-header .btn-scenario,
  .persona-header .btn-create-scenario {
    width: 100%;
  }

  .persona-meta {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .persona-meta .meta-item {
    justify-content: center;
  }

  .persona-meta .btn-action {
    width: 100%;
    justify-content: center;
  }

  .scenario-list {
    grid-template-columns: 1fr;
  }

  .requirement-list {
    grid-template-columns: 1fr;
  }

  .scenario-item-header {
    padding-right: 30px;
  }

  .persona-delete-btn {
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
  }

  .persona-delete-btn svg {
    width: 14px;
    height: 14px;
  }
}
</style>

