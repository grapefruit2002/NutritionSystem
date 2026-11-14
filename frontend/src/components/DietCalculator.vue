<script>
import { Beef, Candy, Droplets, Flame, GripVertical, Leaf, Search, Soup, Wheat, X } from 'lucide-vue'
import {
  demoFoods, demoPopulations, foodEnergyPer100g,
  getReferenceCardItem, nutrientMeta,
} from '../data/nutritionData'
import { saveMealLog } from '../services/nutritionApi'

// 能量单独做成醒目大卡，其余按进度条展示。
const TRACKED = ['protein', 'fat', 'carbohydrate', 'sodium', 'sugar', 'dietary-fiber']

// 每条指标独立的配色主题与图标，避免右侧全是同一抹绿。
const ROW_THEME = {
  protein: { theme: 'is-protein', icon: Beef },
  fat: { theme: 'is-fat', icon: Droplets },
  carbohydrate: { theme: 'is-carb', icon: Wheat },
  sodium: { theme: 'is-sodium', icon: Soup },
  sugar: { theme: 'is-sugar', icon: Candy },
  'dietary-fiber': { theme: 'is-fiber', icon: Leaf },
}

export default {
  name: 'DietCalculator',
  components: { Beef, Candy, Droplets, Flame, GripVertical, Leaf, Search, Soup, Wheat, X },
  data() {
    return {
      populations: demoPopulations,
      population: 'adult',
      foods: demoFoods,
      search: '',
      grams: 100,
      items: [],
      nextUid: 1,
      dragIndex: null,
      dragOverIndex: null,
      mealType: 'lunch',
      saveState: 'idle',
      saveMessage: '',
    }
  },
  computed: {
    filteredFoods() {
      const q = this.search.trim().toLocaleLowerCase()
      const list = this.foods.filter((food) => !q
        || [food.name, food.alias || '', food.category].join(' ').toLocaleLowerCase().includes(q))
      return list.slice(0, 8)
    },
    rows() {
      return this.items.map((item) => {
        const food = this.foods.find((entry) => entry.id === item.foodId)
        if (!food) return null
        const factor = item.grams / 100
        const nutrients = {}
        Object.keys(food.nutrients).forEach((slug) => {
          nutrients[slug] = food.nutrients[slug] * factor
        })
        nutrients.energy = foodEnergyPer100g(food) * factor
        return { uid: item.uid, food, grams: item.grams, nutrients }
      }).filter(Boolean)
    },
    totals() {
      const totals = {}
      this.rows.forEach((row) => {
        Object.keys(row.nutrients).forEach((slug) => {
          totals[slug] = (totals[slug] || 0) + row.nutrients[slug]
        })
      })
      return totals
    },
    reference() {
      const value = (slug) => {
        const item = getReferenceCardItem(slug)
        return item && item.values ? item.values[this.population] : null
      }
      return {
        energy: value('energy'),
        protein: value('protein'),
        fat: value('fat'),
        carbohydrate: value('carbohydrate'),
        sodium: value('sodium'),
        sugar: value('sugar'),
        'dietary-fiber': value('dietary-fiber'),
      }
    },
    energyCard() {
      const total = this.totals.energy || 0
      const ref = this.reference.energy
      const percent = ref ? Math.round((total / ref) * 100) : 0
      let hint = '添加食物后显示'
      if (this.hasItems && ref) {
        hint = total > ref
          ? `超出 ${this.format(total - ref)} kcal`
          : `还可以吃 ${this.format(ref - total)} kcal`
      }
      return { total, ref, percent: Math.min(100, percent), over: ref ? total > ref : false, hint }
    },
    progressRows() {
      return TRACKED.map((slug) => {
        const meta = nutrientMeta(slug)
        const total = this.totals[slug] || 0
        const refItem = getReferenceCardItem(slug)
        const ref = this.reference[slug]
        const percent = ref ? Math.min(100, Math.round((total / ref) * 100)) : 0
        const over = ref ? total > ref : false
        const theme = ROW_THEME[slug] || { theme: 'is-default', icon: null }
        let hint = ''
        if (!this.hasItems) hint = '尚未添加食物'
        else if (!ref) hint = '暂无参考值'
        else if (over) hint = `超出 ${this.format(total - ref)} ${meta.unit || ''}`.trim()
        else hint = `还差 ${this.format(ref - total)} ${meta.unit || ''}`.trim()
        // 糖一栏统计的是总糖（含天然糖），而参考值是添加糖上限，故名称需写明口径。
        const displayName = slug === 'sugar' ? '总糖' : ((refItem && refItem.name) || meta.name)
        return {
          slug,
          name: displayName,
          unit: meta.unit || ((refItem && refItem.unit) ? refItem.unit.replace(/\/d$/, '') : ''),
          total,
          ref,
          percent,
          over,
          theme: theme.theme,
          icon: theme.icon,
          hint,
        }
      })
    },
    macroEnergy() {
      const protein = (this.totals.protein || 0) * 4
      const fat = (this.totals.fat || 0) * 9
      const carbohydrate = (this.totals.carbohydrate || 0) * 4
      const sum = protein + fat + carbohydrate
      const share = (value) => (sum ? Math.round((value / sum) * 100) : 0)
      return { protein: share(protein), fat: share(fat), carbohydrate: share(carbohydrate), sum }
    },
    hasItems() {
      return this.rows.length > 0
    },
    totalGrams() {
      return this.rows.reduce((sum, row) => sum + row.grams, 0)
    },
  },
  methods: {
    // 某食物当前已添加的克数；大于 0 表示再添加会累加到这一行。
    addedGrams(foodId) {
      const item = this.items.find((entry) => entry.foodId === foodId)
      return item ? item.grams : 0
    },
    addFood(food) {
      const grams = Number(this.grams)
      const amount = Number.isFinite(grams) && grams > 0 ? grams : 100
      // 同一种食物不重复成行：再次添加时把克数累加到已有那行。
      const existing = this.items.find((item) => item.foodId === food.id)
      if (existing) {
        // 与输入框上限保持一致，避免累加后出现无法编辑的超大数值。
        existing.grams = Math.min(2000, existing.grams + amount)
      } else {
        this.items.push({
          uid: this.nextUid++,
          foodId: food.id,
          grams: amount,
        })
      }
      this.search = ''
    },
    removeItem(uid) {
      this.items = this.items.filter((item) => item.uid !== uid)
    },
    // —— 拖拽排序 ——
    onDragStart(index, event) {
      this.dragIndex = index
      this.dragOverIndex = index
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        // Firefox 需要设置数据才会触发拖拽
        event.dataTransfer.setData('text/plain', String(index))
      }
    },
    onDragOver(index, event) {
      if (this.dragIndex === null || this.dragIndex === index) return
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
      this.dragOverIndex = index
    },
    onDrop(index) {
      const from = this.dragIndex
      this.dragIndex = null
      this.dragOverIndex = null
      if (from === null || from === index) return
      const next = this.items.slice()
      const moved = next.splice(from, 1)[0]
      next.splice(index, 0, moved)
      this.items = next
    },
    onDragEnd() {
      this.dragIndex = null
      this.dragOverIndex = null
    },
    setGrams(uid, value) {
      const grams = Number(value)
      const item = this.items.find((entry) => entry.uid === uid)
      if (item) item.grams = Number.isFinite(grams) && grams > 0 ? grams : 1
    },
    clearAll() {
      this.items = []
      this.saveState = 'idle'
      this.saveMessage = ''
    },
    // 本地日期，格式 yyyy-mm-dd，供饮食记录使用。
    todayIso() {
      const now = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    },
    // 把当前这一餐持久化到后端（按餐次保存，含营养素快照）。
    async saveCurrentMeal() {
      if (!this.rows.length || this.saveState === 'saving') return
      this.saveState = 'saving'
      this.saveMessage = ''
      try {
        const payload = {
          logDate: this.todayIso(),
          mealType: this.mealType,
          note: null,
          items: this.rows.map((row) => ({
            foodSlug: row.food.id,
            foodName: row.food.name,
            grams: row.grams,
            nutrients: row.nutrients,
          })),
        }
        await saveMealLog(payload)
        this.saveState = 'saved'
        this.saveMessage = '已保存到「饮食记录」'
      } catch (error) {
        this.saveState = 'error'
        this.saveMessage = '保存失败：' + error.message
      }
    },
    format(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
      if (value >= 100) return String(Math.round(value))
      if (value >= 10) return value.toFixed(0)
      return value.toFixed(1)
    },
  },
}
</script>

