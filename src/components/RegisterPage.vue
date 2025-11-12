<template>
  <div class="login-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="meteors">
        <div class="meteor meteor-1"></div>
        <div class="meteor meteor-2"></div>
        <div class="meteor meteor-3"></div>
      </div>
      <div class="galaxy"></div>
      <div class="heavenly-palace"></div>
      <div class="golden-staff-light"></div>
      <div class="mountains"></div>
      <div class="flame-mountain"></div>
      <div class="clouds">
        <div class="cloud cloud-left"></div>
        <div class="cloud cloud-right"></div>
        <div class="cloud golden-cloud-1"></div>
        <div class="cloud golden-cloud-2"></div>
        <div class="cloud golden-cloud-3"></div>
      </div>
      <div class="particles">
        <div class="particle" v-for="n in 30" :key="n" :style="getParticleStyle(n)"></div>
      </div>
    </div>

    <!-- 建筑结构 -->
    <div class="temple-structure">
      <div class="temple-lights">
        <div class="light light-1"></div>
        <div class="light light-2"></div>
        <div class="light light-3"></div>
        <div class="light light-4"></div>
        <div class="light light-5"></div>
        <div class="light light-6"></div>
      </div>
    </div>

    <!-- 语言选择器 -->
    <div class="language-selector">
      <span class="language-text">简体中文</span>
      <span class="chevron">▼</span>
      <span class="flag">🇨🇳</span>
    </div>

    <!-- 登录表单 - 南天门 -->
    <div class="south-heaven-gate">
      <!-- 门楣装饰 -->
      <div class="gate-lintel">
        <div class="lintel-decoration lintel-left"></div>
        <div class="lintel-center">
          <div class="cloud-pattern"></div>
        </div>
        <div class="lintel-decoration lintel-right"></div>
      </div>

      <!-- 门柱 -->
      <div class="gate-pillars">
        <div class="pillar pillar-left">
          <div class="pillar-decoration"></div>
          <div class="pillar-base"></div>
        </div>
        <div class="pillar pillar-right">
          <div class="pillar-decoration"></div>
          <div class="pillar-base"></div>
        </div>
      </div>

      <!-- 仙气效果 -->
      <div class="immortal-mist">
        <div class="mist mist-1"></div>
        <div class="mist mist-2"></div>
        <div class="mist mist-3"></div>
      </div>

      <!-- 注册表单容器 -->
      <div class="login-form-container">
        <!-- 游戏Logo -->
        <div class="game-logo">
          <div class="logo-glow"></div>
          <h1 class="logo-text">西域旅</h1>
          <p class="logo-subtitle">挑战边界 • 超越极限</p>
        </div>

        <!-- 注册标题 -->
        <h2 class="register-title">注册</h2>

        <!-- 表单 -->
        <form class="login-form" @submit.prevent="handleRegister">
          <!-- 名字 -->
          <div class="input-group">
            <div class="input-icon name-icon">👤</div>
            <input
              type="text"
              v-model="formData.firstName"
              placeholder="名字"
              class="form-input"
              required
            />
          </div>

          <!-- 姓氏 -->
          <div class="input-group">
            <div class="input-icon name-icon">👤</div>
            <input
              type="text"
              v-model="formData.lastName"
              placeholder="姓氏"
              class="form-input"
              required
            />
          </div>

          <!-- 电子邮箱 -->
          <div class="input-group">
            <div class="input-icon email-icon">✉</div>
            <input
              type="email"
              v-model="formData.email"
              placeholder="电子邮箱"
              class="form-input"
              required
            />
          </div>

          <!-- 招聘者用户ID -->
          <div class="input-group">
            <div class="input-icon recruiter-icon">📢</div>
            <input
              type="text"
              v-model="formData.recruiterId"
              placeholder="招聘者用户ID"
              class="form-input"
            />
          </div>

          <!-- 密码 -->
          <div class="input-group">
            <div class="input-icon password-icon">🔑</div>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.password"
              placeholder="密码"
              class="form-input"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '🚫' }}
            </button>
          </div>

          <!-- 确认密码 -->
          <div class="input-group">
            <div class="input-icon password-icon">🔑</div>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="formData.confirmPassword"
              placeholder="确认密码"
              class="form-input"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '👁️' : '🚫' }}
            </button>
          </div>

          <!-- 验证码 -->
          <div class="input-group">
            <div class="input-icon code-icon">🏮</div>
            <input
              type="text"
              v-model="formData.verificationCode"
              placeholder="验证码"
              class="form-input verification-input"
              required
            />
            <div class="verification-code">
              <span class="code-text">{{ verificationCode }}</span>
              <button
                type="button"
                class="refresh-code"
                @click="refreshVerificationCode"
              >
                🔄
              </button>
            </div>
          </div>

          <!-- 注册按钮 -->
          <button type="submit" class="login-button">注册</button>

          <!-- 返回登录链接 -->
          <div class="register-link">
            <a href="#" @click.prevent="goToLogin" class="register-text">已有账户?登录</a>
          </div>
        </form>
      </div>

      <!-- 门楣底部装饰 -->
      <div class="gate-bottom-decoration">
        <div class="bottom-pattern"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from '../composables/useRouter.js'

