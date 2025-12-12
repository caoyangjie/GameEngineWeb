<template>
  <div class="deepseek-example">
    <h2>DeepSeek AI 使用示例</h2>
    
    <!-- 示例1：简单聊天 -->
    <div class="example-section">
      <h3>示例1：简单聊天</h3>
      <div class="example-content">
        <input v-model="simpleInput" placeholder="输入消息..." class="input-field" />
        <button @click="handleSimpleChat" :disabled="loading">发送</button>
        <div v-if="simpleReply" class="reply-box">
          <strong>AI 回复：</strong>
          <p>{{ simpleReply }}</p>
        </div>
      </div>
    </div>

    <!-- 示例2：带系统提示词的聊天 -->
    <div class="example-section">
      <h3>示例2：带系统提示词的聊天</h3>
      <div class="example-content">
        <textarea v-model="systemPrompt" placeholder="系统提示词（可选）" class="textarea-field"></textarea>
        <input v-model="promptInput" placeholder="输入消息..." class="input-field" />
        <button @click="handlePromptChat" :disabled="loading">发送</button>
        <div v-if="promptReply" class="reply-box">
          <strong>AI 回复：</strong>
          <p>{{ promptReply }}</p>
        </div>
      </div>
    </div>

    <!-- 示例3：使用完整聊天组件 -->
    <div class="example-section">
      <h3>示例3：完整聊天组件</h3>
      <DeepSeekChat
        :initial-system-prompt="'你是一个专业的助手，请用简洁明了的语言回答问题。'"
        :show-system-prompt-input="true"
      />
    </div>
  </div>
</template>

<script>
import { chatSimple } from '@/api/deepseek.js'
import DeepSeekChat from './DeepSeekChat.vue'

export default {
  name: 'DeepSeekExample',
  components: {
    DeepSeekChat
  },
  data() {
    return {
      simpleInput: '',
      simpleReply: '',
      systemPrompt: '你是一个专业的助手',
      promptInput: '',
      promptReply: '',
      loading: false
    }
  },
  methods: {
    /**
     * 简单聊天示例
     */
    async handleSimpleChat() {
      if (!this.simpleInput.trim()) {
        return
      }

      this.loading = true
      this.simpleReply = ''

      try {
        const response = await chatSimple(this.simpleInput)
        if (response.code === 200) {
          this.simpleReply = response.data
        } else {
          this.$message?.error?.(response.msg || '请求失败')
        }
      } catch (error) {
        console.error('聊天错误:', error)
        this.$message?.error?.(error.message || '请求失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 带系统提示词的聊天示例
     */
    async handlePromptChat() {
      if (!this.promptInput.trim()) {
        return
      }

      this.loading = true
      this.promptReply = ''

      try {
        const response = await chatSimple(
          this.promptInput,
          this.systemPrompt || undefined
        )
        if (response.code === 200) {
          this.promptReply = response.data
        } else {
          this.$message?.error?.(response.msg || '请求失败')
        }
      } catch (error) {
        console.error('聊天错误:', error)
        this.$message?.error?.(error.message || '请求失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.deepseek-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 30px;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.example-section h3 {
  color: #555;
  margin-bottom: 15px;
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-field,
.textarea-field {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.textarea-field {
  min-height: 60px;
  resize: vertical;
}

button {
  padding: 8px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.reply-box {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.reply-box strong {
  color: #4caf50;
  display: block;
  margin-bottom: 8px;
}

.reply-box p {
  margin: 0;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}
</style>

