import request from './request.js'

/**
 * 获取支付配置列表
 * @param {string} paymentType 支付类型（可选）
 */
export function getPaymentConfigList(paymentType) {
  return request({
    url: '/config/payment/list',
    method: 'get',
    params: {
      paymentType
    }
  })
}

/**
 * 保存支付配置
 * @param {object} config 支付配置对象
 */
export function savePaymentConfig(config) {
  return request({
    url: '/config/payment/save',
    method: 'post',
    data: config
  })
}

/**
 * 删除支付配置
 * @param {number} id 配置ID
 */
export function deletePaymentConfig(id) {
  return request({
    url: '/config/payment/delete',
    method: 'post',
    params: {
      id
    }
  })
}

/**
 * 支付宝-手机网页支付
 * @param {object} paymentData 支付数据
 */
export function alipayMobileSite(paymentData) {
  return request({
    url: '/payment/alipay/mobile-site',
    method: 'post',
    data: paymentData
  })
}

/**
 * 支付宝-普通网站支付
 * @param {object} paymentData 支付数据
 */
export function alipayWebSite(paymentData) {
  return request({
    url: '/payment/alipay/web-site',
    method: 'post',
    data: paymentData
  })
}

/**
 * 支付宝-预创建订单（扫码支付）
 * @param {object} paymentData 支付数据
 */
export function alipayPreCreate(paymentData) {
  return request({
    url: '/payment/alipay/pre-create',
    method: 'post',
    data: paymentData
  })
}

/**
 * 支付宝-订单查询
 * @param {object} queryData 查询数据
 */
export function alipayQuery(queryData) {
  return request({
    url: '/payment/alipay/query',
    method: 'post',
    data: queryData
  })
}

/**
 * 支付宝-退款
 * @param {object} refundData 退款数据
 */
export function alipayRefund(refundData) {
  return request({
    url: '/payment/alipay/refund',
    method: 'post',
    data: refundData
  })
}

/**
 * 微信-统一下单
 * @param {object} paymentData 支付数据
 */
export function wechatUnifiedOrder(paymentData) {
  return request({
    url: '/payment/wechat/unified-order',
    method: 'post',
    data: paymentData
  })
}

/**
 * 微信-订单查询
 * @param {object} queryData 查询数据
 */
export function wechatQuery(queryData) {
  return request({
    url: '/payment/wechat/query',
    method: 'post',
    data: queryData
  })
}

/**
 * 微信-退款
 * @param {object} refundData 退款数据
 */
export function wechatRefund(refundData) {
  return request({
    url: '/payment/wechat/refund',
    method: 'post',
    data: refundData
  })
}

/**
 * 翼支付-扫码支付
 * @param {object} paymentData 支付数据
 */
export function bestpayBarcode(paymentData) {
  return request({
    url: '/payment/bestpay/barcode',
    method: 'post',
    data: paymentData
  })
}

/**
 * 翼支付-订单查询
 * @param {object} queryData 查询数据
 */
export function bestpayQuery(queryData) {
  return request({
    url: '/payment/bestpay/query',
    method: 'post',
    data: queryData
  })
}

/**
 * 翼支付-退款
 * @param {object} refundData 退款数据
 */
export function bestpayRefund(refundData) {
  return request({
    url: '/payment/bestpay/refund',
    method: 'post',
    data: refundData
  })
}

/**
 * 支付宝-刷卡支付
 * @param {object} paymentData 支付数据
 */
export function alipayPay(paymentData) {
  return request({
    url: '/payment/alipay/pay',
    method: 'post',
    data: paymentData
  })
}

/**
 * 支付宝-订单取消
 * @param {object} cancelData 取消数据
 */
export function alipayCancel(cancelData) {
  return request({
    url: '/payment/alipay/cancel',
    method: 'post',
    data: cancelData
  })
}

/**
 * 微信-刷卡支付
 * @param {object} paymentData 支付数据
 */
export function wechatMicroPay(paymentData) {
  return request({
    url: '/payment/wechat/micro-pay',
    method: 'post',
    data: paymentData
  })
}

/**
 * 微信-订单关闭
 * @param {object} closeData 关闭数据
 */
export function wechatCloseOrder(closeData) {
  return request({
    url: '/payment/wechat/close-order',
    method: 'post',
    data: closeData
  })
}

/**
 * 翼支付-撤销
 * @param {object} reverseData 撤销数据
 */
export function bestpayReverse(reverseData) {
  return request({
    url: '/payment/bestpay/reverse',
    method: 'post',
    data: reverseData
  })
}

