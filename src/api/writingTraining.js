import request from './request.js'

// 写作训练题目 & 训练记录相关 API

// 保存一批 AI 生成的题目
export function saveWritingQuestions(data) {
  // data: { moduleKey, moduleTitle, difficulty, questions: string[] }
  return request({
    url: '/writing-training/questions/batch',
    method: 'post',
    data
  })
}

// 查询某个模块下最新的题目列表
export function getWritingQuestions(params) {
  // params: { moduleKey, difficulty, pageNum?, pageSize? }
  return request({
    url: '/writing-training/questions/list',
    method: 'get',
    params
  })
}

// 随机查询若干条题目
export function getRandomWritingQuestions(params) {
  // params: { count: number }
  return request({
    url: '/writing-training/questions/random',
    method: 'get',
    params
  })
}

// 保存作文训练记录
export function saveWritingRecord(data) {
  // data: { moduleKey, moduleTitle, difficulty, questionId, content }
  return request({
    url: '/writing-training/records',
    method: 'post',
    data
  })
}

// 查询某模块下的训练记录
export function getWritingRecords(params) {
  // params: { moduleKey, pageNum?, pageSize? }
  return request({
    url: '/writing-training/records/list',
    method: 'get',
    params
  })
}
