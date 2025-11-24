<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
      <div 
        class="modal-content payment-function-modal" 
        :class="{ 'is-maximized': isMaximized }"
        @click.stop
      >
        <!-- 头部 -->
        <div class="modal-header">
          <h3 class="modal-title">{{ getTitle() }}</h3>
          <div class="header-actions">
            <button 
              class="header-btn" 
              @click="toggleMaximize"
              :title="isMaximized ? t('persona.requirementManagement.restore') : t('persona.requirementManagement.maximize')"
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
              :title="t('persona.requirementManagement.close')"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="modal-body">
          <div class="form-container">
            <div class="form-scroll">
              <form @submit.prevent="handleSubmit" class="payment-form">
                <!-- 支付配置 -->
                <div class="form-field">
                  <label class="field-label">
                    {{ t('payment.common.paymentConfig') }} <span class="required-mark">*</span>
                  </label>
                  <CustomSelect
                    v-model="formData.configId"
                    :options="configOptions"
                    :placeholder="t('payment.common.paymentConfigPlaceholder')"
                    :loading="configLoading"
                    required
                  />
                </div>

                <!-- 动态表单字段 -->
                <template v-if="paymentType === 'ALIPAY'">
                  <!-- 支付宝-普通网站支付 -->
                  <template v-if="functionType === 'web-site'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoPlaceholder')"
                        required
                      />
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.subject') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.subject"
                          :placeholder="t('payment.common.subjectPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.totalAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.totalAmount"
                          :min="0.01"
                          :placeholder="t('payment.common.totalAmountPlaceholder')"
                          required
                        />
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="field-label">{{ t('payment.common.body') }}</label>
                      <textarea
                        v-model="formData.body"
                        class="form-textarea"
                        :placeholder="t('payment.common.bodyPlaceholder')"
                        rows="2"
                      ></textarea>
                    </div>
                  </template>

                  <!-- 支付宝-手机网页支付 -->
                  <template v-else-if="functionType === 'mobile-site'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoPlaceholder')"
                        required
                      />
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.subject') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.subject"
                          :placeholder="t('payment.common.subjectPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.totalAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.totalAmount"
                          :min="0.01"
                          :placeholder="t('payment.common.totalAmountPlaceholder')"
                          required
                        />
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="field-label">{{ t('payment.common.body') }}</label>
                      <textarea
                        v-model="formData.body"
                        class="form-textarea"
                        :placeholder="t('payment.common.bodyPlaceholder')"
                        rows="2"
                      ></textarea>
                    </div>
                  </template>

                  <!-- 支付宝-预创建订单 -->
                  <template v-else-if="functionType === 'pre-create'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoPlaceholder')"
                        required
                      />
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.subject') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.subject"
                          :placeholder="t('payment.common.subjectPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.totalAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.totalAmount"
                          :min="0.01"
                          :placeholder="t('payment.common.totalAmountPlaceholder')"
                          required
                        />
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="field-label">{{ t('payment.common.body') }}</label>
                      <textarea
                        v-model="formData.body"
                        class="form-textarea"
                        :placeholder="t('payment.common.bodyPlaceholder')"
                        rows="2"
                      ></textarea>
                    </div>
                  </template>

                  <!-- 支付宝-刷卡支付 -->
                  <template v-else-if="functionType === 'pay'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoPlaceholder')"
                        required
                      />
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.subject') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.subject"
                          :placeholder="t('payment.common.subjectPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.alipay.pay.authCode') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.authCode"
                          :placeholder="t('payment.common.authCodePlaceholderAlipay')"
                          required
                        />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.totalAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.totalAmount"
                          :min="0.01"
                          :placeholder="t('payment.common.totalAmountPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.common.storeId') }}</label>
                        <CustomInput
                          v-model="formData.storeId"
                          :placeholder="t('payment.common.storeIdPlaceholder')"
                        />
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="field-label">{{ t('payment.common.operatorId') }}</label>
                      <CustomInput
                        v-model="formData.operatorId"
                        :placeholder="t('payment.common.operatorIdPlaceholder')"
                      />
                    </div>
                  </template>

                  <!-- 支付宝-订单查询 -->
                  <template v-else-if="functionType === 'query'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        required
                      />
                    </div>
                  </template>

                  <!-- 支付宝-退款 -->
                  <template v-else-if="functionType === 'refund'">
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.common.outTradeNo') }}</label>
                        <CustomInput
                          v-model="formData.outTradeNo"
                          :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.common.transactionId') }}</label>
                        <CustomInput
                          v-model="formData.tradeNo"
                          :placeholder="t('payment.common.transactionIdPlaceholder')"
                        />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.alipay.refund.refundAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.refundAmount"
                          :min="0.01"
                          :placeholder="t('payment.alipay.refund.refundAmountPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.alipay.refund.refundReason') }}</label>
                        <CustomInput
                          v-model="formData.refundReason"
                          :placeholder="t('payment.alipay.refund.refundReasonPlaceholder')"
                        />
                      </div>
                    </div>
                  </template>

                  <!-- 支付宝-订单取消 -->
                  <template v-else-if="functionType === 'cancel'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        required
                      />
                    </div>
                  </template>
                </template>

                <template v-else-if="paymentType === 'WECHAT'">
                  <!-- 微信-统一下单 -->
                  <template v-if="functionType === 'unified-order'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoPlaceholder')"
                        required
                      />
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.subject') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.subject"
                          :placeholder="t('payment.common.subjectPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.totalAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.totalAmount"
                          :min="0.01"
                          :placeholder="t('payment.common.totalAmountPlaceholder')"
                          required
                        />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.wechat.unifiedOrder.tradeType') }} <span class="required-mark">*</span>
                        </label>
                        <CustomSelect
                          v-model="formData.tradeType"
                          :options="tradeTypeOptions"
                          :placeholder="t('payment.wechat.unifiedOrder.tradeTypePlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.wechat.unifiedOrder.openid') }}</label>
                        <CustomInput
                          v-model="formData.openid"
                          :placeholder="t('payment.wechat.unifiedOrder.openidPlaceholder')"
                        />
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="field-label">{{ t('payment.common.body') }}</label>
                      <textarea
                        v-model="formData.body"
                        class="form-textarea"
                        :placeholder="t('payment.common.bodyPlaceholder')"
                        rows="2"
                      ></textarea>
                    </div>
                  </template>

                  <!-- 微信-刷卡支付 -->
                  <template v-else-if="functionType === 'micro-pay'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoPlaceholder')"
                        required
                      />
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.subject') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.subject"
                          :placeholder="t('payment.common.subjectPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.totalAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.totalAmount"
                          :min="0.01"
                          :placeholder="t('payment.common.totalAmountPlaceholder')"
                          required
                        />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.wechat.microPay.authCode') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.authCode"
                          :placeholder="t('payment.wechat.microPay.authCodePlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.common.body') }}</label>
                        <CustomInput
                          v-model="formData.body"
                          :placeholder="t('payment.common.bodyPlaceholder')"
                        />
                      </div>
                    </div>
                  </template>

                  <!-- 微信-订单查询 -->
                  <template v-else-if="functionType === 'query'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        required
                      />
                    </div>
                  </template>

                  <!-- 微信-退款 -->
                  <template v-else-if="functionType === 'refund'">
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.common.outTradeNo') }}</label>
                        <CustomInput
                          v-model="formData.outTradeNo"
                          :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.common.transactionId') }}</label>
                        <CustomInput
                          v-model="formData.transactionId"
                          :placeholder="t('payment.common.transactionIdPlaceholder')"
                        />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.wechat.refund.refundAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.refundAmount"
                          :min="0.01"
                          :placeholder="t('payment.wechat.refund.refundAmountPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.wechat.refund.totalFee') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.totalAmount"
                          :min="0.01"
                          :placeholder="t('payment.wechat.refund.totalFeePlaceholder')"
                          required
                        />
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="field-label">{{ t('payment.wechat.refund.refundReason') }}</label>
                      <textarea
                        v-model="formData.refundReason"
                        class="form-textarea"
                        :placeholder="t('payment.wechat.refund.refundReasonPlaceholder')"
                        rows="2"
                      ></textarea>
                    </div>
                  </template>

                  <!-- 微信-订单关闭 -->
                  <template v-else-if="functionType === 'close-order'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        required
                      />
                    </div>
                  </template>
                </template>

                <template v-else-if="paymentType === 'BESTPAY'">
                  <!-- 翼支付-扫码支付 -->
                  <template v-if="functionType === 'barcode'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoPlaceholder')"
                        required
                      />
                    </div>
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.subject') }} <span class="required-mark">*</span>
                        </label>
                        <CustomInput
                          v-model="formData.subject"
                          :placeholder="t('payment.common.subjectPlaceholder')"
                          required
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">
                          {{ t('payment.common.totalAmount') }} <span class="required-mark">*</span>
                        </label>
                        <CustomNumberInput
                          v-model="formData.totalAmount"
                          :min="0.01"
                          :placeholder="t('payment.common.totalAmountPlaceholder')"
                          required
                        />
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="field-label">{{ t('payment.bestpay.barcode.barcode') }} <span class="required-mark">*</span></label>
                      <CustomInput
                        v-model="formData.authCode"
                        :placeholder="t('payment.bestpay.barcode.barcodePlaceholder')"
                        required
                      />
                    </div>
                  </template>

                  <!-- 翼支付-订单查询 -->
                  <template v-else-if="functionType === 'query'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        required
                      />
                    </div>
                  </template>

                  <!-- 翼支付-退款 -->
                  <template v-else-if="functionType === 'refund'">
                    <div class="form-row">
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.common.outTradeNo') }}</label>
                        <CustomInput
                          v-model="formData.outTradeNo"
                          :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        />
                      </div>
                      <div class="form-field">
                        <label class="field-label">{{ t('payment.common.transactionId') }}</label>
                        <CustomInput
                          v-model="formData.origOrderId"
                          :placeholder="t('payment.common.transactionIdPlaceholder')"
                        />
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.bestpay.refund.refundAmount') }} <span class="required-mark">*</span>
                      </label>
                      <CustomNumberInput
                        v-model="formData.refundAmount"
                        :min="0.01"
                        :placeholder="t('payment.bestpay.refund.refundAmountPlaceholder')"
                        required
                      />
                    </div>
                  </template>

                  <!-- 翼支付-撤销 -->
                  <template v-else-if="functionType === 'reverse'">
                    <div class="form-field">
                      <label class="field-label">
                        {{ t('payment.common.outTradeNo') }} <span class="required-mark">*</span>
                      </label>
                      <CustomInput
                        v-model="formData.outTradeNo"
                        :placeholder="t('payment.common.outTradeNoInputPlaceholder')"
                        required
                      />
                    </div>
                  </template>
                </template>

                <!-- 提交按钮 -->
                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="handleClose">
                    {{ t('persona.requirementManagement.cancel') }}
                  </button>
                  <button type="submit" class="btn-primary">
                    {{ getSubmitButtonText() }}
                  </button>
                </div>

                <!-- 结果显示 -->
                <div v-if="result" :class="['result-container', result.success ? 'result-success' : 'result-error']">
                  <div class="result-title">{{ result.success ? t('payment.common.success') : t('payment.common.failed') }}</div>
                  <div class="result-message">{{ result.message }}</div>
                  <div v-if="result.codeUrl && functionType === 'unified-order'" class="qrcode-container">
                    <div class="qrcode-title">{{ t('payment.wechat.unifiedOrder.qrcodeTitle') }}</div>
                    <canvas ref="qrcodeCanvas"></canvas>
                  </div>
                  <pre v-if="result.data" class="result-data">{{ JSON.stringify(result.data, null, 2) }}</pre>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import CustomInput from '../common/CustomInput.vue'
