<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
      <div 
        class="modal-content scenario-analysis-modal" 
        :class="{ 'is-maximized': isMaximized }"
        @click.stop
      >
        <!-- 头部 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ t('persona.scenarioAnalysis.title') }}</h3>
          <div class="header-actions">
            <button 
              class="header-btn" 
              @click="toggleMaximize"
              :title="isMaximized ? t('persona.scenarioAnalysis.restore') : t('persona.scenarioAnalysis.maximize')"
            >
              <svg v-if="!isMaximized" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V5M16 3V5M3 8H5M19 8H21M3 16H5M19 16H21M8 21V19M16 21V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button 
              class="header-btn close-btn" 
              @click="handleClose"
              :title="t('persona.scenarioAnalysis.close')"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="modal-body">
          <div class="editor-container">
            <!-- 左侧编辑器 -->
            <div class="editor-panel">
              <div class="panel-header">
                <span class="panel-title">{{ t('persona.scenarioAnalysis.editor') }}</span>
              </div>
              <div class="panel-content">
                <textarea
                  ref="editorRef"
                  v-model="markdownContent"
                  class="markdown-editor"
                  :placeholder="t('persona.scenarioAnalysis.editorPlaceholder')"
                ></textarea>
              </div>
            </div>

            <!-- 分隔线 -->
            <div class="divider"></div>

            <!-- 右侧预览 -->
            <div class="preview-panel">
              <div class="panel-header">
                <span class="panel-title">{{ t('persona.scenarioAnalysis.preview') }}</span>
              </div>
              <div 
                ref="previewContentRef"
                class="panel-content preview-content"
                v-html="renderedMarkdown"
              ></div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="modal-footer">
          <button class="btn-secondary" @click="handleClose">
            {{ t('persona.scenarioAnalysis.cancel') }}
          </button>
          <button class="btn-primary" @click="handleSave">
            {{ t('persona.scenarioAnalysis.save') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import mermaid from 'mermaid'
import { encode } from 'plantuml-encoder'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  personaId: {
    type: [Number, String],
    default: null
  },
  initialContent: {
    type: String,
    default: ''
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

const markdownContent = ref('')
const isMaximized = ref(false)
const editorRef = ref(null)
const previewContentRef = ref(null)

// 初始化 Mermaid
let mermaidInitialized = false

const initMermaid = () => {
  if (mermaidInitialized) return
  
  try {
    // Mermaid 11.x 的 initialize 是同步方法
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#ffd700',
        primaryTextColor: '#fff',
        primaryBorderColor: '#ffd700',
        lineColor: '#ffd700',
        secondaryColor: '#1a1a1a',
        tertiaryColor: '#2a2a2a',
        background: '#0a0a0a',
        mainBkgColor: '#1a1a1a',
        secondBkgColor: '#2a2a2a',
        textColor: '#fff',
        fontFamily: 'Microsoft YaHei, SimHei, Arial, sans-serif'
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true
      },
      securityLevel: 'loose'
    })
    mermaidInitialized = true
    console.log('Mermaid 初始化完成')
  } catch (error) {
    console.error('Mermaid initialization error:', error)
    // 初始化失败时，标记为已尝试，避免重复尝试
    mermaidInitialized = true
  }
}

// 立即初始化
initMermaid()

// 配置 marked 选项，自定义代码块渲染
const renderer = new marked.Renderer()
const originalCode = renderer.code.bind(renderer)

