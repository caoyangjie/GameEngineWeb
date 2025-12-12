import request from './request.js'

/**
 * DeepSeek AI API 封装
 */

/**
 * 发送聊天请求
 * @param {Object} chatRequest 聊天请求对象
 * @param {string} chatRequest.model 模型名称，默认为 deepseek-chat
 * @param {Array<Object>} chatRequest.messages 消息列表
 * @param {string} chatRequest.messages[].role 角色：system, user, assistant
 * @param {string} chatRequest.messages[].content 消息内容
 * @param {number} chatRequest.temperature 温度参数，控制输出的随机性，范围 0-2，默认 1.0
 * @param {number} chatRequest.topP Top-p 采样参数，范围 0-1，默认 1.0
 * @param {number} chatRequest.maxTokens 最大生成 token 数，默认 4096
 * @param {boolean} chatRequest.stream 是否流式输出，默认 false
 * @param {number} chatRequest.frequencyPenalty 频率惩罚，范围 -2.0 到 2.0，默认 0
 * @param {number} chatRequest.presencePenalty 存在惩罚，范围 -2.0 到 2.0，默认 0
 * @returns {Promise} 返回聊天响应
 */
export function chat(chatRequest) {
  return request({
    url: '/ai/deepseek/chat',
    method: 'post',
    data: chatRequest
  })
}

/**
 * 使用消息列表发送聊天请求
 * @param {Array<Object>} messages 消息列表
 * @param {string} messages[].role 角色：system, user, assistant
 * @param {string} messages[].content 消息内容
 * @returns {Promise} 返回聊天响应
 */
export function chatWithMessages(messages) {
  return request({
    url: '/ai/deepseek/chat/messages',
    method: 'post',
    data: messages
  })
}

/**
 * 发送单条用户消息并获取回复（简化接口）
 * @param {string} userMessage 用户消息
 * @param {string} systemPrompt 系统提示词（可选）
 * @returns {Promise} 返回 AI 回复内容字符串
 */
export function chatSimple(userMessage, systemPrompt = '') {
  const params = {
    userMessage
  }
  if (systemPrompt) {
    params.systemPrompt = systemPrompt
  }
  return request({
    url: '/ai/deepseek/chat/simple',
    method: 'post',
    params
  })
}

/**
 * 创建消息对象
 * @param {string} role 角色：system, user, assistant
 * @param {string} content 消息内容
 * @returns {Object} 消息对象
 */
export function createMessage(role, content) {
  return {
    role,
    content
  }
}

/**
 * 创建系统消息
 * @param {string} content 消息内容
 * @returns {Object} 系统消息对象
 */
export function createSystemMessage(content) {
  return createMessage('system', content)
}

/**
 * 创建用户消息
 * @param {string} content 消息内容
 * @returns {Object} 用户消息对象
 */
export function createUserMessage(content) {
  return createMessage('user', content)
}

/**
 * 创建助手消息
 * @param {string} content 消息内容
 * @returns {Object} 助手消息对象
 */
export function createAssistantMessage(content) {
  return createMessage('assistant', content)
}

