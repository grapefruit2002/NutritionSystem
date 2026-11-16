import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import * as data from '../src/data/todayNutrition.mjs'

const compiler = (await import('../node_modules/vue-template-compiler/index.js')).default
const src = fs.readFileSync(new URL('../src/components/TodayNutrition.vue', import.meta.url), 'utf8')
const parsed = compiler.parseComponent(src)
const compiled = compiler.compile(parsed.template.content)
assert.deepEqual(compiled.errors, [], '模板编译无错误')
assert.ok(!parsed.template.content.includes('+{{ GRAMS_STEP }}'), '±50g 按钮已移除')
assert.ok(!parsed.template.content.includes('钾'), '钾相关界面已移除')
assert.ok(parsed.template.content.includes('按 0 计'), '差额超出按 0 计')

const script = src.split('<script>')[1].split('</script>')[0]
  .replace(/^import .*$/gm, '')
  .replace('export default', 'component =')
let raw = null
const storage = { getItem: () => raw, setItem: (k, v) => { raw = v } }
const ctx = { ...data, component: null, localStorage: storage }
vm.createContext(ctx)
vm.runInContext(script, ctx)
const component = ctx.component
const state = component.data()
const bind = (target) => {
  for (const [name, method] of Object.entries(component.methods)) target[name] = method.bind(target)
  target.$set = (object, key, value) => { object[key] = value }
  return target
}
const page = bind(state)
const computedOf = (name) => component.computed[name].call(page)

page.date = '2026-11-16'
// 模糊搜索命中食物库
page.foodSearch = '燕麦'
const hits = computedOf('filteredFoods')
const oats = hits.find(f => f.id === 'oats-dry')
assert.ok(oats, '模糊搜索命中燕麦（首页食物库）')
page.pickFood(oats)
page.form.grams = 100
page.addToDraft()
// 换一种食物
page.foodSearch = '香蕉'
page.pickFood(computedOf('filteredFoods').find(f => f.id === 'banana'))
page.form.grams = 200
page.addToDraft()
assert.equal(page.draft.length, 2, '一次记录多种食物')
// 同种食物累加
page.foodSearch = '香蕉'
page.pickFood(computedOf('filteredFoods').find(f => f.id === 'banana'))
page.form.grams = 50
page.addToDraft()
assert.equal(page.draft.length, 2, '同种食物累加而非新增')
assert.equal(page.draft.find(d => d.foodId === 'banana').grams, 250)
page.saveDraft()
assert.equal(page.records.length, 2)
// 摄入按每100克×克数折算累加：燕麦纤维 10.6 + 香蕉 1.2×2.5 = 13.6
const fiber = data.summarize(page.records, page.date, 'fiber')
assert.ok(Math.abs(fiber.known - 13.6) < 1e-9, `纤维摄入=13.6，实际 ${fiber.known}`)
// 差额 = 25 - 13.6 = 11.4（需勾选完整记录后比较）
const complete = { '2026-11-16': true }
const summaries = Object.fromEntries(['fiber', 'protein', 'carbohydrate', 'fat', 'energy'].map(key => [key, data.summarize(page.records, page.date, key)]))
const comparison = data.compareNutrients(summaries, page.profile, complete['2026-11-16']).fiber
assert.equal(comparison.target, 25)
assert.ok(Math.abs(comparison.gap - 11.4) < 1e-9)
// 未填体重时蛋白质参考为未设置，不瞎算；碳水脂肪依赖能量推算
assert.equal(data.compareNutrients(summaries, page.profile, true).protein.target, null)
console.log('模糊搜索、食物库来源、累加与按100克折算验证通过')
