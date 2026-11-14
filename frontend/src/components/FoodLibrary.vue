<script>
import { CircleHelp, ChevronRight, Search, X } from 'lucide-vue'
import {
  FOOD_SOURCE, FOOD_STATES, baseUnitOf, demoFoods, demoNutrients,
} from '../data/nutritionData'
import { getFoodOverview } from '../services/nutritionApi'

// 数据库保存的是中文状态，前端用 raw/cooked/processed 三态。
const API_STATE_MAP = { 生: 'raw', 熟: 'cooked', 加工: 'processed' }

const KEY_NUTRIENTS = [
  'protein', 'fat', 'carbohydrate', 'vitamin-c', 'calcium', 'iron',
  'zinc', 'vitamin-a', 'vitamin-d', 'vitamin-e', 'sodium',
]

// 食物按「肉蛋奶 / 蔬菜 / 水果 / 主食 / 豆类 / 油脂与调味」归类，
// 以食物 category 前缀匹配，替代原来的生/熟/加工筛选。
const CATEGORY_MAP = {
  meat: ['畜禽肉', '畜禽内脏', '水产', '蛋类', '奶类'],
  vegetable: ['蔬菜', '深色蔬菜'],
  fruit: ['水果'],
  staple: ['谷类', '谷物', '薯类'],
  legume: ['豆类', '豆制品'],
  oil: ['油脂', '调味品'],
}

