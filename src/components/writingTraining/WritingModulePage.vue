<template>
  <div class="writing-module-container">
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
          <div class="badge">作文提升训练 · {{ moduleData.tag }}</div>
          <h1 class="page-title">{{ moduleData.title }}</h1>
          <p class="subtitle">{{ moduleData.subtitle }}</p>
        </div>
        <div class="header-actions">
          <button
            class="btn-secondary"
            :disabled="loadingQuestionManagement"
            @click="showQuestionManagementDialog = true"
          >
            题目管理
          </button>
          <button class="btn-secondary" @click="handleBack">返回训练中心</button>
        </div>
      </header>

      <section class="content-section">
        <div class="content-row">
          <div class="panel">
            <div class="panel-title">
              <span>训练要点</span>
              <span class="pill">3-5 分钟速览</span>
            </div>
            <ul class="list">
              <li v-for="point in moduleData.focusPoints" :key="point">{{ point }}</li>
            </ul>
          </div>

          <div class="panel">
            <div class="panel-title">
              <span>练习建议</span>
              <span class="pill">打卡 10-15 分钟</span>
            </div>
            <ul class="list">
              <li v-for="tip in moduleData.tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 左侧悬浮：步骤 / 结构公式 + 表达模板 -->
      <aside class="floating-sidebar">
        <div class="panel">
          <div class="panel-title">
            <span>步骤 / 结构公式</span>
            <span class="pill accent">按序练习</span>
          </div>
          <ol class="ordered-list">
            <li v-for="step in moduleData.steps" :key="step">{{ step }}</li>
          </ol>
        </div>

        <div class="panel">
          <div class="panel-title">
            <span>表达模板</span>
            <span class="pill">可直接套用</span>
          </div>
          <div class="template-list">
            <div v-for="tpl in moduleData.templates" :key="tpl.label" class="template-card">
              <div class="template-label">{{ tpl.label }}</div>
              <p class="template-text">{{ tpl.text }}</p>
            </div>
          </div>
        </div>
      </aside>

      <section class="training-manager">
        <!-- 出题 + 作答整合区域 -->
        <div class="panel wide-panel">
          <div class="panel-title">
            <span>AI 出题 & 作答</span>
            <span class="pill accent">左侧选题 · 右侧作答与记录</span>
          </div>

          <div class="controls-row">
            <div class="control-item">
              <div class="control-label">写作技巧</div>
              <div class="control-value">{{ moduleData.title }}</div>
            </div>
            <div class="control-item">
              <label class="control-label" for="difficulty-select">难度</label>
              <select id="difficulty-select" v-model="selectedDifficulty" class="control-select">
                <option v-for="item in difficultyOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
            <div class="control-item">
              <label class="control-label" for="question-count">出题数量</label>
              <input
                id="question-count"
                v-model.number="questionCount"
                type="number"
                min="1"
                max="10"
                class="control-input"
              />
            </div>
            <div class="controls-actions">
              <button class="btn-primary" :disabled="generating" @click="generateQuestions">
                {{ generating ? '生成中...' : '生成题目' }}
              </button>
              <button
                class="btn-secondary"
                :disabled="loadingRandom || generating"
                @click="loadRandomQuestions"
              >
                {{ loadingRandom ? '随机加载中...' : `随机 ${questionCount} 条训练题` }}
              </button>
            </div>
          </div>

          <div class="question-training-layout">
            <!-- 左侧：训练题目列表 -->
            <div class="questions-column full-height">
              <h3 class="column-title">训练题目</h3>
              <div class="question-list-container">
                <div v-if="generatedQuestions.length" class="question-list card-list">
                  <div
                    class="question-item selectable question-card"
                    v-for="(q, idx) in generatedQuestions"
                    :key="q.id || idx"
                    :class="{ selected: selectedQuestionId === (q.id || idx) }"
                    @click="handleQuestionClick(q, idx)"
                  >
                    <div class="question-index">
                      <input
                        type="radio"
                        name="generated-question"
                        :value="q.id || idx"
                        v-model="selectedQuestionId"
                        @click.stop
                      />
                      <span>Q{{ idx + 1 }}</span>
                    </div>
                    <div class="question-text">{{ q.content || q }}</div>
                  </div>
                </div>
                <div v-else class="question-empty">
                  点击"生成题目"或"随机 {{ questionCount }} 条训练题"获取练习题。
                </div>
              </div>
            </div>

            <!-- 右侧：已选题 + 当前题目记录 + 作答 -->
            <div class="editor-column full-height">
              <div class="selected-question-wrapper">
                <h3 class="column-title">已选题目</h3>
                <div v-if="selectedQuestion" class="selected-question-card">
                  <div class="question-text">{{ selectedQuestion.content || selectedQuestion }}</div>
                </div>
                <div v-else class="question-empty">请先在左侧选择一道题目</div>
              </div>

              <div class="editor-section">
                <div class="editor-header">
                  <div>
                    <div class="badge">Markdown 输入</div>
                    <h3 class="editor-title">写作内容</h3>
                  </div>
                </div>
                <textarea
                  v-model="writingContent"
                  class="markdown-editor full-width"
                  placeholder="使用 Markdown 作答，例如：# 标题、*斜体*、**加粗**、- 列表..."
                  rows="12"
                ></textarea>
                <div class="actions">
                  <button class="btn-primary" @click="handleSubmitAnswer">提交作答</button>
                  <button class="btn-primary" @click="handleViewExamples">查看示例</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Sidebar
      :is-open="sidebarOpen"
      :active-route="activeRoute"
      @close="handleSidebarClose"
    />

    <!-- 题目详情弹窗：示例答案 + 用户作答 -->
    <!-- 使用更高层级的弹窗，使其在“写作训练管理列表”之上显示 -->
    <div
      v-if="questionDetailVisible"
      class="modal-overlay modal-overlay-detail"
      @click="questionDetailVisible = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>题目详情</h2>
          <button class="modal-close" @click="questionDetailVisible = false">×</button>
        </div>
        <div class="modal-body">
          <div class="management-filter-item" style="margin-bottom: 12px">
            <span class="management-filter-label">题目：</span>
            <span class="management-filter-value">
              {{ (selectedQuestion && (selectedQuestion.content || selectedQuestion.questionContent || selectedQuestion)) || '未选择题目' }}
            </span>
          </div>

          <div v-if="questionDetailLoading" class="question-empty">
            正在加载该题目的示例与训练记录...
          </div>

          <template v-else>
            <!-- 示例答案 -->
            <div class="panel" style="margin-bottom: 16px">
              <div class="panel-title">
                <span>示例答案（AI 提供）</span>
              </div>
              <div v-if="questionDetailExamples.length === 0" class="question-empty">
                暂无示例答案。
              </div>
              <div v-else class="question-record-list">
                <div
                  v-for="record in questionDetailExamples"
                  :key="record.id"
                  class="question-record-item"
                >
                  <div class="record-meta-small">
                    <div class="record-time-small">
                      {{ formatDate(record.createTime || record.createdAt) }}
                    </div>
                  </div>
                  <div class="record-body-small">
                    <div
                      class="record-content"
                      v-html="marked.parse(record.content || record.answerContent)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户作答记录 -->
            <div class="panel">
              <div class="panel-title">
                <span>用户训练记录</span>
              </div>
              <div v-if="questionDetailUserRecords.length === 0" class="question-empty">
                暂无用户作答记录。
              </div>
              <div v-else class="question-record-list">
                <div
                  v-for="record in questionDetailUserRecords"
                  :key="record.id"
                  class="question-record-item"
                >
                  <div class="record-meta-small">
                    <div class="record-time-small">
                      {{ formatDate(record.createTime || record.createdAt) }}
                    </div>
                  </div>
                  <div class="record-body-small">
                    <div
                      class="record-content"
                      v-html="marked.parse(record.content || record.answerContent)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 题目管理弹框 -->
    <div v-if="showQuestionManagementDialog" class="modal-overlay" @click="showQuestionManagementDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>写作训练管理列表</h2>
          <button class="modal-close" @click="showQuestionManagementDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div class="management-filters">
            <div class="management-filter-item">
              <span class="management-filter-label">当前模块：</span>
              <span class="management-filter-value">{{ moduleData.title }}</span>
            </div>
            <div class="management-filter-item">
              <label class="management-filter-label" for="management-difficulty-select">难度：</label>
              <select
                id="management-difficulty-select"
                v-model="selectedDifficulty"
                class="management-filter-select"
                @change="loadQuestionManagement(1)"
              >
                <option v-for="item in difficultyOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>
          <div v-if="questionManagementList.length" class="management-list">
            <div
              class="management-item"
              v-for="item in questionManagementList"
              :key="item.id"
              @click="handleManagementItemClick(item)"
            >
              <div class="management-content">
                {{ item.content || item.questionContent || '未找到题目内容' }}
              </div>
              <div class="management-meta">
                <span class="management-tag">
                  {{ item.moduleTitle || moduleData.title }}
                </span>
                <span class="management-tag">
                  {{ item.difficultyLabel || difficultyLabel }}
                </span>
                <span class="management-time">
                  {{ formatDate(item.createTime || item.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="pagination">
            <button
              class="btn-secondary"
              :disabled="questionManagementPageNum <= 1"
              @click="handlePageChange(questionManagementPageNum - 1)"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ questionManagementPageNum }} / {{ questionManagementTotalPages }} 页
              （共 {{ questionManagementTotal }} 条）
            </span>
            <button
              class="btn-secondary"
              :disabled="questionManagementPageNum >= questionManagementTotalPages"
              @click="handlePageChange(questionManagementPageNum + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import { ROUTES, useRouter } from '../../composables/useRouter.js'
import { marked } from 'marked'
import {
  generateWritingQuestions,
  getWritingQuestions,
  getRandomWritingQuestions,
  saveWritingRecord,
  getWritingRecords,
  getWritingRecordsByQuestion
} from '../../api/writingTraining.js'

const props = defineProps({
  moduleRoute: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const sidebarOpen = ref(false)
const generating = ref(false)
const generatedQuestions = ref([]) // {id?, content} from backend after save
const questionCount = ref(8)
const writingContent = ref('')
const trainingRecords = ref([])
const expandedRecordIds = ref([])
const selectedQuestionId = ref(null)
const selectedQuestion = ref(null)
const selectedQuestionRecords = ref([])
const loadingRandom = ref(false)
const questionManagementList = ref([])
const loadingQuestionManagement = ref(false)
const showQuestionManagementDialog = ref(false)
const questionManagementPageNum = ref(1)
const questionManagementPageSize = ref(10)
const questionManagementTotal = ref(0)

// 题目详情弹窗（示例 + 用户作答）
const questionDetailVisible = ref(false)
const questionDetailLoading = ref(false)
const questionDetailExamples = ref([])
const questionDetailUserRecords = ref([])

const difficultyOptions = [
  { value: 'primary_low', label: '小学1-3年级' },
  { value: 'primary_high', label: '小学4-6年级' },
  { value: 'middle', label: '初中1-3年级' },
  { value: 'high', label: '高中1-3年级' }
]
const selectedDifficulty = ref(difficultyOptions[0].value)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const modules = {
  [ROUTES.WRITING_WORD_EXPANSION]: {
    title: '扩词法',
    tag: '词汇强化',
    subtitle: '通过词根联想、同反义与场景替换让表达更丰富。',
    focusPoints: [
      '先写出关键词，再扩展 3-5 个同义/近义/反义词',
      '给词语添加形容词、动词或比喻，形成“词串”',
      '将词串放入不同场景句子，检查语境匹配度'
    ],
    steps: [
      '列出主题关键词（如“开心”），写出 3 组同义词。',
      '为每个词补充形容词+动作，如“雀跃地笑”',
      '做 3 句替换练习：同一句子替换不同表达，保持语义不变'
    ],
    templates: [
      { label: '词串模版', text: '加量词,加地点,加形容词,加拟声词,加动词,加场景,加比喻,加拟人,加排比,加对偶,加夸张,加拟声,加设问,加反问' },
      { label: '替换句', text: '原句：我很开心。→ 我兴奋得眼睛发亮，恨不得马上跑出去。' }
    ],
    tips: [
      '坚持每天 5 组同义替换，逐步建立个人词库',
      '写完后大声读一遍，检查是否顺口自然'
    ]
  },
  [ROUTES.WRITING_OVERVIEW_STRUCTURE]: {
    title: '总分总结构',
    tag: '结构搭建',
    subtitle: '用“提出-展开-回扣”三段式让文章有始有终。',
    focusPoints: [
      '开头点题：一句话讲清主旨或观点',
      '中间分论点：2-3 段按时间/空间/逻辑展开',
      '结尾回扣：再次强调收获、意义或呼应开头'
    ],
    steps: [
      '写一句主旨句（总）。',
      '拆 2-3 个支撑理由，每段举一个例子（分）。',
      '用 1-2 句收束，再次点题并展望（总）。'
    ],
    templates: [
      { label: '总分总骨架', text: '总：我认为/我发现...；分：第一、第二、第三...；总：因此/所以/我明白了...' },
      { label: '结尾回环', text: '首尾同词/同景/同问，形成呼应：开头的星空，结尾再次仰望。' }
    ],
    tips: [
      '中段每段只讲一个小点，避免堆砌',
      '结尾不要简单重复，可加入“收获/感受/希望”'
    ]
  },
  [ROUTES.WRITING_CHARACTER]: {
    title: '写人',
    tag: '人物刻画',
    subtitle: '外貌-动作-语言-心理四要素，写出立体人物。',
    focusPoints: [
      '外貌特征对比：突出 1-2 个最鲜明的点',
      '动作刻画体现性格：快慢、力度、节奏',
      '语言与心理并用，让人物“开口说话”'
    ],
    steps: [
      '选择 2 个外貌细节（如眉、手），用比喻/颜色突出。',
      '记录一段动作链（起-承-转-停）表现情绪。',
      '插入一句直接引语 + 一句心理描写，增强代入感。'
    ],
    templates: [
      { label: '人物描写句', text: '他/她的【部位】像【比喻】，在【动作】时微微【变化】。' },
      { label: '动作链', text: '抬头—停顿—握紧—放松，节奏反映人物紧张到平静。' }
    ],
    tips: [
      '避免面面俱到，抓住标志性细节即可',
      '动作描写多用动词短句，读起来有速度感'
    ]
  },
  [ROUTES.WRITING_EVENT]: {
    title: '写事',
    tag: '情节铺陈',
    subtitle: '用时间轴或因果链讲清楚“发生了什么”。',
    focusPoints: [
      '交代时间、地点、人物，迅速进入事件',
      '起因-经过-高潮-结果四步走',
      '加入情绪变化，体现成长或转折'
    ],
    steps: [
      '一句话概括事件，再拆 3 个节点（起因/经过/结果）。',
      '每个节点写一句“我/他做了什么”以及“为什么”。',
      '结尾写感受或收获，完成闭环。'
    ],
    templates: [
      { label: '因果链', text: '因为……所以……结果……（再加“我明白了”）' },
      { label: '时间轴', text: '早上—中午—下午，对应三个小转折。' }
    ],
    tips: [
      '保证时间线清晰，避免倒叙过多造成混乱',
      '每个节点 2-3 句即可，留白让节奏更紧凑'
    ]
  },
  [ROUTES.WRITING_SCENERY]: {
    title: '写景',
    tag: '景物描写',
    subtitle: '按观察顺序+五感描写，营造画面与情感。',
    focusPoints: [
      '确定观察顺序：远到近、上到下或移动路线',
      '融入五感：颜色、声音、气味、触感、温度',
      '景中带情：景物与心情产生映射'
    ],
    steps: [
      '列出 3 个主要景物，确定顺序（如远山-河流-脚边草）。',
      '每个景物至少用 2 种感官描写。',
      '最后一句写心情变化，完成“情景交融”。'
    ],
    templates: [
      { label: '观察顺序', text: '抬头→平视→低头 或 远景→中景→近景。' },
      { label: '情景交融句', text: '【景物】像【比喻】，让我/让人感到【情绪】。' }
    ],
    tips: [
      '避免罗列名词，使用动词让景物“动”起来',
      '每段只描写一个画面，保持层次'
    ]
  },
  [ROUTES.WRITING_ANIMAL]: {
    title: '写动物',
    tag: '生动刻画',
    subtitle: '特征、习性与拟人化语言让动物鲜活可爱。',
    focusPoints: [
      '外形 + 习性：先写长相，再写典型动作',
      '拟人化或比喻，赋予情感与个性',
      '抓住一个场景（觅食/玩耍）展开'
    ],
    steps: [
      '列 2 个外形特征 + 1 个习性。',
      '选一个动作场景，用 3-4 个动词串联。',
      '补一句拟人化评价，让动物有性格。'
    ],
    templates: [
      { label: '动作描写', text: '它先【动作1】，接着【动作2】，最后【动作3】，像个【比喻】。' },
      { label: '性格点睛', text: '这只小家伙真【性格词】，总是/经常……' }
    ],
    tips: [
      '少写科普，多用观察到的细节',
      '拟人化要适度，保持真实感'
    ]
  },
  [ROUTES.WRITING_PLANT]: {
    title: '写植物',
    tag: '细节观察',
    subtitle: '从形态、颜色到生长变化，写出生命力。',
    focusPoints: [
      '芽—叶—花—果的生长顺序描写',
      '用颜色、光影、气味丰富画面',
      '加入时间变化：清晨/雨后/傍晚的不同'
    ],
    steps: [
      '选择一个时间段，描述植物的样子（2-3 句）。',
      '补充生长变化或用途（如遮荫/食用）。',
      '结尾写它带给人的感受或象征意义。'
    ],
    templates: [
      { label: '生长线', text: '从【芽】到【叶】再到【花/果】，颜色/形状逐步变化。' },
      { label: '象征句', text: '它像【象征】，让我想到/明白……' }
    ],
    tips: [
      '细节用动词：舒展、垂落、摇晃、绽放',
      '避免只写颜色，可加入光影和触感'
    ]
  },
  [ROUTES.WRITING_OBJECT]: {
    title: '写静物',
    tag: '物品写作',
    subtitle: '写外形与用途，再联系记忆和情感。',
    focusPoints: [
      '外形+材质+颜色，勾勒整体印象',
      '写用途或使用场景，展示意义',
      '联系个人回忆或赠与者，赋予情感'
    ],
    steps: [
      '用 2 句写外观和质感（硬/软/温暖）。',
      '写一次与它相关的使用场景或故事。',
      '结尾升华：它对我的提醒/陪伴/鼓励。'
    ],
    templates: [
      { label: '外观质感', text: '【物品】呈【形状】，摸上去【质感】，颜色像【比喻】。' },
      { label: '情感升华', text: '每当看到它，我就想起/明白……' }
    ],
    tips: [
      '抓住一个角度特写（划痕、图案）提升真实度',
      '故事不需很长，但要和物品直接相关'
    ]
  },
  [ROUTES.WRITING_OPENING]: {
    title: '如何开头',
    tag: '开篇技巧',
    subtitle: '用 10 秒抓住读者：设问、画面、对比或金句。',
    focusPoints: [
      '开头必须点题或抛钩子，避免空泛',
      '常用四法：设问、引用、画面、对比',
      '开头长度控制在 2-4 句'
    ],
    steps: [
      '确定主题关键词，写一句点题或设问。',
      '补一句画面/场景，建立氛围。',
      '用一句转折或观点，引出下文。'
    ],
    templates: [
      { label: '设问开头', text: '“你是否也曾……？”我在那天想起这件事。' },
      { label: '画面开头', text: '清晨的雾气笼着校园，路灯还亮着，我却被一声问候温暖。' }
    ],
    tips: [
      '避免套话“在我的成长过程中”，用具体场景直接进入',
      '开头不必交代全部背景，只留关键信息'
    ]
  },
  [ROUTES.WRITING_CLOSING]: {
    title: '如何结尾',
    tag: '收束升华',
    subtitle: '回扣主题，留一句余味。',
    focusPoints: [
      '呼应开头的词/景/问题，形成闭环',
      '加入感受、收获或期望，完成升华',
      '结尾简短有力，1-3 句为宜'
    ],
    steps: [
      '回到开头的元素（场景/设问/情绪）。',
      '写一句收获或改变。',
      '再写一句展望或祝愿作为余味。'
    ],
    templates: [
      { label: '呼应结尾', text: '那盏路灯依旧亮着，而我已经学会/明白……' },
      { label: '升华句', text: '这件事让我懂得：____________。' }
    ],
    tips: [
      '不要重复正文内容，强调“因此/于是”后的认识',
      '结尾可以留一个问句，引人思考'
    ]
  },
  [ROUTES.WRITING_BODY]: {
    title: '如何写中间',
    tag: '段落展开',
    subtitle: '控制节奏与过渡，让文章不散乱。',
    focusPoints: [
      '每段只承载一个小点，段落首句提示主题',
      '用过渡词连接：首先/接着/后来/最终',
      '细节描写与概括句穿插，形成呼吸感'
    ],
    steps: [
      '写出 3 个分论点或情节节点，按顺序排列。',
      '每段：主题句 + 例子/细节 + 小结句。',
      '段与段之间用 1 个过渡词或对比词衔接。'
    ],
    templates: [
      { label: '段落公式', text: '主题句 → 细节/例子（2-3 句）→ 小结/过渡句。' },
      { label: '过渡用语', text: '首先/接着/与此同时/然而/最后/因此。' }
    ],
    tips: [
      '避免一段太长，3-5 句为宜',
      '同一段的句式可长短交替，读起来更有节奏'
    ]
  },
  [ROUTES.WRITING_FIVE_SENSES]: {
    title: '五感法',
    tag: '多感官描写',
    subtitle: '调动视觉、听觉、嗅觉、味觉、触觉，让画面立体。',
    focusPoints: [
      '每个场景至少使用两种感官',
      '动词+形容词组合，避免只列名词',
      '感官描写服务情绪，而非堆砌'
    ],
    steps: [
      '列出场景的五感要素（可用表格快速记）。',
      '挑 2-3 个最鲜明的要素写入句子。',
      '加入情绪或心情，让感官描写有指向。'
    ],
    templates: [
      { label: '感官句', text: '空气里飘着【气味】，耳边【声音】，指尖摸到【触感】，让我【情绪】。' },
      { label: '味觉/嗅觉', text: '一阵【味道】钻进鼻子/嘴里，像是【比喻】。' }
    ],
    tips: [
      '选择最能代表场景的 1-2 个感官重点写',
      '使用具体词而非“很好/很香/很美”'
    ]
  },
  [ROUTES.WRITING_EXPERIENCE_REFLECTION]: {
    title: '感受-经历-反思结构',
    tag: '反思写作',
    subtitle: '从感受出发，记录过程，再反思提升。',
    focusPoints: [
      '开头写当下的感受或问题',
      '中段写经历过程，突出冲突与转折',
      '结尾反思：学到什么、想改变什么'
    ],
    steps: [
      '一句话写“我当时感觉/困惑”。',
      '用 3-4 句描述经历与冲突。',
      '写 2 句反思+行动计划。'
    ],
    templates: [
      { label: '结构句', text: '起：我曾经____；承：经历了____；转：我意识到____；合：我决定____。' },
      { label: '反思句', text: '这件事让我反省：以后我会____，因为____。' }
    ],
    tips: [
      '反思要具体，可写“下一次我会……”，避免空话',
      '冲突可小到一次争执，关键是有变化'
    ]
  },
  [ROUTES.WRITING_SCENE_CHARACTER_ACTION]: {
    title: '场景-人物-动作结构',
    tag: '画面感',
    subtitle: '像分镜头一样写，一幕一幕推进。',
    focusPoints: [
      '确定场景→人物→动作的顺序',
      '每个镜头写时间/地点/动作细节',
      '动作连贯性：起、承、转、停'
    ],
    steps: [
      '列出 3 个镜头：场景 + 人物 + 动作。',
      '每个镜头 2 句：一句环境，一句动作。',
      '用“镜头词”过渡：转身、随后、镜头拉近。'
    ],
    templates: [
      { label: '镜头句', text: '镜头拉近：在【场景】，他/她【动作】，表情/声音【细节】。' },
      { label: '三镜头', text: '远景交代环境 → 中景写人物 → 近景抓动作/表情。' }
    ],
    tips: [
      '多用动态动词和方向词（掠过、推开、靠近）',
      '一段一个镜头，避免混写'
    ]
  },
  [ROUTES.WRITING_PROBLEM_SOLUTION_RESULT]: {
    title: '问题-解决-结果模式',
    tag: '逻辑呈现',
    subtitle: '用“问题-尝试-结果-启示”讲清一件事。',
    focusPoints: [
      '明确问题：用一句话指出困境或矛盾',
      '写出解决过程中的尝试与调整',
      '结果与启示：成功/失败都可写出收获'
    ],
    steps: [
      '第一句写问题或挑战。',
      '描述 2 次尝试及调整（可用“起初…后来…”）。',
      '写结果及收获/下一步计划。'
    ],
    templates: [
      { label: 'PSR 句式', text: '问题：____；解决：我先____，后来____；结果：最终____，我学到____。' },
      { label: '转折句', text: '起初我以为____，但经过____，我发现____。' }
    ],
    tips: [
      '突出“过程”的细节，而非只写结果',
      '收获要具体，如“我学会拆解任务”而非“我成长了”'
    ]
  }
}

const activeRoute = computed(() => props.moduleRoute || router.currentRoute.value)

const moduleData = computed(() => {
  return modules[activeRoute.value] || {
    title: '写作训练',
    tag: '通用',
    subtitle: '请选择具体的写作训练模块开始练习。',
    focusPoints: ['点击右上菜单进入某个写作模块。'],
    steps: ['在训练中心选择模块后开始。'],
    templates: [],
    tips: ['在训练中心挑选一个模块进入详细指导。']
  }
})

const difficultyLabel = computed(() => {
  const found = difficultyOptions.find(item => item.value === selectedDifficulty.value)
  return found ? found.label : '未知难度'
})

const questionManagementTotalPages = computed(() => {
  return Math.ceil(questionManagementTotal.value / questionManagementPageSize.value) || 1
})

const markdownPreview = computed(() => marked.parse(writingContent.value || ''))

const handleBack = () => {
  router.navigate(ROUTES.WRITING_TRAINING)
}

const handleStartPractice = () => {
  alert('请根据上方步骤写 100-200 字练习，并保存到本地文档。')
}

const fetchRecords = async () => {
  try {
    const res = await getWritingRecords({
      moduleKey: activeRoute.value,
      pageNum: 1,
      pageSize: 50
    })
    const rows = res?.data?.rows
    if (res?.code === 200 && Array.isArray(rows)) {
      trainingRecords.value = rows
    } else {
      trainingRecords.value = []
    }
  } catch (e) {
    console.error('加载训练记录失败', e)
    trainingRecords.value = []
  }
}

const generateQuestions = async () => {
  if (generating.value) return
  generating.value = true
  generatedQuestions.value = []
  const count = Math.min(Math.max(Number(questionCount.value) || 1, 1), 10)
  questionCount.value = count
  try {
    const res = await generateWritingQuestions({
      moduleKey: activeRoute.value,
      moduleTitle: moduleData.value.title,
      difficulty: selectedDifficulty.value,
      count,
      templates: moduleData.value.templates 
    })

    if (res?.code === 200 && Array.isArray(res.data)) {
      generatedQuestions.value = res.data
    } else if (Array.isArray(res)) {
      generatedQuestions.value = res
    } else {
      throw new Error(res?.msg || '出题失败')
    }

    if (generatedQuestions.value.length > 0) {
      selectQuestion(generatedQuestions.value[0].id || 0, generatedQuestions.value[0])
    } else {
      selectedQuestionId.value = null
      selectedQuestion.value = null
    }
  } catch (error) {
    console.error('生成题目错误', error)
    alert(error.message || '出题失败，请稍后重试')
  } finally {
    generating.value = false
  }
}

const handleViewExamples = async () => {
  if (!selectedQuestionId.value) {
    alert('请先选择一道训练题目。')
    return
  }
  await openQuestionDetail(selectedQuestion.value, null)
}

const handleSubmitAnswer = () => {
  if (!writingContent.value.trim()) {
    alert('请先填写作答内容（支持 Markdown）。')
    return
  }
  if (!selectedQuestionId.value) {
    alert('请先选择一道训练题目。')
    return
  }

  const payload = {
    moduleKey: activeRoute.value,
    moduleTitle: moduleData.value.title,
    difficulty: selectedDifficulty.value,
    questionId: selectedQuestionId.value,
    content: writingContent.value
  }

  saveWritingRecord(payload)
    .then(async res => {
      if (res?.code === 200) {
        alert('作答已提交并保存到数据库。')
        writingContent.value = ''
        fetchRecords()
        // 重新加载当前选中题目的记录
        if (selectedQuestionId.value) {
          await loadQuestionRecords(selectedQuestionId.value)
        }
      } else {
        throw new Error(res?.msg || '保存失败')
      }
    })
    .catch(err => {
      console.error('保存训练记录失败', err)
      alert(err.message || '保存训练记录失败，请稍后重试')
    })
}

const formatDate = iso => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const toggleRecord = id => {
  if (expandedRecordIds.value.includes(id)) {
    expandedRecordIds.value = expandedRecordIds.value.filter(item => item !== id)
  } else {
    expandedRecordIds.value.push(id)
  }
}

const loadRandomQuestions = async () => {
  loadingRandom.value = true
  try {
    const count = Math.min(Math.max(Number(questionCount.value) || 1, 1), 10)
    const res = await getRandomWritingQuestions({ count, moduleKey: activeRoute.value })
    if (res?.code === 200 && Array.isArray(res.data)) {
      generatedQuestions.value = res.data
      if (generatedQuestions.value.length > 0) {
        selectQuestion(generatedQuestions.value[0].id || 0, generatedQuestions.value[0])
      } else {
        selectedQuestionId.value = null
        selectedQuestion.value = null
      }
    } else {
      generatedQuestions.value = []
      selectedQuestionId.value = null
      selectedQuestion.value = null
    }
  } catch (e) {
    console.error('随机题目获取失败', e)
    generatedQuestions.value = []
    selectedQuestionId.value = null
    selectedQuestion.value = null
  } finally {
    loadingRandom.value = false
  }
}

const selectQuestion = async (questionId, question) => {
  selectedQuestionId.value = questionId
  selectedQuestion.value = question
}

const openQuestionDetail = async (question, idx) => {
  if (!question || !question.id) return
  selectedQuestionId.value = question.id
  selectedQuestion.value = question
  if( idx === null ) {
    questionDetailVisible.value = true
    questionDetailLoading.value = true
  }
  questionDetailExamples.value = []
  questionDetailUserRecords.value = []
  try {
    const res = await getWritingRecordsByQuestion({ questionId: question.id })
    if (res?.code === 200 && Array.isArray(res.data)) {
      const all = res.data
      selectedQuestionRecords.value = all
      questionDetailExamples.value = all.filter(r => r.isExample)
      questionDetailUserRecords.value = all.filter(r => !r.isExample)
    } else {
      selectedQuestionRecords.value = []
      questionDetailExamples.value = []
      questionDetailUserRecords.value = []
    }
  } catch (e) {
    console.error('加载题目训练记录失败', e)
    selectedQuestionRecords.value = []
    questionDetailExamples.value = []
    questionDetailUserRecords.value = []
  } finally {
    questionDetailLoading.value = false
  }
}

const handleQuestionClick = async (question, idx) => {
  if (!question) return
  await openQuestionDetail(question, idx)
}

const loadQuestionRecords = async (questionId) => {
  try {
    const res = await getWritingRecordsByQuestion({ questionId })
    if (res?.code === 200 && Array.isArray(res.data)) {
      selectedQuestionRecords.value = res.data
    } else {
      selectedQuestionRecords.value = []
    }
  } catch (e) {
    console.error('加载题目训练记录失败', e)
    selectedQuestionRecords.value = []
  }
}

const loadQuestionManagement = async (page = 1) => {
  loadingQuestionManagement.value = true
  try {
    const res = await getWritingQuestions({
      moduleKey: activeRoute.value,
      difficulty: selectedDifficulty.value,
      pageNum: page,
      pageSize: questionManagementPageSize.value
    })
    const rows = res?.data?.rows || res?.rows
    questionManagementList.value = Array.isArray(rows) ? rows : []
    const total =
      (typeof res?.data?.total === 'number' ? res.data.total : undefined) ??
      (typeof res?.total === 'number' ? res.total : 0)
    questionManagementTotal.value = total
    questionManagementPageNum.value = page
  } catch (e) {
    console.error('加载题目管理列表失败', e)
    questionManagementList.value = []
  } finally {
    loadingQuestionManagement.value = false
  }
}

const handlePageChange = (page) => {
  loadQuestionManagement(page)
}

const handleManagementItemClick = async (item) => {
  if (!item) return
  await openQuestionDetail(item, null)
}

watch(
  () => showQuestionManagementDialog.value,
  (isOpen) => {
    if (isOpen && questionManagementList.value.length === 0) {
      loadQuestionManagement(1)
    }
  }
)

watch(
  () => activeRoute.value,
  () => {
    fetchRecords()
    generatedQuestions.value = []
    writingContent.value = ''
    selectedQuestionId.value = null
    selectedQuestion.value = null
    selectedQuestionRecords.value = []
  },
  { immediate: true }
)

onMounted(() => {
  marked.setOptions({ breaks: true, gfm: true })
})
</script>

<style scoped>
.writing-module-container {
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 120px 40px 60px 320px; /* 为左侧悬浮栏预留空间，略微减小左内边距以放大右侧内容区域 */
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.72) 0%,
    rgba(0, 0, 0, 0.82) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.35);
  border-radius: 12px;
  padding: 18px 22px;
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
  font-size: 32px;
  color: #ffd700;
  text-shadow: 0 0 18px rgba(255, 215, 0, 0.7);
  margin: 8px 0 6px;
}

.subtitle {
  color: #c5c5c5;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary,
.btn-primary,
.btn-ghost {
  padding: 10px 18px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.35);
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.25s;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.btn-secondary:hover,
.btn-primary:hover,
.btn-ghost:hover {
  background: rgba(255, 215, 0, 0.18);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.35);
}

.btn-primary {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.22), rgba(255, 165, 0, 0.22));
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.08);
}

