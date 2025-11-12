# 西域旅 - 游戏登录页面

这是一个基于 Vue 3 开发的游戏登录页面，具有精美的视觉效果和动画效果。

## 功能特性

- 🎨 精美的深色主题设计
- 🌌 动态星空和银河背景
- 🏯 传统东亚建筑风格装饰
- 📱 响应式设计，支持移动端
- ✨ 流畅的动画效果
- 🔐 完整的登录表单功能

## 技术栈

- Vue 3 (Composition API)
- Vite
- CSS3 (动画和渐变)

## 项目结构

```
GameEngineWeb/
├── index.html          # HTML 入口文件
├── package.json        # 项目配置和依赖
├── vite.config.js     # Vite 构建配置
├── README.md          # 项目说明文档
└── src/
    ├── main.js        # Vue 应用入口
    ├── App.vue        # 根组件
    ├── components/
    │   └── LoginPage.vue  # 登录页面组件
    └── assets/
        └── styles/
            └── main.css   # 全局样式
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 页面功能

### 登录表单

- **电子邮箱输入**: 支持邮箱格式验证
- **密码输入**: 支持显示/隐藏密码切换
- **验证码**: 可刷新的4位数字验证码
- **忘记密码**: 忘记密码链接
- **登录按钮**: 渐变色按钮，带悬停效果
- **注册链接**: 跳转到注册页面

### 视觉效果

- **动态星空**: 闪烁的星星背景
- **旋转银河**: 中央旋转的银河效果
- **山脉剪影**: 底部山脉轮廓
- **浮动云层**: 左右两侧的浮动云朵
- **建筑灯光**: 建筑结构上的闪烁灯光
- **语言选择器**: 右上角的语言切换功能

## 自定义配置

### 修改端口

在 `vite.config.js` 中修改 `server.port` 配置：

```javascript
server: {
  port: 3000,  // 修改为你想要的端口
}
```

### 修改主题颜色

在 `LoginPage.vue` 的 `<style>` 部分修改颜色变量：

- Logo 颜色: `.logo-text` 中的 `color` 和 `text-shadow`
- 按钮渐变: `.login-button` 中的 `background` 渐变
- 输入框背景: `.input-group` 中的 `background`

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 开发说明

本项目使用 Vue 3 的 Composition API，所有组件都使用 `<script setup>` 语法。

### 添加新功能

1. 在 `src/components/` 目录下创建新组件
2. 在 `LoginPage.vue` 中导入并使用
3. 根据需要添加样式和逻辑

## 许可证

MIT License