const router = useRouter()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const verificationCode = ref('2318')

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  recruiterId: '',
  password: '',
  confirmPassword: '',
  verificationCode: ''
})

const refreshVerificationCode = () => {
  verificationCode.value = Math.floor(1000 + Math.random() * 9000).toString()
}

const handleRegister = () => {
  // 验证密码是否匹配
  if (formData.password !== formData.confirmPassword) {
    alert('密码和确认密码不匹配！')
    return
  }
  
  console.log('注册数据:', formData)
  // 这里可以添加实际的注册逻辑
  alert('注册成功！')
}

const goToLogin = () => {
  router.goToLogin()
}

const getParticleStyle = (index) => {
  const delay = Math.random() * 8
  const duration = 4 + Math.random() * 6
  const size = 2 + Math.random() * 5
  const left = Math.random() * 100
  const bottom = Math.random() * 20
  return {
    left: `${left}%`,
    bottom: `${bottom}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
}

/* 背景层 */
.background {
  position: absolute;
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
    #1a0a2e 0%,
    #2d1b4e 15%,
    #4a2c6a 30%,
    #6b3d8a 45%,
    #8b4ca8 60%,
    #5a2d5a 75%,
    #3d1f3d 90%,
    #1a0a1a 100%
  );
  animation: skyShift 20s ease-in-out infinite alternate;
}

@keyframes skyShift {
  0% {
    background: linear-gradient(
      to bottom,
      #1a0a2e 0%,
      #2d1b4e 15%,
      #4a2c6a 30%,
      #6b3d8a 45%,
      #8b4ca8 60%,
      #5a2d5a 75%,
      #3d1f3d 90%,
      #1a0a1a 100%
    );
  }
  100% {
    background: linear-gradient(
      to bottom,
      #2d1b4e 0%,
      #4a2c6a 15%,
      #6b3d8a 30%,
      #8b4ca8 45%,
      #a55db8 60%,
      #6b3d6b 75%,
      #4a2d4a 90%,
      #2d1a2d 100%
    );
  }
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(3px 3px at 20% 30%, #ffd700, transparent),
    radial-gradient(2px 2px at 60% 70%, #fff, transparent),
    radial-gradient(2px 2px at 50% 50%, #ff6b9d, transparent),
    radial-gradient(1px 1px at 80% 10%, #fff, transparent),
    radial-gradient(3px 3px at 90% 40%, #ffd700, transparent),
    radial-gradient(2px 2px at 33% 60%, #ff6b9d, transparent),
    radial-gradient(4px 4px at 10% 80%, #ffd700, transparent),
    radial-gradient(1px 1px at 40% 90%, #fff, transparent),
    radial-gradient(2px 2px at 70% 20%, #ff6b9d, transparent),
    radial-gradient(2px 2px at 15% 50%, #fff, transparent),
    radial-gradient(3px 3px at 45% 25%, #ffd700, transparent),
    radial-gradient(2px 2px at 75% 65%, #ff6b9d, transparent),
    radial-gradient(1px 1px at 25% 80%, #fff, transparent),
    radial-gradient(3px 3px at 85% 15%, #ffd700, transparent),
    radial-gradient(2px 2px at 55% 45%, #fff, transparent);
  background-repeat: repeat;
  background-size: 200% 200%;
  animation: twinkle 2s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* 流星 */
.meteors {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.meteor {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, transparent, #fff, transparent);
  box-shadow: 0 0 10px #fff, 0 0 20px #ffd700;
  border-radius: 50%;
}

.meteor-1 {
  top: -100px;
  left: 20%;
  animation: meteor-fall 8s linear infinite;
  transform: rotate(-45deg);
}

.meteor-2 {
  top: -100px;
  left: 60%;
  animation: meteor-fall 12s linear infinite 3s;
  transform: rotate(-45deg);
}

.meteor-3 {
  top: -100px;
  left: 80%;
  animation: meteor-fall 10s linear infinite 6s;
  transform: rotate(-45deg);
}

@keyframes meteor-fall {
  0% {
    top: -100px;
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100vh;
    opacity: 0;
  }
}

.galaxy {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 500px;
  background: 
    radial-gradient(
      ellipse at center,
      rgba(255, 215, 0, 0.4) 0%,
      rgba(255, 107, 157, 0.3) 20%,
      rgba(138, 43, 226, 0.3) 40%,
      rgba(75, 0, 130, 0.2) 60%,
      transparent 80%
    );
  border-radius: 50%;
  filter: blur(50px);
  animation: rotate 25s linear infinite;
  z-index: 2;
}

@keyframes rotate {
  from { transform: translateX(-50%) rotate(0deg); }
  to { transform: translateX(-50%) rotate(360deg); }
}

/* 天宫 */
.heavenly-palace {
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 300px;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(255, 215, 0, 0.1) 50%, transparent 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 300'%3E%3Cpath d='M100,300 L100,200 L150,180 L200,200 L250,180 L300,200 L350,180 L400,200 L450,180 L500,200 L550,180 L600,200 L650,180 L700,200 L700,300 Z' fill='rgba(255,215,0,0.15)'/%3E%3Cpath d='M120,180 L150,160 L180,180 L220,160 L260,180 L300,160 L340,180 L380,160 L420,180 L460,160 L500,180 L540,160 L580,180 L620,160 L660,180 L680,160 L680,180 L120,180 Z' fill='rgba(255,215,0,0.2)'/%3E%3Cpath d='M140,160 L170,140 L200,160 L240,140 L280,160 L320,140 L360,160 L400,140 L440,160 L480,140 L520,160 L560,140 L600,160 L640,140 L660,160 L660,180 L140,180 Z' fill='rgba(255,215,0,0.25)'/%3E%3Cpath d='M300,140 L350,120 L400,140 L400,160 L300,160 Z' fill='rgba(255,215,0,0.3)'/%3E%3C/svg%3E") no-repeat center;
  background-size: 100% 100%;
  opacity: 0.6;
  filter: blur(2px);
  z-index: 2;
  animation: palaceGlow 4s ease-in-out infinite alternate;
}

@keyframes palaceGlow {
  0% {
    opacity: 0.4;
    filter: blur(2px);
  }
  100% {
    opacity: 0.8;
    filter: blur(1px);
  }
}

/* 金箍棒光效 */
.golden-staff-light {
  position: absolute;
  top: 30%;
  right: 15%;
  width: 4px;
  height: 200px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 215, 0, 0.8) 20%,
    rgba(255, 215, 0, 1) 50%,
    rgba(255, 215, 0, 0.8) 80%,
    transparent 100%
  );
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.8),
    0 0 40px rgba(255, 215, 0, 0.6),
    0 0 60px rgba(255, 215, 0, 0.4);
  transform: rotate(15deg);
  z-index: 3;
  animation: staffRotate 3s ease-in-out infinite;
}

@keyframes staffRotate {
  0%, 100% {
    transform: rotate(15deg) scaleY(1);
    opacity: 0.8;
  }
  50% {
    transform: rotate(20deg) scaleY(1.1);
    opacity: 1;
  }
}

.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: 
    linear-gradient(to top, #1a0a0a 0%, rgba(139, 0, 0, 0.3) 30%, transparent 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cpath d='M0,400 L200,300 L400,350 L600,250 L800,320 L1000,280 L1200,300 L1200,400 Z' fill='%231a1a1a'/%3E%3Cpath d='M0,400 L150,320 L300,360 L500,280 L700,340 L900,300 L1200,320 L1200,400 Z' fill='%230f0f0f'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.9;
  z-index: 2;
}

/* 火焰山 */
.flame-mountain {
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 300px;
  height: 200px;
  background: 
    radial-gradient(
      ellipse at center bottom,
      rgba(255, 69, 0, 0.6) 0%,
      rgba(255, 140, 0, 0.4) 30%,
      rgba(255, 215, 0, 0.2) 60%,
      transparent 100%
    );
  border-radius: 50% 50% 0 0;
  filter: blur(20px);
  z-index: 3;
  animation: flameFlicker 2s ease-in-out infinite;
}

@keyframes flameFlicker {
  0%, 100% {
    opacity: 0.6;
    transform: scaleY(1) scaleX(1);
  }
  25% {
    opacity: 0.8;
    transform: scaleY(1.1) scaleX(0.95);
  }
  50% {
    opacity: 0.7;
    transform: scaleY(0.95) scaleX(1.05);
  }
  75% {
    opacity: 0.9;
    transform: scaleY(1.05) scaleX(0.98);
  }
}

.clouds {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cloud {
  position: absolute;
  border-radius: 50px;
  filter: blur(30px);
}

.cloud-left {
  width: 300px;
  height: 150px;
  top: 20%;
  left: -50px;
  background: rgba(20, 20, 30, 0.6);
  animation: float-left 15s ease-in-out infinite;
}

.cloud-right {
  width: 350px;
  height: 180px;
  top: 15%;
  right: -50px;
  background: rgba(20, 20, 30, 0.6);
  animation: float-right 18s ease-in-out infinite;
}

/* 筋斗云 */
.golden-cloud-1 {
  width: 200px;
  height: 100px;
  top: 25%;
  left: 10%;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.4) 0%,
    rgba(255, 165, 0, 0.3) 50%,
    rgba(255, 215, 0, 0.2) 100%
  );
  animation: golden-cloud-float 12s ease-in-out infinite;
  z-index: 3;
}

.golden-cloud-2 {
  width: 180px;
  height: 90px;
  top: 40%;
  right: 20%;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.35) 0%,
    rgba(255, 140, 0, 0.25) 50%,
    rgba(255, 215, 0, 0.15) 100%
  );
  animation: golden-cloud-float 15s ease-in-out infinite 3s;
  z-index: 3;
}

.golden-cloud-3 {
  width: 160px;
  height: 80px;
  top: 60%;
  left: 5%;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.3) 0%,
    rgba(255, 165, 0, 0.2) 50%,
    rgba(255, 215, 0, 0.1) 100%
  );
  animation: golden-cloud-float 18s ease-in-out infinite 6s;
  z-index: 3;
}

@keyframes float-left {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(30px) translateY(-20px); }
}

@keyframes float-right {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-30px) translateY(20px); }
}

@keyframes golden-cloud-float {
  0%, 100% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translateX(40px) translateY(-30px) scale(1.1);
    opacity: 0.8;
  }
  50% {
    transform: translateX(20px) translateY(-40px) scale(0.9);
    opacity: 0.7;
  }
  75% {
    transform: translateX(-20px) translateY(-20px) scale(1.05);
    opacity: 0.85;
  }
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: particleFloat 6s ease-in-out infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0) scale(0);
    opacity: 0;
  }
  5% {
    opacity: 0.8;
    transform: translateY(10px) translateX(5px) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translateY(50px) translateX(15px) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateY(calc(100vh - 100px)) translateX(80px) scale(1);
  }
  100% {
    transform: translateY(calc(100vh + 50px)) translateX(100px) scale(0);
    opacity: 0;
  }
}

/* 建筑结构 */
.temple-structure {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 500px;
  z-index: 2;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(20, 15, 10, 0.3) 20%, rgba(15, 10, 5, 0.6) 40%, rgba(10, 5, 0, 0.8) 60%, rgba(5, 0, 0, 0.9) 80%, rgba(0, 0, 0, 1) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 500'%3E%3Cpath d='M100,500 L100,300 L150,280 L200,300 L250,280 L300,300 L350,280 L400,300 L450,280 L500,300 L500,500 Z' fill='%2315100a'/%3E%3Cpath d='M120,280 L150,260 L180,280 L220,260 L260,280 L300,260 L340,280 L380,260 L420,280 L460,260 L480,280 L480,300 L120,300 Z' fill='%230f0a05'/%3E%3Cpath d='M140,260 L170,240 L200,260 L240,240 L280,260 L320,240 L360,260 L400,240 L440,260 L460,240 L460,260 L140,260 Z' fill='%230a0500'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.9;
}

.temple-lights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.light {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ffd700;
  border-radius: 50%;
  box-shadow: 
    0 0 15px #ffd700,
    0 0 30px rgba(255, 215, 0, 0.8),
    0 0 50px rgba(255, 215, 0, 0.5);
  animation: flicker 2s ease-in-out infinite;
}

.light-1 { top: 25%; left: 15%; }
.light-2 { top: 25%; right: 15%; }
.light-3 { top: 35%; left: 25%; }
.light-4 { top: 35%; right: 25%; }
.light-5 { top: 45%; left: 50%; }
.light-6 { top: 20%; left: 50%; }

@keyframes flicker {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

/* 语言选择器 */
.language-selector {
  position: absolute;
  top: 30px;
  right: 40px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.language-text {
  font-weight: 500;
}

.chevron {
  font-size: 10px;
  opacity: 0.8;
}

.flag {
  font-size: 18px;
}

/* 南天门容器 */
.south-heaven-gate {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  width: 550px;
  min-height: 750px;
  text-align: center;
}

/* 门楣 */
.gate-lintel {
  position: relative;
  width: 100%;
  height: 80px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lintel-decoration {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 140, 0, 0.6) 100%);
  border: 2px solid rgba(255, 215, 0, 0.9);
  border-radius: 50%;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.6),
    inset 0 0 20px rgba(255, 215, 0, 0.3);
  position: relative;
  animation: lintelGlow 3s ease-in-out infinite;
}

.lintel-decoration::before {
  content: '☯';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: rgba(255, 215, 0, 1);
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

.lintel-center {
  flex: 1;
  height: 4px;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 215, 0, 0.6) 20%,
    rgba(255, 215, 0, 0.8) 50%,
    rgba(255, 215, 0, 0.6) 80%,
    transparent 100%
  );
  margin: 0 20px;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  position: relative;
}

.cloud-pattern {
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: 24px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 24'%3E%3Cpath d='M0,12 Q50,0 100,12 T200,12' stroke='rgba(255,215,0,0.4)' fill='none' stroke-width='2'/%3E%3C/svg%3E") repeat-x;
  background-size: 200px 24px;
  animation: cloudMove 10s linear infinite;
}

@keyframes cloudMove {
  from { background-position-x: 0; }
  to { background-position-x: 200px; }
}

@keyframes lintelGlow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.6),
      inset 0 0 20px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.9),
      inset 0 0 30px rgba(255, 215, 0, 0.5);
  }
}

/* 门柱 */
.gate-pillars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.pillar {
  position: absolute;
  top: 80px;
  width: 20px;
  height: calc(100% - 80px);
  background: linear-gradient(
    to right,
    rgba(255, 215, 0, 0.3) 0%,
    rgba(255, 215, 0, 0.5) 50%,
    rgba(255, 215, 0, 0.3) 100%
  );
  border-left: 2px solid rgba(255, 215, 0, 0.8);
  border-right: 2px solid rgba(255, 215, 0, 0.8);
  box-shadow: 
    -2px 0 15px rgba(255, 215, 0, 0.4),
    2px 0 15px rgba(255, 215, 0, 0.4);
}

.pillar-left {
  left: -30px;
}

.pillar-right {
  right: -30px;
}

.pillar-decoration {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.8) 0%,
    rgba(255, 140, 0, 0.6) 50%,
    transparent 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.pillar-base {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 30px;
  background: linear-gradient(
    to bottom,
    rgba(255, 215, 0, 0.6) 0%,
    rgba(255, 140, 0, 0.4) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

/* 仙气效果 */
.immortal-mist {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.mist {
  position: absolute;
  background: radial-gradient(
    ellipse,
    rgba(255, 215, 0, 0.15) 0%,
    rgba(255, 140, 0, 0.1) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(30px);
}

.mist-1 {
  width: 200px;
  height: 150px;
  top: 10%;
  left: -50px;
  animation: mistFloat1 8s ease-in-out infinite;
}

.mist-2 {
  width: 180px;
  height: 120px;
  top: 60%;
  right: -40px;
  animation: mistFloat2 10s ease-in-out infinite 2s;
}

.mist-3 {
  width: 160px;
  height: 100px;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  animation: mistFloat3 12s ease-in-out infinite 4s;
}

@keyframes mistFloat1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(30px, -20px) scale(1.2);
    opacity: 0.5;
  }
}

@keyframes mistFloat2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-25px, 15px) scale(1.1);
    opacity: 0.5;
  }
}

@keyframes mistFloat3 {
  0%, 100% {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateX(-50%) translateY(-15px) scale(1.15);
    opacity: 0.5;
  }
}

/* 登录表单容器 */
.login-form-container {
  position: relative;
  z-index: 3;
  width: 100%;
  padding: 30px 40px;
  background: linear-gradient(
    to bottom,
    rgba(255, 215, 0, 0.05) 0%,
    rgba(255, 140, 0, 0.08) 50%,
    rgba(255, 215, 0, 0.05) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 10px;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(5px);
}

/* 门楣底部装饰 */
.gate-bottom-decoration {
  position: relative;
  width: 100%;
  height: 40px;
  margin-top: 20px;
}

.bottom-pattern {
  width: 100%;
  height: 4px;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 215, 0, 0.6) 20%,
    rgba(255, 215, 0, 0.8) 50%,
    rgba(255, 215, 0, 0.6) 80%,
    transparent 100%
  );
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  position: relative;
}

.bottom-pattern::before,
.bottom-pattern::after {
  content: '';
  position: absolute;
  top: -8px;
  width: 20px;
  height: 20px;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.6) 0%,
    transparent 70%
  );
  border-radius: 50%;
}

.bottom-pattern::before {
  left: 20%;
}

.bottom-pattern::after {
  right: 20%;
}

/* 游戏Logo */
.game-logo {
  position: relative;
  margin-bottom: 25px;
  padding: 20px 0;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.2) 0%,
    rgba(255, 140, 0, 0.1) 50%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(30px);
  animation: logoPulse 3s ease-in-out infinite;
  z-index: -1;
}

@keyframes logoPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
}

.logo-text {
  font-size: 52px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.6),
    0 0 45px rgba(255, 140, 0, 0.4),
    2px 2px 4px rgba(0, 0, 0, 0.9);
  margin-bottom: 10px;
  letter-spacing: 6px;
  position: relative;
  z-index: 1;
}

.logo-subtitle {
  font-size: 15px;
  color: rgba(255, 215, 0, 0.95);
  letter-spacing: 3px;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.6),
    1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 注册标题 */
.register-title {
  font-size: 38px;
  color: #ffd700;
  margin: 0 0 35px 0;
  font-weight: 600;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.6),
    0 0 45px rgba(255, 140, 0, 0.4),
    2px 2px 4px rgba(0, 0, 0, 0.9);
  letter-spacing: 4px;
}

/* 登录标题 */
.login-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 35px;
}

.title-decoration {
  font-size: 20px;
  color: #ffd700;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    0 0 20px rgba(255, 215, 0, 0.5);
  animation: decorationSpin 4s linear infinite;
}

@keyframes decorationSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-title {
  font-size: 38px;
  color: #ffd700;
  margin: 0;
  font-weight: 600;
  text-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.6),
    0 0 45px rgba(255, 140, 0, 0.4),
    2px 2px 4px rgba(0, 0, 0, 0.9);
  letter-spacing: 4px;
  position: relative;
}

.login-title::before,
.login-title::after {
  content: '━';
  position: absolute;
  top: 50%;
  color: rgba(255, 215, 0, 0.6);
  font-size: 24px;
}

.login-title::before {
  left: -40px;
}

.login-title::after {
  right: -40px;
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(
    to right,
    rgba(255, 215, 0, 0.05) 0%,
    rgba(255, 140, 0, 0.08) 50%,
    rgba(255, 215, 0, 0.05) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  padding: 0 18px;
  height: 55px;
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.2),
    inset 0 0 15px rgba(255, 215, 0, 0.05);
  transition: all 0.3s ease;
}

.input-group:focus-within {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 25px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  background: linear-gradient(
    to right,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 140, 0, 0.15) 50%,
    rgba(255, 215, 0, 0.1) 100%
  );
}

.input-icon {
  font-size: 22px;
  margin-right: 15px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 5px currentColor);
  transition: transform 0.3s;
}

.input-group:focus-within .input-icon {
  transform: scale(1.1);
}

.name-icon {
  color: #8b4513;
  text-shadow: 0 0 10px rgba(139, 69, 19, 0.8);
}

.email-icon {
  color: #ff4444;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
}

.recruiter-icon {
  color: #ff4444;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
}

.password-icon {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

.code-icon {
  color: #ff4444;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffd700;
  font-size: 17px;
  padding: 0;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.form-input::placeholder {
  color: rgba(255, 215, 0, 0.5);
  text-shadow: none;
}

.toggle-password {
  background: none;
  border: none;
  color: rgba(255, 215, 0, 0.8);
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  margin-left: 10px;
  flex-shrink: 0;
  transition: all 0.3s;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6));
}

.toggle-password:hover {
  color: #ffd700;
  transform: scale(1.1);
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.9));
}

.verification-input {
  flex: 1;
}

.verification-code {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.code-text {
  color: #ffd700;
  font-size: 20px;
  font-weight: bold;
  min-width: 70px;
  text-align: center;
  background: linear-gradient(
    to bottom,
    rgba(255, 215, 0, 0.2) 0%,
    rgba(255, 140, 0, 0.15) 100%
  );
  border: 1px solid rgba(255, 215, 0, 0.5);
  padding: 6px 12px;
  border-radius: 6px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
  box-shadow: 
    0 0 10px rgba(255, 215, 0, 0.3),
    inset 0 0 10px rgba(255, 215, 0, 0.1);
}

.refresh-code {
  background: none;
  border: none;
  color: rgba(255, 215, 0, 0.8);
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  transition: all 0.3s;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6));
}

.refresh-code:hover {
  transform: rotate(180deg) scale(1.1);
  color: #ffd700;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.9));
}

.forgot-password {
  text-align: right;
  margin-top: -10px;
}

.forgot-link {
  color: rgba(255, 215, 0, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.forgot-link:hover {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 60px;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.9) 0%,
    rgba(255, 140, 0, 0.9) 50%,
    rgba(255, 215, 0, 0.9) 100%
  );
  border: 2px solid rgba(255, 215, 0, 1);
  border-radius: 10px;
  color: #1a0a2e;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.6),
    0 4px 15px rgba(255, 140, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.login-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  transition: all 0.5s;
}

.login-button:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 1) 0%,
    rgba(255, 165, 0, 1) 50%,
    rgba(255, 215, 0, 1) 100%
  );
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.9),
    0 6px 25px rgba(255, 140, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
}

.login-button:hover::before {
  left: 100%;
}

.login-button:active {
  transform: translateY(-1px);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.7),
    0 2px 10px rgba(255, 140, 0, 0.5);
}

/* 注册链接 */
.register-link {
  margin-top: 15px;
}

.register-text {
  color: rgba(255, 215, 0, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

.register-text:hover {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .south-heaven-gate {
    width: 90%;
    max-width: 450px;
  }

  .login-form-container {
    padding: 25px 30px;
  }

  .logo-text {
    font-size: 40px;
  }

  .login-title,
  .register-title {
    font-size: 30px;
  }

  .pillar {
    display: none;
  }

  .temple-structure {
    width: 100%;
    max-width: 500px;
  }
}
</style>