renderer.code = function(code, language, escaped) {
  // marked 的 code 参数在 escaped=true 时是 HTML 转义后的字符串，需要先解码
  // 对于特殊图表类型，我们需要原始代码
  let rawCode = code
  if (escaped && typeof document !== 'undefined') {
    // 解码 HTML 实体（仅在浏览器环境中）
    const textarea = document.createElement('textarea')
    textarea.innerHTML = code
    rawCode = textarea.value
  }
  
  // 处理 Mermaid 图表
  if (language === 'mermaid') {
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    // 将代码存储在 data 属性中，方便后续获取（使用 base64 编码避免 HTML 属性问题）
    try {
      // 修复 Base64 编码逻辑，确保正确处理 UTF-8
      const utf8Bytes = new TextEncoder().encode(rawCode)
      const binaryString = String.fromCharCode(...utf8Bytes)
      const encodedCode = btoa(binaryString)
      // 使用 textContent 避免 HTML 转义
      return `<div class="diagram-container mermaid-container" data-type="mermaid" data-id="${id}" data-code-base64="${encodedCode}"><pre class="mermaid"></pre></div>`
    } catch (e) {
      // 如果 base64 编码失败，使用 URI 编码
      try {
        const encodedCode = encodeURIComponent(rawCode)
        return `<div class="diagram-container mermaid-container" data-type="mermaid" data-id="${id}" data-code="${encodedCode}"><pre class="mermaid"></pre></div>`
      } catch (e2) {
        // 如果都失败，直接存储（可能有问题，但总比没有好）
        console.warn('Mermaid 代码编码失败，使用原始代码:', e2)
        return `<div class="diagram-container mermaid-container" data-type="mermaid" data-id="${id}" data-raw-code="${rawCode.replace(/"/g, '&quot;')}"><pre class="mermaid"></pre></div>`
      }
    }
  }
  
  // 处理 PlantUML 图表
  if (language === 'plantuml' || language === 'puml') {
    const id = `plantuml-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    try {
      const encoded = encode(rawCode)
      const plantumlUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`
      const errorMsg = t('persona.scenarioAnalysis.diagramLoadError')
      return `<div class="diagram-container plantuml-container" data-type="plantuml" data-id="${id}" data-code="${encodeURIComponent(rawCode)}" data-url="${plantumlUrl}"><div class="plantuml-loading">${t('persona.scenarioAnalysis.loading') || '加载中...'}</div></div>`
    } catch (e) {
      console.error('PlantUML encoding error:', e)
      return `<div class="diagram-container plantuml-container" data-type="plantuml" data-id="${id}"><div class="diagram-error">${t('persona.scenarioAnalysis.diagramLoadError')}: ${e.message || '编码失败'}</div></div>`
    }
  }
  
  // 处理 Mindmap 思维导图 - 支持 markmap 格式和 mermaid mindmap 格式
  if (language === 'mindmap') {
    const id = `mindmap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    // 检查是否是 mermaid mindmap 格式
    if (rawCode.trim().startsWith('mindmap') || rawCode.trim().includes('root((')) {
      // 使用 Mermaid 渲染
      try {
        // 修复 Base64 编码逻辑，确保正确处理 UTF-8
        const utf8Bytes = new TextEncoder().encode(rawCode)
        const binaryString = String.fromCharCode(...utf8Bytes)
        const encodedCode = btoa(binaryString)
        return `<div class="diagram-container mermaid-container" data-type="mermaid-mindmap" data-id="${id}" data-code-base64="${encodedCode}"><pre class="mermaid"></pre></div>`
      } catch (e) {
        try {
          const encodedCode = encodeURIComponent(rawCode)
          return `<div class="diagram-container mermaid-container" data-type="mermaid-mindmap" data-id="${id}" data-code="${encodedCode}"><pre class="mermaid"></pre></div>`
        } catch (e2) {
          console.warn('Mermaid mindmap 代码编码失败:', e2)
          return `<div class="diagram-container mermaid-container" data-type="mermaid-mindmap" data-id="${id}" data-raw-code="${rawCode.replace(/"/g, '&quot;')}"><pre class="mermaid"></pre></div>`
        }
      }
    } else {
      // 使用 Markmap 渲染
      try {
        // 修复 Base64 编码逻辑，确保正确处理 UTF-8
        const utf8Bytes = new TextEncoder().encode(rawCode)
        const binaryString = String.fromCharCode(...utf8Bytes)
        const encodedCode = btoa(binaryString)
        return `<div class="diagram-container mindmap-container" data-type="mindmap" data-id="${id}" data-code-base64="${encodedCode}"><svg class="mindmap-svg" id="mindmap-${id}"></svg></div>`
      } catch (e) {
        try {
          const encodedCode = encodeURIComponent(rawCode)
          return `<div class="diagram-container mindmap-container" data-type="mindmap" data-id="${id}" data-code="${encodedCode}"><svg class="mindmap-svg" id="mindmap-${id}"></svg></div>`
        } catch (e2) {
          console.warn('Mindmap 代码编码失败:', e2)
          return `<div class="diagram-container mindmap-container" data-type="mindmap" data-id="${id}" data-raw-code="${rawCode.replace(/"/g, '&quot;')}"><svg class="mindmap-svg" id="mindmap-${id}"></svg></div>`
        }
      }
    }
  }
  
  // 默认代码块渲染
  return originalCode(code, language, escaped)
}

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer: renderer
})

