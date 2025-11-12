<template>
  <div class="vip-card-application-container">
    <!-- 背景层 -->
    <div class="background">
      <div class="sky"></div>
      <div class="stars"></div>
      <div class="galaxy"></div>
      <div class="mountains"></div>
      <div class="temple-background"></div>
      <div class="forest-overlay"></div>
    </div>

    <!-- 顶部导航栏 -->
    <TopHeader @toggle-sidebar="toggleSidebar" @go-to-journey="handleGoToJourney" @go-to-deposit="handleGoToDeposit" />

    <!-- 主要内容区域 -->
    <main class="vip-card-main-content">
      <!-- 标题横幅 -->
      <div class="title-section">
        <div class="title-banner">
          <span class="title-icon">🏆</span>
          <span class="title-text">{{ t('vipCardApplication.title') }}</span>
        </div>
      </div>

      <!-- 个人信息表单 -->
      <div class="form-panel">
        <div class="form-section-title">{{ t('vipCardApplication.personalInformation') }}</div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.email') }}</label>
            <input 
              type="email" 
              v-model="formData.email" 
              class="form-input"
              :placeholder="t('vipCardApplication.email')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.salutation') }}</label>
            <CustomSelect
              v-model="formData.salutation"
              :options="salutationOptions"
              :placeholder="t('vipCardApplication.pleaseSelect')"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.firstName') }}</label>
            <input 
              type="text" 
              v-model="formData.firstName" 
              class="form-input"
              :placeholder="t('vipCardApplication.firstName')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.lastName') }}</label>
            <input 
              type="text" 
              v-model="formData.lastName" 
              class="form-input"
              :placeholder="t('vipCardApplication.lastName')"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.mobileNumber') }}</label>
            <div class="input-with-select">
              <div class="country-code-select-wrapper">
                <CustomSelect
                  v-model="formData.countryCode"
                  :options="countryCodeOptions"
                  :placeholder="t('vipCardApplication.countryRegionCode')"
                />
              </div>
              <input 
                type="tel" 
                v-model="formData.mobileNumber" 
                class="form-input mobile-input"
                :placeholder="t('vipCardApplication.mobileNumber')"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.dateOfBirth') }}</label>
            <input 
              type="text" 
              v-model="formData.dateOfBirth" 
              class="form-input"
              placeholder="DD-MM-YYYY"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.gender') }}</label>
            <CustomSelect
              v-model="formData.gender"
              :options="genderOptions"
              :placeholder="t('vipCardApplication.pleaseSelectGender')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.nameOnCard') }}</label>
            <input 
              type="text" 
              v-model="formData.nameOnCard" 
              class="form-input"
              :placeholder="t('vipCardApplication.nameOnCard')"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.addressLine1') }}</label>
            <input 
              type="text" 
              v-model="formData.addressLine1" 
              class="form-input"
              :placeholder="t('vipCardApplication.addressLine1')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.addressLine2') }}</label>
            <input 
              type="text" 
              v-model="formData.addressLine2" 
              class="form-input"
              :placeholder="t('vipCardApplication.addressLine2')"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.countryRegion') }}</label>
            <CustomSelect
              v-model="formData.countryRegion"
              :options="countryRegionOptions"
              :placeholder="t('vipCardApplication.pleaseSelect')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.stateProvince') }}</label>
            <input 
              type="text" 
              v-model="formData.stateProvince" 
              class="form-input"
              :placeholder="t('vipCardApplication.stateProvince')"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.city') }}</label>
            <input 
              type="text" 
              v-model="formData.city" 
              class="form-input"
              :placeholder="t('vipCardApplication.city')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.postalCode') }}</label>
            <input 
              type="text" 
              v-model="formData.postalCode" 
              class="form-input"
              :placeholder="t('vipCardApplication.postalCode')"
            />
          </div>
        </div>
      </div>

      <!-- 身份证明部分 -->
      <div class="form-panel">
        <div class="form-section-title">{{ t('vipCardApplication.identityVerification') }}</div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.idType') }}</label>
            <CustomSelect
              v-model="formData.idType"
              :options="idTypeOptions"
              :placeholder="t('vipCardApplication.pleaseSelect')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.idNumber') }}</label>
            <input 
              type="text" 
              v-model="formData.idNumber" 
              class="form-input"
              :placeholder="t('vipCardApplication.idNumber')"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.issueDate') }}</label>
            <input 
              type="text" 
              v-model="formData.issueDate" 
              class="form-input"
              placeholder="DD-MM-YYYY"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.expiryDate') }}</label>
            <input 
              type="text" 
              v-model="formData.expiryDate" 
              class="form-input"
              placeholder="DD-MM-YYYY"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.issuingCountryRegion') }}</label>
            <CustomSelect
              v-model="formData.issuingCountryRegion"
              :options="countryRegionOptions"
              :placeholder="t('vipCardApplication.pleaseSelect')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.selectIdPassportLanguage') }}</label>
            <CustomSelect
              v-model="formData.idPassportLanguage"
              :options="languageOptions"
              :placeholder="t('vipCardApplication.pleaseSelect')"
            />
          </div>
        </div>

        <!-- 身份证/护照上传 -->
        <div class="upload-section">
          <div class="upload-item">
            <label class="upload-label">{{ t('vipCardApplication.idPassportFront') }}</label>
            <div class="upload-area" @click="triggerFileUpload('idFront')" @drop.prevent="handleFileDrop($event, 'idFront')" @dragover.prevent>
              <input 
                type="file" 
                ref="idFrontInput" 
                @change="handleFileSelect($event, 'idFront')"
                accept="image/*,.pdf"
                style="display: none"
              />
              <span class="corner-decoration corner-top-left"></span>
              <span class="corner-decoration corner-top-right"></span>
              <span class="corner-decoration corner-bottom-left"></span>
              <span class="corner-decoration corner-bottom-right"></span>
              <div class="upload-icon-wrapper">
                <div class="upload-icon">☁️</div>
                <span class="upload-arrow">↑</span>
              </div>
              <div class="upload-text">{{ t('vipCardApplication.dragDropFiles') }}</div>
              <button type="button" class="upload-button">{{ t('vipCardApplication.chooseFile') }}</button>
              <div v-if="uploadedFiles.idFront" class="uploaded-file-name">{{ uploadedFiles.idFront.name }}</div>
            </div>
          </div>
          <div class="upload-item">
            <label class="upload-label">{{ t('vipCardApplication.idPassportBack') }}</label>
            <div class="upload-area" @click="triggerFileUpload('idBack')" @drop.prevent="handleFileDrop($event, 'idBack')" @dragover.prevent>
              <input 
                type="file" 
                ref="idBackInput" 
                @change="handleFileSelect($event, 'idBack')"
                accept="image/*,.pdf"
                style="display: none"
              />
              <span class="corner-decoration corner-top-left"></span>
              <span class="corner-decoration corner-top-right"></span>
              <span class="corner-decoration corner-bottom-left"></span>
              <span class="corner-decoration corner-bottom-right"></span>
              <div class="upload-icon-wrapper">
                <div class="upload-icon">☁️</div>
                <span class="upload-arrow">↑</span>
              </div>
              <div class="upload-text">{{ t('vipCardApplication.dragDropFiles') }}</div>
              <button type="button" class="upload-button">{{ t('vipCardApplication.chooseFile') }}</button>
              <div v-if="uploadedFiles.idBack" class="uploaded-file-name">{{ uploadedFiles.idBack.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 地址证明部分 -->
      <div class="form-panel">
        <div class="form-section-title">{{ t('vipCardApplication.addressProof') }}</div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.addressProofType') }}</label>
            <div class="form-hint">{{ t('vipCardApplication.addressProofHint') }}</div>
            <CustomSelect
              v-model="formData.addressProofType"
              :options="addressProofTypeOptions"
              :placeholder="t('vipCardApplication.pleaseSelect')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.addressProofIssuer') }}</label>
            <div class="form-hint">{{ t('vipCardApplication.addressProofIssuerHint') }}</div>
            <input 
              type="text" 
              v-model="formData.addressProofIssuer" 
              class="form-input"
              :placeholder="t('vipCardApplication.addressProofIssuer')"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.addressProofIssueDate') }}</label>
            <input 
              type="text" 
              v-model="formData.addressProofIssueDate" 
              class="form-input"
              placeholder="DD-MM-YYYY"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('vipCardApplication.selectAddressProofLanguage') }}</label>
            <CustomSelect
              v-model="formData.addressProofLanguage"
              :options="languageOptions"
              :placeholder="t('vipCardApplication.pleaseSelect')"
            />
          </div>
        </div>

        <!-- 地址证明上传 -->
        <div class="upload-section">
          <div class="upload-item">
            <label class="upload-label">{{ t('vipCardApplication.addressProofFront') }}</label>
            <div class="upload-area" @click="triggerFileUpload('addressFront')" @drop.prevent="handleFileDrop($event, 'addressFront')" @dragover.prevent>
              <input 
                type="file" 
                ref="addressFrontInput" 
                @change="handleFileSelect($event, 'addressFront')"
                accept="image/*,.pdf"
                style="display: none"
              />
              <span class="corner-decoration corner-top-left"></span>
              <span class="corner-decoration corner-top-right"></span>
              <span class="corner-decoration corner-bottom-left"></span>
              <span class="corner-decoration corner-bottom-right"></span>
              <div class="upload-icon-wrapper">
                <div class="upload-icon">☁️</div>
                <span class="upload-arrow">↑</span>
              </div>
              <div class="upload-text">{{ t('vipCardApplication.dragDropFiles') }}</div>
              <button type="button" class="upload-button">{{ t('vipCardApplication.chooseFile') }}</button>
              <div v-if="uploadedFiles.addressFront" class="uploaded-file-name">{{ uploadedFiles.addressFront.name }}</div>
            </div>
          </div>
          <div class="upload-item">
            <label class="upload-label">{{ t('vipCardApplication.addressProofBack') }}</label>
            <div class="upload-area" @click="triggerFileUpload('addressBack')" @drop.prevent="handleFileDrop($event, 'addressBack')" @dragover.prevent>
              <input 
                type="file" 
                ref="addressBackInput" 
                @change="handleFileSelect($event, 'addressBack')"
                accept="image/*,.pdf"
                style="display: none"
              />
              <span class="corner-decoration corner-top-left"></span>
              <span class="corner-decoration corner-top-right"></span>
              <span class="corner-decoration corner-bottom-left"></span>
              <span class="corner-decoration corner-bottom-right"></span>
              <div class="upload-icon-wrapper">
                <div class="upload-icon">☁️</div>
                <span class="upload-arrow">↑</span>
              </div>
              <div class="upload-text">{{ t('vipCardApplication.dragDropFiles') }}</div>
              <button type="button" class="upload-button">{{ t('vipCardApplication.chooseFile') }}</button>
              <div v-if="uploadedFiles.addressBack" class="uploaded-file-name">{{ uploadedFiles.addressBack.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <button class="submit-button" @click="handleSubmit">{{ t('vipCardApplication.submit') }}</button>
      </div>
    </main>

    <!-- 右侧边栏菜单 -->
    <Sidebar 
      :is-open="sidebarOpen" 
      active-route="journey"
      @close="handleSidebarClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import TopHeader from '../common/TopHeader.vue'
import Sidebar from '../common/Sidebar.vue'
import CustomSelect from '../common/CustomSelect.vue'
import { useRouter, ROUTES } from '../../composables/useRouter.js'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const sidebarOpen = ref(false)

// 下拉选项配置
const salutationOptions = computed(() => [
  { value: '', label: t('vipCardApplication.pleaseSelect') },
  { value: 'Mr', label: t('vipCardApplication.mr') },
  { value: 'Mrs', label: t('vipCardApplication.mrs') },
  { value: 'Ms', label: t('vipCardApplication.ms') }
])

const genderOptions = computed(() => [
  { value: '', label: t('vipCardApplication.pleaseSelectGender') },
  { value: 'male', label: t('vipCardApplication.male') },
  { value: 'female', label: t('vipCardApplication.female') },
  { value: 'other', label: t('vipCardApplication.other') }
])

const countryRegionOptions = computed(() => [
  { value: '', label: t('vipCardApplication.pleaseSelect') },
  { value: 'CN', label: t('vipCardApplication.china') },
  { value: 'US', label: t('vipCardApplication.usa') },
  { value: 'HK', label: t('vipCardApplication.hongkong') }
])

const countryCodeOptions = computed(() => [
  { value: '', label: t('vipCardApplication.countryRegionCode') },
  { value: '+86', label: '+86 (CN)' },
  { value: '+1', label: '+1 (US)' },
  { value: '+852', label: '+852 (HK)' }
])

const idTypeOptions = computed(() => [
  { value: '', label: t('vipCardApplication.pleaseSelect') },
  { value: 'idCard', label: t('vipCardApplication.idCard') },
  { value: 'passport', label: t('vipCardApplication.passport') }
])

const languageOptions = computed(() => [
  { value: '', label: t('vipCardApplication.pleaseSelect') },
  { value: 'zh', label: t('vipCardApplication.chinese') },
  { value: 'en', label: t('vipCardApplication.english') }
])

const addressProofTypeOptions = computed(() => [
  { value: '', label: t('vipCardApplication.pleaseSelect') },
  { value: 'utility', label: t('vipCardApplication.utilityBill') },
  { value: 'bank', label: t('vipCardApplication.bankStatement') },
  { value: 'government', label: t('vipCardApplication.governmentDocument') }
])

// 表单数据
const formData = reactive({
  email: '',
  salutation: '',
  firstName: '',
  lastName: '',
  countryCode: '',
  mobileNumber: '',
  dateOfBirth: '',
  gender: '',
  nameOnCard: '',
  addressLine1: '',
  addressLine2: '',
  countryRegion: '',
  stateProvince: '',
  city: '',
  postalCode: '',
  idType: '',
  idNumber: '',
  issueDate: '',
  expiryDate: '',
  issuingCountryRegion: '',
  idPassportLanguage: '',
  addressProofType: '',
  addressProofIssuer: '',
  addressProofIssueDate: '',
  addressProofLanguage: ''
})

// 文件上传
const uploadedFiles = reactive({
  idFront: null,
  idBack: null,
  addressFront: null,
  addressBack: null
})

const idFrontInput = ref(null)
const idBackInput = ref(null)
const addressFrontInput = ref(null)
const addressBackInput = ref(null)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleSidebarClose = () => {
  toggleSidebar()
}

const handleGoToJourney = () => {
  router.goToJourney()
}

const handleGoToDeposit = () => {
  router.goToDeposit()
}

const triggerFileUpload = (type) => {
  const inputMap = {
    idFront: idFrontInput,
    idBack: idBackInput,
    addressFront: addressFrontInput,
    addressBack: addressBackInput
  }
  inputMap[type]?.value?.click()
}

const handleFileSelect = (event, type) => {
  const file = event.target.files[0]
  if (file) {
    uploadedFiles[type] = file
  }
}

const handleFileDrop = (event, type) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    uploadedFiles[type] = file
  }
}

