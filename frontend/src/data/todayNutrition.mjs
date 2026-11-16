// 独立工具数据层：食物与营养素含量取自首页食物库（demoFoods，每 100 克可食部），
// 参考值来自欧洲 EFSA。缺失的营养项保留 null，不按 0 计算。
import { demoFoods } from './nutritionData.js'
import { references } from './verifiedFoods.mjs'
export { references }
export const nutrients = {
  fiber: { name: '膳食纤维', unit: 'g' },
  protein: { name: '蛋白质', unit: 'g' },
  carbohydrate: { name: '碳水化合物', unit: 'g' },
  fat: { name: '脂肪', unit: 'g' },
}
export const OUNCE_G = 28.349523125
export const GRAMS_STEP = 50

// 类别归类（用于推荐份量的产品保守限制）。
export function categoryGroup(category) {
  if (/畜禽肉|水产|畜禽内脏|蛋类/.test(category)) return 'meatFish'
  if (category === '水果') return 'fruit'
  if (/蔬菜/.test(category)) return 'vegetable'
  return 'other'
}
const GROUP_LIMITS = { meatFish: [100, 150], fruit: [150, 350], vegetable: [150, 500], other: [100, 300] }
export const groupLimits = GROUP_LIMITS

export const foods = demoFoods.map(food => {
  const protein = food.nutrients.protein ?? null
  const carbohydrate = food.nutrients.carbohydrate ?? null
  const fat = food.nutrients.fat ?? null
  // 食物库无能量字段：按宏量营养素系数（蛋白/碳水 4、脂肪 9 kcal/g）推算；三项任一缺失则能量未知。
  const energy = protein !== null && carbohydrate !== null && fat !== null
    ? protein * 4 + carbohydrate * 4 + fat * 9
    : null
  return {
    id: food.id,
    name: food.name,
    alias: food.alias || '',
    category: food.category,
    emoji: food.emoji || '',
    state: food.basis || '每 100 克可食部',
    servingGrams: 100,
    source: '首页食物库（结构演示值，正式上线前需按中国食物成分表核对）',
    nutrients: { protein, fiber: food.nutrients['dietary-fiber'] ?? null, carbohydrate, fat, energy },
  }
})