import CustomNumberInput from '../common/CustomNumberInput.vue'
import CustomSelect from '../common/CustomSelect.vue'
import { getPaymentConfigList } from '../../api/payment.js'
import * as paymentApi from '../../api/payment.js'
import QRCode from 'qrcode'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  paymentType: {
    type: String,
    required: true,
    validator: (value) => ['ALIPAY', 'WECHAT', 'BESTPAY'].includes(value)
  },
  functionType: {
    type: String,
    required: true
  },
  configId: {
    type: [Number, String],
    default: null
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const isMaximized = ref(false)
const configLoading = ref(false)
const configOptions = ref([])
const result = ref(null)
const qrcodeCanvas = ref(null)

const formData = reactive({
  configId: null,
  outTradeNo: '',
  subject: '',
  body: '',
  totalAmount: 0.01,
  authCode: '',
  storeId: '',
  operatorId: '',
  tradeNo: '',
  transactionId: '',
  origOrderId: '',
  refundAmount: 0.01,
  refundReason: '',
  tradeType: 'NATIVE',
  openid: ''
})

const tradeTypeOptions = computed(() => [
  { value: 'NATIVE', label: 'NATIVE - ' + t('payment.wechat.unifiedOrder.tradeTypeNative', '扫码支付') },
  { value: 'JSAPI', label: 'JSAPI - ' + t('payment.wechat.unifiedOrder.tradeTypeJsapi', '公众号/小程序支付') },
  { value: 'APP', label: 'APP - ' + t('payment.wechat.unifiedOrder.tradeTypeApp', 'APP支付') },
  { value: 'MWEB', label: 'MWEB - ' + t('payment.wechat.unifiedOrder.tradeTypeMweb', 'H5支付') }
])

const generateOutTradeNo = () => {
  return 'ORDER' + new Date().getTime() + Math.floor(Math.random() * 1000)
}

const getTitle = () => {
  const titles = {
    'ALIPAY': {
      'web-site': t('payment.alipay.webSite.title'),
      'mobile-site': t('payment.alipay.mobileSite.title'),
      'pre-create': t('payment.alipay.preCreate.title'),
      'pay': t('payment.alipay.pay.title'),
      'query': t('payment.alipay.query.title'),
      'refund': t('payment.alipay.refund.title'),
      'cancel': t('payment.alipay.cancel.title')
    },
    'WECHAT': {
      'unified-order': t('payment.wechat.unifiedOrder.title'),
      'micro-pay': t('payment.wechat.microPay.title'),
      'query': t('payment.wechat.query.title'),
      'refund': t('payment.wechat.refund.title'),
      'close-order': t('payment.wechat.closeOrder.title')
    },
    'BESTPAY': {
      'barcode': t('payment.bestpay.barcode.title'),
      'query': t('payment.bestpay.query.title'),
      'refund': t('payment.bestpay.refund.title'),
      'reverse': t('payment.bestpay.reverse.title')
    }
  }
  return titles[props.paymentType]?.[props.functionType] || '支付功能'
}

const getSubmitButtonText = () => {
  if (props.functionType === 'query') {
    return t('payment.common.queryOrder')
  } else if (props.functionType === 'refund') {
    return t('payment.common.applyRefund')
  } else {
    return t('payment.common.submit')
  }
}

const loadConfigs = async () => {
  if (!props.paymentType) return
  
  configLoading.value = true
  try {
    const response = await getPaymentConfigList(props.paymentType)
    if (response.code === 200 && response.data) {
      configOptions.value = response.data
        .filter(config => config.enabled === 1)
        .map(config => ({
          value: config.id,
          label: `${config.configName} (${config.appId})`
        }))
      
      // 如果传入了 configId，则自动选择
      if (props.configId) {
        formData.configId = props.configId
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  } finally {
    configLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    configId: props.configId || null,
    outTradeNo: generateOutTradeNo(),
    subject: t('payment.common.subjectPlaceholder'),
    body: t('payment.common.bodyPlaceholder'),
    totalAmount: 0.01,
    authCode: '',
    storeId: '',
    operatorId: '',
    tradeNo: '',
    transactionId: '',
    origOrderId: '',
    refundAmount: 0.01,
    refundReason: '',
    tradeType: 'NATIVE',
    openid: ''
  })
  result.value = null
}

const handleSubmit = async () => {
  try {
    let apiFunction
    let requestData = { ...formData }

    // 根据支付类型和功能类型调用对应的API
    if (props.paymentType === 'ALIPAY') {
      switch (props.functionType) {
        case 'web-site':
          apiFunction = paymentApi.alipayWebSite
          break
        case 'mobile-site':
          apiFunction = paymentApi.alipayMobileSite
          break
        case 'pre-create':
          apiFunction = paymentApi.alipayPreCreate
          break
        case 'pay':
          apiFunction = paymentApi.alipayPay
          break
        case 'query':
          apiFunction = paymentApi.alipayQuery
          requestData = { configId: formData.configId, outTradeNo: formData.outTradeNo }
          break
        case 'refund':
          apiFunction = paymentApi.alipayRefund
          requestData = {
            configId: formData.configId,
            outTradeNo: formData.outTradeNo || null,
            tradeNo: formData.tradeNo || null,
            refundAmount: formData.refundAmount,
            refundReason: formData.refundReason
          }
          break
        case 'cancel':
          apiFunction = paymentApi.alipayCancel
          requestData = { configId: formData.configId, outTradeNo: formData.outTradeNo }
          break
      }
    } else if (props.paymentType === 'WECHAT') {
      switch (props.functionType) {
        case 'unified-order':
          apiFunction = paymentApi.wechatUnifiedOrder
          break
        case 'micro-pay':
          apiFunction = paymentApi.wechatMicroPay
          break
        case 'query':
          apiFunction = paymentApi.wechatQuery
          requestData = { configId: formData.configId, outTradeNo: formData.outTradeNo }
          break
        case 'refund':
          apiFunction = paymentApi.wechatRefund
          requestData = {
            configId: formData.configId,
            outTradeNo: formData.outTradeNo || null,
            transactionId: formData.transactionId || null,
            refundAmount: formData.refundAmount,
            totalAmount: formData.totalAmount,
            refundReason: formData.refundReason
          }
          break
        case 'close-order':
          apiFunction = paymentApi.wechatCloseOrder
          requestData = { configId: formData.configId, outTradeNo: formData.outTradeNo }
          break
      }
    } else if (props.paymentType === 'BESTPAY') {
      switch (props.functionType) {
        case 'barcode':
          apiFunction = paymentApi.bestpayBarcode
          break
        case 'query':
          apiFunction = paymentApi.bestpayQuery
          requestData = { configId: formData.configId, outTradeNo: formData.outTradeNo }
          break
        case 'refund':
          apiFunction = paymentApi.bestpayRefund
          requestData = {
            configId: formData.configId,
            outTradeNo: formData.outTradeNo || null,
            origOrderId: formData.origOrderId || null,
            refundAmount: formData.refundAmount
          }
          break
        case 'reverse':
          apiFunction = paymentApi.bestpayReverse
          requestData = { configId: formData.configId, outTradeNo: formData.outTradeNo }
          break
      }
    }

    if (!apiFunction) {
      result.value = {
        success: false,
        message: '不支持的功能类型'
      }
      return
    }

    const response = await apiFunction(requestData)
    
    if (response.code === 200 && response.data) {
      // 处理支付宝网站支付的跳转
      if (props.paymentType === 'ALIPAY' && (props.functionType === 'web-site' || props.functionType === 'mobile-site')) {
        if (response.data.html) {
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = 'https://openapi.alipay.com/gateway.do'
          form.innerHTML = response.data.html
          document.body.appendChild(form)
          form.submit()
          result.value = {
            success: true,
            message: t('payment.common.redirectingToPayment')
          }
          return
        }
      }

      result.value = {
        success: response.data.success !== false,
        message: response.data.message || (response.data.success !== false ? t('payment.common.operationSuccess') : t('payment.common.operationFailed')),
        codeUrl: response.data.codeUrl,
        data: response.data
      }

      // 生成二维码
      if (response.data.codeUrl && props.functionType === 'unified-order' && qrcodeCanvas.value) {
        nextTick(() => {
          QRCode.toCanvas(qrcodeCanvas.value, response.data.codeUrl, {
            width: 300,
            margin: 2
          }, (error) => {
            if (error) {
              console.error('生成二维码失败:', error)
            }
          })
        })
      }
    } else {
      result.value = {
        success: false,
        message: response.msg || t('payment.common.operationFailed')
      }
    }
  } catch (error) {
    result.value = {
      success: false,
      message: error.message || t('payment.common.requestFailed')
    }
  }
}

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    handleClose()
  }
}