const handleSubmit = () => {
  console.log('提交VIP卡申请:', formData, uploadedFiles)
  alert(t('vipCardApplication.submitSuccess'))
  // 这里可以添加实际的提交逻辑
}
</script>

<style scoped>
.vip-card-application-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  color: white;
  -webkit-overflow-scrolling: touch;
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

.galaxy {
  position: absolute;
  top: 10%;
  right: 10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 215, 0, 0.2) 0%,
    rgba(138, 43, 226, 0.2) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(40px);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: 
    linear-gradient(to top, #0a0a0a 0%, transparent 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cpath d='M0,400 L200,300 L400,350 L600,250 L800,320 L1000,280 L1200,300 L1200,400 Z' fill='%231a1a1a'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.8;
}

.temple-background {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(20, 15, 10, 0.2) 50%, rgba(10, 5, 0, 0.4) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath d='M100,400 L100,250 L150,230 L200,250 L250,230 L300,250 L350,230 L400,250 L450,230 L500,250 L550,230 L600,250 L650,230 L700,250 L700,400 Z' fill='rgba(20,15,10,0.3)'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: 100% 100%;
  opacity: 0.6;
  filter: blur(2px);
}

.forest-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(0, 50, 0, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

/* 主要内容区域 */
.vip-card-main-content {
  position: relative;
  z-index: 5;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 100px;
  padding-bottom: 50px;
}

/* 标题区域 */
.title-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.title-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 8px;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.4),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(5px);
}