// 渲染 markdown
const renderedMarkdown = computed(() => {
  if (!markdownContent.value) {
    return '<p class="empty-preview">' + t('persona.scenarioAnalysis.emptyPreview') + '</p>'
  }
  try {
    return marked.parse(markdownContent.value)
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return '<p class="error-preview">' + t('persona.scenarioAnalysis.renderError') + '</p>'
  }
})

// 渲染图表
const renderDiagrams = async () => {
  if (!previewContentRef.value) {
    console.warn('Preview content ref not available')
    return
  }
  
  // 确保 Mermaid 已初始化
  initMermaid()
  
  // 等待 DOM 更新
  await nextTick()
  
  // 延迟一下确保 DOM 完全渲染（v-html 需要时间）
  await new Promise(resolve => setTimeout(resolve, 150))
  
  if (!previewContentRef.value) return
  
  console.log('开始渲染图表...')
  
  // 渲染 Mermaid 图表（包括普通 mermaid 和 mermaid-mindmap）
  const mermaidContainers = previewContentRef.value.querySelectorAll('.mermaid-container')
  console.log(`找到 ${mermaidContainers.length} 个 Mermaid 容器`)
  
  for (const container of mermaidContainers) {
    if (container.dataset.rendered === 'true') {
      console.log('容器已渲染，跳过')
      continue
    }
    
    try {
      // 标记为正在处理
      container.dataset.rendered = 'processing'
      
      // 获取原始代码（优先从 data-code-base64 或 data-code 属性获取）
      let code = ''
      if (container.dataset.codeBase64) {
        try {
          // 修复 Base64 解码逻辑，确保正确处理 UTF-8
          const base64Data = container.dataset.codeBase64
          // 先进行 Base64 解码
          const binaryString = atob(base64Data)
          // 将二进制字符串转换为 UTF-8 字符串
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          code = new TextDecoder('utf-8').decode(bytes)
        } catch (e) {
          console.warn('Base64 解码失败，尝试其他方法:', e)
          // 尝试简单的方式
          try {
            const binaryString = atob(container.dataset.codeBase64)
            code = decodeURIComponent(
              binaryString.split('').map(char => {
                return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
              }).join('')
            )
          } catch (e2) {
            console.warn('简单 Base64 解码也失败:', e2)
            // 最后尝试直接解码
            try {
              code = atob(container.dataset.codeBase64)
            } catch (e3) {
              console.error('所有 Base64 解码方式都失败:', e3)
            }
          }
        }
      }
      if (!code && container.dataset.code) {
        try {
          code = decodeURIComponent(container.dataset.code)
        } catch (e) {
          console.warn('URI 解码失败:', e)
          // 如果解码失败，直接使用原值（可能已经是原始代码）
          code = container.dataset.code
        }
      }
      if (!code && container.dataset.rawCode) {
        // 如果存在原始代码属性（编码失败的情况）
        code = container.dataset.rawCode
      }
      
      if (!code) {
        console.warn('Mermaid 代码为空')
        container.innerHTML = `<div class="diagram-error">${t('persona.scenarioAnalysis.mermaidError')}: 代码为空</div>`
        container.dataset.rendered = 'error'
        continue
      }
      
      console.log('Mermaid 代码长度:', code.length, '前50个字符:', code.substring(0, 50))
      
      // 确保 pre 元素存在
      let pre = container.querySelector('pre.mermaid')
      if (!pre) {
        pre = document.createElement('pre')
        pre.className = 'mermaid'
        container.innerHTML = ''
        container.appendChild(pre)
      }
      
      // 设置 pre 元素的文本内容（使用 textContent 避免 HTML 转义）
      pre.textContent = code.trim()
      
      // 使用 Mermaid 渲染
      try {
        // Mermaid 11.x 优先使用 run 方法
        if (typeof mermaid.run === 'function') {
          // 确保 pre 元素有 mermaid 类
          if (!pre.classList.contains('mermaid')) {
            pre.classList.add('mermaid')
          }
          
          // 使用 run 方法渲染 - Mermaid 11.x 的正确方式
          const result = await mermaid.run({
            nodes: [pre],
            suppressErrors: false
          })
          console.log('Mermaid 渲染成功（run 方法）', result)
          container.dataset.rendered = 'true'
        } else if (typeof mermaid.render === 'function') {
          // 如果 run 不存在，使用 render 方法
          const id = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          try {
            const result = await mermaid.render(id, code.trim())
            // 替换容器内容为渲染后的 SVG
            if (result && result.svg) {
              container.innerHTML = result.svg
            } else if (typeof result === 'string') {
              container.innerHTML = result
            } else {
              throw new Error('渲染结果格式不正确')
            }
            console.log('Mermaid 渲染成功（render 方法）')
            container.dataset.rendered = 'true'
          } catch (renderError) {
            console.error('mermaid.render 错误:', renderError)
            throw renderError
          }
        } else if (typeof mermaid.init === 'function') {
          // 旧版本使用 init 方法
          mermaid.init(undefined, pre)
          console.log('Mermaid 渲染成功（init 方法）')
          container.dataset.rendered = 'true'
        } else {
          throw new Error('Mermaid API 不可用，请检查 mermaid 库是否正确导入')
        }
      } catch (error) {
        console.error('Mermaid 渲染错误:', error)
        console.error('错误堆栈:', error.stack)
        console.error('错误代码:', code.substring(0, 200))
        container.innerHTML = `<div class="diagram-error">${t('persona.scenarioAnalysis.mermaidError')}: ${error.message || 'Unknown error'}</div>`
        container.dataset.rendered = 'error'
      }
    } catch (error) {
      console.error('Mermaid 处理错误:', error)
      container.innerHTML = `<div class="diagram-error">${t('persona.scenarioAnalysis.mermaidError')}: ${error.message || 'Unknown error'}</div>`
      container.dataset.rendered = 'error'
    }
  }
  
  // 渲染 PlantUML 图表
  const plantumlContainers = previewContentRef.value.querySelectorAll('.plantuml-container')
  console.log(`找到 ${plantumlContainers.length} 个 PlantUML 容器`)
  
  for (const container of plantumlContainers) {
    if (container.dataset.rendered === 'true') continue
    
    try {
      container.dataset.rendered = 'processing'
      const url = container.dataset.url
      
      if (url) {
        // 创建图片元素
        const img = document.createElement('img')
        img.src = url
        img.alt = 'PlantUML Diagram'
        img.loading = 'lazy'
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
        img.style.borderRadius = '4px'
        
        // 设置事件监听器
        img.onload = () => {
          container.dataset.rendered = 'true'
          console.log('PlantUML 图片加载成功')
        }
        
        img.onerror = () => {
          container.innerHTML = `<div class="diagram-error">${t('persona.scenarioAnalysis.diagramLoadError')}</div>`
          container.dataset.rendered = 'error'
          console.error('PlantUML 图片加载失败')
        }
        
        // 清空容器并添加图片
        container.innerHTML = ''
        container.appendChild(img)
      } else {
        throw new Error('PlantUML URL 不存在')
      }
    } catch (error) {
      console.error('PlantUML 处理错误:', error)
      container.innerHTML = `<div class="diagram-error">${t('persona.scenarioAnalysis.diagramLoadError')}: ${error.message || 'Unknown error'}</div>`
      container.dataset.rendered = 'error'
    }
  }
  
  // 渲染 Markmap 思维导图（Markmap 格式）
  const mindmapContainers = previewContentRef.value.querySelectorAll('.mindmap-container')
  console.log(`找到 ${mindmapContainers.length} 个 Mindmap 容器`)
  
  for (const container of mindmapContainers) {
    if (container.dataset.rendered === 'true') continue
    
    const svg = container.querySelector('svg.mindmap-svg')
    
    // 获取代码（优先从 data-code-base64 获取，否则从 data-code 获取）
    let code = ''
    if (container.dataset.codeBase64) {
      try {
        // 修复 Base64 解码逻辑，确保正确处理 UTF-8
        const binaryString = atob(container.dataset.codeBase64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        code = new TextDecoder('utf-8').decode(bytes)
      } catch (e) {
        console.warn('Base64 解码失败:', e)
        // 尝试其他方式
        try {
          const binaryString = atob(container.dataset.codeBase64)
          code = decodeURIComponent(
            binaryString.split('').map(char => {
              return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
            }).join('')
          )
        } catch (e2) {
          console.warn('备用 Base64 解码也失败:', e2)
        }
      }
    }
    if (!code && container.dataset.code) {
      try {
        code = decodeURIComponent(container.dataset.code)
      } catch (e) {
        console.warn('URI 解码失败:', e)
        code = container.dataset.code
      }
    }
    if (!code && container.dataset.rawCode) {
      code = container.dataset.rawCode
    }
    
    if (svg && code) {
      try {
        // 标记为正在处理
        container.dataset.rendered = 'processing'
        console.log('开始渲染 Markmap 思维导图，代码长度:', code.length)
        
        // 尝试解析为 markdown 格式的思维导图
        const transformer = new Transformer()
        const { root } = transformer.transform(code)
        
        // 创建 markmap 实例
        const markmapInstance = Markmap.create(svg, {
          color: (node) => {
            return node.depth === 0 ? '#ffd700' : node.depth === 1 ? '#ffa500' : '#ff6b9d'
          },
          duration: 500,
          maxWidth: 300,
          spacingVertical: 8,
          spacingHorizontal: 120,
          initialExpandLevel: 2,
          paddingX: 8
        })
        
        markmapInstance.setData(root)
        markmapInstance.fit()
        
        console.log('Markmap 渲染成功')
        container.dataset.rendered = 'true'
      } catch (error) {
        console.error('Markmap 渲染错误:', error)
        console.error('错误堆栈:', error.stack)
        // 如果 markmap 失败，显示错误信息
        container.innerHTML = `<div class="diagram-error">${t('persona.scenarioAnalysis.mindmapError') || '思维导图渲染失败'}: ${error.message || 'Unknown error'}</div>`
        container.dataset.rendered = 'error'
      }
    } else {
      console.warn('Markmap 容器或代码缺失，svg:', !!svg, 'code:', !!code)
      if (!code) {
        container.innerHTML = `<div class="diagram-error">${t('persona.scenarioAnalysis.mindmapError') || '思维导图渲染失败'}: 代码为空</div>`
        container.dataset.rendered = 'error'
      }
    }
  }
  
  console.log('图表渲染完成')
}

// 监听 markdown 内容变化，重新渲染图表
watch(() => renderedMarkdown.value, async () => {
  // 清除所有处理标记
  if (previewContentRef.value) {
    const allProcessed = previewContentRef.value.querySelectorAll('[data-processed]')
    allProcessed.forEach(el => {
      delete el.dataset.processed
    })
    const allRendered = previewContentRef.value.querySelectorAll('[data-rendered]')
    allRendered.forEach(el => {
      delete el.dataset.rendered
    })
  }
  
  // 延迟渲染，确保 DOM 已更新
  await nextTick()
  // 再等待一段时间确保 v-html 内容已完全插入
  setTimeout(() => {
    renderDiagrams()
  }, 150)
}, { flush: 'post' })

// 监听初始内容变化
watch(() => props.initialContent, (newVal) => {
  if (newVal !== undefined) {
    markdownContent.value = newVal
  }
}, { immediate: true })

// 监听弹窗打开
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    // 弹窗打开时，如果有初始内容则加载
    if (props.initialContent !== undefined) {
      markdownContent.value = props.initialContent
    }
    // 聚焦到编辑器
    await nextTick()
    if (editorRef.value) {
      editorRef.value.focus()
    }
    // 延迟渲染图表，确保 DOM 完全加载
    // 使用多次尝试确保渲染成功
    setTimeout(() => {
      renderDiagrams()
    }, 200)
    setTimeout(() => {
      renderDiagrams()
    }, 500)
    setTimeout(() => {
      renderDiagrams()
    }, 1000)
  } else {
    // 弹窗关闭时重置最大化状态
    isMaximized.value = false
    // 清除所有处理标记
    if (previewContentRef.value) {
      const allProcessed = previewContentRef.value.querySelectorAll('[data-processed]')
      allProcessed.forEach(el => {
        delete el.dataset.processed
      })
      const allRendered = previewContentRef.value.querySelectorAll('[data-rendered]')
      allRendered.forEach(el => {
        delete el.dataset.rendered
      })
    }
  }
})