// 监听弹窗打开
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    resetForm()
    await loadConfigs()
  } else {
    isMaximized.value = false
  }
})

// 监听 configId 变化
watch(() => props.configId, (newVal) => {
  if (newVal) {
    formData.configId = newVal
  }
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

.payment-function-modal {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(20, 10, 0, 0.95) 100%
  );
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 15px;
  padding: 0;
  width: 90%;
  max-width: 900px;
  height: 85vh;
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

.payment-function-modal.is-maximized {
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

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #ffd700;
}

.required-mark {
  color: #f44336;
  margin-left: 4px;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
  line-height: 1.6;
  outline: none;
  resize: vertical;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-textarea:focus {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
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

.result-container {
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
  animation: slideDown 0.3s ease;
}

.result-success {
  background: rgba(16, 185, 129, 0.2);
  border: 2px solid rgba(16, 185, 129, 0.5);
  color: #10b981;
}

.result-error {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.result-message {
  margin-bottom: 10px;
}

.qrcode-container {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

.qrcode-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
  font-weight: 500;
}

.qrcode-container canvas {
  max-width: 100%;
  border-radius: 8px;
}

.result-data {
  background: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.form-scroll::-webkit-scrollbar {
  width: 8px;
}

.form-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.form-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.3);
  border-radius: 4px;
}

.form-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-function-modal {
    width: 100%;
    height: 100vh;
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-body {
    padding: 15px 20px;
  }
}
</style>

