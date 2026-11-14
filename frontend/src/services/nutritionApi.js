const apiBase = process.env.VUE_APP_API_BASE_URL || ''

// 统一处理 API 响应；页面会在服务不可用时显示内置的演示目录。
async function getJson(path) {
  const response = await fetch(apiBase + path, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('API 请求失败：' + response.status)
  return response.json()
}

// 发送带 JSON 请求体的写请求；204 无内容时返回 null。
async function sendJson(method, path, body) {
  const response = await fetch(apiBase + path, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) throw new Error('API 请求失败：' + response.status)
  if (response.status === 204) return null
  return response.json()
}

export function getNutrients(group, keyword) {
  const params = new URLSearchParams()
  if (group) params.set('group', group)
  if (keyword) params.set('keyword', keyword)
  const query = params.toString() ? '?' + params.toString() : ''
  return getJson('/api/nutrients' + query)
}

export function getNutrient(slug, populationCode) {
  const params = new URLSearchParams()
  if (populationCode) params.set('populationCode', populationCode)
  const query = params.toString() ? '?' + params.toString() : ''
  return getJson('/api/nutrients/' + encodeURIComponent(slug) + query)
}

export function getPopulations() {
  return getJson('/api/reference/populations')
}

export function getFoodOverview() {
  return getJson('/api/foods/overview')
}

export function getReferenceIntakes(populationCode) {
  const params = new URLSearchParams({ populationCode })
  return getJson('/api/reference/intakes?' + params.toString())
}

// —— 饮食记录 ——

export function getMealLogs(from, to) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString() ? '?' + params.toString() : ''
  return getJson('/api/meal-logs' + query)
}

export function saveMealLog(payload) {
  return sendJson('POST', '/api/meal-logs', payload)
}

export function deleteMealLog(id) {
  return sendJson('DELETE', '/api/meal-logs/' + id)
}
