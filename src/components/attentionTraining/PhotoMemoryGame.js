/**
 * 照相记忆游戏类 - 配对模式（翻牌记忆游戏）
 */
export class PhotoMemoryGame {
  constructor(canvasId, options = {}) {
    this.canvasId = canvasId
    this.gridSize = options.gridSize || 4
    this.observeDuration = options.observeDuration || 3 // 观察时间（秒）
    
    // 游戏状态：idle | observing | playing | paused | completed
    this.status = 'idle'
    this.isObserving = false // 是否处于观察模式
    this.previousStatus = null // 切换到观察模式前的状态（用于恢复）
    this.charPositions = new Map() // 位置索引到字符的映射
    this.matchedPairs = new Set() // 已匹配成功的格子索引集合
    this.selectedCells = [] // 当前选中的两个格子索引 [index1, index2]
    this.totalPairs = 0 // 总配对数
    
    // 统计
    this.totalAttempts = 0 // 总尝试次数
    this.successfulMatches = 0 // 成功匹配次数
    
    // 计时器
    this.timer = {
      startAt: 0,
      elapsedMs: 0,
      isRunning: false,
      pausedAt: 0,
      pausedDuration: 0
    }
    this.observeCountdown = 0 // 观察倒计时
    this.observeTimer = null // 观察倒计时定时器
    this.animationFrameId = null
    this.matchCheckTimer = null // 用于延迟检查匹配结果
    
    // Canvas 相关
    this.canvas = null
    this.ctx = null
    this.cellSize = 0
    this.gap = 6
    this.hoveredCellIndex = null
    this.resizeHandler = null
    this.mouseMoveHandler = null
    this.mouseLeaveHandler = null
    this.clickHandler = null
    
    // 回调函数
    this.onStatusChange = options.onStatusChange || (() => {})
    this.onTimerUpdate = options.onTimerUpdate || (() => {})
    this.onAccuracyUpdate = options.onAccuracyUpdate || (() => {})
    this.onCompletionUpdate = options.onCompletionUpdate || (() => {})
    this.onGameComplete = options.onGameComplete || (() => {})
    this.onObserveCountdownChange = options.onObserveCountdownChange || (() => {})
    
    // 初始化
    this.init()
  }
  
  /**
   * 初始化 Canvas
   */
  init() {
    this.canvas = document.getElementById(this.canvasId)
    if (!this.canvas) {
      console.error(`Canvas with id "${this.canvasId}" not found`)
      return
    }
    
    this.ctx = this.canvas.getContext('2d')
    if (!this.ctx) {
      console.error('Failed to get 2D context from canvas')
      return
    }
    
    // 监听窗口大小变化
    this.updateCanvasSize()
    this.resizeHandler = () => this.updateCanvasSize()
    window.addEventListener('resize', this.resizeHandler)
    
    // 监听鼠标事件
    this.mouseMoveHandler = (e) => this.handleMouseMove(e)
    this.mouseLeaveHandler = () => {
      this.hoveredCellIndex = null
      this.render()
    }
    this.clickHandler = (e) => this.handleCanvasClick(e)
    
    this.canvas.addEventListener('mousemove', this.mouseMoveHandler)
    this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler)
    this.canvas.addEventListener('click', this.clickHandler)
    