<template>
  <div class="diet-calculator">
    <div class="diet-toolbar">
      <label class="diet-field">
        <span>参考人群</span>
        <select v-model="population">
          <option v-for="item in populations" :key="item.code" :value="item.code">{{ item.displayName }}</option>
        </select>
      </label>
      <div class="diet-search">
        <Search :size="16" :stroke-width="1.8" />
        <input v-model="search" type="search" placeholder="搜索食物，如 猪瘦肉、米饭、苹果">
        <label class="diet-grams">
          <input v-model.number="grams" type="number" min="1" max="2000">
          <span>克</span>
        </label>
      </div>
    </div>

    <div class="diet-suggest" :class="{ 'is-open': search.trim() }">
      <button v-for="food in filteredFoods" :key="food.id" type="button" class="diet-suggest-item" @click="addFood(food)">
        <span class="diet-suggest-emoji">{{ food.emoji }}</span>
        <span class="diet-suggest-name">{{ food.name }}<small>{{ food.category }}</small></span>
        <span class="diet-suggest-add" :class="{ repeat: addedGrams(food.id) }">
          {{ addedGrams(food.id) ? `再添加 ${format(grams) || 100} 克` : '+ 添加' }}
        </span>
      </button>
    </div>

    <div class="diet-grid">
      <div class="diet-list-panel">
        <div class="diet-list-head">
          <strong>已选食物</strong>
          <span v-if="hasItems">{{ rows.length }} 种 · 共 {{ format(totalGrams) }} 克</span>
          <span v-else>从上方搜索添加</span>
        </div>
        <div class="diet-list">
          <div
            v-for="(row, index) in rows"
            :key="row.uid"
            class="diet-item"
            :class="{
              'is-dragging': dragIndex === index,
              'is-drop-target': dragOverIndex === index && dragIndex !== null && dragIndex !== index,
            }"
            @dragover="onDragOver(index, $event)"
            @drop="onDrop(index)"
            @dragend="onDragEnd"
          >
            <span
              class="diet-item-handle"
              title="拖动调整顺序"
              draggable="true"
              @dragstart="onDragStart(index, $event)"
            ><GripVertical :size="14" /></span>
            <span class="diet-item-emoji">{{ row.food.emoji }}</span>
            <div class="diet-item-main">
              <strong>{{ row.food.name }}</strong>
              <span>{{ row.food.basis }} · {{ row.food.category }}</span>
            </div>
            <label class="diet-item-grams">
              <input type="number" min="50" max="2000" step="50" :value="row.grams" @change="setGrams(row.uid, $event.target.value)">
              <span>克</span>
            </label>
            <span class="diet-item-energy">{{ format(row.nutrients.energy) }} <small>kcal</small></span>
            <button type="button" class="diet-item-remove" aria-label="移除" @click="removeItem(row.uid)"><X :size="15" /></button>
          </div>
          <p v-if="!hasItems" class="diet-empty">还没有添加食物。在上方搜索后点「添加」，或直接点候选食物。</p>
          <button v-if="hasItems" type="button" class="diet-clear" @click="clearAll">清空这一餐</button>
        </div>
      </div>

      <div class="diet-summary">
        <div class="summary-head"><strong>营养构成</strong><span>{{ hasItems ? '按已添加食物的可食部估算' : '添加食物后显示' }}</span></div>

        <div class="energy-card" :class="{ empty: !hasItems, over: energyCard.over }">
          <div class="energy-card-main">
            <span class="energy-card-label"><Flame :size="13" :stroke-width="2" /> 已摄入能量</span>
            <strong class="energy-card-value">{{ format(energyCard.total) }}<small> kcal</small></strong>
            <span class="energy-card-ref">参考 {{ energyCard.ref ? format(energyCard.ref) : '—' }} kcal · {{ energyCard.hint }}</span>
          </div>
          <div class="energy-card-gauge">
            <div class="energy-ring" :style="{ '--p': energyCard.percent }">
              <span class="energy-ring-num">{{ energyCard.percent }}<i>%</i></span>
            </div>
          </div>
        </div>

        <div class="macro-block">
          <div class="macro-title"><span>三大营养素供能比</span><em>{{ macroEnergy.sum ? '按供能占比' : '添加食物后计算' }}</em></div>
          <div class="macro-bar" :class="{ empty: !macroEnergy.sum }">
            <span class="macro-seg macro-protein" :style="{ width: macroEnergy.protein + '%' }"><b v-if="macroEnergy.protein >= 12">{{ macroEnergy.protein }}%</b></span>
            <span class="macro-seg macro-fat" :style="{ width: macroEnergy.fat + '%' }"><b v-if="macroEnergy.fat >= 12">{{ macroEnergy.fat }}%</b></span>
            <span class="macro-seg macro-carb" :style="{ width: macroEnergy.carbohydrate + '%' }"><b v-if="macroEnergy.carbohydrate >= 12">{{ macroEnergy.carbohydrate }}%</b></span>
          </div>
          <div class="macro-legend">
            <span><i class="dot-protein"></i>蛋白质 {{ macroEnergy.protein }}%</span>
            <span><i class="dot-fat"></i>脂肪 {{ macroEnergy.fat }}%</span>
            <span><i class="dot-carb"></i>碳水 {{ macroEnergy.carbohydrate }}%</span>
          </div>
        </div>

        <div class="progress-list">
          <div v-for="row in progressRows" :key="row.slug" class="progress-row" :class="row.theme">
            <div class="progress-head">
              <span class="progress-icon"><component :is="row.icon" :size="11" :stroke-width="2" /></span>
              <span class="progress-name">{{ row.name }}<em v-if="row.slug === 'sugar'" class="progress-tag">对比添加糖上限</em><em v-else-if="row.slug === 'dietary-fiber'" class="progress-tag">建议量</em></span>
              <b class="progress-value">{{ format(row.total) }}<small> / {{ row.ref ? format(row.ref) : '—' }} {{ row.unit }}</small></b>
            </div>
            <div class="progress-track">
              <i :class="{ over: row.over }" :style="{ width: row.percent + '%' }"></i>
            </div>
            <span class="progress-hint" :class="{ over: row.over }">{{ row.hint }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="diet-savebar">
      <label class="diet-field diet-savebar-field">
        <span>保存到</span>
        <select v-model="mealType" :disabled="!hasItems">
          <option value="breakfast">早餐</option>
          <option value="lunch">午餐</option>
          <option value="dinner">晚餐</option>
          <option value="snack">加餐</option>
        </select>
      </label>
      <button
        type="button"
        class="diet-save-btn"
        :disabled="!hasItems || saveState === 'saving'"
        @click="saveCurrentMeal"
      >
        {{ saveState === 'saving' ? '保存中…' : '保存这一餐' }}
      </button>
      <span v-if="saveMessage" class="diet-save-msg" :class="saveState">{{ saveMessage }}</span>
      <span class="diet-save-date">日期 {{ todayIso() }}</span>
    </div>

    <p class="diet-note">能量按蛋白质 ×4、脂肪 ×9、碳水化合物 ×4 折算。「总糖」为实测总糖（含天然糖），右侧参考值是添加糖每日上限（成人 50 克），两者口径不同，水果奶类中的天然糖不计入添加糖。食物成分数据来自中国食物成分表（标准版第 6 版）与 USDA FoodData Central，仅供膳食参考，不用于诊断。</p>
  </div>
</template>
