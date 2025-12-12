<template>
  <div class="deepseek-chat">
    <div class="chat-container">
      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message-item', message.role]"
        >
          <div class="message-role">{{ getRoleLabel(message.role) }}</div>
          <div class="message-content">{{ message.content }}</div>
          <div v-if="message.role === 'assistant' && message.usage" class="message-usage">
            Token 使用: {{ message.usage.totalTokens }} (提示: {{ message.usage.promptTokens }}, 完成: {{ message.usage.completionTokens }})
          </div>
        </div>
        <div v-if="loading" class="message-item assistant loading">
          <div class="message-role">AI</div>
          <div class="message-content">正在思考中...</div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="system-prompt-section" v-if="showSystemPrompt">
          <label>系统提示词（可选）:</label>
          <textarea
            v-model="systemPrompt"
            placeholder="例如：你是一个专业的助手..."
            rows="2"
            class="system-prompt-input"
          ></textarea>
        </div>
        <div class="input-row">
          <textarea
            v-model="inputMessage"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.shift.enter.exact="handleNewLine"
            placeholder="输入消息... (Enter发送, Shift+Enter换行)"
            rows="3"
            class="message-input"
            :disabled="loading"
          ></textarea>
          <button
            @click="handleSend"
            :disabled="loading || !inputMessage.trim()"
            class="send-button"
          >
            {{ loading ? '发送中...' : '发送' }}
          </button>
        </div>
        <div class="input-actions">
          <button @click="clearMessages" class="action-button">清空对话</button>
          <button @click="toggleSystemPrompt" class="action-button">
            {{ showSystemPrompt ? '隐藏' : '显示' }}系统提示词
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { chatWithMessages, chatSimple, createSystemMessage, createUserMessage } from '@/api/deepseek.js'

export default {
  name: 'DeepSeekChat',
  props: {
    // 初始系统提示词
    initialSystemPrompt: {
      type: String,
      default: ''
    },
    // 是否显示系统提示词输入框
    showSystemPromptInput: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      messages: [],
      inputMessage: '',
      systemPrompt: this.initialSystemPrompt || '',
      loading: false,
      showSystemPrompt: this.showSystemPromptInput
    }
  },
  mounted() {
    // 如果有初始系统提示词，添加到消息列表
    if (this.systemPrompt) {
      this.messages.push(createSystemMessage(this.systemPrompt))
    }
  },
  methods: {
    /**
     * 发送消息
     */
    async handleSend() {
      if (!this.inputMessage.trim() || this.loading) {
        return
      }

      const userMessage = this.inputMessage.trim()
      this.inputMessage = ''

      // 添加用户消息到列表
      this.messages.push(createUserMessage(userMessage))

      this.loading = true
      this.scrollToBottom()

      try {
        // 构建消息列表（包含系统提示词）
        const messagesToSend = []
        
        // 如果有系统提示词，添加到消息列表开头
        if (this.systemPrompt && this.systemPrompt.trim()) {
          // 检查是否已经有系统消息
          const hasSystemMessage = this.messages.some(msg => msg.role === 'system')
          if (!hasSystemMessage) {
            messagesToSend.push(createSystemMessage(this.systemPrompt.trim()))
          }
        }
        
        // 添加历史消息（排除系统消息，因为已经在开头添加）
        const historyMessages = this.messages.filter(msg => msg.role !== 'system')
        messagesToSend.push(...historyMessages)

        // 调用 API
        const response = await chatWithMessages(messagesToSend)

        if (response.code === 200 && response.data) {
          const chatResponse = response.data
          
          // 提取 AI 回复
          if (chatResponse.choices && chatResponse.choices.length > 0) {
            const assistantMessage = chatResponse.choices[0].message
            if (assistantMessage && assistantMessage.content) {
              // 添加助手消息，包含使用情况
              this.messages.push({
                role: 'assistant',
                content: assistantMessage.content,
                usage: chatResponse.usage || null
              })
            }
          }
        } else {
          throw new Error(response.msg || '请求失败')
        }
      } catch (error) {
        console.error('DeepSeek 聊天错误:', error)
        this.$message?.error?.(error.message || '发送消息失败，请稍后重试')
        
        // 添加错误消息
        this.messages.push({
          role: 'assistant',
          content: `错误: ${error.message || '请求失败'}`
        })
      } finally {
        this.loading = false
        this.scrollToBottom()
      }
    },

    /**
     * 处理换行
     */
    handleNewLine() {
      // Shift+Enter 换行，不做任何处理，让默认行为生效
    },

    /**
     * 清空对话
     */
    clearMessages() {
      this.messages = []
      // 如果有系统提示词，重新添加
      if (this.systemPrompt && this.systemPrompt.trim()) {
        this.messages.push(createSystemMessage(this.systemPrompt.trim()))
      }
    },

    /**
     * 切换系统提示词显示
     */
    toggleSystemPrompt() {
      this.showSystemPrompt = !this.showSystemPrompt
    },

    /**
     * 获取角色标签
     */
    getRoleLabel(role) {
      const labels = {
        system: '系统',
        user: '用户',
        assistant: 'AI'
      }
      return labels[role] || role
    },

    /**
     * 滚动到底部
     */
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  },
  watch: {
    messages: {
      handler() {
        this.scrollToBottom()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.deepseek-chat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 300px;
  max-height: 600px;
}

.message-item {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-item.system {
  background-color: #e3f2fd;
}

.message-item.user {
  background-color: #e8f5e9;
  margin-left: 20%;
}

.message-item.assistant {
  background-color: #fff3e0;
  margin-right: 20%;
}

.message-item.loading {
  opacity: 0.7;
}

.message-role {
  font-weight: bold;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.message-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  color: #333;
}

.message-usage {
  margin-top: 8px;
  font-size: 11px;
  color: #999;
  border-top: 1px solid #eee;
  padding-top: 4px;
}

.input-container {
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.system-prompt-section {
  margin-bottom: 12px;
}

.system-prompt-section label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
}

.system-prompt-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  border-color: #4caf50;
}

.send-button {
  padding: 8px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.send-button:hover:not(:disabled) {
  background-color: #45a049;
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.input-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 6px 12px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.action-button:hover {
  background-color: #e0e0e0;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

