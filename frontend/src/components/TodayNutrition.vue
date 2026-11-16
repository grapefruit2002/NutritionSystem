<script>
import { foods, nutrients, references, STORAGE_KEY, GRAMS_STEP, localDate, validDate, parseStorage, upsertRecord, summarize, compareNutrients, recommend } from '../data/todayNutrition.mjs'
const PRIMARY = ['fiber', 'protein', 'carbohydrate', 'fat']
const UNKNOWN_ID = 'unknown'
export default {
  name: 'TodayNutrition',
  data() {
    return { foods, nutrients, references, STORAGE_KEY, GRAMS_STEP, primaryNutrients: PRIMARY, date: localDate(), records: [], complete: {}, storageBlocked: false, storageSnapshot: null, error: '', notice: '', editingId: null,
      foodSearch: '', form: { foodId: null, name: '', state: '生可食部', grams: 50 }, draft: [],
      profile: { weight: '' } }
  },
  computed: {
    dayRecords() { return this.records.filter(r => r.date === this.date) },
    summaries() { return Object.fromEntries(['fiber', 'protein', 'carbohydrate', 'fat', 'energy'].map(key => [key, validDate(this.date) ? summarize(this.records, this.date, key) : { known: null, missing: 0, count: 0 }])) },
    comparisons() { return compareNutrients(this.summaries, this.profile, this.complete[this.date]) },
    suggestions() { return Object.fromEntries(PRIMARY.map(key => [key, validDate(this.date) ? recommend(this.records, this.date, this.profile, this.complete[this.date], [], key) : []])) },
    filteredFoods() {
      const query = this.foodSearch.trim().toLocaleLowerCase()
      const matches = query
        ? this.foods.filter(food => [food.name, food.alias, food.category].join(' ').toLocaleLowerCase().includes(query))
        : this.foods
      return [{ id: UNKNOWN_ID, name: '其他食物（营养数据未知）', state: '生可食部' }, ...matches].slice(0, 9)
    },
    selectedName() {
      if (this.form.foodId === UNKNOWN_ID) return '其他食物（营养数据未知）'
      const food = this.foods.find(f => f.id === this.form.foodId)
      return food ? food.name : ''
    },
  },
  mounted() {
    try { this.storageSnapshot = localStorage.getItem(STORAGE_KEY); const data = parseStorage(this.storageSnapshot); this.records = data.records; this.complete = data.complete }
    catch (e) { this.storageBlocked = true; this.error = '本地数据无法读取或格式损坏，已停止保存以保护原记录；本次仍可临时记录，刷新后不保留。' }
  },
  methods: {
    amount(value) { return value === null ? '未知' : Math.round(value).toLocaleString() },
    foodName(record) { const food = this.foods.find(f => f.id === record.foodId); return food ? food.name : record.name },
    persist() {
      if (this.storageBlocked) { this.notice = '仅保留在当前页面，未写入本地存储。'; return }
      try {
        if (localStorage.getItem(STORAGE_KEY) !== this.storageSnapshot) {
          this.storageBlocked = true
          this.notice = '其他页面已修改记录，本次修改未保存，已停止写入以防覆盖。请记下本次输入并刷新页面以读取最新记录。'
          return
        }
        const raw = JSON.stringify({ version: 1, records: this.records, complete: this.complete })
        localStorage.setItem(STORAGE_KEY, raw)
        this.storageSnapshot = raw
        this.notice = '已保存在本机本浏览器。'
      }
      catch (e) { this.notice = '保存失败（存储不可用或空间不足），本次修改仅保留在当前页面。' }
    },
    pickFood(food) {
      this.form.foodId = food.id
      this.form.name = food.id === UNKNOWN_ID ? '' : food.name
      this.form.state = food.id === UNKNOWN_ID ? '生可食部' : food.state
      this.foodSearch = ''
      this.error = ''
    },
    clearFood() { this.form.foodId = null; this.form.name = ''; this.error = '' },
    addToDraft() {
      this.error = ''
      if (!this.form.foodId) { this.error = '请先搜索并选择食物。'; return }
      const grams = Number(this.form.grams)
      if (!Number.isFinite(grams) || grams <= 0 || grams > 2000) { this.error = '克数须大于0且不超过2000。'; return }
      const sameFood = item => item.foodId === this.form.foodId && (this.form.foodId !== UNKNOWN_ID || (item.name === this.form.name.trim() && item.state === this.form.state))
      const existing = this.draft.find(sameFood)
      if (existing) {
        if (existing.grams + grams > 2000) { this.error = '该食物累计克数超过2000克。'; return }
        existing.grams += grams
      } else {
        this.draft = [...this.draft, { foodId: this.form.foodId, name: this.form.name, state: this.form.foodId === UNKNOWN_ID ? this.form.state : this.foods.find(f => f.id === this.form.foodId).state, grams }]
      }
      this.foodSearch = ''
      this.form = { foodId: null, name: '', state: '生可食部', grams: 50 }
    },
    removeDraft(index) { this.draft = this.draft.filter((item, i) => i !== index) },
    saveDraft() {
      this.error = ''
      try {
        let updated = this.records
        if (this.editingId) {
          updated = upsertRecord(updated, { ...this.draft[0], id: this.editingId, date: this.date }, this.editingId)
        } else {
          if (!this.draft.length) { this.error = '请先添加至少一种食物。'; return }
          this.draft.forEach((item, index) => {
            updated = upsertRecord(updated, { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${index}`, date: this.date })
          })
        }
        this.records = updated
        this.$set(this.complete, this.date, false)
        this.persist()
        this.cancel()
      } catch (e) { this.error = e.message }
    },
    edit(record) { this.editingId = record.id; this.draft = [{ foodId: record.foodId, name: record.name, state: record.state, grams: record.grams }]; this.form = { foodId: record.foodId, name: record.name || '', state: record.state, grams: record.grams }; this.error = '' },
    cancel() { this.editingId = null; this.draft = []; this.foodSearch = ''; this.form = { foodId: null, name: '', state: '生可食部', grams: 50 } },
    remove(record) { this.records = this.records.filter(r => r.id !== record.id); this.$set(this.complete, this.date, false); if (this.editingId === record.id) this.cancel(); this.persist() },
    setComplete(event) { if (!validDate(this.date)) return; this.$set(this.complete, this.date, event.target.checked); this.persist() },
  },
}
</script>

<template>
  <section class="today-nutrition" aria-labelledby="today-heading">
    <header>
      <span class="section-kicker">TODAY · FOOD LIBRARY</span>
      <h2 id="today-heading">今日营养</h2>
      <p class="tn-note">搜索首页食物库里的食物，累加克数记录今天吃了什么；摄入量按每种食物每 100 克含量 × 实际克数折算后累加，再与参考值比较。食物库为结构演示值，缺失的营养项不按零计算；记录只保存在本机本浏览器。</p>
    </header>
    <label class="tn-date">记录日期 <input v-model="date" type="date" @change="cancel" /></label>

    <div class="tn-grid">
      <section class="tn-card">
        <h3>{{ editingId ? '修改记录' : '今天吃了什么' }}</h3>
        <div class="tn-search">
          <input v-model="foodSearch" type="search" placeholder="模糊搜索食物，如 香蕉、鱼、鸡" @input="error = ''" />
          <div v-if="foodSearch.trim()" class="tn-results">
            <button v-for="food in filteredFoods" :key="food.id" type="button" @click="pickFood(food)">
              {{ food.emoji }} {{ food.name }}<small v-if="food.category"> · {{ food.category }}</small>
            </button>
            <p v-if="!filteredFoods.length">没有匹配的食物，可选「其他食物」如实记录。</p>
          </div>
        </div>
        <p v-if="selectedName" class="tn-chosen">已选：{{ selectedName }} <button type="button" @click="clearFood">重选</button></p>
        <template v-if="form.foodId === 'unknown'">
          <p class="tn-muted">名称<input v-model.trim="form.name" maxlength="80" />，状态<select v-model="form.state"><option>生可食部</option><option>熟/即食可食部</option></select>（不计入营养估算）。</p>
        </template>
        <p v-else-if="form.foodId" class="tn-muted">按该食物标注的计量基准（{{ foods.find(f => f.id === form.foodId).state }}）填写；同一种食物再次添加会累加克数。</p>
        <div class="tn-grams-row">
          <label>克数<input v-model.number="form.grams" type="number" min="1" max="2000" step="50" /></label>
          <button type="button" class="tn-primary" @click="addToDraft">加入</button>
        </div>
        <ul v-if="draft.length" class="tn-records">
          <li v-for="(item, index) in draft" :key="index"><strong>{{ item.foodId === 'unknown' ? item.name : foodName(item) }}</strong><span>{{ item.grams }} 克</span><button type="button" @click="removeDraft(index)">移除</button></li>
        </ul>
        <p v-else class="tn-muted">还没加入食物；可连续加入多种后一起保存。</p>
        <button type="button" class="tn-primary" @click="saveDraft">{{ editingId ? '保存修改' : (draft.length ? `保存这 ${draft.length} 种食物` : '保存') }}</button>
        <button v-if="editingId || draft.length" type="button" @click="cancel">取消</button>
        <p v-if="error" role="alert" class="tn-error">{{ error }}</p><p aria-live="polite">{{ notice }}</p>
      </section>

      <section class="tn-card">
        <h3>{{ date || '请选择日期' }} 已记录</h3>
        <p v-if="!dayRecords.length">尚无记录。空记录不是零摄入。</p>
        <ul class="tn-records">
          <li v-for="record in dayRecords" :key="record.id"><strong>{{ foodName(record) }}</strong><span>{{ record.grams }} 克</span><span><button type="button" @click="edit(record)">修改</button> <button type="button" @click="remove(record)">删除</button></span></li>
        </ul>
        <label class="tn-check"><input type="checkbox" :checked="complete[date] === true" :disabled="!dayRecords.length || !date" @change="setComplete" />我确认该日期全天所有食物均已记录（增删改后需重新确认）</label>
      </section>
    </div>

    <section class="tn-card">
      <h3>今天还差什么</h3>
      <div class="tn-grams-row tn-profile">
        <label>体重（kg，用于蛋白质参考）<input v-model.number="profile.weight" type="number" min="1" max="500" step="0.5" /></label>
      </div>
      <p class="tn-muted">参考值适用健康、非孕期非哺乳期的 19 岁及以上成人：膳食纤维为欧洲 EFSA AI（25 g/天），蛋白质为 EFSA PRI（体重 × 0.83 g/天）；能量需要按体重 25–30 kcal/kg 估算，碳水化合物（供能 45–60%）与脂肪（20–35%）据此换算为克数区间——参考值基于全天需要，与当天已记录多少无关。均非中国 DRIs、非个体处方，病患或用药者不适用。</p>
      <table class="tn-table">
        <thead><tr><th>营养项</th><th>今天已知摄入</th><th>参考值</th><th>算术差额</th></tr></thead>
        <tbody>
          <tr v-for="key in primaryNutrients" :key="key">
            <td>{{ nutrients[key].name }}（{{ nutrients[key].unit }}）</td>
            <td>{{ amount(summaries[key].known) }}<small v-if="summaries[key].missing"> · {{ summaries[key].missing }} 条食物该项数据未知，未计入</small></td>
            <td>
              <template v-if="comparisons[key].target === null">未设置（需填体重）</template>
              <template v-else-if="comparisons[key].range">{{ amount(comparisons[key].target) }}–{{ amount(comparisons[key].upper) }}</template>
              <template v-else>{{ amount(comparisons[key].target) }}</template>
            </td>
            <td>
              <template v-if="comparisons[key].gap !== null">{{ amount(comparisons[key].gap) }}<small v-if="comparisons[key].above > 0"> · 已超出参考区间上限，按 0 计</small></template>
              <template v-else-if="summaries[key].known === null && summaries[key].count > 0">该营养项全部未知，无法计算</template>
              <template v-else>尚无已知摄入，无法比较</template>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="tn-muted">差额 = 参考下限 − 今天已知摄入，超出时按 0 计。某营养项数据缺失的食物不计入该项摄入（行内单独标注），因此实际摄入可能更高、差额更小。低于参考不等于缺乏；单日差额不是缺乏症诊断。</p>
      <div v-for="key in primaryNutrients" :key="'s-' + key" class="tn-suggest">
        <template v-if="suggestions[key].length">
          <strong>补 {{ nutrients[key].name }} 备选（至多选一项，不是全部都吃）：</strong>
          <ul><li v-for="item in suggestions[key]" :key="item.food.id">{{ item.food.name }} {{ item.grams }} 克，约 +{{ amount(item.amount) }} {{ nutrients[key].unit }}</li></ul>
        </template>
      </div>
      <p v-if="primaryNutrients.every(key => !suggestions[key].length)" class="tn-muted">当前无可生成的补充备选：需要完整记录、填写适用参考且存在差额。份量按固定规则限制（肉鱼蛋合计≤150克/天、单份≤100克，水果≤350克/天，蔬菜≤500克/天，其他≤300克/天），是产品保守限制而非医学上限；不推荐补充剂。</p>
    </section>
  </section>
</template>