export const STORAGE_KEY = 'nutrition.today.library.v2'
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function validateRecord(record) {
  if (!record || typeof record.id !== 'string' || !record.id || !validDate(record.date)) throw new Error('记录日期或编号无效。')
  if (typeof record.grams !== 'number' || !Number.isFinite(record.grams) || record.grams <= 0 || record.grams > 2000) throw new Error('可食重量须大于0且不超过2000克。')
  const food = foods.find(f => f.id === record.foodId)
  if (!food && record.foodId !== 'unknown') throw new Error('食物不在食物库中。')
  if (food && record.state !== food.state) throw new Error('请使用该食物标注的计量基准，不能混用。')
  if (!food && (!['生可食部', '熟/即食可食部'].includes(record.state) || typeof record.name !== 'string' || !record.name.trim() || record.name.length > 80)) throw new Error('未知食物须填写名称和生熟状态。')
  return record
}
export function upsertRecord(records, record, editingId = null) {
  validateRecord(record)
  const sameFood = existing => existing.date === record.date && existing.foodId === record.foodId && (record.foodId !== 'unknown' || (existing.name.trim() === record.name.trim() && existing.state === record.state))
  let merged = null
  if (editingId !== null) {
    const target = records.find(r => r.id === editingId)
    if (!target || record.id !== editingId) throw new Error('待修改记录不存在。')
    merged = { ...record }
  } else {
    if (records.some(r => r.id === record.id)) throw new Error('重复记录编号。')
    const existing = records.find(sameFood)
    if (existing) {
      // 同一食物重复添加时累加克数，而不是报错；总克数仍受单日上限约束。
      const grams = existing.grams + record.grams
      if (grams > 2000) throw new Error('该食物当日累计克数超过2000克。')
      merged = { ...existing, grams }
    } else {
      merged = { ...record }
    }
  }
  const others = records.filter(r => r.id !== merged.id)
  return [...others, merged]
}
export function parseStorage(raw) {
  if (raw === null) return { version: 1, records: [], complete: {} }
  const data = JSON.parse(raw)
  if (!data || data.version !== 1 || !Array.isArray(data.records) || !data.complete || typeof data.complete !== 'object' || Array.isArray(data.complete)) throw new Error('存储格式无效')
  let checked = []
  data.records.forEach(r => { checked = upsertRecord(checked, r) })
  for (const [date, complete] of Object.entries(data.complete)) if (!validDate(date) || typeof complete !== 'boolean') throw new Error('完整记录标记无效')
  return { version: 1, records: checked, complete: data.complete }
}
// 摄入 = 每种食物每 100 克含量 × 实际克数 / 100，跨食物累加；缺失项不计 0。
export function summarize(records, date, nutrient = 'fiber') {
  if (!validDate(date)) throw new Error('日期无效')
  const selected = records.filter(r => r.date === date)
  let known = 0, missing = 0
  const seen = new Set()
  for (const record of selected) {
    validateRecord(record)
    if (seen.has(record.id)) throw new Error('重复记录编号')
    seen.add(record.id)
    const food = foods.find(f => f.id === record.foodId)
    const value = food && food.nutrients[nutrient]
    if (typeof value !== 'number' || !Number.isFinite(value)) missing++
    else known += value * record.grams / food.servingGrams
  }
  return { known: selected.length && missing < selected.length ? known : null, missing, count: selected.length }
}
// 参考值：纤维 EFSA AI 25 g/天；蛋白质 EFSA PRI 体重×0.83 g/天；
// 能量需要按体重 25–30 kcal/kg（成人常用估算）得出区间，碳水（供能45–60%）与脂肪（20–35%）据此换算为克数区间。
// 参考值基于全天需要，与当天已记录多少无关；缺失数据的项目不计入摄入，但不阻断比较。
export function compareNutrients(summaries, profile, complete) {
  const weight = profile && typeof profile.weight === 'number' && Number.isFinite(profile.weight) && profile.weight > 0 && profile.weight <= 500
    ? profile.weight
    : null
  const energyMin = weight !== null ? 25 * weight : null
  const energyMax = weight !== null ? 30 * weight : null
  const defined = (lower, upper) => ({ lower, upper, range: upper !== undefined })
  const targets = {
    fiber: defined(references.fiber.value),
    protein: weight !== null ? defined(weight * references.protein.value) : defined(null),
    carbohydrate: energyMin !== null ? defined(0.45 * energyMin / 4, 0.60 * energyMax / 4) : defined(null),
    fat: energyMin !== null ? defined(0.20 * energyMin / 9, 0.35 * energyMax / 9) : defined(null),
  }
  const result = {}
  for (const key of Object.keys(targets)) {
    const summary = summaries[key] || { known: null, missing: 0, count: 0 }
    const target = targets[key]
    const comparable = target.lower !== null && complete === true && summary.count > 0 && summary.known !== null
    const gap = comparable ? Math.max(0, target.lower - summary.known) : null
    const above = comparable && target.upper !== undefined ? Math.max(0, summary.known - target.upper) : null
    result[key] = { target: target.lower, upper: target.upper ?? null, range: target.upper !== undefined, gap, above, upperLimit: null }
  }
  return result
}
export function recommend(records, date, profile, complete, excluded = [], nutrient = 'fiber') {
  const summaries = {}
  for (const key of ['fiber', 'protein', 'carbohydrate', 'fat', 'energy']) summaries[key] = summarize(records, date, key)
  const result = compareNutrients(summaries, profile, complete)[nutrient]
  if (!result || !result.gap || !Array.isArray(excluded)) return []
  // 产品保守限制而非医学上限；肉鱼蛋共享每日额度。每个备选独立计算，只选一项。
  const eaten = { meatFish: 0, fruit: 0, vegetable: 0, other: 0 }
  for (const record of records.filter(r => r.date === date)) {
    const food = foods.find(f => f.id === record.foodId)
    if (food) eaten[categoryGroup(food.category)] += record.grams
  }
  return foods.filter(f => !excluded.includes(f.id) && f.nutrients[nutrient] > 0).map(food => {
    const group = categoryGroup(food.category)
    const [single, daily] = GROUP_LIMITS[group]
    const cap = Math.min(single, Math.max(0, daily - eaten[group]))
    const grams = Math.floor(Math.min(cap, result.gap * food.servingGrams / food.nutrients[nutrient]) / 5) * 5
    const amount = grams * food.nutrients[nutrient] / food.servingGrams
    return { food, grams, nutrient, amount, [nutrient]: amount }
  }).filter(item => item.grams >= 25).sort((a, b) => b.amount - a.amount || a.food.id.localeCompare(b.food.id)).slice(0, 3)
}