    // 开始动画循环
    this.startAnimationLoop()
  }
  
  /**
   * 启动动画循环
   */
  startAnimationLoop() {
    const animate = () => {
      if (this.timer.isRunning && this.status === 'playing') {
        const now = performance.now()
        this.timer.elapsedMs = now - this.timer.startAt - this.timer.pausedDuration
        this.onTimerUpdate(this.timer.elapsedMs)
      }
      this.render()
      this.animationFrameId = requestAnimationFrame(animate)
    }
    animate()
  }
  
  /**
   * 更新画布大小
   */
  updateCanvasSize() {
    if (!this.canvas) return
    
    const container = this.canvas.parentElement
    if (!container) return
    
    const maxSize = Math.min(500, container.clientWidth - 40)
    const totalGap = this.gap * (this.gridSize - 1)
    this.cellSize = Math.floor((maxSize - totalGap) / this.gridSize)
    
    const canvasSize = this.cellSize * this.gridSize + totalGap
    this.canvas.width = canvasSize
    this.canvas.height = canvasSize
    this.canvas.style.width = `${canvasSize}px`
    this.canvas.style.height = `${canvasSize}px`
    
    if (this.charPositions.size > 0) {
      this.render()
    }
  }
  
  /**
   * 生成字符池（数字 0-9 和小写字母 a-z）
   */
  generateCharPool() {
    const numbers = Array.from({ length: 10 }, (_, i) => String(i)) // 0-9
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)) // a-z
    return [...numbers, ...letters] // 总共 36 个字符
  }
  
  /**
   * 生成随机字符位置（确保所有字符都是成对出现）
   */
  generateCharPositions() {
    const total = this.gridSize * this.gridSize
    const charPool = this.generateCharPool()
    
    // 确保格子数是偶数，才能完全配对
    const maxPairs = Math.floor(total / 2)
    const actualPairs = Math.min(maxPairs, charPool.length)
    
    // 随机选择字符（每个字符出现两次，形成配对）
    const shuffledChars = [...charPool].sort(() => Math.random() - 0.5).slice(0, actualPairs)
    
    // 随机选择位置
    const available = Array.from({ length: total }, (_, i) => i)
    
    // 创建位置到字符的映射
    const positionMap = new Map()
    
    // 为每个选中的字符分配2个位置（配对）
    for (const char of shuffledChars) {
      if (available.length < 2) break
      
      // 随机选择2个位置
      const idx1 = Math.floor(Math.random() * available.length)
      const pos1 = available[idx1]
      available.splice(idx1, 1)
      
      const idx2 = Math.floor(Math.random() * available.length)
      const pos2 = available[idx2]
      available.splice(idx2, 1)
      
      positionMap.set(pos1, char)
      positionMap.set(pos2, char)
    }
    
    return positionMap
  }
  
  /**
   * 获取单元格的坐标和尺寸
   */
  getCellRect(index) {
    const row = Math.floor(index / this.gridSize)
    const col = index % this.gridSize
    const x = col * (this.cellSize + this.gap)
    const y = row * (this.cellSize + this.gap)
    return { x, y, width: this.cellSize, height: this.cellSize }
  }
  
  /**
   * 根据鼠标位置获取单元格索引
   */
  getCellIndexFromPoint(x, y) {
    const rect = this.canvas.getBoundingClientRect()
    const canvasX = x - rect.left
    const canvasY = y - rect.top
    
    const col = Math.floor(canvasX / (this.cellSize + this.gap))
    const row = Math.floor(canvasY / (this.cellSize + this.gap))
    
    if (col < 0 || col >= this.gridSize || row < 0 || row >= this.gridSize) {
      return null
    }
    
    // 检查是否在单元格内部（排除间隙）
    const cellX = col * (this.cellSize + this.gap)
    const cellY = row * (this.cellSize + this.gap)
    
    if (canvasX < cellX || canvasX > cellX + this.cellSize ||
        canvasY < cellY || canvasY > cellY + this.cellSize) {
      return null
    }
    
    return row * this.gridSize + col
  }
  
  /**
   * 处理鼠标移动
   */
  handleMouseMove(e) {
    if (this.status !== 'playing' && this.status !== 'observing') {
      this.hoveredCellIndex = null
      return
    }
    
    const index = this.getCellIndexFromPoint(e.clientX, e.clientY)
    if (this.hoveredCellIndex !== index) {
      this.hoveredCellIndex = index
      this.render()
    }
  }
  
  /**
   * 处理画布点击
   */
  handleCanvasClick(e) {
    if (this.status !== 'playing') return
    
    const index = this.getCellIndexFromPoint(e.clientX, e.clientY)
    if (index !== null) {
      this.handleCellClick(index)
    }
  }
  
  /**
   * 获取单元格样式（根据状态）
   */
  getCellStyle(index, char, isHovered, isSelected, isMatched) {
    // 观察模式下，显示所有字符
    if (this.status === 'observing' || this.isObserving) {
      if (char && char !== '') {
        return {
          fillStyle: 'rgba(255, 215, 0, 0.15)',
          strokeStyle: 'rgba(255, 215, 0, 0.4)'
        }
      }
      return {
        fillStyle: 'rgba(0, 0, 0, 0.5)',
        strokeStyle: 'rgba(255, 255, 255, 0.08)'
      }
    }
    
    // 已匹配的格子
    if (isMatched) {
      return {
        fillStyle: 'rgba(16, 37, 27, 0.6)',
        strokeStyle: 'rgba(29, 209, 161, 0.6)'
      }
    }
    
    // 当前选中的格子
    if (isSelected) {
      return {
        fillStyle: 'rgba(255, 215, 0, 0.2)',
        strokeStyle: 'rgba(255, 215, 0, 0.6)'
      }
    }
    
    // 悬停状态
    if (isHovered && !isMatched) {
      return {
        fillStyle: 'rgba(255, 215, 0, 0.1)',
        strokeStyle: 'rgba(255, 215, 0, 0.3)'
      }
    }
    
    // 默认状态
    return {
      fillStyle: 'rgba(0, 0, 0, 0.5)',
      strokeStyle: 'rgba(255, 255, 255, 0.08)'
    }
  }
  
  /**
   * 绘制圆角矩形
   */
  drawRoundedRect(rect, radius) {
    this.ctx.beginPath()
    this.ctx.moveTo(rect.x + radius, rect.y)
    this.ctx.lineTo(rect.x + rect.width - radius, rect.y)
    this.ctx.quadraticCurveTo(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + radius)
    this.ctx.lineTo(rect.x + rect.width, rect.y + rect.height - radius)
    this.ctx.quadraticCurveTo(rect.x + rect.width, rect.y + rect.height, rect.x + rect.width - radius, rect.y + rect.height)
    this.ctx.lineTo(rect.x + radius, rect.y + rect.height)
    this.ctx.quadraticCurveTo(rect.x, rect.y + rect.height, rect.x, rect.y + rect.height - radius)
    this.ctx.lineTo(rect.x, rect.y + radius)
    this.ctx.quadraticCurveTo(rect.x, rect.y, rect.x + radius, rect.y)
    this.ctx.closePath()
  }
  
  /**
   * 绘制单元格文本内容
   */
  drawCellContent(rect, index, char, isSelected, isMatched) {
    // 观察模式下，显示所有字符
    if (this.status === 'observing' || this.isObserving) {
      if (char && char !== '') {
        this.ctx.fillStyle = '#ffd700'
        this.ctx.font = '24px "Microsoft YaHei", "SimHei", Arial, sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.shadowColor = '#ffd700'
        this.ctx.shadowBlur = 8
        this.ctx.fillText(char, rect.x + rect.width / 2, rect.y + rect.height / 2)
        this.ctx.shadowBlur = 0
      }
      return
    }
    
    // 只有选中或已匹配的格子才显示字符
    if (isSelected || isMatched) {
      if (char && char !== '') {
        this.ctx.fillStyle = isMatched ? '#1dd1a1' : '#ffd700'
        this.ctx.font = '24px "Microsoft YaHei", "SimHei", Arial, sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        if (!isMatched) {
          this.ctx.shadowColor = '#ffd700'
          this.ctx.shadowBlur = 8
        }
        this.ctx.fillText(char, rect.x + rect.width / 2, rect.y + rect.height / 2)
        this.ctx.shadowBlur = 0
      }
    }
  }
  
  /**
   * 绘制单元格
   */
  drawCell(index, char) {
    const rect = this.getCellRect(index)
    const isHovered = this.hoveredCellIndex === index
    const isSelected = this.selectedCells.includes(index)
    const isMatched = this.matchedPairs.has(index)
    
    this.ctx.save()
    
    // 获取样式并绘制背景
    const style = this.getCellStyle(index, char, isHovered, isSelected, isMatched)
    this.ctx.fillStyle = style.fillStyle
    this.ctx.strokeStyle = style.strokeStyle
    
    // 绘制圆角矩形
    this.drawRoundedRect(rect, 12)
    this.ctx.fill()
    this.ctx.lineWidth = isSelected || isMatched ? 2 : 1
    this.ctx.stroke()
    
    // 绘制文本
    this.drawCellContent(rect, index, char, isSelected, isMatched)
    
    this.ctx.restore()
  }
  
  /**
   * 渲染网格
   */
  render() {
    if (!this.canvas || !this.ctx) return
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // 绘制所有单元格
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const char = this.charPositions.get(i) || ''
      this.drawCell(i, char)
    }
  }
  
  /**
   * 处理单元格点击
   */
  handleCellClick(index) {
    if (this.status !== 'playing') return
    
    // 如果已经匹配，不能点击
    if (this.matchedPairs.has(index)) return
    
    // 如果已经选中，不能重复点击
    if (this.selectedCells.includes(index)) return
    
    // 如果已经选中了两个，等待匹配结果
    if (this.selectedCells.length >= 2) return
    
    // 添加到选中列表
    this.selectedCells.push(index)
    this.render()
    
    // 如果选中了两个格子，检查是否匹配
    if (this.selectedCells.length === 2) {
      this.checkMatch()
    }
  }
  
  /**
   * 检查两个选中的格子是否匹配
   */
  checkMatch() {
    const [index1, index2] = this.selectedCells
    const char1 = this.charPositions.get(index1)
    const char2 = this.charPositions.get(index2)
    
    this.totalAttempts++
    
    // 延迟检查，让用户看到两个选中的格子
    this.matchCheckTimer = setTimeout(() => {
      if (char1 === char2 && char1 !== undefined && char2 !== undefined) {
        // 匹配成功
        this.matchedPairs.add(index1)
        this.matchedPairs.add(index2)
        this.successfulMatches++
        
        // 清空选中列表
        this.selectedCells = []
        
        // 更新完成度
        const completion = (this.matchedPairs.size / (this.totalPairs * 2)) * 100
        this.onCompletionUpdate(completion)
        
        // 更新准确率
        const accuracy = this.totalAttempts > 0 
          ? (this.successfulMatches / this.totalAttempts) * 100 
          : 0
        this.onAccuracyUpdate(accuracy)
        
        // 检查是否完成所有配对
        if (this.matchedPairs.size >= this.totalPairs * 2) {
          // 使用 setTimeout 确保渲染完成后再完成游戏
          setTimeout(() => {
            if (this.status === 'playing') {
              this.finalizeGame()
            }
          }, 100)
        }
      } else {
        // 匹配失败，清空选中列表
        this.selectedCells = []
        
        // 更新准确率
        const accuracy = this.totalAttempts > 0 
          ? (this.successfulMatches / this.totalAttempts) * 100 
          : 0
        this.onAccuracyUpdate(accuracy)
      }
      
      this.render()
      this.matchCheckTimer = null
    }, 800) // 延迟 800ms 让用户看到结果
  }
  
  /**
   * 开始观察阶段
   */
  startObserving() {
    this.status = 'observing'
    this.isObserving = true
    this.observeCountdown = this.observeDuration
    this.onStatusChange(this.status)
    this.onObserveCountdownChange(this.observeCountdown)
    this.render()
    
    // 观察倒计时
    this.observeTimer = setInterval(() => {
      this.observeCountdown--
      this.onObserveCountdownChange(this.observeCountdown)
      
      if (this.observeCountdown <= 0) {
        clearInterval(this.observeTimer)
        this.observeTimer = null
        this.startGame()
      }
    }, 1000)
  }
  
  /**
   * 切换观察/游戏模式
   */
  toggleObserveMode() {
    if (this.status === 'observing') {
      // 从观察模式切换到游戏模式
      if (this.observeTimer) {
        clearInterval(this.observeTimer)
        this.observeTimer = null
      }
      // 恢复之前的状态
      if (this.previousStatus === 'paused') {
        this.status = 'paused'
        this.isObserving = false
        this.onStatusChange(this.status)
      } else {
        this.startGame()
      }
      this.previousStatus = null
    } else if (this.status === 'playing') {
      // 从游戏模式切换到观察模式（暂停游戏）
      this.previousStatus = 'playing'
      this.pauseGame()
      this.isObserving = true
      this.status = 'observing'
      this.onStatusChange(this.status)
      this.render()
    } else if (this.status === 'paused') {
      // 从暂停状态切换到观察模式
      this.previousStatus = 'paused'
      this.isObserving = true
      this.status = 'observing'
      this.onStatusChange(this.status)
      this.render()
    } else if (this.status === 'idle') {
      // 从空闲状态开始观察
      this.startObserving()
    }
  }
  
  /**
   * 开始游戏
   */
  startGame() {
    this.status = 'playing'
    this.isObserving = false
    this.onStatusChange(this.status)
    
    // 开始计时
    if (!this.timer.isRunning) {
      this.timer.startAt = performance.now()
      this.timer.elapsedMs = 0
      this.timer.pausedDuration = 0
      this.timer.isRunning = true
    }
    
    this.render()
  }
  
  /**
   * 暂停游戏
   */
  pauseGame() {
    if (this.status !== 'playing') return
    
    this.status = 'paused'
    this.timer.isRunning = false
    this.timer.pausedAt = performance.now()
    this.onStatusChange(this.status)
  }
  
  /**
   * 继续游戏
   */
  resumeGame() {
    if (this.status !== 'paused') return
    
    // 累计暂停时间
    if (this.timer.pausedAt > 0) {
      const pauseDuration = performance.now() - this.timer.pausedAt
      this.timer.pausedDuration += pauseDuration
      this.timer.pausedAt = 0
    }
    
    this.status = 'playing'
    this.timer.isRunning = true
    this.onStatusChange(this.status)
  }
  
  /**
   * 完成游戏
   */
  finalizeGame() {
    if (this.status === 'completed') {
      console.warn('游戏已经完成，跳过重复完成')
      return
    }
    
    this.timer.isRunning = false
    this.status = 'completed'
    this.onStatusChange(this.status)
    
    // 计算准确率，确保是有效数字
    let accuracy = 0
    if (this.totalAttempts > 0) {
      accuracy = (this.successfulMatches / this.totalAttempts) * 100
    }
    
    // 确保准确率在有效范围内
    if (isNaN(accuracy) || !isFinite(accuracy)) {
      accuracy = 0
    }
    accuracy = Math.max(0, Math.min(100, accuracy))
    
    // 确保 durationMs 是有效数字
    const durationMs = Math.max(0, Math.round(this.timer.elapsedMs))
    
    const gameData = {
      gridSize: this.gridSize,
      durationMs: durationMs,
      accuracy: accuracy,
      totalPairs: this.totalPairs,
      successfulMatches: this.successfulMatches,
      totalAttempts: this.totalAttempts
    }
    
    console.log('游戏完成，准备提交数据：', gameData)
    
    // 使用 setTimeout 确保状态更新后再触发回调
    setTimeout(() => {
      if (this.onGameComplete) {
        this.onGameComplete(gameData)
      }
    }, 100)
  }
  
  /**
   * 重置游戏
   */
  resetGame() {
    // 停止计时器
    this.timer.isRunning = false
    if (this.matchCheckTimer) {
      clearTimeout(this.matchCheckTimer)
      this.matchCheckTimer = null
    }
    if (this.observeTimer) {
      clearInterval(this.observeTimer)
      this.observeTimer = null
    }
    
    // 重置状态
    this.status = 'idle'
    this.isObserving = false
    this.timer.elapsedMs = 0
    this.timer.pausedDuration = 0
    this.timer.pausedAt = 0
    this.observeCountdown = 0
    this.selectedCells = []
    this.matchedPairs.clear()
    this.hoveredCellIndex = null
    this.totalAttempts = 0
    this.successfulMatches = 0
    
    // 生成新的字符位置
    this.charPositions = this.generateCharPositions()
    this.totalPairs = this.charPositions.size / 2
    
    // 更新画布大小并渲染
    this.updateCanvasSize()
    
    // 更新状态
    this.onStatusChange(this.status)
    this.onObserveCountdownChange(0)
    this.onTimerUpdate(0)
    this.onAccuracyUpdate(0)
    this.onCompletionUpdate(0)
    
    // 自动开始观察阶段
    setTimeout(() => {
      if (this.status === 'idle') {
        this.startObserving()
      }
    }, 300)
  }
  
  /**
   * 设置网格大小
   */
  setGridSize(size) {
    this.gridSize = Math.min(8, Math.max(3, Math.floor(size)))
    this.resetGame()
  }
  
  /**
   * 设置观察时间
   */
  setObserveDuration(duration) {
    this.observeDuration = Math.max(1, Math.min(60, Math.floor(duration)))
  }
  
  /**
   * 获取游戏状态
   */
  getStatus() {
    return {
      status: this.status,
      gridSize: this.gridSize,
      elapsedMs: this.timer.elapsedMs,
      totalPairs: this.totalPairs,
      matchedPairs: this.matchedPairs.size / 2,
      totalAttempts: this.totalAttempts,
      successfulMatches: this.successfulMatches,
      accuracy: this.totalAttempts > 0 
        ? (this.successfulMatches / this.totalAttempts) * 100 
        : 0,
      completion: this.totalPairs > 0 
        ? (this.matchedPairs.size / (this.totalPairs * 2)) * 100 
        : 0
    }
  }
  
  /**
   * 销毁游戏实例
   */
  destroy() {
    if (this.matchCheckTimer) {
      clearTimeout(this.matchCheckTimer)
      this.matchCheckTimer = null
    }
    
    if (this.observeTimer) {
      clearInterval(this.observeTimer)
      this.observeTimer = null
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }
    
    if (this.canvas) {
      if (this.mouseMoveHandler) {
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler)
      }
      if (this.mouseLeaveHandler) {
        this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler)
      }
      if (this.clickHandler) {
        this.canvas.removeEventListener('click', this.clickHandler)
      }
    }
  }
}
