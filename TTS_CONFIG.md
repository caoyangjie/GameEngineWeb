# 讯飞 TTS 配置说明

## 环境变量配置

在项目根目录创建 `.env` 文件，配置以下环境变量：

```bash
# 讯飞 TTS 配置
VITE_XUNFEI_TTS_APPID=your_appid_here
VITE_XUNFEI_TTS_API_SECRET=your_api_secret_here
VITE_XUNFEI_TTS_API_KEY=your_api_key_here
VITE_XUNFEI_TTS_VCN=x4_yezi
```

## 获取 API 凭证

1. 访问 [讯飞开放平台](https://www.xfyun.cn/)
2. 登录后进入"控制台" -> "我的应用"
3. 创建或选择"在线语音合成（流式版）"应用
4. 获取以下信息：
   - **appid**: 应用 ID
   - **apiSecret**: API Secret
   - **apiKey**: API Key

## 发音人选项

- `x4_yezi`: 叶子（默认）
- `xiaoyan`: 小燕
- `aisjiuxu`: 九旭
- 更多发音人请参考讯飞开放平台文档

## 启动方式

### 方式一：使用 .env 文件（推荐）

1. 在项目根目录创建 `.env` 文件
2. 填入上述环境变量
3. 运行 `npm run dev` 或 `npm run build`

### 方式二：使用命令行参数

```bash
# 开发环境
VITE_XUNFEI_TTS_APPID=your_appid \
VITE_XUNFEI_TTS_API_SECRET=your_secret \
VITE_XUNFEI_TTS_API_KEY=your_key \
VITE_XUNFEI_TTS_VCN=x4_yezi \
npm run dev

# 生产环境构建
VITE_XUNFEI_TTS_APPID=your_appid \
VITE_XUNFEI_TTS_API_SECRET=your_secret \
VITE_XUNFEI_TTS_API_KEY=your_key \
VITE_XUNFEI_TTS_VCN=x4_yezi \
npm run build
```

## 注意事项

1. `.env` 文件不应提交到版本控制系统（已在 .gitignore 中）
2. 如果未配置 TTS 参数，系统会自动降级为手动切换模式（无语音播报）
3. 确保浏览器支持 Web Audio API（现代浏览器均支持）

## 故障排查

- **无声音**: 检查浏览器控制台是否有错误，确认 Web Audio API 是否被浏览器阻止
- **连接失败**: 检查 API 凭证是否正确，网络是否正常
- **音频播放不连续**: 确保浏览器允许自动播放音频（某些浏览器需要用户交互后才能播放）