export default {
  name: 'FoodLibrary',
  components: { CircleHelp, ChevronRight, Search, X },
  data() {
    return {
      query: '',
      categoryFilter: 'all',
      selectedFood: null,
      expanded: false,
      foods: demoFoods,
      loadedFromApi: false,
      categoryTabs: [
        { value: 'all', label: '全部' },
        { value: 'meat', label: '肉蛋奶' },
        { value: 'vegetable', label: '蔬菜' },
        { value: 'fruit', label: '水果' },
        { value: 'staple', label: '主食' },
        { value: 'legume', label: '豆类' },
        { value: 'oil', label: '油脂与调味' },
      ],
      foodSource: FOOD_SOURCE,
    }
  },
  computed: {
    filteredFoods() {
      const q = this.query.trim().toLocaleLowerCase()
      const prefixes = CATEGORY_MAP[this.categoryFilter] || null
      return this.foods.filter((food) => {
        const matchesCategory = !prefixes || prefixes.some((prefix) => food.category.startsWith(prefix))
        const haystack = [food.name, food.alias || '', food.category].join(' ').toLocaleLowerCase()
        return matchesCategory && (!q || haystack.includes(q))
      })
    },
    // 桌面 4 列时 4 行 = 16 个；默认只展示这些，可展开看全部。
    displayFoods() {
      return this.expanded ? this.filteredFoods : this.filteredFoods.slice(0, 16)
    },
    hiddenCount() {
      return Math.max(0, this.filteredFoods.length - 16)
    },
    selectedNutrientRows() {
      if (!this.selectedFood) return []
      const order = demoNutrients.map((item) => item.slug)
      // 展示该食物记录的全部营养素，按营养素目录顺序排列。
      return Object.keys(this.selectedFood.nutrients)
        .filter((slug) => typeof this.selectedFood.nutrients[slug] === 'number')
        .sort((a, b) => order.indexOf(a) - order.indexOf(b))
        .map((slug) => {
          const nutrient = demoNutrients.find((item) => item.slug === slug)
          return {
            slug,
            name: nutrient ? nutrient.name : slug,
            unit: baseUnitOf(nutrient),
            value: this.selectedFood.nutrients[slug],
          }
        })
    },
    comparisonFood() {
      if (!this.selectedFood) return null
      const pairMap = {
        'pork-liver-raw': 'pork-liver-braised',
        'pork-liver-braised': 'pork-liver-raw',
        'spinach-raw': 'spinach-blanched',
        'spinach-blanched': 'spinach-raw',
        'beef-lean-raw': 'beef-lean-stewed',
        'beef-lean-stewed': 'beef-lean-raw',
      }
      const pairId = pairMap[this.selectedFood.id]
      return pairId ? this.foods.find((item) => item.id === pairId) || null : null
    },
  },
  mounted() {
    this.loadFoods()
  },
  watch: {
    query() {
      this.expanded = false
    },
    categoryFilter() {
      this.expanded = false
    },
  },
  methods: {
    // 优先从数据库接口取食物与成分；接口不可用（如 file:// 离线）时保留本地演示数据。
    async loadFoods() {
      try {
        const rows = await getFoodOverview()
        if (!Array.isArray(rows) || !rows.length) return
        const metaById = new Map(demoFoods.map((food) => [food.id, food]))
        this.foods = rows.map((row) => {
          const meta = metaById.get(row.slug) || {}
          const nutrients = {}
          ;(row.nutrients || []).forEach((item) => {
            nutrients[item.nutrientSlug] = item.amountPer100g
          })
          return {
            id: row.slug,
            name: row.name,
            alias: meta.alias || '',
            category: row.category || meta.category || '其他',
            emoji: meta.emoji || '🍽️',
            state: API_STATE_MAP[row.state] || meta.state || 'raw',
            basis: meta.basis || '每 100 克',
            ediblePortion: meta.ediblePortion || 100,
            nutrients,
            note: meta.note || row.description || '',
          }
        })
        this.loadedFromApi = true
      } catch (error) {
        // 接口不可用：继续使用 demoFoods。
      }
    },
    stateMeta(state) {
      return FOOD_STATES[state] || { label: state, hint: '', tone: '' }
    },
    // 卡片预览固定展示最多 3 条：优先取蛋白质/脂肪/碳水等核心项；
    // 核心项不足 3 条时，用该食物其余营养素按目录顺序补齐。
    // 否则像南瓜（以 β-胡萝卜素、膳食纤维、钾、糖为主）只会命中「维生素 A」，
    // 卡片就只剩 1 行，看上去像数据缺失。
    topNutrients(food) {
      const order = demoNutrients.map((item) => item.slug)
      const orderIndex = (slug) => {
        const index = order.indexOf(slug)
        return index === -1 ? order.length : index
      }
      const available = Object.keys(food.nutrients)
        .filter((slug) => typeof food.nutrients[slug] === 'number')
      const picked = []
      KEY_NUTRIENTS.forEach((slug) => {
        if (available.includes(slug) && !picked.includes(slug)) picked.push(slug)
      })
      available
        .filter((slug) => !picked.includes(slug) && food.nutrients[slug] !== 0)
        .sort((a, b) => orderIndex(a) - orderIndex(b))
        .forEach((slug) => {
          if (picked.length < 3) picked.push(slug)
        })
      return picked.slice(0, 3).map((slug) => {
        const nutrient = demoNutrients.find((item) => item.slug === slug)
        return {
          slug,
          name: nutrient ? nutrient.name : slug,
          unit: baseUnitOf(nutrient),
          value: food.nutrients[slug],
        }
      })
    },
    openFood(food) {
      this.selectedFood = food
    },
    closeFood() {
      this.selectedFood = null
    },
    switchComparison() {
      if (this.comparisonFood) this.selectedFood = this.comparisonFood
    },
    formatValue(value) {
      if (typeof value !== 'number') return '—'
      return Number.isInteger(value) ? String(value) : value.toFixed(value < 10 ? 1 : 0)
    },
  },
}
</script>