// 切换最大化
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

// 点击遮罩层
const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

// 保存
const handleSave = () => {
  emit('save', {
    personaId: props.personaId,
    content: markdownContent.value
  })
  handleClose()
}

// 组件挂载
onMounted(() => {
  // Mermaid 和 Markmap 已在导入时初始化
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlay-fade-in 0.3s ease;
}

@keyframes overlay-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.scenario-analysis-modal {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(20, 10, 0, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 15px;
  padding: 0;
  width: 90%;
  max-width: 1200px;
  height: 80vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 0 50px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  animation: modal-slide-up 0.3s ease;
  position: relative;
  overflow: hidden;
}

.scenario-analysis-modal.is-maximized {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  max-height: 100vh;
  border-radius: 0;
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  flex-shrink: 0;
}

.modal-title {
  font-size: 24px;
  color: #ffd700;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.6);
  font-weight: bold;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-btn {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: #ffd700;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  padding: 0;
}

.header-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.6);
  transform: scale(1.1);
}

.header-btn.close-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.6);
  color: #f44336;
}

.header-btn svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px 30px;
}

.editor-container {
  display: flex;
  flex: 1;
  gap: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
}

.editor-panel,
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.panel-header {
  padding: 12px 20px;
  background: rgba(255, 215, 0, 0.1);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffd700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  position: relative;
}

