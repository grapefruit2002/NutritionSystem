// Cloudflare Worker 入口：同时提供 REST API 与前端静态资源。
// 路由与字段保持与 ASP.NET Core 版本一致，前端无需改动接口调用。

import {
  deleteMealLog,
  getFoodBySlug,
  getFoodOverview,
  getFoods,
  getMealLogs,
  getNutrientBySlug,
  getNutrients,
  getPopulationGroups,
  getReferenceIntakes,
  saveMealLog,
} from './data.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Owner-Key',
  'Access-Control-Max-Age': '86400',
}

// 默认浏览器缓存的公开参考数据，减少重复回源
const READ_CACHE_HEADERS = { 'Cache-Control': 'public, max-age=60' }

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...(init.headers ?? {}),
    },
  })
}

function text(body, status) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS },
  })
}

// 与 ASP.NET Core 的 ProblemDetails 保持同样的结构，便于客户端统一处理错误
function problem(status, title) {
  const hex = (bytes) =>
    [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('')
  const traceId = `00-${hex(crypto.getRandomValues(new Uint8Array(16)))}-${hex(
    crypto.getRandomValues(new Uint8Array(8)),
  )}-00`

  return new Response(
    JSON.stringify({
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5',
      title,
      status,
      traceId,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/problem+json; charset=utf-8', ...CORS_HEADERS },
    },
  )
}

// 校验并规范化日期参数；非法日期返回 null
function parseDate(value) {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : value
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

// 餐次兼容前端传入的 camelCase 值，落库时存回 PascalCase 以对齐 .NET 版
function normalizeMealType(value) {
  if (typeof value !== 'string') return null
  const matched = MEAL_TYPES.find((item) => item === value.toLowerCase())
  if (!matched) return null
  return matched.charAt(0).toUpperCase() + matched.slice(1)
}

function ownerKeyOf(request) {
  const key = request.headers.get('X-Owner-Key')
  return key && key.trim().length > 0 ? key.trim() : 'local'
}

async function handleApi(request, env, url) {
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const method = request.method

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (path === '/health' && method === 'GET') {
    return json({ status: 'ok', service: 'nutrition-api' })
  }

  // —— 营养素 ——
  if (path === '/api/nutrients' && method === 'GET') {
    const rows = await getNutrients(env.DB, {
      group: url.searchParams.get('group'),
      keyword: url.searchParams.get('keyword'),
    })
    return json(rows, { headers: READ_CACHE_HEADERS })
  }

  const nutrientMatch = path.match(/^\/api\/nutrients\/([^/]+)$/)
  if (nutrientMatch && method === 'GET') {
    const slug = decodeURIComponent(nutrientMatch[1])
    const detail = await getNutrientBySlug(env.DB, slug, url.searchParams.get('populationCode'))
    return detail ? json(detail, { headers: READ_CACHE_HEADERS }) : problem(404, 'Not Found')
  }

  // —— 食物 ——
  if (path === '/api/foods' && method === 'GET') {
    return json(await getFoods(env.DB, url.searchParams.get('keyword')), { headers: READ_CACHE_HEADERS })
  }

  if (path === '/api/foods/overview' && method === 'GET') {
    return json(await getFoodOverview(env.DB), { headers: READ_CACHE_HEADERS })
  }

  const foodMatch = path.match(/^\/api\/foods\/([^/]+)$/)
  if (foodMatch && method === 'GET') {
    const detail = await getFoodBySlug(env.DB, decodeURIComponent(foodMatch[1]))
    return detail ? json(detail, { headers: READ_CACHE_HEADERS }) : problem(404, 'Not Found')
  }

  // —— 参考摄入量 ——
  if (path === '/api/reference/populations' && method === 'GET') {
    return json(await getPopulationGroups(env.DB), { headers: READ_CACHE_HEADERS })
  }

  if (path === '/api/reference/intakes' && method === 'GET') {
    const populationCode = url.searchParams.get('populationCode')
    if (!populationCode || !populationCode.trim()) {
      return json({ message: '请提供 populationCode' }, { status: 400 })
    }
    return json(await getReferenceIntakes(env.DB, populationCode.trim()), { headers: READ_CACHE_HEADERS })
  }

  // —— 饮食记录 ——
  if (path === '/api/meal-logs' && method === 'GET') {
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const rows = await getMealLogs(env.DB, {
      from: parseDate(from),
      to: parseDate(to),
      ownerKey: ownerKeyOf(request),
    })
    return json(rows, { headers: { 'Cache-Control': 'no-store' } })
  }

  if (path === '/api/meal-logs' && method === 'POST') {
    let payload
    try {
      payload = await request.json()
    } catch {
      return text('请求体不是合法 JSON。', 400)
    }

    const logDate = parseDate(payload?.logDate)
    const mealType = normalizeMealType(payload?.mealType)
    const items = Array.isArray(payload?.items) ? payload.items : []

    if (!logDate) return text('日期格式应为 YYYY-MM-DD。', 400)
    if (!mealType) return text('餐次应为 breakfast、lunch、dinner 或 snack。', 400)
    if (items.length === 0) return text('这一餐还没有食物。', 400)

    const invalid = items.find((item) => !item?.foodSlug || typeof item.grams !== 'number')
    if (invalid) return text('食物条目缺少 foodSlug 或 grams。', 400)

    const result = await saveMealLog(
      env.DB,
      { logDate, mealType, note: payload.note ?? null, items },
      ownerKeyOf(request),
    )
    return json(result, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  }

  const mealLogMatch = path.match(/^\/api\/meal-logs\/(\d+)$/)
  if (mealLogMatch && method === 'DELETE') {
    const deleted = await deleteMealLog(env.DB, Number(mealLogMatch[1]), ownerKeyOf(request))
    return deleted
      ? new Response(null, { status: 204, headers: CORS_HEADERS })
      : problem(404, 'Not Found')
  }

  return problem(404, 'Not Found')
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    try {
      if (url.pathname === '/health' || url.pathname.startsWith('/api/')) {
        return await handleApi(request, env, url)
      }

      // 其余请求交给静态资源（前端构建产物）
      if (env.ASSETS) {
        return await env.ASSETS.fetch(request)
      }

      return text('前端资源尚未构建，请先运行 npm run build:frontend。', 503)
    } catch (error) {
      return json(
        { message: '服务端处理失败。', detail: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  },
}
