import request from './request.js'

export function generateTextFocusContents({ count = 10, theme = '日常生活', level = '中' } = {}) {
  return request({
    url: '/attention/textFocus/contents/generate',
    method: 'post',
    data: { count, theme, level }
  })
}

export function getLatestTextFocusContents(limit = 10, theme) {
  return request({
    url: '/attention/textFocus/contents/latest',
    method: 'get',
    params: { limit, theme }
  })
}

export function saveTextFocusRecord(record) {
  return request({
    url: '/attention/textFocus/records',
    method: 'post',
    data: record
  })
}

export function getTextFocusUserRecords(limit = 10) {
  return request({
    url: '/attention/textFocus/records/user',
    method: 'get',
    params: { limit }
  })
}