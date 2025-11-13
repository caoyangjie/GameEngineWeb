import request from './request.js'

/**
 * 获取会员中心信息
 */
export function getMemberCenter() {
  return request({
    url: '/member/center',
    method: 'get'
  })
}

/**
 * 购买虚拟货币
 * @param {string} fromCurrency 源货币代码
 * @param {string} toCurrency 目标货币代码
 * @param {number} amount 购买金额
 */
export function purchaseCurrency(fromCurrency, toCurrency, amount) {
  return request({
    url: '/member/purchase',
    method: 'post',
    data: {
      fromCurrency,
      toCurrency,
      amount
    }
  })
}

/**
 * 提款
 * @param {string} currencyCode 货币代码
 * @param {number} amount 提款金额
 * @param {string} withdrawalAddress 提款地址
 * @param {string} networkType 网络类型（BEP20, TRC20等）
 */
export function withdraw(currencyCode, amount, withdrawalAddress, networkType) {
  return request({
    url: '/member/withdraw',
    method: 'post',
    data: {
      currencyCode,
      amount,
      withdrawalAddress,
      networkType
    }
  })
}

/**
 * 收成（将赏金库转移到主金库）
 * @param {boolean} autoAddJourney 是否自动追加旅程
 */
export function harvest(autoAddJourney = false) {
  return request({
    url: '/member/harvest',
    method: 'post',
    params: {
      autoAddJourney
    }
  })
}

/**
 * 追加（将VT追加到倍增池）
 * @param {number} vtAmount VT金额
 */
export function addToMultiplierPool(vtAmount) {
  return request({
    url: '/member/add',
    method: 'post',
    params: {
      vtAmount
    }
  })
}

/**
 * 兑换（将VT兑换为USD）
 * @param {number} vtAmount VT金额
 */
export function exchange(vtAmount) {
  return request({
    url: '/member/exchange',
    method: 'post',
    params: {
      vtAmount
    }
  })
}

/**
 * 更新自动追加旅程设置
 * @param {boolean} autoAddJourney 是否自动追加
 */
export function updateAutoAddJourney(autoAddJourney) {
  return request({
    url: '/member/updateAutoAddJourney',
    method: 'post',
    params: {
      autoAddJourney
    }
  })
}

/**
 * 获取交易记录
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @param {string} transactionType 交易类型
 * @param {string} walletType 钱包类型
 */
export function getTransactionHistory(startDate, endDate, transactionType, walletType) {
  return request({
    url: '/member/transactions',
    method: 'get',
    params: {
      startDate,
      endDate,
      transactionType,
      walletType
    }
  })
}

/**
 * 检查并升级用户等级
 */
export function checkAndUpgradeLevel() {
  return request({
    url: '/member/checkLevel',
    method: 'post'
  })
}