.panel {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.28);
  border-radius: 14px;
  padding: 18px;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.12),
    inset 0 0 24px rgba(255, 215, 0, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.35);
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 700;
  color: #ffd700;
}

.pill {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 215, 0, 0.18);
  color: #ffd700;
}

.pill.accent {
  background: rgba(143, 209, 158, 0.18);
  color: #8fd19e;
}

.list,
.ordered-list {
  margin: 0;
  padding-left: 16px;
  color: #dcdcdc;
  line-height: 1.6;
}

.ordered-list {
  list-style-type: decimal;
}

.template-list {
  display: grid;
  gap: 12px;
}

.template-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 10px;
  padding: 12px;
}

.template-label {
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 6px;
}

.template-text {
  margin: 0;
  color: #dcdcdc;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.floating-sidebar {
  position: fixed;
  top: 130px;
  left: 40px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 6;
}

.training-manager {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wide-panel {
  width: 100%;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.controls-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.control-item label {
  font-size: 13px;
  color: #c5c5c5;
}

.control-value {
  padding: 10px 12px;
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}

.control-select,
.control-input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 215, 0, 0.25);
  background: rgba(0, 0, 0, 0.35);
  color: #f7f7f7;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.question-item {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 215, 0, 0.25);
}

.question-item.selectable {
  cursor: pointer;
}

