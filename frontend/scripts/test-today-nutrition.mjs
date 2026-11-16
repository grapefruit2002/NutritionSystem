import test from 'node:test'
import assert from 'node:assert/strict'
import { foods, GRAMS_STEP, validDate, localDate, parseStorage, upsertRecord, summarize, compareNutrients, recommend, categoryGroup } from '../src/data/todayNutrition.mjs'
const date = '2026-11-16'
const profile = { weight: 60 }
const state = id => foods.find(f => f.id === id).state
const row = (overrides = {}) => ({ id: 'a', date, foodId: 'oats-dry', grams: 100, state: state('oats-dry'), ...overrides })
const summariesOf = (records) => Object.fromEntries(['fiber', 'protein', 'carbohydrate', 'fat', 'energy'].map(key => [key, summarize(records, date, key)]))
test('食物库按每100克含量 × 克数折算，跨食物累加；能量按宏量系数推算', () => {
  assert.equal(GRAMS_STEP, 50)
  assert.equal(foods.length, 80)
  const oats = summarize([row()], date, 'fiber')
  assert.ok(Math.abs(oats.known - 10.6) < 1e-9)
  const mixed = summarize([row(), { id: 'b', date, foodId: 'banana', grams: 200, state: state('banana') }], date, 'fiber')
  assert.ok(Math.abs(mixed.known - (10.6 + 1.2 * 2)) < 1e-9)
  // 黄豆（煮）：蛋白16.6×4 + 碳水8.4×4 + 脂肪8×9 = 172；燕麦缺碳水脂肪 → 能量未知
  const soy = summarize([{ id: 's', date, foodId: 'soybean-cooked', grams: 100, state: state('soybean-cooked') }], date, 'energy')
  assert.ok(Math.abs(soy.known - 172) < 1e-9, `能量=${soy.known}`)
  assert.equal(summarize([row()], date, 'energy').known, null)
})
test('缺失营养项不计0但不阻断比较：奶类无纤维时纤维仍按已知部分计算', () => {
  const milk = foods.find(f => f.id === 'milk-whole')
  const summary = summarize([{ id: 'm', date, foodId: milk.id, grams: 300, state: milk.state }], date, 'fiber')
  assert.equal(summary.known, null); assert.equal(summary.missing, 1)
  const mixed = summarize([
    { id: 'm', date, foodId: milk.id, grams: 300, state: milk.state },
    { id: 't', date, foodId: 'tomato', grams: 50, state: state('tomato') },
  ], date, 'fiber')
  assert.ok(Math.abs(mixed.known - 0.6) < 1e-9); assert.equal(mixed.missing, 1)
  const comparison = compareNutrients(summariesOf([
    { id: 'm', date, foodId: milk.id, grams: 300, state: milk.state },
    { id: 't', date, foodId: 'tomato', grams: 50, state: state('tomato') },
  ]), profile, true)
  assert.ok(Math.abs(comparison.fiber.gap - (25 - 0.6)) < 1e-9, '未知项不阻断，差额按已知摄入计算')
  const allUnknown = summarize([{ id: 'u', date, foodId: 'unknown', name: '米饭', state: '熟/即食可食部', grams: 100 }], date, 'fiber')
  assert.equal(allUnknown.known, null)
})
test('日期严格校验、按本地日期且记录隔离', () => {
  assert.equal(validDate('2026-02-29'), false); assert.equal(validDate('2024-02-29'), true)
  assert.equal(validDate('2026-2-01'), false); assert.equal(validDate(''), false)
  assert.equal(localDate(new Date(2026, 10, 16, 0, 1)), date)
  assert.equal(summarize([row({ date: '2026-11-15' })], date).known, null)
})
test('拒绝NaN、无穷、负数、0、字符串、过大克数与计量基准不匹配', () => {
  for (const grams of [NaN, Infinity, -1, 0, '50', 2001]) assert.throws(() => upsertRecord([], row({ grams })))
  assert.throws(() => upsertRecord([], row({ state: '生可食部' })))
  assert.throws(() => upsertRecord([], row({ foodId: 'not-in-library' })))
  assert.throws(() => upsertRecord([], row({ date: '2026-02-30' })))
})
test('同一食物重复添加累加克数，跨日期隔离，修改不追加', () => {
  const records = upsertRecord([], row())
  const merged = upsertRecord(records, row({ id: 'b', grams: 50 }))
  assert.equal(merged.length, 1); assert.equal(merged[0].grams, 150)
  assert.equal(upsertRecord(merged, row({ id: 'c', grams: 1850 }))[0].grams, 2000)
  assert.throws(() => upsertRecord(merged, row({ id: 'd', grams: 1851 })))
  assert.equal(upsertRecord([], row({ meal: '夜宵' })).length, 1)
  const updated = upsertRecord(merged, row({ grams: 90 }), 'a')
  assert.equal(updated.length, 1); assert.equal(updated[0].grams, 90)
  assert.throws(() => upsertRecord(merged, row(), 'missing'))
  assert.equal(upsertRecord(records, row({ id: 'e', date: '2026-11-15' })).length, 2)
})
test('持久数据版本隔离及损坏检测', () => {
  assert.deepEqual(parseStorage(null).records, [])
  const data = { version: 1, records: [row()], complete: { [date]: true } }
  assert.deepEqual(parseStorage(JSON.stringify(data)), data)
  for (const raw of ['oops', '{}', JSON.stringify({ ...data, records: [row(), { ...row(), id: 'a' }] }), JSON.stringify({ ...data, complete: { invalid: true } })]) assert.throws(() => parseStorage(raw))
})
test('参考值：纤维固定25、蛋白质与能量按体重、碳水脂肪按供能比×全天能量需要', () => {
  // 体重 60kg → 全天能量 1500–1800 kcal → 碳水 45–60%：168.75–270 g；脂肪 20–35%：33.33–70 g
  const comparisons = compareNutrients(summariesOf([{ id: 's', date, foodId: 'soybean-cooked', grams: 100, state: state('soybean-cooked') }]), profile, true)
  assert.equal(comparisons.fiber.target, 25)
  assert.ok(Math.abs(comparisons.protein.target - 60 * 0.83) < 1e-9)
  assert.ok(Math.abs(comparisons.carbohydrate.target - 0.45 * 1500 / 4) < 1e-9)
  assert.ok(Math.abs(comparisons.carbohydrate.upper - 0.60 * 1800 / 4) < 1e-9)
  assert.ok(Math.abs(comparisons.fat.target - 0.20 * 1500 / 9) < 1e-9)
  assert.ok(Math.abs(comparisons.fat.upper - 0.35 * 1800 / 9) < 1e-9)
  assert.ok(comparisons.carbohydrate.range && comparisons.fat.range)
  // 黄豆碳水 8.4 低于下限 → 差额 160.35；脂肪 8 低于下限 33.33 → 差额 25.33
  assert.ok(Math.abs(comparisons.carbohydrate.gap - (168.75 - 8.4)) < 1e-9)
  assert.ok(Math.abs(comparisons.fat.gap - (100 / 3 - 8)) < 1e-9)
  assert.equal(comparisons.fat.above, 0)
  // 参考区间不随当天已记录多少变化
  const small = compareNutrients(summariesOf([row({ grams: 10 })]), profile, true)
  assert.ok(Math.abs(small.carbohydrate.target - comparisons.carbohydrate.target) < 1e-9)
  // 未填体重 → 蛋白碳水脂肪均未设置
  const noWeight = compareNutrients(summariesOf([row({ grams: 2000 })]), { weight: '' }, true)
  assert.equal(noWeight.protein.target, null)
  assert.equal(noWeight.carbohydrate.target, null); assert.equal(noWeight.fat.target, null)
})
test('差额=参考下限−摄入且超出按0；未勾选完整记录不比较', () => {
  const comparisons = compareNutrients(summariesOf([{ id: 'x', date, foodId: 'banana', grams: 100, state: state('banana') }]), profile, true)
  assert.ok(Math.abs(comparisons.fiber.gap - (25 - 1.2)) < 1e-9)
  assert.equal(compareNutrients(summariesOf([row()]), profile, false).fiber.gap, null)
  const protein = compareNutrients(summariesOf([row({ grams: 2000 })]), profile, true)
  assert.ok(Math.abs(protein.protein.target - 60 * 0.83) < 1e-9)
  assert.equal(protein.protein.gap, 0); assert.equal(protein.protein.above, null, '蛋白质无上限，超出只表现为差额0')
  // 米饭200g+卤鸡腿50g：碳水 53.2，低于下限 168.75 → 差额 115.55（米饭不再被误判为碳水超标）
  const riceRecords = [
    { id: 'r', date, foodId: 'rice-cooked', grams: 200, state: state('rice-cooked') },
    { id: 'k', date, foodId: 'chicken-leg-braised', grams: 50, state: state('chicken-leg-braised') },
  ]
  const riceSummary = summarize(riceRecords, date, 'carbohydrate')
  assert.ok(Math.abs(riceSummary.known - (25.9 * 2 + 2.8 * 0.5)) < 1e-9)
  const riceMeal = compareNutrients(summariesOf(riceRecords), profile, true)
  assert.ok(Math.abs(riceMeal.carbohydrate.gap - (168.75 - 53.2)) < 1e-9)
})
test('建议确定排序、排除与份量上限', () => {
  const suggestions = recommend([{ id: 'a', date, foodId: 'banana', grams: 100, state: state('banana') }], date, profile, true, ['banana'], 'fiber')
  assert.equal(suggestions.length, 3)
  assert.ok(suggestions.every(s => s.grams >= 25 && s.grams % 5 === 0))
  assert.ok(suggestions.every(s => s.food.id !== 'banana'))
  assert.deepEqual(suggestions, recommend([{ id: 'a', date, foodId: 'banana', grams: 100, state: state('banana') }], date, profile, true, ['banana'], 'fiber'))
  const proteinSuggest = recommend([{ id: 'a', date, foodId: 'banana', grams: 100, state: state('banana') }], date, { weight: 60 }, true, [], 'protein')
  assert.ok(proteinSuggest.length > 0 && proteinSuggest.every(s => s.food.nutrients.protein > 0))
  assert.deepEqual(recommend([], date, profile, true, [], 'fiber'), [])
})
test('分类限额包含所有当日同类，肉鱼蛋共享额度', () => {
  assert.deepEqual(categoryGroup('畜禽肉'), 'meatFish'); assert.deepEqual(categoryGroup('水产'), 'meatFish')
  assert.deepEqual(categoryGroup('蛋类'), 'meatFish'); assert.deepEqual(categoryGroup('水果'), 'fruit')
  assert.deepEqual(categoryGroup('蔬菜 · 叶菜'), 'vegetable'); assert.deepEqual(categoryGroup('奶类'), 'other')
  const veg = recommend([row({ id: 'c', foodId: 'spinach-raw', grams: 400, state: state('spinach-raw') })], date, profile, true, [], 'fiber')
  assert.ok(veg.every(s => categoryGroup(s.food.category) !== 'vegetable' || s.grams <= 100))
})