.title-icon {
  font-size: 24px;
}

.title-text {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
}

/* 表单面板 */
.form-panel {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.3),
    inset 0 0 30px rgba(255, 215, 0, 0.05);
  margin-bottom: 30px;
}

.form-section-title {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 25px;
  text-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 8px;
}

.form-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  margin-top: -4px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input-with-select {
  display: flex;
  gap: 10px;
}

.country-code-select-wrapper {
  flex: 0 0 150px;
}

.mobile-input {
  flex: 1;
}

/* 文件上传区域 */
.upload-section {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.upload-item {
  flex: 1;
}

.upload-label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 10px;
}

.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
  /* 装饰性内边框和阴影 */
  box-shadow: 
    inset 0 0 0 1px rgba(255, 215, 0, 0.4),
    0 0 20px rgba(255, 215, 0, 0.2);
}

/* 四个角落的装饰 */
.corner-decoration {
  position: absolute;
  width: 25px;
  height: 25px;
  border: 2px solid rgba(255, 215, 0, 0.8);
  z-index: 1;
}

.corner-top-left {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.corner-top-right {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.corner-bottom-left {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.corner-bottom-right {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

.upload-area:hover {
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 
    inset 0 0 0 1px rgba(255, 215, 0, 0.6),
    0 0 30px rgba(255, 215, 0, 0.4);
}

.upload-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 10px;
}

.upload-icon {
  font-size: 48px;
  display: inline-block;
}

.upload-arrow {
  position: absolute;
  top: -8px;
  right: -20px;
  font-size: 28px;
  color: rgba(255, 215, 0, 0.9);
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.upload-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 15px;
}

.upload-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 6px;
  color: #ffd700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
}

.uploaded-file-name {
  margin-top: 10px;
  color: #ffd700;
  font-size: 12px;
  word-break: break-all;
}

/* 提交按钮 */
.submit-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 50px;
}

.submit-button {
  width: 100%;
  max-width: 400px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.4) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 8px;
  color: #ffd700;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.3),
    inset 0 0 20px rgba(255, 215, 0, 0.1);
}

.submit-button:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.6) 100%);
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.5),
    inset 0 0 20px rgba(255, 215, 0, 0.2);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .vip-card-main-content {
    padding: 30px 20px;
  }

  .form-row {
    flex-direction: column;
  }

  .upload-section {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .vip-card-main-content {
    padding: 20px 15px;
    margin-top: 100px;
  }

  .input-with-select {
    flex-direction: column;
  }

  .country-code-select {
    flex: 1;
  }
}
</style>