/* 编辑器样式 */
.markdown-editor {
  width: 100%;
  height: 100%;
  min-height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 0;
  color: white;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
  outline: none;
  resize: none;
  padding: 0;
  box-sizing: border-box;
}

.markdown-editor::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.markdown-editor:focus {
  background: rgba(0, 0, 0, 0.6);
}

/* 预览样式 */
.preview-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.8;
  word-wrap: break-word;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3),
.preview-content :deep(h4),
.preview-content :deep(h5),
.preview-content :deep(h6) {
  color: #ffd700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.preview-content :deep(h1) {
  font-size: 2em;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  padding-bottom: 0.3em;
}

.preview-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding-bottom: 0.3em;
}

.preview-content :deep(h3) {
  font-size: 1.25em;
}

.preview-content :deep(p) {
  margin: 1em 0;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.preview-content :deep(li) {
  margin: 0.5em 0;
}

.preview-content :deep(blockquote) {
  border-left: 4px solid rgba(255, 215, 0, 0.5);
  padding-left: 1em;
  margin: 1em 0;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 215, 0, 0.05);
  padding: 0.5em 1em;
}

.preview-content :deep(code) {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.preview-content :deep(pre) {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
}

.preview-content :deep(pre code) {
  background: none;
  padding: 0;
  color: rgba(255, 255, 255, 0.9);
}

.preview-content :deep(a) {
  color: #ffd700;
  text-decoration: underline;
}

.preview-content :deep(a:hover) {
  color: #ffed4e;
}

.preview-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.preview-content :deep(th),
.preview-content :deep(td) {
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 0.5em 1em;
  text-align: left;
}

.preview-content :deep(th) {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
  font-weight: bold;
}

.preview-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
  margin: 2em 0;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1em 0;
}