.question-item.selectable.selected {
  border-color: rgba(143, 209, 158, 0.8);
  box-shadow: 0 0 20px rgba(143, 209, 158, 0.3);
}

.question-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.25),
    0 10px 24px rgba(0, 0, 0, 0.4);
}

.question-index {
  color: #ffd700;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.question-text {
  color: #e6e6e6;
}

.question-empty {
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 215, 0, 0.35);
  color: #c5c5c5;
}

.training-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
  gap: 16px;
  margin-top: 8px;
}

.question-training-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2.4fr);
  gap: 16px;
  margin-top: 8px;
  align-items: flex-start;
}

.question-list-container {
  margin-top: 12px;
}

.selected-question-card {
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(143, 209, 158, 0.4);
  margin-bottom: 16px;
}

.question-records {
  margin-top: 16px;
}

.records-title {
  font-size: 14px;
  color: #ffd700;
  margin-bottom: 8px;
  font-weight: 700;
}

.question-record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-record-item {
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}

.record-meta-small {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
}

.record-time-small {
  color: #c5c5c5;
  font-size: 12px;
}

.record-toggle {
  color: #ffd700;
  font-size: 12px;
  cursor: pointer;
}

.record-body-small {
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.question-record-item.expanded .record-meta-small {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.questions-column,
.editor-column {
  display: flex;
  flex-direction: column;
}

.questions-column.full-height,
.editor-column.full-height {
  height: 100%;
}

.selected-question-wrapper {
  margin-bottom: 16px;
}

.column-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #ffd700;
}

.editor-section {
  margin-top: 12px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.editor-title {
  margin: 6px 0 0;
  color: #ffd700;
}

.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.markdown-editor {
  width: 100%;
  background: rgba(0, 0, 0, 0.35);
  color: #f7f7f7;
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 12px;
  padding: 12px;
  font-family: 'Fira Code', 'Microsoft YaHei', monospace;
  resize: vertical;
}

.markdown-editor.full-width {
  grid-column: 1 / -1;
}

.markdown-preview {
  width: 100%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 12px;
  padding: 12px;
  color: #f7f7f7;
  line-height: 1.6;
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4 {
  color: #ffd700;
}

.markdown-preview pre {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 8px;
  overflow: auto;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.record-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.record-item.expanded .record-meta {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.record-title {
  color: #ffd700;
  font-weight: 700;
}

.record-time {
  color: #c5c5c5;
  font-size: 12px;
}

.record-questions {
  color: #e6e6e6;
}

.record-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-question {
  display: flex;
  gap: 6px;
  align-items: center;
  color: #f7f7f7;
}

.record-questions-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-content {
  padding: 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 215, 0, 0.25);
  line-height: 1.6;
  color: #f7f7f7;
}

.management-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.management-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.management-filter-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.management-filter-label {
  font-size: 13px;
  color: #c5c5c5;
}

.management-filter-value {
  font-size: 14px;
  color: #ffd700;
}

.management-filter-select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.25);
  background: rgba(0, 0, 0, 0.35);
  color: #f7f7f7;
}

.management-filter-button {
  padding: 8px 14px;
}

.management-item {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 215, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.management-content {
  color: #f7f7f7;
}

.management-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 12px;
}

.management-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 215, 0, 0.12);
  color: #ffd700;
}

.management-time {
  color: #c5c5c5;
}

.management-records {
  margin-top: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* 题目详情弹窗：叠加在管理列表弹窗之上 */
.modal-overlay-detail {
  z-index: 1100;
}

.modal-content {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.98) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.35);
  border-radius: 14px;
  width: 100%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.18),
    inset 0 0 30px rgba(255, 215, 0, 0.05),
    0 12px 40px rgba(0, 0, 0, 0.45);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.25);
}

.modal-header h2 {
  margin: 0;
  color: #ffd700;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.2s;
}

.modal-close:hover {
  transform: scale(1.2);
  color: #f4d03f;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px;
}

.modal-footer {
  padding: 12px 22px;
  border-top: 1px solid rgba(255, 215, 0, 0.25);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.page-info {
  color: #c5c5c5;
  font-size: 14px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 100px 20px 40px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .editor-grid {
    grid-template-columns: 1fr;
  }

  .training-layout {
    grid-template-columns: 1fr;
  }

  .question-training-layout {
    grid-template-columns: 1fr;
  }

  .floating-sidebar {
    position: static;
    width: 100%;
    margin-top: 12px;
  }

  .modal-content {
    max-height: 90vh;
  }

  .modal-body {
    padding: 12px 16px;
  }
}
</style>