<template>
  <div class="food-library">
    <div class="food-toolbar">
      <div class="food-search">
        <Search :size="16" :stroke-width="1.8" />
        <input v-model="query" type="search" aria-label="搜索食物" placeholder="搜索食物，如「猪肝」「菠菜」「牛奶」">
      </div>
      <div class="food-state-tabs" role="group" aria-label="食物分类筛选">
        <button v-for="tab in categoryTabs" :key="tab.value" type="button" :class="{ active: categoryFilter === tab.value }" @click="categoryFilter = tab.value">{{ tab.label }}</button>
      </div>
    </div>

    <div class="food-basis-note">
      <CircleHelp :size="14" />
      <span>按 <b>肉蛋奶 / 蔬菜 / 水果 / 主食 / 豆类 / 油脂与调味</b> 分类；每条记录仍标注<b>计量基准</b>与<b>食物状态</b>，生重、熟重、干重不可直接混算。</span>
      <span class="basis-count">{{ filteredFoods.length }} 条记录</span>
    </div>

    <div v-if="displayFoods.length" class="food-grid">
      <button v-for="food in displayFoods" :key="food.id" type="button" class="food-item" @click="openFood(food)">
        <div class="food-item-top">
          <span class="food-emoji-sm">{{ food.emoji }}</span>
          <span class="food-state-badge" :class="stateMeta(food.state).tone">{{ stateMeta(food.state).label }}</span>
          <ChevronRight :size="15" class="food-item-arrow" />
        </div>
        <h3>{{ food.name }}</h3>
        <span class="food-item-cat">{{ food.category }}</span>
        <div class="food-item-basis">{{ food.basis }}</div>
        <ul class="food-item-nutrients">
          <li v-for="row in topNutrients(food)" :key="row.slug">
            <span>{{ row.name }}</span>
            <b>{{ formatValue(row.value) }}<i>{{ row.unit }}</i></b>
          </li>
        </ul>
      </button>
    </div>
    <div v-else class="empty-search">
      <span class="empty-icon"><CircleHelp :size="24" /></span>
      <strong class="empty-title">{{ query ? `没有找到「${query}」这种食物` : '当前状态下没有食物记录' }}</strong>
      <p class="empty-desc">可能是名称有误，或该食物尚未收录。生食、熟食与制品是分开记录的，切换状态可能会找到。</p>
      <div class="empty-actions">
        <button type="button" class="empty-clear" @click="query = ''; categoryFilter = 'all'">清除筛选</button>
      </div>
    </div>

    <div v-if="hiddenCount" class="food-more">
      <button type="button" @click="expanded = !expanded">
        {{ expanded ? '收起（只看前 16 种）' : `显示更多（还有 ${hiddenCount} 种）` }}
      </button>
    </div>

    <div class="food-source-row">
      <span class="note-icon"><CircleHelp :size="14" /></span>
      <span>含量数据：{{ foodSource.name }}</span>
      <a :href="foodSource.url" target="_blank" rel="noreferrer">查看来源</a>
      <span class="food-source-version">基准：每 100 克 / 每 100 毫升 · 状态：生 / 熟 / 加工</span>
    </div>

    <transition name="fade">
      <div v-if="selectedFood" class="food-modal-mask" @click.self="closeFood">
        <div class="food-modal" role="dialog" aria-modal="true" :aria-label="selectedFood.name + '营养含量'">
          <button type="button" class="food-modal-close" aria-label="关闭" @click="closeFood"><X :size="18" /></button>
          <div class="food-modal-head">
            <span class="food-emoji-lg">{{ selectedFood.emoji }}</span>
            <div>
              <div class="food-modal-badges">
                <span class="food-state-badge" :class="stateMeta(selectedFood.state).tone">{{ stateMeta(selectedFood.state).label }} · {{ stateMeta(selectedFood.state).hint }}</span>
                <span class="food-basis-badge">{{ selectedFood.basis }}</span>
              </div>
              <h2>{{ selectedFood.name }}</h2>
              <span class="food-modal-cat">{{ selectedFood.category }}<template v-if="selectedFood.ediblePortion < 100"> · 可食部 {{ selectedFood.ediblePortion }}%</template></span>
            </div>
          </div>

          <table class="food-nutrient-table">
            <thead><tr><th>营养素</th><th>含量（{{ selectedFood.basis }}）</th><th>单位</th></tr></thead>
            <tbody>
              <tr v-for="row in selectedNutrientRows" :key="row.slug">
                <td>{{ row.name }}</td>
                <td>{{ formatValue(row.value) }}</td>
                <td>{{ row.unit }}</td>
              </tr>
            </tbody>
          </table>

          <p class="food-modal-note">{{ selectedFood.note }}</p>

          <div v-if="comparisonFood" class="food-compare">
            <span class="compare-label">状态对照</span>
            <p>{{ stateMeta(selectedFood.state).label }}食与{{ comparisonFood.name }}属于不同状态记录，数值差异主要来自含水量变化，不能混算。</p>
            <button type="button" @click="switchComparison">查看「{{ comparisonFood.name }}」<ChevronRight :size="13" /></button>
          </div>

          <div class="food-modal-source">
            <span>来源：{{ foodSource.name }}</span>
            <a :href="foodSource.url" target="_blank" rel="noreferrer">打开来源</a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