.empty-preview,
.error-preview {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  text-align: center;
  padding: 2em;
}

.error-preview {
  color: rgba(244, 67, 54, 0.8);
}

/* 图表容器样式 */
.diagram-container {
  margin: 1.5em 0;
  padding: 1em;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  overflow: auto;
  position: relative;
}

.diagram-container.mermaid-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.diagram-container.mermaid-container :deep(.mermaid) {
  background: transparent;
  color: #fff;
}

.diagram-container.plantuml-container {
  text-align: center;
  min-height: 100px;
}

.diagram-container.plantuml-container img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.plantuml-loading {
  padding: 2em;
  color: rgba(255, 215, 0, 0.7);
  text-align: center;
  font-style: italic;
}

.diagram-container.mindmap-container {
  min-height: 400px;
  width: 100%;
  overflow: auto;
}

.diagram-container.mindmap-container .mindmap-svg {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.diagram-error {
  padding: 1em;
  color: rgba(244, 67, 54, 0.8);
  text-align: center;
  font-style: italic;
  background: rgba(244, 67, 54, 0.1);
  border: 1px dashed rgba(244, 67, 54, 0.3);
  border-radius: 4px;
}

/* Mermaid 图表样式优化 */
.preview-content :deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
}

.preview-content :deep(.mermaid .node rect),
.preview-content :deep(.mermaid .node circle),
.preview-content :deep(.mermaid .node ellipse),
.preview-content :deep(.mermaid .node polygon) {
  fill: rgba(255, 215, 0, 0.1) !important;
  stroke: #ffd700 !important;
}

.preview-content :deep(.mermaid .nodeLabel) {
  color: #fff !important;
}

.preview-content :deep(.mermaid .edgeLabel) {
  color: #ffd700 !important;
  background: rgba(0, 0, 0, 0.7) !important;
}

.preview-content :deep(.mermaid .edgePath .path) {
  stroke: #ffd700 !important;
}

.preview-content :deep(.mermaid .arrowheadPath) {
  fill: #ffd700 !important;
}

/* Markmap 思维导图样式 */
.preview-content :deep(.mindmap-container .mm-node) {
  cursor: pointer;
}

.preview-content :deep(.mindmap-container .mm-node circle) {
  fill: #ffd700;
  stroke: #ffa500;
}

.preview-content :deep(.mindmap-container .mm-node text) {
  fill: #fff;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
}

/* 分隔线 */
.divider {
  width: 1px;
  background: rgba(255, 215, 0, 0.3);
  flex-shrink: 0;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar,
.markdown-editor::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.panel-content::-webkit-scrollbar-track,
.markdown-editor::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb,
.markdown-editor::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover,
.markdown-editor::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
  flex-shrink: 0;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .scenario-analysis-modal {
    width: 100%;
    height: 100vh;
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .editor-container {
    flex-direction: column;
  }

  .divider {
    width: 100%;
    height: 1px;
  }

  .editor-panel,
  .preview-panel {
    min-height: 40vh;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-body {
    padding: 15px 20px;
  }

  .modal-footer {
    padding: 15px 20px;
  }
}
</style>

